-- ========================================================
-- セラピスト本登録審査（4ステップ）用マイグレーション
--   Step1 審査手数料決済 / Step2 Stripe Connect eKYC / Step3 誓約書＋資格証・保険証票
--   Step4 運営承認（承認時に提出ファイルを完全削除し、テキストの承認ログのみ保持）
--
-- 何度実行しても安全（冪等）です。Supabase の SQL Editor に貼り付けて RUN してください。
-- ※ 免許証等の身分証画像は Stripe Connect に完全委託し、当社DB/Storage には一切保存しません。
-- ========================================================

-- --------------------------------------------------------
-- 0. 管理者判定ヘルパー
-- --------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- --------------------------------------------------------
-- 1. therapist_profiles: 審査ステータス用カラム
-- --------------------------------------------------------
alter table public.therapist_profiles add column if not exists payment_status text not null default 'pending'
  check (payment_status in ('pending', 'completed'));
alter table public.therapist_profiles add column if not exists payment_completed_at timestamp with time zone;
alter table public.therapist_profiles add column if not exists is_identity_verified boolean not null default false;
alter table public.therapist_profiles add column if not exists identity_verified_at timestamp with time zone;
alter table public.therapist_profiles add column if not exists identity_verified_name text;
alter table public.therapist_profiles add column if not exists is_certified boolean not null default false;
alter table public.therapist_profiles add column if not exists certified_at timestamp with time zone;

-- --------------------------------------------------------
-- 2. therapist_onboarding: Step3 の提出状況（テキスト＋一時ファイルのパスのみ）
-- --------------------------------------------------------
create table if not exists public.therapist_onboarding (
  therapist_id uuid primary key references public.profiles(id) on delete cascade,
  terms_version text,
  terms_agreed_at timestamp with time zone,
  terms_signature_name text,
  claimed_qualification_type text,
  qualification_file_path text,
  qualification_file_name text,
  qualification_uploaded_at timestamp with time zone,
  insurance_file_path text,
  insurance_file_name text,
  insurance_uploaded_at timestamp with time zone,
  rejection_reason text,
  rejected_at timestamp with time zone,
  files_purged_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- 他人のフォルダを指すパスの登録を禁止
  constraint therapist_onboarding_qualification_path_check
    check (qualification_file_path is null or qualification_file_path like therapist_id::text || '/%'),
  constraint therapist_onboarding_insurance_path_check
    check (insurance_file_path is null or insurance_file_path like therapist_id::text || '/%')
);

-- --------------------------------------------------------
-- 3. therapist_verification_logs: 承認ログ（画像削除後も永続保持するテキストのみ）
--    追記専用。クライアントからの INSERT/UPDATE/DELETE ポリシーは作らない（service_role のみ）
-- --------------------------------------------------------
create table if not exists public.therapist_verification_logs (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid references public.profiles(id) on delete set null,
  therapist_name text,
  decision text not null check (decision in ('approved', 'rejected')),
  verified_at timestamp with time zone default timezone('utc'::text, now()) not null,
  verified_by uuid references public.profiles(id) on delete set null,
  qualification_type text,
  registration_number text,
  confirmed_name text,
  insurance_confirmed boolean not null default false,
  reason text,
  files_deleted_count integer,
  files_deleted_at timestamp with time zone
);

create index if not exists therapist_verification_logs_therapist_idx
  on public.therapist_verification_logs (therapist_id, verified_at desc);

-- --------------------------------------------------------
-- 4. 審査関連カラムの自己改ざん防止トリガー
--    セラピスト本人（一般ユーザー）が is_approved / 決済 / eKYC / 認定フラグ / Stripe口座を
--    直接書き換えられないようにする。管理者・service_role・SQL Editor は変更可。
-- --------------------------------------------------------
create or replace function public.protect_therapist_verification_columns()
returns trigger
language plpgsql
as $$
begin
  -- JWT なし（service_role / SQL Editor）または管理者はそのまま通す
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.is_approved := false;
    new.is_certified := false;
    new.certified_at := null;
    new.payment_status := 'pending';
    new.payment_completed_at := null;
    new.is_identity_verified := false;
    new.identity_verified_at := null;
    new.identity_verified_name := null;
    new.stripe_account_id := null;
  else
    new.is_approved := old.is_approved;
    new.is_certified := old.is_certified;
    new.certified_at := old.certified_at;
    new.payment_status := old.payment_status;
    new.payment_completed_at := old.payment_completed_at;
    new.is_identity_verified := old.is_identity_verified;
    new.identity_verified_at := old.identity_verified_at;
    new.identity_verified_name := old.identity_verified_name;
    new.stripe_account_id := old.stripe_account_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_protect_therapist_verification_columns on public.therapist_profiles;
create trigger trigger_protect_therapist_verification_columns
before insert or update on public.therapist_profiles
for each row execute function public.protect_therapist_verification_columns();

-- --------------------------------------------------------
-- 5. 承認 / 差戻し RPC（DB内で前提条件の検証 → フラグ更新 → 証跡記録を1トランザクションで実行）
--    ファイル削除（Storage API）は呼び出し側 Route Handler が直後に実行し、
--    結果を therapist_verification_logs.files_deleted_* に記録する。
--    service_role 専用（anon / authenticated からは実行不可）。
-- --------------------------------------------------------
create or replace function public.approve_therapist_verification(
  p_therapist_id uuid,
  p_admin_id uuid,
  p_qualification_type text,
  p_registration_number text,
  p_name_match_confirmed boolean,
  p_insurance_confirmed boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  tp public.therapist_profiles%rowtype;
  ob public.therapist_onboarding%rowtype;
  v_name text;
  v_log_id uuid;
begin
  select * into tp from public.therapist_profiles where user_id = p_therapist_id for update;
  if not found then
    raise exception 'THERAPIST_NOT_FOUND';
  end if;

  select * into ob from public.therapist_onboarding where therapist_id = p_therapist_id for update;
  if not found then
    raise exception 'ONBOARDING_NOT_FOUND';
  end if;

  if tp.payment_status <> 'completed' then raise exception 'PAYMENT_INCOMPLETE'; end if;
  if not tp.is_identity_verified then raise exception 'IDENTITY_UNVERIFIED'; end if;
  if ob.terms_agreed_at is null then raise exception 'TERMS_MISSING'; end if;
  if ob.qualification_file_path is null then raise exception 'QUALIFICATION_MISSING'; end if;
  if ob.insurance_file_path is null then raise exception 'INSURANCE_MISSING'; end if;
  if coalesce(trim(p_qualification_type), '') = '' then raise exception 'QUALIFICATION_TYPE_REQUIRED'; end if;
  if not coalesce(p_name_match_confirmed, false) then raise exception 'NAME_MATCH_NOT_CONFIRMED'; end if;
  if not coalesce(p_insurance_confirmed, false) then raise exception 'INSURANCE_NOT_CONFIRMED'; end if;

  select name into v_name from public.profiles where id = p_therapist_id;

  -- DBフラグ更新（専門認定バッジ付与＋本登録＝一般公開）
  update public.therapist_profiles
     set is_certified = true,
         certified_at = now(),
         is_approved = true,
         updated_at = now()
   where user_id = p_therapist_id;

  -- 提出ファイルのパスは破棄（実ファイルは直後に Storage から削除される）
  update public.therapist_onboarding
     set qualification_file_path = null,
         qualification_file_name = null,
         insurance_file_path = null,
         insurance_file_name = null,
         rejection_reason = null,
         rejected_at = null,
         files_purged_at = now(),
         updated_at = now()
   where therapist_id = p_therapist_id;

  -- 審査証跡（テキストログ）
  insert into public.therapist_verification_logs (
    therapist_id, therapist_name, decision, verified_at, verified_by,
    qualification_type, registration_number, confirmed_name, insurance_confirmed
  ) values (
    p_therapist_id, v_name, 'approved', now(), p_admin_id,
    trim(p_qualification_type), nullif(trim(coalesce(p_registration_number, '')), ''),
    coalesce(tp.identity_verified_name, v_name), true
  )
  returning id into v_log_id;

  return v_log_id;
end;
$$;

create or replace function public.reject_therapist_verification(
  p_therapist_id uuid,
  p_admin_id uuid,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  tp public.therapist_profiles%rowtype;
  v_name text;
  v_log_id uuid;
begin
  if coalesce(trim(p_reason), '') = '' then
    raise exception 'REASON_REQUIRED';
  end if;

  select * into tp from public.therapist_profiles where user_id = p_therapist_id for update;
  if not found then
    raise exception 'THERAPIST_NOT_FOUND';
  end if;
  if tp.is_certified then
    raise exception 'ALREADY_CERTIFIED';
  end if;

  select name into v_name from public.profiles where id = p_therapist_id;

  -- 差戻し時も提出ファイルは破棄し、再提出を求める
  update public.therapist_onboarding
     set qualification_file_path = null,
         qualification_file_name = null,
         qualification_uploaded_at = null,
         insurance_file_path = null,
         insurance_file_name = null,
         insurance_uploaded_at = null,
         rejection_reason = trim(p_reason),
         rejected_at = now(),
         files_purged_at = now(),
         updated_at = now()
   where therapist_id = p_therapist_id;

  insert into public.therapist_verification_logs (
    therapist_id, therapist_name, decision, verified_at, verified_by, reason, insurance_confirmed
  ) values (
    p_therapist_id, v_name, 'rejected', now(), p_admin_id, trim(p_reason), false
  )
  returning id into v_log_id;

  return v_log_id;
end;
$$;

revoke all on function public.approve_therapist_verification(uuid, uuid, text, text, boolean, boolean) from public, anon, authenticated;
revoke all on function public.reject_therapist_verification(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.approve_therapist_verification(uuid, uuid, text, text, boolean, boolean) to service_role;
grant execute on function public.reject_therapist_verification(uuid, uuid, text) to service_role;

-- --------------------------------------------------------
-- 6. RLS
-- --------------------------------------------------------
alter table public.therapist_onboarding enable row level security;
alter table public.therapist_verification_logs enable row level security;

drop policy if exists "therapist_onboarding_select_policy" on public.therapist_onboarding;
create policy "therapist_onboarding_select_policy" on public.therapist_onboarding
  for select using (auth.uid() = therapist_id or public.is_admin());

drop policy if exists "therapist_onboarding_insert_policy" on public.therapist_onboarding;
create policy "therapist_onboarding_insert_policy" on public.therapist_onboarding
  for insert with check (auth.uid() = therapist_id or public.is_admin());

drop policy if exists "therapist_onboarding_update_policy" on public.therapist_onboarding;
create policy "therapist_onboarding_update_policy" on public.therapist_onboarding
  for update using (auth.uid() = therapist_id or public.is_admin())
  with check (auth.uid() = therapist_id or public.is_admin());

drop policy if exists "therapist_verification_logs_select_policy" on public.therapist_verification_logs;
create policy "therapist_verification_logs_select_policy" on public.therapist_verification_logs
  for select using (auth.uid() = therapist_id or public.is_admin());

-- --------------------------------------------------------
-- 7. Storage: 一時保管バケット temp-qualifications（非公開）
--    パス規約: {therapist_id}/{qualification|insurance}_{timestamp}.{ext}
--    閲覧: 本人＋管理者 / 追加・差替え・削除: 本人のみ（承認時の一括削除は service_role）
-- --------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'temp-qualifications',
  'temp-qualifications',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "temp_qualifications_select" on storage.objects;
create policy "temp_qualifications_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'temp-qualifications'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

drop policy if exists "temp_qualifications_insert" on storage.objects;
create policy "temp_qualifications_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'temp-qualifications'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "temp_qualifications_update" on storage.objects;
create policy "temp_qualifications_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'temp-qualifications'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'temp-qualifications'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "temp_qualifications_delete" on storage.objects;
create policy "temp_qualifications_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'temp-qualifications'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

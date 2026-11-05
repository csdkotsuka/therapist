-- ========================================================
-- 004_production_auth_and_rls.sql
-- 本番運用に向けた認証・権限（RLS）・業務ロジックの DB 集約
--
--   1. 欠けていたカラムの追加（アプリの型と DB を一致させる）
--   2. auth.users 作成時に profiles を自動作成（クライアントから profiles を作らない）
--   3. 権限昇格の防止（role 等をクライアントから書き換え不可に）
--   4. RLS の全面見直し（個人情報は本人・取引相手・管理者のみ）
--   5. 公開用 VIEW（未ログインでも見てよい列だけ）
--   6. 予約・決済・位置情報・チャット既読は RPC 経由のみ（金額は DB 側で計算）
--
-- 前提: schema.sql, 001, 002 適用済み。何度実行しても安全（冪等）です。
-- Supabase の SQL Editor に貼り付けて RUN してください。
-- ========================================================

begin;

-- 前提チェック: 実行先プロジェクトに schema.sql / 001 / 002 が適用されているか
do $$
begin
  if to_regclass('public.profiles') is null or to_regclass('public.therapist_onboarding') is null then
    raise exception '前提のテーブルがありません。実行先のプロジェクトが正しいか確認し、schema.sql → 001 → 002 を先に実行してください。';
  end if;
end $$;

-- --------------------------------------------------------
-- 0. 内部処理フラグ（SECURITY DEFINER 関数からの更新時だけ保護トリガーを通す）
-- --------------------------------------------------------
create or replace function public.is_internal_op()
returns boolean
language sql
stable
as $$
  select coalesce(current_setting('carekuru.internal', true), '') = 'on';
$$;

create or replace function public.current_role_name()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- --------------------------------------------------------
-- 1. カラム追加
-- --------------------------------------------------------
alter table public.profiles add column if not exists auth_provider text not null default 'email';
alter table public.profiles add column if not exists line_user_id text;
create unique index if not exists profiles_line_user_id_key on public.profiles (line_user_id) where line_user_id is not null;
create index if not exists profiles_role_idx on public.profiles (role);

alter table public.therapist_profiles add column if not exists lat float;
alter table public.therapist_profiles add column if not exists lng float;
alter table public.therapist_profiles add column if not exists store_name text;
alter table public.therapist_profiles add column if not exists store_address text;
alter table public.therapist_profiles add column if not exists store_lat float;
alter table public.therapist_profiles add column if not exists store_lng float;
alter table public.therapist_profiles add column if not exists store_access text;
alter table public.therapist_profiles add column if not exists store_parking text;
alter table public.therapist_profiles add column if not exists store_hours text;
alter table public.therapist_profiles add column if not exists store_facilities text[];
alter table public.therapist_profiles add column if not exists store_notes text;
alter table public.therapist_profiles add column if not exists available_days text[];
alter table public.therapist_profiles add column if not exists available_hours_start text;
alter table public.therapist_profiles add column if not exists available_hours_end text;
alter table public.therapist_profiles add column if not exists is_separate_store_hours boolean not null default false;
alter table public.therapist_profiles add column if not exists store_hours_start text;
alter table public.therapist_profiles add column if not exists store_hours_end text;

-- 既存の location(geography) から lat/lng を補完
update public.therapist_profiles
set lat = ST_Y(location::geometry), lng = ST_X(location::geometry)
where location is not null and (lat is null or lng is null);

-- lat/lng を正とし、location（近隣検索用）を自動同期
create or replace function public.sync_therapist_location()
returns trigger
language plpgsql
as $$
begin
  if new.lat is not null and new.lng is not null then
    new.location := ST_SetSRID(ST_MakePoint(new.lng, new.lat), 4326)::geography;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trigger_sync_therapist_location on public.therapist_profiles;
create trigger trigger_sync_therapist_location
before insert or update on public.therapist_profiles
for each row execute function public.sync_therapist_location();

alter table public.bookings add column if not exists serial_number text;
alter table public.bookings add column if not exists is_paid boolean not null default false;
alter table public.bookings add column if not exists paid_at timestamp with time zone;
alter table public.bookings add column if not exists lat float;
alter table public.bookings add column if not exists lng float;
create unique index if not exists bookings_serial_number_key on public.bookings (serial_number) where serial_number is not null;

create sequence if not exists public.booking_serial_seq;

-- 決済モード: 'dummy'（Stripe 本番接続までの暫定）/ 'stripe'
insert into public.platform_settings (key, value)
values ('payment_mode', '{"mode": "dummy"}'::jsonb)
on conflict (key) do nothing;

-- デモ用サンプル書類（demo:{therapist_id}/...）のパスも許可（ダミーデータ期間のみ）
alter table public.therapist_onboarding drop constraint if exists therapist_onboarding_qualification_path_check;
alter table public.therapist_onboarding add constraint therapist_onboarding_qualification_path_check
  check (
    qualification_file_path is null
    or qualification_file_path like therapist_id::text || '/%'
    or qualification_file_path like 'demo:' || therapist_id::text || '/%'
  );
alter table public.therapist_onboarding drop constraint if exists therapist_onboarding_insurance_path_check;
alter table public.therapist_onboarding add constraint therapist_onboarding_insurance_path_check
  check (
    insurance_file_path is null
    or insurance_file_path like therapist_id::text || '/%'
    or insurance_file_path like 'demo:' || therapist_id::text || '/%'
  );

-- --------------------------------------------------------
-- 2. 新規ユーザー作成時に profiles（＋セラピストは therapist_profiles）を自動作成
--    role はメタデータの 'therapist' のみ受け付け、それ以外は必ず 'customer'。
--    管理者はここでは絶対に作られない（SQL で既存ユーザーを昇格させる）。
-- --------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role text := case when meta->>'role' = 'therapist' then 'therapist' else 'customer' end;
  v_provider text := coalesce(new.raw_app_meta_data->>'provider', 'email');
  -- LINE ID はサーバー（service_role）だけが設定できる app_metadata からのみ受け取る（user_metadata は利用者が自由に設定できるため）
  v_line_id text := nullif(new.raw_app_meta_data->>'line_user_id', '');
  v_name text := coalesce(nullif(meta->>'name', ''), nullif(meta->>'full_name', ''), split_part(new.email, '@', 1), '新規ユーザー');
begin
  insert into public.profiles (id, role, name, email, phone, avatar_url, address, postal_code, lat, lng, auth_provider, line_user_id)
  values (
    new.id,
    v_role,
    v_name,
    new.email,
    nullif(meta->>'phone', ''),
    coalesce(nullif(meta->>'avatar_url', ''), nullif(meta->>'picture', '')),
    nullif(meta->>'address', ''),
    nullif(meta->>'postal_code', ''),
    nullif(meta->>'lat', '')::float,
    nullif(meta->>'lng', '')::float,
    case when v_line_id is not null then 'line' else v_provider end,
    v_line_id
  )
  on conflict (id) do nothing;

  if v_role = 'therapist' then
    perform set_config('carekuru.internal', 'on', true);
    insert into public.therapist_profiles (user_id, bio, specialities, address, lat, lng, is_approved)
    values (
      new.id,
      '新規登録セラピストです。運営による審査待ちです。',
      '{}',
      nullif(meta->>'address', ''),
      nullif(meta->>'lat', '')::float,
      nullif(meta->>'lng', '')::float,
      false
    )
    on conflict (user_id) do nothing;
    perform set_config('carekuru.internal', 'off', true);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- --------------------------------------------------------
-- 3. 権限昇格・自己改ざんの防止
-- --------------------------------------------------------
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is null or public.is_internal_op() or public.is_admin() then
    return new;
  end if;
  new.id := old.id;
  new.role := old.role;
  new.email := old.email;
  new.auth_provider := old.auth_provider;
  new.line_user_id := old.line_user_id;
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trigger_protect_profile_columns on public.profiles;
create trigger trigger_protect_profile_columns
before update on public.profiles
for each row execute function public.protect_profile_columns();

-- 001 の審査カラム保護に、評価値の保護と内部処理フラグを追加
create or replace function public.protect_therapist_verification_columns()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is null or public.is_internal_op() or public.is_admin() then
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
    new.rating_avg := 0;
    new.reviews_count := 0;
  else
    new.user_id := old.user_id;
    new.is_approved := old.is_approved;
    new.is_certified := old.is_certified;
    new.certified_at := old.certified_at;
    new.payment_status := old.payment_status;
    new.payment_completed_at := old.payment_completed_at;
    new.is_identity_verified := old.is_identity_verified;
    new.identity_verified_at := old.identity_verified_at;
    new.identity_verified_name := old.identity_verified_name;
    new.stripe_account_id := old.stripe_account_id;
    new.rating_avg := old.rating_avg;
    new.reviews_count := old.reviews_count;
  end if;
  return new;
end;
$$;

-- レビュー集計はレビュー投稿者（顧客）の権限では therapist_profiles を更新できないため DEFINER 化
create or replace function public.update_therapist_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_therapist uuid := coalesce(new.therapist_id, old.therapist_id);
begin
  perform set_config('carekuru.internal', 'on', true);
  update public.therapist_profiles
  set
    rating_avg = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where therapist_id = v_therapist), 0.00),
    reviews_count = (select count(*) from public.reviews where therapist_id = v_therapist)
  where user_id = v_therapist;
  perform set_config('carekuru.internal', 'off', true);
  return coalesce(new, old);
end;
$$;

-- 近隣検索 RPC に search_path を固定（存在する場合のみ）
do $$
begin
  alter function public.get_nearby_therapists(float, float, float, text) set search_path = public;
exception when undefined_function then null;
end $$;

-- --------------------------------------------------------
-- 4. RLS ポリシーの全面見直し
-- --------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.therapist_profiles enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.chat_messages enable row level security;
alter table public.platform_settings enable row level security;

-- 取引相手かどうか
--   セラピスト → 予約リクエストを送ってきた顧客（承諾判断のため pending から）
--   顧客 → セラピストが承諾した後の予約の相手のみ（予約を乱発してセラピストの個人情報を集める行為を防ぐ）
create or replace function public.is_booking_counterparty(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.bookings b
    where (b.therapist_id = auth.uid() and b.customer_id = p_user)
       or (b.customer_id = auth.uid() and b.therapist_id = p_user
           and b.status in ('awaiting_payment', 'confirmed', 'completed'))
  );
$$;

-- 承認済みセラピストかどうか（RLS ポリシー内から therapist_profiles を参照するため DEFINER）
create or replace function public.is_approved_therapist(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.therapist_profiles where user_id = p_user and is_approved = true);
$$;

-- profiles: 本人・取引相手・管理者のみ（電話・住所などの個人情報を含むため）
drop policy if exists "profiles_select_policy" on public.profiles;
create policy "profiles_select_policy" on public.profiles
  for select using (id = auth.uid() or public.is_admin() or public.is_booking_counterparty(id));

drop policy if exists "profiles_insert_policy" on public.profiles;
create policy "profiles_insert_policy" on public.profiles
  for insert with check (public.is_admin());

drop policy if exists "profiles_update_policy" on public.profiles;
create policy "profiles_update_policy" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- therapist_profiles: 本体は本人・管理者のみ。公開情報は public_therapist_profiles VIEW から。
drop policy if exists "therapist_profiles_select_policy" on public.therapist_profiles;
create policy "therapist_profiles_select_policy" on public.therapist_profiles
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "therapist_profiles_insert_policy" on public.therapist_profiles;
create policy "therapist_profiles_insert_policy" on public.therapist_profiles
  for insert with check (public.is_admin());

drop policy if exists "therapist_profiles_update_policy" on public.therapist_profiles;
create policy "therapist_profiles_update_policy" on public.therapist_profiles
  for update using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- services: 公開中メニューは誰でも閲覧可。管理は本人セラピスト・管理者のみ。
drop policy if exists "services_select_policy" on public.services;
create policy "services_select_policy" on public.services
  for select using (
    (is_active = true and public.is_approved_therapist(therapist_id))
    or therapist_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "services_manage_policy" on public.services;
drop policy if exists "services_insert_policy" on public.services;
create policy "services_insert_policy" on public.services
  for insert with check (
    (therapist_id = auth.uid() and public.current_role_name() = 'therapist') or public.is_admin()
  );
drop policy if exists "services_update_policy" on public.services;
create policy "services_update_policy" on public.services
  for update using (therapist_id = auth.uid() or public.is_admin())
  with check (therapist_id = auth.uid() or public.is_admin());
drop policy if exists "services_delete_policy" on public.services;
create policy "services_delete_policy" on public.services
  for delete using (therapist_id = auth.uid() or public.is_admin());

-- bookings: 閲覧は当事者・管理者のみ。作成・更新は RPC（下記）経由のみ。
drop policy if exists "bookings_select_policy" on public.bookings;
create policy "bookings_select_policy" on public.bookings
  for select using (customer_id = auth.uid() or therapist_id = auth.uid() or public.is_admin());
drop policy if exists "bookings_insert_policy" on public.bookings;
drop policy if exists "bookings_update_policy" on public.bookings;

-- reviews: 閲覧は誰でも可。投稿は「自分の完了済み予約」に1件のみ（booking_id unique）。
drop policy if exists "reviews_select_policy" on public.reviews;
create policy "reviews_select_policy" on public.reviews
  for select using (true);

drop policy if exists "reviews_insert_policy" on public.reviews;
create policy "reviews_insert_policy" on public.reviews
  for insert with check (
    customer_id = auth.uid()
    and exists (
      select 1 from public.bookings b
      where b.id = reviews.booking_id
        and b.customer_id = auth.uid()
        and b.therapist_id = reviews.therapist_id
        and b.status = 'completed'
    )
  );

drop policy if exists "reviews_delete_policy" on public.reviews;
create policy "reviews_delete_policy" on public.reviews
  for delete using (customer_id = auth.uid() or public.is_admin());

-- chat_messages: 予約の当事者どうしのみ。既読化は RPC 経由。
drop policy if exists "chat_messages_select_policy" on public.chat_messages;
create policy "chat_messages_select_policy" on public.chat_messages
  for select using (sender_id = auth.uid() or receiver_id = auth.uid() or public.is_admin());

drop policy if exists "chat_messages_insert_policy" on public.chat_messages;
create policy "chat_messages_insert_policy" on public.chat_messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.bookings b
      where b.id = chat_messages.booking_id
        and (
          (b.customer_id = auth.uid() and b.therapist_id = chat_messages.receiver_id)
          or (b.therapist_id = auth.uid() and b.customer_id = chat_messages.receiver_id)
        )
    )
  );
drop policy if exists "chat_messages_update_policy" on public.chat_messages;

-- platform_settings: 閲覧は誰でも、変更は管理者のみ
drop policy if exists "platform_settings_select_policy" on public.platform_settings;
create policy "platform_settings_select_policy" on public.platform_settings
  for select using (true);
drop policy if exists "platform_settings_all_policy" on public.platform_settings;
create policy "platform_settings_all_policy" on public.platform_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- --------------------------------------------------------
-- 5. 公開用 VIEW（RLS を通さず、公開してよい列・行だけを返す）
-- --------------------------------------------------------
-- 表示名とアイコンのみ。対象は承認済みセラピストと、レビューを書いた顧客（レビュー表示用）。
create or replace view public.public_profiles as
  select p.id, p.role, p.name, p.avatar_url
  from public.profiles p
  where (p.role = 'therapist' and exists (select 1 from public.therapist_profiles tp where tp.user_id = p.id and tp.is_approved = true))
     or exists (select 1 from public.reviews r where r.customer_id = p.id);

-- 承認済みセラピストの公開情報（Stripe 口座 ID・本人確認氏名などの内部情報は除外）
create or replace view public.public_therapist_profiles as
  select
    tp.user_id, tp.bio, tp.specialities, tp.is_store_based, tp.is_visit_based, tp.address,
    tp.lat, tp.lng, tp.visit_radius_km, tp.rating_avg, tp.reviews_count, tp.is_approved,
    tp.is_identity_verified, tp.is_certified, tp.certified_at, tp.campaign,
    tp.store_name, tp.store_address, tp.store_lat, tp.store_lng, tp.store_access, tp.store_parking,
    tp.store_hours, tp.store_facilities, tp.store_notes,
    tp.available_days, tp.available_hours_start, tp.available_hours_end,
    tp.is_separate_store_hours, tp.store_hours_start, tp.store_hours_end
  from public.therapist_profiles tp
  where tp.is_approved = true;

revoke all on public.public_profiles from anon, authenticated;
revoke all on public.public_therapist_profiles from anon, authenticated;
grant select on public.public_profiles to anon, authenticated;
grant select on public.public_therapist_profiles to anon, authenticated;

-- --------------------------------------------------------
-- 6. 業務 RPC（SECURITY DEFINER。呼び出し者を auth.uid() で判定）
-- --------------------------------------------------------

-- 予約作成: 金額・手数料・シリアル番号は DB 側で決定する
create or replace function public.create_booking(
  p_service_id uuid,
  p_booking_type text,
  p_scheduled_at timestamp with time zone,
  p_visit_address text default null,
  p_lat float default null,
  p_lng float default null,
  p_customer_notes text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_service public.services;
  v_tp public.therapist_profiles;
  v_fee_rate numeric;
  v_fee integer;
  v_row public.bookings;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if public.current_role_name() is distinct from 'customer' then raise exception 'CUSTOMER_ONLY'; end if;
  if p_booking_type not in ('visit', 'store') then raise exception 'INVALID_BOOKING_TYPE'; end if;
  if p_scheduled_at < now() - interval '10 minutes' then raise exception 'SCHEDULE_IN_PAST'; end if;

  select * into v_service from public.services where id = p_service_id and is_active = true;
  if not found then raise exception 'SERVICE_NOT_FOUND'; end if;

  select * into v_tp from public.therapist_profiles where user_id = v_service.therapist_id;
  if not found or v_tp.is_approved is not true then raise exception 'THERAPIST_NOT_AVAILABLE'; end if;
  if p_booking_type = 'visit' and v_tp.is_visit_based is not true then raise exception 'VISIT_NOT_SUPPORTED'; end if;
  if p_booking_type = 'store' and v_tp.is_store_based is not true then raise exception 'STORE_NOT_SUPPORTED'; end if;
  if p_booking_type = 'visit' and coalesce(trim(p_visit_address), '') = '' then raise exception 'VISIT_ADDRESS_REQUIRED'; end if;

  select coalesce((value->>'percentage')::numeric, 20) into v_fee_rate
  from public.platform_settings where key = 'fee_rate';
  v_fee_rate := coalesce(v_fee_rate, 20);
  v_fee := round(v_service.price * v_fee_rate / 100.0);

  insert into public.bookings (
    serial_number, customer_id, therapist_id, service_id, booking_type, scheduled_at, status,
    total_amount, platform_fee, therapist_earnings, visit_address, lat, lng, customer_notes,
    location
  )
  values (
    'BK-' || lpad(nextval('public.booking_serial_seq')::text, 4, '0'),
    v_uid, v_service.therapist_id, v_service.id, p_booking_type, p_scheduled_at, 'pending',
    v_service.price, v_fee, v_service.price - v_fee,
    case when p_booking_type = 'visit' then left(p_visit_address, 300) else coalesce(v_tp.store_address, v_tp.address) end,
    p_lat, p_lng, left(p_customer_notes, 2000),
    case when p_lat is not null and p_lng is not null
      then ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography end
  )
  returning * into v_row;

  return v_row;
end;
$$;

-- 予約ステータス変更（役割ごとに許可された遷移のみ）。'confirmed' は決済 RPC でのみ。
create or replace function public.update_booking_status(p_booking_id uuid, p_status text)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_b public.bookings;
  v_allowed boolean := false;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_b from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'BOOKING_NOT_FOUND'; end if;

  if public.is_admin() then
    v_allowed := p_status = 'cancelled' and v_b.status not in ('completed', 'cancelled');
  elsif v_b.therapist_id = v_uid then
    v_allowed :=
      (v_b.status = 'pending' and p_status in ('awaiting_payment', 'cancelled'))
      or (v_b.status = 'awaiting_payment' and p_status = 'cancelled')
      or (v_b.status = 'confirmed' and p_status in ('completed', 'cancelled'));
  elsif v_b.customer_id = v_uid then
    v_allowed := p_status = 'cancelled' and v_b.status in ('pending', 'awaiting_payment', 'confirmed');
  else
    raise exception 'FORBIDDEN';
  end if;

  if not v_allowed then raise exception 'INVALID_TRANSITION'; end if;

  update public.bookings set status = p_status, updated_at = now()
  where id = p_booking_id
  returning * into v_b;
  return v_b;
end;
$$;

-- ダミー決済（payment_mode = 'dummy' の間だけ有効）。Stripe 接続後は Webhook で confirmed にする。
create or replace function public.pay_booking_dummy(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_b public.bookings;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if coalesce((select value->>'mode' from public.platform_settings where key = 'payment_mode'), 'stripe') <> 'dummy' then
    raise exception 'DUMMY_PAYMENT_DISABLED';
  end if;
  select * into v_b from public.bookings where id = p_booking_id for update;
  if not found or v_b.customer_id <> auth.uid() then raise exception 'BOOKING_NOT_FOUND'; end if;
  if v_b.status <> 'awaiting_payment' then raise exception 'INVALID_TRANSITION'; end if;

  update public.bookings
  set status = 'confirmed', is_paid = true, paid_at = now(), updated_at = now()
  where id = p_booking_id
  returning * into v_b;
  return v_b;
end;
$$;

-- 担当セラピストの現在地送信（確定済み予約のみ）
create or replace function public.update_therapist_location(p_booking_id uuid, p_lat float, p_lng float)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_lat not between -90 and 90 or p_lng not between -180 and 180 then raise exception 'INVALID_COORDINATES'; end if;
  update public.bookings
  set therapist_current_lat = p_lat, therapist_current_lng = p_lng, updated_at = now()
  where id = p_booking_id and therapist_id = auth.uid() and status = 'confirmed';
  if not found then raise exception 'FORBIDDEN'; end if;
end;
$$;

-- チャット既読化（受信者本人のみ）
create or replace function public.mark_messages_read(p_booking_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.chat_messages set is_read = true
  where booking_id = p_booking_id and receiver_id = auth.uid() and is_read = false;
$$;

-- 審査 Step1 / Step2 のダミー完了（payment_mode = 'dummy' の間だけ。本人または管理者）
create or replace function public.dummy_complete_review_fee(p_therapist_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if auth.uid() is null or (auth.uid() <> p_therapist_id and not public.is_admin()) then raise exception 'FORBIDDEN'; end if;
  if coalesce((select value->>'mode' from public.platform_settings where key = 'payment_mode'), 'stripe') <> 'dummy' then
    raise exception 'DUMMY_PAYMENT_DISABLED';
  end if;
  perform set_config('carekuru.internal', 'on', true);
  update public.therapist_profiles
  set payment_status = 'completed', payment_completed_at = coalesce(payment_completed_at, now())
  where user_id = p_therapist_id;
  get diagnostics v_count = row_count;
  perform set_config('carekuru.internal', 'off', true);
  if v_count = 0 then raise exception 'THERAPIST_NOT_FOUND'; end if;
end;
$$;

create or replace function public.dummy_complete_identity_verification(p_therapist_id uuid, p_verified_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if auth.uid() is null or (auth.uid() <> p_therapist_id and not public.is_admin()) then raise exception 'FORBIDDEN'; end if;
  if coalesce((select value->>'mode' from public.platform_settings where key = 'payment_mode'), 'stripe') <> 'dummy' then
    raise exception 'DUMMY_PAYMENT_DISABLED';
  end if;
  perform set_config('carekuru.internal', 'on', true);
  update public.therapist_profiles
  set is_identity_verified = true,
      identity_verified_at = coalesce(identity_verified_at, now()),
      identity_verified_name = left(coalesce(nullif(trim(p_verified_name), ''), identity_verified_name), 100),
      stripe_account_id = coalesce(stripe_account_id, 'acct_dummy_' || replace(p_therapist_id::text, '-', ''))
  where user_id = p_therapist_id and payment_status = 'completed';
  get diagnostics v_count = row_count;
  perform set_config('carekuru.internal', 'off', true);
  if v_count = 0 then raise exception 'PAYMENT_INCOMPLETE'; end if;
end;
$$;

-- 関数の実行権限: anon からは不可、ログインユーザーのみ
revoke execute on function public.create_booking(uuid, text, timestamp with time zone, text, float, float, text) from public, anon;
revoke execute on function public.update_booking_status(uuid, text) from public, anon;
revoke execute on function public.pay_booking_dummy(uuid) from public, anon;
revoke execute on function public.update_therapist_location(uuid, float, float) from public, anon;
revoke execute on function public.mark_messages_read(uuid) from public, anon;
revoke execute on function public.dummy_complete_review_fee(uuid) from public, anon;
revoke execute on function public.dummy_complete_identity_verification(uuid, text) from public, anon;
grant execute on function public.create_booking(uuid, text, timestamp with time zone, text, float, float, text) to authenticated;
grant execute on function public.update_booking_status(uuid, text) to authenticated;
grant execute on function public.pay_booking_dummy(uuid) to authenticated;
grant execute on function public.update_therapist_location(uuid, float, float) to authenticated;
grant execute on function public.mark_messages_read(uuid) to authenticated;
grant execute on function public.dummy_complete_review_fee(uuid) to authenticated;
grant execute on function public.dummy_complete_identity_verification(uuid, text) to authenticated;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- --------------------------------------------------------
-- 7. Realtime: 予約とチャットの変更を当事者へ配信（RLS が適用される）
-- --------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.bookings;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.chat_messages;
    exception when duplicate_object then null;
    end;
  end if;
end $$;

commit;

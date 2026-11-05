#!/usr/bin/env node
// ========================================================
// デモ用シード SQL 生成スクリプト
//   scripts/seed/mockData.ts（ダミーデータの正本）から supabase/seed/demo_seed.sql を生成する。
//
//   使い方: node scripts/seed/generate_seed_sql.mjs
//   生成された SQL の先頭にあるデモ用パスワードを書き換えてから、Supabase の SQL Editor で実行する。
//
//   ※ 本番リリース前に、デモアカウントとダミーデータはすべて削除すること。
// ========================================================
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const outFile = path.join(root, 'supabase/seed/demo_seed.sql');

// --- mockData.ts を読み込む（型 import は実行時に不要なので空モジュールで代替） ---
const source = fs.readFileSync(path.join(here, 'mockData.ts'), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const mod = { exports: {} };
new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({}));
const {
  initialProfiles,
  initialTherapistProfiles,
  initialServices,
  initialBookings,
  initialReviews,
  initialChatMessages,
  initialOnboardings,
  initialVerificationLogs,
} = mod.exports;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 非 UUID の ID（例: msg-001）から決定的な UUID を作る */
function toUuid(id) {
  if (UUID_RE.test(id)) return id;
  const h = crypto.createHash('sha1').update(`carekuru-seed:${id}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

// --- 各テーブルの行を作る ---
// 管理者は実在のメールアドレスなので、デモ用ユーザーとは別扱いにする（パスワードも別・既存アカウントは上書きしない）
const adminProfile = initialProfiles.find((p) => p.role === 'admin');
if (!adminProfile) throw new Error('mockData に管理者がいません');
const profiles = initialProfiles
  .filter((p) => p.role !== 'admin')
  .map((p) => pick(p, ['id', 'role', 'name', 'email', 'phone', 'avatar_url', 'address', 'postal_code', 'lat', 'lng']));

const THERAPIST_COLS = [
  'user_id', 'bio', 'specialities', 'is_store_based', 'is_visit_based', 'address', 'lat', 'lng',
  'visit_radius_km', 'rating_avg', 'reviews_count', 'is_approved', 'stripe_account_id', 'campaign',
  'store_name', 'store_address', 'store_lat', 'store_lng', 'store_access', 'store_parking', 'store_hours',
  'store_facilities', 'store_notes', 'available_days', 'available_hours_start', 'available_hours_end',
  'is_separate_store_hours', 'store_hours_start', 'store_hours_end',
  'payment_status', 'payment_completed_at', 'is_identity_verified', 'identity_verified_at',
  'identity_verified_name', 'is_certified', 'certified_at',
];
// NOT NULL 列は、値が無いと jsonb_populate_recordset が null を入れて既定値が効かないため明示的に補う
const therapistProfiles = Object.values(initialTherapistProfiles).map((t) => ({
  ...pick(t, THERAPIST_COLS),
  specialities: t.specialities ?? [],
  payment_status: t.payment_status ?? 'pending',
  is_identity_verified: t.is_identity_verified ?? false,
  is_certified: t.is_certified ?? false,
  is_separate_store_hours: t.is_separate_store_hours ?? false,
}));

const services = initialServices.map((s) =>
  pick(s, ['id', 'therapist_id', 'title', 'description', 'price', 'duration_minutes', 'category', 'is_active'])
);

const BOOKING_COLS = [
  'id', 'serial_number', 'customer_id', 'therapist_id', 'service_id', 'booking_type', 'scheduled_at', 'status',
  'total_amount', 'platform_fee', 'therapist_earnings', 'is_paid', 'paid_at', 'lat', 'lng', 'visit_address',
  'customer_notes', 'therapist_notes', 'therapist_current_lat', 'therapist_current_lng', 'created_at',
];
const bookings = initialBookings.map((b) => {
  const row = pick(b, BOOKING_COLS);
  const paid = row.status === 'confirmed' || row.status === 'completed';
  row.is_paid = row.is_paid ?? paid;
  if (paid) row.paid_at = row.paid_at ?? row.created_at;
  return row;
});

// レビューが参照する予約がダミーデータに無い場合は、完了済み予約を補完する（FK 制約のため）
const bookingIds = new Set(bookings.map((b) => b.id));
const servicesByTherapist = new Map();
for (const s of services) {
  if (!servicesByTherapist.has(s.therapist_id)) servicesByTherapist.set(s.therapist_id, s);
}
const FEE_RATE = 0.2;
let synthesized = 0;
for (const r of initialReviews) {
  if (bookingIds.has(r.booking_id)) continue;
  const svc = servicesByTherapist.get(r.therapist_id);
  if (!svc) throw new Error(`therapist ${r.therapist_id} has no service for review ${r.id}`);
  const when = new Date(new Date(r.created_at).getTime() - 24 * 3600 * 1000).toISOString();
  const fee = Math.round(svc.price * FEE_RATE);
  bookings.push({
    id: r.booking_id,
    customer_id: r.customer_id,
    therapist_id: r.therapist_id,
    service_id: svc.id,
    booking_type: 'visit',
    scheduled_at: when,
    status: 'completed',
    total_amount: svc.price,
    platform_fee: fee,
    therapist_earnings: svc.price - fee,
    is_paid: true,
    paid_at: when,
    created_at: when,
  });
  bookingIds.add(r.booking_id);
  synthesized++;
}

const reviews = initialReviews.map((r) =>
  pick(r, ['id', 'booking_id', 'customer_id', 'therapist_id', 'rating', 'comment', 'created_at'])
);

const chatMessages = initialChatMessages.map((m) => ({
  ...pick(m, ['booking_id', 'sender_id', 'receiver_id', 'content', 'is_read', 'created_at']),
  id: toUuid(m.id),
}));

const onboardings = Object.values(initialOnboardings).map((o) => ({ ...o }));
// verified_by は実際の管理者 ID に後で差し替える
const verificationLogs = initialVerificationLogs.map((l) => ({
  ...l,
  id: toUuid(l.id),
  verified_by: l.verified_by === adminProfile.id ? null : l.verified_by,
}));

// --- SQL 生成 ---
const TAG = '$seed$';
const jsonLiteral = (rows) => {
  const json = JSON.stringify(rows);
  if (json.includes(TAG)) throw new Error('seed data contains the dollar-quote tag');
  return `${TAG}${json}${TAG}::jsonb`;
};

/** jsonb_populate_recordset を使った UPSERT 文（profiles 等はダミーデータの内容で上書き、予約等は既存優先） */
function upsert(table, rows, conflictKey, { updateCols, onlyExistingUsers } = {}) {
  if (rows.length === 0) return `-- ${table}: no rows\n`;
  const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const where = onlyExistingUsers ? `\nwhere ${onlyExistingUsers}` : '';
  // conflictKey が null の場合は、どの一意制約に当たっても既存行を優先してスキップする
  const onConflict = conflictKey
    ? `on conflict (${conflictKey}) do update set\n    ${(updateCols ?? cols.filter((c) => c !== conflictKey))
        .map((c) => `${c} = excluded.${c}`)
        .join(',\n    ')}`
    : 'on conflict do nothing';
  return `insert into public.${table} (${cols.join(', ')})
select ${cols.join(', ')}
from jsonb_populate_recordset(null::public.${table}, ${jsonLiteral(rows)}) as r${where}
${onConflict};
`;
}

const authUsers = profiles.map((p) => ({ // 管理者を除くデモユーザー
  id: p.id,
  email: p.email.toLowerCase(),
  name: p.name,
  role: p.role,
}));

const sql = `-- ========================================================
-- CareKuru デモ用シードデータ（自動生成ファイル・手で編集しないこと）
--   生成元: scripts/seed/mockData.ts
--   生成:   node scripts/seed/generate_seed_sql.mjs
--
--   内容: 認証ユーザー ${authUsers.length} 名（管理者・セラピスト・顧客）、セラピスト詳細 ${therapistProfiles.length} 件、
--         メニュー ${services.length} 件、予約 ${bookings.length} 件（うちレビュー用に補完 ${synthesized} 件）、
--         レビュー ${reviews.length} 件、チャット ${chatMessages.length} 件、審査提出 ${onboardings.length} 件、承認ログ ${verificationLogs.length} 件
--
--   ▼ 実行前に、下の 2 つのパスワードを必ず書き換えてください。
--     demo_password : デモ用アカウント（例: therapist.1@carehub.ehime.jp / customer.1@example.com）共通。関係者に共有してよい
--     admin_password: 管理者 ${adminProfile.email} 用。共有しないこと
--                     （このメールのアカウントが既にある場合はパスワードを変えず、管理者に昇格だけする）
--
--   前提: migrations/004_production_auth_and_rls.sql 適用済み。何度実行しても安全（冪等）です。
--   ※ 本番リリース前にデモアカウントとダミーデータは削除すること。
-- ========================================================

begin;

create extension if not exists pgcrypto with schema extensions;

create temp table seed_config on commit drop as
select 'CHANGE_ME_demo_password'::text  as demo_password,    -- ← デモ用パスワード（8文字以上・関係者と共有）
       'CHANGE_ME_admin_password'::text as admin_password;   -- ← 管理者用パスワード（12文字以上・共有しない）

do $$
declare
  c seed_config;
begin
  select * into c from seed_config;
  if c.demo_password like 'CHANGE_ME%' or length(c.demo_password) < 8 then
    raise exception 'seed_config の demo_password を 8 文字以上の値に書き換えてから実行してください';
  end if;
  if c.admin_password like 'CHANGE_ME%' or length(c.admin_password) < 12 then
    raise exception 'seed_config の admin_password を 12 文字以上の値に書き換えてから実行してください';
  end if;
  if c.admin_password = c.demo_password then
    raise exception 'admin_password は demo_password と別の値にしてください';
  end if;
end $$;

-- --------------------------------------------------------
-- 1. 認証ユーザー（auth.users / auth.identities）
--    同じメールアドレスで別 ID のユーザーが既にいる場合はスキップ（その人の profiles も作られない）
-- --------------------------------------------------------
create temp table seed_users on commit drop as
select * from jsonb_to_recordset(${jsonLiteral(authUsers)})
  as t(id uuid, email text, name text, role text);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
  extensions.crypt((select demo_password from seed_config), extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('name', u.name, 'role', case when u.role = 'therapist' then 'therapist' else 'customer' end),
  now(), now(), '', '', '', ''
from seed_users u
where not exists (select 1 from auth.users a where a.id = u.id or lower(a.email) = u.email);

-- 既存のデモユーザーもパスワードを揃える
update auth.users a
set encrypted_password = extensions.crypt((select demo_password from seed_config), extensions.gen_salt('bf')),
    email_confirmed_at = coalesce(a.email_confirmed_at, now()),
    updated_at = now()
from seed_users u
where a.id = u.id;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select a.id::text, a.id,
       jsonb_build_object('sub', a.id::text, 'email', a.email, 'email_verified', true),
       'email', now(), now(), now()
from auth.users a
join seed_users u on u.id = a.id
where not exists (select 1 from auth.identities i where i.user_id = a.id and i.provider = 'email');

-- --------------------------------------------------------
-- 1-b. 管理者（${adminProfile.email}）
--      既にアカウントがあればそのユーザーを管理者に昇格（パスワードは変更しない）。なければ作成する。
-- --------------------------------------------------------
create temp table seed_admin (id uuid) on commit drop;

do $$
declare
  v_id uuid;
begin
  select id into v_id from auth.users where lower(email) = '${adminProfile.email.toLowerCase()}';
  if v_id is null then
    -- ダミーデータの管理者 ID が旧デモ管理者で使用済みなら、新しい ID を採番する
    v_id := case when exists (select 1 from auth.users where id = '${adminProfile.id}')
                 then gen_random_uuid() else '${adminProfile.id}'::uuid end;
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', '${adminProfile.email.toLowerCase()}',
      extensions.crypt((select admin_password from seed_config), extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', '${adminProfile.name}'),
      now(), now(), '', '', '', ''
    );
    insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (v_id::text, v_id, jsonb_build_object('sub', v_id::text, 'email', '${adminProfile.email.toLowerCase()}', 'email_verified', true),
            'email', now(), now(), now());
  end if;

  -- 旧デモ管理者（admin@carehub.ehime.jp 等）が残っていれば一般ユーザーに戻す
  update public.profiles set role = 'customer' where role = 'admin' and id <> v_id;

  update public.profiles
  set role = 'admin',
      name = case when name is null or name = split_part(email, '@', 1) then '${adminProfile.name}' else name end
  where id = v_id;

  insert into seed_admin values (v_id);
end $$;

-- --------------------------------------------------------
-- 2. profiles（auth.users に存在するユーザーのみ）
-- --------------------------------------------------------
${upsert('profiles', profiles, 'id', { onlyExistingUsers: 'exists (select 1 from auth.users a where a.id = r.id)' })}
-- --------------------------------------------------------
-- 3. therapist_profiles
-- --------------------------------------------------------
${upsert('therapist_profiles', therapistProfiles, 'user_id', { onlyExistingUsers: 'exists (select 1 from public.profiles p where p.id = r.user_id)' })}
-- --------------------------------------------------------
-- 4. services
-- --------------------------------------------------------
${upsert('services', services, 'id', { onlyExistingUsers: 'exists (select 1 from public.profiles p where p.id = r.therapist_id)' })}
-- --------------------------------------------------------
-- 5. bookings
-- --------------------------------------------------------
${upsert('bookings', bookings, null, {
  onlyExistingUsers:
    'exists (select 1 from public.profiles p where p.id = r.customer_id) and exists (select 1 from public.services s where s.id = r.service_id)',
})}
-- シリアル番号の採番を既存の最大値の次から始める
select setval(
  'public.booking_serial_seq',
  greatest(1, coalesce((select max(nullif(regexp_replace(serial_number, '\\D', '', 'g'), '')::int) from public.bookings), 0)),
  true
);

-- --------------------------------------------------------
-- 6. reviews（評価平均はトリガーで再計算される）
-- --------------------------------------------------------
${upsert('reviews', reviews, null, { onlyExistingUsers: 'exists (select 1 from public.bookings b where b.id = r.booking_id)' })}
-- --------------------------------------------------------
-- 7. chat_messages
-- --------------------------------------------------------
${upsert('chat_messages', chatMessages, null, { onlyExistingUsers: 'exists (select 1 from public.bookings b where b.id = r.booking_id)' })}
-- --------------------------------------------------------
-- 8. 審査（提出状況・承認ログ）
-- --------------------------------------------------------
${upsert('therapist_onboarding', onboardings, 'therapist_id', { onlyExistingUsers: 'exists (select 1 from public.profiles p where p.id = r.therapist_id)' })}
${upsert('therapist_verification_logs', verificationLogs, null)}
update public.therapist_verification_logs
set verified_by = (select id from seed_admin)
where verified_by is null and id in (${verificationLogs.map((l) => `'${l.id}'`).join(', ')});
-- --------------------------------------------------------
-- 9. 評価平均・件数を実際のレビューから再計算（ダミーデータの固定値と実データの不一致をなくす）
-- --------------------------------------------------------
update public.therapist_profiles tp
set rating_avg = coalesce(r.avg_rating, 0), reviews_count = coalesce(r.cnt, 0)
from (
  select p.user_id, round(avg(rv.rating)::numeric, 2) as avg_rating, count(rv.id)::int as cnt
  from public.therapist_profiles p
  left join public.reviews rv on rv.therapist_id = p.user_id
  group by p.user_id
) r
where r.user_id = tp.user_id;

commit;
`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, sql);
console.log(`wrote ${path.relative(root, outFile)} (${(sql.length / 1024).toFixed(0)} KB)`);
console.log(`users=${authUsers.length} therapists=${therapistProfiles.length} services=${services.length} bookings=${bookings.length} (synthesized ${synthesized}) reviews=${reviews.length}`);

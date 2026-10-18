-- ========================================================
-- 出張・店舗対応ヘルスケア・ボディケアプラットフォーム
-- Supabase Database Schema (PostgreSQL + PostGIS + RLS)
-- ========================================================

-- 1. PostGIS拡張の有効化
create extension if not exists postgis;

-- 2. profiles: 共通ユーザー情報
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'therapist', 'customer')),
  name text not null,
  email text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. therapist_profiles: セラピスト詳細
create table if not exists public.therapist_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  bio text,
  specialities text[] default '{}',
  is_store_based boolean default true,
  is_visit_based boolean default true,
  address text,
  location geography(Point, 4326),
  visit_radius_km numeric(5, 2) default 10.0,
  rating_avg numeric(3, 2) default 0.00,
  reviews_count integer default 0,
  is_approved boolean default false, -- 管理者承認ステータス
  stripe_account_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. services: 施術メニュー
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  price integer not null check (price >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  category text default 'massage',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. bookings: 予約データ
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete restrict,
  therapist_id uuid not null references public.profiles(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  booking_type text not null check (booking_type in ('visit', 'store')),
  scheduled_at timestamp with time zone not null,
  status text not null check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending',
  total_amount integer not null check (total_amount >= 0),
  platform_fee integer not null default 0,
  therapist_earnings integer not null default 0,
  stripe_payment_intent_id text,
  location geography(Point, 4326), -- 出張先または店舗の位置情報
  visit_address text,
  customer_notes text,
  therapist_notes text,
  therapist_current_lat float,
  therapist_current_lng float,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. reviews: 評価・レビュー
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  therapist_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. platform_settings: 管理者プラットフォーム設定
create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 初期手数料率設定
insert into public.platform_settings (key, value)
values ('fee_rate', '{"percentage": 20}'::jsonb)
on conflict (key) do nothing;

-- 8. インデックスの作成
create index if not exists therapist_profiles_location_idx on public.therapist_profiles using gist (location);
create index if not exists bookings_location_idx on public.bookings using gist (location);
create index if not exists bookings_customer_idx on public.bookings (customer_id);
create index if not exists bookings_therapist_idx on public.bookings (therapist_id);
create index if not exists bookings_scheduled_idx on public.bookings (scheduled_at);
create index if not exists services_therapist_idx on public.services (therapist_id);
create index if not exists reviews_therapist_idx on public.reviews (therapist_id);

-- ========================================================
-- Row Level Security (RLS) ポリシー
-- ========================================================

alter table public.profiles enable row level security;
alter table public.therapist_profiles enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.platform_settings enable row level security;

-- profiles ポリシー
-- 認証済み/匿名ユーザー含め閲覧可能 (一覧や詳細表示のため)
create policy "profiles_select_policy" on public.profiles
  for select using (true);

create policy "profiles_insert_policy" on public.profiles
  for insert with check (auth.uid() = id or (select role from public.profiles where id = auth.uid()) = 'admin');

create policy "profiles_update_policy" on public.profiles
  for update using (auth.uid() = id or (select role from public.profiles where id = auth.uid()) = 'admin');

-- therapist_profiles ポリシー
create policy "therapist_profiles_select_policy" on public.therapist_profiles
  for select using (true);

create policy "therapist_profiles_insert_policy" on public.therapist_profiles
  for insert with check (auth.uid() = user_id or (select role from public.profiles where id = auth.uid()) = 'admin');

create policy "therapist_profiles_update_policy" on public.therapist_profiles
  for update using (auth.uid() = user_id or (select role from public.profiles where id = auth.uid()) = 'admin');

-- services ポリシー
create policy "services_select_policy" on public.services
  for select using (true);

create policy "services_manage_policy" on public.services
  for all using (auth.uid() = therapist_id or (select role from public.profiles where id = auth.uid()) = 'admin');

-- bookings ポリシー
create policy "bookings_select_policy" on public.bookings
  for select using (
    auth.uid() = customer_id or
    auth.uid() = therapist_id or
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "bookings_insert_policy" on public.bookings
  for insert with check (
    auth.uid() = customer_id or
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "bookings_update_policy" on public.bookings
  for update using (
    auth.uid() = customer_id or
    auth.uid() = therapist_id or
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- reviews ポリシー
create policy "reviews_select_policy" on public.reviews
  for select using (true);

create policy "reviews_insert_policy" on public.reviews
  for insert with check (
    auth.uid() = customer_id or
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "reviews_delete_policy" on public.reviews
  for delete using (
    auth.uid() = customer_id or
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- platform_settings ポリシー
create policy "platform_settings_select_policy" on public.platform_settings
  for select using (true);

create policy "platform_settings_all_policy" on public.platform_settings
  for all using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- ========================================================
-- ヘルパー関数 & PostGIS 空間クエリ RPC
-- ========================================================

-- 周辺セラピスト検索 RPC (経度・緯度・半径メートル指定)
create or replace function public.get_nearby_therapists(
  user_lat float,
  user_lng float,
  radius_meters float default 20000,
  filter_service_type text default 'all'
)
returns table (
  therapist_id uuid,
  name text,
  avatar_url text,
  bio text,
  specialities text[],
  is_store_based boolean,
  is_visit_based boolean,
  address text,
  lat float,
  lng float,
  distance_meters float,
  rating_avg numeric,
  reviews_count integer
)
language plpgsql
security definer
as $$
declare
  user_pt geography;
begin
  user_pt := ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography;
  
  return query
  select 
    p.id as therapist_id,
    p.name,
    p.avatar_url,
    tp.bio,
    tp.specialities,
    tp.is_store_based,
    tp.is_visit_based,
    tp.address,
    ST_Y(tp.location::geometry) as lat,
    ST_X(tp.location::geometry) as lng,
    ST_Distance(tp.location, user_pt) as distance_meters,
    tp.rating_avg,
    tp.reviews_count
  from public.therapist_profiles tp
  join public.profiles p on p.id = tp.user_id
  where 
    tp.is_approved = true
    and (
      filter_service_type = 'all'
      or (filter_service_type = 'store' and tp.is_store_based = true)
      or (filter_service_type = 'visit' and tp.is_visit_based = true)
    )
    and ST_DWithin(tp.location, user_pt, radius_meters)
  order by distance_meters asc;
end;
$$;

-- レビュー投稿時に therapist_profiles の平均評価と件数を更新するトリガー
create or replace function public.update_therapist_rating()
returns trigger
language plpgsql
as $$
begin
  update public.therapist_profiles
  set 
    rating_avg = coalesce((
      select round(avg(rating)::numeric, 2)
      from public.reviews
      where therapist_id = coalesce(new.therapist_id, old.therapist_id)
    ), 0.00),
    reviews_count = (
      select count(*)
      from public.reviews
      where therapist_id = coalesce(new.therapist_id, old.therapist_id)
    ),
    updated_at = now()
  where user_id = coalesce(new.therapist_id, old.therapist_id);
  
  return coalesce(new, old);
end;
$$;

create or replace trigger trigger_update_therapist_rating
after insert or update or delete on public.reviews
for each row execute function public.update_therapist_rating();

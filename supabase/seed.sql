-- ========================================================
-- 出張・店舗対応ヘルスケア・ボディケアプラットフォーム
-- 初期シードデータ (Seed Data)
-- ========================================================

-- pgcrypto拡張（パスワードハッシュ用）
create extension if not exists pgcrypto;

do $$
declare
  admin_id uuid := '11111111-1111-1111-1111-111111111111';
  therapist1_id uuid := '22222222-2222-2222-2222-222222222221';
  therapist2_id uuid := '22222222-2222-2222-2222-222222222222';
  therapist3_id uuid := '22222222-2222-2222-2222-222222222223';
  customer1_id uuid := '33333333-3333-3333-3333-333333333331';
  customer2_id uuid := '33333333-3333-3333-3333-333333333332';
  
  service1_id uuid := '44444444-4444-4444-4444-444444444441';
  service2_id uuid := '44444444-4444-4444-4444-444444444442';
  service3_id uuid := '44444444-4444-4444-4444-444444444443';
  service4_id uuid := '44444444-4444-4444-4444-444444444444';
  
  booking1_id uuid := '55555555-5555-5555-5555-555555555551';
  booking2_id uuid := '55555555-5555-5555-5555-555555555552';
  booking3_id uuid := '55555555-5555-5555-5555-555555555553';
begin

  -- 0. auth.users に対応する認証ユーザーを作成（外部キー profiles_id_fkey を満たすため）
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  values
    ('00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated', 'admin@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"プラットフォーム運営本部"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', therapist1_id, 'authenticated', 'authenticated', 'sato@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"佐藤 健一"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', therapist2_id, 'authenticated', 'authenticated', 'takahashi@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"高橋 麻美"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', therapist3_id, 'authenticated', 'authenticated', 'nakamura@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"中村 俊介"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', customer1_id, 'authenticated', 'authenticated', 'tanaka@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"田中 太郎"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', customer2_id, 'authenticated', 'authenticated', 'suzuki@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"鈴木 花子"}', now(), now())
  on conflict (id) do nothing;

  -- 1. profiles
  insert into public.profiles (id, role, name, email, phone, avatar_url)
  values
    (admin_id, 'admin', 'プラットフォーム運営本部', 'admin@example.com', '03-1234-5678', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
    (therapist1_id, 'therapist', '佐藤 健一 (国家資格 理学療法士)', 'sato@example.com', '090-1111-2222', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'),
    (therapist2_id, 'therapist', '高橋 麻美 (美肌・アロマリンパセラピスト)', 'takahashi@example.com', '090-3333-4444', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
    (therapist3_id, 'therapist', '中村 俊介 (カイロプラクター・姿勢矯正)', 'nakamura@example.com', '090-5555-6666', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'),
    (customer1_id, 'customer', '田中 太郎', 'tanaka@example.com', '080-9999-0001', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'),
    (customer2_id, 'customer', '鈴木 花子', 'suzuki@example.com', '080-9999-0002', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150')
  on conflict (id) do update set
    name = excluded.name,
    role = excluded.role;

  -- 2. therapist_profiles
  -- 渋谷区 (35.6580, 139.7016), 港区南青山 (35.6628, 139.7180), 新宿区 (35.6938, 139.7034)
  insert into public.therapist_profiles (user_id, bio, specialities, is_store_based, is_visit_based, address, location, visit_radius_km, rating_avg, reviews_count, is_approved)
  values
    (
      therapist1_id,
      '総合病院でのリハビリ勤務歴10年。肩こり・腰痛の根本改善やスポーツ傷害のケアを得意としています。出張施術ではポータブル施術ベッドを持参いたします。',
      array['理学療法', '腰痛・肩こり改善', '運動リハビリ', '筋膜リリース'],
      true,
      true,
      '東京都渋谷区渋谷2-10-5 メディカルサロン渋谷',
      ST_SetSRID(ST_MakePoint(139.7016, 35.6580), 4326)::geography,
      15.0,
      4.92,
      28,
      true
    ),
    (
      therapist2_id,
      '本場フランス式オーガニックアロマを用いた極上のリンパドレナージュを提供します。おうち時間を最高のリラクゼーション空間に変える出張エステも大好評です。',
      array['アロマセラピー', 'リンパドレナージュ', '小顔矯正', 'ヘッドスパ'],
      false,
      true,
      '東京都港区南青山3-12-1 (出張専門拠点)',
      ST_SetSRID(ST_MakePoint(139.7180, 35.6628), 4326)::geography,
      12.0,
      4.85,
      42,
      true
    ),
    (
      therapist3_id,
      '米国式カイロプラクティックと東洋医学の骨盤矯正を融合した独自メソッド。デスクワークによるストレートネック・猫背を1回で実感改善。',
      array['カイロプラクティック', '骨盤矯正', '姿勢改善', '整体'],
      true,
      false,
      '東京都新宿区西新宿1-18-5 新宿カイロプラクティックセンター',
      ST_SetSRID(ST_MakePoint(139.7034, 35.6938), 4326)::geography,
      8.0,
      4.78,
      19,
      true
    )
  on conflict (user_id) do update set
    bio = excluded.bio,
    specialities = excluded.specialities,
    rating_avg = excluded.rating_avg,
    reviews_count = excluded.reviews_count;

  -- 3. services
  insert into public.services (id, therapist_id, title, description, price, duration_minutes, category, is_active)
  values
    (service1_id, therapist1_id, '【初回限定】全身メディカル整体＆姿勢リハビリ 60分', '国家資格者による丁寧な問診と検査付き。慢性的な首・肩・腰の痛みを根本アプローチ。出張・店舗どちらも対応。', 7800, 60, 'physical_therapy', true),
    (service2_id, therapist1_id, 'アスリート・本格ボディメンテナンス 90分', '筋膜リリース＋PNFストレッチによる全身ディープケア。大会前後やハードワークの疲労回復に。', 12000, 90, 'physical_therapy', true),
    (service3_id, therapist2_id, 'オーガニック極上アロマリンパ＆ヘッド 70分', '厳選された高純度エッセンシャルオイルで全身の老廃物を流し、心地よい眠りへと誘います。女性・男性ともに利用可能。', 9500, 70, 'aroma', true),
    (service4_id, therapist3_id, '骨盤＆脊椎バランス矯正・猫背改善 50分', 'ボキボキしないソフトカイロ。歪みを測定し骨格を本来の自然な位置へと整えます。', 6800, 50, 'chiropractic', true)
  on conflict (id) do nothing;

  -- 4. bookings
  insert into public.bookings (id, customer_id, therapist_id, service_id, booking_type, scheduled_at, status, total_amount, platform_fee, therapist_earnings, location, visit_address, customer_notes)
  values
    (
      booking1_id,
      customer1_id,
      therapist1_id,
      service1_id,
      'visit',
      now() + interval '2 days 3 hours',
      'pending',
      7800,
      1560,
      6240,
      ST_SetSRID(ST_MakePoint(139.7050, 35.6600), 4326)::geography,
      '東京都渋谷区神宮前5-1-1 表参道レジデンス402号室',
      '在宅ワークで腰が限界です。ポータブルベッドの設置スペースは確保してあります。'
    ),
    (
      booking2_id,
      customer2_id,
      therapist2_id,
      service3_id,
      'visit',
      now() + interval '1 days 6 hours',
      'confirmed',
      9500,
      1900,
      7600,
      ST_SetSRID(ST_MakePoint(139.7200, 35.6650), 4326)::geography,
      '東京都港区北青山2-8-35 グランドヒルズ701',
      'リラックスできる香りを希望します。'
    ),
    (
      booking3_id,
      customer1_id,
      therapist3_id,
      service4_id,
      'store',
      now() - interval '3 days',
      'completed',
      6800,
      1360,
      5440,
      ST_SetSRID(ST_MakePoint(139.7034, 35.6938), 4326)::geography,
      '東京都新宿区西新宿1-18-5 新宿カイロプラクティックセンター',
      '店舗初訪問です。'
    )
  on conflict (id) do nothing;

  -- 5. reviews
  insert into public.reviews (id, booking_id, customer_id, therapist_id, rating, comment)
  values
    (
      '66666666-6666-6666-6666-666666666661',
      booking3_id,
      customer1_id,
      therapist3_id,
      5,
      'デスクワークで長年悩んでいた首のコリと猫背が劇的に軽くなりました！先生の説明も分かりやすく、日常のストレッチ方法まで教えていただけて大満足です。'
    )
  on conflict (id) do nothing;

end $$;

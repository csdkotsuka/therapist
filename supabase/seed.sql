-- ========================================================
-- 出張・店舗対応ヘルスケア・ボディケアプラットフォーム
-- 初期シードデータ (Seed Data 完全版)
-- ========================================================

create extension if not exists pgcrypto;

do $$
declare
  -- ユーザーID (固定UUID)
  admin_id uuid := '11111111-1111-1111-1111-111111111111';
  therapist1_id uuid := '22222222-2222-2222-2222-222222222221';
  therapist2_id uuid := '22222222-2222-2222-2222-222222222222';
  therapist3_id uuid := '22222222-2222-2222-2222-222222222223';
  customer1_id uuid := '33333333-3333-3333-3333-333333333331';
  customer2_id uuid := '33333333-3333-3333-3333-333333333332';

  -- 施術メニューID
  service1_id uuid := '44444444-4444-4444-4444-444444444441';
  service2_id uuid := '44444444-4444-4444-4444-444444444442';
  service3_id uuid := '44444444-4444-4444-4444-444444444443';
  service4_id uuid := '44444444-4444-4444-4444-444444444444';
  service5_id uuid := '44444444-4444-4444-4444-444444444445';

  -- 予約ID
  booking1_id uuid := '55555555-5555-5555-5555-555555555551';
  booking2_id uuid := '55555555-5555-5555-5555-555555555552';
  booking3_id uuid := '55555555-5555-5555-5555-555555555553';
  booking4_id uuid := '55555555-5555-5555-5555-555555555554';
  booking5_id uuid := '55555555-5555-5555-5555-555555555555';
begin

  -- ========================================================
  -- 0. auth.users に対応する認証ユーザーを作成
  -- ========================================================
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
    ('00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated', 'admin@carehub.jp', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"プラットフォーム運営本部"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', therapist1_id, 'authenticated', 'authenticated', 'sato.pt@carehub.jp', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"佐藤 健一"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', therapist2_id, 'authenticated', 'authenticated', 'takahashi.aroma@carehub.jp', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"高橋 麻美"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', therapist3_id, 'authenticated', 'authenticated', 'nakamura.chiro@carehub.jp', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"中村 俊介"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', customer1_id, 'authenticated', 'authenticated', 'tanaka.taro@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"田中 太郎"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', customer2_id, 'authenticated', 'authenticated', 'suzuki.hanako@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"鈴木 花子"}', now(), now())
  on conflict (id) do nothing;

  -- ========================================================
  -- 1. profiles (共通ユーザープロフィール)
  -- ========================================================
  insert into public.profiles (id, role, name, email, phone, avatar_url)
  values
    (admin_id, 'admin', 'プラットフォーム運営本部', 'admin@carehub.jp', '03-1234-5678', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
    (therapist1_id, 'therapist', '佐藤 健一', 'sato.pt@carehub.jp', '090-1111-2222', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'),
    (therapist2_id, 'therapist', '高橋 麻美', 'takahashi.aroma@carehub.jp', '090-3333-4444', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
    (therapist3_id, 'therapist', '中村 俊介', 'nakamura.chiro@carehub.jp', '090-5555-6666', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'),
    (customer1_id, 'customer', '田中 太郎', 'tanaka.taro@example.com', '080-9999-0001', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'),
    (customer2_id, 'customer', '鈴木 花子', 'suzuki.hanako@example.com', '080-9999-0002', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150')
  on conflict (id) do update set
    name = excluded.name,
    role = excluded.role,
    avatar_url = excluded.avatar_url;

  -- ========================================================
  -- 2. therapist_profiles (セラピスト詳細情報)
  -- ========================================================
  insert into public.therapist_profiles (
    user_id,
    bio,
    specialities,
    is_store_based,
    is_visit_based,
    address,
    location,
    visit_radius_km,
    rating_avg,
    reviews_count,
    is_approved,
    stripe_account_id
  )
  values
    (
      therapist1_id,
      '総合病院リハビリ科で10年の臨床経験を持つ理学療法士です。慢性的な肩こり・腰痛の根本改善やスポーツ機能改善を得意としています。出張時は専用折りたたみベッドと清潔なリネンを持参して伺います。',
      array['理学療法', '腰痛・肩こり改善', '筋膜リリース', 'リハビリ'],
      true,
      true,
      '東京都渋谷区神宮前4-12-10 表参道メディカルビル3F',
      ST_SetSRID(ST_MakePoint(139.7092, 35.6666), 4326)::geography, -- 表参道・神宮前
      15.0,
      4.95,
      32,
      true,
      'acct_1MockTherapist001'
    ),
    (
      therapist2_id,
      'フランス式メディカルアロマを用いた極上リンパトリートメントをご提供。在宅ワークのストレス緩和、むくみ解消、深い睡眠へ導きます。女性特有のお悩みもお気軽にご相談ください。',
      array['アロマセラピー', 'リンパドレナージュ', '小顔ヘッドスパ', 'デトックス'],
      false,
      true,
      '東京都港区南青山5丁目（出張専門拠点）',
      ST_SetSRID(ST_MakePoint(139.7180, 35.6628), 4326)::geography, -- 南青山
      12.0,
      4.88,
      47,
      true,
      'acct_1MockTherapist002'
    ),
    (
      therapist3_id,
      '米国カイロプラクティックドクター直伝の骨盤・脊椎矯正。ボキボキしない安全な手技で骨格と自律神経のバランスを整え、姿勢と呼吸を楽にします。店舗は新宿駅西口から徒歩4分。',
      array['カイロプラクティック', '骨盤矯正', '姿勢・猫背改善', '整体'],
      true,
      false,
      '東京都新宿区西新宿1-18-5 新宿メディカルタワー6F',
      ST_SetSRID(ST_MakePoint(139.6995, 35.6908), 4326)::geography, -- 新宿
      8.0,
      4.80,
      24,
      true,
      'acct_1MockTherapist003'
    )
  on conflict (user_id) do update set
    bio = excluded.bio,
    specialities = excluded.specialities,
    rating_avg = excluded.rating_avg,
    reviews_count = excluded.reviews_count,
    is_approved = excluded.is_approved,
    location = excluded.location;

  -- ========================================================
  -- 3. services (全5メニュー)
  -- ========================================================
  insert into public.services (id, therapist_id, title, description, price, duration_minutes, category, is_active)
  values
    (
      service1_id,
      therapist1_id,
      '【初回限定】全身メディカル整体＆姿勢リハビリ 60分',
      '国家資格理学療法士による丁寧な姿勢・可動域チェック付き。慢性的な首肩こり・腰痛の根本原因を特定し手技でほぐします。',
      7800,
      60,
      'physical_therapy',
      true
    ),
    (
      service2_id,
      therapist1_id,
      'アスリート・本格ディープボディメンテナンス 90分',
      '筋膜リリースとPNFストレッチを組み合わせた極上コンディショニング。ゴルフやランニングの前後の疲労回復にも最適。',
      12000,
      90,
      'physical_therapy',
      true
    ),
    (
      service3_id,
      therapist2_id,
      'オーガニック極上アロマリンパトリートメント 70分',
      '厳選されたフランス産オーガニック精油を使用。心地よい圧でリンパを流し、老廃物の排出を促して全身の重だるさを解消します。',
      9500,
      70,
      'aroma',
      true
    ),
    (
      service4_id,
      therapist2_id,
      '小顔リフトアップ＆ドライヘッドスパ 50分',
      '首肩〜デコルテ〜頭皮を重点的にケア。眼精疲労、食いしばりによるエラの張り、頭の重さを劇的にスッキリさせます。',
      6800,
      50,
      'beauty',
      true
    ),
    (
      service5_id,
      therapist3_id,
      '骨盤＆脊椎バランス矯正・美姿勢プログラム 50分',
      '姿勢分析に基づき骨盤の傾きと背骨の歪みを整えます。痛みのないソフトな矯正で、終わった瞬間に背筋がピンと伸びる感動を。',
      7000,
      50,
      'chiropractic',
      true
    )
  on conflict (id) do update set
    title = excluded.title,
    price = excluded.price,
    duration_minutes = excluded.duration_minutes,
    category = excluded.category;

  -- ========================================================
  -- 4. bookings (予約データ: 進行中 + 過去履歴)
  -- ========================================================
  insert into public.bookings (
    id,
    customer_id,
    therapist_id,
    service_id,
    booking_type,
    scheduled_at,
    status,
    total_amount,
    platform_fee,
    therapist_earnings,
    location,
    visit_address,
    customer_notes,
    therapist_current_lat,
    therapist_current_lng
  )
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
      '在宅デスクワークで腰痛が悪化しています。折りたたみベッドの設置スペースあります。',
      null,
      null
    ),
    (
      booking2_id,
      customer2_id,
      therapist2_id,
      service3_id,
      'visit',
      now() + interval '1 days 5 hours',
      'confirmed',
      9500,
      1900,
      7600,
      ST_SetSRID(ST_MakePoint(139.7200, 35.6650), 4326)::geography,
      '東京都港区北青山2-8-35 グランドヒルズ701',
      'ラベンダー系のリラックスできる香りを希望します。',
      35.6635,
      139.7190
    ),
    (
      booking3_id,
      customer1_id,
      therapist3_id,
      service5_id,
      'store',
      now() - interval '3 days',
      'completed',
      7000,
      1400,
      5600,
      ST_SetSRID(ST_MakePoint(139.6995, 35.6908), 4326)::geography,
      '東京都新宿区西新宿1-18-5 新宿メディカルタワー6F',
      '初診です。',
      null,
      null
    ),
    (
      booking4_id,
      customer2_id,
      therapist2_id,
      service3_id,
      'visit',
      now() - interval '5 days',
      'completed',
      9500,
      1900,
      7600,
      ST_SetSRID(ST_MakePoint(139.7200, 35.6650), 4326)::geography,
      '東京都港区北青山2-8-35 グランドヒルズ701',
      'アロマ出張',
      null,
      null
    ),
    (
      booking5_id,
      customer1_id,
      therapist1_id,
      service1_id,
      'visit',
      now() - interval '7 days',
      'completed',
      7800,
      1560,
      6240,
      ST_SetSRID(ST_MakePoint(139.7050, 35.6600), 4326)::geography,
      '東京都渋谷区神宮前5-1-1 表参道レジデンス402号室',
      '初回メディカル整体',
      null,
      null
    )
  on conflict (id) do nothing;

  -- ========================================================
  -- 5. reviews (全3件のクチコミ・レビュー)
  -- ========================================================
  insert into public.reviews (id, booking_id, customer_id, therapist_id, rating, comment, created_at)
  values
    (
      '66666666-6666-6666-6666-666666666661',
      booking3_id,
      customer1_id,
      therapist3_id,
      5,
      '長年の首肩こりと猫背が本当に軽くなりました！施術前の丁寧な姿勢チェックと、日頃の姿勢のアドバイスもいただけて納得感がありました。また予約します！',
      now() - interval '2 days'
    ),
    (
      '66666666-6666-6666-6666-666666666662',
      booking4_id,
      customer2_id,
      therapist2_id,
      5,
      '自宅のリビングが一瞬で高級サロンのような癒しの空間になりました。アロマのブレンドも好みに合わせていただき、翌朝の目覚めが最高でした。',
      now() - interval '5 days'
    ),
    (
      '66666666-6666-6666-6666-666666666663',
      booking5_id,
      customer1_id,
      therapist1_id,
      5,
      '理学療法士の先生だけあって、解剖学に基づいた的確なアプローチでした。ぎっくり腰になりかけていた痛みがその場で消えて驚きました。',
      now() - interval '7 days'
    )
  on conflict (id) do nothing;

  -- ========================================================
  -- 6. platform_settings (手数料設定)
  -- ========================================================
  insert into public.platform_settings (key, value)
  values ('fee_rate', '{"percentage": 20}'::jsonb)
  on conflict (key) do update set value = excluded.value;

end $$;

-- ========================================================
-- 審査フロー動作確認用のデモ申請者 5名（任意実行）
--   実行前に supabase/migrations/001_therapist_verification.sql と supabase/seed_all_102_therapists.sql（管理者アカウントが必要）を実行してください。
--   何度実行しても安全（冪等）です。実ファイルは Storage に存在しないため、
--   管理画面でファイルプレビューは表示されませんが、承認／差戻しのフロー確認ができます。
--   ログインパスワードは共通で 'TestUser2026!'
-- ========================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a01', 'authenticated', 'authenticated', 'saori.hashimoto@carehub.ehime.jp', crypt('TestUser2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"橋本 沙織","role":"therapist"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a02', 'authenticated', 'authenticated', 'daisuke.okamoto@carehub.ehime.jp', crypt('TestUser2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"岡本 大輔","role":"therapist"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a03', 'authenticated', 'authenticated', 'aya.murai@carehub.ehime.jp', crypt('TestUser2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"村井 彩","role":"therapist"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a04', 'authenticated', 'authenticated', 'ken.fukuda@carehub.ehime.jp', crypt('TestUser2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"福田 健","role":"therapist"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a05', 'authenticated', 'authenticated', 'misaki.ishihara@carehub.ehime.jp', crypt('TestUser2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"石原 美咲","role":"therapist"}', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, role, name, email, phone, avatar_url, address, postal_code, lat, lng)
VALUES
  ('c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a01', 'therapist', '橋本 沙織', 'saori.hashimoto@carehub.ehime.jp', '089-941-2301', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', '愛媛県松山市三番町6丁目3-2', '790-0003', 33.8398, 132.7701),
  ('c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a02', 'therapist', '岡本 大輔', 'daisuke.okamoto@carehub.ehime.jp', '089-955-7782', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '愛媛県今治市石井町2丁目4-9', '794-0015', 34.0668, 132.9995),
  ('c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a03', 'therapist', '村井 彩', 'aya.murai@carehub.ehime.jp', '0897-33-6104', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', '愛媛県新居浜市坂井町1丁目5-7', '792-0812', 33.9546, 133.2889),
  ('c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a04', 'therapist', '福田 健', 'ken.fukuda@carehub.ehime.jp', '0896-24-3350', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '愛媛県四国中央市三島宮川1丁目2-4', '799-0405', 33.9795, 133.5481),
  ('c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a05', 'therapist', '石原 美咲', 'misaki.ishihara@carehub.ehime.jp', '089-947-1129', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', '愛媛県松山市湊町3丁目8-1', '790-0012', 33.8366, 132.7655)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, address = EXCLUDED.address;

INSERT INTO public.therapist_profiles (
  user_id, bio, specialities, is_store_based, is_visit_based, address, location, visit_radius_km,
  rating_avg, reviews_count, is_approved, stripe_account_id,
  payment_status, payment_completed_at, is_identity_verified, identity_verified_at, identity_verified_name,
  is_certified, certified_at
)
VALUES
  ('c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a01', '作業療法士（OT）歴12年。脳血管疾患後の生活動作訓練、在宅での福祉用具選定・住宅改修のご相談に対応します。', ARRAY['在宅リハビリ', '生活動作訓練', '福祉用具選定'], false, true, '愛媛県松山市三番町6丁目3-2', ST_SetSRID(ST_MakePoint(132.7701, 33.8398), 4326), 15, 0, 0, false, 'acct_demo_hashimoto', 'completed', '2026-10-18T02:10:00.000Z', true, '2026-10-18T05:30:00.000Z', '橋本 沙織', false, NULL),
  ('c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a02', '理学療法士（PT）。運動器リハビリ・スポーツ障害予防・高齢者の転倒予防プログラムを訪問でご提供します。', ARRAY['運動器リハビリ', 'スポーツ障害予防', '転倒予防'], false, true, '愛媛県今治市石井町2丁目4-9', ST_SetSRID(ST_MakePoint(132.9995, 34.0668), 4326), 15, 0, 0, false, 'acct_demo_okamoto', 'completed', '2026-10-20T03:00:00.000Z', false, NULL, NULL, false, NULL),
  ('c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a03', '助産師。産後ケア・母乳育児相談・新生児訪問に対応。ご自宅でゆったりご相談いただけます。', ARRAY['産後ケア', '母乳育児相談', '新生児訪問'], false, true, '愛媛県新居浜市坂井町1丁目5-7', ST_SetSRID(ST_MakePoint(133.2889, 33.9546), 4326), 15, 0, 0, false, 'acct_demo_murai', 'completed', '2026-10-19T08:00:00.000Z', true, '2026-10-19T10:15:00.000Z', '村井 彩', false, NULL),
  ('c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a04', '言語聴覚士（ST）。摂食嚥下訓練・失語症リハビリを予定。仮登録済みです。', ARRAY['摂食嚥下訓練', '失語症リハビリ'], false, true, '愛媛県四国中央市三島宮川1丁目2-4', ST_SetSRID(ST_MakePoint(133.5481, 33.9795), 4326), 15, 0, 0, false, NULL, 'pending', NULL, false, NULL, NULL, false, NULL),
  ('c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a05', '歯科衛生士。訪問口腔ケア・オーラルフレイル予防の相談に対応します。', ARRAY['訪問口腔ケア', 'オーラルフレイル予防'], false, true, '愛媛県松山市湊町3丁目8-1', ST_SetSRID(ST_MakePoint(132.7655, 33.8366), 4326), 15, 0, 0, false, 'acct_demo_ishihara', 'completed', '2026-10-14T02:00:00.000Z', true, '2026-10-14T04:20:00.000Z', '石原 美咲', false, NULL)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.therapist_onboarding (
  therapist_id, terms_version, terms_agreed_at, terms_signature_name, claimed_qualification_type,
  qualification_file_path, qualification_file_name, qualification_uploaded_at,
  insurance_file_path, insurance_file_name, insurance_uploaded_at,
  rejection_reason, rejected_at, files_purged_at
)
VALUES
  ('c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a01', '2026-10-v1', '2026-10-18T02:10:00.000Z', '橋本 沙織', '作業療法士（OT）', 'c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a01/qualification_demo.png', '資格証_サンプル.png', '2026-10-19T01:20:00.000Z', 'c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a01/insurance_demo.pdf', '賠償責任保険証券_サンプル.pdf', '2026-10-19T01:20:00.000Z', NULL, NULL, NULL),
  ('c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a02', '2026-10-v1', '2026-10-20T03:00:00.000Z', '岡本 大輔', '理学療法士（PT）', 'c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a02/qualification_demo.png', '資格証_サンプル.png', '2026-10-21T00:40:00.000Z', 'c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a02/insurance_demo.pdf', '賠償責任保険証券_サンプル.pdf', '2026-10-21T00:40:00.000Z', NULL, NULL, NULL),
  ('c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a03', '2026-10-v1', '2026-10-19T08:00:00.000Z', '村井 彩', '助産師', 'c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a03/qualification_demo.png', '資格証_サンプル.png', '2026-10-20T06:00:00.000Z', NULL, NULL, NULL, NULL, NULL, NULL),
  ('c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a05', '2026-10-v1', '2026-10-14T02:00:00.000Z', '石原 美咲', '歯科衛生士', NULL, NULL, NULL, NULL, NULL, NULL, '資格証の氏名・登録番号が判読できませんでした。明るい場所で撮影し直して再提出してください。', '2026-10-16T03:30:00.000Z', '2026-10-16T03:30:00.000Z')
ON CONFLICT (therapist_id) DO NOTHING;

INSERT INTO public.therapist_verification_logs (
  id, therapist_id, therapist_name, decision, verified_at, verified_by, reason, insurance_confirmed, files_deleted_count, files_deleted_at
)
VALUES
  ('e2a6b1c3-4d8f-4e2b-8b63-7f9a2c3e5b01', 'c1d5a0f2-3b7e-4c1a-9a52-6e8f1b2d4a05', '石原 美咲', 'rejected', '2026-10-16T03:30:00.000Z', '6ecacd4b-8d2a-4b06-8cc3-a3cca87a3f12', '資格証の氏名・登録番号が判読できませんでした。明るい場所で撮影し直して再提出してください。', false, 2, '2026-10-16T03:30:05.000Z')
ON CONFLICT (id) DO NOTHING;

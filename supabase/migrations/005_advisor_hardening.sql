-- ========================================================
-- 005_advisor_hardening.sql
-- Supabase のセキュリティ診断（db advisors）の指摘への対応
--
--   1. search_path が固定されていない関数に search_path を設定する
--      （呼び出し側の search_path を書き換えて、別スキーマの同名関数を実行させる攻撃を防ぐ）
--   2. トリガー専用の関数を API（anon / authenticated）から直接実行できないようにする
--      ※ トリガーとしての実行には EXECUTE 権限は不要なので、動作には影響しない
--
-- 対応しない指摘（意図どおり）:
--   - security_definer_view（public_profiles / public_therapist_profiles）
--       RLS を通さずに「公開してよい列・行だけ」を返すための VIEW。列は 004 で絞り込み済み。
--   - anon / authenticated から実行できる SECURITY DEFINER 関数
--       is_admin などは RLS ポリシーの中で使うため、実行権限が必要。
--       get_nearby_therapists は承認済みセラピストの公開情報だけを返す。
--       create_booking などの業務 RPC は関数内で auth.uid() と役割を検査している。
--   - spatial_ref_sys の RLS 無効 / postgis が public スキーマ
--       PostGIS 拡張の管理下にあり、座標系の参照データしか入っていない。
--
-- 前提: 004 適用済み。何度実行しても安全（冪等）です。
-- ========================================================

begin;

-- 1. search_path の固定
alter function public.is_internal_op() set search_path = public;
alter function public.sync_therapist_location() set search_path = public;
alter function public.protect_profile_columns() set search_path = public;
alter function public.protect_therapist_verification_columns() set search_path = public;

-- 2. トリガー専用関数の直接実行を禁止
revoke execute on function public.update_therapist_rating() from public, anon, authenticated;
revoke execute on function public.sync_therapist_location() from public, anon, authenticated;
revoke execute on function public.protect_profile_columns() from public, anon, authenticated;
revoke execute on function public.protect_therapist_verification_columns() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

commit;

-- ========================================================
-- bookings テーブルの status 制約に awaiting_payment を追加
-- フロー: pending(リクエスト) -> awaiting_payment(承諾済・決済待ち) -> confirmed(決済済・確定)
-- ========================================================

DO $$
BEGIN
  -- 既存の bookings_status_check 制約を解除
  ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

  -- awaiting_payment を含む新しいチェック制約を追加
  ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check
    CHECK (status IN ('pending', 'awaiting_payment', 'confirmed', 'completed', 'cancelled'));
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

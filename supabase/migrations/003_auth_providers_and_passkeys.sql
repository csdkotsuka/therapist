-- ========================================================
-- 003_auth_providers_and_passkeys.sql
-- 認証プロバイダ（LINE / Google）および Passkey（FIDO2 WebAuthn）対応スキーマ
-- ========================================================

-- 1. profiles テーブルにソーシャル認証・Passkey必須フラグ等のカラムを追加
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS line_user_id TEXT,
  ADD COLUMN IF NOT EXISTS google_sub TEXT,
  ADD COLUMN IF NOT EXISTS passkey_required BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_passkey_verified_at TIMESTAMPTZ;

-- インデックス作成（高速検索用）
CREATE INDEX IF NOT EXISTS idx_profiles_line_user_id ON profiles(line_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_google_sub ON profiles(google_sub);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 2. passkey_credentials テーブル（WebAuthn / FIDO2 生体認証クレデンシャル格納用）
CREATE TABLE IF NOT EXISTS passkey_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  credential_id TEXT UNIQUE NOT NULL,      -- WebAuthn Credential ID (Base64URL)
  public_key TEXT NOT NULL,                 -- 公開鍵 (COSE Key Base64URL)
  counter BIGINT NOT NULL DEFAULT 0,        -- リプレイ攻撃防止カウンター
  device_name TEXT,                         -- デバイス名（例: 'iPhone (Face ID)', 'MacBook (Touch ID)'）
  aaguid TEXT,                              -- 認証器モデル識別子
  transports TEXT[] DEFAULT ARRAY['internal'], -- ['internal', 'hybrid', 'usb', 'nfc', 'ble']
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_passkey_credentials_user_id ON passkey_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_passkey_credentials_cred_id ON passkey_credentials(credential_id);

-- 3. Row Level Security (RLS) の設定
-- 開発初期段階のため、RLSは無効（または全員アクセス許可）にして権限エラーを防止します。
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS passkey_credentials DISABLE ROW LEVEL SECURITY;

-- ※ 本番環境移行時にRLSを有効化する場合は下記ポリシーを適用してください:
-- ALTER TABLE passkey_credentials ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can manage their own passkeys" ON passkey_credentials
--   FOR ALL USING (auth.uid() = user_id);

COMMENT ON TABLE passkey_credentials IS '管理者等のWebAuthn Passkey（FIDO2生体認証）認証情報';
COMMENT ON COLUMN profiles.passkey_required IS '管理者等のログイン時にPasskey生体認証を必須とするかどうかのフラグ';

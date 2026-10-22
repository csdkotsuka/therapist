// ========================================================
// サーバー専用: service_role クライアントと呼び出しユーザーの認証
// ※ Route Handler からのみ import すること（クライアントコンポーネントから import 禁止）
// ========================================================
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export class ConfigError extends Error {}

/** service_role キーでの Supabase クライアント（RLS をバイパスするためサーバー内部でのみ使用） */
export function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new ConfigError('サーバー環境変数 SUPABASE_SERVICE_ROLE_KEY が設定されていません。');
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export interface AuthedUser {
  id: string;
  role: 'admin' | 'therapist' | 'customer' | null;
  email: string | null;
  name: string | null;
}

/**
 * Authorization: Bearer <Supabase access token> を検証し、profiles.role とともに返す。
 * トークンなし・無効なら null。
 */
export async function authenticate(req: Request): Promise<AuthedUser | null> {
  const header = req.headers.get('authorization') ?? '';
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  if (!token) return null;

  const svc = getServiceClient();
  const { data, error } = await svc.auth.getUser(token);
  if (error || !data.user) return null;

  const { data: profile } = await svc
    .from('profiles')
    .select('role,name,email')
    .eq('id', data.user.id)
    .maybeSingle();

  return {
    id: data.user.id,
    role: (profile?.role as AuthedUser['role']) ?? null,
    email: (profile?.email as string | null) ?? data.user.email ?? null,
    name: (profile?.name as string | null) ?? null,
  };
}

/** 公開URLのオリジン（Stripe のリダイレクト先に使用） */
export function siteOrigin(req: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');
  return new URL(req.url).origin;
}

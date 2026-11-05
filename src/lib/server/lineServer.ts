// ========================================================
// サーバー専用: LINE ログイン
//   - 環境変数の解決
//   - ID トークンの検証（LINE の verify API）
//   - LINE ユーザーに対応する Supabase ユーザーの作成・ログイン用ワンタイムトークン発行
// ========================================================
import 'server-only';
import { getServiceClient } from './supabaseAdmin';

/** LINE OAuth の state / nonce を保持する httpOnly Cookie 名 */
export const LINE_OAUTH_COOKIE = 'line_oauth';

export interface ResolvedLineConfig {
  liffId: string;
  channelId: string;
  channelSecret: string;
  channelAccessToken: string;
}

export function getEffectiveLineConfig(): ResolvedLineConfig {
  const env = (key: string) => (process.env[key] ?? '').trim();
  return {
    liffId: env('NEXT_PUBLIC_LIFF_ID'),
    channelId: env('NEXT_PUBLIC_LINE_CHANNEL_ID'),
    channelSecret: env('LINE_CHANNEL_SECRET'),
    channelAccessToken: env('LINE_CHANNEL_ACCESS_TOKEN'),
  };
}

export interface VerifiedLineUser {
  sub: string; // LINE userId
  name: string;
  picture?: string;
}

/** LINE の ID トークンを検証し、本人の userId・表示名を返す。nonce を渡した場合は一致も確認される。 */
export async function verifyLineIdToken(idToken: string, nonce?: string): Promise<VerifiedLineUser | null> {
  const { channelId } = getEffectiveLineConfig();
  if (!channelId || !idToken) return null;

  const body = new URLSearchParams({ id_token: idToken, client_id: channelId });
  if (nonce) body.set('nonce', nonce);

  const res = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { sub?: string; name?: string; picture?: string; aud?: string };
  if (!json.sub || json.aud !== channelId) return null;
  return { sub: json.sub, name: json.name || 'LINEユーザー', picture: json.picture };
}

/** 新規登録時に選べる役割（管理者は不可） */
export type SignupRole = 'customer' | 'therapist';

export function toSignupRole(value: unknown): SignupRole {
  return value === 'therapist' ? 'therapist' : 'customer';
}

/**
 * LINE ユーザーに対応する Supabase ユーザーを取得（なければ作成）し、
 * ログイン用ワンタイムトークン（hashed_token）を返す。
 * 呼び出し側は /auth/callback?token_hash=...&type=magiclink へリダイレクトしてセッションを確立する。
 */
export async function issueLineLoginToken(line: VerifiedLineUser, role: SignupRole): Promise<string> {
  const svc = getServiceClient();

  const { data: existing, error: findErr } = await svc
    .from('profiles')
    .select('id')
    .eq('line_user_id', line.sub)
    .maybeSingle();
  if (findErr) throw findErr;

  let email: string;
  if (existing) {
    const { data, error } = await svc.auth.admin.getUserById(existing.id as string);
    if (error || !data.user?.email) throw error ?? new Error('LINE linked user has no email');
    if (data.user.app_metadata?.line_user_id !== line.sub) throw new Error('LINE link mismatch');
    email = data.user.email;
  } else {
    // LINE ではメールアドレスを取得しないため、ログイン専用の内部アドレスを割り当てる。
    // LINE ID は利用者が書き換えられない app_metadata にのみ保存する（user_metadata は signUp で誰でも設定できる）。
    email = `line_${line.sub.toLowerCase()}@line.carekuru.invalid`;
    const { error } = await svc.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { name: line.name, avatar_url: line.picture, role },
      app_metadata: { provider: 'line', line_user_id: line.sub },
    });
    if (error) {
      if (!/already/i.test(error.message)) throw error;
      // 同じ内部アドレスが既にある場合は、それが本当にこの LINE ユーザーのものかを確認する
      // （第三者が事前にこのアドレスでメール登録して乗っ取る手口を防ぐ）
      const { data: prof } = await svc.from('profiles').select('id').eq('email', email).maybeSingle();
      const { data: owner } = prof ? await svc.auth.admin.getUserById(prof.id as string) : { data: null };
      if (owner?.user?.app_metadata?.line_user_id !== line.sub) throw new Error('LINE login address is taken by another account');
    }
  }

  const { data: link, error: linkErr } = await svc.auth.admin.generateLink({ type: 'magiclink', email });
  if (linkErr || !link.properties?.hashed_token) throw linkErr ?? new Error('failed to issue login token');
  return link.properties.hashed_token;
}

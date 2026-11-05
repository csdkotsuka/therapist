/**
 * LINE（LIFF）クライアント側ユーティリティ
 * 身元の確認はすべてサーバーで行う。クライアントは LIFF の ID トークンをサーバーへ渡すだけ。
 */
import type { UserRole } from '@/types';

export interface LineConfig {
  liffId: string;
  channelId: string;
  isConfigured: boolean;
}

export function getLineConfig(): LineConfig {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '';
  const channelId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID || '';
  return { liffId, channelId, isConfigured: Boolean(channelId) };
}

/** LINE ログイン（Web）の開始 URL */
export function lineLoginUrl(role: UserRole, redirect: string): string {
  const params = new URLSearchParams({ role: role === 'therapist' ? 'therapist' : 'customer', redirect });
  return `/api/auth/line/login?${params.toString()}`;
}

/**
 * LINE アプリ内（LIFF）で開かれ、すでに LINE ログイン済みなら ID トークンを返す。
 * それ以外（通常のブラウザ・LIFF 未設定）は null。
 */
export async function getLiffIdToken(): Promise<string | null> {
  const { liffId } = getLineConfig();
  if (typeof window === 'undefined' || !liffId) return null;
  try {
    const { default: liff } = await import('@line/liff');
    await liff.init({ liffId });
    if (!liff.isInClient() || !liff.isLoggedIn()) return null;
    return liff.getIDToken();
  } catch {
    console.warn('[LINE] LIFF initialization failed');
    return null;
  }
}

/** LIFF の ID トークンでサーバーにログインし、セッション確立用の遷移先 URL を受け取る */
export async function signInWithLiffToken(idToken: string, role: UserRole, redirect: string): Promise<string> {
  const res = await fetch('/api/auth/line/liff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, role, redirect }),
  });
  const json = (await res.json().catch(() => ({}))) as { redirect?: string; message?: string };
  if (!res.ok || !json.redirect) throw new Error(json.message || 'LINE ログインに失敗しました。');
  return json.redirect;
}

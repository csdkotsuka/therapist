import { NextResponse } from 'next/server';
import { getEffectiveLineConfig, LINE_OAUTH_COOKIE, toSignupRole } from '@/lib/server/lineServer';
import { safeRedirectPath } from '@/lib/redirect';

export const dynamic = 'force-dynamic';

function randomToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// LINE ログイン開始: state / nonce を httpOnly Cookie に保存して LINE の認可画面へ
export async function GET(req: Request) {
  const url = new URL(req.url);
  const role = toSignupRole(url.searchParams.get('role'));
  const redirect = safeRedirectPath(url.searchParams.get('redirect'));
  const { channelId } = getEffectiveLineConfig();

  if (!channelId) {
    return NextResponse.redirect(new URL('/login?error=LINE_NOT_CONFIGURED', url.origin));
  }

  const state = randomToken();
  const nonce = randomToken();
  const authorize = new URL('https://access.line.me/oauth2/v2.1/authorize');
  authorize.searchParams.set('response_type', 'code');
  authorize.searchParams.set('client_id', channelId);
  authorize.searchParams.set('redirect_uri', `${url.origin}/api/auth/line/callback`);
  authorize.searchParams.set('state', state);
  authorize.searchParams.set('nonce', nonce);
  authorize.searchParams.set('scope', 'profile openid');

  const res = NextResponse.redirect(authorize);
  res.cookies.set(LINE_OAUTH_COOKIE, JSON.stringify({ state, nonce, role, redirect }), {
    httpOnly: true,
    secure: url.protocol === 'https:',
    sameSite: 'lax',
    path: '/api/auth/line',
    maxAge: 600,
  });
  return res;
}

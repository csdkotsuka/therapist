import { NextResponse, type NextRequest } from 'next/server';
import {
  getEffectiveLineConfig,
  issueLineLoginToken,
  LINE_OAUTH_COOKIE,
  toSignupRole,
  verifyLineIdToken,
} from '@/lib/server/lineServer';
import { ConfigError } from '@/lib/server/supabaseAdmin';
import { safeRedirectPath } from '@/lib/redirect';

export const dynamic = 'force-dynamic';

interface OAuthCookie {
  state?: string;
  nonce?: string;
  role?: string;
  redirect?: string;
}

function fail(origin: string, code: string) {
  const res = NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(code)}`, origin));
  res.cookies.delete({ name: LINE_OAUTH_COOKIE, path: '/api/auth/line' });
  return res;
}

// LINE ログインの戻り先: state 照合 → コード交換 → ID トークン検証（nonce 照合）→ Supabase セッション発行
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (url.searchParams.get('error') || !code || !state) return fail(url.origin, 'AUTH_CANCELLED');

  let saved: OAuthCookie = {};
  try {
    const raw = req.cookies.get(LINE_OAUTH_COOKIE)?.value;
    saved = raw ? (JSON.parse(raw) as OAuthCookie) : {};
  } catch {
    saved = {};
  }
  if (!saved.state || saved.state !== state || !saved.nonce) return fail(url.origin, 'INVALID_STATE');

  const { channelId, channelSecret } = getEffectiveLineConfig();
  if (!channelId || !channelSecret) return fail(url.origin, 'LINE_NOT_CONFIGURED');

  try {
    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${url.origin}/api/auth/line/callback`,
        client_id: channelId,
        client_secret: channelSecret,
      }),
    });
    if (!tokenRes.ok) return fail(url.origin, 'TOKEN_EXCHANGE_FAILED');
    const { id_token: idToken } = (await tokenRes.json()) as { id_token?: string };

    const line = idToken ? await verifyLineIdToken(idToken, saved.nonce) : null;
    if (!line) return fail(url.origin, 'ID_TOKEN_INVALID');

    const tokenHash = await issueLineLoginToken(line, toSignupRole(saved.role));
    const next = safeRedirectPath(saved.redirect);
    const target = new URL('/auth/callback', url.origin);
    target.searchParams.set('token_hash', tokenHash);
    target.searchParams.set('type', 'magiclink');
    target.searchParams.set('next', next);

    const res = NextResponse.redirect(target);
    res.cookies.delete({ name: LINE_OAUTH_COOKIE, path: '/api/auth/line' });
    return res;
  } catch (err) {
    if (err instanceof ConfigError) return fail(url.origin, 'SERVER_NOT_CONFIGURED');
    console.error('[LINE callback] failed', err instanceof Error ? err.message : err);
    return fail(url.origin, 'SERVER_ERROR');
  }
}

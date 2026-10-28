import { NextResponse } from 'next/server';
import { getEffectiveLineConfig } from '@/lib/server/lineServer';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const stateStr = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${url.origin}/login?error=${encodeURIComponent(error || 'AUTH_CANCELLED')}`);
  }

  let role = 'customer';
  let redirectTarget = '/';
  if (stateStr) {
    try {
      const stateObj = JSON.parse(Buffer.from(stateStr, 'base64').toString('utf-8'));
      if (stateObj.role) role = stateObj.role;
      if (stateObj.redirect) redirectTarget = stateObj.redirect;
    } catch (e) {
      // ignore
    }
  }

  const { channelId, channelSecret } = getEffectiveLineConfig();
  const callbackUrl = `${url.origin}/api/auth/line/callback`;

  try {
    // 1. アクセストークンを取得
    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: callbackUrl,
        client_id: channelId,
        client_secret: channelSecret,
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error('[LINE Token Error]', errBody);
      return NextResponse.redirect(`${url.origin}/login?error=TOKEN_EXCHANGE_FAILED`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. プロフィール情報を取得
    const profileRes = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!profileRes.ok) {
      return NextResponse.redirect(`${url.origin}/login?error=PROFILE_FETCH_FAILED`);
    }

    const profile = await profileRes.json();

    // 3. ログイン画面へリダイレクトし、クライアント側でアカウント作成・ログイン完了させる
    const returnUrl = new URL(`${url.origin}/login`);
    returnUrl.searchParams.set('line_auth_success', '1');
    returnUrl.searchParams.set('line_uid', profile.userId);
    returnUrl.searchParams.set('line_name', profile.displayName);
    if (profile.pictureUrl) {
      returnUrl.searchParams.set('line_avatar', profile.pictureUrl);
    }
    returnUrl.searchParams.set('role', role);
    returnUrl.searchParams.set('redirect', redirectTarget);

    return NextResponse.redirect(returnUrl.toString());
  } catch (err: any) {
    console.error('[LINE Callback Error]', err);
    return NextResponse.redirect(`${url.origin}/login?error=SERVER_ERROR`);
  }
}

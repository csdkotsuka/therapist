import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const role = url.searchParams.get('role') || 'customer';
  const redirect = url.searchParams.get('redirect') || '/';

  // サーバーサイド環境変数から取得
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || process.env.LIFF_ID || '';
  const channelId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID || process.env.LINE_CHANNEL_ID || '';

  // 1. LIFF ID がある場合: LIFF URL へリダイレクト
  if (liffId) {
    return NextResponse.redirect(`https://liff.line.me/${liffId}`);
  }

  // 2. Channel ID がある場合: LINE Login OAuth へリダイレクト
  if (channelId) {
    const callbackUrl = `${url.origin}/api/auth/line/callback`;
    const state = Buffer.from(JSON.stringify({ role, redirect, ts: Date.now() })).toString('base64');
    const scope = encodeURIComponent('profile openid');
    const redirectEncoded = encodeURIComponent(callbackUrl);
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${redirectEncoded}&state=${state}&scope=${scope}`;
    return NextResponse.redirect(lineAuthUrl);
  }

  // 設定されていない場合はエラーパラメータつきでログイン画面へ戻す
  return NextResponse.redirect(`${url.origin}/login?error=LINE_NOT_CONFIGURED`);
}

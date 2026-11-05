import { NextResponse } from 'next/server';
import { issueLineLoginToken, toSignupRole, verifyLineIdToken } from '@/lib/server/lineServer';
import { ConfigError } from '@/lib/server/supabaseAdmin';
import { safeRedirectPath } from '@/lib/redirect';

export const dynamic = 'force-dynamic';

// LINE アプリ内（LIFF）からのログイン: liff.getIDToken() の ID トークンをサーバーで検証してセッションを発行
export async function POST(req: Request) {
  // 他サイトからのフォーム送信等を拒否（同一オリジンの fetch のみ受け付ける）
  const origin = req.headers.get('origin');
  if (!origin || origin !== new URL(req.url).origin || !req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ message: '不正なリクエストです。' }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as { idToken?: string; role?: string; redirect?: string };
  if (!body.idToken) return NextResponse.json({ message: 'idToken が必要です。' }, { status: 400 });

  try {
    const line = await verifyLineIdToken(body.idToken);
    if (!line) return NextResponse.json({ message: 'LINE の認証情報を確認できませんでした。' }, { status: 401 });

    const tokenHash = await issueLineLoginToken(line, toSignupRole(body.role));
    const params = new URLSearchParams({
      token_hash: tokenHash,
      type: 'magiclink',
      next: safeRedirectPath(body.redirect),
    });
    return NextResponse.json({ redirect: `/auth/callback?${params.toString()}` });
  } catch (err) {
    if (err instanceof ConfigError) return NextResponse.json({ message: err.message }, { status: 501 });
    console.error('[LINE LIFF] failed', err instanceof Error ? err.message : err);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}

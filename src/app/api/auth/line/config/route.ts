import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // サーバーサイド環境変数（Cloudflare Workers のランタイム環境変数）を取得
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || process.env.LIFF_ID || '';
  const channelId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID || process.env.LINE_CHANNEL_ID || '';

  return NextResponse.json({
    liffId,
    channelId,
    isConfigured: Boolean(liffId || channelId),
  });
}

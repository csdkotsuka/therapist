import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const g = globalThis as any;
  const p = (typeof process !== 'undefined' ? process.env : {}) as Record<string, string | undefined>;

  const processKeys = Object.keys(p);
  const globalKeys = Object.keys(g).filter(k => k.includes('LINE') || k.includes('LIFF') || k.includes('CHANNEL'));

  const findVar = (...names: string[]) => {
    for (const name of names) {
      if (p[name]) return { foundIn: 'process.env', key: name, valLength: p[name]?.length };
      if (g[name]) return { foundIn: 'globalThis', key: name, valLength: String(g[name])?.length };
    }
    return null;
  };

  const liffInfo = findVar('NEXT_PUBLIC_LIFF_ID', 'LIFF_ID', 'liff_id', 'LIFE_ID', 'NEXT_PUBLIC_LIFE_ID', 'LINE_LIFF_ID');
  const channelIdInfo = findVar('NEXT_PUBLIC_LINE_CHANNEL_ID', 'LINE_CHANNEL_ID', 'CHANNEL_ID', 'channel_id', 'NEXT_PUBLIC_CHANNEL_ID');
  const secretInfo = findVar('LINE_CHANNEL_SECRET', 'CHANNEL_SECRET', 'channel_secret');

  const lineRelatedKeys = processKeys.filter(k => 
    k.toUpperCase().includes('LINE') || 
    k.toUpperCase().includes('LIFF') || 
    k.toUpperCase().includes('CHANNEL') ||
    k.toUpperCase().includes('LIFE')
  );

  return NextResponse.json({
    liffInfo,
    channelIdInfo,
    secretInfo,
    lineRelatedKeys,
    totalProcessKeysCount: processKeys.length,
    globalKeys,
  });
}

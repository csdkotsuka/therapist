import { NextResponse } from 'next/server';
import { getEffectiveLineConfig } from '@/lib/server/lineServer';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { liffId, channelId } = getEffectiveLineConfig(req);

  return NextResponse.json({
    liffId,
    channelId,
    isConfigured: Boolean(liffId || channelId),
  });
}

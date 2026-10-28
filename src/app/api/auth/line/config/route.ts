import { NextResponse } from 'next/server';
import { getEffectiveLineConfig } from '@/lib/server/lineServer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { liffId, channelId } = getEffectiveLineConfig();

  return NextResponse.json({
    liffId,
    channelId,
    isConfigured: Boolean(liffId || channelId),
  });
}

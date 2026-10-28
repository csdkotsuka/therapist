/**
 * サーバーサイド用 LINE 環境変数解決ユーティリティ
 * Cloudflare Workers (process.env / globalThis) の多様な命名揺れに対応
 */

export interface ResolvedLineConfig {
  liffId: string;
  channelId: string;
  channelSecret: string;
  channelAccessToken: string;
}

export function getEffectiveLineConfig(): ResolvedLineConfig {
  const g = globalThis as any;
  const p = typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>) : {};

  const find = (...keys: string[]): string => {
    for (const key of keys) {
      if (p[key] && typeof p[key] === 'string' && p[key]!.trim()) {
        return p[key]!.trim();
      }
      if (g[key] && typeof g[key] === 'string' && g[key].trim()) {
        return g[key].trim();
      }
    }
    return '';
  };

  const liffId = find(
    'NEXT_PUBLIC_LIFF_ID',
    'LIFF_ID',
    'liff_id',
    'LIFE_ID',
    'NEXT_PUBLIC_LIFE_ID',
    'LINE_LIFF_ID',
    'LINE_LIFE_ID'
  );

  const channelId = find(
    'NEXT_PUBLIC_LINE_CHANNEL_ID',
    'LINE_CHANNEL_ID',
    'CHANNEL_ID',
    'channel_id',
    'NEXT_PUBLIC_CHANNEL_ID',
    'LINE_ID'
  );

  const channelSecret = find(
    'LINE_CHANNEL_SECRET',
    'CHANNEL_SECRET',
    'channel_secret',
    'LINE_SECRET'
  );

  const channelAccessToken = find(
    'LINE_CHANNEL_ACCESS_TOKEN',
    'CHANNEL_ACCESS_TOKEN',
    'channel_access_token',
    'LINE_ACCESS_TOKEN',
    'LINE_TOKEN'
  );

  return {
    liffId,
    channelId,
    channelSecret,
    channelAccessToken,
  };
}

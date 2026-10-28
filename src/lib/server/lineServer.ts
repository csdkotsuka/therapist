/**
 * サーバーサイド用 LINE 環境変数解決ユーティリティ
 * Cloudflare Workers (process.env / globalThis / Request Cookies) の多様な命名揺れに対応
 */

export interface ResolvedLineConfig {
  liffId: string;
  channelId: string;
  channelSecret: string;
  channelAccessToken: string;
}

export function getEffectiveLineConfig(req?: Request): ResolvedLineConfig {
  const g = globalThis as any;
  const p = typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>) : {};

  // 1. process.env / globalThis から探索
  const findInEnv = (...keys: string[]): string => {
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

  let liffId = findInEnv(
    'NEXT_PUBLIC_LIFF_ID',
    'LIFF_ID',
    'liff_id',
    'LIFE_ID',
    'NEXT_PUBLIC_LIFE_ID',
    'LINE_LIFF_ID',
    'LINE_LIFE_ID'
  );

  let channelId = findInEnv(
    'NEXT_PUBLIC_LINE_CHANNEL_ID',
    'LINE_CHANNEL_ID',
    'CHANNEL_ID',
    'channel_id',
    'NEXT_PUBLIC_CHANNEL_ID',
    'LINE_ID'
  );

  let channelSecret = findInEnv(
    'LINE_CHANNEL_SECRET',
    'CHANNEL_SECRET',
    'channel_secret',
    'LINE_SECRET'
  );

  let channelAccessToken = findInEnv(
    'LINE_CHANNEL_ACCESS_TOKEN',
    'CHANNEL_ACCESS_TOKEN',
    'channel_access_token',
    'LINE_ACCESS_TOKEN',
    'LINE_TOKEN'
  );

  // 2. もし環境変数が空で、リクエストの Cookie にある場合は Cookie をフォールバックとして採用
  if (req && (!liffId || !channelId || !channelSecret)) {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [k, ...v] = c.trim().split('=');
        return [k, decodeURIComponent(v.join('='))];
      })
    );

    if (!liffId && cookies['line_liff_id']) {
      liffId = cookies['line_liff_id'];
    }
    if (!channelId && cookies['line_channel_id']) {
      channelId = cookies['line_channel_id'];
    }
    if (!channelSecret && cookies['line_channel_secret']) {
      channelSecret = cookies['line_channel_secret'];
    }
  }

  return {
    liffId,
    channelId,
    channelSecret,
    channelAccessToken,
  };
}

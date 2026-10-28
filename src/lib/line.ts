/**
 * LINE Official Account & LIFF (LINE Front-end Framework) 設定・認証ユーティリティ
 */
import liff from '@line/liff';

export interface LineUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface LineConfig {
  liffId: string;
  channelId: string;
  isConfigured: boolean;
}

/**
 * LINE設定情報を取得する（クライアントサイド静的判定）
 */
export function getLineConfig(): LineConfig {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '';
  const channelId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID || '';

  return {
    liffId,
    channelId,
    isConfigured: Boolean(liffId || channelId),
  };
}

/**
 * サーバーAPIから最新のLINE設定情報を取得する（Cloudflare Workers の実行時変数を反映）
 */
export async function fetchLineConfigFromServer(): Promise<LineConfig> {
  try {
    const res = await fetch('/api/auth/line/config', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return {
        liffId: data.liffId || '',
        channelId: data.channelId || '',
        isConfigured: Boolean(data.isConfigured),
      };
    }
  } catch (e) {
    console.warn('[LINE] Could not fetch server config:', e);
  }
  return getLineConfig();
}

let isLiffInitialized = false;

/**
 * LIFF SDKを初期化する
 */
export async function initializeLiff(overrideLiffId?: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (isLiffInitialized) return true;

  const liffId = overrideLiffId || process.env.NEXT_PUBLIC_LIFF_ID || '';
  if (!liffId) {
    return false;
  }

  try {
    await liff.init({ liffId });
    isLiffInitialized = true;
    return true;
  } catch (error) {
    console.error('[LINE] LIFF initialization failed:', error);
    return false;
  }
}

/**
 * ページロード時にすでにLIFFでログイン中かチェックし、プロファイルを取得する
 */
export async function checkLiffLoginStatus(): Promise<LineUserProfile | null> {
  if (typeof window === 'undefined') return null;
  const { liffId } = getLineConfig();
  if (!liffId) return null;

  try {
    const initialized = await initializeLiff();
    if (initialized && liff.isLoggedIn()) {
      const profile = await liff.getProfile();
      return {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage,
      };
    }
  } catch (e) {
    console.error('[LINE] Error checking LIFF status:', e);
  }
  return null;
}

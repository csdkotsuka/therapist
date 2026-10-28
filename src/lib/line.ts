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
  channelSecret?: string;
  isConfigured: boolean;
  source: 'env' | 'storage' | 'none';
}

const STORAGE_KEY_LIFF_ID = 'carekuru_line_liff_id';
const STORAGE_KEY_CHANNEL_ID = 'carekuru_line_channel_id';
const STORAGE_KEY_CHANNEL_SECRET = 'carekuru_line_channel_secret';

/**
 * ローカルストレージおよびCookieからLINE設定を取得
 */
export function getStoredLineConfig(): { liffId: string; channelId: string; channelSecret: string } {
  if (typeof window === 'undefined') {
    return { liffId: '', channelId: '', channelSecret: '' };
  }

  const liffId = localStorage.getItem(STORAGE_KEY_LIFF_ID) || '';
  const channelId = localStorage.getItem(STORAGE_KEY_CHANNEL_ID) || '';
  const channelSecret = localStorage.getItem(STORAGE_KEY_CHANNEL_SECRET) || '';

  return { liffId, channelId, channelSecret };
}

/**
 * ローカルストレージおよびCookieにLINE設定を保存（Cloudflare環境変数に依存しない確実な動作）
 */
export function saveLineConfigToStorage(liffId: string, channelId: string, channelSecret: string = '') {
  if (typeof window === 'undefined') return;

  if (liffId) {
    localStorage.setItem(STORAGE_KEY_LIFF_ID, liffId.trim());
    document.cookie = `line_liff_id=${encodeURIComponent(liffId.trim())}; path=/; max-age=31536000; SameSite=Lax`;
  } else {
    localStorage.removeItem(STORAGE_KEY_LIFF_ID);
    document.cookie = 'line_liff_id=; path=/; max-age=0';
  }

  if (channelId) {
    localStorage.setItem(STORAGE_KEY_CHANNEL_ID, channelId.trim());
    document.cookie = `line_channel_id=${encodeURIComponent(channelId.trim())}; path=/; max-age=31536000; SameSite=Lax`;
  } else {
    localStorage.removeItem(STORAGE_KEY_CHANNEL_ID);
    document.cookie = 'line_channel_id=; path=/; max-age=0';
  }

  if (channelSecret) {
    localStorage.setItem(STORAGE_KEY_CHANNEL_SECRET, channelSecret.trim());
    document.cookie = `line_channel_secret=${encodeURIComponent(channelSecret.trim())}; path=/; max-age=31536000; SameSite=Lax`;
  } else {
    localStorage.removeItem(STORAGE_KEY_CHANNEL_SECRET);
    document.cookie = 'line_channel_secret=; path=/; max-age=0';
  }
}

/**
 * LINE設定情報を取得する（環境変数 または ローカル保存）
 */
export function getLineConfig(): LineConfig {
  const envLiffId = process.env.NEXT_PUBLIC_LIFF_ID || '';
  const envChannelId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID || '';

  if (envLiffId || envChannelId) {
    return {
      liffId: envLiffId,
      channelId: envChannelId,
      isConfigured: true,
      source: 'env',
    };
  }

  const stored = getStoredLineConfig();
  if (stored.liffId || stored.channelId) {
    return {
      liffId: stored.liffId,
      channelId: stored.channelId,
      channelSecret: stored.channelSecret,
      isConfigured: true,
      source: 'storage',
    };
  }

  return {
    liffId: '',
    channelId: '',
    isConfigured: false,
    source: 'none',
  };
}

/**
 * サーバーAPIから最新のLINE設定情報を取得する
 */
export async function fetchLineConfigFromServer(): Promise<LineConfig> {
  try {
    const res = await fetch('/api/auth/line/config', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.liffId || data.channelId) {
        return {
          liffId: data.liffId || '',
          channelId: data.channelId || '',
          isConfigured: Boolean(data.isConfigured),
          source: 'env',
        };
      }
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

  const cfg = getLineConfig();
  const liffId = overrideLiffId || cfg.liffId;
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
  const cfg = getLineConfig();
  if (!cfg.liffId) return null;

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

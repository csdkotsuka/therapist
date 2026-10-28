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
 * LINE設定情報を取得する（クライアントサイドでアクセス可能）
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

let isLiffInitialized = false;

/**
 * LIFF SDKを初期化する
 */
export async function initializeLiff(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (isLiffInitialized) return true;

  const { liffId } = getLineConfig();
  if (!liffId) {
    console.warn('[LINE] LIFF ID is not configured in environment variables.');
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
 * 本物のLINEログインを実行する
 * - LIFF初期化済みなら liff.login() を実行
 * - LIFF ID のみある場合は https://liff.line.me/<LIFF_ID> へ遷移
 * - Channel ID がある場合は LINE Login OAuth へ遷移
 */
export async function triggerRealLineLogin(redirectUri?: string): Promise<{ success: boolean; profile?: LineUserProfile; error?: string }> {
  const { liffId, channelId } = getLineConfig();

  // 1. LIFF SDK による初期化＆ログイン試行
  if (liffId) {
    try {
      const initialized = await initializeLiff();
      if (initialized) {
        if (!liff.isLoggedIn()) {
          // LINE認証画面へリダイレクト
          liff.login({
            redirectUri: redirectUri || (typeof window !== 'undefined' ? window.location.href : undefined),
          });
          return { success: true };
        } else {
          // すでにLINEログイン済みの場合、プロファイルを取得
          const profile = await liff.getProfile();
          return {
            success: true,
            profile: {
              userId: profile.userId,
              displayName: profile.displayName,
              pictureUrl: profile.pictureUrl,
              statusMessage: profile.statusMessage,
            },
          };
        }
      } else {
        // LIFF URL へ直接リダイレクト
        if (typeof window !== 'undefined') {
          window.location.href = `https://liff.line.me/${liffId}`;
          return { success: true };
        }
      }
    } catch (e: any) {
      console.warn('[LINE] LIFF login failed, falling back:', e);
    }
  }

  // 2. LINE Login OAuth へのリダイレクト
  if (channelId && typeof window !== 'undefined') {
    const callbackUrl = redirectUri || window.location.origin + '/login';
    const state = Math.random().toString(36).substring(7);
    const scope = encodeURIComponent('profile openid');
    const redirect = encodeURIComponent(callbackUrl);
    window.location.href = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${redirect}&state=${state}&scope=${scope}`;
    return { success: true };
  }

  return {
    success: false,
    error: 'LINE_NOT_CONFIGURED',
  };
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

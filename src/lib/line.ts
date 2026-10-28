/**
 * LINE Official Account & LIFF (LINE Front-end Framework) 設定ユーティリティ
 */

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
    isConfigured: Boolean(liffId && channelId),
  };
}

/**
 * LINEログインURLを生成する（本番用OAuthフロー）
 */
export function getLineLoginUrl(redirectUri: string, state: string): string {
  const { channelId } = getLineConfig();
  if (!channelId) return '#';

  const scope = encodeURIComponent('profile openid email');
  const redirect = encodeURIComponent(redirectUri);
  return `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${redirect}&state=${state}&scope=${scope}`;
}

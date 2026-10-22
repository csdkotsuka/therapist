import { AppBrandConfig, AppBrandId } from '@/types';

export const APP_BRANDS: Record<AppBrandId, AppBrandConfig> = {
  carea_go: {
    id: 'carea_go',
    name: 'Carea Go',
    tagline: 'ON-DEMAND WELLNESS',
    description: 'オンデマンドでウェルネスを届ける、地域密着型ヘルスケア＆ボディケアプラットフォーム',
    logoUrl: '/branding/logo-carea-go.png',
    fullImageUrl: '/branding/carea-go.jpg',
    faviconUrl: '/branding/favicon-carea-go.png',
    themeColor: '#1d6f42',
    accentColor: '#2b82b8',
  },
  care_go: {
    id: 'care_go',
    name: 'Care Go',
    tagline: 'WELLNESS DELIVERY',
    description: 'ハートと矢印が導く、安心と信頼のウェルネスデリバリーサービス',
    logoUrl: '/branding/logo-care-go.png',
    fullImageUrl: '/branding/care-go.jpg',
    faviconUrl: '/branding/favicon-care-go.png',
    themeColor: '#104f55',
    accentColor: '#e04f26',
  },
  thera_go: {
    id: 'thera_go',
    name: 'Thera Go',
    tagline: 'THERAPIST ON DEMAND',
    description: 'プロのセラピストをいつでもどこでも呼べるオンデマンド出張・来店サービス',
    logoUrl: '/branding/logo-thera-go.png',
    fullImageUrl: '/branding/thera-go.jpg',
    faviconUrl: '/branding/favicon-thera-go.png',
    themeColor: '#789262',
    accentColor: '#e59a38',
  },
};

export const DEFAULT_BRAND_ID: AppBrandId = 'carea_go';

/**
 * ブラウザのタイトルおよびファビコンを現在のブランド設定に合わせて動的に更新する
 */
export function updateDocumentBranding(brand: AppBrandConfig) {
  if (typeof window === 'undefined') return;

  // 1. タイトル更新
  document.title = `${brand.name} - ${brand.tagline} | 出張・店舗ヘルスケア＆ボディケア`;

  // 2. ファビコン動的更新 (link[rel="icon"])
  let iconLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (iconLink) {
    iconLink.href = brand.faviconUrl + '?v=' + brand.id;
  } else {
    iconLink = document.createElement('link');
    iconLink.rel = 'icon';
    iconLink.href = brand.faviconUrl + '?v=' + brand.id;
    document.head.appendChild(iconLink);
  }

  // 3. Apple Touch Icon も更新
  let appleIcon = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
  if (appleIcon) {
    appleIcon.href = brand.faviconUrl + '?v=' + brand.id;
  } else {
    appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    appleIcon.href = brand.faviconUrl + '?v=' + brand.id;
    document.head.appendChild(appleIcon);
  }
}

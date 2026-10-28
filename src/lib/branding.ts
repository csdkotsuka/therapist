import { AppBrandConfig, AppBrandId } from '@/types';

// ========================================================
// シンボルマーク (アイコン部分だけ) の SVG 定義
// ※ ファビコンやヘッダー用アイコンとして、極小サイズでも視認性抜群のベクター描画
// ========================================================

/** 公式決定ブランド: CareKuru - エメラルド＆スカイブルーの「C」×「K」× 新緑・躍動シンボル */
export const ICON_CARE_KURU = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="ck_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="ck_accent" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="#f0fdf4" />
  <!-- 外側のCアーチ（包み込むケア・安心感） -->
  <path d="M 68 24 A 32 32 0 1 0 68 76" fill="none" stroke="url(#ck_grad)" stroke-width="11" stroke-linecap="round" />
  <!-- 中央のK（やってくる・駆けつける躍動のアーム） -->
  <path d="M 44 48 L 68 28" fill="none" stroke="url(#ck_accent)" stroke-width="9" stroke-linecap="round" />
  <path d="M 50 44 L 70 70" fill="none" stroke="url(#ck_grad)" stroke-width="9" stroke-linecap="round" />
  <!-- 頂点の新芽・ウェルネスの光 -->
  <circle cx="50" cy="22" r="6" fill="url(#ck_accent)" />
</svg>`;

/** 画像1-②: ケアゴー CARE GO (ブルーの「C」× 人型 × 若葉) */
export const ICON_CARE_GO_BLUE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="cg_blue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
    <linearGradient id="cg_green" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4ade80" />
      <stop offset="100%" stop-color="#16a34a" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="#f0f9ff" />
  <!-- 外側のCアーチ -->
  <path d="M 66 22 A 35 35 0 1 0 66 78" fill="none" stroke="url(#cg_blue)" stroke-width="11" stroke-linecap="round" />
  <!-- 人の頭部 -->
  <circle cx="50" cy="40" r="7.5" fill="url(#cg_blue)" />
  <!-- 人の身体（カーブ） -->
  <path d="M 50 51 C 50 63 43 71 36 75" fill="none" stroke="url(#cg_blue)" stroke-width="8" stroke-linecap="round" />
  <!-- 右上の新芽・若葉 -->
  <path d="M 53 43 C 65 33 79 28 84 32 C 84 44 73 57 59 52 Z" fill="url(#cg_green)" />
</svg>`;

/** 画像1-⑬: ケアリアゴー CAREARIA GO (新芽・若葉が人を包み込むシンボル) */
export const ICON_CAREARIA_GO_GREEN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="cag_g1" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#34d399" />
    </linearGradient>
    <linearGradient id="cag_g2" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
    <linearGradient id="cag_head" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="#ecfdf5" />
  <!-- 中央の人頭（芽生えの頂点） -->
  <circle cx="50" cy="28" r="8" fill="url(#cag_head)" />
  <!-- 左側の若葉（包み込む手） -->
  <path d="M 48 84 C 44 65 31 52 26 38 C 24 55 33 75 48 84 Z" fill="url(#cag_g1)" />
  <!-- 右側の若葉（すっきりと伸びる葉） -->
  <path d="M 52 84 C 56 65 69 50 74 36 C 76 55 65 77 52 84 Z" fill="url(#cag_g2)" />
</svg>`;

/** 画像2-⑩: ケアリアゴー CAREIA GO (ピンクのオープンハート × ゴールドリーフ) */
export const ICON_CAREIA_GO_PINK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="cip_pink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb7185" />
      <stop offset="100%" stop-color="#e11d48" />
    </linearGradient>
    <linearGradient id="cip_gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="#fff1f2" />
  <!-- 流麗なハートリボン（一筆書き風） -->
  <path d="M 50 72 C 20 52 14 36 24 24 C 34 14 47 24 50 32 C 53 24 66 14 76 24 C 86 36 80 52 50 72 Z" fill="none" stroke="url(#cip_pink)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
  <!-- 右下のオリーブ・ゴールドリーフ枝 -->
  <path d="M 50 72 C 60 74 72 78 82 80" stroke="url(#cip_gold)" stroke-width="3" stroke-linecap="round" fill="none" />
  <path d="M 64 73 C 68 67 75 69 75 74 C 70 76 66 75 64 73 Z" fill="url(#cip_gold)" />
  <path d="M 73 75 C 80 71 86 73 86 78 C 82 80 77 78 73 75 Z" fill="url(#cip_gold)" />
</svg>`;

/** 画像2-⑫: セラリンク THERALINK (パステルフローラルリース・つながる環) */
export const ICON_THERALINK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="tl_emerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="tl_pink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f472b6" />
      <stop offset="100%" stop-color="#db2777" />
    </linearGradient>
    <linearGradient id="tl_gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="#faf5ff" />
  <!-- 左上のエメラルド葉 -->
  <path d="M 39 23 C 28 25 21 37 23 49 C 29 47 41 36 39 23 Z" fill="url(#tl_emerald)" />
  <!-- 左下のグリーン葉 -->
  <path d="M 25 55 C 23 69 33 79 45 81 C 45 73 37 61 25 55 Z" fill="url(#tl_emerald)" />
  <!-- 右上のピンク花びら -->
  <path d="M 61 23 C 72 25 79 37 77 49 C 71 47 59 36 61 23 Z" fill="url(#tl_pink)" />
  <!-- 右下のゴールド葉 -->
  <path d="M 75 55 C 77 69 67 79 55 81 C 55 73 63 61 75 55 Z" fill="url(#tl_gold)" />
  <!-- トップの輝く芽 -->
  <circle cx="50" cy="18" r="4" fill="url(#tl_pink)" />
</svg>`;

/** 既存互換: Carea Go */
export const ICON_CAREA_GO_CLASSIC = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="cgc_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d6f42" />
      <stop offset="100%" stop-color="#2b82b8" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="#ecfdf5" />
  <circle cx="50" cy="50" r="32" fill="none" stroke="url(#cgc_grad)" stroke-width="8" />
  <path d="M 35 50 L 46 61 L 65 39" fill="none" stroke="url(#cgc_grad)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

/** 既存互換: Thera Go */
export const ICON_THERA_GO_CLASSIC = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="tgc_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#789262" />
      <stop offset="100%" stop-color="#e59a38" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="#fefce8" />
  <path d="M 50 20 C 35 38 25 55 35 75 C 45 90 55 90 65 75 C 75 55 65 38 50 20 Z" fill="url(#tgc_grad)" />
  <path d="M 50 30 L 50 78" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
</svg>`;

// ========================================================
// ブランド設定マスター
// ========================================================

export const APP_BRANDS: Record<AppBrandId, AppBrandConfig> = {
  // ★ 現在採用中ブランド: CareKuru
  care_kuru: {
    id: 'care_kuru',
    name: 'CareKuru',
    japaneseName: 'CareKuru',
    tagline: 'CareKuru',
    catchphrase: 'プロがあなたの元へ届く。出張・店舗ヘルスケア＆ボディケア',
    description: '理学療法士・セラピスト・トレーナーがあなたの元へ届くオンデマンドマッチングプラットフォーム',
    themeColor: '#059669',
    accentColor: '#0284c7',
    iconUrl: '/branding/icon_carearia_symbol.png',
    logoUrl: '/branding/icon_carearia_symbol.png',
    iconSvg: ICON_CARE_KURU,
  },

  // ① 画像1-②: ケアゴー CARE GO
  care_go_blue: {
    id: 'care_go_blue',
    name: 'Care Go',
    japaneseName: 'ケアゴー',
    tagline: 'CARE GO',
    catchphrase: 'その一歩が、もっとキレイな未来をつくる。',
    description: '青い「C」と人型、そして新緑の若葉が躍動する、前向きなヘルスケア＆ビューティーシンボル',
    themeColor: '#0284c7',
    accentColor: '#16a34a',
    iconUrl: '/branding/icon_care_go_symbol.png',
    logoUrl: '/branding/icon_care_go_symbol.png',
    iconSvg: ICON_CARE_GO_BLUE,
  },

  // ② 画像1-⑬: ケアリアゴー CAREARIA GO (提供画像の赤枠ロゴからトリミング)
  carearia_go_green: {
    id: 'carearia_go_green',
    name: 'Carearia Go',
    japaneseName: 'ケアリアゴー',
    tagline: 'CAREARIA GO',
    catchphrase: 'あなたの「したい」叶える場所。',
    description: '中央の人を両側のフレッシュな若葉が包み込む、自立と成長・優しさを体現したシンボル',
    themeColor: '#059669',
    accentColor: '#10b981',
    iconUrl: '/branding/icon_carearia_symbol.png',
    logoUrl: '/branding/icon_carearia_symbol.png',
    iconSvg: ICON_CAREARIA_GO_GREEN,
  },

  // ③ 画像2-⑩: ケアリアゴー CAREIA GO (ピンクハート×ゴールドリーフ)
  careia_go_pink: {
    id: 'careia_go_pink',
    name: 'Careia Go',
    japaneseName: 'ケアリアゴー',
    tagline: 'CAREIA GO',
    catchphrase: 'あなたのキレイと健康をプロの手で。',
    description: '優美なオープンハートのリボンと右下に輝くゴールドリーフが織りなす上質なプロフェッショナルシンボル',
    themeColor: '#e11d48',
    accentColor: '#f59e0b',
    iconUrl: '/branding/icon_careia_pink_symbol.png',
    logoUrl: '/branding/icon_careia_pink_symbol.png',
    iconSvg: ICON_CAREIA_GO_PINK,
  },

  // ④ 画像2-⑫: セラリンク THERALINK (提供画像の赤枠ロゴからトリミング)
  theralink: {
    id: 'theralink',
    name: 'Theralink',
    japaneseName: 'セラリンク',
    tagline: 'THERALINK',
    catchphrase: '内側から輝く、本当の美しさを。',
    description: 'エメラルド・ローズ・ゴールドの花びらと若葉がつながる、オーガニックなリース（環）シンボル',
    themeColor: '#059669',
    accentColor: '#db2777',
    iconUrl: '/branding/icon_theralink_symbol.png',
    logoUrl: '/branding/icon_theralink_symbol.png',
    iconSvg: ICON_THERALINK,
  },

  // 互換性: care_go (care_go_blueと同じ)
  care_go: {
    id: 'care_go',
    name: 'Care Go',
    japaneseName: 'ケアゴー',
    tagline: 'CARE GO',
    catchphrase: 'その一歩が、もっとキレイな未来をつくる。',
    description: '青い「C」と人型、そして新緑の若葉が躍動する、前向きなヘルスケア＆ビューティーシンボル',
    themeColor: '#0284c7',
    accentColor: '#16a34a',
    iconSvg: ICON_CARE_GO_BLUE,
  },

  // 互換性: carea_go
  carea_go: {
    id: 'carea_go',
    name: 'Carea Go',
    japaneseName: 'ケアリアゴー',
    tagline: 'CAREA GO',
    catchphrase: 'オンデマンドでウェルネスを届ける、地域密着型ヘルスケア＆ボディケアプラットフォーム',
    description: '地域密着型オンデマンドヘルスケア＆ボディケアプラットフォーム',
    themeColor: '#1d6f42',
    accentColor: '#2b82b8',
    iconSvg: ICON_CAREA_GO_CLASSIC,
  },

  // 互換性: thera_go
  thera_go: {
    id: 'thera_go',
    name: 'Thera Go',
    japaneseName: 'セラゴー',
    tagline: 'THERA GO',
    catchphrase: 'プロのセラピストをいつでもどこでも呼べるオンデマンド出張・来店サービス',
    description: 'プロのセラピストをいつでもどこでも呼べるオンデマンド出張・来店サービス',
    themeColor: '#789262',
    accentColor: '#e59a38',
    iconSvg: ICON_THERA_GO_CLASSIC,
  },
};

export const DEFAULT_BRAND_ID: AppBrandId = 'care_kuru';

// ========================================================
// アプリ名称の候補一覧（複数パターンから選択可能）
// ========================================================
export interface AppNameCandidate {
  id: string;
  name: string;
  japaneseName: string;
  tagline: string;
  catchphrase: string;
  description: string;
  badge: string;
}

export const AVAILABLE_NAME_CANDIDATES: AppNameCandidate[] = [
  {
    id: 'care_kuru',
    name: 'CareKuru',
    japaneseName: 'CareKuru',
    tagline: 'CareKuru',
    catchphrase: 'プロがあなたの元へ届く。出張・店舗ヘルスケア＆ボディケア',
    description: '理学療法士・セラピスト・トレーナーがあなたの元へ届くオンデマンドマッチングプラットフォーム（現状採用中）',
    badge: '現在採用中',
  },
  {
    id: 'carearia_go',
    name: 'Carearia Go',
    japaneseName: 'ケアリアゴー',
    tagline: 'CAREARIA GO',
    catchphrase: 'あなたの「したい」叶える場所。',
    description: 'ケア（支援）とエリア（地域）を繋ぐ、自立支援と優しさを体現した候補名称',
    badge: '候補名称',
  },
  {
    id: 'theralink',
    name: 'Theralink',
    japaneseName: 'セラリンク',
    tagline: 'THERALINK',
    catchphrase: '内側から輝く、本当の美しさを。',
    description: 'セラピストと顧客の絆をリンク（繋ぐ）するオーガニック＆信頼感のある候補名称',
    badge: '候補名称',
  },
  {
    id: 'care_go',
    name: 'Care Go',
    japaneseName: 'ケアゴー',
    tagline: 'CARE GO',
    catchphrase: 'その一歩が、もっとキレイな未来をつくる。',
    description: 'シンプルで前向きなアクション（Go）を想起させるアクティブな候補名称',
    badge: '候補名称',
  },
  {
    id: 'careia_go',
    name: 'Careia Go',
    japaneseName: 'ケアリア',
    tagline: 'CAREIA GO',
    catchphrase: 'あなたのキレイと健康をプロの手で。',
    description: '親しみやすさと上質なホスピタリティを感じさせるフェミニン＆ウェルネス候補名称',
    badge: '候補名称',
  },
];

// 独立選択用: アプリアイコン（＝ファビコン・ヘッダー共通シンボルアイコン）一覧（URL完全重複なし）
export const AVAILABLE_ICONS = [
  {
    id: 'icon_care_kuru_symbol',
    label: 'CareKuru シンボル',
    url: '/branding/icon_carearia_symbol.png',
    badge: '現在採用中',
    themeColor: '#059669',
  },
  {
    id: 'icon_theralink_symbol',
    label: 'セラリンク リースシンボル',
    url: '/branding/icon_theralink_symbol.png',
    badge: '候補デザイン',
    themeColor: '#059669',
  },
  {
    id: 'icon_care_go_blue',
    label: 'ケアゴー ブルーC × 若葉',
    url: '/branding/icon_care_go_symbol.png',
    badge: '候補デザイン',
    themeColor: '#0284c7',
  },
  {
    id: 'icon_careia_pink',
    label: 'ケアリア ピンクハート × ゴールド',
    url: '/branding/icon_careia_pink_symbol.png',
    badge: '候補デザイン',
    themeColor: '#e11d48',
  },
];

// アプリアイコンとヘッダー用ブランドロゴは同一アイコンを使用
export const AVAILABLE_LOGOS = AVAILABLE_ICONS;

/**
 * ブラウザのタイトルおよびファビコンを現在のブランド設定に合わせて動的に更新する
 */
export function updateDocumentBranding(brand: AppBrandConfig) {
  if (typeof window === 'undefined') return;

  // 1. タイトル更新
  document.title = `${brand.name} - ${brand.catchphrase}`;

  // 2. ファビコン更新
  const faviconHref = brand.iconUrl || `data:image/svg+xml;utf8,${encodeURIComponent(brand.iconSvg)}`;
  const faviconType = brand.iconUrl ? 'image/png' : 'image/svg+xml';

  try {
    const existingIcons = document.querySelectorAll("link[rel*='icon']");
    existingIcons.forEach((el) => el.remove());
  } catch (e) {
    console.warn('Failed to clean existing icons', e);
  }

  const iconLink = document.createElement('link');
  iconLink.rel = 'icon';
  iconLink.type = faviconType;
  iconLink.href = faviconHref;
  document.head.appendChild(iconLink);

  const shortcutLink = document.createElement('link');
  shortcutLink.rel = 'shortcut icon';
  shortcutLink.type = faviconType;
  shortcutLink.href = faviconHref;
  document.head.appendChild(shortcutLink);

  const appleIcon = document.createElement('link');
  appleIcon.rel = 'apple-touch-icon';
  appleIcon.href = faviconHref;
  document.head.appendChild(appleIcon);
}

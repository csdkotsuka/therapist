'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  formatPrice,
  calculateDistanceKm,
  estimateTravelTimeMinutes,
  getCurrentGpsPosition,
  reverseGeocode,
} from '@/lib/geo';
import { BookingModal } from './BookingModal';
import { BookingChatModal } from '@/components/chat/BookingChatModal';
import { Booking } from '@/types';
import {
  Search,
  MapPin,
  Star,
  Clock,
  Home,
  Building,
  Map as MapIcon,
  List,
  LayoutGrid,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Shield,
  Tag,
  Check,
  Filter,
  BadgePercent,
  Calendar,
  MessageCircle,
  Bone,
  Hand,
  Flower2,
  Scale,
  Smile,
  Coins,
  Navigation,
  Activity,
  MessageSquare,
  Flame,
  Utensils,
  Baby,
  Eye,
} from 'lucide-react';

const RealLeafletMap = dynamic(
  () => import('./RealLeafletMap').then((m) => m.RealLeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] bg-slate-900 rounded-3xl animate-pulse flex items-center justify-center text-slate-400 text-xs font-bold border border-slate-800">
        地図を読み込み中...
      </div>
    ),
  }
);

type SortOption = 'recommended' | 'rating' | 'distance' | 'price_asc' | 'price_desc';

// ========================================================
// 直感的で分かりやすい専用ベクターアイコン群
// ========================================================

// 1. 医療・リハビリ専門職ジャンルアイコン (聴診器＆ハートパルス)
const StethoscopeCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3" />
    <path d="M9 12.5v3.5a4 4 0 0 0 8 0V11" />
    <circle cx="17" cy="10" r="2" />
    <path d="M3 3h3" />
    <path d="M12 3h3" />
  </svg>
);

// 2. リラクゼーション・ボディケアジャンルアイコン (手技＆癒やしの花)
const BodyCareGroupIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a4 4 0 0 1 4 4c0 3-4 6-4 6s-4-3-4-6a4 4 0 0 1 4-4z" />
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" />
    <path d="M6 14v-2a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6a7 7 0 0 0 7 7h3a7 7 0 0 0 7-7v-3" />
  </svg>
);

// 3. 東洋医学・訪問口腔ケアジャンルアイコン (温灸の炎＆ピカピカの歯)
const OrientalDentalGroupIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* 炎とお灸 */}
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    {/* 輝く歯のアクセント */}
    <path d="M16 4l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5z" fill="currentColor" />
  </svg>
);

// 4. 女性・子育て・栄養・アイケアジャンルアイコン (優しく包む母子ハート＆栄養)
const FamilyLifestyleGroupIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <circle cx="12" cy="10" r="2.5" />
    <path d="M10 14a2.5 2.5 0 0 0 4 0" />
  </svg>
);

// 理学療法・整体アイコン (直立骨格・関節アライメント)
const PhysicalTherapyCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="4" r="2.2" />
    <path d="M12 6.5v13.5" />
    <path d="M7.5 10.5l4.5-1.5 4.5 1.5" />
    <path d="M9 16l3-1.5 3 1.5" />
    <path d="M9 20l3-5 3 5" />
  </svg>
);

// 作業療法士アイコン (生活動作・手先の巧緻性と自立サポート)
const OccupationalTherapyCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* 手と生活動作 */}
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" />
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
    <path d="M6 14v-2a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6a7 7 0 0 0 7 7h3a7 7 0 0 0 7-7v-3a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2" />
    {/* 動作アシスト矢印 */}
    <path d="M19 3l2 2-2 2" />
  </svg>
);

// 言語聴覚士アイコン (ことば・発声・会話と嚥下ケア)
const SpeechTherapyCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* 会話吹き出し */}
    <path d="M21 14a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    {/* 発声の音波ライン */}
    <path d="M8 8h6" />
    <path d="M8 12h8" />
    <circle cx="16" cy="8" r="1" fill="currentColor" />
  </svg>
);

// もみほぐしアイコン (筋肉を深層からほぐす手技)
const MassageCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3" />
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v7" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);

// アロマ・リンパアイコン (天然精油の雫と優雅なリーフ)
const AromaCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2.5l5.5 5.8a7.8 7.8 0 1 1-11 0z" />
    <path d="M12 11.5c1.8-1.8 3.5-1 3.5 1.2s-2.2 3.3-3.5 3.3" />
    <circle cx="12" cy="16" r="1.5" fill="currentColor" />
  </svg>
);

// カイロ・骨盤アイコン (背骨と骨盤のアライメント矯正)
const ChiropracticCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="1.5 2" />
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="9" r="1.5" />
    <circle cx="12" cy="13" r="1.5" />
    <path d="M6 16c0-2.5 2.5-3.5 6-3.5s6 1 6 3.5c0 2.5-3 4-6 4s-6-1.5-6-4z" />
    <path d="M4 9h2.5" />
    <path d="M20 9h-2.5" />
  </svg>
);

// ヘッドスパアイコン (頭皮マッサージと快眠リフレッシュウェーブ)
const HeadSpaCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 10c0 4.5 3.1 8 7 8s7-3.5 7-8-3.1-8-7-8c-2 0-3.9.9-5.1 2.3" />
    <path d="M9.5 11c.8 0 1.5-.7 1.5-1.5" />
    <path d="M14.5 11c.8 0 1.5-.7 1.5-1.5" />
    <path d="M10 14.5c1 .8 3 .8 4 0" />
    <path d="M9 2a3 3 0 0 1 6 0" />
    <path d="M7 3.5a4 4 0 0 1 10 0" />
  </svg>
);

// 鍼灸アイコン (経穴の鍼とお灸の温熱)
const AcupunctureCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* 鍼 */}
    <path d="M5 3l13 13" />
    <path d="M3 1l4 4" />
    <circle cx="18" cy="16" r="1.8" fill="currentColor" />
    {/* 温灸の煙と熱 */}
    <path d="M15 4c0 2.5-2.5 3.5-2.5 5 0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5c0-1.8-2.5-2.7-2.5-5z" />
  </svg>
);

// 歯科衛生士アイコン (白く輝く健口トゥース)
const ToothCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2C8.5 2 6.5 4 6.5 8c0 3.5 1 5.5 1.8 9.5 1 4 2.2 4.5 3.7 4.5 1.2 0 1.5-1.5 1.5-4 0-1.5.5-2 1-2s1 .5 1 2c0 2.5.3 4 1.5 4 1.5 0 2.7-.5 3.7-4.5.8-4 1.8-6 1.8-9.5 0-4-2-6-5.5-6h-4z" />
    <path d="M9.5 6.5c1-1 3.5-1 4.5 0" />
    {/* 輝く星 */}
    <path d="M19 2l.7 1.5L21 4l-1.3.5L19 6l-.7-1.5L17 4l1.3-.5z" fill="currentColor" stroke="none" />
  </svg>
);

// 管理栄養士アイコン (フォーク＆スプーンと栄養バランス)
const DietitianCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* スプーン＆フォーク */}
    <path d="M18 2v20" />
    <path d="M21 2v6a3 3 0 0 1-3 3" />
    <path d="M4 2v6a3 3 0 0 0 3 3v11" />
    <path d="M4 2v4h6V2" />
    {/* フレッシュフルーツ */}
    <circle cx="12.5" cy="14" r="3" />
    <path d="M12.5 11c0-1.2.8-1.8 1.5-1.8" />
  </svg>
);

// 助産師アイコン (赤ちゃんを優しく包む両手と愛のハート)
const MidwifeCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <circle cx="12" cy="11" r="2.2" />
    <path d="M9.5 15.5c1.2 1.2 3.8 1.2 5 0" />
  </svg>
);

// 視能訓練士アイコン (瞳とビジョントレーニングのターゲット)
const OrthoptistCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3.5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
  </svg>
);

// エステ・フェイシャルアイコン (美しいフェイスラインと輝き)
const EstheticCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a4 4 0 0 1 4 4c0 3-4 6-4 6s-4-3-4-6a4 4 0 0 1 4-4z" />
    <path d="M9 13.5c-3 1-5 3.5-5 6.5h16c0-3-2-5.5-5-6.5" />
    <path d="M19 3l.8 1.6L21 5.2l-1.4.6-.6 1.7-.8-1.5-1.7-.8 1.5-.7z" fill="currentColor" stroke="none" />
  </svg>
);

// パーソナルトレーニングアイコン (ダンベル＆アクティブコンディショニング)
const PersonalTrainingCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 5v14" />
    <path d="M18 5v14" />
    <path d="M2 9h4v6H2z" />
    <path d="M18 9h4v6h-4z" />
    <path d="M6 12h12" />
  </svg>
);

// フットケア・巻き爪・ネイルアイコン (健やかな足裏と足爪ケア)
const FootcareCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 4.5a2.5 2.5 0 0 0-4.96.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 3.8 4 4 0 0 0-.24 3.74c1.5 3.5 4.5 5 6.5 5 3.5 0 5.5-3 5.5-7.5 0-3.5-1.5-8.5-3.5-8.5z" />
    <circle cx="10" cy="18" r="1" fill="currentColor" />
  </svg>
);

// 心理カウンセリング・メンタルアイコン (心に寄り添うハートと対話吹き出し)
const CounselingCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 14a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M12 7.5c-1.2-1.2-3.1-.7-3.1 1 0 1.5 2.1 2.8 3.1 3.5 1-.7 3.1-2 3.1-3.5 0-1.7-1.9-2.2-3.1-1z" fill="currentColor" stroke="none" />
  </svg>
);

// 離乳食・育児相談アイコン (離乳食ボウルとスプーン・育児サポート)
const ParentingCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 13c0 4.4 3.6 8 8 8s8-3.6 8-8H3z" />
    <path d="M12 5v5" />
    <path d="M8 8h8" />
    <circle cx="12" cy="3" r="1.5" />
  </svg>
);

// 出張美容師アイコン (ハサミとスタイリング)
const HairSalonCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

// 出張ネイルアイコン (美爪ネイルチップ＆スパークル)
const NailCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 11V6a5 5 0 0 1 10 0v5" />
    <path d="M5 11h14v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-8z" />
    <path d="M9 11V7a3 3 0 0 1 6 0v4" />
    <path d="M19 4l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5z" fill="currentColor" stroke="none" />
  </svg>
);

// 出張着付けアイコン (和装・着物の衿元と帯)
const DressingCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L4 7v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7l-8-5z" />
    <path d="M4 7l8 6 8-6" />
    <path d="M12 13v9" />
    <path d="M7 15h10" />
    <path d="M7 18h10" />
  </svg>
);

export const CustomerView: React.FC = () => {
  const {
    currentUser,
    therapistProfiles,
    allUsers,
    services,
    bookings,
    userLocation,
    setUserLocation,
  } = useApp();

  // 検索・絞り込みフィルター（複数条件の同時適用が可能）
  const [searchQuery, setSearchQuery] = useState<string>('');
  // 選択中の大ジャンル (初期値は null = 最初は大ジャンル選択画面)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  // 選択中の詳細カテゴリ (初期値は null = 詳細カテゴリ選択画面)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filterStyle, setFilterStyle] = useState<'all' | 'visit' | 'store'>('all');
  const [onlyCampaign, setOnlyCampaign] = useState<boolean>(false); // 特典・キャンペーン有無
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [viewMode, setViewMode] = useState<'card' | 'list' | 'map'>('card');
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);

  // 中心地指定機能のステート（マップ内で指定された場合にtrueになる）
  const [isCustomCenter, setIsCustomCenter] = useState<boolean>(false);

  // モーダル管理
  const [bookingTherapistId, setBookingTherapistId] = useState<string | null>(null);
  const [bookedSuccessInfo, setBookedSuccessInfo] = useState<{ id: string; name: string } | null>(null);
  const [chatBooking, setChatBooking] = useState<Booking | null>(null);

  // GPS現在地の手動更新
  const fetchCurrentGpsManual = async () => {
    setIsGpsLoading(true);
    try {
      const pos = await getCurrentGpsPosition();
      const addr = await reverseGeocode(pos.lat, pos.lng);
      const name = addr || `現在地 (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`;
      setUserLocation({
        name,
        lat: pos.lat,
        lng: pos.lng,
      });
      setIsCustomCenter(false);
    } catch {
      alert('現在地を取得できませんでした。ブラウザの位置情報許可をご確認ください。');
    } finally {
      setIsGpsLoading(false);
    }
  };

  // GPS現在地へリセット
  const handleResetToGps = async () => {
    setIsCustomCenter(false);
    await fetchCurrentGpsManual();
  };

  // GPS現在地の自動取得（デフォルトでオン、裏で静かに現在地を更新）
  useEffect(() => {
    let isMounted = true;
    const fetchCurrentGps = async () => {
      try {
        const pos = await getCurrentGpsPosition();
        if (!isMounted) return;
        const addr = await reverseGeocode(pos.lat, pos.lng);
        const name = addr || `現在地 (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`;
        setUserLocation({
          name,
          lat: pos.lat,
          lng: pos.lng,
        });
      } catch {
        // 拒否された場合やエラー時は、ユーザーの登録住所またはデフォルト地点がそのまま使われる（UIを邪魔しない）
      }
    };

    fetchCurrentGps();

    return () => {
      isMounted = false;
    };
  }, [setUserLocation]);

  // ========================================================
  // 大ジャンル (4大カテゴリ) 一覧定義
  // ========================================================
  const genres = [
    {
      id: 'bodycare',
      name: 'ボディケア & 美容・身だしなみ',
      badge: '癒やし・美容・専門職',
      subtitle: 'もみほぐし・アロマ・ヘッドスパ・エステ・美容師・ネイル・着付け',
      description: '筋肉疲労のもみほぐし、極上精油アロマ、快眠スパ、美肌エステ、出張美容師カット、ネイル、和装専門着付け',
      tags: ['もみほぐし', 'アロマ', 'ヘッドスパ', '出張美容師', 'ネイル', '着付け'],
      icon: BodyCareGroupIcon,
      themeColor: 'text-amber-700',
      iconBg: 'bg-amber-500/15 text-amber-700',
      cardBg: 'bg-gradient-to-br from-amber-50/95 via-orange-50/60 to-yellow-50/50',
      borderColor: 'border-amber-200 hover:border-amber-500',
      badgeBg: 'bg-white/95 text-amber-800 border border-amber-200/80',
      categoryIds: ['massage', 'aroma', 'beauty', 'esthetic', 'chiropractic', 'hair_salon', 'nail', 'dressing'],
    },
    {
      id: 'conditioning',
      name: '専門コンディショニング & 姿勢',
      badge: '痛みの予防・運動',
      subtitle: '理学療法・作業療法・鍼灸・パーソナルトレーニング',
      description: '国家資格保持者やプロトレーナーによる本格リハビリ・運動指導・姿勢改善・ツボ温熱治療',
      tags: ['理学療法', '作業療法', '鍼灸', '姿勢改善', '筋トレ'],
      icon: StethoscopeCategoryIcon,
      themeColor: 'text-blue-700',
      iconBg: 'bg-blue-500/15 text-blue-700',
      cardBg: 'bg-gradient-to-br from-blue-50/95 via-sky-50/60 to-indigo-50/50',
      borderColor: 'border-blue-200 hover:border-blue-500',
      badgeBg: 'bg-white/95 text-blue-800 border border-blue-200/80',
      categoryIds: ['physical_therapy', 'occupational_therapy', 'acupuncture', 'personal_training'],
    },
    {
      id: 'oral_health',
      name: 'からだ & おくちのサポート',
      badge: '健康・生活機能',
      subtitle: '言語聴覚・歯科衛生・視能訓練・フットケア巻き爪',
      description: '誤嚥防止・訪問口腔ケア・ことばの訓練・目の健康・足爪のトラブル解消をトータル支援',
      tags: ['言語聴覚', '歯科衛生', '視能訓練', 'フットケア'],
      icon: OrientalDentalGroupIcon,
      themeColor: 'text-teal-700',
      iconBg: 'bg-teal-500/15 text-teal-700',
      cardBg: 'bg-gradient-to-br from-teal-50/95 via-emerald-50/60 to-cyan-50/50',
      borderColor: 'border-teal-200 hover:border-teal-500',
      badgeBg: 'bg-white/95 text-teal-800 border border-teal-200/80',
      categoryIds: ['speech_therapy', 'dental_hygiene', 'orthoptist', 'footcare'],
    },
    {
      id: 'mama_lifestyle',
      name: 'ママ・ベビー & 食事相談',
      badge: 'ライフステージ',
      subtitle: '助産師・管理栄養士・離乳食育児・心理カウンセリング',
      description: '産前産後ケア・母乳マッサージ・持病の食事制限相談・離乳食アドバイス・心のメンタルケア',
      tags: ['助産師ケア', '管理栄養士', '離乳食相談', 'カウンセリング'],
      icon: FamilyLifestyleGroupIcon,
      themeColor: 'text-rose-700',
      iconBg: 'bg-rose-500/15 text-rose-700',
      cardBg: 'bg-gradient-to-br from-rose-50/95 via-pink-50/60 to-red-50/50',
      borderColor: 'border-rose-200 hover:border-rose-500',
      badgeBg: 'bg-white/95 text-rose-800 border border-rose-200/80',
      categoryIds: ['midwife', 'dietitian', 'parenting', 'counseling'],
    },
  ];

  // 詳細カテゴリー一覧 (各職種に分かりやすい専用ベクターアイコンを付与)
  const categories = [
    {
      id: 'all',
      genreId: 'all',
      label: 'すべて',
      subtitle: '全ジャンルから探す',
      description: 'すべての登録セラピストを一覧表示',
      icon: Sparkles,
      iconColor: 'text-emerald-700',
      bgColor: 'bg-emerald-500/15',
      cardBg: 'bg-gradient-to-br from-emerald-50/90 via-emerald-50/50 to-teal-50/60',
      borderColor: 'border-emerald-200/90 hover:border-emerald-500',
      badgeBg: 'bg-white/95 text-emerald-800 border border-emerald-200/80',
    },
    // --- 【大カテゴリ 1】ボディケア & リフレッシュ ---
    {
      id: 'massage',
      genreId: 'bodycare',
      label: 'もみほぐし',
      subtitle: '全身疲労・筋肉のコリ解消',
      description: '手技で深層筋肉をじんわりほぐすボディケア',
      icon: MassageCategoryIcon,
      iconColor: 'text-amber-700',
      bgColor: 'bg-amber-500/15',
      cardBg: 'bg-gradient-to-br from-amber-50/90 via-amber-50/50 to-orange-50/60',
      borderColor: 'border-amber-200/90 hover:border-amber-500',
      badgeBg: 'bg-white/95 text-amber-800 border border-amber-200/80',
    },
    {
      id: 'aroma',
      genreId: 'bodycare',
      label: 'アロマ・リンパ',
      subtitle: '極上の癒やし・むくみ解消',
      description: '選べる上質精油で巡りを整えるオイルトリートメント',
      icon: AromaCategoryIcon,
      iconColor: 'text-rose-700',
      bgColor: 'bg-rose-500/15',
      cardBg: 'bg-gradient-to-br from-rose-50/90 via-rose-50/50 to-pink-50/60',
      borderColor: 'border-rose-200/90 hover:border-rose-500',
      badgeBg: 'bg-white/95 text-rose-800 border border-rose-200/80',
    },
    {
      id: 'beauty',
      genreId: 'bodycare',
      label: '睡眠・ヘッドスパ',
      subtitle: '脳疲労・睡眠改善・眼精疲労',
      description: '頭皮をもみほぐし脳疲労と首肩の重さをリフレッシュするドライヘッドスパ',
      icon: HeadSpaCategoryIcon,
      iconColor: 'text-purple-700',
      bgColor: 'bg-purple-500/15',
      cardBg: 'bg-gradient-to-br from-purple-50/90 via-purple-50/50 to-pink-50/60',
      borderColor: 'border-purple-200/90 hover:border-purple-500',
      badgeBg: 'bg-white/95 text-purple-800 border border-purple-200/80',
    },
    {
      id: 'esthetic',
      genreId: 'bodycare',
      label: 'エステ・美肌',
      subtitle: 'フェイシャル・美肌・ブライダル',
      description: '美白・毛穴洗浄・小顔リフトアップ・ブライダル痩身エステ',
      icon: EstheticCategoryIcon,
      iconColor: 'text-pink-700',
      bgColor: 'bg-pink-500/15',
      cardBg: 'bg-gradient-to-br from-pink-50/90 via-rose-50/50 to-fuchsia-50/60',
      borderColor: 'border-pink-200/90 hover:border-pink-500',
      badgeBg: 'bg-white/95 text-pink-800 border border-pink-200/80',
    },
    {
      id: 'chiropractic',
      genreId: 'bodycare',
      label: 'カイロ・骨盤',
      subtitle: '骨盤矯正・姿勢の歪みケア',
      description: '背骨や骨盤のアライメントを整え美姿勢へ導く矯正手技',
      icon: ChiropracticCategoryIcon,
      iconColor: 'text-indigo-700',
      bgColor: 'bg-indigo-500/15',
      cardBg: 'bg-gradient-to-br from-indigo-50/90 via-indigo-50/50 to-purple-50/60',
      borderColor: 'border-indigo-200/90 hover:border-indigo-500',
      badgeBg: 'bg-white/95 text-indigo-800 border border-indigo-200/80',
    },
    {
      id: 'hair_salon',
      genreId: 'bodycare',
      label: '出張美容師',
      subtitle: '自宅カット・カラー・ヘアセット',
      description: '国家資格美容師による出張ヘアカット・ブロー・シニア訪問美容',
      icon: HairSalonCategoryIcon,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-500/15',
      cardBg: 'bg-gradient-to-br from-rose-50/90 via-pink-50/50 to-orange-50/60',
      borderColor: 'border-rose-200/90 hover:border-rose-500',
      badgeBg: 'bg-white/95 text-rose-800 border border-rose-200/80',
    },
    {
      id: 'nail',
      genreId: 'bodycare',
      label: '出張ネイル',
      subtitle: 'ジェルネイル・ハンドケア',
      description: '自宅でくつろぎながら楽しむデザインジェルネイル・ネイルケア',
      icon: NailCategoryIcon,
      iconColor: 'text-fuchsia-600',
      bgColor: 'bg-fuchsia-500/15',
      cardBg: 'bg-gradient-to-br from-fuchsia-50/90 via-pink-50/50 to-purple-50/60',
      borderColor: 'border-fuchsia-200/90 hover:border-fuchsia-500',
      badgeBg: 'bg-white/95 text-fuchsia-800 border border-fuchsia-200/80',
    },
    {
      id: 'dressing',
      genreId: 'bodycare',
      label: '出張着付け',
      subtitle: '訪問着・留袖・振袖・浴衣',
      description: '着崩れず苦しくないプロの出張着付け・記念日・晴れの日対応',
      icon: DressingCategoryIcon,
      iconColor: 'text-violet-600',
      bgColor: 'bg-violet-500/15',
      cardBg: 'bg-gradient-to-br from-violet-50/90 via-indigo-50/50 to-purple-50/60',
      borderColor: 'border-violet-200/90 hover:border-violet-500',
      badgeBg: 'bg-white/95 text-violet-800 border border-violet-200/80',
    },

    // --- 【大カテゴリ 2】専門コンディショニング & 姿勢 ---
    {
      id: 'physical_therapy',
      genreId: 'conditioning',
      label: '整体・理学',
      subtitle: '肩こり・腰痛・関節の根本改善',
      description: '国家資格保持者による本格リハビリ・運動療法',
      icon: PhysicalTherapyCategoryIcon,
      iconColor: 'text-blue-700',
      bgColor: 'bg-blue-500/15',
      cardBg: 'bg-gradient-to-br from-blue-50/90 via-blue-50/50 to-sky-50/60',
      borderColor: 'border-blue-200/90 hover:border-blue-500',
      badgeBg: 'bg-white/95 text-blue-800 border border-blue-200/80',
    },
    {
      id: 'occupational_therapy',
      genreId: 'conditioning',
      label: '作業療法',
      subtitle: '日常生活動作・自立支援',
      description: '食事や更衣・手先の動作など生活に直結する機能回復リハビリ',
      icon: OccupationalTherapyCategoryIcon,
      iconColor: 'text-cyan-700',
      bgColor: 'bg-cyan-500/15',
      cardBg: 'bg-gradient-to-br from-cyan-50/90 via-cyan-50/50 to-sky-50/60',
      borderColor: 'border-cyan-200/90 hover:border-cyan-500',
      badgeBg: 'bg-white/95 text-cyan-800 border border-cyan-200/80',
    },
    {
      id: 'acupuncture',
      genreId: 'conditioning',
      label: '鍼灸',
      subtitle: '東洋医学・ツボ刺激・自律神経',
      description: '経穴への鍼と温灸で深部コリや自律神経・冷えを根本調整',
      icon: AcupunctureCategoryIcon,
      iconColor: 'text-amber-800',
      bgColor: 'bg-amber-600/15',
      cardBg: 'bg-gradient-to-br from-amber-50/90 via-yellow-50/50 to-orange-50/60',
      borderColor: 'border-amber-300/90 hover:border-amber-600',
      badgeBg: 'bg-white/95 text-amber-900 border border-amber-300/80',
    },
    {
      id: 'personal_training',
      genreId: 'conditioning',
      label: 'パーソナル筋トレ',
      subtitle: '出張運動指導・ボディメイク',
      description: '自宅でできるマンツーマン筋力トレーニング・体幹強化・シニア運動指導',
      icon: PersonalTrainingCategoryIcon,
      iconColor: 'text-emerald-700',
      bgColor: 'bg-emerald-500/15',
      cardBg: 'bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-cyan-50/60',
      borderColor: 'border-emerald-200/90 hover:border-emerald-500',
      badgeBg: 'bg-white/95 text-emerald-800 border border-emerald-200/80',
    },

    // --- 【大カテゴリ 3】からだ & おくちのサポート ---
    {
      id: 'speech_therapy',
      genreId: 'oral_health',
      label: '言語聴覚',
      subtitle: 'ことば・発声・嚥下ケア',
      description: '嚥下障害や構音・コミュニケーション機能の回復訓練',
      icon: SpeechTherapyCategoryIcon,
      iconColor: 'text-violet-700',
      bgColor: 'bg-violet-500/15',
      cardBg: 'bg-gradient-to-br from-violet-50/90 via-violet-50/50 to-purple-50/60',
      borderColor: 'border-violet-200/90 hover:border-violet-500',
      badgeBg: 'bg-white/95 text-violet-800 border border-violet-200/80',
    },
    {
      id: 'dental_hygiene',
      genreId: 'oral_health',
      label: '歯科衛生',
      subtitle: '訪問口腔ケア・摂食支援',
      description: '誤嚥性肺炎予防・口腔内クリーニングと健口ケア',
      icon: ToothCategoryIcon,
      iconColor: 'text-teal-700',
      bgColor: 'bg-teal-500/15',
      cardBg: 'bg-gradient-to-br from-teal-50/90 via-teal-50/50 to-emerald-50/60',
      borderColor: 'border-teal-200/90 hover:border-teal-500',
      badgeBg: 'bg-white/95 text-teal-800 border border-teal-200/80',
    },
    {
      id: 'orthoptist',
      genreId: 'oral_health',
      label: '視能訓練',
      subtitle: '視機能トレーニング・アイケア',
      description: '斜視・弱視の訓練相談や眼精疲労・視覚機能のセルフケア指導',
      icon: OrthoptistCategoryIcon,
      iconColor: 'text-sky-700',
      bgColor: 'bg-sky-500/15',
      cardBg: 'bg-gradient-to-br from-sky-50/90 via-sky-50/50 to-indigo-50/60',
      borderColor: 'border-sky-200/90 hover:border-sky-500',
      badgeBg: 'bg-white/95 text-sky-800 border border-sky-200/80',
    },
    {
      id: 'footcare',
      genreId: 'oral_health',
      label: 'フットケア・巻き爪',
      subtitle: '巻き爪補正・角質ケア・足爪',
      description: 'ドイツ式フスフレーゲ、痛くない巻き爪補正、タコ・ウオノメ除去、高齢者足爪切り',
      icon: FootcareCategoryIcon,
      iconColor: 'text-cyan-700',
      bgColor: 'bg-cyan-500/15',
      cardBg: 'bg-gradient-to-br from-cyan-50/90 via-sky-50/50 to-teal-50/60',
      borderColor: 'border-cyan-200/90 hover:border-cyan-500',
      badgeBg: 'bg-white/95 text-cyan-800 border border-cyan-200/80',
    },

    // --- 【大カテゴリ 4】ママ・ベビー & 食事相談 ---
    {
      id: 'midwife',
      genreId: 'mama_lifestyle',
      label: '助産師',
      subtitle: '産前産後ケア・母乳・育児相談',
      description: '助産師による乳房ケア・産後骨盤・育児のメンタル相談',
      icon: MidwifeCategoryIcon,
      iconColor: 'text-rose-700',
      bgColor: 'bg-rose-500/15',
      cardBg: 'bg-gradient-to-br from-rose-50/90 via-pink-50/50 to-red-50/60',
      borderColor: 'border-rose-200/90 hover:border-rose-500',
      badgeBg: 'bg-white/95 text-rose-800 border border-rose-200/80',
    },
    {
      id: 'dietitian',
      genreId: 'mama_lifestyle',
      label: '管理栄養',
      subtitle: '栄養相談・生活習慣食・献立',
      description: '持病に合わせた制限食や日々の食生活改善を伴走支援',
      icon: DietitianCategoryIcon,
      iconColor: 'text-lime-700',
      bgColor: 'bg-lime-500/15',
      cardBg: 'bg-gradient-to-br from-lime-50/90 via-lime-50/50 to-green-50/60',
      borderColor: 'border-lime-200/90 hover:border-lime-500',
      badgeBg: 'bg-white/95 text-lime-800 border border-lime-200/80',
    },
    {
      id: 'parenting',
      genreId: 'mama_lifestyle',
      label: '離乳食・育児相談',
      subtitle: '離乳食クッキング・夜泣き改善',
      description: '自宅キッチンでの離乳食実地レクチャー、偏食・食べムラ改善、イヤイヤ期コーチング',
      icon: ParentingCategoryIcon,
      iconColor: 'text-amber-700',
      bgColor: 'bg-amber-500/15',
      cardBg: 'bg-gradient-to-br from-amber-50/90 via-yellow-50/50 to-orange-50/60',
      borderColor: 'border-amber-200/90 hover:border-amber-500',
      badgeBg: 'bg-white/95 text-amber-800 border border-amber-200/80',
    },
    {
      id: 'counseling',
      genreId: 'mama_lifestyle',
      label: '心理カウンセリング',
      subtitle: 'メンタルケア・悩み相談・コーチング',
      description: '公認心理師・臨床心理士による対話カウンセリング、ストレスマネジメント、マインドフルネス',
      icon: CounselingCategoryIcon,
      iconColor: 'text-violet-700',
      bgColor: 'bg-violet-500/15',
      cardBg: 'bg-gradient-to-br from-violet-50/90 via-purple-50/50 to-indigo-50/60',
      borderColor: 'border-violet-200/90 hover:border-violet-500',
      badgeBg: 'bg-white/95 text-violet-800 border border-violet-200/80',
    },
  ];

  // 各大ジャンルに所属する承認済みセラピスト数を取得
  const getGenreCount = (genreCatIds: string[]) => {
    return Object.values(therapistProfiles).filter((tp) => {
      if (!tp.is_approved) return false;
      const userServices = services.filter((s) => s.therapist_id === tp.user_id && s.is_active);
      return userServices.some((s) => genreCatIds.includes(s.category));
    }).length;
  };

  // 各カテゴリに所属する承認済みセラピスト数を取得
  const getCategoryCount = (catId: string) => {
    if (catId === 'all') {
      return Object.values(therapistProfiles).filter((tp) => tp.is_approved).length;
    }
    return Object.values(therapistProfiles).filter((tp) => {
      if (!tp.is_approved) return false;
      const userServices = services.filter((s) => s.therapist_id === tp.user_id && s.is_active);
      return userServices.some((s) => s.category === catId);
    }).length;
  };

  // 登録承認済みセラピストの総数
  const totalApprovedTherapistsCount = Object.values(therapistProfiles).filter((tp) => tp.is_approved).length;
  
  // 現在選択中のジャンル情報
  const currentGenreInfo = genres.find((g) => g.id === selectedGenre);

  // 現在選択中のカテゴリー情報 (個別カテゴリーまたはジャンル全体)
  const currentCategoryInfo = selectedCategory?.startsWith('genre_')
    ? (() => {
        const gid = selectedCategory.replace('genre_', '');
        const g = genres.find((item) => item.id === gid);
        if (!g) return null;
        return {
          id: selectedCategory,
          label: `${g.name} (全員)`,
          subtitle: g.subtitle,
          icon: g.icon,
          iconColor: g.themeColor,
          bgColor: g.iconBg,
        };
      })()
    : categories.find((c) => c.id === selectedCategory);

  // セラピスト一覧のフィルタリングと複数ソート
  const therapistsList = Object.values(therapistProfiles)
    .filter((tp) => {
      if (!tp.is_approved) return false;

      // 施術スタイル絞り込み
      if (filterStyle === 'visit' && !tp.is_visit_based) return false;
      if (filterStyle === 'store' && !tp.is_store_based) return false;

      // 特典・キャンペーン有無絞り込み
      if (onlyCampaign && !tp.campaign) return false;

      const user = allUsers.find((u) => u.id === tp.user_id);
      const userServices = services.filter((s) => s.therapist_id === tp.user_id);

      // カテゴリ・ジャンルフィルター
      if (selectedCategory && selectedCategory !== 'all') {
        if (selectedCategory.startsWith('genre_')) {
          const targetGenreId = selectedCategory.replace('genre_', '');
          const genreObj = genres.find((g) => g.id === targetGenreId);
          if (genreObj) {
            const hasCat = userServices.some((s) => genreObj.categoryIds.includes(s.category));
            if (!hasCat) return false;
          }
        } else {
          const hasCat = userServices.some((s) => s.category === selectedCategory);
          if (!hasCat) return false;
        }
      } else if (selectedGenre) {
        // 詳細カテゴリ未選択で大ジャンルが選ばれている場合
        const genreObj = genres.find((g) => g.id === selectedGenre);
        if (genreObj) {
          const hasCat = userServices.some((s) => genreObj.categoryIds.includes(s.category));
          if (!hasCat) return false;
        }
      }

      // フリーワード検索 (セラピスト名、自己紹介、特技、キャンペーン、メニュー名、施術内容、エリア)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = user?.name.toLowerCase().includes(q);
        const matchesBio = tp.bio.toLowerCase().includes(q);
        const matchesSpeciality = tp.specialities.some((s) => s.toLowerCase().includes(q));
        const matchesCampaign = tp.campaign?.badge.toLowerCase().includes(q) || tp.campaign?.title?.toLowerCase().includes(q);
        const matchesAddress = (tp.address || '').toLowerCase().includes(q) || (tp.store_address || '').toLowerCase().includes(q);
        const matchesServices = userServices.some((s) => s.title.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q));
        if (!matchesName && !matchesBio && !matchesSpeciality && !matchesCampaign && !matchesAddress && !matchesServices) return false;
      }

      return true;
    })
    .map((tp) => {
      const distance = calculateDistanceKm(userLocation.lat, userLocation.lng, tp.lat, tp.lng);
      return {
        ...tp,
        distance,
      };
    })
    .sort((a, b) => {
      const aServices = services.filter((s) => s.therapist_id === a.user_id && s.is_active);
      const bServices = services.filter((s) => s.therapist_id === b.user_id && s.is_active);
      const aMinPrice = aServices.length > 0 ? Math.min(...aServices.map((s) => s.price)) : Infinity;
      const bMinPrice = bServices.length > 0 ? Math.min(...bServices.map((s) => s.price)) : Infinity;

      switch (sortBy) {
        case 'rating': // 評価の高い順
          if (b.rating_avg !== a.rating_avg) return b.rating_avg - a.rating_avg;
          return b.reviews_count - a.reviews_count;

        case 'price_asc': // 料金の安い順
          return aMinPrice - bMinPrice;

        case 'price_desc': // 料金の高い順
          return bMinPrice - aMinPrice;

        case 'distance': // 距離が近い順
          if (a.distance !== b.distance) return a.distance - b.distance;
          return b.rating_avg - a.rating_avg;

        case 'recommended': // オススメ順（キャンペーン有無、評価、レビュー数総合スコア）
        default: {
          const aScore = (a.campaign ? 50 : 0) + (a.rating_avg * 10) + Math.min(a.reviews_count, 30);
          const bScore = (b.campaign ? 50 : 0) + (b.rating_avg * 10) + Math.min(b.reviews_count, 30);
          return bScore - aScore;
        }
      }
    });

  // アクティブなフィルター数をカウント (デフォルト条件と異なる設定の数)
  const activeFiltersCount = (onlyCampaign ? 1 : 0) +
    (filterStyle !== 'all' ? 1 : 0) +
    (selectedCategory && selectedCategory !== 'all' ? 1 : 0) +
    (sortBy !== 'recommended' ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* 予約完了トースト案内 */}
      {bookedSuccessInfo && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm">予約リクエストを送信しました！</h4>
              <p className="text-xs text-white/90">
                {bookedSuccessInfo.name} さんの承認待ちです。事前にメッセージで相談や連絡を行えます。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const b = bookings.find((x) => x.id === bookedSuccessInfo.id);
                if (b) setChatBooking(b);
              }}
              className="px-3.5 py-2 bg-white text-emerald-800 text-xs font-bold rounded-xl shadow-xs hover:bg-emerald-50 transition flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>メッセージを送る</span>
            </button>
            <Link
              href="/bookings"
              className="px-3.5 py-2 bg-emerald-800/60 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              予約一覧
            </Link>
            <button
              onClick={() => setBookedSuccessInfo(null)}
              className="text-white/80 hover:text-white text-xs px-2 py-1"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* 検索フィールド & 現在地・距離順クイック切り替えバー */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3.5">
        {/* 検索入力ボックス */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="セラピスト名、メニュー（もみほぐし・美容師・ネイル・整体等）、お悩み、エリアで検索..."
            className="w-full pl-11 pr-10 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-2xl border border-slate-200 focus:border-emerald-500 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs transition cursor-pointer"
              title="検索条件をクリア"
            >
              ✕
            </button>
          )}
        </div>

        {/* 現在地情報 ＆ 距離順クイック切り替えボタン */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-600 min-w-0">
            <MapPin className={`w-4 h-4 shrink-0 ${isCustomCenter ? 'text-emerald-600' : 'text-rose-500'}`} />
            <span className="font-medium truncate max-w-[220px] sm:max-w-md">
              {isCustomCenter ? '指定中心地:' : '現在地:'} <strong className="text-slate-900 font-bold">{userLocation.name}</strong>
            </span>
            <button
              onClick={fetchCurrentGpsManual}
              disabled={isGpsLoading}
              className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isGpsLoading ? '取得中...' : isCustomCenter ? 'GPS現在地に戻す' : '現在地を更新'}
            </button>
          </div>

          <button
            onClick={() => setSortBy('distance')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              sortBy === 'distance'
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/30 shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${sortBy === 'distance' ? 'text-white' : 'text-emerald-700'}`} />
            <span>{isCustomCenter ? '中心地から近い順' : '距離が近い順に並び替え'}</span>
            {sortBy === 'distance' && <Check className="w-3 h-3 stroke-[3]" />}
          </button>
        </div>
      </div>

      {/* 施術ジャンル・カテゴリーセレクター */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            施術ジャンルから絞り込む
          </span>
          {(selectedGenre || (selectedCategory && selectedCategory !== 'all')) && (
            <button
              onClick={() => {
                setSelectedGenre(null);
                setSelectedCategory('all');
              }}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>すべて表示に戻す</span>
            </button>
          )}
        </div>

        {/* 5つのジャンルカード（「すべて」＋4大ジャンル） */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
          {/* すべて */}
          <button
            onClick={() => {
              setSelectedGenre(null);
              setSelectedCategory('all');
            }}
            className={`p-3 rounded-2xl border-2 text-left transition flex items-center gap-2.5 cursor-pointer ${
              !selectedGenre && (selectedCategory === 'all' || !selectedCategory)
                ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black text-slate-900 block truncate">すべて</span>
              <span className="text-[10px] text-slate-500 font-bold">{totalApprovedTherapistsCount}名</span>
            </div>
          </button>

          {/* 4つの大ジャンル */}
          {genres.map((genre) => {
            const isGenreSelected = selectedGenre === genre.id;
            const Icon = genre.icon;
            const count = getGenreCount(genre.categoryIds);
            return (
              <button
                key={genre.id}
                onClick={() => {
                  if (selectedGenre === genre.id) {
                    setSelectedGenre(null);
                    setSelectedCategory('all');
                  } else {
                    setSelectedGenre(genre.id);
                    setSelectedCategory(null);
                  }
                }}
                className={`p-3 rounded-2xl border-2 text-left transition flex items-center gap-2.5 cursor-pointer ${
                  isGenreSelected
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${genre.iconBg}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-slate-900 block truncate">{genre.name}</span>
                  <span className="text-[10px] text-slate-500 font-bold">{count}名</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 選択中の大ジャンルに属する詳細カテゴリー（サブピル） */}
        {selectedGenre && currentGenreInfo && (
          <div className="pt-2 border-t border-slate-100 space-y-1.5 animate-fadeIn">
            <span className="text-[11px] font-bold text-slate-500 block">
              {currentGenreInfo.name} の職種・専門分野:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  !selectedCategory
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                全員 ({getGenreCount(currentGenreInfo.categoryIds)}名)
              </button>
              {categories
                .filter((cat) => currentGenreInfo.categoryIds.includes(cat.id))
                .map((cat) => {
                  const isCatSelected = selectedCategory === cat.id;
                  const count = getCategoryCount(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(isCatSelected ? null : cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                        isCatSelected
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isCatSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* 絞り込み＆ソート ボタングループ */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 pb-1 pt-1">
          {/* ソート: 距離が近い順 (目立つよう先頭に配置) */}
          <button
            onClick={() => setSortBy('distance')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              sortBy === 'distance'
                ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${sortBy === 'distance' ? 'text-white' : 'text-emerald-600'}`} />
            <span>距離が近い順</span>
          </button>

          {/* ソート: オススメ順 */}
          <button
            onClick={() => setSortBy('recommended')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              sortBy === 'recommended'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${sortBy === 'recommended' ? 'text-amber-300' : 'text-slate-400'}`} />
            <span>オススメ順</span>
          </button>

          {/* ソート: 評価が高い順 */}
          <button
            onClick={() => setSortBy('rating')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              sortBy === 'rating'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${sortBy === 'rating' ? 'fill-white' : 'text-amber-400 fill-amber-400'}`} />
            <span>評価が高い順</span>
          </button>

          {/* ソート: 料金が安い順 */}
          <button
            onClick={() => setSortBy('price_asc')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              sortBy === 'price_asc'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Coins className={`w-3.5 h-3.5 ${sortBy === 'price_asc' ? 'text-emerald-300' : 'text-slate-400'}`} />
            <span>料金が安い順</span>
          </button>

          {/* ソート: 料金が高い順 */}
          <button
            onClick={() => setSortBy('price_desc')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              sortBy === 'price_desc'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Coins className={`w-3.5 h-3.5 ${sortBy === 'price_desc' ? 'text-emerald-300' : 'text-slate-400'}`} />
            <span>料金が高い順</span>
          </button>

          {/* フィルター: 特典・キャンペーン有無 */}
          <button
            onClick={() => setOnlyCampaign(!onlyCampaign)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              onlyCampaign
                ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-600/30'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
            }`}
          >
            <BadgePercent className={`w-3.5 h-3.5 ${onlyCampaign ? 'text-white' : 'text-emerald-600'}`} />
            <span>🎁 特典・キャンペーンあり</span>
            {onlyCampaign && <Check className="w-3 h-3 ml-0.5" />}
          </button>

          {/* フィルター: 出張のみ */}
          <button
            onClick={() => setFilterStyle(filterStyle === 'visit' ? 'all' : 'visit')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              filterStyle === 'visit'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-emerald-500" />
            <span>出張のみ</span>
            {filterStyle === 'visit' && <Check className="w-3 h-3 ml-0.5" />}
          </button>

          {/* フィルター: 店舗あり */}
          <button
            onClick={() => setFilterStyle(filterStyle === 'store' ? 'all' : 'store')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              filterStyle === 'store'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-teal-600" />
            <span>店舗あり</span>
            {filterStyle === 'store' && <Check className="w-3 h-3 ml-0.5" />}
          </button>

          {/* フィルターリセット */}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                setOnlyCampaign(false);
                setFilterStyle('all');
                setSelectedGenre(null);
                setSelectedCategory('all');
                setSortBy('recommended');
                setSearchQuery('');
              }}
              className="text-[11px] text-slate-400 hover:text-slate-600 font-bold px-2 py-1 underline whitespace-nowrap cursor-pointer"
            >
              条件をリセット
            </button>
          )}
        </div>

        {/* 該当件数 ＆ ビュー切替 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 pb-1 border-t border-slate-100">
          <div className="text-xs text-slate-500 font-medium">
            該当 <strong className="text-slate-900 font-bold text-sm">{therapistsList.length}</strong> 名のセラピスト
            {sortBy === 'distance' && (
              <span className="ml-1 text-emerald-600 font-black">
                （{isCustomCenter ? '指定中心地から近い順' : '現在地から近い順'}）
              </span>
            )}
            {sortBy === 'recommended' && <span className="ml-1 text-slate-600 font-bold">（オススメ順）</span>}
            {sortBy === 'rating' && <span className="ml-1 text-amber-600 font-bold">（評価が高い順）</span>}
            {sortBy === 'price_asc' && <span className="ml-1 text-indigo-600 font-bold">（料金が安い順）</span>}
            {sortBy === 'price_desc' && <span className="ml-1 text-indigo-600 font-bold">（料金が高い順）</span>}
            {searchQuery && <span className="ml-1 text-slate-700">（「{searchQuery}」の検索結果）</span>}
          </div>

          <div className="flex items-center self-end sm:self-auto bg-slate-100/90 p-1 rounded-2xl">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="カード表示"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>カード</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="リスト表示"
            >
              <List className="w-3.5 h-3.5" />
              <span>リスト</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="マップ表示"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>マップ</span>
            </button>
          </div>
        </div>
      </div>

      {/* セラピスト一覧 ビュー表示 */}
      {viewMode === 'map' ? (
        <RealLeafletMap
          onSelectTherapist={(id) => setBookingTherapistId(id)}
          filterType={filterStyle}
          therapists={therapistsList}
          isCustomCenter={isCustomCenter}
          onSetCustomCenter={(res) => {
            setUserLocation(res);
            setIsCustomCenter(true);
            setSortBy('distance');
          }}
          onResetToGps={handleResetToGps}
        />
      ) : viewMode === 'card' ? (
        /* Uber風 カードグリッド表示 (Grid Card View) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {therapistsList.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
                <Filter className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm">該当するセラピストが見つかりませんでした</h4>
            </div>
          ) : (
            therapistsList.map((tp) => {
              const user = allUsers.find((u) => u.id === tp.user_id);
              const userServices = services.filter((s) => s.therapist_id === tp.user_id && s.is_active);
              const leadService = userServices[0];
              const travelTime = estimateTravelTimeMinutes(tp.distance);

              return (
                <div
                  key={tp.user_id}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-0.5"
                >
                  {/* カード上部カバー/アバター */}
                  <div className="relative p-5 pb-3">
                    {/* 特典・キャンペーンバッジ (Uber風プロモーションタグ) */}
                    {tp.campaign && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-black px-2.5 py-1 rounded-xl shadow-xs">
                          <Tag className="w-3 h-3" />
                          {tp.campaign.badge}
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-3.5">
                      <img
                        src={user?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                        alt={user?.name}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform shrink-0"
                      />
                      <div className="flex-1 min-w-0 pr-16">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700 transition truncate">
                            {user?.name}
                          </h3>
                          <span title="認証済">
                            <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          </span>
                        </div>

                        {/* 評価 & レビュー件数 */}
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                          {tp.reviews_count > 0 ? (
                            <>
                              <div className="flex items-center text-amber-500 font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                <span className="ml-1 text-slate-900 font-black">{tp.rating_avg.toFixed(1)}</span>
                              </div>
                              <span className="text-slate-400 text-[11px]">({tp.reviews_count}件)</span>
                            </>
                          ) : (
                            <span className="text-slate-400 text-[11px]">口コミはまだありません</span>
                          )}
                        </div>

                        {/* 距離 & 移動時間 */}
                        <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 font-bold px-2 py-0.5 rounded-lg border border-emerald-200">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            {isCustomCenter ? '中心地から' : ''} {tp.distance}km
                          </span>
                          <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 font-medium px-2 py-0.5 rounded-lg">
                            <Clock className="w-3 h-3 text-slate-400" />
                            約{travelTime}分
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* スタイル (出張可 / 店舗あり) */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-slate-100">
                      {tp.is_visit_based && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <Home className="w-2.5 h-2.5" />
                          出張可
                        </span>
                      )}
                      {tp.is_store_based && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                          <Building className="w-2.5 h-2.5" />
                          店舗あり ({tp.store_name || 'サロン'})
                        </span>
                      )}
                    </div>

                    {/* 専門タグ */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tp.specialities.slice(0, 3).map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    {/* 自己紹介抜粋 */}
                    <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                      {tp.bio}
                    </p>
                  </div>

                  {/* カード下部: 代表価格 & 予約ボタン */}
                  <div className="mt-auto p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      {leadService ? (
                        <>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {leadService.duration_minutes}分コース
                          </div>
                          <div className="text-sm font-black text-slate-900">
                            {formatPrice(leadService.price)}
                            <span className="text-[10px] font-normal text-slate-400 ml-1">税込</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-slate-400">メニュー準備中</div>
                      )}
                    </div>

                    <button
                      onClick={() => setBookingTherapistId(tp.user_id)}
                      className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-2xs transition flex items-center gap-1.5 active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>予約する</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-0.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* リスト表示 (List View) */
        <div className="space-y-3.5">
          {therapistsList.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <p className="text-slate-500 text-xs">条件に該当するセラピストが見つかりませんでした。</p>
            </div>
          ) : (
            therapistsList.map((tp) => {
              const user = allUsers.find((u) => u.id === tp.user_id);
              const userServices = services.filter((s) => s.therapist_id === tp.user_id && s.is_active);
              const leadService = userServices[0];
              const travelTime = estimateTravelTimeMinutes(tp.distance);

              return (
                <div
                  key={tp.user_id}
                  className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-300 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                    <img
                      src={user?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                      alt={user?.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform shrink-0"
                    />

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700 transition">
                          {user?.name}
                        </h3>
                        <span title="認証済">
                          <Shield className="w-3.5 h-3.5 text-emerald-500" />
                        </span>

                        {/* 特典・キャンペーンバッジ */}
                        {tp.campaign && (
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                            <Tag className="w-2.5 h-2.5" />
                            {tp.campaign.badge}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-2xs">
                          <MapPin className="w-3 h-3" />
                          {isCustomCenter ? '中心地から' : '現在地から'} {tp.distance} km
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-slate-500" />
                          約{travelTime}分
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs">
                        {tp.reviews_count > 0 ? (
                          <div className="flex items-center text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span className="ml-1 text-slate-900 font-black">{tp.rating_avg.toFixed(1)}</span>
                            <span className="text-slate-400 font-normal ml-0.5">({tp.reviews_count}件)</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">口コミはまだありません</span>
                        )}

                        <div className="flex items-center gap-1.5">
                          {tp.is_visit_based && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              出張可
                            </span>
                          )}
                          {tp.is_store_based && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                              店舗あり
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {tp.specialities.map((spec) => (
                          <span
                            key={spec}
                            className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                        {tp.bio}
                      </p>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 md:min-w-[190px]">
                    {leadService ? (
                      <div className="text-left md:text-right">
                        <div className="text-[10px] text-slate-400 font-medium">
                          {leadService.duration_minutes}分コース
                        </div>
                        <div className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[170px]">
                          {leadService.title}
                        </div>
                        <div className="text-sm font-black text-slate-900 mt-0.5">
                          {formatPrice(leadService.price)}
                          <span className="text-[10px] font-normal text-slate-400 ml-1">税込</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">メニュー準備中</div>
                    )}

                    <button
                      onClick={() => setBookingTherapistId(tp.user_id)}
                      className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-2xs transition flex items-center gap-1.5 shrink-0 active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>予約・メニュー</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-0.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 予約モーダル */}
      {bookingTherapistId && (
        <BookingModal
          therapistId={bookingTherapistId}
          onClose={() => setBookingTherapistId(null)}
          onSuccess={(id, openChatImmediately) => {
            const bookedUser = allUsers.find((u) => u.id === bookingTherapistId);
            setBookingTherapistId(null);
            setBookedSuccessInfo({
              id,
              name: bookedUser?.name || 'セラピスト',
            });
            if (openChatImmediately) {
              const b = bookings.find((x) => x.id === id);
              if (b) {
                setChatBooking(b);
              } else {
                setTimeout(() => {
                  const targetBooking = bookings.find((x) => x.id === id);
                  if (targetBooking) setChatBooking(targetBooking);
                }, 150);
              }
            }
          }}
        />
      )}

      {/* チャットモーダル */}
      {chatBooking && (
        <BookingChatModal
          booking={chatBooking}
          onClose={() => setChatBooking(null)}
          activeUserId={currentUser?.id}
          viewerRole="customer"
        />
      )}
    </div>
  );
};

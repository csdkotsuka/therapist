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
import { Booking } from '@/types';

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

export const CustomerView: React.FC = () => {
  const {
    currentUser,
    therapistProfiles,
    allUsers,
    services,
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

  // モーダル管理
  const [bookingTherapistId, setBookingTherapistId] = useState<string | null>(null);
  const [bookedSuccessInfo, setBookedSuccessInfo] = useState<{ id: string; name: string } | null>(null);

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
      name: 'ボディケア & リフレッシュ',
      badge: '癒やし・美容',
      subtitle: 'もみほぐし・アロマ・ヘッドスパ・エステ・カイロ骨盤',
      description: '筋肉疲労の深層もみほぐし、極上精油アロマ、快眠スパ、美肌フェイシャルエステ、姿勢骨盤矯正',
      icon: BodyCareGroupIcon,
      themeColor: 'text-amber-700',
      iconBg: 'bg-amber-500/15 text-amber-700',
      cardBg: 'bg-gradient-to-br from-amber-50/95 via-orange-50/60 to-yellow-50/50',
      borderColor: 'border-amber-200 hover:border-amber-500',
      badgeBg: 'bg-white/95 text-amber-800 border border-amber-200/80',
      categoryIds: ['massage', 'aroma', 'beauty', 'esthetic', 'chiropractic'],
      highlight: 'もみほぐし・アロマ・スパ・エステ・骨盤',
    },
    {
      id: 'conditioning',
      name: '専門コンディショニング & 姿勢',
      badge: '痛みの予防・運動',
      subtitle: '整体理学療法・作業療法・鍼灸・パーソナルトレーニング',
      description: '国家資格保持者やプロトレーナーによる本格リハビリ・運動指導・姿勢改善・ツボ温熱治療',
      icon: StethoscopeCategoryIcon,
      themeColor: 'text-blue-700',
      iconBg: 'bg-blue-500/15 text-blue-700',
      cardBg: 'bg-gradient-to-br from-blue-50/95 via-sky-50/60 to-indigo-50/50',
      borderColor: 'border-blue-200 hover:border-blue-500',
      badgeBg: 'bg-white/95 text-blue-800 border border-blue-200/80',
      categoryIds: ['physical_therapy', 'occupational_therapy', 'acupuncture', 'personal_training'],
      highlight: '理学療法・作業療法・鍼灸・筋トレ',
    },
    {
      id: 'oral_health',
      name: 'からだ & おくちのサポート',
      badge: '健康・生活機能',
      subtitle: '言語聴覚・歯科衛生・視能訓練・フットケア巻き爪',
      description: '誤嚥防止・訪問口腔ケア・ことばの訓練・目の健康・足爪のトラブル解消をトータル支援',
      icon: OrientalDentalGroupIcon,
      themeColor: 'text-teal-700',
      iconBg: 'bg-teal-500/15 text-teal-700',
      cardBg: 'bg-gradient-to-br from-teal-50/95 via-emerald-50/60 to-cyan-50/50',
      borderColor: 'border-teal-200 hover:border-teal-500',
      badgeBg: 'bg-white/95 text-teal-800 border border-teal-200/80',
      categoryIds: ['speech_therapy', 'dental_hygiene', 'orthoptist', 'footcare'],
      highlight: '言語・歯科衛生・目の訓練・足爪ケア',
    },
    {
      id: 'mama_lifestyle',
      name: 'ママ・ベビー & 食事相談',
      badge: 'ライフステージ',
      subtitle: '助産師・管理栄養士・離乳食育児・心理カウンセリング',
      description: '産前産後ケア・母乳マッサージ・持病の食事制限相談・離乳食アドバイス・心のメンタルケア',
      icon: FamilyLifestyleGroupIcon,
      themeColor: 'text-rose-700',
      iconBg: 'bg-rose-500/15 text-rose-700',
      cardBg: 'bg-gradient-to-br from-rose-50/95 via-pink-50/60 to-red-50/50',
      borderColor: 'border-rose-200 hover:border-rose-500',
      badgeBg: 'bg-white/95 text-rose-800 border border-rose-200/80',
      categoryIds: ['midwife', 'dietitian', 'parenting', 'counseling'],
      highlight: '助産師・栄養指導・離乳食・メンタル',
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

  // セラピスト一覧画面を表示するフラグ (メニューが選択されているか、検索クエリが入力されている場合)
  const isViewingTherapists = selectedCategory !== null || searchQuery.trim().length > 0;
  
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

      // カテゴリフィルター
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
      }

      // フリーワード検索
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = user?.name.toLowerCase().includes(q);
        const matchesBio = tp.bio.toLowerCase().includes(q);
        const matchesSpeciality = tp.specialities.some((s) => s.toLowerCase().includes(q));
        const matchesCampaign = tp.campaign?.badge.toLowerCase().includes(q) || tp.campaign?.title?.toLowerCase().includes(q);
        if (!matchesName && !matchesBio && !matchesSpeciality && !matchesCampaign) return false;
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
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-3xl shadow-lg flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm">予約リクエストを送信しました！</h4>
              <p className="text-xs text-white/90">
                {bookedSuccessInfo.name} さんの承認待ちです。マイ予約・履歴ページからステータスを確認できます。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/bookings"
              className="px-4 py-2 bg-white text-emerald-800 text-xs font-bold rounded-xl shadow-xs hover:bg-emerald-50 transition"
            >
              予約一覧を見る
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

      {/* トップヘッダーエリア (現在地・検索) */}
      <div className="space-y-3">
        {/* 上部: 現在地表示 */}
        <div className="flex items-center gap-2 text-slate-600 pb-0.5">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">施術場所:</span>
            <span className="text-xs font-bold text-slate-800 truncate max-w-xs sm:max-w-md">
              {userLocation.name}
            </span>
          </div>
        </div>

        {/* 検索バー */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="セラピスト名、もみほぐし、理学・作業療法、言語、鍼灸、栄養指導、特典などで検索..."
            className="w-full pl-12 pr-14 py-3 bg-white border border-slate-200 rounded-3xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-emerald-500 focus:border-emerald-500 shadow-2xs transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full px-2 py-0.5 transition"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {!isViewingTherapists ? (
        /* ========================================================
           メニュー選択画面 (2段階ステップ: ①大ジャンル選択 → ②詳細カテゴリー選択)
           ======================================================== */
        selectedGenre === null ? (
          /* --------------------------------------------------------
             Step 1: 大ジャンル (グループ) 選択画面
             -------------------------------------------------------- */
          <div className="space-y-4 pt-1 animate-fadeIn">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                施術ジャンルをお選びください
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                気になるジャンルをタップすると、さらに詳しい専門カテゴリー・職種が表示されます
              </p>
            </div>

            {/* クイックアクセス: すべての施術者から探す */}
            <button
              onClick={() => setSelectedCategory('all')}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white p-4 sm:p-4.5 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.99] flex items-center justify-between text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-2xs group-hover:scale-105 transition">
                  <Sparkles className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base sm:text-lg tracking-tight">
                      すべての登録施術者から探す
                    </span>
                    <span className="text-[10px] sm:text-xs font-black bg-white/20 px-2 py-0.5 rounded-full">
                      全{getCategoryCount('all')}名
                    </span>
                  </div>
                  <p className="text-xs text-white/90 mt-0.5 hidden sm:block">
                    全ジャンルの施術者を、現在地からの距離順やオススメ順で一覧表示します
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-white group-hover:text-emerald-800 text-white flex items-center justify-center transition shrink-0 ml-2">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* 4つの大ジャンルカード (2x2グリッド) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4.5 pt-1">
              {genres.map((genre) => {
                const Icon = genre.icon;
                const count = getGenreCount(genre.categoryIds);

                return (
                  <button
                    key={genre.id}
                    onClick={() => setSelectedGenre(genre.id)}
                    className={`group relative ${genre.cardBg} border-2 ${genre.borderColor} rounded-3xl p-5 sm:p-6 text-left shadow-xs hover:shadow-lg transition-all duration-200 active:scale-[0.98] flex flex-col justify-between min-h-[160px] sm:min-h-[180px] overflow-hidden cursor-pointer`}
                  >
                    <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    {/* 上部: アイコン & 在籍人数バッジ */}
                    <div className="flex items-center justify-between gap-2 relative z-10">
                      <div
                        className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105 shadow-2xs ${genre.iconBg}`}
                      >
                        <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs font-black px-2.5 py-1 rounded-full shadow-2xs ${genre.badgeBg}`}>
                          計{count}名
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {genre.badge}
                        </span>
                      </div>
                    </div>

                    {/* 下部: ジャンル名 & サブタイトル & 含まれる専門職ピル */}
                    <div className="mt-4 relative z-10">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-black text-lg sm:text-xl text-slate-900 group-hover:text-slate-950 transition tracking-tight">
                          {genre.name}
                        </h3>
                        <div className="w-7 h-7 rounded-full bg-white/90 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center text-slate-400 shadow-2xs transition shrink-0">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-xs font-bold text-slate-600 mt-1 line-clamp-1">
                        {genre.subtitle}
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400">対象:</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/80 text-slate-700 border border-slate-200/60">
                          {genre.highlight}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* --------------------------------------------------------
             Step 2: 詳細カテゴリー (各職種) 選択画面
             -------------------------------------------------------- */
          <div className="space-y-4 pt-1 animate-fadeIn">
            {/* 上部ナビゲーション: ジャンル一覧に戻るボタン */}
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <button
                onClick={() => setSelectedGenre(null)}
                className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-bold shadow-2xs hover:shadow-xs transition flex items-center gap-1.5 active:scale-95 group cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
                <span>ジャンル一覧に戻る</span>
              </button>

              {currentGenreInfo && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <span>ジャンル:</span>
                  <span className="text-slate-900 font-black">{currentGenreInfo.name}</span>
                </div>
              )}
            </div>

            {/* 選択中ジャンルのバナー案内 */}
            {currentGenreInfo && (
              <div className={`p-4 sm:p-5 rounded-3xl ${currentGenreInfo.cardBg} border-2 ${currentGenreInfo.borderColor} flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs`}>
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${currentGenreInfo.iconBg}`}>
                    {React.createElement(currentGenreInfo.icon, { className: 'w-6 h-6' })}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base sm:text-lg text-slate-900">
                        {currentGenreInfo.name}
                      </h3>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${currentGenreInfo.badgeBg}`}>
                        計{getGenreCount(currentGenreInfo.categoryIds)}名在籍
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {currentGenreInfo.description}
                    </p>
                  </div>
                </div>

                {/* このジャンル全員をまとめて見るボタン */}
                <button
                  onClick={() => setSelectedCategory(`genre_${currentGenreInfo.id}`)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  <span>このジャンル全員を見る</span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
                </button>
              </div>
            )}

            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                詳しいカテゴリー（専門職）をお選びください
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                目的の専門職・施術内容をタップすると、対応可能なセラピスト一覧が表示されます
              </p>
            </div>

            {/* ジャンルに属する詳細カテゴリーボタン一覧 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4.5">
              {categories
                .filter((cat) => currentGenreInfo?.categoryIds.includes(cat.id))
                .map((cat) => {
                  const Icon = cat.icon;
                  const count = getCategoryCount(cat.id);

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`group relative ${cat.cardBg} border-2 ${cat.borderColor} rounded-3xl p-4 sm:p-5 text-left shadow-xs hover:shadow-lg transition-all duration-200 active:scale-[0.98] flex flex-col justify-between min-h-[145px] sm:min-h-[160px] overflow-hidden cursor-pointer`}
                    >
                      <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                      {/* 上部: アイコン & 在籍人数バッジ */}
                      <div className="flex items-center justify-between gap-2 relative z-10">
                        <div
                          className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105 shadow-2xs ${cat.bgColor} ${cat.iconColor}`}
                        >
                          <Icon className="w-6 h-6 sm:w-6.5 sm:h-6.5" />
                        </div>
                        <span className={`text-xs font-black px-2.5 py-1 rounded-full shadow-2xs ${cat.badgeBg}`}>
                          {count}名
                        </span>
                      </div>

                      {/* 下部: メニュー名 & サブタイトル & 矢印 */}
                      <div className="mt-3.5 relative z-10">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-black text-base sm:text-lg text-slate-900 group-hover:text-slate-950 transition tracking-tight">
                            {cat.label}
                          </h3>
                          <div className="w-6 h-6 rounded-full bg-white/90 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center text-slate-400 shadow-2xs transition shrink-0">
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <p className="text-xs sm:text-[13px] font-medium text-slate-600 line-clamp-1 mt-0.5 group-hover:text-slate-800 transition">
                          {cat.subtitle}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                          {cat.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )
      ) : (
        /* ========================================================
           セラピスト表示画面: 戻るボタン・絞り込み・ソート・ビュー切替・一覧
           ======================================================== */
        <div className="space-y-4 animate-fadeIn">
          {/* 上部ナビゲーション: 戻るボタン ＆ 選択中のジャンル/カテゴリー表示 */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                }}
                className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-bold shadow-2xs hover:shadow-xs transition flex items-center gap-1.5 active:scale-95 group shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
                <span>{selectedGenre ? 'カテゴリー選択に戻る' : 'メニュー一覧に戻る'}</span>
              </button>

              {selectedGenre && (
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedGenre(null);
                    setSearchQuery('');
                  }}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-700 hover:underline px-2 py-1 transition cursor-pointer"
                >
                  ジャンル一覧へ
                </button>
              )}
            </div>

            {currentCategoryInfo && (
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${currentCategoryInfo.bgColor} ${currentCategoryInfo.iconColor}`}>
                  {React.createElement(currentCategoryInfo.icon, { className: 'w-4 h-4' })}
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900 leading-none">
                    {currentCategoryInfo.label}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
                    {currentCategoryInfo.subtitle}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 絞り込み＆ソート ボタングループ */}
          <div className="flex flex-wrap items-center gap-2 pb-1 pt-1">
            {/* ソート: オススメ順 */}
            <button
              onClick={() => setSortBy('recommended')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shadow-2xs ${
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
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shadow-2xs ${
                sortBy === 'rating'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${sortBy === 'rating' ? 'fill-white' : 'text-amber-400 fill-amber-400'}`} />
              <span>評価が高い順</span>
            </button>

            {/* ソート: 距離が近い順 */}
            <button
              onClick={() => setSortBy('distance')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shadow-2xs ${
                sortBy === 'distance'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 ${sortBy === 'distance' ? 'text-white' : 'text-emerald-600'}`} />
              <span>距離が近い順</span>
            </button>

            {/* ソート: 料金が安い順 */}
            <button
              onClick={() => setSortBy('price_asc')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shadow-2xs ${
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
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shadow-2xs ${
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shadow-2xs ${
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
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
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
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
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
                  setSortBy('recommended');
                  setSearchQuery('');
                }}
                className="text-[11px] text-slate-400 hover:text-slate-600 font-bold px-2 py-1 underline whitespace-nowrap"
              >
                条件をリセット
              </button>
            )}
          </div>

          {/* 絞り込みやソートボタンの下: 該当件数 ＆ ビュー切替 (カード / リスト / マップ) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 pb-1 border-t border-slate-100">
            <div className="text-xs text-slate-500 font-medium">
              該当 <strong className="text-slate-900 font-bold">{therapistsList.length}</strong> 名のセラピスト
              {sortBy === 'recommended' && <span className="ml-1 text-slate-500 font-bold">（オススメ順）</span>}
              {sortBy === 'rating' && <span className="ml-1 text-amber-600 font-bold">（評価が高い順）</span>}
              {sortBy === 'distance' && <span className="ml-1 text-emerald-600 font-bold">（現在地から近い順）</span>}
              {sortBy === 'price_asc' && <span className="ml-1 text-indigo-600 font-bold">（料金が安い順）</span>}
              {sortBy === 'price_desc' && <span className="ml-1 text-indigo-600 font-bold">（料金が高い順）</span>}
              {onlyCampaign && (
                <span className="ml-1.5 text-emerald-600 font-bold">🎁 特典・キャンペーン対象</span>
              )}
            </div>

            {/* ビュー切替 (カード / リスト / マップ) */}
            <div className="flex items-center self-end sm:self-auto bg-slate-100/90 p-1 rounded-2xl">
              <button
                onClick={() => setViewMode('card')}
                className={`p-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
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
                className={`p-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
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
                className={`p-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
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

      {/* セラピスト一覧 ビュー表示 */}
      {viewMode === 'map' ? (
        <RealLeafletMap
          onSelectTherapist={(id) => setBookingTherapistId(id)}
          filterType={filterStyle}
          therapists={therapistsList}
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
              <p className="text-xs text-slate-500 mt-1">
                フィルターの条件を緩めるか、別のキーワードでお試しください。
              </p>
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
                          <div className="flex items-center text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span className="ml-1 text-slate-900 font-black">{tp.rating_avg}</span>
                          </div>
                          <span className="text-slate-400 text-[11px]">({tp.reviews_count}件)</span>
                        </div>

                        {/* 距離 & 移動時間 */}
                        <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 font-bold px-2 py-0.5 rounded-lg border border-emerald-200">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            {tp.distance}km
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
                          現在地から {tp.distance} km
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-slate-500" />
                          約{travelTime}分
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs">
                        <div className="flex items-center text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span className="ml-1 text-slate-900 font-black">{tp.rating_avg}</span>
                          <span className="text-slate-400 font-normal ml-0.5">({tp.reviews_count}件)</span>
                        </div>

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
        </div>
      )}

      {/* 予約モーダル */}
      {bookingTherapistId && (
        <BookingModal
          therapistId={bookingTherapistId}
          onClose={() => setBookingTherapistId(null)}
          onSuccess={(id) => {
            const bookedTp = therapistProfiles[bookingTherapistId];
            const bookedUser = allUsers.find((u) => u.id === bookingTherapistId);
            setBookingTherapistId(null);
            setBookedSuccessInfo({
              id,
              name: bookedUser?.name || 'セラピスト',
            });
          }}
        />
      )}
    </div>
  );
};

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

// カテゴリ用ベクターアイコン（施術内容が直感的に伝わるデザイン）
const PhysicalTherapyCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* 直立した整った姿勢と関節アライメント */}
    <circle cx="12" cy="4" r="2.2" />
    <path d="M12 6.5v13.5" />
    <path d="M7.5 10.5l4.5-1.5 4.5 1.5" />
    <path d="M9 16l3-1.5 3 1.5" />
    <path d="M9 20l3-5 3 5" />
  </svg>
);

const MassageCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* 筋肉をもみほぐす手技 */}
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3" />
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v7" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);

const AromaCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* アロマオイルの雫と癒やしのリーフ */}
    <path d="M12 2.5l5.5 5.8a7.8 7.8 0 1 1-11 0z" />
    <path d="M12 11.5c1.8-1.8 3.5-1 3.5 1.2s-2.2 3.3-3.5 3.3" />
  </svg>
);

const ChiropracticCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* 背骨と骨盤の歪み矯正アライメント */}
    <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="1.5 2" />
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="9" r="1.5" />
    <circle cx="12" cy="13" r="1.5" />
    {/* 骨盤ウィング */}
    <path d="M6 16c0-2.5 2.5-3.5 6-3.5s6 1 6 3.5c0 2.5-3 4-6 4s-6-1.5-6-4z" />
    {/* 矯正矢印 */}
    <path d="M4 9h2.5" />
    <path d="M20 9h-2.5" />
  </svg>
);

const HeadSpaCategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* フェイスラインと頭皮ヘッドスパ・ウェーブ */}
    <path d="M5 10c0 4.5 3.1 8 7 8s7-3.5 7-8-3.1-8-7-8c-2 0-3.9.9-5.1 2.3" />
    <path d="M9.5 11c.8 0 1.5-.7 1.5-1.5" />
    <path d="M14.5 11c.8 0 1.5-.7 1.5-1.5" />
    <path d="M10 14.5c1 .8 3 .8 4 0" />
    {/* 頭頂部のヘッドスパマッサージ波動 */}
    <path d="M9 2a3 3 0 0 1 6 0" />
    <path d="M7 3.5a4 4 0 0 1 10 0" />
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
  // 選択中のカテゴリ（初期値は null = 最初はメニュー選択画面）
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

  // カテゴリ一覧 (アイコン、わかりやすいサブタイトル・説明付き)
  const categories = [
    {
      id: 'all',
      label: 'すべて',
      subtitle: '全ジャンルから探す',
      description: '愛媛県内の登録セラピスト全員を一覧表示',
      icon: Sparkles,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      id: 'physical_therapy',
      label: '整体・理学',
      subtitle: '肩こり・腰痛・関節の根本改善',
      description: '国家資格保持者による本格リハビリ・整体',
      icon: PhysicalTherapyCategoryIcon,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'massage',
      label: 'もみほぐし',
      subtitle: '全身疲労・筋肉のコリ解消',
      description: '手技で深層筋肉をじんわりほぐすボディケア',
      icon: MassageCategoryIcon,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      id: 'aroma',
      label: 'アロマ・リンパ',
      subtitle: '極上の癒やし・むくみ解消',
      description: '選べる上質精油で巡りを整えるオイルトリートメント',
      icon: AromaCategoryIcon,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
    },
    {
      id: 'chiropractic',
      label: 'カイロ・骨盤',
      subtitle: '骨盤矯正・姿勢の歪みケア',
      description: '背骨や骨盤のアライメントを整え美姿勢へ',
      icon: ChiropracticCategoryIcon,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      id: 'beauty',
      label: 'ヘッドスパ',
      subtitle: '眼精疲労・頭痛・睡眠改善',
      description: '頭皮をもみほぐし脳疲労と首肩の重さをリフレッシュ',
      icon: HeadSpaCategoryIcon,
      iconColor: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
  ];

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
  const currentCategoryInfo = categories.find((c) => c.id === selectedCategory);

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
        const hasCat = userServices.some((s) => s.category === selectedCategory);
        if (!hasCat) return false;
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
            placeholder="セラピスト名、もみほぐし、理学療法、アロマ、特典などで検索..."
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
           初期画面: 6つの押しやすく分かりやすいメニューボタン
           ======================================================== */
        <div className="space-y-4 pt-1 animate-fadeIn">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              施術メニューをお選びください
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              気になる施術ジャンルをタップすると、対応可能なセラピスト一覧が表示されます
            </p>
          </div>

          {/* 6つの押しやすく分かりやすいメニューボタン */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const count = getCategoryCount(cat.id);

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="group relative bg-white border-2 border-slate-200/90 hover:border-emerald-500 active:border-emerald-600 rounded-3xl p-4 sm:p-5 text-left shadow-xs hover:shadow-lg transition-all duration-200 active:scale-[0.98] flex flex-col justify-between min-h-[140px] sm:min-h-[150px] overflow-hidden cursor-pointer"
                >
                  {/* 背景ホバーエフェクト */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 group-hover:to-emerald-50/40 transition-colors pointer-events-none" />

                  {/* 上部: アイコン & 在籍人数バッジ */}
                  <div className="flex items-center justify-between gap-2 relative z-10">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105 shadow-2xs ${cat.bgColor} ${cat.iconColor}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition">
                      {count}名
                    </span>
                  </div>

                  {/* 下部: メニュー名 & サブタイトル & 矢印 */}
                  <div className="mt-3 relative z-10">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-black text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition">
                        {cat.label}
                      </h3>
                      <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-slate-400 transition shrink-0">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 mt-0.5 group-hover:text-slate-700 transition">
                      {cat.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* ========================================================
           セラピスト表示画面: 戻るボタン・絞り込み・ソート・ビュー切替・一覧
           ======================================================== */
        <div className="space-y-4 animate-fadeIn">
          {/* 上部ナビゲーション: メニュー一覧に戻るボタン ＆ 選択中のジャンル表示 */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
              }}
              className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-bold shadow-2xs hover:shadow-xs transition flex items-center gap-1.5 active:scale-95 group shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
              <span>メニュー一覧に戻る</span>
            </button>

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

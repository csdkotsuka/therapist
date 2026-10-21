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
  Shield,
  Tag,
  Check,
  ArrowUpDown,
  Filter,
  BadgePercent,
  Calendar,
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

type SortOption = 'recommended' | 'rating' | 'price_asc' | 'price_desc' | 'distance';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterStyle, setFilterStyle] = useState<'all' | 'visit' | 'store'>('all');
  const [onlyCampaign, setOnlyCampaign] = useState<boolean>(false); // 特典・キャンペーン有無
  const [onlyHighRating, setOnlyHighRating] = useState<boolean>(false); // 高評価 (4.8以上)
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

  // カテゴリ一覧
  const categories = [
    { id: 'all', label: 'すべて', icon: '✨' },
    { id: 'physical_therapy', label: '理学療法・整体', icon: '🦴' },
    { id: 'massage', label: 'もみほぐし', icon: '💆' },
    { id: 'aroma', label: 'アロマ・リンパ', icon: '🌿' },
    { id: 'chiropractic', label: 'カイロ・骨盤矯正', icon: '📐' },
    { id: 'beauty', label: '小顔・ヘッドスパ', icon: '💆‍♀️' },
  ];

  // セラピスト一覧のフィルタリングと複数ソート
  const therapistsList = Object.values(therapistProfiles)
    .filter((tp) => {
      if (!tp.is_approved) return false;

      // 施術スタイル絞り込み
      if (filterStyle === 'visit' && !tp.is_visit_based) return false;
      if (filterStyle === 'store' && !tp.is_store_based) return false;

      // 特典・キャンペーン有無絞り込み
      if (onlyCampaign && !tp.campaign) return false;

      // 高評価絞り込み (4.8以上)
      if (onlyHighRating && tp.rating_avg < 4.8) return false;

      const user = allUsers.find((u) => u.id === tp.user_id);
      const userServices = services.filter((s) => s.therapist_id === tp.user_id);

      // カテゴリフィルター
      if (selectedCategory !== 'all') {
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

  // アクティブなフィルター数をカウント
  const activeFiltersCount = (onlyCampaign ? 1 : 0) +
    (onlyHighRating ? 1 : 0) +
    (filterStyle !== 'all' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0);

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

      {/* Uber風 トップヘッダーエリア (現在地・検索・ビュースタイル) */}
      <div className="space-y-4">
        {/* 上部: さりげない現在地表示 & 表示形式切替 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
          <div className="flex items-center gap-2 text-slate-600">
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

        {/* 検索バー */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="セラピスト名、もみほぐし、理学療法、アロマ、特典などで検索..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-3xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-emerald-500 focus:border-emerald-500 shadow-2xs transition"
          />
        </div>

        {/* Uber風 カテゴリー選択カルーセル */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Uber風 絞り込みチップバー & ソートドロップダウン (複数選択可能) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* 特典・キャンペーン有無 フィルター */}
            <button
              onClick={() => setOnlyCampaign(!onlyCampaign)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                onlyCampaign
                  ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-600/30'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
              }`}
            >
              <BadgePercent className={`w-3.5 h-3.5 ${onlyCampaign ? 'text-white' : 'text-emerald-600'}`} />
              <span>🎁 特典・キャンペーンあり</span>
              {onlyCampaign && <Check className="w-3 h-3 ml-0.5" />}
            </button>

            {/* 出張のみ フィルター */}
            <button
              onClick={() => setFilterStyle(filterStyle === 'visit' ? 'all' : 'visit')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                filterStyle === 'visit'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-emerald-500" />
              <span>出張のみ</span>
              {filterStyle === 'visit' && <Check className="w-3 h-3 ml-0.5" />}
            </button>

            {/* 店舗あり フィルター */}
            <button
              onClick={() => setFilterStyle(filterStyle === 'store' ? 'all' : 'store')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                filterStyle === 'store'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-teal-600" />
              <span>店舗あり</span>
              {filterStyle === 'store' && <Check className="w-3 h-3 ml-0.5" />}
            </button>

            {/* 高評価 (4.8以上) フィルター */}
            <button
              onClick={() => setOnlyHighRating(!onlyHighRating)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                onlyHighRating
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyHighRating ? 'fill-white' : 'text-amber-500 fill-amber-400'}`} />
              <span>4.8以上</span>
              {onlyHighRating && <Check className="w-3 h-3 ml-0.5" />}
            </button>

            {/* フィルターリセットボタン */}
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setOnlyCampaign(false);
                  setOnlyHighRating(false);
                  setFilterStyle('all');
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-[11px] text-slate-400 hover:text-slate-600 font-bold px-2 py-1 underline"
              >
                条件をクリア
              </button>
            )}
          </div>

          {/* ソート順選択ドロップダウン */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-2xl px-3 py-1 shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="並び替え順"
              className="py-1 bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="recommended">✨ オススメ順</option>
              <option value="rating">⭐ 評価の高い順</option>
              <option value="price_asc">💴 料金が安い順</option>
              <option value="price_desc">💴 料金が高い順</option>
              <option value="distance">📍 現在地から近い順</option>
            </select>
          </div>
        </div>
      </div>

      {/* 検索結果件数ステータス */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span className="font-medium">
          該当 <strong className="text-slate-900 font-bold">{therapistsList.length}</strong> 名のセラピスト
          {onlyCampaign && (
            <span className="ml-1 text-emerald-600 font-bold">（特典・キャンペーン対象）</span>
          )}
        </span>
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

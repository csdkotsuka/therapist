'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/context/AppContext';
import { formatPrice, calculateDistanceKm, estimateTravelTimeMinutes, formatDate } from '@/lib/geo';
import { InteractiveMap } from './InteractiveMap';
import { BookingModal } from './BookingModal';
import { LiveTrackingModal } from './LiveTrackingModal';
import { ReviewModal } from './ReviewModal';

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
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  Clock,
  Home,
  Building,
  CheckCircle,
  Map as MapIcon,
  List,
  Calendar,
  Sparkles,
  ArrowRight,
  Shield,
  Car,
  ChevronRight,
  HeartHandshake,
} from 'lucide-react';
import { Booking } from '@/types';

export const CustomerView: React.FC = () => {
  const {
    currentUser,
    therapistProfiles,
    allUsers,
    services,
    bookings,
    reviews,
    userLocation,
  } = useApp();

  // サブタブ: 'search' (セラピストを探す) | 'bookings' (マイ予約一覧)
  const [activeMainTab, setActiveMainTab] = useState<'search' | 'bookings'>('search');

  // フィルター
  const [filterStyle, setFilterStyle] = useState<'all' | 'visit' | 'store'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'distance' | 'rating'>('recommended');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // モーダル管理
  const [bookingTherapistId, setBookingTherapistId] = useState<string | null>(null);
  const [trackingBooking, setTrackingBooking] = useState<Booking | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  // カテゴリ定義
  const categories = [
    { id: 'all', label: 'すべて' },
    { id: 'physical_therapy', label: '理学療法・リハビリ' },
    { id: 'aroma', label: 'アロマ・リンパ' },
    { id: 'chiropractic', label: 'カイロ・骨盤矯正' },
    { id: 'beauty', label: '小顔・ヘッドスパ' },
  ];

  // セラピスト一覧のフィルタリングとソート
  const therapistsList = Object.values(therapistProfiles)
    .filter((tp) => {
      if (!tp.is_approved) return false;
      if (filterStyle === 'visit' && !tp.is_visit_based) return false;
      if (filterStyle === 'store' && !tp.is_store_based) return false;

      const user = allUsers.find((u) => u.id === tp.user_id);
      const userServices = services.filter((s) => s.therapist_id === tp.user_id);

      // カテゴリフィルター
      if (selectedCategory !== 'all') {
        const hasCat = userServices.some((s) => s.category === selectedCategory);
        if (!hasCat) return false;
      }

      // 検索クエリフィルター
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = user?.name.toLowerCase().includes(q);
        const matchesBio = tp.bio.toLowerCase().includes(q);
        const matchesSpeciality = tp.specialities.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesBio && !matchesSpeciality) return false;
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
      if (sortBy === 'distance') return a.distance - b.distance;
      if (sortBy === 'rating') return b.rating_avg - a.rating_avg;
      return (b.reviews_count * b.rating_avg) - (a.reviews_count * a.rating_avg);
    });

  // ログインユーザーの予約一覧
  const myBookings = bookings.filter((b) => b.customer_id === currentUser.id);

  return (
    <div className="space-y-6">
      {/* メインタブ切替 (探す vs マイ予約) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveMainTab('search')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeMainTab === 'search'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>セラピストを探す</span>
          </button>

          <button
            onClick={() => setActiveMainTab('bookings')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 relative ${
              activeMainTab === 'bookings'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>マイ予約・履歴</span>
            {myBookings.length > 0 && (
              <span className="w-5 h-5 bg-emerald-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {myBookings.length}
              </span>
            )}
          </button>
        </div>

        {/* 検索タブ時のビュー切り替え (リスト vs マップ) */}
        {activeMainTab === 'search' && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="リスト表示"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="マップ表示"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* タブ 1: セラピストを探す */}
      {activeMainTab === 'search' && (
        <div className="space-y-6">
          {/* Uber風 施術スタイル選択 (出張 vs 店舗) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 p-1.5 bg-slate-100/80 rounded-2xl max-w-xl">
            <button
              onClick={() => setFilterStyle('all')}
              className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                filterStyle === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              すべて表示
            </button>
            <button
              onClick={() => setFilterStyle('visit')}
              className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                filterStyle === 'visit'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>出張施術 (訪問)</span>
            </button>
            <button
              onClick={() => setFilterStyle('store')}
              className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                filterStyle === 'store'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>店舗へ行く</span>
            </button>
          </div>

          {/* 検索バー & フィルターバー */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="セラピスト名、専門分野（理学療法、骨盤矯正、アロマなど）で検索..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-emerald-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 focus:outline-emerald-500 shadow-2xs"
              >
                <option value="recommended">おすすめ順</option>
                <option value="distance">距離が近い順</option>
                <option value="rating">評価が高い順</option>
              </select>
            </div>
          </div>

          {/* カテゴリピル */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* ビューの描画 (マップ表示 or リスト表示) */}
          {viewMode === 'map' ? (
            <RealLeafletMap
              onSelectTherapist={(id) => setBookingTherapistId(id)}
              filterType={filterStyle}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {therapistsList.map((tp) => {
                const user = allUsers.find((u) => u.id === tp.user_id);
                const userServices = services.filter((s) => s.therapist_id === tp.user_id && s.is_active);
                const leadService = userServices[0];
                const travelTime = estimateTravelTimeMinutes(tp.distance);

                return (
                  <div
                    key={tp.user_id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    {/* カード上部画像・バッジ */}
                    <div className="p-5 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={user?.avatar_url}
                            alt={user?.name}
                            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-slate-900 text-sm">{user?.name}</h3>
                              <span title="本人確認済">
                                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className="flex items-center text-amber-500 font-bold text-xs">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                <span className="ml-1">{tp.rating_avg}</span>
                              </div>
                              <span className="text-[11px] text-slate-400">({tp.reviews_count}件の評価)</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                              <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold">
                                <MapPin className="w-3 h-3" />
                                {tp.distance}km
                              </span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-0.5 text-slate-600">
                                <Clock className="w-3 h-3" />
                                約{travelTime}分
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 出張・店舗バッジ */}
                        <div className="flex flex-col gap-1 items-end shrink-0">
                          {tp.is_visit_based && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <Home className="w-2.5 h-2.5" />
                              出張可
                            </span>
                          )}
                          {tp.is_store_based && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                              <Building className="w-2.5 h-2.5" />
                              店舗あり
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 専門タグ */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {tp.specialities.map((spec) => (
                          <span
                            key={spec}
                            className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      {/* 自己紹介抜粋 */}
                      <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                        {tp.bio}
                      </p>
                    </div>

                    {/* 代表メニュープレビュー */}
                    {leadService && (
                      <div className="mx-5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex justify-between items-center text-slate-500 text-[10px] mb-1">
                          <span>人気メニュー</span>
                          <span>{leadService.duration_minutes}分</span>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-xs line-clamp-1">
                          {leadService.title}
                        </h4>
                        <div className="mt-1 flex justify-between items-baseline">
                          <span className="text-[10px] text-slate-400">税込・出張費込</span>
                          <span className="text-sm font-black text-slate-900">
                            {formatPrice(leadService.price)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* アクションボタン */}
                    <div className="p-5 pt-3 mt-auto">
                      <button
                        onClick={() => setBookingTherapistId(tp.user_id)}
                        className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 group-hover:shadow-lg"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>メニューを見る・予約する</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* タブ 2: マイ予約一覧 */}
      {activeMainTab === 'bookings' && (
        <div className="space-y-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">あなたの予約リクエスト・履歴</h3>
            <span className="text-xs text-slate-500">全 {myBookings.length} 件</span>
          </div>

          {myBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
                <Calendar className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm">予約がまだありません</h4>
              <p className="text-xs text-slate-500 mt-1">
                近くの凄腕セラピストを検索して、リフレッシュしましょう。
              </p>
              <button
                onClick={() => setActiveMainTab('search')}
                className="mt-4 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
              >
                セラピストを検索する
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myBookings.map((b) => {
                const therapist = therapistProfiles[b.therapist_id];
                const therapistUser = allUsers.find((u) => u.id === b.therapist_id);
                const service = services.find((s) => s.id === b.service_id);
                const hasReviewed = reviews.some((r) => r.booking_id === b.id);

                const getStatusBadge = (status: string) => {
                  switch (status) {
                    case 'pending':
                      return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200">セラピスト承認待ち</span>;
                    case 'confirmed':
                      return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">予約確定・準備中</span>;
                    case 'completed':
                      return <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-sky-200">施術完了</span>;
                    case 'cancelled':
                      return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-rose-200">キャンセル済</span>;
                    default:
                      return null;
                  }
                };

                return (
                  <div
                    key={b.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={therapistUser?.avatar_url}
                        alt={therapistUser?.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/20 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{therapistUser?.name}</span>
                          {getStatusBadge(b.status)}
                        </div>
                        <h4 className="text-xs font-semibold text-slate-700 mt-1">{service?.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            {formatDate(b.scheduled_at)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            {b.booking_type === 'visit' ? (
                              <Home className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Building className="w-3.5 h-3.5 text-teal-600" />
                            )}
                            {b.booking_type === 'visit' ? '出張施術' : '店舗訪問'}
                          </span>
                          <span className="font-bold text-slate-900">{formatPrice(b.total_amount)}</span>
                        </div>
                        {b.booking_type === 'visit' && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                            訪問先: {b.visit_address}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-col items-end gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                      {/* 出張施術かつ確定済みならリアルタイム追跡ボタン */}
                      {b.booking_type === 'visit' && (b.status === 'confirmed' || b.status === 'pending') && (
                        <button
                          onClick={() => setTrackingBooking(b)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
                        >
                          <Car className="w-3.5 h-3.5 text-emerald-400" />
                          <span>セラピストの現在地を追跡</span>
                        </button>
                      )}

                      {/* 完了時にレビュー投稿 */}
                      {b.status === 'completed' && !hasReviewed && (
                        <button
                          onClick={() => setReviewBooking(b)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>評価・レビューを投稿</span>
                        </button>
                      )}

                      {hasReviewed && (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          レビュー投稿済み
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
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
            setActiveMainTab('bookings');
          }}
        />
      )}

      {/* リアルタイム追跡モーダル */}
      {trackingBooking && (
        <LiveTrackingModal
          booking={trackingBooking}
          onClose={() => setTrackingBooking(null)}
        />
      )}

      {/* レビューモーダル */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
        />
      )}
    </div>
  );
};

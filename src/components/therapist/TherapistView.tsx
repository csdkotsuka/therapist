'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatPrice, formatDate } from '@/lib/geo';
import { Service, Booking } from '@/types';
import { TherapistProfileEdit } from './TherapistProfileEdit';
import { BookingChatModal } from '@/components/chat/BookingChatModal';
import {
  Calendar,
  Clock,
  MapPin,
  Check,
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Plus,
  Navigation,
  Sliders,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Home,
  Building,
  User,
  ExternalLink,
  Car,
  Star,
  MessageSquare,
  ThumbsUp,
  MessageCircle,
  Layers,
} from 'lucide-react';

export const TherapistView: React.FC = () => {
  const {
    currentUser,
    therapistProfiles,
    services,
    bookings,
    reviews,
    messages,
    updateBookingStatus,
    updateTherapistLocation,
    updateTherapistInfo,
    addService,
    allUsers,
  } = useApp();

  const therapist = therapistProfiles[currentUser.id];
  const myServices = services.filter((s) => s.therapist_id === currentUser.id);
  const myBookings = bookings.filter((b) => b.therapist_id === currentUser.id);
  const myReviews = reviews.filter((r) => r.therapist_id === currentUser.id);

  // タブ管理: 'requests' | 'schedule' | 'services' | 'reviews' | 'earnings' | 'profile'
  const [activeTab, setActiveTab] = useState<'requests' | 'schedule' | 'services' | 'reviews' | 'earnings' | 'profile'>('requests');

  // チャットモーダル状態
  const [chatBooking, setChatBooking] = useState<Booking | null>(null);

  // スケジュール・営業時間設定状態
  const [selectedDays, setSelectedDays] = useState<string[]>(
    therapist?.available_days || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  );
  const [startTime, setStartTime] = useState<string>(therapist?.available_hours_start || '09:00');
  const [endTime, setEndTime] = useState<string>(therapist?.available_hours_end || '21:00');
  const [isSeparateStoreHours, setIsSeparateStoreHours] = useState<boolean>(
    therapist?.is_separate_store_hours || false
  );
  const [storeStartTime, setStoreStartTime] = useState<string>(
    therapist?.store_hours_start || '10:00'
  );
  const [storeEndTime, setStoreEndTime] = useState<string>(
    therapist?.store_hours_end || '20:00'
  );
  const [visitRadius, setVisitRadius] = useState<number>(therapist?.visit_radius_km || 15);
  const [scheduleSavedToast, setScheduleSavedToast] = useState(false);

  // 新規メニューモーダル
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('8000');
  const [newDuration, setNewDuration] = useState('60');
  const [newCategory, setNewCategory] = useState<'physical_therapy' | 'massage' | 'aroma' | 'chiropractic' | 'beauty'>('physical_therapy');

  // GPS送信シミュレーション状態
  const [isGpsTransmitting, setIsGpsTransmitting] = useState<Record<string, boolean>>({});

  // 売上統計の計算
  const completedBookings = myBookings.filter((b) => b.status === 'completed');
  const totalGrossEarnings = completedBookings.reduce((sum, b) => sum + b.total_amount, 0);
  const totalNetEarnings = completedBookings.reduce((sum, b) => sum + b.therapist_earnings, 0);
  const totalPlatformFees = completedBookings.reduce((sum, b) => sum + b.platform_fee, 0);
  const pendingRequests = myBookings.filter((b) => b.status === 'pending');
  const activeBookings = myBookings.filter((b) => b.status === 'confirmed');

  const daysOfWeek = [
    { id: 'mon', label: '月' },
    { id: 'tue', label: '火' },
    { id: 'wed', label: '水' },
    { id: 'thu', label: '木' },
    { id: 'fri', label: '金' },
    { id: 'sat', label: '土' },
    { id: 'sun', label: '日' },
  ];

  const toggleDay = (id: string) => {
    if (selectedDays.includes(id)) {
      setSelectedDays(selectedDays.filter((d) => d !== id));
    } else {
      setSelectedDays([...selectedDays, id]);
    }
  };

  const handleAddServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addService({
      therapist_id: currentUser.id,
      title: newTitle,
      description: newDescription,
      price: parseInt(newPrice, 10),
      duration_minutes: parseInt(newDuration, 10),
      category: newCategory,
      is_active: true,
    });

    setIsAddServiceOpen(false);
    setNewTitle('');
    setNewDescription('');
    alert('新しいメニューを公開しました');
  };

  const handleSendGps = (bookingId: string) => {
    setIsGpsTransmitting((prev) => ({ ...prev, [bookingId]: true }));
    // ランダムに少し位置を更新（顧客宅への接近）
    if (therapist) {
      updateTherapistLocation(bookingId, therapist.lat + 0.002, therapist.lng + 0.002);
    }
    setTimeout(() => {
      setIsGpsTransmitting((prev) => ({ ...prev, [bookingId]: false }));
      alert('現在地GPS情報を顧客の追跡画面へリアルタイム送信しました！');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* セラピストステータスバナー */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar_url}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-400/30"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{currentUser.name} セラピスト</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                承認済みパートナー
              </span>
              {therapist?.is_store_based && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-200 border border-teal-400/30 flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  <span>店舗あり</span>
                </span>
              )}
              {therapist?.is_visit_based && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  <span>出張対応</span>
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-200 mt-1 line-clamp-1 max-w-md">
              {therapist?.store_name ? `【店舗】${therapist.store_name} • ` : ''}
              {therapist?.bio || 'プロフィール設定中'}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-emerald-100">
              <span>★ 評価 {therapist?.rating_avg || '5.0'} ({therapist?.reviews_count || 0}件)</span>
              {therapist?.is_visit_based && (
                <>
                  <span>•</span>
                  <span>出張対応半径: {visitRadius}km</span>
                </>
              )}
              {therapist?.is_store_based && therapist?.store_address && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-teal-200">
                    <Building className="w-3.5 h-3.5" />
                    <span>店舗住所: {therapist.store_address}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stripe Express 連携状態 */}
        <div className="bg-emerald-950/40 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/20 text-right w-full md:w-auto">
          <div className="flex items-center gap-2 justify-end text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Stripe Connect Express 連携済</span>
          </div>
          <div className="mt-1">
            <span className="text-[10px] text-emerald-200 block">振込可能残高</span>
            <span className="text-2xl font-black text-white">{formatPrice(totalNetEarnings)}</span>
          </div>
        </div>
      </div>

      {/* ナビゲーションタブ */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'requests'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>予約リクエスト・進行中</span>
          {pendingRequests.length > 0 && (
            <span className="w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>営業時間・シフト・出張設定</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'services'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>施術メニュー管理 ({myServices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'reviews'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>お客様の評価・口コミ ({myReviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'earnings'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>売上・振込明細</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4 text-teal-400" />
          <span>👤 プロフィール & 店舗情報編集</span>
        </button>
      </div>

      {/* タブ 1: 予約リクエスト・進行中 */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* 未承認リクエスト (Pending) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>新規予約リクエスト（承認・辞退の対応が必要です）</span>
              </h3>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                {pendingRequests.length}件の未対応
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
                現在、対応待ちの新規リクエストはありません。
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((b) => {
                  const customer = allUsers.find((u) => u.id === b.customer_id);
                  const service = services.find((s) => s.id === b.service_id);

                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={customer?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={customer?.name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-400 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{customer?.name} 様</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              {b.booking_type === 'visit' ? '出張訪問' : '店舗ご来店'}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">{service?.title}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                            <span className="font-bold text-emerald-700">{formatDate(b.scheduled_at)}</span>
                            <span>•</span>
                            <span>手取り報酬: <strong className="text-slate-900">{formatPrice(b.therapist_earnings)}</strong></span>
                            <span className="text-[10px] text-slate-400">(総額 {formatPrice(b.total_amount)})</span>
                          </div>
                          {b.booking_type === 'visit' && (
                            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              出張先: {b.visit_address}
                            </p>
                          )}
                          {b.customer_notes && (
                            <p className="text-[11px] bg-slate-50 p-2 rounded-xl text-slate-600 mt-2 border border-slate-100">
                              💬 顧客からの要望: {b.customer_notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* アクションボタン */}
                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 justify-end border-t md:border-t-0 pt-3 md:pt-0">
                        {/* メッセージボタン */}
                        <button
                          onClick={() => setChatBooking(b)}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs relative"
                          title="お客様とメッセージで連絡"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>メッセージ</span>
                          {messages.some((m) => m.booking_id === b.id && m.receiver_id === currentUser.id && !m.is_read) && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            if (confirm('このリクエストを辞退しますか？')) {
                              updateBookingStatus(b.id, 'cancelled');
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5 text-rose-500" />
                          <span>辞退</span>
                        </button>
                        <button
                          onClick={() => updateBookingStatus(b.id, 'confirmed')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>承認</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 進行中・確定済みの予約 (Confirmed) */}
          <div className="space-y-3 pt-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>進行中・確定済みの予約 ({activeBookings.length}件)</span>
            </h3>

            {activeBookings.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
                現在、進行中の確定予約はありません。
              </div>
            ) : (
              <div className="space-y-3">
                {activeBookings.map((b) => {
                  const customer = allUsers.find((u) => u.id === b.customer_id);
                  const service = services.find((s) => s.id === b.service_id);

                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={customer?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={customer?.name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-400 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{customer?.name} 様</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              確定済み
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {b.booking_type === 'visit' ? '出張' : '店舗'}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">{service?.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span className="font-bold text-emerald-700">{formatDate(b.scheduled_at)}</span>
                            <span>•</span>
                            <span>報酬: {formatPrice(b.therapist_earnings)}</span>
                          </div>
                          {b.booking_type === 'visit' && (
                            <p className="text-[11px] text-slate-500 mt-1">
                              訪問先: {b.visit_address}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 justify-end border-t md:border-t-0 pt-3 md:pt-0">
                        {/* メッセージボタン */}
                        <button
                          onClick={() => setChatBooking(b)}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs relative"
                          title="お客様とメッセージで連絡"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>メッセージ</span>
                          {messages.some((m) => m.booking_id === b.id && m.receiver_id === currentUser.id && !m.is_read) && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          )}
                        </button>

                        {/* 出張時の現在地GPS送信シミュレータ */}
                        {b.booking_type === 'visit' && (
                          <button
                            onClick={() => handleSendGps(b.id)}
                            disabled={isGpsTransmitting[b.id]}
                            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                          >
                            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{isGpsTransmitting[b.id] ? '送信中...' : 'GPS位置情報を送信'}</span>
                          </button>
                        )}

                        {/* 施術完了報告ボタン */}
                        <button
                          onClick={() => {
                            if (confirm('施術が完了しましたか？Stripe売上が計上されます。')) {
                              updateBookingStatus(b.id, 'completed');
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>施術完了を報告</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* タブ 2: 営業時間・シフト・出張エリア設定 */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 max-w-3xl">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>稼働シフト・営業時間 & 出張エリア設定</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              顧客が予約できる受付曜日・時間帯を設定します。出張訪問と店舗来店は1画面で共通または個別に管理できます。
            </p>
          </div>

          {/* 曜日選択 */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                受付可能曜日（稼働日） <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                選択されていない曜日は「定休日」として自動登録されます
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((d) => {
                const isSelected = selectedDays.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDay(d.id)}
                    className={`w-11 h-11 rounded-2xl text-xs font-black transition flex flex-col items-center justify-center gap-0.5 shadow-2xs ${
                      isSelected
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-600/30'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <span>{d.label}</span>
                    <span className="text-[9px] font-normal opacity-80">
                      {isSelected ? '営業' : '休'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 出張・店舗の時間設定モード切替 */}
          {therapist?.is_store_based && therapist?.is_visit_based && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  出張・店舗の受付時間の一括管理
                </span>
                <span className="text-[11px] text-slate-500">
                  {isSeparateStoreHours
                    ? '出張施術と店舗施術で別々の時間帯を設定します'
                    : '出張施術と店舗施術で同じ受付時間帯を使用します（推奨・自動連動）'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSeparateStoreHours}
                  onChange={(e) => setIsSeparateStoreHours(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          )}

          {/* 時間帯設定 */}
          {!isSeparateStoreHours ? (
            /* 共通時間帯設定 (通常モード) */
            <div className="space-y-2 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>基本の受付・営業時間（出張・店舗 共通）</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  共通連動中
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">開始時刻</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-emerald-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">終了時刻</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-emerald-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* 個別時間帯設定 (詳細モード: 出張 vs 店舗 を1画面で比較設定) */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
              {/* 出張の受付枠 */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <Home className="w-4 h-4 text-emerald-600" />
                  <span>出張施術の受付時間</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">開始時刻</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">終了時刻</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* 店舗の営業時間 */}
              <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                  <Building className="w-4 h-4 text-teal-700" />
                  <span>店舗サロンの営業時間</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">開店時刻</label>
                    <input
                      type="time"
                      value={storeStartTime}
                      onChange={(e) => setStoreStartTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">閉店時刻</label>
                    <input
                      type="time"
                      value={storeEndTime}
                      onChange={(e) => setStoreEndTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 自動反映プレビュー */}
          {therapist?.is_store_based && (
            <div className="p-3.5 bg-slate-100 rounded-2xl text-xs text-slate-600 flex items-start gap-2">
              <Building className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">
                  店舗・サロン情報の「営業時間・定休日」へ自動連動します
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  表示プレビュー: 【
                  {selectedDays.map((d) => daysOfWeek.find((x) => x.id === d)?.label).join('・')}曜{' '}
                  {!isSeparateStoreHours ? `${startTime} 〜 ${endTime}` : `${storeStartTime} 〜 ${storeEndTime}`}{' '}
                  (
                  {daysOfWeek.filter((d) => !selectedDays.includes(d.id)).length > 0
                    ? `${daysOfWeek.filter((d) => !selectedDays.includes(d.id)).map((d) => d.label).join('・')}曜定休`
                    : '無休'}
                  )】
                </span>
              </div>
            </div>
          )}

          {/* 出張可能エリア (半径スライダー) */}
          {therapist?.is_visit_based && (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-emerald-600" />
                  <span>出張訪問可能エリア（半径）</span>
                </label>
                <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  拠点から {visitRadius} km
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="30"
                step="1"
                value={visitRadius}
                onChange={(e) => setVisitRadius(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>3km (近隣のみ)</span>
                <span>15km (松山市中心部・今治等)</span>
                <span>30km (広域対応)</span>
              </div>
            </div>
          )}

          {/* 保存ボタン */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            {scheduleSavedToast && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                <span>シフト・営業時間設定を保存しました（店舗情報にも連動反映済）</span>
              </span>
            )}
            <button
              type="button"
              onClick={async () => {
                const dayLabelsMap: Record<string, string> = {
                  mon: '月',
                  tue: '火',
                  wed: '水',
                  thu: '木',
                  fri: '金',
                  sat: '土',
                  sun: '日',
                };
                const openDaysStr = selectedDays.map((id) => dayLabelsMap[id]).join('・');
                const closedDayIds = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].filter(
                  (id) => !selectedDays.includes(id)
                );
                const closedDaysStr = closedDayIds.length > 0
                  ? `${closedDayIds.map((id) => dayLabelsMap[id]).join('・')}曜定休`
                  : '無休';

                const effectiveStoreStart = isSeparateStoreHours ? storeStartTime : startTime;
                const effectiveStoreEnd = isSeparateStoreHours ? storeEndTime : endTime;
                const autoStoreHours = `${openDaysStr} ${effectiveStoreStart} 〜 ${effectiveStoreEnd} (${closedDaysStr})`;

                await updateTherapistInfo(
                  currentUser.id,
                  {},
                  {
                    available_days: selectedDays,
                    available_hours_start: startTime,
                    available_hours_end: endTime,
                    is_separate_store_hours: isSeparateStoreHours,
                    store_hours_start: storeStartTime,
                    store_hours_end: storeEndTime,
                    store_hours: autoStoreHours,
                    visit_radius_km: visitRadius,
                  }
                );

                setScheduleSavedToast(true);
                setTimeout(() => setScheduleSavedToast(false), 3500);
              }}
              className="ml-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95"
            >
              スケジュール・営業時間を保存
            </button>
          </div>
        </div>
      )}

      {/* タブ 3: 施術メニュー管理 */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">施術メニュー設定</h3>
              <p className="text-xs text-slate-500">料金や所要時間の変更、新メニューの追加を行えます。</p>
            </div>
            <button
              onClick={() => setIsAddServiceOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>新メニューを追加</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myServices.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{s.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                      公開中
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{s.description}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">所要時間: {s.duration_minutes}分</span>
                  <span className="text-base font-black text-slate-900">{formatPrice(s.price)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 新規メニューモーダル */}
          {isAddServiceOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-slate-900 text-sm">新規メニューの登録</h4>
                  <button
                    onClick={() => setIsAddServiceOpen(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddServiceSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">メニュー名</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="例: 全身リセット整体 60分"
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">説明・施術内容</label>
                    <textarea
                      rows={3}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="施術の特徴や対象とする症状を入力してください"
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">料金 (円・税込)</label>
                      <input
                        type="number"
                        required
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">所要時間 (分)</label>
                      <input
                        type="number"
                        required
                        value={newDuration}
                        onChange={(e) => setNewDuration(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">カテゴリ</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2 border rounded-xl bg-white"
                    >
                      <option value="physical_therapy">理学療法</option>
                      <option value="massage">マッサージ・整体</option>
                      <option value="aroma">アロマ・リンパ</option>
                      <option value="chiropractic">カイロプラクティック</option>
                      <option value="beauty">美容・ヘッドスパ</option>
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddServiceOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      公開する
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* タブ 4: 売上・振込明細 (Stripe Connect) */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">総取扱高 (GMV)</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{formatPrice(totalGrossEarnings)}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">完了件数: {completedBookings.length}件</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">プラットフォーム利用手数料 (20%)</span>
              <div className="text-2xl font-black text-rose-600 mt-1">-{formatPrice(totalPlatformFees)}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">集客・決済代行手数料</span>
            </div>

            <div className="bg-emerald-50/60 rounded-3xl p-5 border border-emerald-200 shadow-xs">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">純手取り受取額</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">{formatPrice(totalNetEarnings)}</div>
              <span className="text-[11px] text-emerald-600 mt-1 block">Stripe Connect口座へ即時振込可能</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900 text-sm">施術完了・売上履歴一覧</h4>
              <button
                onClick={() => alert('Stripe Express ダッシュボードへリダイレクトします（外部URL）')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
              >
                <span>Stripe Express ダッシュボード</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {completedBookings.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">完了した施術の履歴はまだありません</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {completedBookings.map((b) => {
                  const customer = allUsers.find((u) => u.id === b.customer_id);
                  const service = services.find((s) => s.id === b.service_id);
                  return (
                    <div key={b.id} className="py-3.5 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{customer?.name} 様 - {service?.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {formatDate(b.scheduled_at)} • {b.booking_type === 'visit' ? '出張' : '店舗'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-emerald-600 text-sm">+{formatPrice(b.therapist_earnings)}</div>
                        <div className="text-[10px] text-slate-400">総額 {formatPrice(b.total_amount)} (手数料 -{formatPrice(b.platform_fee)})</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* タブ 4: お客様の評価・口コミ一覧 */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-fadeIn">
          {/* 評価サマリーカード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 総合評価スコア */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                総合平均評価
              </span>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-4xl font-black text-slate-900">
                  {therapist?.rating_avg ? therapist.rating_avg.toFixed(2) : '5.00'}
                </span>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                全 {myReviews.length > 0 ? myReviews.length : therapist?.reviews_count || 0} 件のお客様評価
              </p>
            </div>

            {/* 星の内訳 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs md:col-span-2 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                評価の内訳
              </h4>
              {[5, 4, 3, 2, 1].map((starCount) => {
                const count = myReviews.filter((r) => r.rating === starCount).length;
                const total = Math.max(1, myReviews.length);
                const percent = Math.round((count / total) * 100);
                return (
                  <div key={starCount} className="flex items-center gap-3 text-xs">
                    <span className="w-10 font-bold text-slate-700 flex items-center gap-1">
                      <span>★{starCount}</span>
                    </span>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-slate-400 text-[11px] font-mono">
                      {count} 件
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 口コミ・レビュー詳細リスト */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>お客様からいただいた口コミ・レビュー ({myReviews.length}件)</span>
              </h4>
              <span className="text-xs text-slate-400">新しい順</span>
            </div>

            {myReviews.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <Star className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                <p>現在まだレビューはありません。</p>
                <p className="text-[11px] text-slate-400">施術完了後にお客様から投稿された口コミがここに表示されます。</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myReviews.map((rev) => {
                  const customer = allUsers.find((u) => u.id === rev.customer_id);
                  const booking = bookings.find((b) => b.id === rev.booking_id);
                  const service = services.find((s) => s.id === booking?.service_id);

                  return (
                    <div key={rev.id} className="py-4 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={customer?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer?.name || 'Customer')}`}
                            alt={customer?.name}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
                          />
                          <div>
                            <span className="font-bold text-slate-900 text-xs">
                              {customer?.name || 'お客様'} 様
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span>{formatDate(rev.created_at)}</span>
                              {booking && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-700 font-medium">
                                    {booking.booking_type === 'visit' ? '出張施術' : '店舗訪問'}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 星評価 */}
                        <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-bold text-amber-900 text-xs ml-1">
                            {rev.rating}.0
                          </span>
                        </div>
                      </div>

                      {/* 施術メニュー */}
                      {service && (
                        <div className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-3 py-1 rounded-lg inline-block">
                          メニュー: {service.title}
                        </div>
                      )}

                      {/* コメント本文 */}
                      <p className="text-xs text-slate-700 leading-relaxed pl-1 pt-1">
                        {rev.comment}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* タブ 5: プロフィール・登録情報編集 */}
      {activeTab === 'profile' && <TherapistProfileEdit />}

      {/* チャットモーダル */}
      {chatBooking && (
        <BookingChatModal
          booking={chatBooking}
          onClose={() => setChatBooking(null)}
        />
      )}
    </div>
  );
};

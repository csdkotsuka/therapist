'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatPrice, formatDate } from '@/lib/geo';
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
} from 'lucide-react';
import { Service } from '@/types';

export const TherapistView: React.FC = () => {
  const {
    currentUser,
    therapistProfiles,
    services,
    bookings,
    updateBookingStatus,
    updateTherapistLocation,
    addService,
    allUsers,
  } = useApp();

  const therapist = therapistProfiles[currentUser.id];
  const myServices = services.filter((s) => s.therapist_id === currentUser.id);
  const myBookings = bookings.filter((b) => b.therapist_id === currentUser.id);

  // タブ管理: 'requests' (予約リクエスト・管理) | 'schedule' (シフト・エリア) | 'services' (メニュー設定) | 'earnings' (売上・Stripe)
  const [activeTab, setActiveTab] = useState<'requests' | 'schedule' | 'services' | 'earnings'>('requests');

  // スケジュール設定状態
  const [selectedDays, setSelectedDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri', 'sat']);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('21:00');
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
            </div>
            <p className="text-xs text-emerald-200 mt-1 line-clamp-1 max-w-md">
              {therapist?.bio || 'プロフィール設定中'}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-emerald-100">
              <span>★ 評価 {therapist?.rating_avg || '5.0'} ({therapist?.reviews_count || 0}件)</span>
              <span>•</span>
              <span>出張対応半径: {visitRadius}km</span>
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
          <span>シフト・出張エリア設定</span>
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
                      <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end border-t md:border-t-0 pt-3 md:pt-0">
                        <button
                          onClick={() => {
                            if (confirm('このリクエストを辞退しますか？')) {
                              updateBookingStatus(b.id, 'cancelled');
                            }
                          }}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1"
                        >
                          <X className="w-4 h-4 text-rose-500" />
                          <span>辞退する</span>
                        </button>
                        <button
                          onClick={() => updateBookingStatus(b.id, 'confirmed')}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>承認して予約を確定</span>
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

      {/* タブ 2: スケジュール・出張エリア設定 */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 max-w-3xl">
          <div>
            <h3 className="font-bold text-slate-900 text-base">受付スケジュール & 出張エリア設定</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              顧客が予約リクエストを送れる曜日と時間帯、および出張訪問可能な半径を設定します。
            </p>
          </div>

          {/* 曜日選択 */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              受付可能曜日
            </label>
            <div className="flex gap-2">
              {daysOfWeek.map((d) => {
                const isSelected = selectedDays.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDay(d.id)}
                    className={`w-10 h-10 rounded-2xl text-xs font-bold transition flex items-center justify-center ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 時間帯 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                開始時間
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                終了時間
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* 出張可能エリア (半径スライダー) */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                出張訪問可能エリア（半径）
              </label>
              <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
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
              <span>15km (都内主要区)</span>
              <span>30km (広域対応)</span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            {scheduleSavedToast && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                設定を保存しました
              </span>
            )}
            <button
              onClick={() => {
                setScheduleSavedToast(true);
                setTimeout(() => setScheduleSavedToast(false), 3000);
              }}
              className="ml-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              スケジュール・エリアを保存
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
    </div>
  );
};

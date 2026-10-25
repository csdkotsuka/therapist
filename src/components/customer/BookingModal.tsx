'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatPrice, calculateDistanceKm, estimateTravelTimeMinutes, geocodeAddress } from '@/lib/geo';
import {
  X,
  Star,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  CreditCard,
  Lock,
  Home,
  Building,
  Sparkles,
  Info,
  Car,
  Compass,
  MessageCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  therapistId: string;
  onClose: () => void;
  onSuccess: (bookingId: string, openChatImmediately?: boolean) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  therapistId,
  onClose,
  onSuccess,
}) => {
  const {
    currentUser,
    therapistProfiles,
    allUsers,
    services,
    userLocation,
    createBooking,
  } = useApp();

  const therapist = therapistProfiles[therapistId];
  const user = allUsers.find((u) => u.id === therapistId);
  const therapistServices = services.filter((s) => s.therapist_id === therapistId && s.is_active);

  // 今日のYYYY-MM-DD文字列
  const getTodayString = (addDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + addDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // ステップ管理: 1: メニュー・日時選択, 2: 内容確認・リクエスト送信, 3: 完了
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // 予約フォーム状態
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    therapistServices[0]?.id || ''
  );
  const [bookingType, setBookingType] = useState<'visit' | 'store'>(
    therapist?.is_visit_based ? 'visit' : 'store'
  );

  // 日付指定: 'today' | 'tomorrow' | 'dayAfter' | 'custom'
  const [dateType, setDateType] = useState<'today' | 'tomorrow' | 'dayAfter' | 'custom'>('tomorrow');
  const [customDate, setCustomDate] = useState<string>(getTodayString(1));

  // 時間指定: 時間（Hour）と分（Minute: 10分刻み）をそれぞれ独立管理
  const [selectedHour, setSelectedHour] = useState<string>('14');
  const [selectedMinute, setSelectedMinute] = useState<string>('00');
  const selectedTimeSlot = `${selectedHour}:${selectedMinute}`;

  // 選択肢定義
  const HOURS = ['09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'];
  const MINUTES = ['00', '10', '20', '30', '40', '50'];

  // 日付ボタン表示用（月/日 曜日）
  const getDateLabel = (addDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + addDays);
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return `${d.getMonth() + 1}/${d.getDate()} (${days[d.getDay()]})`;
  };

  const [visitAddress, setVisitAddress] = useState<string>(
    currentUser.address || '愛媛県松山市一番町1-1-1'
  );
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdBookingId, setCreatedBookingId] = useState<string>('');

  if (!therapist || !user) return null;

  const currentService = therapistServices.find((s) => s.id === selectedServiceId) || therapistServices[0];
  const distance = calculateDistanceKm(userLocation.lat, userLocation.lng, therapist.lat, therapist.lng);
  const travelTime = estimateTravelTimeMinutes(distance);

  // 09:00 〜 22:30 までの30分刻みタイムスロット一覧
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00', '22:30'
  ];

  // 終了予定時刻の計算
  const calculateEndTime = (startTime: string, durationMinutes = 60) => {
    try {
      const [h, m] = startTime.split(':').map(Number);
      const totalMinutes = h * 60 + m + durationMinutes;
      const endH = Math.floor(totalMinutes / 60) % 24;
      const endM = totalMinutes % 60;
      return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  // 決定された日付オブジェクト
  const getCalculatedDate = () => {
    const targetDate = new Date();
    if (dateType === 'today') {
      // today
    } else if (dateType === 'tomorrow') {
      targetDate.setDate(targetDate.getDate() + 1);
    } else if (dateType === 'dayAfter') {
      targetDate.setDate(targetDate.getDate() + 2);
    } else if (dateType === 'custom' && customDate) {
      const [y, m, d] = customDate.split('-').map(Number);
      targetDate.setFullYear(y, m - 1, d);
    }
    const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
    targetDate.setHours(hours || 14, minutes || 0, 0, 0);
    return targetDate;
  };

  // 表示用の日付文字列
  const getFormattedSelectedDateString = () => {
    const dt = getCalculatedDate();
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日 (${days[dt.getDay()]})`;
  };

  // 今すぐ（最短30分後・10分単位）をセット
  const handleSetQuickSoon = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    const roundMinutes = Math.ceil(now.getMinutes() / 10) * 10;
    now.setMinutes(roundMinutes);
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes() % 60).padStart(2, '0');
    setDateType('today');
    setSelectedHour(h);
    setSelectedMinute(m);
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);

    try {
      const targetDate = getCalculatedDate();

      // 出張先住所のジオコーディング (緯度経度特定)
      let bookingLat = userLocation.lat;
      let bookingLng = userLocation.lng;
      if (bookingType === 'visit' && visitAddress.trim()) {
        try {
          const geocoded = await geocodeAddress(visitAddress);
          if (geocoded) {
            bookingLat = geocoded.lat;
            bookingLng = geocoded.lng;
          }
        } catch (e) {
          // fallback to userLocation
        }
      }

      const booking = await createBooking({
        customer_id: currentUser.id,
        therapist_id: therapist.user_id,
        service_id: currentService.id,
        booking_type: bookingType,
        scheduled_at: targetDate.toISOString(),
        total_amount: currentService.price,
        lat: bookingLat,
        lng: bookingLng,
        visit_address: bookingType === 'visit' ? visitAddress : therapist.address,
        customer_notes: notes,
      });

      setCreatedBookingId(booking.id);
      setStep(3);

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    } catch (e) {
      alert('予約処理中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{user.name}</h3>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{therapist.rating_avg}</span>
                  <span className="text-slate-400 font-normal">({therapist.reviews_count}件)</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span className="text-emerald-600 font-medium">{distance}km ({travelTime}分)</span>
                <span>•</span>
                <span className="truncate max-w-[240px]">{therapist.address}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {step === 1 && (
            <>
              {/* 出張 / 店舗 選択 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. 施術スタイルの選択
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={!therapist.is_visit_based}
                    onClick={() => setBookingType('visit')}
                    className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                      bookingType === 'visit'
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    } ${!therapist.is_visit_based ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">出張施術 (訪問)</span>
                        <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">人気</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        ご自宅やオフィスに施術者が訪問。ベッド持参
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={!therapist.is_store_based}
                    onClick={() => setBookingType('store')}
                    className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                      bookingType === 'store'
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    } ${!therapist.is_store_based ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="p-2 rounded-xl bg-teal-100 text-teal-700 shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900">店舗訪問</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        セラピストのサロン・治療院へご来店
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 出張先住所 (出張時のみ) */}
              {bookingType === 'visit' && (
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      出張先の訪問住所
                    </label>
                    <span className="text-[10px] text-amber-700 font-medium">現在地から自動補完</span>
                  </div>
                  <input
                    type="text"
                    value={visitAddress}
                    onChange={(e) => setVisitAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-medium text-slate-800 focus:outline-emerald-500 shadow-2xs"
                    placeholder="建物名・部屋番号までご記入ください"
                  />
                </div>
              )}

              {/* 店舗情報案内 (店舗訪問時のみ) */}
              {bookingType === 'store' && (
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2.5 text-xs animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-950 flex items-center gap-1.5 text-xs">
                      <Building className="w-4 h-4 text-teal-700" />
                      <span>{therapist.store_name || `${user.name} サロン・店舗`}</span>
                    </span>
                    <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full font-bold">
                      ご来店先情報
                    </span>
                  </div>
                  <div className="space-y-1.5 text-slate-700 pt-1.5 border-t border-teal-100">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span className="font-semibold text-slate-900">{therapist.store_address || therapist.address}</span>
                    </div>
                    {therapist.store_access && (
                      <div className="flex items-start gap-1.5 text-slate-600">
                        <Compass className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{therapist.store_access}</span>
                      </div>
                    )}
                    {therapist.store_parking && (
                      <div className="flex items-start gap-1.5 text-slate-600">
                        <Car className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{therapist.store_parking}</span>
                      </div>
                    )}
                    {therapist.store_hours && (
                      <div className="flex items-start gap-1.5 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>営業時間: {therapist.store_hours}</span>
                      </div>
                    )}
                    {therapist.store_notes && (
                      <div className="p-2 bg-white rounded-lg border border-teal-100 text-[11px] text-teal-800 mt-1">
                        {therapist.store_notes}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* メニュー選択 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. 施術メニューの選択
                </label>
                <div className="space-y-2.5">
                  {therapistServices.map((service) => {
                    const isSelected = selectedServiceId === service.id;
                    return (
                      <div
                        key={service.id}
                        onClick={() => setSelectedServiceId(service.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-4 ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">{service.title}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {service.duration_minutes}分
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            {service.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-black text-slate-900 block">
                            {formatPrice(service.price)}
                          </span>
                          <span className="text-[10px] text-slate-400">(税込・出張費込)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 日時選択 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    3. ご希望日時の指定
                  </label>
                  <button
                    type="button"
                    onClick={handleSetQuickSoon}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl border border-emerald-200 transition flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span>今すぐ最短で依頼（約30分後〜）</span>
                  </button>
                </div>

                {/* ① 日付の選択肢（少し大きめの押しやすいカード型ボタン） */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    予約日を選択
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'today', label: '本日', sub: getDateLabel(0) },
                      { id: 'tomorrow', label: '明日', sub: getDateLabel(1) },
                      { id: 'dayAfter', label: '明後日', sub: getDateLabel(2) },
                      { id: 'custom', label: '日付を指定', sub: dateType === 'custom' && customDate ? customDate : 'カレンダー選択' },
                    ].map((d) => {
                      const isSelected = dateType === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setDateType(d.id as any)}
                          className={`py-3 px-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center min-h-[66px] cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-md ring-2 ring-emerald-500/30'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-slate-50'
                          }`}
                        >
                          <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {d.label}
                          </span>
                          <span className={`text-[10px] mt-0.5 font-medium ${isSelected ? 'text-emerald-100 font-semibold' : 'text-slate-500'}`}>
                            {d.sub}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* カレンダー直接指定の場合の入力欄 */}
                  {dateType === 'custom' && (
                    <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center gap-3 mt-2 animate-fadeIn">
                      <Calendar className="w-5 h-5 text-emerald-700 shrink-0" />
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                          カレンダーから希望日を選択してください
                        </label>
                        <input
                          type="date"
                          min={getTodayString()}
                          value={customDate}
                          onChange={(e) => setCustomDate(e.target.value)}
                          className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-emerald-500 shadow-2xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ② 時間（Hour）と分（Minute: 10分刻み）の選択 */}
                <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-4">
                  {/* 時間（Hour）の選択 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>開始「時間」を選択:</span>
                      </label>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md font-mono">
                        {selectedHour} 時
                      </span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                      {HOURS.map((h) => {
                        const isSelected = selectedHour === h;
                        return (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setSelectedHour(h)}
                            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white font-black shadow-xs ring-2 ring-emerald-500/20'
                                : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-slate-100'
                            }`}
                          >
                            <span>{h}時</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 分（Minute: 10分刻み）の選択 */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>開始「分」を選択（10分単位）:</span>
                      </label>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md font-mono">
                        {selectedMinute} 分
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {MINUTES.map((m) => {
                        const isSelected = selectedMinute === m;
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setSelectedMinute(m)}
                            className={`py-3 rounded-xl text-xs sm:text-sm font-bold font-mono transition flex items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white font-black shadow-xs ring-2 ring-emerald-500/20'
                                : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-slate-100'
                            }`}
                          >
                            <span>{m}分</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 施術時間プレビューバナー */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
                        ご予約日時
                      </div>
                      <div className="text-xs sm:text-sm font-black text-slate-900 flex items-baseline gap-1.5">
                        <span>{getFormattedSelectedDateString()}</span>
                        <span className="text-emerald-700 font-mono text-sm sm:text-base">{selectedHour}:{selectedMinute}</span>
                        <span className="text-slate-400 font-normal text-xs">〜 {calculateEndTime(`${selectedHour}:${selectedMinute}`, currentService?.duration_minutes)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500">所要時間:</span>
                    <span className="text-xs bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow-2xs">
                      {currentService?.duration_minutes}分コース
                    </span>
                  </div>
                </div>
              </div>

              {/* メモ */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  お悩みやご要望（任意）
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="例: 特に左肩が痛む、女性セラピスト希望、駐車スペースありなど"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-emerald-500"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* ご予約の流れガイダンス */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>ご予約・決済の流れ</span>
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-300 shadow-2xs font-bold text-emerald-800">
                    <span className="block text-[10px] text-emerald-500">STEP 1</span>
                    ① リクエスト送信
                    <span className="block text-[9px] text-emerald-600 font-normal mt-0.5">（現在）</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200 font-bold text-slate-700">
                    <span className="block text-[10px] text-slate-400">STEP 2</span>
                    ② セラピスト承諾
                    <span className="block text-[9px] text-slate-400 font-normal mt-0.5">空き時間を承認</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200 font-bold text-slate-700">
                    <span className="block text-[10px] text-slate-400">STEP 3</span>
                    ③ 決済・予約確定
                    <span className="block text-[9px] text-slate-400 font-normal mt-0.5">マイ予約から決済</span>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-800 mt-2.5 bg-emerald-100/60 p-2 rounded-lg leading-relaxed">
                  💡 <strong>この段階ではカード決済は発生しません。</strong>セラピストが希望日時を確認し、承諾した後に決済手続きを行っていただく安心のシステムです。
                </p>
              </div>

              {/* 予約内容サマリー */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  予約リクエスト内容
                </h4>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">セラピスト</span>
                  <span className="font-bold text-slate-900">{user.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">メニュー</span>
                  <span className="font-bold text-slate-900">{currentService?.title}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">施術形式</span>
                  <span className="font-bold text-emerald-700">
                    {bookingType === 'visit' ? '出張施術 (訪問)' : `店舗訪問 (${therapist.store_name || '店舗サロン'})`}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">{bookingType === 'visit' ? '訪問先' : 'ご来店先'}</span>
                  <span className="font-medium text-slate-800 text-right max-w-[200px] truncate">
                    {bookingType === 'visit' ? visitAddress : (therapist.store_address || therapist.address)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">希望日時</span>
                  <span className="font-bold text-slate-900">
                    {getFormattedSelectedDateString()} {selectedTimeSlot}〜{calculateEndTime(selectedTimeSlot, currentService?.duration_minutes)} ({currentService?.duration_minutes}分)
                  </span>
                </div>
                {notes && (
                  <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
                    <span className="text-slate-500 shrink-0">ご要望</span>
                    <span className="font-medium text-slate-700 text-right max-w-[220px] truncate">{notes}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-800">承諾後の決済予定額</span>
                  <span className="text-lg font-black text-emerald-600">
                    {formatPrice(currentService?.price || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">予約リクエストを送信しました！</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
                  セラピストが希望日時と空き状況を確認します。<br />
                  セラピストによる<strong>承諾後に「マイ予約一覧」から決済</strong>を行うことで予約確定となります。
                </p>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">予約番号:</span>
                  <span className="font-mono font-bold text-slate-700">{createdBookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">希望日時:</span>
                  <span className="font-bold text-slate-800">
                    {getFormattedSelectedDateString()} {selectedTimeSlot}〜
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ステータス:</span>
                  <span className="font-bold text-amber-600">セラピスト確認・承諾待ち</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">承諾後のお支払い額:</span>
                  <span className="font-bold text-slate-900">{formatPrice(currentService.price)}</span>
                </div>
              </div>

              {/* アクションボタン: メッセージを開く & 予約履歴へ */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onSuccess(createdBookingId, true);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>セラピストにメッセージを送る</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSuccess(createdBookingId, false);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  マイ予約一覧へ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {step !== 3 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            {step === 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                キャンセル
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                戻る
              </button>
            )}

            {step === 1 ? (
              <button
                type="button"
                disabled={!currentService}
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center gap-2"
              >
                <span>予約リクエストの確認へ</span>
                <span className="font-black">({formatPrice(currentService?.price || 0)})</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitBooking}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>予約リクエスト送信中...</span>
                ) : (
                  <>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>予約リクエストを送信する</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

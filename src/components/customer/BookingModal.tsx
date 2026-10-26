'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatPrice, calculateDistanceKm, estimateTravelTimeMinutes } from '@/lib/geo';
import {
  X,
  Star,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  Lock,
  Home,
  Building,
  Sparkles,
  Car,
  Compass,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Award,
  ChevronRight,
  User,
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

  // 4段階ステップ管理:
  // 1: 人を選ぶ (セラピスト確認)
  // 2: メニューを選ぶ
  // 3: 日時を選ぶ (大きめ日付 ＆ 30分単位時間ボタン)
  // 4: 予約確認・確定
  // 5: 完了画面
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

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

  // 時間指定: 30分単位のスロットボタン
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('14:00');

  // 30分刻みタイムスロット一覧 (09:00 〜 22:30)
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00', '22:30'
  ];

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

  // 今すぐ（最短30分後・30分刻み）をセット
  const handleSetQuickSoon = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    const roundMinutes = Math.ceil(now.getMinutes() / 30) * 30;
    now.setMinutes(roundMinutes);
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes() % 60).padStart(2, '0');
    setDateType('today');
    setSelectedTimeSlot(`${h}:${m}`);
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    try {
      const scheduledAt = getCalculatedDate().toISOString();
      const newBooking = await createBooking({
        customer_id: currentUser.id,
        therapist_id: therapistId,
        service_id: currentService.id,
        scheduled_at: scheduledAt,
        booking_type: bookingType,
        visit_address: bookingType === 'visit' ? visitAddress : therapist.store_address || therapist.address,
        customer_notes: notes,
        total_amount: currentService.price,
      });

      setCreatedBookingId(newBooking.id);
      setStep(5); // 完了ステップへ
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#047857', '#0d9488', '#f59e0b'],
        });
      } catch (err) {
        console.error(err);
      }
    } catch (e) {
      console.error(e);
      alert('予約リクエストの送信に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-500/20"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 text-sm truncate">{user.name}</span>
                <div className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.2 rounded shrink-0">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{therapist.rating_avg}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                {therapist.specialities?.[0] || '認定セラピスト'} • {distance}km
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
            aria-label="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4ステップ プログレスバー (スマホでも1目瞭然) */}
        {step !== 5 && (
          <div className="px-4 py-2 bg-slate-100/90 border-b border-slate-200">
            <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center text-[11px] font-bold">
              <div
                className={`py-1.5 px-1 rounded-xl transition flex items-center justify-center gap-1 ${
                  step === 1
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : step > 1
                    ? 'bg-emerald-100/80 text-emerald-800'
                    : 'text-slate-400 bg-white/60'
                }`}
              >
                <span className="font-mono text-[10px] w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center shrink-0">1</span>
                <span className="truncate">人を選ぶ</span>
              </div>

              <div
                className={`py-1.5 px-1 rounded-xl transition flex items-center justify-center gap-1 ${
                  step === 2
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : step > 2
                    ? 'bg-emerald-100/80 text-emerald-800'
                    : 'text-slate-400 bg-white/60'
                }`}
              >
                <span className="font-mono text-[10px] w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center shrink-0">2</span>
                <span className="truncate">メニュー</span>
              </div>

              <div
                className={`py-1.5 px-1 rounded-xl transition flex items-center justify-center gap-1 ${
                  step === 3
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : step > 3
                    ? 'bg-emerald-100/80 text-emerald-800'
                    : 'text-slate-400 bg-white/60'
                }`}
              >
                <span className="font-mono text-[10px] w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center shrink-0">3</span>
                <span className="truncate">日時</span>
              </div>

              <div
                className={`py-1.5 px-1 rounded-xl transition flex items-center justify-center gap-1 ${
                  step === 4
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-400 bg-white/60'
                }`}
              >
                <span className="font-mono text-[10px] w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center shrink-0">4</span>
                <span className="truncate">予約</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Body: 1ステップずつスマホで完結 */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* ========================================================
              STEP 1: 人を選ぶ（担当セラピストの確認と決定）
             ======================================================== */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-1">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  STEP 1: 施術者の確認
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  担当セラピスト
                </h3>
              </div>

              {/* セラピスト詳細カード */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 space-y-4">
                <div className="flex items-start gap-4">
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-md shrink-0"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-lg text-slate-900 truncate">{user.name}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                        本人確認済
                      </span>
                    </div>
                    <p className="text-xs font-bold text-emerald-800 line-clamp-1">
                      {therapist.specialities?.join(' • ') || '国家資格・認定施術者'}
                    </p>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{therapist.rating_avg}</span>
                      <span className="text-slate-400 font-normal">({therapist.reviews_count}件の口コミ)</span>
                    </div>
                  </div>
                </div>

                {/* 自己紹介・経歴 */}
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
                  <p className="font-medium">{therapist.bio || '確かな技術と丁寧なカウンセリングで、心と身体の健康を全力でサポートいたします。'}</p>
                </div>

                {/* 対応スタイルとエリア */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-white rounded-2xl border border-slate-200/70 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block">対応スタイル</span>
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                      {therapist.is_visit_based && (
                        <span className="flex items-center gap-1 text-emerald-700">
                          <Home className="w-3.5 h-3.5" /> 出張訪問
                        </span>
                      )}
                      {therapist.is_visit_based && therapist.is_store_based && <span>/</span>}
                      {therapist.is_store_based && (
                        <span className="flex items-center gap-1 text-teal-700">
                          <Building className="w-3.5 h-3.5" /> 店舗来店
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-200/70 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block">拠点エリア</span>
                    <div className="flex items-center gap-1 font-bold text-slate-800 truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{therapist.address || '愛媛県松山市'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 次へ進むアクション案内 */}
              <div className="text-center text-xs text-slate-500">
                このセラピストで予約を進める場合は下のボタンを押してください。
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 2: メニューを選ぶ
             ======================================================== */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center space-y-1">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  STEP 2: 施術メニュー選択
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  ご希望のコースを選んでください
                </h3>
              </div>

              <div className="space-y-2.5">
                {therapistServices.map((service) => {
                  const isSelected = selectedServiceId === service.id;
                  return (
                    <div
                      key={service.id}
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`p-4 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <h4 className="text-sm font-black text-slate-900 truncate">{service.title}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 pl-6">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 pl-6">
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {service.duration_minutes}分コース
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base sm:text-lg font-black text-emerald-700 block">
                          {formatPrice(service.price)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">(税込・交通費込)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 3: 日時を選ぶ (大きめ日付ボタン ＆ 30分単位ボタンスロット)
             ======================================================== */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-1">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  STEP 3: 日時・スタイル指定
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  ご希望の日時をお選びください
                </h3>
              </div>

              {/* 施術スタイル: 出張 or 店舗 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  施術スタイル
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={!therapist.is_visit_based}
                    onClick={() => setBookingType('visit')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                      bookingType === 'visit'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 font-bold'
                        : 'border-slate-200 hover:border-slate-300'
                    } ${!therapist.is_visit_based ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">出張施術 (訪問)</span>
                      <span className="text-[10px] text-slate-500">ご自宅・オフィスへ訪問</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={!therapist.is_store_based}
                    onClick={() => setBookingType('store')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                      bookingType === 'store'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 font-bold'
                        : 'border-slate-200 hover:border-slate-300'
                    } ${!therapist.is_store_based ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="p-2 rounded-xl bg-teal-100 text-teal-800 shrink-0">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">店舗訪問</span>
                      <span className="text-[10px] text-slate-500">サロン・治療院へ来店</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 日付の選択肢（大きめの押しやすいカード型ボタン） */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    予約日を選択
                  </label>
                  <button
                    type="button"
                    onClick={handleSetQuickSoon}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>今すぐ最短（30分後〜）</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                        className={`py-3 px-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center min-h-[64px] cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-700 border-emerald-700 text-white shadow-md ring-2 ring-emerald-500/30 font-bold'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {d.label}
                        </span>
                        <span className={`text-[10px] mt-0.5 font-medium ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {d.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {dateType === 'custom' && (
                  <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center gap-3 animate-fadeIn">
                    <Calendar className="w-5 h-5 text-emerald-700 shrink-0" />
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-emerald-950 mb-0.5">
                        カレンダーから希望日を選択
                      </label>
                      <input
                        type="date"
                        min={getTodayString()}
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 時間帯の選択肢（30分単位のボタングリッド） */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    希望開始時間（30分単位で選択）:
                  </label>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md font-mono border border-emerald-200">
                    {selectedTimeSlot}
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTimeSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`py-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-500/30'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-slate-100'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 施術終了予定バナー */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <span>
                    予約日時: <strong className="text-slate-900">{getFormattedSelectedDateString()} {selectedTimeSlot}</strong> 〜 {calculateEndTime(selectedTimeSlot, currentService?.duration_minutes)}
                  </span>
                </div>
                <span className="text-xs bg-emerald-700 text-white px-2.5 py-0.5 rounded-full font-bold">
                  {currentService?.duration_minutes}分
                </span>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 4: 予約（最終確認 & リクエスト送信）
             ======================================================== */}
          {step === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-1">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  STEP 4: 最終確認
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  ご予約リクエストの確認
                </h3>
              </div>

              {/* 訪問先住所 (出張時) */}
              {bookingType === 'visit' && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                  <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    出張先の訪問住所
                  </label>
                  <input
                    type="text"
                    value={visitAddress}
                    onChange={(e) => setVisitAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 text-xs font-medium text-slate-800 focus:outline-emerald-500 shadow-2xs"
                    placeholder="建物名・部屋番号までご記入ください"
                  />
                </div>
              )}

              {/* 来店先案内 (店舗訪問時) */}
              {bookingType === 'store' && (
                <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1 text-xs">
                  <div className="font-bold text-teal-950 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-teal-700" />
                    <span>ご来店先: {therapist.store_name || user.name}</span>
                  </div>
                  <p className="text-slate-700 pl-5">{therapist.store_address || therapist.address}</p>
                </div>
              )}

              {/* ご要望・お悩みメモ */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  お悩みやご要望メモ（任意）
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="例: 特に首や肩のコリがひどい、強めの指圧希望、駐車スペースあり 等"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-emerald-500"
                />
              </div>

              {/* 予約内容確認サマリーカード */}
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">担当セラピスト</span>
                  <span className="font-bold text-slate-900">{user.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">選択コース</span>
                  <span className="font-bold text-slate-900">{currentService?.title} ({currentService?.duration_minutes}分)</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">予約希望日時</span>
                  <span className="font-bold text-emerald-800">
                    {getFormattedSelectedDateString()} {selectedTimeSlot}〜
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 text-sm">
                  <span className="font-bold text-slate-900">合計金額 (税込)</span>
                  <span className="text-lg font-black text-emerald-700">
                    {formatPrice(currentService?.price || 0)}
                  </span>
                </div>
              </div>

              {/* 安心ガイダンス */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-900 leading-relaxed">
                💡 <strong>この段階ではカード決済は確定しません。</strong>セラピストが日時を確認・承認した後にマイ予約一覧から決済いただく安心のシステムです。
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 5: 予約完了画面
             ======================================================== */}
          {step === 5 && (
            <div className="text-center py-6 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  予約リクエストを送信しました！
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  セラピストが希望日時を確認します。<br />
                  承認後に「マイ予約一覧」から事前決済を行うことで予約確定となります。
                </p>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">予約番号:</span>
                  <span className="font-mono font-bold text-slate-800">{createdBookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">担当セラピスト:</span>
                  <span className="font-bold text-slate-800">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">希望日時:</span>
                  <span className="font-bold text-emerald-800">
                    {getFormattedSelectedDateString()} {selectedTimeSlot}〜
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">お支払い予定額:</span>
                  <span className="font-bold text-slate-900">{formatPrice(currentService.price)}</span>
                </div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onSuccess(createdBookingId, true);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
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
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  マイ予約一覧へ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer (ステップごとの明確なナビゲーション) */}
        {step !== 5 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
            {step === 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl cursor-pointer"
              >
                キャンセル
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>戻る</span>
              </button>
            )}

            {step === 1 && (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-black rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer ml-auto"
              >
                <span>メニューを選ぶ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-black rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer ml-auto"
              >
                <span>日時を選ぶ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-black rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer ml-auto"
              >
                <span>予約確認へ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitBooking}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50 ml-auto"
              >
                {isSubmitting ? (
                  <span>送信中...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>予約リクエストを確定する</span>
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
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
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  therapistId: string;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
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

  // ステップ管理: 1: メニュー・日時選択, 2: 決済・確認, 3: 完了
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // 予約フォーム状態
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    therapistServices[0]?.id || ''
  );
  const [bookingType, setBookingType] = useState<'visit' | 'store'>(
    therapist?.is_visit_based ? 'visit' : 'store'
  );
  const [selectedDate, setSelectedDate] = useState<string>('tomorrow');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('14:00');
  const [visitAddress, setVisitAddress] = useState<string>(
    '東京都渋谷区神宮前5-1-1 表参道レジデンス402号室'
  );
  const [notes, setNotes] = useState<string>('');

  // クレジットカードダミー情報
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvc, setCardCvc] = useState<string>('123');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdBookingId, setCreatedBookingId] = useState<string>('');

  if (!therapist || !user) return null;

  const currentService = therapistServices.find((s) => s.id === selectedServiceId) || therapistServices[0];
  const distance = calculateDistanceKm(userLocation.lat, userLocation.lng, therapist.lat, therapist.lng);
  const travelTime = estimateTravelTimeMinutes(distance);

  const timeSlots = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);

    try {
      // 予約日時を計算
      const targetDate = new Date();
      if (selectedDate === 'tomorrow') targetDate.setDate(targetDate.getDate() + 1);
      if (selectedDate === 'dayAfter') targetDate.setDate(targetDate.getDate() + 2);
      
      const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
      targetDate.setHours(hours, minutes, 0, 0);

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
        stripe_payment_intent_id: `pi_mock_${Date.now()}`,
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
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  3. 希望日時の指定
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { id: 'today', label: '本日 (最短)' },
                    { id: 'tomorrow', label: '明日' },
                    { id: 'dayAfter', label: '明後日' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDate(d.id)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        selectedDate === d.id
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`py-2 rounded-xl text-xs font-medium border transition ${
                        selectedTimeSlot === slot
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
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
              {/* 予約内容サマリー */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  予約内容の確認
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
                    {selectedDate === 'today' ? '本日' : selectedDate === 'tomorrow' ? '明日' : '明後日'}{' '}
                    {selectedTimeSlot}〜 ({currentService?.duration_minutes}分)
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-800">お支払い合計</span>
                  <span className="text-lg font-black text-emerald-600">
                    {formatPrice(currentService?.price || 0)}
                  </span>
                </div>
              </div>

              {/* Stripe決済入力シミュレーター */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-4 bg-white shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      Stripe Connect 安全決済
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                    <Lock className="w-3 h-3 text-emerald-500" />
                    SSL 256-bit 暗号化
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1 font-medium">カード番号</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1 font-medium">有効期限</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1 font-medium">セキュリティコード (CVC)</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    セラピストが予約リクエストを承認するまで、カードへの実請求は発生しません（事前与信枠の確保のみ行われます）。
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
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  セラピストが内容を確認後、承認通知が届きます。マイページで進行状況や施術者の移動状況を追跡できます。
                </p>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">予約番号:</span>
                  <span className="font-mono font-bold text-slate-700">{createdBookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ステータス:</span>
                  <span className="font-bold text-amber-600">承認待ち (Pending)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">仮決済金額:</span>
                  <span className="font-bold text-slate-900">{formatPrice(currentService.price)}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => {
                    onSuccess(createdBookingId);
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  予約履歴・追跡画面へ
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
                <span>お支払いへ進む</span>
                <span className="font-black">({formatPrice(currentService?.price || 0)})</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitBooking}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>予約リクエスト送信中...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>予約を確定する ({formatPrice(currentService?.price || 0)})</span>
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

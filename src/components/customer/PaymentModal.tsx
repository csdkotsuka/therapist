'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Booking } from '@/types';
import { formatPrice, formatDate } from '@/lib/geo';
import {
  X,
  CreditCard,
  Lock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Building,
  Home,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  booking,
  onClose,
  onSuccess,
}) => {
  const { allUsers, services, payBooking } = useApp();

  const therapist = allUsers.find((u) => u.id === booking.therapist_id);
  const service = services.find((s) => s.id === booking.service_id);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 決済（ダミー）→ 予約確定。可否は DB 側（pay_booking_dummy）で検証される
      if (!(await payBooking(booking.id))) return;

      setIsSuccess(true);
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // ignore
      }

      setTimeout(() => {
        onSuccess();
      }, 1800);
    } catch (err) {
      alert('決済処理中にエラーが発生しました。');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">予約の決済手続き</h3>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-black text-slate-900">決済が完了しました！</h4>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-4">
              {/* 承諾済み情報バナー */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900">
                  <p className="font-bold">
                    セラピスト <strong>{therapist?.name}</strong> が日時を承諾しました！
                  </p>
                  <p className="text-emerald-700 text-[11px] mt-0.5">
                    決済を完了すると予約が正式確定となり、セラピストの訪問・受付準備が開始されます。
                  </p>
                </div>
              </div>

              {/* 予約内容サマリー */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">コース:</span>
                  <span className="font-bold text-slate-900">{service?.title || '施術コース'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">日時:</span>
                  <span className="font-bold text-slate-900">{formatDate(booking.scheduled_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">施術スタイル:</span>
                  <span className="font-bold text-slate-800">
                    {booking.booking_type === 'visit' ? '出張施術 (訪問)' : '店舗来店'}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-700">お支払い金額 (税込)</span>
                  <span className="text-xl font-black text-emerald-600">
                    {formatPrice(booking.total_amount)}
                  </span>
                </div>
              </div>

              {/* 決済（Stripe 接続まではダミー。カード情報は自社では一切扱わず、本番は Stripe の決済画面で入力する） */}
              <div className="border border-amber-200 rounded-2xl p-4 bg-amber-50 text-amber-900 text-xs leading-relaxed flex gap-2">
                <Lock className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <p>
                  現在はテスト運用中のため、<strong>実際の請求は発生しません</strong>。ボタンを押すと決済済みとして予約が確定します。
                  正式リリース後は Stripe の安全な決済画面でカード情報を入力します。
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-black rounded-2xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>決済処理中...</span>
                    </div>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>{formatPrice(booking.total_amount)} を決済して予約確定</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

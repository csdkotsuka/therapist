'use client';

import React, { useState } from 'react';
import { Booking, Profile } from '@/types';
import { useApp } from '@/context/AppContext';
import { X, Star, HeartPulse, Send, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReviewModalProps {
  booking: Booking;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ booking, onClose }) => {
  const { allUsers, services, createReview } = useApp();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const therapistUser = allUsers.find((u) => u.id === booking.therapist_id);
  const service = services.find((s) => s.id === booking.service_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('レビューのコメントを入力してください');
      return;
    }

    createReview({
      booking_id: booking.id,
      customer_id: booking.customer_id,
      therapist_id: booking.therapist_id,
      rating,
      comment,
    });

    setIsSubmitted(true);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <h3 className="font-bold text-slate-900 text-sm">施術の評価・レビュー投稿</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">レビューを投稿しました！</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                貴重なご意見ありがとうございます。セラピストのプロフィールに反映されました。
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow"
              >
                閉じる
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <img
                  src={therapistUser?.avatar_url}
                  alt={therapistUser?.name}
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{therapistUser?.name}</h4>
                  <p className="text-[11px] text-slate-500">{service?.title}</p>
                </div>
              </div>

              {/* 星評価 */}
              <div className="text-center space-y-2">
                <label className="text-xs font-bold text-slate-700 block">満足度を教えてください</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(rating)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-hidden"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-600">
                  {rating === 5 && '大変満足 (★5)'}
                  {rating === 4 && '満足 (★4)'}
                  {rating === 3 && '普通 (★3)'}
                  {rating === 2 && 'やや不満 (★2)'}
                  {rating === 1 && '不満 (★1)'}
                </span>
              </div>

              {/* コメント */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  感想・レビューコメント
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="施術の技術、接客、効果、出張時の対応など、今後の利用者の参考になるご感想をお書きください。"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  投稿する
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

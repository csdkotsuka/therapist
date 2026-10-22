'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { LiveTrackingModal } from '@/components/customer/LiveTrackingModal';
import { ReviewModal } from '@/components/customer/ReviewModal';
import { BookingChatModal } from '@/components/chat/BookingChatModal';
import { formatPrice, formatDate } from '@/lib/geo';
import { Booking } from '@/types';
import {
  Calendar,
  Home,
  Building,
  Car,
  Star,
  CheckCircle,
  ArrowLeft,
  Search,
  Clock,
  HeartPulse,
  MessageCircle,
} from 'lucide-react';

export default function BookingsPage() {
  const {
    currentUser,
    bookings,
    therapistProfiles,
    allUsers,
    services,
    reviews,
    messages,
    currentBrand,
  } = useApp();

  const [trackingBooking, setTrackingBooking] = useState<Booking | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [chatBooking, setChatBooking] = useState<Booking | null>(null);

  // ログインユーザーの予約一覧
  const myBookings = bookings.filter((b) => b.customer_id === currentUser.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200">
            セラピスト承認待ち
          </span>
        );
      case 'confirmed':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
            予約確定・準備中
          </span>
        );
      case 'completed':
        return (
          <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-sky-200">
            施術完了
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-rose-200">
            キャンセル済
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* ナビゲーションバー */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition shadow-2xs"
              title="トップページへ戻る"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900">マイ予約・注文履歴</h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  全 {myBookings.length} 件
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                セラピストへの出張・店舗予約状況やリアルタイム位置情報の確認、評価レビューを行えます。
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            <Search className="w-4 h-4 text-emerald-400" />
            <span>新しい施術を探す</span>
          </Link>
        </div>

        {/* 予約リスト */}
        {myBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Calendar className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-700 text-sm">予約がまだありません</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              近くの凄腕セラピストを検索して、リフレッシュや体のケアを始めましょう。
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-2xs"
            >
              <Search className="w-4 h-4" />
              <span>セラピストを検索する</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {myBookings.map((b) => {
              const therapist = therapistProfiles[b.therapist_id];
              const therapistUser = allUsers.find((u) => u.id === b.therapist_id);
              const service = services.find((s) => s.id === b.service_id);
              const hasReviewed = reviews.some((r) => r.booking_id === b.id);
              const unreadCount = messages.filter(
                (m) => m.booking_id === b.id && m.receiver_id === currentUser.id && !m.is_read
              ).length;

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <img
                      src={therapistUser?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                      alt={therapistUser?.name || 'セラピスト'}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/20 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{therapistUser?.name}</span>
                        {getStatusBadge(b.status)}
                        {b.serial_number && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {b.serial_number}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-semibold text-slate-700 mt-1 line-clamp-1">
                        {service?.title || '施術コース'}
                      </h4>

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
                        <span className="font-bold text-slate-900">
                          {formatPrice(b.total_amount)}
                        </span>
                      </div>

                      {b.booking_type === 'visit' && b.visit_address && (
                        <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-1">
                          訪問先: {b.visit_address}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-col items-end gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                    {/* メッセージチャットボタン */}
                    <button
                      onClick={() => setChatBooking(b)}
                      className="px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-slate-800 border border-slate-300 hover:border-emerald-400 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs relative"
                      title="セラピストとメッセージで連絡"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>メッセージ</span>
                      {unreadCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                      )}
                    </button>

                    {/* 出張施術かつ確定済みならリアルタイム追跡ボタン */}
                    {b.booking_type === 'visit' && (b.status === 'confirmed' || b.status === 'pending') && (
                      <button
                        onClick={() => setTrackingBooking(b)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                      >
                        <Car className="w-3.5 h-3.5 text-emerald-400" />
                        <span>セラピスト現在地を追跡</span>
                      </button>
                    )}

                    {/* 完了時にレビュー投稿 */}
                    {b.status === 'completed' && !hasReviewed && (
                      <button
                        onClick={() => setReviewBooking(b)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
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
      </main>

      {/* フッター */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md overflow-hidden shrink-0"
              dangerouslySetInnerHTML={{ __html: currentBrand.iconSvg }}
            />
            <span className="font-bold text-slate-800">{currentBrand.japaneseName} ({currentBrand.name})</span>
            <span className="text-[11px] text-slate-400">
              - マイ予約・履歴画面
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <Link href="/" className="hover:text-emerald-600 transition">
              セラピストを探す
            </Link>
            <Link href="/profile" className="hover:text-emerald-600 transition">
              登録情報・住所変更
            </Link>
          </div>
        </div>
      </footer>

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

      {/* メッセージチャットモーダル */}
      {chatBooking && (
        <BookingChatModal
          booking={chatBooking}
          onClose={() => setChatBooking(null)}
        />
      )}
    </div>
  );
}

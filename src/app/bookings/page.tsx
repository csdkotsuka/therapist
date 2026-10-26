'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { LiveTrackingModal } from '@/components/customer/LiveTrackingModal';
import { ReviewModal } from '@/components/customer/ReviewModal';
import { BookingChatModal } from '@/components/chat/BookingChatModal';
import { PaymentModal } from '@/components/customer/PaymentModal';
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
  AlertTriangle,
  XCircle,
  Info,
  Shield,
  X,
  Award,
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
    updateBookingStatus,
  } = useApp();

  const [trackingBooking, setTrackingBooking] = useState<Booking | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [chatBooking, setChatBooking] = useState<Booking | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPolicyModal(false);
        setCancellingBooking(null);
      }
    };
    if (showPolicyModal || cancellingBooking) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPolicyModal, cancellingBooking]);

  // ログインユーザーの予約一覧
  const myBookings = bookings.filter((b) => b.customer_id === currentUser.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            セラピスト確認・承諾待ち
          </span>
        );
      case 'awaiting_payment':
        return (
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 animate-bounce">
            💳 承諾済・お客様の決済待ち
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-black text-slate-800 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 space-y-6">
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPolicyModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              <Info className="w-4 h-4 text-slate-500" />
              <span>キャンセル規定</span>
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span>新しい施術を探す</span>
            </Link>
          </div>
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
          <div className="space-y-4">
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
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <img
                        src={therapistUser?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                        alt={therapistUser?.name || 'セラピスト'}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/20 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        {/* 施術者名・資格・ステータス */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 text-base">{therapistUser?.name}</span>
                          {therapist?.specialities && therapist.specialities.length > 0 && (
                            <span className="text-[11px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200/60">
                              {therapist.specialities[0]}
                            </span>
                          )}
                          {getStatusBadge(b.status)}
                          {b.serial_number && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {b.serial_number}
                            </span>
                          )}
                        </div>

                        {/* 店舗名・評価スコア */}
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                          {therapist?.store_name && (
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-teal-600" />
                              {therapist.store_name}
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{therapist?.rating_avg || 5.0}</span>
                            <span className="text-slate-400 font-normal">({therapist?.reviews_count || 0}件)</span>
                          </div>
                        </div>

                        {/* 施術メニュー */}
                        <h4 className="text-xs font-bold text-slate-800 mt-1.5 flex items-center gap-1.5">
                          <span className="text-emerald-700">コース:</span>
                          <span>{service?.title || '施術コース'}</span>
                        </h4>

                        {/* 予約日時・スタイル・料金 */}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                          <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            {formatDate(b.scheduled_at)}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                            {b.booking_type === 'visit' ? (
                              <Home className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Building className="w-3.5 h-3.5 text-teal-600" />
                            )}
                            {b.booking_type === 'visit' ? '出張施術 (訪問)' : '店舗来店'}
                          </span>
                          <span className="font-black text-sm text-slate-900">
                            {formatPrice(b.total_amount)}
                          </span>
                        </div>

                        {/* 出張先住所 */}
                        {b.booking_type === 'visit' && b.visit_address && (
                          <p className="text-[11px] text-slate-500 mt-2 bg-amber-50/60 p-2 rounded-xl border border-amber-200/60 flex items-start gap-1">
                            <span className="font-bold text-amber-900 shrink-0">訪問先:</span>
                            <span className="text-slate-800">{b.visit_address}</span>
                          </p>
                        )}

                        {/* セラピスト承諾済み・決済促進バナー */}
                        {b.status === 'awaiting_payment' && (
                          <div className="mt-3 p-3.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl animate-bounce">🎉</span>
                              <div>
                                <h5 className="font-bold text-emerald-900 text-xs sm:text-sm">
                                  セラピストが日時を承諾しました！
                                </h5>
                                <p className="text-[11px] text-emerald-700">
                                  クレジットカード決済を行って予約を確定してください。
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPaymentBooking(b)}
                              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-1.5 shrink-0"
                            >
                              <span>💳 決済する ({formatPrice(b.total_amount)})</span>
                            </button>
                          </div>
                        )}

                        {/* セラピスト承認待ちバナー */}
                        {b.status === 'pending' && (
                          <div className="mt-2.5 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>セラピストが希望日時と空き状況を確認中です。承諾されるとこちらに決済ボタンが表示されます。</span>
                          </div>
                        )}

                        {/* セラピスト自己紹介・メッセージ（少し詳しく） */}
                        {therapist?.bio && (
                          <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 bg-slate-50 p-2 rounded-xl">
                            <strong className="text-slate-700">施術者プロフィール: </strong>
                            {therapist.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* アクションボタンバー */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {/* キャンセルポリシー確認ボタン */}
                      <button
                        type="button"
                        onClick={() => setShowPolicyModal(true)}
                        className="text-[11px] text-slate-400 hover:text-slate-600 underline flex items-center gap-1"
                      >
                        <Info className="w-3 h-3" />
                        <span>キャンセル規定を確認</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* キャンセルボタン（pending または confirmed、awaiting_payment時） */}
                      {(b.status === 'pending' || b.status === 'awaiting_payment' || b.status === 'confirmed') && (
                        <button
                          type="button"
                          onClick={() => setCancellingBooking(b)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>予約をキャンセル</span>
                        </button>
                      )}

                      {/* 決済待ち時の決済ボタン（バー側にも配置） */}
                      {b.status === 'awaiting_payment' && (
                        <button
                          type="button"
                          onClick={() => setPaymentBooking(b)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                        >
                          <span>💳 今すぐ決済</span>
                        </button>
                      )}

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
                          <span>現在地を追跡</span>
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
          onOpenChat={() => {
            const b = trackingBooking;
            setTrackingBooking(null);
            setChatBooking(b);
          }}
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
          activeUserId={currentUser.id}
          viewerRole="customer"
        />
      )}

      {/* キャンセルポリシー確認・実行モーダル */}
      {cancellingBooking && (
        <div
          onClick={() => setCancellingBooking(null)}
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn cursor-default"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/60">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-rose-950 text-sm">予約のキャンセル確認</h3>
              </div>
              <button
                onClick={() => setCancellingBooking(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">予約日時:</span>
                  <span className="font-bold text-slate-900">{formatDate(cancellingBooking.scheduled_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ステータス:</span>
                  <span className="font-bold text-slate-800">
                    {cancellingBooking.status === 'pending' ? '承認待ち（キャンセル料無料）' : '予約確定済み'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">返金予定額:</span>
                  <span className="font-bold text-emerald-600">
                    {cancellingBooking.status === 'pending' ? `${formatPrice(cancellingBooking.total_amount)} (全額無料)` : `${formatPrice(cancellingBooking.total_amount)} (規定に基づき返金)`}
                  </span>
                </div>
              </div>

              {/* キャンセル規定の案内 */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs space-y-2 text-amber-950">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>キャンセルポリシーについて</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-amber-900/90 space-y-1 pl-1">
                  <li><strong>承認待ちリクエスト:</strong> セラピスト承認前はいつでも【キャンセル料無料】です。</li>
                  <li><strong>前日23:59まで:</strong> キャンセル手数料なし（全額返金・カード枠解除）となります。</li>
                  <li><strong>当日キャンセル:</strong> 施術開始時刻前は50%、開始後の無断キャンセルは100%が発生します。</li>
                </ul>
              </div>

              <p className="text-xs text-slate-600">
                本当にこの予約をキャンセルしますか？キャンセルされた予約は元に戻せません。
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingBooking(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  戻る
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={async () => {
                    setIsCancelling(true);
                    try {
                      await updateBookingStatus(cancellingBooking.id, 'cancelled');
                      setCancellingBooking(null);
                      alert('予約をキャンセルしました。仮決済枠は自動的に解除・返金されます。');
                    } catch (e) {
                      alert('キャンセル処理中にエラーが発生しました');
                    } finally {
                      setIsCancelling(false);
                    }
                  }}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{isCancelling ? 'キャンセル処理中...' : '予約をキャンセルする'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* キャンセルポリシー閲覧モーダル */}
      {showPolicyModal && (
        <div
          onClick={() => setShowPolicyModal(false)}
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn cursor-default"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">安心キャンセルポリシー</h3>
              </div>
              <button
                onClick={() => setShowPolicyModal(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <h4 className="font-bold text-emerald-900 text-xs mb-1">1. 承認待ち（Pending）時</h4>
                  <p className="text-[11px] text-emerald-800">
                    セラピストが予約リクエストを承認する前であれば、いつでもキャンセル料無料（0円）でキャンセル可能です。クレジットカードの事前与信枠も即時解除されます。
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-xs mb-1">2. 予約確定後〜施術前日 23:59 まで</h4>
                  <p className="text-[11px] text-slate-600">
                    急な予定変更や体調不良でも、前日23:59までならキャンセル料は一切かかりません。マイ予約画面からワンタップでキャンセルできます。
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
                  <h4 className="font-bold text-amber-900 text-xs mb-1">3. 施術当日（開始予定時刻前）</h4>
                  <p className="text-[11px] text-amber-800">
                    セラピストの移動手配や枠確保のため、施術料金の50%のキャンセル料を頂戴いたします（残額50%は返金されます）。
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200">
                  <h4 className="font-bold text-rose-900 text-xs mb-1">4. 施術開始時刻以降 または 無断キャンセル</h4>
                  <p className="text-[11px] text-rose-800">
                    施術開始時刻を過ぎてのキャンセル、または訪問時にご不在の場合は、施術料金の100%を頂戴いたします。
                  </p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowPolicyModal(false)}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 決済モーダル */}
      {paymentBooking && (
        <PaymentModal
          booking={paymentBooking}
          onClose={() => setPaymentBooking(null)}
          onSuccess={() => setPaymentBooking(null)}
        />
      )}
    </div>
  );
}

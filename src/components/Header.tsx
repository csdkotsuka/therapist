'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  KeyRound,
  UserPlus,
  Calendar,
  User,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  Clock,
  Gift,
  Sliders,
  Star,
  DollarSign,
  Building,
  ShieldCheck,
  Palette,
  Users,
  Settings,
  Home,
  CheckCircle2,
} from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    allUsers,
    bookings,
    isLiveSupabase,
    isLoggedIn,
    currentBrand,
  } = useApp();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 未承認予約のリクエスト数（セラピスト用バッジ）
  const pendingRequestsCount = bookings.filter(
    (b) => b.therapist_id === currentUser.id && b.status === 'pending'
  ).length;

  // 顧客の予約件数
  const myBookingsCount = bookings.filter(
    (b) => b.customer_id === currentUser.id
  ).length;

  // 顧客の決済待ち件数
  const awaitingPaymentCount = bookings.filter(
    (b) => b.customer_id === currentUser.id && b.status === 'awaiting_payment'
  ).length;

  // 現在のページ種別
  const isTherapistPage = pathname.startsWith('/therapist');
  const isAdminPage = pathname.startsWith('/admin');
  const isCustomerPage = !isTherapistPage && !isAdminPage;

  // 現在の対象セラピストID（URLまたはcurrentUser）
  const therapistMatch = pathname.match(/\/therapist\/([^\/]+)/);
  const currentTherapistId = therapistMatch ? therapistMatch[1] : currentUser.id;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">管理者</span>;
      case 'therapist':
        return <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">セラピスト</span>;
      case 'customer':
      default:
        return <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">顧客</span>;
    }
  };

  // モード選択のハンドラー
  const handleModeChange = (modePath: string) => {
    setIsDrawerOpen(false);
    router.push(modePath);
  };

  // セラピスト画面用メニュー項目
  const therapistMenuItems = [
    { id: 'requests', label: '予約リクエスト・進行中', icon: Calendar, badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}件` : undefined },
    { id: 'schedule', label: '営業時間・シフト・出張設定', icon: Clock },
    { id: 'campaign', label: '特典・キャンペーン設定', icon: Gift },
    { id: 'services', label: '施術メニュー管理', icon: Sliders },
    { id: 'reviews', label: 'お客様の評価・口コミ', icon: Star },
    { id: 'earnings', label: '売上・振込明細', icon: DollarSign },
    { id: 'profile', label: 'プロフィール & 店舗情報編集', icon: Building },
    { id: 'verification', label: '4ステップ本登録・審査手続き', icon: ShieldCheck },
  ];

  // 管理者画面用メニュー項目
  const adminMenuItems = [
    { id: 'kpi', label: 'KPI・ダッシュボード', icon: TrendingUp },
    { id: 'bookings', label: '全予約ステータス監視', icon: Calendar, badge: `${bookings.length}件` },
    { id: 'therapists', label: 'セラピスト審査・登録管理', icon: ShieldCheck },
    { id: 'customers', label: '顧客・利用者管理', icon: Users },
    { id: 'reviews', label: '口コミ・レビュー管理', icon: Star },
    { id: 'branding', label: 'ブランド・ロゴ設定', icon: Palette },
    { id: 'settings', label: '手数料・システム設定', icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo (スマホでも改行しないすっきりレイアウト) */}
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/"
                className="flex items-center gap-2 group py-1 min-w-0"
                title={`${currentBrand.japaneseName} (${currentBrand.name}) - ${currentBrand.catchphrase}`}
              >
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform"
                  dangerouslySetInnerHTML={{ __html: currentBrand.iconSvg }}
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                    <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition truncate">
                      {currentBrand.japaneseName}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 hidden sm:inline">
                      {currentBrand.tagline}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 line-clamp-1 hidden md:block">
                    {currentBrand.catchphrase}
                  </span>
                </div>
              </Link>

              {/* Supabase 接続中ステータス */}
              {isLiveSupabase && (
                <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>LIVE</span>
                </span>
              )}
            </div>

            {/* Right Action Bar */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* ログイン中の場合: マイ予約ボタン */}
              {isLoggedIn && (
                <Link
                  href="/bookings"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    pathname === '/bookings'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="マイ予約・履歴の確認"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">マイ予約</span>
                  {awaitingPaymentCount > 0 ? (
                    <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-bold animate-pulse flex items-center gap-0.5" title="決済待ちの予約があります">
                      <span>💳</span>
                      <span>{awaitingPaymentCount}</span>
                    </span>
                  ) : myBookingsCount > 0 ? (
                    <span className="px-1.5 py-0.2 bg-emerald-500 text-white text-[10px] rounded-full font-bold">
                      {myBookingsCount}
                    </span>
                  ) : null}
                </Link>
              )}

              {/* ユーザー名＆アバター */}
              {isLoggedIn ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-2 pl-2 sm:pl-3 py-1 pr-2 rounded-2xl hover:bg-slate-100 transition"
                  title="登録情報・設定"
                >
                  <img
                    src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/20"
                  />
                  <span className="text-xs font-bold text-slate-800 max-w-[80px] sm:max-w-[120px] truncate hidden sm:inline">
                    {currentUser.name}
                  </span>
                </Link>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 transition"
                >
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ログイン</span>
                </button>
              )}

              {/* 共通ハンバーガーメニューボタン (ウィンドウ右上) */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs relative"
                aria-label="メニューを開く"
              >
                <Menu className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">メニュー</span>
                {(pendingRequestsCount > 0 || awaitingPaymentCount > 0) && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse absolute -top-0.5 -right-0.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* スライドイン・共通ドロワーメニュー */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />

        {/* Drawer panel */}
        <div
          className={`absolute top-0 right-0 bottom-0 w-full max-w-sm sm:max-w-md bg-white shadow-2xl z-10 flex flex-col transition-transform duration-300 ease-out transform ${
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg overflow-hidden shrink-0"
                dangerouslySetInnerHTML={{ __html: currentBrand.iconSvg }}
              />
              <span className="font-black text-slate-900 text-sm">
                {currentBrand.japaneseName} ナビゲーション
              </span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition"
              aria-label="メニューを閉じる"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* ======================================================== */}
            {/* モード切り替えエリア (あとで非表示にしやすい独立コンポーネント) */}
            {/* ======================================================== */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                操作モードの切り替え
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleModeChange('/')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition text-center border ${
                    isCustomerPage
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-base">🏠</span>
                  <span>顧客画面</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('/therapist')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition text-center border ${
                    isTherapistPage
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-base">💆‍♀️</span>
                  <span>セラピスト</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('/admin')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition text-center border ${
                    isAdminPage
                      ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-base">⚙️</span>
                  <span>管理本部</span>
                </button>
              </div>
            </div>

            {/* ======================================================== */}
            {/* ページ固有メニュー一覧 */}
            {/* ======================================================== */}
            {/* セラピスト画面のメニュー */}
            {isTherapistPage && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <span>💆‍♀️</span>
                  <span>セラピスト管理メニュー</span>
                </span>
                <div className="space-y-1">
                  {therapistMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.includes(`/therapist/${currentTherapistId}/${item.id}`) ||
                      (item.id === 'requests' && pathname === `/therapist/${currentTherapistId}`);
                    return (
                      <Link
                        key={item.id}
                        href={`/therapist/${currentTherapistId}/${item.id}`}
                        onClick={() => setIsDrawerOpen(false)}
                        className={`p-3 rounded-xl flex items-center justify-between text-xs font-bold transition ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-black'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 管理者画面のメニュー */}
            {isAdminPage && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-purple-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <span>⚙️</span>
                  <span>プラットフォーム管理メニュー</span>
                </span>
                <div className="space-y-1">
                  {adminMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === `/admin/${item.id}` || (item.id === 'therapists' && pathname === '/admin');
                    return (
                      <Link
                        key={item.id}
                        href={`/admin/${item.id}`}
                        onClick={() => setIsDrawerOpen(false)}
                        className={`p-3 rounded-xl flex items-center justify-between text-xs font-bold transition ${
                          isActive
                            ? 'bg-purple-50 text-purple-900 border border-purple-300 font-black'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 顧客画面のメニュー */}
            {isCustomerPage && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <span>🏠</span>
                  <span>顧客メインメニュー</span>
                </span>
                <div className="space-y-1">
                  <Link
                    href="/"
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-3 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <Home className="w-4 h-4 text-slate-400" />
                      <span>セラピスト検索・予約トップ</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  </Link>
                  <Link
                    href="/bookings"
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-3 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>マイ予約・注文履歴</span>
                    </div>
                    {myBookingsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {myBookingsCount}件
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-3 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>プロフィール・お届け先住所</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
            <div className="flex items-center justify-between">
              <span className="truncate max-w-[200px]">
                {isLoggedIn ? `ログイン中: ${currentUser.name}` : '未ログイン'}
              </span>
              {isLoggedIn ? (
                <span className="font-bold text-slate-600">{getRoleBadge(currentUser.role)}</span>
              ) : (
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  ログイン
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Supabase Auth Modal */}
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
    </>
  );
};

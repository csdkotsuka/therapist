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
  MessageCircle,
  Search,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    allUsers,
    bookings,
    messages,
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

  // モード選択のハンドラー（ルーター競合・戻るボタンでの履歴破損を防ぐため直接遷移）
  const handleModeChange = (mode: 'customer' | 'therapist' | 'admin') => {
    setIsDrawerOpen(false);
    let target = '/';
    if (mode === 'admin') {
      target = '/admin/therapists';
    } else if (mode === 'therapist') {
      target = `/therapist/${currentTherapistId}/requests`;
    }
    if (typeof window !== 'undefined') {
      window.location.href = target;
    }
  };

  // セラピスト画面用メニュー項目（iOS風アイコンカラー定義つき）
  const therapistMenuItems = [
    { id: 'requests', label: '予約リクエスト・進行中', icon: Calendar, color: 'bg-emerald-500', badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}件` : undefined },
    { id: 'schedule', label: '営業時間・シフト・出張設定', icon: Clock, color: 'bg-sky-500' },
    { id: 'campaign', label: '特典・キャンペーン設定', icon: Gift, color: 'bg-amber-500' },
    { id: 'services', label: '施術メニュー管理', icon: Sliders, color: 'bg-indigo-500' },
    { id: 'reviews', label: 'お客様の評価・口コミ', icon: Star, color: 'bg-yellow-500' },
    { id: 'earnings', label: '売上・振込明細', icon: DollarSign, color: 'bg-green-600' },
    { id: 'profile', label: 'プロフィール & 店舗情報編集', icon: Building, color: 'bg-blue-600' },
    { id: 'verification', label: '4ステップ本登録・審査手続き', icon: ShieldCheck, color: 'bg-purple-600' },
  ];

  // 管理者画面用メニュー項目
  const adminMenuItems = [
    { id: 'kpi', label: 'KPI・ダッシュボード', icon: TrendingUp, color: 'bg-purple-600' },
    { id: 'bookings', label: '全予約ステータス監視', icon: Calendar, color: 'bg-emerald-500', badge: `${bookings.length}件` },
    { id: 'therapists', label: 'セラピスト審査・登録管理', icon: ShieldCheck, color: 'bg-blue-600' },
    { id: 'customers', label: '顧客・利用者管理', icon: Users, color: 'bg-teal-500' },
    { id: 'messages', label: '全メッセージ監視', icon: MessageCircle, color: 'bg-sky-500', badge: `${messages.length}件` },
    { id: 'reviews', label: '口コミ・レビュー管理', icon: Star, color: 'bg-yellow-500' },
    { id: 'branding', label: 'ブランド・ロゴ設定', icon: Palette, color: 'bg-rose-500' },
    { id: 'settings', label: '手数料・システム設定', icon: Settings, color: 'bg-slate-600' },
  ];

  return (
    <>
      {/* ======================================================== */}
      {/* 1. iOS風 ナビゲーションバー (Top Navigation Bar) */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left: Brand Logo & App Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <Link
                href="/"
                className="flex items-center gap-2 group py-1 min-w-0 active:scale-95 transition-transform"
                title={`${currentBrand.japaneseName} (${currentBrand.name})`}
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs border border-slate-200/80 bg-white flex items-center justify-center shrink-0">
                  {currentBrand.iconUrl ? (
                    <img
                      src={currentBrand.iconUrl}
                      alt={currentBrand.japaneseName}
                      className="w-full h-full object-contain p-0.5"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: currentBrand.iconSvg }}
                    />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition truncate leading-tight">
                    {currentBrand.japaneseName}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 truncate leading-tight">
                    {currentBrand.tagline}
                  </span>
                </div>
              </Link>

              {/* Supabase 接続中ステータス */}
              {isLiveSupabase && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300/80 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>LIVE</span>
                </span>
              )}
            </div>

            {/* Right: Actions & User Info */}
            <div className="flex items-center gap-2 shrink-0">
              {/* PC用: マイ予約ショートカット */}
              {isLoggedIn && (
                <Link
                  href="/bookings"
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition border active:scale-95 ${
                    pathname === '/bookings'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-transparent'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>マイ予約</span>
                  {awaitingPaymentCount > 0 ? (
                    <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-bold animate-pulse">
                      💳 {awaitingPaymentCount}
                    </span>
                  ) : myBookingsCount > 0 ? (
                    <span className="px-1.5 py-0.2 bg-emerald-500 text-white text-[10px] rounded-full font-bold">
                      {myBookingsCount}
                    </span>
                  ) : null}
                </Link>
              )}

              {/* User Avatar / Login */}
              {isLoggedIn ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100/80 transition active:scale-95"
                  title="プロフィール・アカウント設定"
                >
                  <img
                    src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/20"
                  />
                  <span className="text-xs font-bold text-slate-800 max-w-[80px] truncate hidden md:inline">
                    {currentUser.name}
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition active:scale-95"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>ログイン</span>
                </button>
              )}

              {/* iOS風 丸型メニューボタン */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center transition active:scale-90 relative"
                aria-label="メニューを開く"
              >
                <Menu className="w-4 h-4 text-slate-700" />
                {(pendingRequestsCount > 0 || awaitingPaymentCount > 0) && (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white absolute top-0 right-0 animate-pulse" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. iOS風 フッター常駐ボトムタブバー (Bottom Tab Bar) */}
      {/* ======================================================== */}
      <nav
        aria-label="主要ナビゲーション"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/85 backdrop-blur-2xl border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
      >
        <div className="max-w-lg mx-auto px-3 pt-1.5 pb-safe">
          <div className="grid grid-cols-5 items-center">
            {/* Tab 1: さがす (Explore / Home) */}
            <Link
              href="/"
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition active:scale-95 ${
                pathname === '/' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Search className={`w-5 h-5 ${pathname === '/' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${pathname === '/' ? 'font-black' : 'font-semibold'}`}>
                さがす
              </span>
            </Link>

            {/* Tab 2: マイ予約 (Bookings) */}
            <Link
              href="/bookings"
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition active:scale-95 relative ${
                pathname === '/bookings' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Calendar className={`w-5 h-5 ${pathname === '/bookings' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {awaitingPaymentCount > 0 ? (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[15px] h-[15px] bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                    {awaitingPaymentCount}
                  </span>
                ) : myBookingsCount > 0 ? (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[15px] h-[15px] bg-emerald-600 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                    {myBookingsCount}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${pathname === '/bookings' ? 'font-black' : 'font-semibold'}`}>
                マイ予約
              </span>
            </Link>

            {/* Tab 3: セラピスト画面 (Therapist Portal) */}
            <button
              type="button"
              onClick={() => handleModeChange('therapist')}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition active:scale-95 relative ${
                isTherapistPage ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Sparkles className={`w-5 h-5 ${isTherapistPage ? 'stroke-[2.5] text-emerald-600' : 'stroke-[1.8]'}`} />
                {pendingRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[15px] h-[15px] bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                    {pendingRequestsCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isTherapistPage ? 'font-black' : 'font-semibold'}`}>
                セラピスト
              </span>
            </button>

            {/* Tab 4: マイページ (Account / Profile) */}
            {isLoggedIn ? (
              <Link
                href="/profile"
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition active:scale-95 ${
                  pathname === '/profile' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <User className={`w-5 h-5 ${pathname === '/profile' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                </div>
                <span className={`text-[10px] tracking-tight mt-0.5 ${pathname === '/profile' ? 'font-black' : 'font-semibold'}`}>
                  マイページ
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-500 hover:text-slate-800 transition active:scale-95"
              >
                <div className="relative">
                  <KeyRound className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="text-[10px] tracking-tight font-semibold mt-0.5">
                  ログイン
                </span>
              </button>
            )}

            {/* Tab 5: メニュー (More / Drawer) */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition active:scale-95 relative ${
                isDrawerOpen ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Menu className={`w-5 h-5 ${isDrawerOpen ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {(pendingRequestsCount > 0 || awaitingPaymentCount > 0) && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 ring-1 ring-white absolute top-0 -right-1 animate-pulse" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isDrawerOpen ? 'font-black' : 'font-semibold'}`}>
                メニュー
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 3. iOS Grouped Sheet スタイル ドロワーメニュー */}
      {/* ======================================================== */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />

        {/* Drawer panel (iOS Sheet / Slide over) */}
        <div
          className={`absolute top-0 right-0 bottom-0 w-full max-w-sm sm:max-w-md bg-slate-100 shadow-2xl z-10 flex flex-col transition-transform duration-300 ease-out transform ${
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* iOS Sheet Header */}
          <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-white border border-slate-200/80">
                {currentBrand.iconUrl ? (
                  <img
                    src={currentBrand.iconUrl}
                    alt={currentBrand.japaneseName}
                    className="w-full h-full object-contain p-0.5"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: currentBrand.iconSvg }}
                  />
                )}
              </div>
              <span className="font-black text-slate-900 text-sm tracking-tight">
                {currentBrand.japaneseName}
              </span>
            </div>
            {/* iOS丸型クローズボタン */}
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-7 h-7 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition active:scale-90"
              aria-label="メニューを閉じる"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Drawer Body (iOS Grouped Layout) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* iOS Apple ID 風 ユーザーカード */}
            <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-200/60 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={currentUser.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 truncate">
                    {currentUser.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {currentUser.email || 'carekuru.user@example.com'}
                  </p>
                </div>
              </div>
              <div>{getRoleBadge(currentUser.role)}</div>
            </div>

            {/* iOS Segmented Control 風 モード切り替え */}
            <div className="bg-slate-200/80 p-1 rounded-2xl flex gap-1">
              <button
                type="button"
                onClick={() => handleModeChange('customer')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                  isCustomerPage
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🏠</span>
                <span>顧客</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('therapist')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                  isTherapistPage
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>💆‍♀️</span>
                <span>セラピスト</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('admin')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                  isAdminPage
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>⚙️</span>
                <span>管理</span>
              </button>
            </div>

            {/* ======================================================== */}
            {/* iOS Grouped List: セラピスト画面メニュー */}
            {/* ======================================================== */}
            {isTherapistPage && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 px-3 uppercase tracking-wider block">
                  セラピスト業務メニュー
                </span>
                <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden divide-y divide-slate-100 shadow-2xs">
                  {therapistMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname.includes(`/therapist/${currentTherapistId}/${item.id}`) ||
                      (item.id === 'requests' && pathname === `/therapist/${currentTherapistId}`);
                    return (
                      <Link
                        key={item.id}
                        href={`/therapist/${currentTherapistId}/${item.id}`}
                        onClick={() => setIsDrawerOpen(false)}
                        className={`px-3.5 py-3 flex items-center justify-between text-xs font-bold transition active:bg-slate-100 ${
                          isActive ? 'bg-emerald-50/50 text-emerald-950 font-black' : 'text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-lg ${item.color} flex items-center justify-center text-white shrink-0 shadow-2xs`}>
                            <Icon className="w-4 h-4 stroke-[2]" />
                          </div>
                          <span>{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-2xs">
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* セラピスト向けマニュアル */}
                <div className="pt-1">
                  <a
                    href="/guide/therapist"
                    className="bg-white rounded-2xl border border-slate-200/60 px-3.5 py-3 flex items-center justify-between text-xs font-bold text-emerald-800 shadow-2xs active:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span>セラピスト実務運用マニュアル</span>
                    </div>
                    <span className="text-xs text-slate-400">↗</span>
                  </a>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* iOS Grouped List: 管理者画面メニュー */}
            {/* ======================================================== */}
            {isAdminPage && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 px-3 uppercase tracking-wider block">
                  管理ポータルメニュー
                </span>
                <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden divide-y divide-slate-100 shadow-2xs">
                  {adminMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === `/admin/${item.id}` || (item.id === 'therapists' && pathname === '/admin');
                    return (
                      <Link
                        key={item.id}
                        href={`/admin/${item.id}`}
                        onClick={() => setIsDrawerOpen(false)}
                        className={`px-3.5 py-3 flex items-center justify-between text-xs font-bold transition active:bg-slate-100 ${
                          isActive ? 'bg-purple-50/50 text-purple-950 font-black' : 'text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-lg ${item.color} flex items-center justify-center text-white shrink-0 shadow-2xs`}>
                            <Icon className="w-4 h-4 stroke-[2]" />
                          </div>
                          <span>{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="pt-1">
                  <a
                    href="/guide/admin"
                    className="bg-white rounded-2xl border border-slate-200/60 px-3.5 py-3 flex items-center justify-between text-xs font-bold text-purple-900 shadow-2xs active:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span>管理者マニュアル & ピッチスライド</span>
                    </div>
                    <span className="text-xs text-slate-400">↗</span>
                  </a>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* iOS Grouped List: 顧客画面メニュー */}
            {/* ======================================================== */}
            {isCustomerPage && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 px-3 uppercase tracking-wider block">
                  顧客メニュー
                </span>
                <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden divide-y divide-slate-100 shadow-2xs">
                  <Link
                    href="/"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-3.5 py-3 flex items-center justify-between text-xs font-bold text-slate-800 active:bg-slate-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-2xs">
                        <Search className="w-4 h-4" />
                      </div>
                      <span>セラピスト検索・予約トップ</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                  <Link
                    href="/bookings"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-3.5 py-3 flex items-center justify-between text-xs font-bold text-slate-800 active:bg-slate-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0 shadow-2xs">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span>マイ予約・注文履歴</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {myBookingsCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          {myBookingsCount}件
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-3.5 py-3 flex items-center justify-between text-xs font-bold text-slate-800 active:bg-slate-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                        <User className="w-4 h-4" />
                      </div>
                      <span>プロフィール・お届け先住所</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                </div>

                <div className="pt-1">
                  <a
                    href="/guide/customer"
                    className="bg-white rounded-2xl border border-slate-200/60 px-3.5 py-3 flex items-center justify-between text-xs font-bold text-blue-900 shadow-2xs active:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span>安心ご利用ガイド & マニュアル</span>
                    </div>
                    <span className="text-xs text-slate-400">↗</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* iOS Sheet Footer */}
          <div className="p-4 border-t border-slate-200/80 bg-white/80 backdrop-blur-md pb-safe">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 truncate max-w-[200px]">
                {isLoggedIn ? currentUser.name : 'ゲスト利用中'}
              </span>
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    // ログアウトまたはプロフィールへ
                    router.push('/profile');
                  }}
                  className="font-bold text-slate-600 hover:text-slate-900"
                >
                  設定を開く
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  ログイン / 新規登録
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

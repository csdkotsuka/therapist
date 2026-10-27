'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  KeyRound,
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
  MessageCircle,
  Search,
  BookOpen,
  ArrowLeftRight,
  Crown,
  Smartphone,
  Share,
  PlusSquare,
  Sparkles,
} from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    bookings,
    messages,
    isLiveSupabase,
    isLoggedIn,
    currentBrand,
  } = useApp();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);

  // PWA (ホーム画面から起動しているか) の判定
  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode =
        typeof window !== 'undefined' &&
        (window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as unknown as { standalone?: boolean }).standalone === true);
      setIsStandalone(Boolean(isStandaloneMode));
    };

    checkStandalone();
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    try {
      mediaQuery.addEventListener('change', checkStandalone);
      return () => mediaQuery.removeEventListener('change', checkStandalone);
    } catch (e) {
      // 古いブラウザ向けフォールバック
      return undefined;
    }
  }, []);

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

  // タグラインの旧名称安全補正 (旧名称の残骸を CareKuru に修正)
  const displayTagline =
    !currentBrand.tagline ||
    currentBrand.tagline === 'CareKURU.' ||
    currentBrand.tagline === 'CareKURU' ||
    currentBrand.tagline === 'CARE KURU' ||
    currentBrand.tagline === 'Care KURU' ||
    currentBrand.tagline === 'CAREAREA GO' ||
    currentBrand.tagline === 'CAREA GO' ||
    currentBrand.tagline === 'CARE GO'
      ? 'CareKuru'
      : currentBrand.tagline;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
            管理者
          </span>
        );
      case 'therapist':
        return (
          <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
            セラピスト
          </span>
        );
      case 'customer':
      default:
        return (
          <span className="bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
            顧客
          </span>
        );
    }
  };

  // モード選択のハンドラー
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

  // セラピスト画面用メニュー項目
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
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left: Brand Logo & App Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <Link
                href="/"
                className="flex items-center gap-2 group py-1 min-w-0 active:scale-95 transition-transform"
                title={`${currentBrand.japaneseName} (${currentBrand.name})`}
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs border border-slate-200/80 dark:border-white/15 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0">
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
                  <span className="text-base font-black tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 transition truncate leading-tight">
                    {currentBrand.japaneseName}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 truncate leading-tight">
                    {displayTagline}
                  </span>
                </div>
              </Link>

              {/* 現在のモード表示バッジ (セラピスト・管理者のとき) */}
              {!isCustomerPage && (
                <div className="hidden sm:flex items-center ml-2">
                  {isTherapistPage && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      セラピスト管理
                    </span>
                  )}
                  {isAdminPage && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100/80 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      管理ポータル
                    </span>
                  )}
                </div>
              )}

              {/* Supabase 接続中ステータス */}
              {isLiveSupabase && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>LIVE</span>
                </span>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* セラピスト/管理者画面のとき: 顧客画面へのクイック復帰リンク */}
              {!isCustomerPage && (
                <button
                  type="button"
                  onClick={() => handleModeChange('customer')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-bold transition active:scale-95"
                  title="顧客画面に切り替える"
                >
                  <ArrowLeftRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">顧客画面へ</span>
                </button>
              )}

              {/* ユーザーアバター / ログインボタン */}
              {isLoggedIn ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100/80 dark:hover:bg-white/10 transition active:scale-95"
                  title="プロフィール・アカウント設定"
                >
                  <img
                    src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/20"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[80px] truncate hidden md:inline">
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

              {/* セラピスト・管理者画面の時だけ右上にメニューボタンを配置 (業務項目が多いため集約) */}
              {!isCustomerPage && (
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center gap-1.5 transition active:scale-95 shadow-xs relative"
                  aria-label="メニューを開く"
                >
                  <Menu className="w-4 h-4" />
                  <span className="text-xs font-bold hidden sm:inline">メニュー</span>
                  {(pendingRequestsCount > 0 || awaitingPaymentCount > 0) && (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-black absolute top-0 right-0 animate-pulse" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. 最新OS風 フローティング透過アイランドタブバー (顧客画面のみ表示) */}
      {/* ======================================================== */}
      {isCustomerPage && (
        <nav
          aria-label="主要ナビゲーション"
          className={`fixed customer-bottom-nav inset-x-0 z-40 flex justify-center px-2 pointer-events-none transition-all duration-300 ${
            isStandalone
              ? 'bottom-6 pb-[env(safe-area-inset-bottom)]'
              : 'bottom-2'
          }`}
        >
          {/* iOS最新アイランド型 透過カプセルバー (Floating Glass Pill - 指で押しやすい高さとパディングに最適化) */}
          <div className="ios-glass-pill pointer-events-auto flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.18),0_2px_6px_rgba(0,0,0,0.08)] border border-white/60 dark:border-white/15 ring-1 ring-black/5 dark:ring-white/10 transition-all">
            {/* Tab 1: さがす (Explore / Home) */}
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full transition active:scale-95 ${
                pathname === '/'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs font-black'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-semibold'
              }`}
            >
              <Search className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${pathname === '/' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              <span className="text-xs tracking-tight">さがす</span>
            </Link>

            {/* Tab 2: マイ予約 (Bookings) */}
            <Link
              href="/bookings"
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full transition active:scale-95 relative ${
                pathname === '/bookings'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs font-black'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-semibold'
              }`}
            >
              <div className="relative">
                <Calendar className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${pathname === '/bookings' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                {awaitingPaymentCount > 0 ? (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-black animate-pulse">
                    {awaitingPaymentCount}
                  </span>
                ) : myBookingsCount > 0 ? (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-black">
                    {myBookingsCount}
                  </span>
                ) : null}
              </div>
              <span className="text-xs tracking-tight">予約</span>
            </Link>

            {/* Tab 3: マイページ (Account / Profile) */}
            {isLoggedIn ? (
              <Link
                href="/profile"
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full transition active:scale-95 ${
                  pathname === '/profile'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs font-black'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-semibold'
                }`}
              >
                <User className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${pathname === '/profile' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                <span className="text-xs tracking-tight">マイページ</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-semibold transition active:scale-95"
              >
                <KeyRound className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2]" />
                <span className="text-xs tracking-tight">ログイン</span>
              </button>
            )}

            {/* Tab 4: メニュー (More / Drawer) */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full transition active:scale-95 relative ${
                isDrawerOpen
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs font-black'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-semibold'
              }`}
            >
              <div className="relative">
                <Menu className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isDrawerOpen ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                {(pendingRequestsCount > 0 || awaitingPaymentCount > 0) && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 ring-1 ring-white dark:ring-black absolute top-0 -right-1 animate-pulse" />
                )}
              </div>
              <span className="text-xs tracking-tight">メニュー</span>
            </button>
          </div>
        </nav>
      )}

      {/* ======================================================== */}
      {/* 3. iOS Grouped Sheet スタイル ドロワーメニュー (ダークモード完全対応) */}
      {/* ======================================================== */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />

        {/* Drawer panel */}
        <div
          className={`absolute top-0 right-0 bottom-0 w-full max-w-sm sm:max-w-md bg-slate-100 dark:bg-[#121212] text-slate-900 dark:text-white shadow-2xl z-10 flex flex-col transition-transform duration-300 ease-out transform ${
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* iOS Sheet Header */}
          <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-white/90 dark:bg-black/90 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10">
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
              <span className="font-black text-slate-900 dark:text-white text-sm tracking-tight">
                {currentBrand.japaneseName}
              </span>
            </div>
            {/* iOS丸型クローズボタン */}
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-7 h-7 rounded-full bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 flex items-center justify-center transition active:scale-90"
              aria-label="メニューを閉じる"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Drawer Body (iOS Grouped Layout) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* iOS Apple ID 風 ユーザーカード */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-3.5 shadow-2xs border border-slate-200/60 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={currentUser.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                    {currentUser.email || 'carekuru.user@example.com'}
                  </p>
                </div>
              </div>
              <div>{getRoleBadge(currentUser.role)}</div>
            </div>

            {/* PWA ホーム画面追加プロンプト (ブラウザ閲覧時のみ表示) */}
            {!isStandalone && (
              <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 rounded-2xl p-3 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1">
                      <span>ホーム画面に追加</span>
                      <Sparkles className="w-3 h-3 text-amber-500" />
                    </h5>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate">
                      URLバーが消え、全画面アプリに変わります
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPwaModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-[11px] shrink-0 active:scale-95 transition shadow-xs"
                >
                  手順を見る
                </button>
              </div>
            )}

            {/* iOS Segmented Control モード切り替え */}
            <div className="bg-slate-200/80 dark:bg-white/10 p-1 rounded-2xl flex gap-1">
              <button
                type="button"
                onClick={() => handleModeChange('customer')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                  isCustomerPage
                    ? 'bg-white dark:bg-[#2c2c2e] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                    ? 'bg-white dark:bg-[#2c2c2e] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                    ? 'bg-white dark:bg-[#2c2c2e] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-3 uppercase tracking-wider block">
                  セラピスト業務メニュー
                </span>
                <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-slate-200/60 dark:border-white/10 overflow-hidden divide-y divide-slate-100 dark:divide-white/5 shadow-2xs">
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
                        className={`px-3.5 py-3 flex items-center justify-between text-xs font-bold transition active:bg-slate-100 dark:active:bg-white/5 ${
                          isActive
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-300 font-black'
                            : 'text-slate-800 dark:text-slate-200'
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
                          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* セラピスト向けマニュアル */}
                <div className="pt-1">
                  <a
                    href="/guide/therapist"
                    className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-slate-200/60 dark:border-white/10 px-3.5 py-3 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs active:bg-slate-50 dark:active:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span>セラピスト実務運用マニュアル</span>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">↗</span>
                  </a>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* iOS Grouped List: 管理者画面メニュー */}
            {/* ======================================================== */}
            {isAdminPage && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-3 uppercase tracking-wider block">
                  管理ポータルメニュー
                </span>
                <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-slate-200/60 dark:border-white/10 overflow-hidden divide-y divide-slate-100 dark:divide-white/5 shadow-2xs">
                  {adminMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === `/admin/${item.id}` || (item.id === 'therapists' && pathname === '/admin');
                    return (
                      <Link
                        key={item.id}
                        href={`/admin/${item.id}`}
                        onClick={() => setIsDrawerOpen(false)}
                        className={`px-3.5 py-3 flex items-center justify-between text-xs font-bold transition active:bg-slate-100 dark:active:bg-white/5 ${
                          isActive
                            ? 'bg-purple-50/50 dark:bg-purple-950/30 text-purple-950 dark:text-purple-300 font-black'
                            : 'text-slate-800 dark:text-slate-200'
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
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200">
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="pt-1 space-y-1.5">
                  {/* 会長事前相談・決裁アジェンダへの直通リンク */}
                  <Link
                    href="/guide/admin/agenda"
                    onClick={() => setIsDrawerOpen(false)}
                    className="bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300 dark:border-emerald-800 px-3.5 py-3 flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200 shadow-2xs active:bg-emerald-100 dark:active:bg-emerald-900/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                        <Crown className="w-4 h-4 text-amber-300" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-black">👑 会長事前相談・決裁アジェンダ</span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-normal">重要確認事項・基本設計報告</span>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">↗</span>
                  </Link>

                  <a
                    href="/guide/admin"
                    className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-slate-200/60 dark:border-white/10 px-3.5 py-3 flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-300 shadow-2xs active:bg-slate-50 dark:active:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span>役員ドキュメントハブ（ピッチ・計画・運用）</span>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">↗</span>
                  </a>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* iOS Grouped List: 顧客画面メニュー */}
            {/* ======================================================== */}
            {isCustomerPage && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-3 uppercase tracking-wider block">
                  顧客メニュー
                </span>
                <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-slate-200/60 dark:border-white/10 overflow-hidden divide-y divide-slate-100 dark:divide-white/5 shadow-2xs">
                  <Link
                    href="/"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-3.5 py-3 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 active:bg-slate-100 dark:active:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-2xs">
                        <Search className="w-4 h-4" />
                      </div>
                      <span>セラピスト検索・予約トップ</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  </Link>
                  <Link
                    href="/bookings"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-3.5 py-3 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 active:bg-slate-100 dark:active:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0 shadow-2xs">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span>マイ予約・注文履歴</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {myBookingsCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200">
                          {myBookingsCount}件
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    </div>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-3.5 py-3 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 active:bg-slate-100 dark:active:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                        <User className="w-4 h-4" />
                      </div>
                      <span>プロフィール・お届け先住所</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  </Link>
                </div>

                <div className="pt-1">
                  <a
                    href="/guide/customer"
                    className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-slate-200/60 dark:border-white/10 px-3.5 py-3 flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-300 shadow-2xs active:bg-slate-50 dark:active:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span>安心ご利用ガイド & マニュアル</span>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">↗</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* iOS Sheet Footer */}
          <div className="p-4 border-t border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md pb-safe space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                {isLoggedIn ? currentUser.name : 'ゲスト利用中'}
              </span>
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    router.push('/profile');
                  }}
                  className="font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
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
                  className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  ログイン / 新規登録
                </button>
              )}
            </div>

            {/* コピーライトクレジット (顧客画面のWebフッターをメニュー内に集約) */}
            <div className="pt-2 text-center text-[10px] text-slate-400 dark:text-slate-600 border-t border-slate-200/60 dark:border-white/5">
              <span>© {currentBrand.name}. All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Supabase Auth Modal */}
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}

      {/* PWA インストール手順モーダル */}
      {isPwaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#1c1c1e] text-slate-900 dark:text-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-white/10 space-y-4 relative">
            <button
              onClick={() => setIsPwaModalOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 flex items-center justify-center active:scale-90 transition"
              aria-label="閉じる"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  PWA Quick Install
                </span>
                <h3 className="text-base font-black">
                  アプリとして使う（全画面起動）
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              スマホのホーム画面に追加すると、下のURLバーが完全に消え、App Storeから入れたアプリと全く同じ全画面・快適スピードでご利用いただけます。
            </p>

            {/* iOS Safari手順 */}
            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-3.5 border border-slate-200/60 dark:border-white/10 space-y-2.5 text-xs">
              <span className="font-bold text-[11px] text-slate-500 dark:text-slate-400 block">
                【iPhone (Safari) での追加手順】
              </span>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">1</span>
                <p className="text-slate-700 dark:text-slate-300">
                  画面下部の <strong className="text-slate-900 dark:text-white">「共有アイコン（四角から上矢印）」</strong> をタップ
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">2</span>
                <p className="text-slate-700 dark:text-slate-300">
                  メニューから <strong className="text-slate-900 dark:text-white">「ホーム画面に追加」</strong> を選択
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPwaModalOpen(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95"
            >
              わかりました
            </button>
          </div>
        </div>
      )}
    </>
  );
};

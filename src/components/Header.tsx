'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp, PRESET_LOCATIONS } from '@/context/AppContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { getCurrentGpsPosition, reverseGeocode } from '@/lib/geo';
import {
  Sparkles,
  Users,
  MapPin,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  UserCheck,
  Activity,
  HeartPulse,
  KeyRound,
  Database,
  Navigation,
  Loader2,
  UserPlus,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    allUsers,
    switchUser,
    userLocation,
    setUserLocation,
    resetToMock,
    bookings,
    isLiveSupabase,
    isLoadingDb,
  } = useApp();

  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGettingGps, setIsGettingGps] = useState(false);

  // 未承認予約のリクエスト数（セラピスト用バッジ）
  const pendingRequestsCount = bookings.filter(
    (b) => b.therapist_id === currentUser.id && b.status === 'pending'
  ).length;

  const handleGetDeviceGps = async () => {
    setIsGettingGps(true);
    try {
      const coords = await getCurrentGpsPosition();
      const placeName = await reverseGeocode(coords.lat, coords.lng);
      setUserLocation({
        name: `${placeName} (現在地)`,
        lat: coords.lat,
        lng: coords.lng,
      });
      setIsLocationMenuOpen(false);
    } catch (err: any) {
      alert(err.message || '位置情報の取得に失敗しました');
    } finally {
      setIsGettingGps(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-purple-200">管理者 (Admin)</span>;
      case 'therapist':
        return <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">セラピスト (Therapist)</span>;
      case 'customer':
      default:
        return <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-blue-200">顧客 (Customer)</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 bg-clip-text text-transparent">
                  CareHub
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-200">
                  出張・店舗
                </span>

                {/* Supabase 接続中ステータスバッジ */}
                {isLiveSupabase ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Supabase LIVE</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">
                    Mock Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                ヘルスケア＆ボディケア・オンデマンド
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Supabase Auth ログインボタン */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 transition shadow-2xs"
              title="Supabase Auth 認証ログイン"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Auth ログイン</span>
            </button>

            {/* 顧客ロール時の現在地切替セレクター */}
            {currentUser.role === 'customer' && (
              <div className="relative">
                <button
                  onClick={() => {
                    setIsLocationMenuOpen(!isLocationMenuOpen);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
                  title="現在地を変更"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="max-w-[110px] truncate">{userLocation.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isLocationMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                    {/* 実端末GPS取得ボタン */}
                    <div className="px-2 pb-2 mb-1 border-b border-slate-100">
                      <button
                        onClick={handleGetDeviceGps}
                        disabled={isGettingGps}
                        className="w-full text-left px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl text-xs font-bold flex items-center justify-between transition shadow-2xs"
                      >
                        <div className="flex items-center gap-1.5">
                          {isGettingGps ? (
                            <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                          ) : (
                            <Navigation className="w-3.5 h-3.5 text-sky-600" />
                          )}
                          <span>{isGettingGps ? 'GPS測位中...' : '実端末の現在地を使用'}</span>
                        </div>
                        <span className="text-[10px] bg-sky-600 text-white px-1.5 py-0.2 rounded font-bold">GPS</span>
                      </button>
                    </div>

                    <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      プリセット地点
                    </div>
                    {PRESET_LOCATIONS.map((loc) => (
                      <button
                        key={loc.name}
                        onClick={() => {
                          setUserLocation(loc);
                          setIsLocationMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                          userLocation.name === loc.name
                            ? 'text-emerald-600 font-bold bg-emerald-50/50'
                            : 'text-slate-700'
                        }`}
                      >
                        <span>{loc.name}</span>
                        {userLocation.name === loc.name && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 顧客新規登録ボタン */}
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-xs transition active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">顧客アカウント作成</span>
              <span className="sm:hidden">登録</span>
            </Link>

            {/* 管理本部への切り替えボタン (現在が管理者でない場合) */}
            {currentUser.role !== 'admin' && (
              <button
                onClick={() => switchUser('admin-001')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition shadow-2xs"
                title="管理者視点ページを開く"
              >
                <span>⚙️ 管理本部</span>
              </button>
            )}

            {/* 現在ログイン中のユーザー表示 (リスト表示なし) */}
            <div className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="relative">
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
                {pendingRequestsCount > 0 && currentUser.role === 'therapist' && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {pendingRequestsCount}
                  </span>
                )}
              </div>

              <div className="text-left hidden md:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">{currentUser.name}</span>
                  {getRoleBadge(currentUser.role)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supabase Auth Modal */}
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
    </header>
  );
};

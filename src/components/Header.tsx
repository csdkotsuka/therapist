'use client';

import React, { useState } from 'react';
import { useApp, PRESET_LOCATIONS } from '@/context/AppContext';
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
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);

  // 未承認予約のリクエスト数（セラピスト用バッジ）
  const pendingRequestsCount = bookings.filter(
    (b) => b.therapist_id === currentUser.id && b.status === 'pending'
  ).length;

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
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                ヘルスケア＆ボディケア・オンデマンド
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* 顧客ロール時の現在地切替セレクター */}
            {currentUser.role === 'customer' && (
              <div className="relative">
                <button
                  onClick={() => {
                    setIsLocationMenuOpen(!isLocationMenuOpen);
                    setIsUserMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
                  title="現在地を変更"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="max-w-[110px] truncate">{userLocation.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isLocationMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
                    <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      現在地シミュレーション
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

            {/* ロール切り替えドロップダウン */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsLocationMenuOpen(false);
                }}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/30 transition shadow-2xs"
              >
                {/* User Avatar */}
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

                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* ユーザー / ロール切り替えメニュー */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-400">ダミーアカウント切替 (ロールテスト)</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ワンタップでロールや別ユーザーの視点に切り替わります
                    </p>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {allUsers.map((user) => {
                      const isSelected = user.id === currentUser.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            switchUser(user.id);
                            setIsUserMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition ${
                            isSelected ? 'bg-emerald-50/60 font-semibold' : ''
                          }`}
                        >
                          <img
                            src={user.avatar_url}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-slate-900 truncate">{user.name}</span>
                              {getRoleBadge(user.role)}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
                    <span className="text-[11px] text-slate-400">プロトタイプ状態</span>
                    <button
                      onClick={() => {
                        if (confirm('モックデータを初期状態にリセットしますか？')) {
                          resetToMock();
                          setIsUserMenuOpen(false);
                        }
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-rose-600 transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      データをリセット
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

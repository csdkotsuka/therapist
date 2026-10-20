'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  HeartPulse,
  KeyRound,
  UserPlus,
  ChevronDown,
} from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    bookings,
    isLiveSupabase,
  } = useApp();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 未承認予約のリクエスト数（セラピスト用バッジ）
  const pendingRequestsCount = bookings.filter(
    (b) => b.therapist_id === currentUser.id && b.status === 'pending'
  ).length;

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
  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(e.target.value);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & モード選択プルダウン */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="text-lg font-black bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 bg-clip-text text-transparent">
                CareHub
              </span>
            </Link>

            {/* モード選択プルダウン */}
            <div className="relative flex items-center">
              <select
                value={pathname}
                onChange={handleModeChange}
                aria-label="操作モードの切り替え"
                className="appearance-none bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs pl-3 pr-8 py-1.5 rounded-xl border border-slate-300/80 cursor-pointer transition focus:outline-emerald-500 focus:bg-white"
              >
                <option value="/">🏠 顧客画面</option>
                <option value="/therapist">💆‍♀️ セラピスト画面</option>
                <option value="/admin">⚙️ 管理本部</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 pointer-events-none" />
              {pendingRequestsCount > 0 && (
                <span className="ml-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="未対応リクエストあり"></span>
              )}
            </div>

            {/* Supabase 接続中ステータス */}
            {isLiveSupabase && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>LIVE</span>
              </span>
            )}
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Supabase Auth ログインボタン */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 transition"
              title="Supabase Auth 認証ログイン"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">ログイン</span>
            </button>

            {/* 顧客新規登録ボタン */}
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-2xs transition active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">顧客アカウント作成</span>
              <span className="sm:hidden">登録</span>
            </Link>

            {/* 現在ログイン中のユーザー表示 */}
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/20"
              />
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

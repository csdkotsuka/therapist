'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { CustomerProfileEdit } from '@/components/customer/CustomerProfileEdit';
import {
  ArrowLeft,
  LogOut,
  Calendar,
  Sparkles,
  ShieldCheck,
  MapPin,
  HeartPulse,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, isLoggedIn, logout, currentBrand } = useApp();

  const handleLogout = () => {
    if (confirm('ログアウトしますか？')) {
      logout();
      router.push('/');
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
                <h1 className="text-lg font-black text-slate-900">アカウント・登録情報</h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  顧客設定
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                氏名・電話番号・ご自宅やご指定の訪問先住所を変更できます。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/bookings"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
            >
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>マイ予約を見る</span>
            </Link>

            {isLoggedIn && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition shadow-2xs"
                title="ログアウト"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>ログアウト</span>
              </button>
            )}
          </div>
        </div>

        {/* プロフィール編集フォーム */}
        <CustomerProfileEdit />
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
              - アカウント設定画面
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <Link href="/" className="hover:text-emerald-600 transition">
              ホームへ戻る
            </Link>
            <Link href="/bookings" className="hover:text-emerald-600 transition">
              マイ予約・履歴
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

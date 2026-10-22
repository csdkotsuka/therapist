'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { AdminView } from '@/components/admin/AdminView';
import { HeartPulse, ShieldAlert } from 'lucide-react';

export default function AdminPage() {
  const { currentUser, switchUser, allUsers, currentBrand } = useApp();

  // もし現在のユーザーが管理者でない場合、管理者アカウントに切り替え
  useEffect(() => {
    if (currentUser.role !== 'admin') {
      const admin = allUsers.find((u) => u.role === 'admin');
      if (admin) {
        switchUser(admin.id);
      }
    }
  }, [currentUser.role, allUsers, switchUser]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      {/* 管理本部トップインジケータ */}
      <div className="bg-purple-950 text-white text-xs px-4 py-2 border-b border-purple-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold bg-purple-700 px-2 py-0.5 rounded text-[11px]">
              ⚙️ プラットフォーム管理本部
            </span>
            <span className="text-purple-200">
              全県リアルタイム監視・愛媛県エリア統括コンソール
            </span>
          </div>

          <Link
            href="/"
            className="text-purple-300 hover:text-white underline text-xs transition"
          >
            ← 顧客画面に戻る
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AdminView />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src={currentBrand.faviconUrl}
              alt={currentBrand.name}
              className="w-5 h-5 rounded-md object-contain"
            />
            <span className="font-bold text-slate-800">{currentBrand.name}</span>
            <span className="text-[11px] text-slate-400">- プラットフォーム統括管理コンソール</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <Link href="/" className="hover:text-emerald-600 transition">
              顧客画面
            </Link>
            <Link href="/therapist" className="hover:text-emerald-600 transition">
              セラピスト画面
            </Link>
            <Link href="/guide/admin" className="hover:text-emerald-600 transition">
              管理者マニュアル
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

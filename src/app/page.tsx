'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { CustomerView } from '@/components/customer/CustomerView';
import { HeartPulse } from 'lucide-react';

export default function HomePage() {
  const { currentUser, switchUser, allUsers, isLoggedIn, currentBrand } = useApp();

  const customers = allUsers.filter((u) => u.role === 'customer');

  // もしログイン中かつ現在のユーザーが顧客でない場合、最初の顧客に切り替え
  useEffect(() => {
    if (isLoggedIn && currentUser.role !== 'customer' && customers.length > 0) {
      switchUser(customers[0].id);
    }
  }, [isLoggedIn, currentUser.role, customers, switchUser]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <CustomerView />
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
            <span className="text-[11px] text-slate-400">
              - {currentBrand.tagline} | 愛媛県発・出張＆店舗オンデマンドヘルスケアプラットフォーム
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <Link href="/guide/customer" className="hover:text-emerald-600 transition">
              ご利用ガイド
            </Link>
            <Link href="/therapist" className="hover:text-emerald-600 transition">
              セラピスト画面へ
            </Link>
            <Link href="/admin" className="hover:text-emerald-600 transition">
              管理本部へ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-black text-slate-800 dark:text-slate-100 transition-colors">
      <Header />

      {/* Main Content Area (フローティングタブバー分のpb-24を確保) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 pb-28">
        <CustomerView />
      </main>

      {/* ミニマルなすっきりフッター (各種ガイドはハンバーガーメニューに完全集約、最下部メニューに重ならないよう余白pb-24確保) */}
      <footer className="border-t border-slate-200/60 dark:border-white/10 bg-slate-50 dark:bg-black pt-5 pb-24 text-center text-[11px] text-slate-400 dark:text-slate-600 transition-colors">
        <span>© {currentBrand.name}. All rights reserved.</span>
      </footer>
    </div>
  );
}

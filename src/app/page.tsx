'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { CustomerView } from '@/components/customer/CustomerView';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-black text-slate-800 dark:text-slate-100 transition-colors">
      <Header />

      {/* Main Content Area (フローティングタブバー分のpb-28を確保、ネイティブアプリ同様にフッターは置かずメニュー内に集約) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 pb-28">
        <CustomerView />
      </main>
    </div>
  );
}

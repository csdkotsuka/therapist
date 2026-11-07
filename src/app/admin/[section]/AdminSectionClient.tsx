'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { AdminView, AdminSection } from '@/components/admin/AdminView';

const VALID_SECTIONS: AdminSection[] = [
  'kpi',
  'bookings',
  'therapists',
  'customers',
  'messages',
  'reviews',
  'branding',
  'settings',
];

export function AdminSectionClient({ rawSection }: { rawSection: string }) {
  const { currentBrand } = useApp();

  const activeSection: AdminSection = VALID_SECTIONS.includes(rawSection as AdminSection)
    ? (rawSection as AdminSection)
    : 'therapists';

  // 管理者かどうかはサーバー側（src/app/admin/layout.tsx）で確認済み
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      {/* 管理ポータルトップインジケータ */}
      <div className="bg-purple-950 text-white text-xs px-4 py-2 border-b border-purple-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold bg-purple-700 px-2 py-0.5 rounded text-[11px]">
              ⚙️ 管理ポータル
            </span>
            <span className="text-purple-300 hidden sm:inline text-[11px]">
              プラットフォーム統括・審査監視コンソール
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/guide/admin"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-800/80 hover:bg-purple-700 text-white text-[11px] font-bold transition border border-purple-600/60 shadow-xs"
            >
              <span>📚 統括マニュアル & ピッチスライド</span>
              <span className="text-[10px] text-purple-300">↗</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AdminView activeSection={activeSection} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md overflow-hidden shrink-0"
              dangerouslySetInnerHTML={{ __html: currentBrand.iconSvg }}
            />
            <span className="font-bold text-slate-800">{currentBrand.name}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <a href="/guide/admin" className="hover:text-emerald-600 transition font-medium">
              管理者マニュアル・ピッチ資料
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

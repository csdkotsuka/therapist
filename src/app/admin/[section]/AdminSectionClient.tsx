'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { AdminView, AdminSection } from '@/components/admin/AdminView';

const VALID_SECTIONS: AdminSection[] = [
  'kpi',
  'bookings',
  'therapists',
  'customers',
  'reviews',
  'branding',
  'settings',
];

export function AdminSectionClient({ rawSection }: { rawSection: string }) {
  const { currentUser, switchUser, allUsers, currentBrand } = useApp();

  const activeSection: AdminSection = VALID_SECTIONS.includes(rawSection as AdminSection)
    ? (rawSection as AdminSection)
    : 'therapists';

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

      {/* 管理ポータルトップインジケータ */}
      <div className="bg-purple-950 text-white text-xs px-4 py-2 border-b border-purple-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold bg-purple-700 px-2 py-0.5 rounded text-[11px]">
              ⚙️ 管理ポータル
            </span>
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
            <span className="font-bold text-slate-800">{currentBrand.japaneseName} ({currentBrand.name})</span>
            <span className="text-[11px] text-slate-400">- 管理ポータル</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <Link href="/guide/admin" className="hover:text-emerald-600 transition">
              管理者マニュアル
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

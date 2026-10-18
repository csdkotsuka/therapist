'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { CustomerView } from '@/components/customer/CustomerView';
import { TherapistView } from '@/components/therapist/TherapistView';
import { AdminView } from '@/components/admin/AdminView';
import {
  Users,
  Sparkles,
  Shield,
  HeartPulse,
  Info,
  Car,
  Home,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  const { currentUser, switchUser, allUsers } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      {/* ロール体験切り替えクイックバー */}
      <div className="bg-emerald-950 text-white border-b border-emerald-900/60 py-2.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-emerald-200">
              【プロトタイプ体験】現在の操作ロール:
            </span>
            <span className="font-bold text-white bg-emerald-800/80 px-2.5 py-0.5 rounded-full border border-emerald-600/50">
              {currentUser.role === 'customer' && '顧客 (田中 太郎)'}
              {currentUser.role === 'therapist' && `セラピスト (${currentUser.name})`}
              {currentUser.role === 'admin' && 'プラットフォーム管理者'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-emerald-300 font-medium hidden md:inline">ロールを切り替える:</span>
            <button
              onClick={() => switchUser('customer-001')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                currentUser.role === 'customer'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'
              }`}
            >
              ① 顧客視点
            </button>
            <button
              onClick={() => switchUser('therapist-001')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                currentUser.role === 'therapist'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'
              }`}
            >
              ② セラピスト視点
            </button>
            <button
              onClick={() => switchUser('admin-001')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                currentUser.role === 'admin'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'
              }`}
            >
              ③ 管理者視点
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentUser.role === 'customer' && <CustomerView />}
        {currentUser.role === 'therapist' && <TherapistView />}
        {currentUser.role === 'admin' && <AdminView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <HeartPulse className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800">CareHub</span>
            <span className="text-[11px] text-slate-400">- 出張・店舗オンデマンドヘルスケアプラットフォーム</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Powered by Next.js App Router, Tailwind CSS, Supabase (PostGIS & RLS) & Stripe Connect
          </p>
        </div>
      </footer>
    </div>
  );
}

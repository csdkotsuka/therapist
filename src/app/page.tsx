'use client';

import React from 'react';
import Link from 'next/link';
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
  Home as HomeIcon,
  CheckCircle2,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  const { currentUser, switchUser, allUsers } = useApp();

  const getGuideUrl = () => {
    switch (currentUser.role) {
      case 'admin':
        return '/guide/admin';
      case 'therapist':
        return '/guide/therapist';
      case 'customer':
      default:
        return '/guide/customer';
    }
  };

  const getGuideLabel = () => {
    switch (currentUser.role) {
      case 'admin':
        return '管理者運用マニュアル';
      case 'therapist':
        return 'セラピスト操作マニュアル';
      case 'customer':
      default:
        return 'ご利用ガイド';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      {/* ロール体験切り替えクイックバー */}
      <div className="bg-emerald-950 text-white border-b border-emerald-900/60 py-2.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
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

          <div className="flex items-center gap-2 flex-wrap justify-center">
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

            {/* 現在のロール向け解説ページへのボタン */}
            <Link
              href={getGuideUrl()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-800 hover:bg-teal-700 text-teal-100 text-xs font-bold transition border border-teal-600/60 shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-300" />
              <span>{getGuideLabel()}を見る</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
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
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <HeartPulse className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800">CareHub</span>
            <span className="text-[11px] text-slate-400">- 出張・店舗オンデマンドヘルスケアプラットフォーム</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <Link href="/guide/customer" className="hover:text-emerald-600 transition">
              顧客向けガイド
            </Link>
            <Link href="/guide/therapist" className="hover:text-emerald-600 transition">
              セラピスト向けマニュアル
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

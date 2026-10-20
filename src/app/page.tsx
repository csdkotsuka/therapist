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

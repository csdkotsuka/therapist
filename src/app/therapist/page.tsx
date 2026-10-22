'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { TherapistView } from '@/components/therapist/TherapistView';
import { HeartPulse, UserCheck } from 'lucide-react';

export default function TherapistPage() {
  const { currentUser, switchUser, allUsers, therapistProfiles, currentBrand } = useApp();

  // セラピスト一覧
  const therapists = allUsers.filter((u) => u.role === 'therapist');

  // もし現在のユーザーがセラピストでない場合、最初のセラピストに自動切り替え
  useEffect(() => {
    if (currentUser.role !== 'therapist' && therapists.length > 0) {
      switchUser(therapists[0].id);
    }
  }, [currentUser.role, therapists, switchUser]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      {/* セラピスト選択バー（愛媛県シミュレーション用: 複数セラピストのマイページをテスト確認可能） */}
      <div className="bg-emerald-900 text-white text-xs px-4 py-2 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold bg-emerald-700 px-2 py-0.5 rounded text-[11px]">
              💆‍♀️ セラピスト専用ポータル
            </span>
            <span className="text-emerald-200">
              現在操作中のセラピスト: <strong>{currentUser.name}</strong> ({currentUser.address || '愛媛県'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="therapist-select" className="text-emerald-200 text-[11px]">
              操作セラピスト切替:
            </label>
            <select
              id="therapist-select"
              value={currentUser.role === 'therapist' ? currentUser.id : ''}
              onChange={(e) => switchUser(e.target.value)}
              className="bg-emerald-950 border border-emerald-700 text-white rounded px-2 py-1 text-xs focus:outline-hidden"
            >
              {therapists.map((t) => {
                const tp = therapistProfiles[t.id];
                const storeLabel = tp?.is_store_based ? ' [🏢店舗あり]' : '';
                const cityName = t.address ? t.address.replace('愛媛県', '').split('市')[0] + '市' : '愛媛';
                return (
                  <option key={t.id} value={t.id}>
                    {t.name} ({cityName}){storeLabel}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <TherapistView />
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
            <span className="text-[11px] text-slate-400">- セラピスト業務管理ポータル</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <Link href="/" className="hover:text-emerald-600 transition">
              ← 顧客向けトップへ戻る
            </Link>
            <Link href="/guide/therapist" className="hover:text-emerald-600 transition">
              セラピスト操作マニュアル
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

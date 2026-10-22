'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { TherapistView, TherapistSection } from '@/components/therapist/TherapistView';

const VALID_SECTIONS: TherapistSection[] = [
  'verification',
  'requests',
  'schedule',
  'campaign',
  'services',
  'reviews',
  'earnings',
  'profile',
];

export function TherapistSectionClient({
  therapistId,
  rawSection,
}: {
  therapistId: string;
  rawSection: string;
}) {
  const router = useRouter();
  const { currentUser, allUsers, therapistProfiles, currentBrand } = useApp();

  const activeSection: TherapistSection = VALID_SECTIONS.includes(rawSection as TherapistSection)
    ? (rawSection as TherapistSection)
    : 'requests';

  const therapists = allUsers.filter((u) => u.role === 'therapist');
  const targetUser = allUsers.find((u) => u.id === therapistId) || therapists[0];
  const isAdminViewer = currentUser.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      {/* セラピスト専用ポータルバー */}
      <div className="bg-emerald-900 text-white text-xs px-4 py-2 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold bg-emerald-700 px-2 py-0.5 rounded text-[11px]">
              💆‍♀️ セラピスト専用ポータル
            </span>
            <span className="text-emerald-200">
              対象セラピスト: <strong>{targetUser?.name || '未選択'}</strong> ({targetUser?.address || '愛媛県'})
              {isAdminViewer && (
                <span className="ml-2 font-bold text-amber-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">
                  👑 管理者閲覧モード
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="therapist-switch-select" className="text-emerald-200 text-[11px]">
              対象セラピスト切替:
            </label>
            <select
              id="therapist-switch-select"
              value={targetUser?.id || ''}
              onChange={(e) => {
                const nextId = e.target.value;
                router.push(`/therapist/${nextId}/${activeSection}`);
              }}
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
        <TherapistView therapistId={targetUser?.id} activeSection={activeSection} />
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
            {isAdminViewer && (
              <Link href="/admin/therapists" className="hover:text-purple-600 font-bold transition">
                管理本部へ戻る
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

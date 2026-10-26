'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { AdminGuideNav } from '../AdminGuideNav';
import {
  Activity,
  ShieldCheck,
  Users,
} from 'lucide-react';

export default function ProposalGuidePage() {
  const { currentBrand } = useApp();

  return (
    <div className="space-y-6 pb-16 text-slate-800 dark:text-slate-200">
      <AdminGuideNav currentTab="proposal" />

      <div className="space-y-8 animate-fadeIn">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 relative overflow-hidden print-avoid-break">
          <div className="relative z-10 space-y-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30">
              Business Strategy Proposal
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug font-serif">
              {currentBrand.japaneseName} ({currentBrand.name})<br />
              ヘルスケア＆ウェルネス専門職パートナー拡大構想
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 max-w-3xl leading-relaxed">
              理学療法士・作業療法士・助産師などの国家資格保持者と、認定美容・健康指導プロを束ねる、全国規模のオンデマンド・ヘルスケアインフラへの事業飛躍構想です。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              1. 医療国家資格者による高単価・高リピート化
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              医療保険のリハビリ期限切れ患者や産後母子など、切実なペインを直接解決し強固な基盤を形成します。
            </p>
          </div>

          <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              2. 厳格な資格審査とコンプライアンス
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              全パートナーの免許証を本部で事前審査。安心と信頼のブランド価値を死守します。
            </p>
          </div>

          <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              3. 多職種シナジーとLTVの最大化
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              「理学療法×管理栄養士」「助産師×骨盤ケア」など、包括的なヘルスケア基盤を構築します。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

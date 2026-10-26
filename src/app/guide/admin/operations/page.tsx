'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { AdminGuideNav } from '../AdminGuideNav';
import {
  ShieldCheck,
} from 'lucide-react';

export default function OperationsGuidePage() {
  const { currentBrand } = useApp();

  return (
    <div className="space-y-6 pb-16 text-slate-800 dark:text-slate-200">
      <AdminGuideNav currentTab="operations" />

      <div className="space-y-8 animate-fadeIn">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5 font-serif">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>プラットフォーム統括 実務運用マニュアル</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            管理コンソール（/admin）を用いた日常の審査・監視・設定業務の手順です。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-xs space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">1. セラピスト資格・身元審査フロー</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              免許証・本人確認書類を確認し、問題がなければ「承認」をONにして公開します。
            </p>
          </div>

          <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-xs space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">2. 手数料率（Take Rate）設定</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              スライダー操作（5%〜40%）でプラットフォーム利用料率を即時変更可能です。
            </p>
          </div>

          <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-xs space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">3. 全予約監視・事前与信・強制返金</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              全予約ステータスを監視。トラブル時は管理者権限で即時全額返金キャンセルを実行できます。
            </p>
          </div>

          <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-xs space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">4. ブランド・ロゴ設定の独立管理</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              アプリ名称、ヘッダーロゴ、ファビコンを管理画面から即時切り替え可能です。
            </p>
          </div>
        </div>

        <div className="p-6 bg-slate-100 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base font-serif">実務コンソールへアクセス</h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              管理コンソールから各種審査・監視業務を行えます。
            </p>
          </div>
          <Link
            href="/admin"
            className="px-5 py-3 bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold rounded-xl transition border border-emerald-600 shadow self-start sm:self-auto"
          >
            管理コンソールを開く
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { TermsContent } from '@/components/legal/TermsContent';
import { ArrowLeft, Shield, FileText, CheckCircle2 } from 'lucide-react';

export default function TermsPage() {
  const { currentBrand } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col text-slate-800 dark:text-slate-100 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/guide" className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-sm"
              dangerouslySetInnerHTML={{ __html: currentBrand.iconSvg }}
            />
            <div>
              <span className="text-lg font-black bg-gradient-to-r from-emerald-800 to-teal-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                {currentBrand.name}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 ml-2 font-medium">利用規約</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/privacy"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 transition shadow-2xs"
            >
              <span>プライバシーポリシー</span>
            </Link>
            <Link
              href="/guide"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>総合ガイドへ</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-6">
          {/* Header Title */}
          <div className="border-b border-slate-200 dark:border-white/10 pb-5">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Terms of Service</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {currentBrand.name} プラットフォーム利用規約
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              本規約は、LINE公式アカウント連携者、出張・店舗ご利用のすべてのお客様、および登録セラピストの皆様に共通して適用されます。
            </p>
          </div>

          {/* 条文コンテンツ */}
          <TermsContent />

          {/* ページ下部ナビゲーション */}
          <div className="pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/privacy"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition"
            >
              <span>プライバシーポリシーを確認する →</span>
            </Link>
            <Link
              href="/guide"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ご利用ガイドポータルへ戻る</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#1c1c1e] py-6 text-center text-xs text-slate-400 dark:text-slate-600">
        <p>© {currentBrand.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}

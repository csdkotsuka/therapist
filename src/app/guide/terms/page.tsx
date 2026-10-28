'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { TermsContent } from '@/components/legal/TermsContent';
import { ArrowLeft, FileText, ArrowRight } from 'lucide-react';

export default function GuideTermsPage() {
  const { currentBrand } = useApp();

  return (
    <div className="space-y-8 pb-16 text-slate-800 text-sm sm:text-base leading-relaxed">
      {/* Title & Badge */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-800/80">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-300">
            Official Platform Terms
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black mt-2 text-white">
          {currentBrand.japaneseName} プラットフォーム利用規約
        </h1>
        <p className="text-sm sm:text-base text-emerald-100 mt-3 max-w-3xl leading-relaxed">
          LINE公式アカウント連携者、出張・店舗ご利用のすべてのお客様、および提携セラピストの皆様に共通して適用される公式利用規約です。
        </p>

        {/* 相互リンク */}
        <div className="mt-6 pt-6 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/guide"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-200 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>総合ガイドポータルに戻る</span>
          </Link>
          <Link
            href="/guide/privacy"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md"
          >
            <span>プライバシーポリシーを見る</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Content Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <TermsContent />
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { PrivacyContent } from '@/components/legal/PrivacyContent';
import { ArrowLeft, ShieldCheck, ArrowRight } from 'lucide-react';

export default function GuidePrivacyPage() {
  const { currentBrand } = useApp();

  return (
    <div className="space-y-8 pb-16 text-slate-800 text-sm sm:text-base leading-relaxed">
      {/* Title & Badge */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-800/80">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></span>
          <span className="text-xs uppercase font-bold tracking-widest text-blue-300">
            Privacy & Data Protection
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black mt-2 text-white">
          {currentBrand.japaneseName} プライバシーポリシー
        </h1>
        <p className="text-sm sm:text-base text-blue-100 mt-3 max-w-3xl leading-relaxed">
          LINE公式アカウント連携（友だち登録・メッセージ送信・ユーザーID連携）、出張訪問・GPS、問診情報、および決済情報の取り扱いと保護方針について定めています。
        </p>

        {/* 相互リンク */}
        <div className="mt-6 pt-6 border-t border-blue-800/60 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/guide"
            className="inline-flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>総合ガイドポータルに戻る</span>
          </Link>
          <Link
            href="/guide/terms"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md"
          >
            <span>利用規約を見る</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Content Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <PrivacyContent />
      </div>
    </div>
  );
}

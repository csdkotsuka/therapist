'use client';

// ========================================================
// セラピスト専用ログイン画面（独立ページ・フルスクリーン）
// ========================================================
import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

function TherapistLoginContent() {
  const searchParams = useSearchParams();
  const { currentBrand } = useApp();
  const redirectParam = searchParams.get('redirect') || '/therapist';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/25 to-slate-100 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* 戻るリンク */}
      <div className="max-w-md w-full mx-auto mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          トップページへ戻る
        </Link>
        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
          セラピスト業務ポータル
        </span>
      </div>

      <div className="max-w-md w-full mx-auto">
        {/* ロゴ & ヘッダー */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 bg-white flex items-center justify-center">
              {currentBrand.iconUrl ? (
                <img
                  src={currentBrand.iconUrl}
                  alt={currentBrand.japaneseName}
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <div
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{ __html: currentBrand.iconSvg }}
                />
              )}
            </div>
            <div className="text-left">
              <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">
                {currentBrand.japaneseName}
              </span>
              <span className="text-[10px] font-bold text-indigo-600 block leading-tight">
                セラピスト業務管理システム
              </span>
            </div>
          </Link>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>セラピスト ログイン</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            予約受付・出張/店舗スケジュール管理・売上確認
          </p>
        </div>

        {/* ログインカード */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/60 border border-slate-200/80 p-6 sm:p-8 backdrop-blur-md">
          <LoginForm
            targetRole="therapist"
            redirectTo={redirectParam}
            errorCode={searchParams.get('error') ?? undefined}
          />
        </div>



        {/* フッターセキュリティ注記 */}
        <div className="mt-5 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>暗号化通信（HTTPS）で保護されています</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TherapistLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-xs text-slate-500 font-bold animate-pulse">読み込み中...</div>
        </div>
      }
    >
      <TherapistLoginContent />
    </Suspense>
  );
}

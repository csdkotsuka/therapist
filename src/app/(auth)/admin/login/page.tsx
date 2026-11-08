'use client';

// ========================================================
// 管理・運営本部専用ログイン画面（独立ページ・フルスクリーン）
// ========================================================
import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, ShieldCheck, User, Sparkles, Building2 } from 'lucide-react';

function AdminLoginContent() {
  const searchParams = useSearchParams();
  const { currentBrand } = useApp();
  const redirectParam = searchParams.get('redirect') || '/admin';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-white">
      {/* 戻るリンク */}
      <div className="max-w-md w-full mx-auto mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          トップページへ戻る
        </Link>
        <span className="text-[11px] font-bold text-amber-300 bg-amber-950/70 px-2.5 py-1 rounded-full border border-amber-600/40">
          最高管理コンソール
        </span>
      </div>

      <div className="max-w-md w-full mx-auto">
        {/* ロゴ & ヘッダー */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-xs border border-white/20 bg-white flex items-center justify-center">
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
              <span className="text-xl font-black tracking-tight text-white block leading-tight">
                {currentBrand.japaneseName}
              </span>
              <span className="text-[10px] font-bold text-amber-400 block leading-tight">
                プラットフォーム統括運営本部
              </span>
            </div>
          </Link>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span>管理・運営本部 ログイン</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            プラットフォーム全体運用・セラピスト審査・決裁管理
          </p>
        </div>

        {/* ログインカード */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-700/60 p-6 sm:p-8 backdrop-blur-md text-slate-900">
          <LoginForm
            targetRole="admin"
            redirectTo={redirectParam}
            errorCode={searchParams.get('error') ?? undefined}
          />
        </div>

        {/* 別ロール向け導線 */}
        <div className="mt-6 bg-slate-800/80 rounded-2xl border border-slate-700 p-3.5 space-y-2 text-xs">
          <div className="text-[11px] font-bold text-slate-400 text-center">その他の専用ログイン</div>
          <div className="flex items-center justify-center gap-4 text-xs font-bold divide-x divide-slate-700">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 hover:underline pl-0"
            >
              <User className="w-3.5 h-3.5" />
              <span>お客様ログインはこちら ↗</span>
            </Link>
            <Link
              href="/therapist/login"
              className="inline-flex items-center gap-1.5 text-indigo-300 hover:text-indigo-200 hover:underline pl-4"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>セラピスト専用ログインはこちら ↗</span>
            </Link>
          </div>
        </div>

        {/* フッターセキュリティ注記 */}
        <div className="mt-5 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>二重認証暗号化通信（HTTPS/TLS）で保護されています</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-xs text-slate-400 font-bold animate-pulse">読み込み中...</div>
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}

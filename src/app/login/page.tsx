'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import { Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';

function LoginContent() {
  const searchParams = useSearchParams();
  const { currentBrand } = useApp();

  const roleParam = searchParams.get('role') as UserRole | null;
  const redirectParam = searchParams.get('redirect') || undefined;

  const validRole: UserRole = roleParam === 'therapist' || roleParam === 'admin' ? roleParam : 'customer';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-100 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* 戻るリンク */}
      <div className="max-w-md w-full mx-auto mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          トップページへ戻る
        </Link>
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
              <span className="text-[10px] font-bold text-emerald-600 block leading-tight">
                オンデマンド出張ヘルスケア
              </span>
            </div>
          </Link>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            スムーズ認証ログイン
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            LINE / Google / Passkey で素早く安全にアクセス
          </p>
        </div>

        {/* ログインカード */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 sm:p-8 backdrop-blur-md">
          <LoginForm initialRole={validRole} redirectTo={redirectParam} />
        </div>

        {/* フッターセキュリティ注記 */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>FIDO2 / WebAuthn 対応・暗号化セキュア接続</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-xs text-slate-500 font-bold animate-pulse">読み込み中...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

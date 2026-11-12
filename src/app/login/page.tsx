'use client';

// ========================================================
// お客様（顧客）専用ログイン画面（独立ページ・フルスクリーン）
// ========================================================
import React, { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, ShieldCheck, User } from 'lucide-react';

function CustomerLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentBrand } = useApp();

  const roleParam = searchParams.get('role');
  const redirectParam = searchParams.get('redirect') || undefined;

  // 以前の ?role=admin や ?role=therapist で来訪した場合はそれぞれの専用URLへ転送
  useEffect(() => {
    if (roleParam === 'admin') {
      router.replace(`/admin/login${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`);
    } else if (roleParam === 'therapist') {
      router.replace(`/therapist/login${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`);
    }
  }, [roleParam, redirectParam, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-100 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* 戻るリンク */}
      <div className="max-w-md w-full mx-auto mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          トップページへ戻る
        </Link>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          お客様専用
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
              <span className="text-[10px] font-bold text-emerald-600 block leading-tight">
                オンデマンド出張ヘルスケア
              </span>
            </div>
          </Link>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <span>お客様ログイン</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ご予約の確認・注文履歴・お気に入りセラピストの管理
          </p>
        </div>

        {/* ログインカード */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 sm:p-8 backdrop-blur-md">
          <LoginForm
            targetRole="customer"
            redirectTo={redirectParam}
            errorCode={searchParams.get('error') ?? undefined}
          />
        </div>



        {/* フッターセキュリティ注記 */}
        <div className="mt-5 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>暗号化通信（HTTPS）で保護されています</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-xs text-slate-500 font-bold animate-pulse">読み込み中...</div>
        </div>
      }
    >
      <CustomerLoginContent />
    </Suspense>
  );
}

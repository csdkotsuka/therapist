'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Users,
  Calendar,
  Percent,
  Sliders,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export default function AdminGuidePage() {
  return (
    <div className="space-y-8">
      {/* Title & Badge */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
          <span className="text-xs uppercase font-bold tracking-widest text-purple-400">
            Role: Admin Only
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black mt-2">
          ① プラットフォーム管理者向け 運用・仕様マニュアル
        </h1>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          CareHub の全体運営、セラピスト審査・承認、全予約監視、決済・売上分配、および手数料率の設定仕様に関する解説ドキュメントです。
        </p>

        {/* 権限ナビゲーション (管理者からはセラピスト・顧客の両方へアクセス可能) */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold">他ロールのマニュアルを閲覧:</span>
          <Link
            href="/guide/therapist"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
          >
            <span>② セラピスト向け解説へ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/guide/customer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow"
          >
            <span>③ 顧客向け解説へ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* セクション 1: ユーザー・セラピスト審査 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">1. セラピスト登録審査・パートナー管理</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            新規登録されたセラピストはデフォルトで「未承認（非公開）」状態となります。管理者は国家資格証や身元確認書類を精査し、管理画面の「承認トグルスイッチ」で公開・停止を即時制御します。
          </p>
          <div className="p-3 bg-purple-50 rounded-2xl text-[11px] text-purple-900 font-medium">
            💡 承認されたセラピストのみが、顧客の検索一覧や地図上にピンとして表示されます。
          </div>
        </div>

        {/* セクション 2: 全予約監視とキャンセル対応 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">2. 全予約トランザクション監視・キャンセル</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            出張・店舗の全予約ステータス（承認待ち・確定・完了・キャンセル）をリアルタイムで追跡。セラピストの無断遅刻や顧客都合のトラブル時には、管理者権限で「強制キャンセル」と全額返金を実行できます。
          </p>
          <div className="p-3 bg-emerald-50 rounded-2xl text-[11px] text-emerald-900 font-medium">
            💡 全ての金額データは「決済総額」「プラットフォーム手数料」「セラピスト手取り」に自動分解されます。
          </div>
        </div>

        {/* セクション 3: 手数料率（Take Rate）設定 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">3. プラットフォーム手数料率の動的変更</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            業界水準（通常20%）に合わせた手数料率スライダーを備えており、変更内容は新規予約から自動適用されます（例: 20% → 15% のキャンペーン時など）。
          </p>
        </div>

        {/* セクション 4: レビューモデレーション */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">4. レビュー・クチコミの監視と削除</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            顧客から投稿された星評価とコメントを一覧監視し、規約違反や誹謗中傷を含む不適切なレビューをワンクリックで非表示・削除可能です。
          </p>
        </div>
      </div>

      {/* Database & Architecture Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
          <span>システム仕様とデータ保護（PostGIS & RLS）</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          PostgreSQL の Row Level Security (RLS) により、管理者は全テーブルに対して全権限（SELECT, INSERT, UPDATE, DELETE）を保持しつつ、顧客やセラピストには自分自身のデータのみを安全に閲覧・更新させる権限分離がスキーマレベルで保証されています。
        </p>
      </div>
    </div>
  );
}

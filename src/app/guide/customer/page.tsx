'use client';

import React from 'react';
import Link from 'next/link';
import {
  Search,
  Home,
  Building,
  Calendar,
  CreditCard,
  Car,
  Star,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export default function CustomerGuidePage() {
  return (
    <div className="space-y-8">
      {/* Title & Badge */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
          <span className="text-xs uppercase font-bold tracking-widest text-blue-300">
            CareHub User Guide
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black mt-2">
          ③ 顧客向け ご利用ガイド (CareHub User Guide)
        </h1>
        <p className="text-sm text-blue-200 mt-2 max-w-2xl leading-relaxed">
          理学療法士、エステティシャン、整体師などの国家資格・認定プロによる「出張施術」と「店舗訪問」の検索・予約・到着追跡・決済の流れをご案内します。
        </p>

        {/* 顧客向けページには他ロールへのリンクは一切なし。トップへ戻るリンクのみ */}
        <div className="mt-6 pt-6 border-t border-blue-800/80 flex items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-blue-950 hover:bg-blue-50 text-xs font-bold transition shadow"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>セラピストを探しにアプリへ戻る</span>
          </Link>
        </div>
      </div>

      {/* Main Steps */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">ご予約から施術完了までの5つのステップ</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-black text-blue-600">
              <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">1</span>
              <span>施術スタイルを選択</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">出張施術 (訪問) or 店舗訪問</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ご自宅やオフィスに施術者がベッドを持参して伺う「出張施術」か、サロンや治療院へ行く「店舗訪問」をワンタップで選べます。
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-black text-blue-600">
              <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">2</span>
              <span>セラピストを検索・比較</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">地図 & リストから現在地周辺を検索</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              現在地からの移動時間や距離、専門資格、評価スコア、クチコミをチェック。地図ビューで周辺の施術者を視覚的に確認できます。
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-black text-blue-600">
              <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">3</span>
              <span>日時とメニューを選んで予約</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">事前仮決済（安心のオーソリ方式）</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ご希望の時間枠と訪問先住所を入力。Stripeによるクレジットカード事前与信（仮売上）を行うため、施術者が承認するまで請求は発生しません。
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-black text-blue-600">
              <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">4</span>
              <span>リアルタイムGPS到着追跡</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Uber風の現在地＆到着予定時間 (ETA)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              出張の場合、マイページから「セラピストの現在地を追跡」ボタンを押すと、地図上で向かってくる様子と到着予定時刻がリアルタイムに表示されます。
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2.5 md:col-span-2">
            <div className="flex items-center gap-2 text-xs font-black text-blue-600">
              <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">5</span>
              <span>極上のケア体験 & レビュー投稿</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">施術完了後の星評価・クチコミ</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              施術が終わると決済が完了。星評価（★1〜5）と感想コメントを投稿して、次回以降の利用や他のユーザーへ体験を共有できます。
            </p>
          </div>
        </div>
      </div>

      {/* Safety Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">安心・安全への取り組み</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            CareHub に登録されているすべての施術者は、本部による本人確認および保有資格の審査を通過しています。万が一のトラブル時にも24時間体制の運営サポートと返金保証制度をご用意しています。
          </p>
        </div>
      </div>
    </div>
  );
}

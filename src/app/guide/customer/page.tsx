'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
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
  CheckCircle2,
  Lock,
  HeartPulse,
  Clock,
  HelpCircle,
  FileText,
} from 'lucide-react';

export default function CustomerGuidePage() {
  const { currentBrand } = useApp();

  return (
    <div className="space-y-8 pb-16 text-slate-800 text-sm sm:text-base leading-relaxed">
      {/* Title & Badge */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-800 print-avoid-break">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></span>
          <span className="text-xs uppercase font-bold tracking-widest text-blue-300">
            Customer User Guide
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black mt-2 text-white">
          {currentBrand.name} ご利用ガイド
        </h1>
        <p className="text-sm sm:text-base text-blue-100 mt-3 max-w-3xl leading-relaxed">
          理学療法士、助産師、鍼灸師、エステティシャンなど、厳格な審査を通過した国家資格者・専門認定セラピストによる「出張施術」と「店舗訪問」の安心ご利用マニュアルです。
        </p>
      </div>

      {/* ご利用の5つのステップ */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-xs font-black uppercase tracking-wider text-blue-600">How to Use</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            ご予約から施術完了までのシンプルな流れ
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
            <div className="flex items-center gap-2.5 text-blue-600 font-bold">
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-sm">
                1
              </span>
              <span className="text-base sm:text-lg text-slate-900 font-black">
                施術スタイル（出張 or 来店）を選ぶ
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              ご自宅やオフィスでリラックスして受けられる「出張施術（訪問）」か、サロンや治療院へ行く「店舗訪問」をワンタップで選べます。
            </p>
            <div className="p-3 bg-blue-50/70 rounded-2xl text-xs sm:text-sm text-blue-900">
              💡 自宅にいながらプロの施術ベッド持参で本格的なケアを受けられます。
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
            <div className="flex items-center gap-2.5 text-blue-600 font-bold">
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-sm">
                2
              </span>
              <span className="text-base sm:text-lg text-slate-900 font-black">
                専門資格・口コミ・地図からプロを検索
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              マップビューで現在地周辺のセラピストを一覧表示。国家資格（理学療法士・助産師・鍼灸師等）の認証バッジ、実際の利用者の口コミ評価、得意分野を比較して選べます。
            </p>
            <div className="p-3 bg-blue-50/70 rounded-2xl text-xs sm:text-sm text-blue-900">
              💡 厳しい書類審査をクリアした身元確かなプロのみが掲載されています。
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
            <div className="flex items-center gap-2.5 text-blue-600 font-bold">
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-sm">
                3
              </span>
              <span className="text-base sm:text-lg text-slate-900 font-black">
                メニュー・日時を指定して仮予約
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              ご希望の日時、施術コース、訪問先住所を入力します。クレジットカード決済による「事前与信（仮売上）」を行うため、セラピストが予約を承認するまで決済は確定しません。
            </p>
            <div className="p-3 bg-blue-50/70 rounded-2xl text-xs sm:text-sm text-blue-900">
              🔒 Stripeによる世界最高水準の暗号化セキュリティでカード情報は安全に保護されます。
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
            <div className="flex items-center gap-2.5 text-blue-600 font-bold">
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-sm">
                4
              </span>
              <span className="text-base sm:text-lg text-slate-900 font-black">
                リアルタイムGPS到着追跡 ＆ チャット連絡
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              出張の場合、セラピストが出発すると地図上で現在地がリアルタイムに動いて表示されます。到着予想時間（あと◯分）がカウントダウンされるため、準備をして安心してお待ちいただけます。
            </p>
            <div className="p-3 bg-blue-50/70 rounded-2xl text-xs sm:text-sm text-blue-900">
              🚗 「今どこにいるかわかる」Uber Eats風の追跡機能で、初めての出張利用でも安心です。
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
            <div className="flex items-center gap-2.5 text-blue-600 font-bold">
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-sm">
                5
              </span>
              <span className="text-base sm:text-lg text-slate-900 font-black">
                施術の受療 ＆ キャッシュレス自動決済
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              プロによる本格的な施術を受けます。終了後、セラピストの完了報告とともに登録クレジットカードから自動決済されます。当日の現金受け渡しやお釣りの心配は一切ありません。
            </p>
            <div className="p-3 bg-blue-50/70 rounded-2xl text-xs sm:text-sm text-blue-900">
              ⭐ 施術完了後は星評価とレビューを投稿でき、領収書もマイページから即時発行可能です。
            </div>
          </div>

          {/* 安心・安全のサポート */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-200 shadow-xs space-y-3.5 print-avoid-break">
            <div className="flex items-center gap-2.5 text-emerald-700 font-bold">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <span className="text-base sm:text-lg text-slate-900 font-black">
                安心・安全のための3つの取り組み
              </span>
            </div>
            <ul className="text-sm text-slate-700 space-y-2 list-disc list-inside leading-relaxed">
              <li>
                <strong>国家資格・身元審査の徹底:</strong> 全ての施術者は本人確認書類および資格免許証の厳格な審査を完了しています。
              </li>
              <li>
                <strong>損害賠償保険の加入:</strong> 万が一の対人・対物事故に備え、全セラピストが賠償責任保険を適用しています。
              </li>
              <li>
                <strong>チャット＆サポート体制:</strong> プラットフォーム管理本部がメッセージを24時間体制で監査・サポートしています。
              </li>
            </ul>

            <div className="pt-3 border-t border-emerald-100 flex flex-wrap items-center gap-3">
              <Link
                href="/terms"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>利用規約（全文）を確認する</span>
              </Link>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>プライバシーポリシーを確認する</span>
              </Link>
              <Link
                href="/guide"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-blue-300 bg-blue-50 text-blue-800 text-xs font-bold hover:bg-blue-100 transition ml-auto"
              >
                <span>← 総合案内ポータルへ戻る</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

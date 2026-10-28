'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Users,
  Award,
  FileText,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Search,
  Calendar,
  CreditCard,
  Car,
  CheckCircle2,
  Lock,
  HeartHandshake,
  Smartphone,
  ExternalLink,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export default function GuideHubPage() {
  const { currentBrand } = useApp();

  return (
    <div className="space-y-10 pb-16 text-slate-800 text-sm sm:text-base leading-relaxed">
      {/* ヒーローヘッダー */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-800/80 relative overflow-hidden">
        {/* 背景の装飾 */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] sm:text-xs uppercase font-bold tracking-widest text-emerald-300">
              Official Hub & Guide Portal
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {currentBrand.name} 総合案内 & 公式規約ポータル
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 max-w-2xl leading-relaxed">
            {currentBrand.name} をご利用いただく皆様へ。
            お客様とセラピスト双方が安心してご利用いただけるよう、ご利用ガイド、プラットフォーム利用規約、およびプライバシーポリシーをご案内しています。
          </p>

          {/* 独立した各規約ページへのダイレクトボタン */}
          <div className="pt-2 flex flex-wrap gap-3 text-xs sm:text-sm font-bold">
            <Link
              href="/terms"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-emerald-50 shadow-md transition active:scale-95"
            >
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>利用規約（全文）を見る</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-blue-300" />
              <span>プライバシーポリシー（全文）を見る</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2大ジャンルへのカード導線 */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-600">Select Your Role</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            あなたはどちらをお探しですか？
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            お客様・セラピストそれぞれの利用方法・手続きに特化した説明ページへご案内します。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* ① 顧客・ご利用者向けカード */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-md transition group flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                  <Search className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  ご利用者・お客様向け
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition">
                  お客様向け ご利用ガイド
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  理学療法士、助産師、鍼灸師などの国家資格者・専門認定セラピストによる「出張施術」と「店舗訪問」の安心ご利用マニュアルです。
                </p>
              </div>

              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>検索から日時選択・事前決済までの4ステップ</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>出張時の準備・ご自宅での受け入れ環境</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>キャンセルポリシー・返金規定</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>LINE通知・リマインド機能の活用方法</span>
                </li>
              </ul>
            </div>

            <Link
              href="/guide/customer"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition group-hover:translate-x-0.5"
            >
              <span>お客様向けガイドを見る</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* ② セラピスト・施術パートナー向けカード */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-md transition group flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                  <Award className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  セラピスト・専門職向け
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition">
                  セラピスト向け 実務運用マニュアル
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  新規登録審査、予約リクエストの受託、出張GPS送信、施術完了報告、そしてStripeを通じた報酬受取までの全実務フローを解説しています。
                </p>
              </div>

              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>国家資格証・身元確認書類の審査フロー</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>予約承認・出張時のGPS現在地送信</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>施術完了報告とStripe Connect報酬受取</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>直契約禁止・守秘義務などのコンプライアンス</span>
                </li>
              </ul>
            </div>

            <Link
              href="/guide/therapist"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition group-hover:translate-x-0.5"
            >
              <span>セラピスト向けマニュアルを見る</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 公式規約・ポリシーセクション（独立専用ページへの案内） */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">Legal & Compliance</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            公式規約・プライバシーポリシー（独立専用ページ）
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            LINE公式アカウント設定および各種手続きに紐付けされる独立した専用ページです。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 利用規約カード */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-slate-300 shadow-sm transition space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 font-black text-slate-900">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-base">利用規約</span>
                    <span className="text-[10px] text-slate-400 font-medium">Terms of Service</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">共通</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                本サービスの利用条件、予約契約の成立、キャンセル規定、出張施術時の遵守事項、直契約（引き抜き行為）の禁止、免責事項等を定めています。
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/terms"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition shadow-xs"
              >
                <span>利用規約（全文）ページを開く</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* プライバシーポリシーカード */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-300 shadow-sm transition space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 font-black text-slate-900">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-base">プライバシーポリシー</span>
                    <span className="text-[10px] text-slate-400 font-medium">Privacy Policy</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">共通</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                LINE公式アカウント連携（UID・チャット）、出張先住所、問診・健康情報、クレジットカード情報の非保持化、安全管理措置等について定めています。
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/privacy"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition shadow-xs"
              >
                <span>プライバシーポリシー（全文）ページを開く</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* LINE公式アカウント連携のメリットと機能 */}
      <section className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 rounded-3xl p-6 sm:p-8 border border-emerald-200/60 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              LINE公式アカウントとの安心・快適な連携
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              {currentBrand.name} ではLINE公式アカウントを通じてリアルタイムな通知と安全なやりとりを実現しています。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
              <Smartphone className="w-4 h-4" />
              <span>① 予約・決済の即時通知</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              予約完了や決済承認、前日のリマインドがLINEに直接届くため、予約忘れの心配がありません。
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
              <Car className="w-4 h-4" />
              <span>② 出張時の到着状況把握</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              セラピストが出発するとLINEに通知が届き、GPS移動状況から正確な到着予測時間を確認できます。
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
              <Lock className="w-4 h-4" />
              <span>③ プライバシー厳守のチャット</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              事前の道順連絡や身体の気になる箇所のカウンセリングも、安全な環境で直接やり取りできます。
            </p>
          </div>
        </div>
      </section>

      {/* プラットフォーム運営ドキュメント（管理者用） */}
      <div className="pt-2 text-center">
        <Link
          href="/guide/admin"
          className="text-xs text-slate-400 hover:text-slate-600 underline font-medium"
        >
          管理者・事業計画ドキュメントはこちら（役員専用）
        </Link>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { AdminGuideNav } from '../AdminGuideNav';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  History,
  Trash2,
  Lock,
  Sliders,
  Percent,
  TrendingUp,
  CreditCard,
  MessageSquare,
  Smile,
  Calendar,
  Sparkles,
  Users,
} from 'lucide-react';

export default function OperationsGuidePage() {
  const { currentBrand } = useApp();

  return (
    <div className="space-y-6 pb-16 text-slate-800 dark:text-slate-200">
      <AdminGuideNav currentTab="operations" />

        <div className="space-y-8">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 print-avoid-break">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
                Admin Operations Manual (Updated)
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mt-2">
              プラットフォーム統括 実務運用マニュアル
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-3 max-w-3xl leading-relaxed">
              改築された最新システム仕様に基づく公式手順書です。審査証跡ログ（Supabase）と原本Storage自動削除、Stripe Connect審査手数料・電子誓約書、メッセージ監査、口コミ管理、ブランド・ロゴ設定、全予約・売上分配の統括実務を網羅しています。
            </p>
          </div>

          {/* 運用手順カード一覧 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. 審査承認 & Storage自動削除 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                <Users className="w-6 h-6 print:stroke-[2.5]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                1. セラピスト資格審査 ＆ 原本自動削除・永続証跡ログ管理
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                新規登録者は初期状態で「未承認（非公開）」です。管理者は提出書類（国家資格証・身分証・保険証書）を照合し、「承認」を実行します。承認完了と同時に、個人情報保護法に基づき原本ファイルはStorageから自動完全削除され、承認日時・資格種別・登録番号・照合氏名がテキスト証跡ログ（therapist_verification_logs）として永続保持されます。
              </p>
              <div className="p-3.5 bg-purple-50 rounded-2xl text-xs sm:text-sm text-purple-900 font-medium">
                💡 原本ファイルが削除されても、照合証跡ログがあるため監査・法務対応を完全にクリアできます。
              </div>
            </div>

            {/* 2. Stripe Connect & 審査料・電子誓約書 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                <CreditCard className="w-6 h-6 print:stroke-[2.5]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                2. 審査手数料（3,300円）決済 ＆ 電子誓約書・Stripe連携
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                不正登録の防止と冷やかし排除のため、セラピストは事前審査料（Stripe決済）と電子誓約書（法令遵守・直契約禁止規約への同意）の締結が必要です。管理画面の提出書類一覧の見出しサマリーで各人のステータス（済/未）を瞬時に確認できます。
              </p>
              <div className="p-3.5 bg-indigo-50 rounded-2xl text-xs sm:text-sm text-indigo-900 font-medium">
                💡 手数料決済と電子誓約書が「済」になっていることを確認した上で、最終承認（公開）を付与します。
              </div>
            </div>

            {/* 3. 全メッセージリアルタイム監視 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                <MessageSquare className="w-6 h-6 print:stroke-[2.5]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                3. 全メッセージリアルタイム監視（中抜き・直取引検知）
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                管理ポータルの「全メッセージ監視」タブから、顧客とセラピスト間のチャットログをリアルタイムで監査します。電話番号、LINE ID、直契約・口座振込の示唆などを自動検知フィルターでアラート表示し、プラットフォームの中抜きを未然に防止します。
              </p>
              <div className="p-3.5 bg-amber-50 rounded-2xl text-xs sm:text-sm text-amber-900 font-medium">
                💡 送信者・宛先・本文が横一列に整然と並び、各ユーザー名からワンクリックで詳細や視点切替が可能です。
              </div>
            </div>

            {/* 4. 口コミ・レビューモデレーション & 顧客視点切替 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-black">
                <Smile className="w-6 h-6 print:stroke-[2.5]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                4. 口コミ・レビュー管理 ＆ ワンタップ視点切り替え
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                投稿された評価・レビューを監視し、誹謗中傷や不適切な内容は即座にモデレーション（非表示化）可能。レビュー内の投稿者名やセラピスト名をクリックするだけで、そのユーザーの視点に切り替えて顧客画面やセラピスト詳細を確認できます。
              </p>
              <div className="p-3.5 bg-teal-50 rounded-2xl text-xs sm:text-sm text-teal-900 font-medium">
                💡 顧客一覧でも右端のボタンから1タップでその顧客としてアプリトップを表示できます。
              </div>
            </div>

            {/* 5. 全予約トランザクション監視と強制キャンセル */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                <Calendar className="w-6 h-6 print:stroke-[2.5]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                5. 全予約トランザクション監視 ＆ 事前オーソリ・強制返金
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                出張・店舗の全予約ステータス（承認待ち・確定・施術完了・キャンセル）を追跡。顧客予約時はクレジットカードの事前与信（仮売上）を行い、施術完了時に自動キャプチャ。トラブル発生時は管理者権限で即時全額返金キャンセルを実行できます。
              </p>
              <div className="p-3.5 bg-emerald-50 rounded-2xl text-xs sm:text-sm text-emerald-900 font-medium">
                💡 全売上は「総決済額」「プラットフォーム手数料（スライダーで動的変更可）」「セラピスト手取り」に自動計算されます。
              </div>
            </div>

            {/* 6. ブランド・ロゴ設定の独立管理 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                <Sparkles className="w-6 h-6 print:stroke-[2.5]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                6. アプリ名・ブランドロゴ・ファビコンアイコンの独立設定
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                管理画面の「ブランド・ロゴ設定」から、アプリ名称、ヘッダーに配置するロゴ画像、ブラウザタブのファビコンやアプリアイコンをそれぞれ独立して設定・切り替えることができます。提供ロゴ画像からトリミングされた高品質シンボルマークを即時反映可能です。
              </p>
              <div className="p-3.5 bg-rose-50 rounded-2xl text-xs sm:text-sm text-rose-900 font-medium">
                💡 サービス名称変更や地域・季節キャンペーン時にも、コード修正なしで一括適用されます。
              </div>
            </div>
          </div>

          {/* 管理コンソールへの復帰リンク */}
          <div className="p-6 bg-slate-100 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <div>
              <h4 className="font-bold text-slate-900 text-base">実務コンソールへアクセス</h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                上記の運用手順に基づき、管理コンソールから各種審査・監視・設定業務を行えます。
              </p>
            </div>
            <Link
              href="/admin"
              className="px-5 py-3 bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-emerald-600 transition border border-emerald-600 shadow self-start sm:self-auto"
            >
              管理コンソールを開く
            </Link>
          </div>
        </div>
    </div>
  );
}

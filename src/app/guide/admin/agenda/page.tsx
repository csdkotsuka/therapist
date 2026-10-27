'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '@/context/AppContext';
import {
  Crown,
  Sparkles,
  Smartphone,
  Lock,
  ShieldCheck,
  HelpCircle,
  Copy,
  Check,
  Printer,
  Scale,
  Coins,
  Building,
  Globe,
  Layers,
  ShieldAlert,
  Percent,
  TrendingUp,
} from 'lucide-react';

export default function AgendaPage() {
  const { currentBrand } = useApp();
  const [copiedAgenda, setCopiedAgenda] = useState<boolean>(false);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // 会長向け事前相談・報告アジェンダ（表形式テキスト）
  const AGENDA_TEXT = `【事前相談・報告アジェンダ】「Care KURU」プロジェクト推進計画

■ 1. 決定事項のご報告（前提共有）
┌────────────┬─────────────────────────────┬──────────────────────────────────────────┐
│ 項目       │ 決定内容                    │ メリット・狙い                           │
├────────────┼─────────────────────────────┼──────────────────────────────────────────┤
│ アプリ名称 │ Care KURU（ケア・クル）     │ オンデマンド出張ヘルスケアの明快な想起   │
│ 提供形態   │ PWA（アプリ風Web・審査なし）│ App Store審査・規約回避で最速リリース    │
│            │                             │ ※スマホホーム画面追加で通常アプリ同様    │
│ セキュリティ│ Stripe連携（ゼロリスク設計）│ 免許証・口座は自社DBに一切保存せずStripe │
│            │                             │ で管理。万一の攻撃時も漏洩情報自体が存在 │
│            │                             │ しない安心設計（現在テスト運用・調整中） │
│ 信頼性担保 │ 5段階チェック体制           │ 審査料・誓約書・Stripe本人確認・資格証・ │
│            │                             │ 保険証書（証明書画像は確認後即時自動破棄）│
└────────────┴─────────────────────────────┴──────────────────────────────────────────┘

■ 2. 会長への相談・決裁事項（全6項目）
┌────┬──────────────┬───────────────────────────────┬──────────────────────────────────────────┐
│ No │ 相談項目     │ 検討案（背景）                │ 会長への相談・確認事項                   │
├────┼──────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ ①  │ 登録料・会費 │ 初期0円 → 安定後月1万円       │ 初期無料方針でよいか？相場を踏まえた     │
│    │              │ （外部は少し高め）            │ 価格水準や移行時期についてのご意見       │
├────┼──────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ ②  │ 手数料・粗利 │ 手数料20%・実質粗利約16.4%   │ 手数料20%・粗利率16.4%の設定でよいか？   │
│    │              │ （Stripe決済費▲約3.6%控除後） │ （業界相場20〜30%）                      │
├────┼──────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ ③  │ 売上受取口座 │ Stripe連携メイン口座          │ プラットフォーム側の売上・手数料を受け取 │
│    │              │                               │ る法人（または口座）の指定               │
├────┼──────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ ④  │ 公開ドメイン │ ブランド信用力の活用          │ 活用できる「NEOFAMILY」関連ドメインは    │
│    │              │                               │ あるか？使わせていただけるか？(2段階)    │
├────┼──────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ ⑤  │ インフラ実費 │ 月額数千円〜1万円程度         │ 自己負担も可能だが、プロジェクト経費とし │
│    │              │ （DB・サーバー代）            │ て計上・精算させていただけるか？         │
├────┼──────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ ⑥  │ 事業賠償保険 │ 2段階導入                     │ スタート時は個人の保険加入徹底で立ち上げ │
│    │              │                               │ 規模拡大時に会社として包括加入でよいか？ │
└────┴──────────────┴───────────────────────────────┴──────────────────────────────────────────┘`;

  const handleCopyAgenda = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(AGENDA_TEXT);
      setCopiedAgenda(true);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}
      setTimeout(() => setCopiedAgenda(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          会長向け事前相談・報告アジェンダ (Executive Agenda)
         ======================================================== */}
      <div className="space-y-8 animate-fadeIn">
        {/* Executive Header Banner */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 relative overflow-hidden print-avoid-break">
          <div className="absolute -right-10 -top-10 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-10 bottom-0 opacity-10 pointer-events-none hidden md:block">
            <Crown className="w-64 h-64 text-emerald-400" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/40 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>Executive Consultation & Decision Agenda</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 text-[11px] font-bold">
                役員・会長事前相談（決裁サマリー表）
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug font-serif">
                【事前相談・報告アジェンダ】<br className="sm:hidden" />
                「Care KURU」プロジェクト推進計画
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-3xl leading-relaxed mt-2">
                オンデマンド・ヘルスケア＆ボディケアプラットフォーム「Care KURU（ケア・クル）」の正式ローンチに向け、すでに固めた基本設計のご報告と、経営判断を仰ぎたい重要決裁論点を表形式でコンパクトに整理したサマリーです。
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3 print:hidden">
              <button
                type="button"
                onClick={handleCopyAgenda}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg transition flex items-center gap-2 active:scale-95 cursor-pointer"
                title="会長へのLINEやメール送信用にサマリーテキストをコピーします"
              >
                {copiedAgenda ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>サマリー表テキストをコピーしました！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>LINE・メール送信用に全文コピー</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold rounded-2xl transition border border-white/20 flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>A4形式で印刷・PDF出力</span>
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 第1部: 決定事項・基本設計のご報告（前提共有） */}
        {/* ======================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                1
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  決定事項・基本設計のご報告（前提の共有）
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  最速リリースと完全なリスクヘッジを両立させたコア設計
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              基本合意事項
            </span>
          </div>

          {/* 第1表 */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs bg-white dark:bg-[#1c1c1e]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4 w-1/4 min-w-[130px]">項目</th>
                    <th className="py-3 px-4 w-1/3 min-w-[180px]">決定内容・アーキテクチャ</th>
                    <th className="py-3 px-4 w-5/12 min-w-[220px]">メリット・事業上の狙い</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>アプリ名称</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700 dark:text-emerald-400">
                      Care KURU（ケア・クル）
                      <span className="block text-[11px] font-normal text-slate-400 mt-0.5">※ロゴは現在デザイン検討中</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      「ケアが来る・クルマで来る」オンデマンド出張ヘルスケアの明快な想起と親しみやすさ。
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>提供形態（PWA）</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs mb-1">
                        アプリ風Web（審査不要）
                      </span>
                      <p className="text-xs text-slate-800 dark:text-slate-200">
                        スマホの「ホーム画面追加」で通常アプリと同様に動作。
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong className="text-slate-900 dark:text-white">App Store審査待ち・規約リスク・初期ストア申請コストを完全回避。</strong> 最短で実用リリースが可能。
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>セキュリティ対策</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs mb-1">
                        Stripe Connect直接照合
                      </span>
                      <p className="text-xs text-slate-800 dark:text-slate-200">
                        免許証や銀行口座は自社DBに一切保存しないゼロリスク構造。
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      万が一のサイバー攻撃時にも<strong className="text-slate-900 dark:text-white">「そもそも盗まれる重要情報が存在しない」</strong>ため、情報漏洩リスクを根本から完全遮断。現在テスト運用・最終調整中。
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>施術者の信頼性担保</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs mb-1">
                        厳格な5段階チェック体制
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        ①審査料 ②電子誓約 ③Stripe本人確認 ④国家資格証 ⑤損害保険証書
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      提出された資格証・保険証書画像は運営確認完了と同時に<strong className="text-slate-900 dark:text-white">ストレージから自動削除</strong>（承認ログのみ保持し漏洩防止）。
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 第2部: 会長への相談・決裁事項（全6項目） */}
        {/* ======================================================== */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                2
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  会長への相談・決裁事項（全6項目）
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  事業立ち上げにあたり、ご判断・ご意見をいただきたい重要論点
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              決裁対象 全6項目
            </span>
          </div>

          {/* 第2表 */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs bg-white dark:bg-[#1c1c1e]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3 w-12 text-center">No</th>
                    <th className="py-3 px-4 w-1/4 min-w-[140px]">相談項目</th>
                    <th className="py-3 px-4 w-1/3 min-w-[200px]">検討案・背景</th>
                    <th className="py-3 px-4 w-5/12 min-w-[240px]">会長への相談・確認内容</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                  {/* ① 登録料・月額会費設定 */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3 text-center">
                      <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-black text-xs inline-flex items-center justify-center">
                        1
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <span>施術者登録料・月額会費</span>
                      <span className="block text-[11px] font-normal text-amber-600 dark:text-amber-400 mt-0.5">
                        初期供給数の最大化
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                      初期立ち上げ期はハードルを下げて登録者数を集めたいため<strong className="text-emerald-700 dark:text-emerald-400">「無料（0円）」</strong>でスタートし、運営安定後に<strong className="text-emerald-700 dark:text-emerald-400">「NEOFAMILYメンバー月額1万円 / メンバー外は少し高め」</strong>の定額会費へ移行する計画。
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-amber-950 dark:text-amber-100 bg-amber-50/40 dark:bg-amber-950/20 leading-relaxed">
                      初期0円スタート→運営安定後に「NEOFAMILYメンバー1万円・メンバー外少し高め」へと段階的に移行する方針でよろしいでしょうか？また、業界相場を踏まえ、どのような価格水準・移行時期が良いかご意見を伺えますでしょうか？
                    </td>
                  </tr>

                  {/* ② 手数料率・想定利益率 */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3 text-center">
                      <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs inline-flex items-center justify-center">
                        2
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <span>手数料率・想定利益率</span>
                      <span className="block text-[11px] font-normal text-emerald-600 dark:text-emerald-400 mt-0.5">
                        手数料20%・実質粗利16.4%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                      <div className="space-y-1">
                        <p>・手数料率（テイクレイト）: <strong className="text-slate-900 dark:text-white">20%</strong>（相場20〜30%）</p>
                        <p>・Stripe決済手数料: <span className="text-rose-600 dark:text-rose-400 font-bold">▲ 約3.6%</span></p>
                        <p>・プラットフォーム実質粗利: <strong className="text-emerald-600 dark:text-emerald-400">約16.4%</strong>（1万円決済で粗利1,640円）</p>
                        <p className="text-[11px] text-slate-500">※月額会費＋予約手数料のハイブリッド構造</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-emerald-950 dark:text-emerald-100 bg-emerald-50/40 dark:bg-emerald-950/20 leading-relaxed">
                      1) 手数料率は「20%」の設定で問題ないでしょうか？（あるいは初期は利用促進のためさらに低めに設定すべきでしょうか？）<br />
                      2) Stripe決済費控除後の実質粗利益率（約16.4%）および利益率設計についてご意見を伺えますでしょうか？
                    </td>
                  </tr>

                  {/* ③ 収益受取口座 */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3 text-center">
                      <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs inline-flex items-center justify-center">
                        3
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <span>収益受取口座の指定</span>
                      <span className="block text-[11px] font-normal text-blue-600 dark:text-blue-400 mt-0.5">
                        法人・税務
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                      プラットフォームの利用料・会費・予約手数料決済を受け取るための、Stripe連携メイン口座の指定が必要です。
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-blue-950 dark:text-blue-100 bg-blue-50/40 dark:bg-blue-950/20 leading-relaxed">
                      プラットフォーム側の売上受取口座は、<strong>どの法人（または口座）</strong>に紐付ける形にいたしますか？
                    </td>
                  </tr>

                  {/* ④ 公開ドメイン */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3 text-center">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs inline-flex items-center justify-center">
                        4
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <span>公開URL・ドメイン確認</span>
                      <span className="block text-[11px] font-normal text-indigo-600 dark:text-indigo-400 mt-0.5">
                        ブランド信用力の活用
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                      サービスの信頼性と安心感を担保するため、既存のNEOFAMILYブランド傘下でのWebアプリ公開を想定しております。
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-indigo-950 dark:text-indigo-100 bg-indigo-50/40 dark:bg-indigo-950/20 leading-relaxed">
                      1) そもそも「NEOFAMILY」関連で活用可能なドメインやWeb基盤はございますでしょうか？<br />
                      2) もしある場合、そのサブドメイン（例: carekuru.neofamily.jp 等）を使用させていただくことは可能でしょうか？
                    </td>
                  </tr>

                  {/* ⑤ インフラ初期経費 */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3 text-center">
                      <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-black text-xs inline-flex items-center justify-center">
                        5
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <span>インフラ初期実費経費</span>
                      <span className="block text-[11px] font-normal text-purple-600 dark:text-purple-400 mt-0.5">
                        予算・経費精算
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                      データベース・認証基盤（Supabase等）の維持にかかる月額費用（月額数十ドル / 数千円〜1万円程度）。
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-purple-950 dark:text-purple-100 bg-purple-50/40 dark:bg-purple-950/20 leading-relaxed">
                      このシステム維持実費は、自分で自己負担しても良いと考えておりますが、<strong>プロジェクト経費として計上・精算</strong>させていただけるものでしょうか？
                    </td>
                  </tr>

                  {/* ⑥ 事業賠償責任保険 */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3 text-center">
                      <span className="w-6 h-6 rounded-lg bg-rose-600 text-white font-black text-xs inline-flex items-center justify-center">
                        6
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <span>事業賠償責任保険の時期</span>
                      <span className="block text-[11px] font-normal text-rose-600 dark:text-rose-400 mt-0.5">
                        リスクマネジメント
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                      施術者個人の損害保険加入は必須。プラットフォーム（運営会社）全体としての施設・受託者賠償保険の要否。
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-rose-950 dark:text-rose-100 bg-rose-50/40 dark:bg-rose-950/20 leading-relaxed">
                      スタート時は個人の保険徹底で立ち上げ、<strong>本格稼働・規模拡大のタイミングで会社として事業保険に加入する2段階の想定</strong>でよろしいでしょうか？
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
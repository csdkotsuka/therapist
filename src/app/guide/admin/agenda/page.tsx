'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '@/context/AppContext';
import { AdminGuideNav } from '../AdminGuideNav';
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
} from 'lucide-react';

export default function AgendaPage() {
  const { currentBrand } = useApp();
  const [copiedAgenda, setCopiedAgenda] = useState<boolean>(false);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // 会長向け事前相談・報告アジェンダ全文テキスト
  const AGENDA_TEXT = `【事前相談・報告アジェンダ】「Care KURU」プロジェクト推進計画

1. 決定事項・基本設計のご報告（前提の共有）
■ アプリ名称: 「Care KURU（ケア・クル）」（※ロゴは現在デザイン検討中）
■ 開発・提供形態:
・App Store審査や初期のストア申請コスト・規約リスクを回避するため、初期はネイティブアプリ化を見送り、「Webアプリ（PWA対応）」として最速リリース。
・ユーザー・施術者はスマホのホーム画面追加やLINE経由で、通常のアプリと同じ感覚で利用可能。
■ セキュリティ・情報漏洩対策（Stripe連携の説明）:
・金融機関水準のセキュリティを持つ「Stripe Connect」を採用。
・特徴: 免許証や銀行口座などの最重要個人情報は自社サーバー・自社DBには一切保存せず、すべてStripeの堅牢なサーバー側で直接管理・照合。
・本アプリは認証結果（フラグ）のみを連携するため、万が一のサイバー攻撃時にも「そもそも盗まれる重要情報が存在しない」ゼロリスク設計を実現。
・現在、決済フローはテスト運用・最終調整段階。
■ 施術者の信頼性担保フロー（5段階チェック）:
① 審査手数料（初期は無料枠を検討）
② 電子誓約書（直契約禁止・コンプライアンス遵守）
③ Stripeによる本人確認（顔写真照合＋口座名義照合）
④ 国家資格証／認定資格証の提出
⑤ 個人損害賠償責任保険証書の提出
※ ④⑤の証明書ファイルは、運営確認完了と同時にストレージから自動削除（テキストの承認ログのみ保持し、漏洩リスクを完全遮断）。

2. 会長への相談・決裁事項（確認したいポイント）
① 施術者の初期登録料
・検討案・背景: 初期立ち上げ期はハードルを下げて登録者数を集めたいため「無料（0円）」でスタートし、一定規模後に審査手数料（5,000円程度）を有料化する案。
・会長への相談内容: 初期起業時点は「無料」で一気に集める方針でよろしいでしょうか？あるいは初期から覚悟料として少額でもいただくべきでしょうか？

② 手数料率（プラットフォーム取り分）
・検討案・背景: 施術者が自由に価格設定を行い、予約成立時にプラットフォームが「20%」を手数料として徴収するモデル。
・会長への相談内容: 手数料率は「20%」の設定で問題ないでしょうか？（業界相場20〜30%）

③ 収益受取口座の指定
・検討案・背景: 手数料（20%）を受け取るためのStripe連携メイン口座。
・会長への相談内容: プラットフォーム側の売上受取口座は、どの法人（または口座）に紐付ける形にいたしますか？

④ 公開URL（ドメイン）
・検討案・背景: 信頼性を担保するため、既存のブランドドメイン傘下での公開を想定。
・会長への相談内容: Webアプリの公開URLとして、「NEOFAMILY」関連のドメイン（サブドメイン等）を使用させていただいてよろしいでしょうか？

⑤ インフラ初期経費（Supabase等）
・検討案・背景: データベース・ユーザー管理にかかる月額費用（1プロジェクトあたり月額数十ドル/数千円程度）。
・会長への相談内容: このシステム維持にかかる実費経費は、どの枠（プロジェクト予算等）から計上・精算させていただけばよろしいでしょうか？

⑥ 事業賠償責任保険の加入時期
・検討案・背景: 施術者個人の損害保険加入は必須。プラットフォーム（運営会社）全体としての施設・受託者賠償保険の要否。
・会長への相談内容: スタート時は個人の保険徹底で立ち上げ、本格稼働・規模拡大のタイミングで事業保険に加入する2段階の想定でよろしいでしょうか？`;

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
      {/* 4ページ切り替えナビゲーション */}
      <AdminGuideNav currentTab="agenda" />

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
                役員・会長事前相談
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug font-serif">
                【事前相談・報告アジェンダ】<br className="sm:hidden" />
                「Care KURU」プロジェクト推進計画
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-3xl leading-relaxed mt-2">
                本資料は、オンデマンド・ヘルスケア＆ボディケアプラットフォーム「Care KURU（ケア・クル）」の正式ローンチに向け、すでに固めた基本設計の共有と、経営判断を仰ぎたい重要決裁論点を整理した事前相談アジェンダです。
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3 print:hidden">
              <button
                type="button"
                onClick={handleCopyAgenda}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg transition flex items-center gap-2 active:scale-95 cursor-pointer"
                title="会長へのLINEやメール送信用に全文テキストをコピーします"
              >
                {copiedAgenda ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>アジェンダ全文をコピーしました！</span>
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
        {/* 第1章: 決定事項・基本設計のご報告（前提の共有） */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-white/10 pb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              1
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                決定事項・基本設計のご報告（前提の共有）
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                先行して設計・実装を完了している基本構造とセキュリティ対策
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* カード1: アプリ名称 */}
            <div className="bg-white dark:bg-[#1c1c1e] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block">公式決定</span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">アプリ名称</h3>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/10 space-y-1">
                <div className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                  「Care KURU（ケア・クル）」
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  ※ ロゴデザイン・商標出願準備は現在デザイン検討中
                </p>
              </div>
            </div>

            {/* カード2: 開発・提供形態 */}
            <div className="bg-white dark:bg-[#1c1c1e] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block">開発戦略</span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">開発・提供形態（最速ローンチ）</h3>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/10 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <p className="font-bold text-slate-900 dark:text-white">
                  初期はネイティブアプリ化を見送り、「Webアプリ（PWA対応）」として最速リリース
                </p>
                <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                  App Store審査や初期のストア申請コスト・規約リスクを完全に回避。ユーザー・施術者はスマホのホーム画面追加やLINE経由で、通常のネイティブアプリと同じ感覚で利用可能です。
                </p>
              </div>
            </div>

            {/* カード3: セキュリティ・情報漏洩対策（Stripe連携） */}
            <div className="bg-white dark:bg-[#1c1c1e] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xs space-y-2.5 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block">金融水準セキュリティ</span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    セキュリティ・情報漏洩対策（Stripe Connect連携・ゼロリスク設計）
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">① 金融機関水準の基盤</span>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Stripe Connect採用</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    世界基準の最高位セキュリティ（PCI-DSS レベル1）に準拠した決済・本人確認基盤を採用。
                  </p>
                </div>

                <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">② 情報漏洩ゼロリスク設計</span>
                  <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200">自社サーバーに重要情報を保持しない</h4>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    免許証や銀行口座情報は自社サーバー・自社DBには一切保存せず、すべてStripe側で直接管理・照合。万が一のサイバー攻撃時にも「そもそも盗まれる重要情報が存在しない」構造です。
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">③ 現在の稼働ステータス</span>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">テスト運用・最終調整段階</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    事前与信（仮売上オーソリ）および施術完了後の自動即時決済フローのテスト運用・最終調整を進行中。
                  </p>
                </div>
              </div>
            </div>

            {/* カード4: 施術者の信頼性担保フロー（5段階チェック） */}
            <div className="bg-white dark:bg-[#1c1c1e] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xs space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block">クオリティ＆安全性</span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    施術者の信頼性担保フロー（5段階チェック）
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-1">
                <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200/60 dark:border-white/10 text-center space-y-1">
                  <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-black text-[10px] inline-flex items-center justify-center">1</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">審査手数料</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">初期は無料枠を検討</p>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200/60 dark:border-white/10 text-center space-y-1">
                  <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-black text-[10px] inline-flex items-center justify-center">2</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">電子誓約書</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">直契約禁止・コンプラ遵守</p>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200/60 dark:border-white/10 text-center space-y-1">
                  <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-black text-[10px] inline-flex items-center justify-center">3</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Stripe本人確認</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">顔写真照合＋口座名義照合</p>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200/60 dark:border-white/10 text-center space-y-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] inline-flex items-center justify-center">4</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">国家／認定資格証</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">PT/OT/柔整/鍼灸等</p>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200/60 dark:border-white/10 text-center space-y-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] inline-flex items-center justify-center">5</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">個人賠償保険証書</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">損害保険加入の義務付け</p>
                </div>
              </div>

              {/* 自動削除のセキュリティ注記 */}
              <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-start gap-2 text-xs text-emerald-900 dark:text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <span className="font-black">※ ④国家資格証・⑤損害保険証書ファイルの自動破棄保護:</span> 証明書ファイルは運営確認完了と同時にストレージから自動削除（テキストの承認ログのみ保持し、漏洩リスクを完全遮断する先進アーキテクチャを採用）。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 第2章: 会長への相談・決裁事項（確認したいポイント） */}
        {/* ======================================================== */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
                2
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  会長への相談・決裁事項（確認したいポイント）
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  事業立ち上げにあたり、ご判断・ご意見をいただきたい6つの重要論点
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
              全6項目
            </span>
          </div>

          {/* 相談・決裁事項カードリスト */}
          <div className="space-y-3.5">
            {/* ① 施術者の初期登録料 */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-white/10 shadow-xs space-y-3 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    ①
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    施術者の初期登録料
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 shrink-0">
                  供給数拡大
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">検討案・背景:</span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                    初期立ち上げ期はハードルを下げて登録者数を集めたいため<span className="font-black text-emerald-700 dark:text-emerald-400">「無料（0円）」</span>でスタートし、一定規模後に審査手数料（5,000円程度）を有料化する案。
                  </p>
                </div>

                <div className="bg-amber-50/70 dark:bg-amber-950/30 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-1">
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>会長への相談内容:</span>
                  </span>
                  <p className="text-amber-950 dark:text-amber-100 font-bold leading-relaxed">
                    初期起業時点は「無料」で一気に集める方針でよろしいでしょうか？あるいは初期から覚悟料として少額でもいただくべきでしょうか？
                  </p>
                </div>
              </div>
            </div>

            {/* ② 手数料率（プラットフォーム取り分） */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-white/10 shadow-xs space-y-3 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    ②
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    手数料率（プラットフォーム取り分）
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                  収益モデル
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">検討案・背景:</span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                    施術者が自由に価格設定を行い、予約成立時にプラットフォームが<span className="font-black text-emerald-700 dark:text-emerald-400">「20%」</span>を手数料として徴収するモデル。
                  </p>
                </div>

                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>会長への相談内容:</span>
                  </span>
                  <p className="text-emerald-950 dark:text-emerald-100 font-bold leading-relaxed">
                    手数料率は「20%」の設定で問題ないでしょうか？（※ 業界相場は20〜30%、Uber等のギグエコノミー標準は30%前後）
                  </p>
                </div>
              </div>
            </div>

            {/* ③ 収益受取口座の指定 */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-white/10 shadow-xs space-y-3 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    ③
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    収益受取口座の指定
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 shrink-0">
                  法人・税務
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">検討案・背景:</span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                    手数料（20%）を受け取るためのStripe連携メイン口座の指定。
                  </p>
                </div>

                <div className="bg-blue-50/70 dark:bg-blue-950/30 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-1">
                  <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>会長への相談内容:</span>
                  </span>
                  <p className="text-blue-950 dark:text-blue-100 font-bold leading-relaxed">
                    プラットフォーム側の売上受取口座は、どの法人（または口座）に紐付ける形にいたしますか？
                  </p>
                </div>
              </div>
            </div>

            {/* ④ 公開URL（ドメイン） */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-white/10 shadow-xs space-y-3 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    ④
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    公開URL（ドメイン）
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 shrink-0">
                  ブランド信用
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">検討案・背景:</span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                    信頼性を担保するため、既存のブランドドメイン傘下での公開を想定。
                  </p>
                </div>

                <div className="bg-indigo-50/70 dark:bg-indigo-950/30 p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>会長への相談内容:</span>
                  </span>
                  <p className="text-indigo-950 dark:text-indigo-100 font-bold leading-relaxed">
                    Webアプリの公開URLとして、「NEOFAMILY」関連のドメイン（サブドメイン等）を使用させていただいてよろしいでしょうか？
                  </p>
                </div>
              </div>
            </div>

            {/* ⑤ インフラ初期経費（Supabase等） */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-white/10 shadow-xs space-y-3 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    ⑤
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    インフラ初期経費（Supabase等）
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 shrink-0">
                  予算・経費
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">検討案・背景:</span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                    データベース・ユーザー管理にかかる月額費用（1プロジェクトあたり月額数十ドル/数千円程度）。
                  </p>
                </div>

                <div className="bg-purple-50/70 dark:bg-purple-950/30 p-3.5 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-1">
                  <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>会長への相談内容:</span>
                  </span>
                  <p className="text-purple-950 dark:text-purple-100 font-bold leading-relaxed">
                    このシステム維持にかかる実費経費は、どの枠（プロジェクト予算等）から計上・精算させていただけばよろしいでしょうか？
                  </p>
                </div>
              </div>
            </div>

            {/* ⑥ 事業賠償責任保険の加入時期 */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-white/10 shadow-xs space-y-3 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    ⑥
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    事業賠償責任保険の加入時期
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 shrink-0">
                  リスク管理
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">検討案・背景:</span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                    施術者個人の損害保険加入は必須。プラットフォーム（運営会社）全体としての施設・受託者賠償保険の要否。
                  </p>
                </div>

                <div className="bg-rose-50/70 dark:bg-rose-950/30 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-800 space-y-1">
                  <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>会長への相談内容:</span>
                  </span>
                  <p className="text-rose-950 dark:text-rose-100 font-bold leading-relaxed">
                    スタート時は個人の保険徹底で立ち上げ、本格稼働・規模拡大のタイミングで事業保険に加入する2段階の想定でよろしいでしょうか？
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

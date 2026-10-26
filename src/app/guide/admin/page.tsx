'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { AdminGuideNav } from './AdminGuideNav';
import {
  Crown,
  Presentation,
  Award,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
  FileText,
  Lock,
  Layers,
  Scale,
  Users,
  Coins,
} from 'lucide-react';

export default function AdminGuidePortalPage() {
  const { currentBrand } = useApp();

  const documents = [
    {
      id: 'agenda',
      title: '👑 会長事前相談・決裁アジェンダ',
      badge: '最重要・必読',
      badgeColor: 'bg-emerald-500 text-white animate-pulse',
      href: '/guide/admin/agenda',
      icon: Crown,
      iconColor: 'bg-emerald-500 text-white',
      accentBorder: 'border-emerald-500/40 hover:border-emerald-500',
      description:
        '決定事項（アプリ名、PWA最速リリース、Stripe Connectによるゼロリスク個人情報保護、5段階信頼フロー）のご報告と、会長への5大相談・決裁事項（初期無料・安定後会費制、売上口座、NEOFAMILYドメイン、インフラ経費、事業保険）。',
      highlights: [
        'LINE・メール用ワンクリック全文コピー機能つき',
        'Stripe連携による「漏洩リスク完全遮断」ゼロリスク設計',
        '5つの重要相談・決裁論点（一覧表形式）',
      ],
      ctaText: 'アジェンダ本文を開く',
      ctaClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    {
      id: 'pitch',
      title: '🎤 5分ピッチ構成案（400名・熱狂版）',
      badge: 'Keynoteスライド対応',
      badgeColor: 'bg-slate-900 dark:bg-white text-white dark:text-black',
      href: '/guide/admin/pitch',
      icon: Presentation,
      iconColor: 'bg-slate-900 text-white dark:bg-white dark:text-black',
      accentBorder: 'border-slate-200 dark:border-white/10 hover:border-slate-400',
      description:
        '熱量の高い経営者・リーダー・施術者約400名を巻き込む抜本的リニューアル版ピッチ。「プロフェッショナルの解放」を掲げ、大義とビジネスモデルを5分で語り尽くすストーリーライン。',
      highlights: [
        'プロジェクター大画面投影モード（キーボード操作対応）',
        '5分登壇タイマー ＆ スライド別Keynote推奨フォントサイズ',
        'Googleフォーム連携 創業者パートナー登録機能',
      ],
      ctaText: 'ピッチスライド・登壇原稿を開く',
      ctaClass: 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black dark:hover:bg-slate-100',
    },
    {
      id: 'proposal',
      title: '専門職拡大構想・事業戦略提案書',
      badge: '経営戦略',
      badgeColor: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300',
      href: '/guide/admin/proposal',
      icon: Award,
      iconColor: 'bg-amber-500 text-white',
      accentBorder: 'border-slate-200 dark:border-white/10 hover:border-amber-400',
      description:
        '理学療法士・作業療法士・助産師などの国家資格保持者と、認定美容・健康指導プロを束ねる、全国規模のオンデマンド・ヘルスケアインフラへの事業飛躍構想と多職種シナジー戦略。',
      highlights: [
        '医療国家資格者による高単価・高リピート化モデル',
        '「理学療法×管理栄養士」「助産師×骨盤ケア」多職種連携LTV最大化',
        '厳格な資格審査とコンプライアンス管理',
      ],
      ctaText: '事業戦略提案書を開く',
      ctaClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    {
      id: 'operations',
      title: '統括実務運用マニュアル',
      badge: '日常オペレーション',
      badgeColor: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300',
      href: '/guide/admin/operations',
      icon: ShieldCheck,
      iconColor: 'bg-purple-600 text-white',
      accentBorder: 'border-slate-200 dark:border-white/10 hover:border-purple-400',
      description:
        '管理コンソール（/admin）を用いた日常のセラピスト資格審査、手数料率（Take Rate）設定、全予約ステータス監視・事前与信・強制返金、ブランドロゴ設定の実務手順書。',
      highlights: [
        'セラピスト資格・身元審査フローの実務手順',
        'スライダー操作によるプラットフォーム手数料率変更',
        '管理コンソール（/admin）直結リンク',
      ],
      ctaText: '実務運用マニュアルを開く',
      ctaClass: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
  ];

  return (
    <div className="space-y-8 pb-16 text-slate-800 dark:text-slate-200">
      {/* 4ページ共通ナビゲーション */}
      <AdminGuideNav />

      {/* エグゼクティブ・ポータルヘッダー */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 relative overflow-hidden print-avoid-break">
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/40 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Executive & Governance Documentation</span>
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug font-serif">
            {currentBrand.japaneseName} ({currentBrand.name})<br />
            役員・経営陣向け ドキュメントハブ
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-3xl leading-relaxed">
            プロジェクト推進に必要な4つの独立した経営・実務ドキュメントです。各ドキュメントは個別の専用URLを持ち、役員・会長への事前相談、登壇ピッチ、事業戦略、実務運用にそれぞれ最適化されています。
          </p>
        </div>
      </div>

      {/* 4つの独立ドキュメントカードグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {documents.map((doc, idx) => {
          const Icon = doc.icon;
          return (
            <div
              key={doc.id}
              className={`bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 border ${doc.accentBorder} shadow-xs hover:shadow-xl transition-all flex flex-col justify-between space-y-4 group`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className={`w-10 h-10 rounded-2xl ${doc.iconColor} flex items-center justify-center font-black shadow-xs shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-full shadow-2xs ${doc.badgeColor}`}>
                    {doc.badge}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
                    DOCUMENT 0{idx + 1}
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {doc.title}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {doc.description}
                </p>

                <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/10 space-y-1.5 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    主な構成内容
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {doc.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✔</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={doc.href}
                  className={`w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-95 ${doc.ctaClass}`}
                >
                  <span>{doc.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Clock,
  Mic,
  Copy,
  Check,
  Play,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  Users,
  HeartHandshake,
  TrendingUp,
  Sparkles,
  Scissors,
  Stethoscope,
  Building2,
  ArrowRight,
  Presentation,
  Footprints,
} from 'lucide-react';

// =====================================================================
// スライドデータ定義（超コンパクト・画像完全準拠）
// =====================================================================
interface PitchSlideData {
  id: number;
  title: string;
  subTitle: string;
  timeRange: string;
  layoutName: string;
  keynoteFontSizes: string;
  punchlines: string[];
  coreMessage: string;
  slideBulleted: string[];
  speakerPoints: string[];
}

const presentationSlides: PitchSlideData[] = [
  {
    id: 1,
    title: 'プロフェッショナルの解放。',
    subTitle: '医療・美・健康の常識を覆す「プロフェッショナル連合軍」構想',
    timeRange: '00:00 〜 00:30 (30秒)',
    layoutName: 'オープニング・宣言型（大塚 和宏 / yaShine）',
    keynoteFontSizes: '見出し: 64〜76pt / 登壇者名: 28〜34pt / バナー: 24〜30pt',
    punchlines: ['#プロフェッショナルの解放', '#yaShine', '#CareKuru', '#プロフェッショナル連合軍'],
    coreMessage: '医療・美・健康の常識を覆す「プロフェッショナル連合軍」構想',
    slideBulleted: [
      '【登壇者】大塚 和宏 / yaShine',
      '【メインテーマ】プロフェッショナルの解放。',
      '【構想】医療・美・健康の常識を覆す「プロフェッショナル連合軍」構想',
    ],
    speakerPoints: [
      '自己紹介は端的に力強く：「大塚和宏です。CareKuruを通じて理学療法士、エステ、整体、トレーナーすべてのプロを解放する話をしに来ました。」',
      '「医療・美・健康の分断を壊し、誰もが本物の技術で正当に報われる未来を全員で創りましょう！」',
    ],
  },
  {
    id: 2,
    title: '本物の技術を持つプロが報われないのか？',
    subTitle: '技術があっても、選ばれにくい業界構造の矛盾',
    timeRange: '00:30 〜 01:20 (50秒)',
    layoutName: '左右比較（医療職の現実 ⇄ サロン・整体の現実）',
    keynoteFontSizes: '見出し: 50〜60pt / カード項目: 22〜26pt / フッターピル: 24〜28pt',
    punchlines: ['#医療職の現実', '#サロン整体の現実', '#選ばれにくい', '#業界の矛盾'],
    coreMessage: '本物の技術があっても選ばれにくい。この理不尽な業界構造を変える。',
    slideBulleted: [
      '【医療職の現実】国家資格で超・安定／給料も安定／でもスキルを活かし切れない',
      '【サロン・整体の現実】技術があっても集客が難しい／無資格でも働ける／「誰を信じればいいか分からない」',
      '【結論】技術があっても、選ばれにくい',
    ],
    speakerPoints: [
      '「国家資格があっても組織の中でスキルを活かしきれない医療職。確かな技術があるのに安売り競争と信用の壁に苦しむサロン・整体職。」',
      '「どちらも本物なのに、顧客からは選ばれにくい。この理不尽な構造を放置していいはずがありません。」',
    ],
  },
  {
    id: 3,
    title: '「治す」医療 × 「癒やし・美」サロンが手を組む必然性',
    subTitle: '今、動くことで、未来の安定と自由が手に入る！',
    timeRange: '01:20 〜 02:20 (60秒)',
    layoutName: '3連携モデル（医療職の力 × サロンの魅力 ➔ プロの連合軍）',
    keynoteFontSizes: '見出し: 46〜56pt / 各ブロック: 24〜28pt / バナー: 24〜28pt',
    punchlines: ['#治す医療', '#癒やし美サロン', '#安心安全', '#最強チーム'],
    coreMessage: '「治す」医療と「癒やし・美」サロンが手を組み、最強のチームを作る。',
    slideBulleted: [
      '【医療職の力】安心・安全（治す力）',
      '【サロンの魅力】癒やし・美・健康（整える・魅せる力）',
      '【プロの連合軍】最強のチーム ➔ 今、動くことで、未来の安定と自由が手に入る！',
    ],
    speakerPoints: [
      '「医療の圧倒的な安心・安全と、サロンの癒やし・美・健康。この2つが分断されているから顧客は迷子になります。」',
      '「手を組むのは必然です。タッグを組むことで、未来の安定と自由を同時に手に入れましょう。」',
    ],
  },
  {
    id: 4,
    title: '今こそ、船に乗るべきなのか？【 3大実利 】',
    subTitle: 'Next Step ➔ 動く人が未来を創る',
    timeRange: '02:20 〜 03:20 (60秒)',
    layoutName: '3大実利グリッド（最高級の下駄 × 相互紹介 × 初期・月額0円）',
    keynoteFontSizes: '見出し: 48〜58pt / ナンバーカード: 24〜28pt / リボン: 24〜28pt',
    punchlines: ['#最高級の下駄を履く', '#顧客の相互紹介ループ', '#初期月額0円高還元', '#動く人が未来を創る'],
    coreMessage: '最高級の下駄、顧客の相互紹介、固定費0円高還元。動く人が未来を創る。',
    slideBulleted: [
      '①【最高級の下駄を履く】厳選されたプロとしての最高峰ステータス',
      '②【顧客の相互紹介ループ】奪い合わず、仲間同士で顧客を回し合う',
      '③【初期・月額0円 高還元】固定費リスクゼロ、高還元率で安心スタート',
      '【Next Step】動く人が未来を創る',
    ],
    speakerPoints: [
      '「実利は極めて明快です。最高級のブランドステータス、顧客の相互紹介ループ、そして初期・月額0円の高還元。」',
      '「リスクはありません。傍観者になるのではなく、今動く人が次の時代を創ります。」',
    ],
  },
  {
    id: 5,
    title: '会長と400人の仲間だから起こせる業界革命',
    subTitle: 'エリア管理や運営側に興味がある方は まずは「創業パートナー相談デスク」へ！',
    timeRange: '03:20 〜 04:15 (55秒)',
    layoutName: '2者共犯レイアウト（施術ができるプロ ⇄ 経営者・リーダーへ）',
    keynoteFontSizes: '見出し: 48〜58pt / カード本文: 22〜26pt / デスクピル: 20〜24pt',
    punchlines: ['#会長と400人の仲間', '#業界革命', '#施術ができるプロ', '#経営者リーダーへ'],
    coreMessage: '施術者も経営者も全員が主役。健康と美を守るインフラを共に創る。',
    slideBulleted: [
      '【施術ができるプロ】健康的に長生き／美しくあり続ける',
      '【経営者・リーダーへ】ご自身・ご家族、そして大切な社員の健康と美を守る',
      '【アクション】エリア管理や運営側に興味がある方は、まずは「創業パートナー相談デスク」へ！',
    ],
    speakerPoints: [
      '「この規模とスピードは、会長と400人の仲間が集まった今だからこそ実現できます。」',
      '「施術者は腕一本で自立し、経営者は社員の健康と美を守る福利厚生として使う。全員に役割があります。」',
    ],
  },
  {
    id: 6,
    title: '最初の乗組員として、業界の常識をひっくり返そう！',
    subTitle: '一緒に未来を創りましょう！',
    timeRange: '04:15 〜 05:00 (45秒)',
    layoutName: 'CTA・先行登録クロージング（健康×成長 ＋ QRコード ＋ 出航）',
    keynoteFontSizes: '見出し: 46〜56pt / バッジ: 24〜28pt / QR案内: 22〜26pt',
    punchlines: ['#最初の乗組員', '#常識をひっくり返そう', '#健康的に長生き', '#仲間と共に成長'],
    coreMessage: '最初の乗組員として、業界の常識をひっくり返そう！ 先行登録受付中。',
    slideBulleted: [
      '【ビジョン】健康的に長生き × 仲間と共に成長',
      '【創業パートナー先行登録】★各地域・ジャンル限定枠（QRコード）',
      '【メッセージ】一緒に未来を創りましょう！',
    ],
    speakerPoints: [
      '「最初の乗組員として、この船に乗ってください。業界の常識を、一緒にひっくり返しましょう！」',
      '「QRコードから先行登録をお願いします。皆様と一緒に未来を創れることを楽しみにしています！」',
    ],
  },
];

// =====================================================================
// スライド画面コンポーネント（余白最小・文字特大・心地よいペールトーン）
// =====================================================================
function PitchSlideCanvas({
  slideId,
  isMini = false,
}: {
  slideId: number;
  isMini?: boolean;
}) {
  return (
    <div
      className={`w-full aspect-[4/3] rounded-2xl relative overflow-hidden select-none flex flex-col justify-between transition-all duration-300 font-sans shadow-sm border border-sky-100 ${
        isMini ? 'p-2 sm:p-4' : 'p-3 sm:p-6 md:p-7'
      }`}
      style={{
        background:
          'linear-gradient(180deg, #edf6f9 0%, #f7fafc 35%, #ffffff 70%, #fdfbf7 100%)',
      }}
    >
      {/* 柔らかな光のオーラ・アンビエント */}
      <div className="absolute -top-12 -left-12 w-72 h-72 bg-sky-200/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-12 w-72 h-72 bg-teal-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-1/4 w-96 h-48 bg-amber-100/25 rounded-full blur-3xl pointer-events-none" />

      {/* ------------------------------------------------------------- */}
      {/* スライド共通ヘッダー（余白圧縮・文字くっきり） */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-200/70 pb-1.5 sm:pb-2">
        <div className="flex items-center gap-2">
          {/* CareKuru アイコン */}
          <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs p-1">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="12" strokeLinecap="round">
              <path d="M 70 24 A 32 32 0 1 0 70 76" />
              <path d="M 44 48 L 70 28" />
              <path d="M 48 46 L 72 72" />
            </svg>
          </div>
          <span className="text-sm sm:text-lg md:text-xl font-black tracking-wide text-slate-900 font-sans">
            CareKuru
          </span>
        </div>
        <div className="text-xs sm:text-base md:text-lg font-mono font-bold text-slate-500 tracking-wider">
          {slideId}/6
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* スライド個別メインコンテンツ（余白削減・文字サイズ最大化） */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 my-auto py-1 sm:py-2 flex flex-col justify-center">
        {/* ======================= スライド 1/6 ======================= */}
        {slideId === 1 && (
          <div className="space-y-3 sm:space-y-6">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-3">
                <h2 className="text-2xl sm:text-5xl md:text-6xl font-black text-slate-900 font-serif leading-[1.15] tracking-tight">
                  プロフェッショナルの<br />
                  <span className="text-slate-950 font-black">解放。</span>
                </h2>
                <div className="text-sm sm:text-2xl md:text-3xl font-bold text-slate-800 font-serif tracking-wide pt-1">
                  大塚 和宏 <span className="text-slate-400 font-sans font-normal">/</span> yaShine
                </div>
              </div>

              {/* 美しく輝くダイヤモンド・クリスタル */}
              <div className="shrink-0 relative">
                <div className="w-24 h-24 sm:w-44 sm:h-44 md:w-52 md:h-52 relative flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                    <defs>
                      <linearGradient id="diaGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#bae6fd" />
                        <stop offset="30%" stopColor="#e0f2fe" />
                        <stop offset="60%" stopColor="#fed7aa" />
                        <stop offset="100%" stopColor="#f472b6" />
                      </linearGradient>
                      <linearGradient id="diaGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                    <polygon points="50,5 85,25 95,50 50,95 5,50 15,25" fill="url(#diaGrad1)" opacity="0.85" />
                    <polygon points="50,5 30,25 15,25" fill="#ffffff" opacity="0.7" />
                    <polygon points="50,5 70,25 85,25" fill="#ffffff" opacity="0.5" />
                    <polygon points="30,25 50,25 50,5" fill="#7dd3fc" opacity="0.6" />
                    <polygon points="50,25 70,25 50,5" fill="#bae6fd" opacity="0.6" />
                    <polygon points="15,25 5,50 30,50 30,25" fill="#38bdf8" opacity="0.5" />
                    <polygon points="85,25 95,50 70,50 70,25" fill="#ec4899" opacity="0.5" />
                    <polygon points="30,25 50,25 50,50 30,50" fill="url(#diaGrad2)" opacity="0.6" />
                    <polygon points="50,25 70,25 70,50 50,50" fill="#f43f5e" opacity="0.4" />
                    <polygon points="30,50 50,50 50,95" fill="#6366f1" opacity="0.7" />
                    <polygon points="50,50 70,50 50,95" fill="#db2777" opacity="0.7" />
                    <polygon points="5,50 30,50 50,95" fill="#0284c7" opacity="0.8" />
                    <polygon points="95,50 70,50 50,95" fill="#be185d" opacity="0.8" />
                  </svg>
                  <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
              </div>
            </div>

            {/* 下部リボン・バナー（文字特大化） */}
            <div className="pt-1 sm:pt-2">
              <div className="inline-block w-full px-4 sm:px-8 py-2.5 sm:py-4 rounded-2xl bg-white/95 border-2 border-amber-200/90 shadow-xs backdrop-blur-xs relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-100/50 via-sky-100/40 to-rose-100/50 pointer-events-none" />
                <div className="relative text-xs sm:text-xl md:text-2xl font-black text-slate-900 text-center font-serif tracking-wide leading-relaxed">
                  医療・美・健康の常識を覆す<br className="sm:hidden" />
                  <span className="text-slate-950 font-black">「プロフェッショナル連合軍」</span>構想
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= スライド 2/6 ======================= */}
        {slideId === 2 && (
          <div className="space-y-2 sm:space-y-4">
            <h2 className="text-xl sm:text-4xl md:text-5xl font-black text-slate-900 font-serif leading-tight">
              本物の技術を持つプロが<br />
              <span className="text-rose-600">報われないのか？</span>
            </h2>

            {/* 左右カード（文字特大・余白圧縮） */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-1">
              {/* 左: 医療職の現実 */}
              <div className="bg-white/95 rounded-2xl p-2.5 sm:p-5 border-2 border-rose-200 shadow-xs space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 border-b border-rose-100 pb-1.5 sm:pb-2">
                  <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Stethoscope className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </div>
                  <div className="font-black text-xs sm:text-xl md:text-2xl text-rose-600">
                    医療職の現実
                  </div>
                </div>
                <ul className="space-y-1 sm:space-y-2.5 text-[11px] sm:text-base md:text-lg text-slate-900 font-bold leading-snug">
                  <li className="flex items-start gap-1 sm:gap-2">
                    <span className="text-rose-500 font-black shrink-0">✔</span>
                    <span>国家資格で超・安定</span>
                  </li>
                  <li className="flex items-start gap-1 sm:gap-2">
                    <span className="text-rose-500 font-black shrink-0">✔</span>
                    <span>給料も安定</span>
                  </li>
                  <li className="flex items-start gap-1 sm:gap-2">
                    <span className="text-rose-500 font-black shrink-0">✔</span>
                    <span>でもスキルを活かし切れない</span>
                  </li>
                </ul>
              </div>

              {/* 右: サロン・整体の現実 */}
              <div className="bg-white/95 rounded-2xl p-2.5 sm:p-5 border-2 border-sky-200 shadow-xs space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 border-b border-sky-100 pb-1.5 sm:pb-2">
                  <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Scissors className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </div>
                  <div className="font-black text-xs sm:text-xl md:text-2xl text-sky-600">
                    サロン・整体の現実
                  </div>
                </div>
                <ul className="space-y-1 sm:space-y-2.5 text-[11px] sm:text-base md:text-lg text-slate-900 font-bold leading-snug">
                  <li className="flex items-start gap-1 sm:gap-2">
                    <span className="text-sky-500 font-black shrink-0">✔</span>
                    <span>技術があっても集客が難しい</span>
                  </li>
                  <li className="flex items-start gap-1 sm:gap-2">
                    <span className="text-sky-500 font-black shrink-0">✔</span>
                    <span>無資格でも働ける</span>
                  </li>
                  <li className="flex items-start gap-1 sm:gap-2">
                    <span className="text-sky-500 font-black shrink-0">✔</span>
                    <span>「誰を信じればいいか分からない」</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 下部ピル */}
            <div className="text-center pt-1">
              <div className="inline-flex items-center justify-center px-4 sm:px-8 py-1.5 sm:py-2.5 rounded-full bg-rose-50/95 border-2 border-rose-200 text-rose-600 font-black text-xs sm:text-lg md:text-xl shadow-xs">
                <span>技術があっても、選ばれにくい</span>
              </div>
            </div>
          </div>
        )}

        {/* ======================= スライド 3/6 ======================= */}
        {slideId === 3 && (
          <div className="space-y-2 sm:space-y-4">
            <h2 className="text-xl sm:text-4xl md:text-5xl font-black text-slate-900 font-serif leading-tight">
              <span className="text-sky-600">「治す」</span>医療 × <span className="text-rose-500">「癒やし・美」</span>サロンが<br />
              手を組む必然性
            </h2>

            {/* 3ブロック連携（カード拡大・文字特大） */}
            <div className="grid grid-cols-5 items-center gap-1 sm:gap-3 pt-1 text-center">
              {/* 1: 医療職の力 */}
              <div className="col-span-1 bg-white/95 rounded-2xl p-2 sm:p-4 md:p-5 border-2 border-rose-200 shadow-xs space-y-1 sm:space-y-2">
                <div className="w-8 h-8 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
                  <Building2 className="w-4 h-4 sm:w-8 sm:h-8" />
                </div>
                <div className="font-black text-xs sm:text-lg md:text-xl text-rose-600 leading-tight">
                  医療職の力
                </div>
                <div className="text-[10px] sm:text-sm md:text-base text-slate-700 font-bold">
                  安心・安全
                </div>
              </div>

              {/* × */}
              <div className="col-span-1 text-center font-black text-slate-400 text-base sm:text-3xl md:text-4xl">
                ✕
              </div>

              {/* 2: サロンの魅力 */}
              <div className="col-span-1 bg-white/95 rounded-2xl p-2 sm:p-4 md:p-5 border-2 border-sky-200 shadow-xs space-y-1 sm:space-y-2">
                <div className="w-8 h-8 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shadow-xs">
                  <Users className="w-4 h-4 sm:w-8 sm:h-8" />
                </div>
                <div className="font-black text-xs sm:text-lg md:text-xl text-sky-600 leading-tight">
                  サロンの魅力
                </div>
                <div className="text-[10px] sm:text-sm md:text-base text-slate-700 font-bold">
                  癒やし・美・健康
                </div>
              </div>

              {/* × */}
              <div className="col-span-1 text-center font-black text-slate-400 text-base sm:text-3xl md:text-4xl">
                ✕
              </div>

              {/* 3: プロの連合軍 */}
              <div className="col-span-1 bg-white/95 rounded-2xl p-2 sm:p-4 md:p-5 border-2 border-emerald-400 shadow-xs space-y-1 sm:space-y-2 ring-2 ring-emerald-400/30">
                <div className="w-8 h-8 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                  <HeartHandshake className="w-4 h-4 sm:w-8 sm:h-8" />
                </div>
                <div className="font-black text-xs sm:text-lg md:text-xl text-emerald-700 leading-tight">
                  プロの連合軍
                </div>
                <div className="text-[10px] sm:text-sm md:text-base text-emerald-800 font-black">
                  最強のチーム
                </div>
              </div>
            </div>

            {/* 下部バナー */}
            <div className="text-center pt-1">
              <div className="inline-flex items-center justify-center px-4 sm:px-8 py-2 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 border-2 border-rose-200/90 text-rose-600 font-black text-xs sm:text-lg md:text-2xl shadow-xs">
                <span>今、動くことで、未来の安定と自由が手に入る！</span>
              </div>
            </div>
          </div>
        )}

        {/* ======================= スライド 4/6 ======================= */}
        {slideId === 4 && (
          <div className="space-y-2 sm:space-y-4">
            <h2 className="text-xl sm:text-4xl md:text-5xl font-black text-slate-900 font-serif leading-tight">
              今こそ、船に乗るべきなのか？<br />
              <span className="text-slate-950">【 3大実利 】</span>
            </h2>

            {/* 3枚のカード（文字特大） */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1 text-center">
              {/* ① */}
              <div className="bg-white/95 rounded-2xl p-2.5 sm:p-5 border-2 border-rose-200 shadow-xs space-y-1 sm:space-y-2.5 relative">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-rose-500 text-white font-mono font-bold text-xs sm:text-base flex items-center justify-center mx-auto">
                  1
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-rose-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 sm:w-10 sm:h-10" />
                </div>
                <div className="font-black text-xs sm:text-lg md:text-2xl text-rose-600 leading-tight">
                  最高級の<br />下駄を履く
                </div>
              </div>

              {/* ② */}
              <div className="bg-white/95 rounded-2xl p-2.5 sm:p-5 border-2 border-sky-200 shadow-xs space-y-1 sm:space-y-2.5 relative">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-sky-500 text-white font-mono font-bold text-xs sm:text-base flex items-center justify-center mx-auto">
                  2
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-sky-500 flex items-center justify-center">
                  <Users className="w-6 h-6 sm:w-10 sm:h-10" />
                </div>
                <div className="font-black text-xs sm:text-lg md:text-2xl text-sky-600 leading-tight">
                  顧客の<br />相互紹介ループ
                </div>
              </div>

              {/* ③ */}
              <div className="bg-white/95 rounded-2xl p-2.5 sm:p-5 border-2 border-emerald-300 shadow-xs space-y-1 sm:space-y-2.5 relative">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-500 text-white font-mono font-bold text-xs sm:text-base flex items-center justify-center mx-auto">
                  3
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-emerald-600 flex items-center justify-center">
                  <span className="text-2xl sm:text-4xl md:text-5xl font-black font-sans">¥</span>
                </div>
                <div className="font-black text-xs sm:text-lg md:text-2xl text-emerald-700 leading-tight">
                  初期・月額0円<br />高還元
                </div>
              </div>
            </div>

            {/* 下部リボン Next Step */}
            <div className="text-center pt-1">
              <div className="inline-flex items-center justify-center gap-2 sm:gap-4 px-6 sm:px-10 py-2 sm:py-3 rounded-full bg-gradient-to-r from-amber-50 via-white to-amber-50 border-2 border-amber-300 text-slate-900 shadow-xs">
                <span className="font-serif italic font-bold text-amber-700 text-sm sm:text-xl md:text-2xl">
                  Next Step
                </span>
                <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600" />
                <span className="font-black text-xs sm:text-lg md:text-2xl text-slate-950">
                  動く人が未来を創る
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ======================= スライド 5/6 ======================= */}
        {slideId === 5 && (
          <div className="space-y-2 sm:space-y-4">
            <h2 className="text-xl sm:text-4xl md:text-5xl font-black text-slate-900 font-serif leading-tight">
              会長と400人の仲間だから<br />
              起こせる<span className="text-slate-950">業界革命</span>
            </h2>

            {/* 左右2枚のカード（文字特大） */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-1">
              {/* 左: 施術ができるプロ */}
              <div className="bg-white/95 rounded-2xl p-3 sm:p-6 border-2 border-rose-200 shadow-xs space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </div>
                  <div className="font-black text-xs sm:text-xl md:text-2xl text-rose-600">
                    施術ができるプロ
                  </div>
                </div>
                <div className="text-xs sm:text-lg md:text-xl font-bold text-slate-900 leading-relaxed pt-1">
                  健康的に長生き<br />
                  美しくあり続ける
                </div>
              </div>

              {/* 右: 経営者・リーダーへ */}
              <div className="bg-white/95 rounded-2xl p-3 sm:p-6 border-2 border-sky-200 shadow-xs space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Users className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </div>
                  <div className="font-black text-xs sm:text-xl md:text-2xl text-sky-600">
                    経営者・リーダーへ
                  </div>
                </div>
                <div className="text-xs sm:text-lg md:text-xl font-bold text-slate-900 leading-relaxed pt-1">
                  ご自身・ご家族、<br />
                  そして大切な社員の<br />
                  健康と美を守る
                </div>
              </div>
            </div>

            {/* 下部ピル: 創業パートナー相談デスク */}
            <div className="text-center pt-1">
              <div className="inline-flex items-center gap-2 px-4 sm:px-8 py-2 sm:py-3 rounded-full bg-rose-50/95 border-2 border-rose-200 text-rose-600 font-bold text-xs sm:text-base md:text-lg shadow-xs">
                {/* ヨットアイコン */}
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2L4 14h8V2zM14 6l6 8h-6V6zM3 16h18l-2 4H5l-2-4z" />
                </svg>
                <span>エリア管理や運営側に興味がある方は まずは「創業パートナー相談デスク」へ！</span>
              </div>
            </div>
          </div>
        )}

        {/* ======================= スライド 6/6 ======================= */}
        {slideId === 6 && (
          <div className="space-y-2 sm:space-y-4">
            <h2 className="text-xl sm:text-4xl md:text-5xl font-black text-slate-900 font-serif leading-tight">
              最初の乗組員として、<br />
              業界の常識を<span className="text-rose-600">ひっくり返そう！</span>
            </h2>

            {/* 2つのピル（文字拡大） */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="bg-white/95 rounded-2xl p-2.5 sm:p-4 border-2 border-rose-200 shadow-xs flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <Footprints className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div className="font-black text-xs sm:text-xl md:text-2xl text-slate-900 leading-tight">
                  健康的に<br />長生き
                </div>
              </div>

              <div className="bg-white/95 rounded-2xl p-2.5 sm:p-4 border-2 border-sky-200 shadow-xs flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div className="font-black text-xs sm:text-xl md:text-2xl text-slate-900 leading-tight">
                  仲間と共に<br />成長
                </div>
              </div>
            </div>

            {/* 下部エリア: 船と海 ＋ 先行登録QR */}
            <div className="bg-white/95 rounded-2xl p-3 sm:p-5 md:p-6 border-2 border-sky-100 shadow-xs relative overflow-hidden flex items-center justify-between gap-4">
              {/* 背景の爽やかな海とヨットのイラスト */}
              <div className="space-y-1 relative z-10">
                <div className="text-sm sm:text-2xl md:text-3xl font-black text-sky-950 font-serif leading-tight">
                  一緒に<br />
                  未来を創りましょう！
                </div>
                <div className="text-[10px] sm:text-sm md:text-base text-sky-800 font-bold">
                  CareKuru プロフェッショナル解放プロジェクト
                </div>
              </div>

              {/* 中央ヨットシルエット */}
              <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 bottom-0 w-32 h-24 opacity-80 pointer-events-none">
                <svg viewBox="0 0 100 80" className="w-full h-full">
                  <path d="M45 10 L45 55 L20 55 Z" fill="#38bdf8" opacity="0.7" />
                  <path d="M48 20 L48 55 L75 55 Z" fill="#0284c7" opacity="0.6" />
                  <path d="M15 58 L85 58 L75 70 L25 70 Z" fill="#0f172a" opacity="0.8" />
                  <path d="M0 72 Q 25 68, 50 72 T 100 72 L 100 80 L 0 80 Z" fill="#e0f2fe" opacity="0.8" />
                </svg>
              </div>

              {/* QRコード案内 */}
              <div className="relative z-10 flex items-center gap-2 sm:gap-4 shrink-0">
                <div className="text-right space-y-0.5">
                  <div className="font-black text-xs sm:text-base md:text-lg text-slate-950 leading-tight">
                    創業パートナー<br />先行登録
                  </div>
                  <div className="text-[9px] sm:text-xs md:text-sm text-emerald-800 font-black">
                    ★各地域・ジャンル限定枠
                  </div>
                </div>

                <a
                  href="#partner-registration"
                  className="block group cursor-pointer"
                  title="クリックしてページ下部の登録フォームへ移動"
                >
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=https%3A%2F%2Ftherapist.kotsuka-folio.workers.dev%2Fguide%2Fadmin%23partner-registration"
                    alt="創業パートナー先行登録QRコード"
                    className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl p-1 bg-white border border-slate-300 shadow-xs transition group-hover:scale-105"
                  />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* スライド共通フッター */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 flex items-center justify-between border-t border-slate-200/70 pt-1.5 sm:pt-2 text-[10px] sm:text-sm text-slate-600 font-sans font-medium">
        <span className="truncate max-w-[70%]">
          CareKuru ｜ 大塚 和宏 / yaShine ｜ プロフェッショナル連合軍構想
        </span>
        <span className="font-mono text-slate-500 shrink-0 font-bold">
          SLIDE {slideId} OF 6
        </span>
      </div>
    </div>
  );
}

// =====================================================================
// メインページコンポーネント
// =====================================================================
export default function PitchGuidePage() {
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isFullscreenMode, setIsFullscreenMode] = useState<boolean>(false);
  const [copiedSlide, setCopiedSlide] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCopyAll = () => {
    const text = presentationSlides
      .map(
        (s) =>
          `========================================\n【スライド ${s.id}/6】${s.title}\n時間目安: ${s.timeRange}\nKeynote推奨文字サイズ: ${s.keynoteFontSizes}\nパンチライン: ${s.punchlines.join(' ')}\n\n■ スライド投影テキスト:\n${s.slideBulleted.map((p) => `・${p}`).join('\n')}\n\n■ 登壇メモ・語るポイント:\n${s.speakerPoints.map((n) => `▶ ${n}`).join('\n')}\n`
      )
      .join('\n\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    }
  };

  const handleCopySingle = (slide: PitchSlideData) => {
    const text = `【スライド ${slide.id}/6】${slide.title}\n時間目安: ${slide.timeRange}\nKeynote推奨文字サイズ: ${slide.keynoteFontSizes}\nパンチライン: ${slide.punchlines.join(' ')}\n\n■ スライド投影テキスト:\n${slide.slideBulleted.map((p) => `・${p}`).join('\n')}\n\n■ 登壇メモ:\n${slide.speakerPoints.map((n) => `▶ ${n}`).join('\n')}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedSlide(slide.id);
      setTimeout(() => setCopiedSlide(null), 2000);
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isFullscreenMode) return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        setActiveSlideIndex((prev) => Math.min(prev + 1, presentationSlides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveSlideIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        setIsFullscreenMode(false);
      }
    },
    [isFullscreenMode]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const currentSlide = presentationSlides[activeSlideIndex];

  return (
    <div className="space-y-8 pb-16 text-slate-800">
      {/* ============================================================= */}
      {/* フルスクリーン・大画面スライドショーモーダル（心地よいテイスト） */}
      {/* ============================================================= */}
      {isFullscreenMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md text-slate-800 flex flex-col justify-between p-3 sm:p-6 animate-fadeIn select-none print:hidden">
          {/* 上部ツールバー */}
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5 text-white">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold rounded-full border border-emerald-500/30">
                SLIDE {currentSlide.id} / 6
              </span>
              <span className="text-xs text-slate-300 font-mono hidden sm:inline">
                推奨時間: {currentSlide.timeRange}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 font-mono text-xs">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 font-bold">{formatTimer(timerSeconds)}</span>
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="ml-1 text-[10px] text-slate-300 hover:text-white underline cursor-pointer"
                >
                  {isTimerRunning ? 'PAUSE' : 'START'}
                </button>
              </div>

              <button
                onClick={() => setIsFullscreenMode(false)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700 cursor-pointer"
                title="ESCキーでも終了できます"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 中央スライド表示（余白圧縮・大迫力） */}
          <div className="flex-1 flex items-center justify-center max-w-5xl mx-auto w-full my-2">
            <div className="w-full shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/10">
              <PitchSlideCanvas slideId={currentSlide.id} />
            </div>
          </div>

          {/* 下部ナビゲーション */}
          <div className="flex items-center justify-between border-t border-slate-700/60 pt-2.5 text-white">
            <button
              onClick={() => setActiveSlideIndex((prev) => Math.max(prev - 1, 0))}
              disabled={activeSlideIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>前へ (←キー)</span>
            </button>

            <div className="flex items-center gap-2">
              {presentationSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === activeSlideIndex ? 'w-8 bg-emerald-400' : 'w-2.5 bg-slate-700 hover:bg-slate-600'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setActiveSlideIndex((prev) => Math.min(prev + 1, presentationSlides.length - 1))}
              disabled={activeSlideIndex === presentationSlides.length - 1}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <span>次へ (スペース / →キー)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* ページヘッダー・サマリーカード（シンプルで心地よいトーン） */}
      {/* ============================================================= */}
      <div className="bg-gradient-to-br from-sky-50 via-white to-amber-50/50 rounded-3xl p-6 sm:p-10 shadow-xs border border-sky-100 relative overflow-hidden print-avoid-break">
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-200 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                CareKuru 5分ピッチデック
              </span>
              <span className="text-xs sm:text-sm text-slate-600 font-bold">
                登壇者: 大塚 和宏 / yaShine ｜ 全6スライド
              </span>
            </div>

            {/* 大画面スライドショー開始ボタン */}
            <button
              onClick={() => setIsFullscreenMode(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition flex items-center gap-2 cursor-pointer"
              title="全画面プロジェクター投影モードを開始します"
            >
              <Maximize2 className="w-4 h-4 text-emerald-400" />
              <span>大画面スライドショー開始 (投影モード)</span>
            </button>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug font-serif">
              プロフェッショナルの解放。<br />
              <span className="text-emerald-700 text-lg sm:text-2xl font-bold font-sans">
                医療・美・健康の常識を覆す「プロフェッショナル連合軍」構想
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              Instagramカルーセル投稿・Keynote発表に直結する、余白を削ぎ落として文字を最大限に大きくした超コンパクト版スライドです。
            </p>
          </div>

          {/* タイマー＆一括コピー */}
          <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 font-sans">
            <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-700 font-medium">
              <div>
                <span className="text-slate-400 block text-xs">持ち時間目安</span>
                <strong className="text-slate-900 font-bold flex items-center gap-1">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  5分00秒（アップテンポ）
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">スライド構成</span>
                <strong className="text-emerald-700 font-bold">全6スライド（大文字・高視認性）</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">アプリ名称</span>
                <strong className="text-slate-900 font-bold">CareKuru</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                <span className="text-xs text-slate-500 font-mono">タイマー:</span>
                <span className="text-sm font-mono font-bold text-emerald-700">{formatTimer(timerSeconds)}</span>
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  {isTimerRunning ? '一時停止' : 'スタート'}
                </button>
                {timerSeconds > 0 && (
                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(0);
                    }}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs transition cursor-pointer"
                  >
                    リセット
                  </button>
                )}
              </div>

              <button
                onClick={handleCopyAll}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                title="全スライドのテキストと登壇メモを一括コピー"
              >
                {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAll ? 'コピー完了！' : '全原稿を一括コピー'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* ストーリーライン・クイックナビ */}
      {/* ============================================================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <Presentation className="w-4 h-4 text-emerald-600" />
            <span>全6スライド ナビゲーション</span>
          </h3>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            宣言 ➔ 共通の敵 ➔ 手を組む必然性 ➔ 3大実利 ➔ 業界革命 ➔ 最初の乗組員
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {presentationSlides.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => {
                setActiveSlideIndex(idx);
                const el = document.getElementById(`slide-${s.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between text-left ${
                activeSlideIndex === idx
                  ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-400/30'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-emerald-700">{s.id}/6</span>
                  <span className="text-slate-400 font-mono text-[10px]">{s.timeRange.split(' ')[2]}</span>
                </div>
                <div className="text-xs font-bold text-slate-800 line-clamp-1">{s.title}</div>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-200/60">
                {s.timeRange.split(' ')[0]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================= */}
      {/* 各スライド詳細カード（迫力の大サイズ ＆ 登壇メモ） */}
      {/* ============================================================= */}
      <div className="space-y-10">
        {presentationSlides.map((slide, index) => (
          <div
            key={slide.id}
            id={`slide-${slide.id}`}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden print-avoid-break transition hover:shadow-md"
          >
            {/* スライドバー */}
            <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-white font-black text-xs font-mono">
                  {slide.id}/6
                </span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 font-serif">
                    {slide.title}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 font-sans">
                    <span className="text-emerald-700 font-mono flex items-center gap-1 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      {slide.timeRange}
                    </span>
                    <span>•</span>
                    <span>{slide.layoutName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveSlideIndex(index);
                    setIsFullscreenMode(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="このスライドからフルスクリーン投影"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>投影モード</span>
                </button>

                <button
                  onClick={() => handleCopySingle(slide)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-300 shadow-xs"
                  title="このスライドのテキストと登壇メモをコピー"
                >
                  {copiedSlide === slide.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">コピー済</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>原稿コピー</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-7 space-y-6">
              {/* スライド画面プレビュー（余白削減・大迫力） */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between text-xs font-bold text-slate-500 gap-2">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider text-slate-700">
                    <Presentation className="w-4 h-4 text-emerald-600" />
                    【スライド画面プレビュー（余白圧縮・文字特大版）】
                  </span>
                  <span className="bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-md text-[11px] font-mono">
                    Keynote推奨: {slide.keynoteFontSizes}
                  </span>
                </div>

                {/* プレビューコンポーネント（幅拡大） */}
                <div className="max-w-4xl mx-auto shadow-sm rounded-2xl overflow-hidden">
                  <PitchSlideCanvas slideId={slide.id} />
                </div>
              </div>

              {/* スライド投影要点 ＆ 登壇メモ */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
                {/* 左側: スライド投影テキスト（7カラム） */}
                <div className="lg:col-span-7 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>スライド投影内容（超コンパクト要点）</span>
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {slide.punchlines.map((kw, kwIdx) => (
                        <span
                          key={kwIdx}
                          className="text-[10px] bg-white border border-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded font-mono"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 bg-sky-50/70 rounded-xl border border-sky-200/60 text-xs text-sky-950 font-medium">
                    💡 <strong>コアメッセージ:</strong> {slide.coreMessage}
                  </div>

                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                    {slide.slideBulleted.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold shrink-0">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 右側: 登壇メモ・語るポイント（5カラム） */}
                <div className="lg:col-span-5 bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-2.5">
                  <h4 className="text-xs sm:text-sm font-black text-emerald-300 flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-emerald-400" />
                    <span>登壇メモ（語るキーポイント ＆ 熱量）</span>
                  </h4>
                  <div className="space-y-2 text-xs text-slate-200 leading-relaxed">
                    {slide.speakerPoints.map((note, nIdx) => (
                      <div key={nIdx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold shrink-0">▶</span>
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                    Keynote推奨: {slide.keynoteFontSizes}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

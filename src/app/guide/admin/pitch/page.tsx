'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useApp } from '@/context/AppContext';
import { AdminGuideNav } from '../AdminGuideNav';
import {
  ExternalLink,
  Info,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Activity,
  Sparkles,
  Printer,
  ChevronRight,
  ChevronLeft,
  Building,
  Target,
  Award,
  Layers,
  Sliders,
  Compass,
  CreditCard,
  Presentation,
  Clock,
  Mic,
  Copy,
  Check,
  Play,
  QrCode,
  Smartphone,
  Type,
  Maximize2,
  Minimize2,
  FlameKindling,
  Users,
  HeartHandshake,
  TrendingUp,
  X,
  Send,
  BadgeCheck,
  Lock,
} from 'lucide-react';

export default function PitchGuidePage() {
  const { currentBrand } = useApp();
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

  const presentationSlides = [
    {
      id: 1,
      title: 'プロフェッショナルの解放。',
      subTitle: '医療・美・健康の常識を覆す「プロフェッショナル連合軍」構想',
      presenter: '大塚 和宏 / yaShine（理学療法士・元教員・現システムエンジニア）',
      timeRange: '00:00 〜 00:30 (30秒)',
      layoutName: 'オープニング・宣言型（大迫力タイトル ＆ ビジョン提示）',
      keynoteFontSizes: 'メイン見出し: 60〜72pt / 登壇者名: 28〜32pt / キャッチ: 24〜28pt',
      punchlines: [
        '#プロフェッショナルの解放',
        '#安売り競争の終焉',
        '#美と健康の連合軍',
        '#会長直下プロジェクト',
      ],
      coreMessage: '高度な専門技術を持つプロが、正当に評価され、自分の腕一本で誇り高く稼げる世界を創る。',
      slideBulleted: [
        '【登壇者】大塚 和宏 / yaShine（理学療法士・元教員・現システムエンジニア）',
        '【プロジェクト】「医療」「美」「健康」の分断を壊し、プロの価値を最大化する新インフラ',
        '【対象】理学療法士からエステ・整体・トレーナーまで、確かな腕を持つすべての仲間たち',
      ],
      speakerPoints: [
        '自己紹介は短く強烈に。「理学療法士で元教員、今はエンジニアの大塚です」。',
        '「今日はシステムの取扱説明書を話に来たのではありません。皆さんの腕と技術が正当に報われ、誇らしく稼げる未来を創る話をしに来ました！」と熱く宣言。',
      ],
    },
    {
      id: 2,
      title: 'なぜ、本物の技術を持つプロが報われないのか？',
      subTitle: '保険点数の壁 × 安売りクーポン競争のジレンマ',
      presenter: '大塚 和宏 / yaShine',
      timeRange: '00:30 〜 01:20 (50秒)',
      layoutName: '左右2カラム・共通の敵（医療職の壁 ⇄ サロン・整体の壁）',
      keynoteFontSizes: 'スライド見出し: 48〜54pt / カード見出し: 26〜30pt / 本文: 20〜22pt',
      punchlines: [
        '#死ぬほど勉強したのに',
        '#月給20数万の頭打ち',
        '#クーポン荒らしで疲弊',
        '#この構造おかしくないですか？',
      ],
      coreMessage: 'プロが安売りさせられ、生活者は信頼できるプロに出会えない難民になっている。',
      slideBulleted: [
        '【医療職の現実】国家資格を取り、命と身体を支える超高度スキルがあるのに、保険点数の壁で給料は頭打ち。',
        '【サロン・整体の現実】確かな現場力があるのに、無資格もみほぐしと一括りにされ、ポータルのクーポン安売りに巻き込まれる。',
        '【生活者の悲劇】病院リハを断られた人、どこへ行けば本物のプロに会えるか分からない人が地域に溢れている。',
      ],
      speakerPoints: [
        '会場の理学療法士・施術者に目を合わせ、「おかしくないですか？」と共感を呼び起こす。',
        '「プロが疲弊し、怪しい民間療法が儲かり、顧客が迷子になっている。この業界の理不尽を今こそ終わらせたい」と訴えかける。',
      ],
    },
    {
      id: 3,
      title: '「治す」医療 ×「癒やし・美」サロンが手を組む必然性',
      subTitle: '健康と美のグラデーション ｜ 人生100年時代を美しく健康に生ききるために',
      presenter: '大塚 和宏 / yaShine',
      timeRange: '01:20 〜 02:20 (60秒)',
      layoutName: '3カラム・チームヘルスケア連携図（医療の限界 ⇄ 美容の現場力 ➔ 連合軍結成）',
      keynoteFontSizes: 'スライド見出し: 48〜54pt / カラム見出し: 24〜28pt / 本文: 18〜20pt',
      punchlines: [
        '#健康と美のグラデーション',
        '#治すだけじゃ幸せになれない',
        '#医療の壁を壊す',
        '#身体のプロフェッショナル連合軍',
      ],
      coreMessage: '「治す（医療）」と「整える・美しくする（美容）」が統合して初めて、一人の人生を一生涯支えられる。',
      slideBulleted: [
        '【医療職の限界】痛みは取れる。でも日常の疲れを癒やし、肌を綺麗にし、美しいボディを作るのはエステ・整体の専門分野。',
        '【サロンのジレンマ】美と活力を届ける素晴らしい現場力があるが、重い病気のリスクや「国家資格がない信頼の壁」がある。',
        '【必然の答え】だからこそ手を組む！ PTが作ったアプリに呼ぶのではない。医療と美の壁を壊す「プロ連合軍」の結成！',
      ],
      speakerPoints: [
        'ここが一番重要！「PT発祥だけど、エステや整体の皆さんの力が絶対に不可欠なんです」とリスペクトを込めて語る。',
        '「痛みを取る医療と、美と活力をつくるサロンがタッグを組んで初めて、顧客の健康寿命をまるごと背負える」という大義を示す。',
      ],
    },
    {
      id: 4,
      title: 'なぜ、今この船に乗るべきなのか？【3大実利】',
      subTitle: '安売りからの完全脱却 × 最高峰の信頼ステータス',
      presenter: '大塚 和宏 / yaShine',
      timeRange: '02:20 〜 03:20 (60秒)',
      layoutName: '3大インセンティブ・グリッド（最高級の下駄 × 相互送客 × スマホ完結高還元）',
      keynoteFontSizes: 'スライド見出し: 48〜54pt / メリット見出し: 26〜30pt / 説明: 18〜20pt',
      punchlines: [
        '#最高級の下駄を履く',
        '#クーポン荒らしからの脱却',
        '#顧客の相互紹介ループ',
        '#初期月額0円で高還元',
      ],
      coreMessage: '奪い合うのではなく、仲間で顧客を回し合い、適正価格で勝負できる最高峰のブランド力を手に入れる。',
      slideBulleted: [
        '①【最高級の下駄を履ける】厳格な資格・身元審査を通った証。クーポン安売りから抜け出し、適正価格で選ばれるステータス。',
        '②【顧客の相互紹介ループ】痛みが引いた患者をエステ・ピラティスへ。重い痛みを抱える客をPTへ。お互いに客を回し合う。',
        '③【初期・月額 0 円 ＆ 高還元】店舗・固定費ゼロ。事前カード決済で未回収・ドタキャンリスクも完全ゼロ。',
      ],
      speakerPoints: [
        '「ホットペッパーの値下げ競争はもう終わりにしましょう！」と力強く切り込む。',
        '「医療職の患者がエステに来て、エステのお客様の身体の悩みをPTがバックアップする。これが仲間同士の最強のエコシステムです」。',
      ],
    },
    {
      id: 5,
      title: '会長と400人の仲間だから起こせる業界革命',
      subTitle: 'これは僕一人のアプリではない。全員で創る次世代インフラ',
      presenter: '大塚 和宏 / yaShine',
      timeRange: '03:20 〜 04:15 (55秒)',
      layoutName: '左右共犯者レイアウト（施術者への呼びかけ ⇄ 経営者・リーダーへの呼びかけ）',
      keynoteFontSizes: 'スライド見出し: 48〜54pt / ターゲット見出し: 26〜30pt / 本文: 20〜22pt',
      punchlines: [
        '#会長の心意気による事業化',
        '#400人の仲間が共犯者',
        '#社員の健康と美を守るインフラ',
        '#創業パートナー枠は限定',
      ],
      coreMessage: '会長の想いと400人の情熱があるからこそ成立する。施術する人も、しない人も、全員に役割がある。',
      slideBulleted: [
        '【施術ができるプロへ】自分の腕一本で新しい収入の柱を作ってください。誇りと正当な報酬をその手に。',
        '【施術をしない経営者・リーダーへ】ご自身・ご家族、そして大切な社員の健康と美を守るインフラとして使い倒してください！',
        '【限定枠の告知】各地域・各ジャンルで「初期シードパートナー（創業認定枠）」の席を限定。早い者勝ちです。',
      ],
      speakerPoints: [
        '会場全体（施術者＋経営者・リーダー）を巻き込む！「施術をしない経営者の皆さん、社員の健康を守る福利厚生として使ってください！」。',
        '「地元のライバルに枠を取られる前に、今すぐこの船に乗ってください！」と適度な焦燥感と熱気を作る。',
      ],
    },
    {
      id: 6,
      title: '最初の乗組員として、業界の常識をひっくり返そう！',
      subTitle: '健康的に長生きし、美しくあり続ける。みんなが望む未来を、ここから創る',
      presenter: '大塚 和宏 / yaShine',
      timeRange: '04:15 〜 05:00 (45秒)',
      layoutName: 'CTA・クロージング（先行登録QR ＋ 創業相談デスク案内 ＋ 力強い決断）',
      keynoteFontSizes: 'メイン見出し: 50〜60pt / サブ見出し: 26〜30pt / ボタン・QR: 22〜26pt',
      punchlines: [
        '#最初の乗組員になれ',
        '#先行登録所要3分',
        '#完全無料・リスクゼロ',
        '#歴史を一緒に創ろう',
      ],
      coreMessage: '今日、この400人の熱気から、日本の美と健康の新しい常識が始まります。',
      slideBulleted: [
        '【スマホで今すぐ先行登録】登録所要3分 ｜ 初期費用・月額利用料 完全 0 円',
        '【創業パートナー相談デスク】「地域のマネジメントや運営側に回りたい」方は終了後デスクへ直行！',
        '【未来への約束】誰かの健康と美を支え、自分たちも誇り高く豊かになる。一緒に新しい時代を創りましょう！',
      ],
      speakerPoints: [
        '最高潮のテンションで会場全体を見渡し、熱い握手を求めるように語りかける。',
        '「ご清聴ありがとうございました！ 創業パートナーとして、皆さんと一緒に船を出せることを楽しみにしています！」と深々とお辞儀。',
      ],
    },
  ];


  const handleCopyAll = () => {
    const text = presentationSlides
      .map(
        (s) =>
          `========================================\n【スライド ${s.id}】${s.title}\n時間目安: ${s.timeRange}\nサブタイトル: ${s.subTitle}\nKeynote推奨文字サイズ: ${s.keynoteFontSizes}\nパンチライン: ${s.punchlines.join(' ')}\n\n■ スライド投影テキスト:\n${s.slideBulleted.map((p) => `・${p}`).join('\n')}\n\n■ 登壇メモ・語るポイント:\n${s.speakerPoints.map((n) => `▶ ${n}`).join('\n')}\n`
      )
      .join('\n\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    }
  };


  const handleCopySingle = (slide: typeof presentationSlides[0]) => {
    const text = `【スライド ${slide.id}】${slide.title}\n時間目安: ${slide.timeRange}\nサブタイトル: ${slide.subTitle}\nKeynote推奨文字サイズ: ${slide.keynoteFontSizes}\nパンチライン: ${slide.punchlines.join(' ')}\n\n■ スライド投影テキスト:\n${slide.slideBulleted.map((p) => `・${p}`).join('\n')}\n\n■ 登壇メモ:\n${slide.speakerPoints.map((n) => `▶ ${n}`).join('\n')}`;
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
    [isFullscreenMode, presentationSlides.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const currentSlide = presentationSlides[activeSlideIndex];

  return (
    <div className="space-y-6 pb-16 text-slate-800 dark:text-slate-200">
      <AdminGuideNav currentTab="pitch" />

      {/* フルスクリーンモーダル */}
      {isFullscreenMode && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 animate-fadeIn select-none print:hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold rounded-full border border-emerald-500/40">
                SLIDE {currentSlide.id} / {presentationSlides.length}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                推奨時間: {currentSlide.timeRange}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 font-mono text-xs">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 font-bold">{formatTimer(timerSeconds)}</span>
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="ml-1 text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  {isTimerRunning ? 'PAUSE' : 'START'}
                </button>
              </div>

              <button
                onClick={() => setIsFullscreenMode(false)}
                className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-800 cursor-pointer"
                title="ESCキーでも終了できます"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full my-8 space-y-8">
            <div className="space-y-3">
              <span className="text-emerald-400 text-sm sm:text-base font-bold font-serif tracking-wider">
                {currentSlide.subTitle}
              </span>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight font-serif">
                {currentSlide.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-4">
                <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-emerald-400" />
                  Key Message
                </span>
                <div className="space-y-3">
                  {currentSlide.punchlines.map((p, idx) => (
                    <p key={idx} className="text-xl sm:text-2xl font-bold text-slate-100 leading-snug border-l-4 border-emerald-500 pl-4">
                      {p}
                    </p>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 space-y-3">
                <span className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Visual Points
                </span>
                <ul className="space-y-2 text-sm text-slate-300">
                  {currentSlide.slideBulleted.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">・</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <button
              onClick={() => setActiveSlideIndex((prev) => Math.max(prev - 1, 0))}
              disabled={activeSlideIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition flex items-center gap-1.5 border border-slate-800 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>前へ (←キー)</span>
            </button>

            <div className="flex items-center gap-2">
              {presentationSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === activeSlideIndex ? 'w-8 bg-emerald-400' : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setActiveSlideIndex((prev) => Math.min(prev + 1, presentationSlides.length - 1))}
              disabled={activeSlideIndex === presentationSlides.length - 1}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <span>次へ (スペース / →キー)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-10">
          {/* プレゼン・サマリーカード */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-700 relative overflow-hidden print-avoid-break">
            <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5 font-mono">
                    <FlameKindling className="w-3.5 h-3.5 text-amber-400" />
                    High-Impact Pitch Deck
                  </span>
                  <span className="text-xs sm:text-sm text-slate-300 font-bold font-serif">
                    登壇者: 大塚 和宏 / yaShine ｜ 対象: 熱量の高い経営者・リーダー・施術者 約400名
                  </span>
                </div>

                {/* ★ フルスクリーンスライドショー起動ボタン */}
                <button
                  onClick={() => setIsFullscreenMode(true)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-emerald-950/40 transition flex items-center gap-2 cursor-pointer border border-emerald-400/30"
                  title="全画面プロジェクター投影モードを開始します"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>大画面スライドショー開始 (投影モード)</span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug font-serif">
                プロフェッショナルの解放。<br />
                <span className="text-emerald-400 text-xl sm:text-2xl font-bold font-sans">
                  医療・美・健康の常識を覆す「プロフェッショナル連合軍」構想
                </span>
              </h1>

              {/* 400人を巻き込む「3つのピース」の宣言 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs font-sans">
                <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-1">
                  <strong className="text-amber-300 font-bold block flex items-center gap-1.5">
                    <span>1. 共通の敵（業界の理不尽）</span>
                  </strong>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    死ぬほど勉強した国家資格者が保険点数で安売りされ、街の無資格が儲かり、生活者が迷子になっている矛盾を打破。
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-1">
                  <strong className="text-teal-300 font-bold block flex items-center gap-1.5">
                    <span>2. 大義（健康と美のグラデーション）</span>
                  </strong>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    「治す医療」と「癒やす・美しくするサロン」がタッグを組んで初めて、顧客の健康寿命を一生涯支えられる。
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-1">
                  <strong className="text-emerald-300 font-bold block flex items-center gap-1.5">
                    <span>3. 会長と400人を共犯者に</span>
                  </strong>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    施術者は新しい高収入の柱を作り、経営者は社員を守るインフラとして使い倒す。全員が主役の業界革命。
                  </p>
                </div>
              </div>

              {/* タイマーツール ＆ 原稿一括コピー */}
              <div className="pt-3 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-4 font-sans">
                <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-300 font-medium">
                  <div>
                    <span className="text-slate-400 block text-xs">発表持ち時間</span>
                    <strong className="text-white font-bold flex items-center gap-1">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      5分00秒（アップテンポ）
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">スライド構成</span>
                    <strong className="text-emerald-400 font-bold">全6スライド（厳選・大迫力）</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">デザイン</span>
                    <strong className="text-white font-bold font-serif">Keynoteセージグラデーション × 明朝体</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl">
                    <span className="text-xs text-slate-400 font-mono">タイマー:</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">{formatTimer(timerSeconds)}</span>
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
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition cursor-pointer"
                      >
                        リセット
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleCopyAll}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                    title="全スライドのテキストと登壇メモを一括コピー"
                  >
                    {copiedAll ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedAll ? 'コピー完了！' : '全スライドを一括コピー'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ストーリーライン・クイックナビ */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 font-serif">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <span>5分間の熱狂ストーリーライン（全6スライド）</span>
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                問いかけ ➔ 共通の敵 ➔ 連合軍の大義 ➔ 3大実利 ➔ 共犯者へ ➔ 決断
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 font-serif">
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
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold font-sans">
                      <span className="text-emerald-700">SLIDE {s.id}</span>
                      <span className="text-slate-400 font-mono">{s.timeRange.split(' ')[2]}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">{s.title}</div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono font-sans mt-2 pt-1 border-t border-slate-200/60">
                    {s.timeRange.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 各スライド詳細カード */}
          <div className="space-y-12">
            {presentationSlides.map((slide, index) => (
              <div
                key={slide.id}
                id={`slide-${slide.id}`}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden print-avoid-break transition hover:shadow-md"
              >
                {/* スライドヘッダー */}
                <div className="p-4 sm:px-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm tracking-wider font-mono">
                      SLIDE {slide.id}
                    </span>
                    <div>
                      <h3 className="font-black text-sm sm:text-base text-white font-serif">{slide.title}</h3>
                      <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5 font-sans">
                        <span className="text-emerald-400 font-mono flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {slide.timeRange}
                        </span>
                        <span>•</span>
                        <span className="text-slate-300">形式: {slide.layoutName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveSlideIndex(index);
                        setIsFullscreenMode(true);
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer font-sans"
                      title="このスライドからフルスクリーン投影"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>投影モード</span>
                    </button>

                    <button
                      onClick={() => handleCopySingle(slide)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700 font-sans"
                      title="このスライドのテキストと登壇メモをコピー"
                    >
                      {copiedSlide === slide.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">コピー済</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>原稿コピー</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* スライド画面プレビュー（Keynoteセージグラデーション × 明朝体） */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between text-xs font-bold text-slate-500 gap-2 font-sans">
                      <span className="flex items-center gap-1.5 uppercase tracking-wider text-slate-700 font-serif">
                        <Presentation className="w-4 h-4 text-emerald-600" />
                        【Keynote 16:9 スライド画面プレビュー（推奨レイアウト ＆ 文字階層）】
                      </span>
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md text-[11px] font-mono">
                        Keynote推奨: {slide.keynoteFontSizes}
                      </span>
                    </div>

                    <div
                      className="w-full aspect-[16/9] max-h-[480px] rounded-2xl p-6 sm:p-10 flex flex-col justify-between shadow-md relative overflow-hidden select-none border border-slate-300 font-serif"
                      style={{
                        background: 'linear-gradient(135deg, #879798 0%, #9cb0af 28%, #c58d81 68%, #b27b72 82%, #798086 100%)',
                      }}
                    >
                      <div className="absolute top-1/4 right-1/6 w-[450px] h-[300px] bg-[#c78b7e]/45 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-10 left-1/4 w-[400px] h-[250px] bg-[#a2b4b3]/40 rounded-full blur-3xl pointer-events-none" />

                      {/* スライド内ヘッダー */}
                      <div className="relative z-10 flex items-center justify-between border-b border-slate-700/20 pb-2 text-slate-800 font-sans">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-md overflow-hidden shrink-0 shadow-xs"
                            dangerouslySetInnerHTML={{ __html: currentBrand.iconSvg }}
                          />
                          <span className="text-xs sm:text-sm font-bold tracking-wider text-slate-800 font-serif">
                            {currentBrand.japaneseName}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono tracking-widest font-bold">
                          SLIDE {slide.id} / 06
                        </div>
                      </div>

                      {/* スライド内メイン */}
                      <div className="relative z-10 my-auto py-2">
                        {slide.id === 1 && (
                          <div className="space-y-4 max-w-2xl text-left py-4">
                            <div className="space-y-2">
                              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-wide leading-tight drop-shadow-xs">
                                プロフェッショナルの解放。
                              </h2>
                              <p className="text-base sm:text-xl text-slate-800 font-normal tracking-wide">
                                大塚 和宏 / yaShine
                              </p>
                            </div>
                            <div className="pt-2">
                              <span className="inline-block px-3.5 py-1.5 rounded-xl bg-white/80 backdrop-blur-md text-slate-900 text-xs sm:text-base font-sans font-medium border border-white/60 shadow-xs">
                                医療・美・健康の常識を覆す「プロフェッショナル連合軍」構想
                              </span>
                            </div>
                          </div>
                        )}

                        {slide.id === 2 && (
                          <div className="space-y-3">
                            <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-wide drop-shadow-xs">
                              なぜ、本物の技術を持つプロが報われないのか？
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                              <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-4 space-y-2 shadow-xs">
                                <div className="text-rose-900 text-xs sm:text-sm font-black">
                                  【医療職の現実】保険点数の壁
                                </div>
                                <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed font-sans">
                                  国家資格を取り命や身体を支える超高度スキルがあるのに、保険点数に縛られて給料は頭打ち。病院の中でスキルを安売りさせられている。
                                </p>
                              </div>
                              <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-4 space-y-2 shadow-xs">
                                <div className="text-rose-900 text-xs sm:text-sm font-black">
                                  【サロン・整体の現実】安売りクーポン競争
                                </div>
                                <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed font-sans">
                                  確かな現場力があるのに、無資格もみほぐしと一括りにされポータルの値下げ競争で疲弊。顧客も「誰を信じればいいか分からない難民」に。
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {slide.id === 3 && (
                          <div className="space-y-3">
                            <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-wide drop-shadow-xs">
                              「治す」医療 ×「癒やし・美」サロンが手を組む必然性
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                              <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-3.5 space-y-1.5 shadow-xs">
                                <div className="text-slate-900 font-black text-xs sm:text-sm">① 医療職の限界</div>
                                <p className="text-[11px] text-slate-700 leading-snug font-sans">
                                  痛みは取れる。でも日々の疲れを癒やし、美肌やボディメイクを作るのはサロン・整体の専門分野。
                                </p>
                              </div>
                              <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-3.5 space-y-1.5 shadow-xs">
                                <div className="text-slate-900 font-black text-xs sm:text-sm">② サロンのジレンマ</div>
                                <p className="text-[11px] text-slate-700 leading-snug font-sans">
                                  美と活力を作る現場力があるが、病気リスクの不安や「国家資格がない信頼の壁」がある。
                                </p>
                              </div>
                              <div className="bg-white/85 backdrop-blur-md border-2 border-emerald-600 rounded-2xl p-3.5 space-y-1.5 shadow-xs">
                                <div className="text-emerald-900 font-black text-xs sm:text-sm">③ プロ連合軍の結成</div>
                                <p className="text-[11px] text-slate-700 leading-snug font-sans">
                                  「治す」と「整える・美しくする」が統合して初めて、一人の顧客の健康寿命を一生涯背負える！
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {slide.id === 4 && (
                          <div className="space-y-3">
                            <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-wide drop-shadow-xs">
                              なぜ、今この船に乗るべきなのか？【3大実利】
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                              <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-3.5 space-y-1.5 shadow-xs">
                                <h4 className="text-slate-900 font-black text-xs sm:text-sm">① 最高級の下駄を履く</h4>
                                <p className="text-[11px] text-slate-700 leading-snug font-sans">
                                  厳格審査を通った証。クーポン荒らしから抜け出し、適正価格で勝負できる最高峰のブランド力を獲得。
                                </p>
                              </div>
                              <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-3.5 space-y-1.5 shadow-xs">
                                <h4 className="text-slate-900 font-black text-xs sm:text-sm">② 顧客の相互紹介ループ</h4>
                                <p className="text-[11px] text-slate-700 leading-snug font-sans">
                                  痛みが引いた患者をエステ・ピラティスへ。重い痛みを抱える客をPTへ。奪い合わず仲間で回し合う。
                                </p>
                              </div>
                              <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-3.5 space-y-1.5 shadow-xs">
                                <h4 className="text-slate-900 font-black text-xs sm:text-sm">③ 初期・月額0円高還元</h4>
                                <p className="text-[11px] text-slate-700 leading-snug font-sans">
                                  店舗・固定費リスクゼロ。事前カード決済で未回収・ドタキャンリスクも完全ゼロ。
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {slide.id === 5 && (
                          <div className="space-y-3">
                            <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-wide drop-shadow-xs">
                              会長と400人の仲間だから起こせる業界革命
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                              <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-4 space-y-2 shadow-xs">
                                <div className="text-slate-900 font-black text-xs sm:text-sm">
                                  【施術ができるプロへ】
                                </div>
                                <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed font-sans">
                                  自分の腕一本で新しい収入の柱を作ってください。安売りはもう終わりです。誇りと正当な報酬をその手に。
                                </p>
                              </div>
                              <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-4 space-y-2 shadow-xs">
                                <div className="text-slate-900 font-black text-xs sm:text-sm">
                                  【経営者・リーダーへ】
                                </div>
                                <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed font-sans">
                                  ご自身・ご家族、そして大切な社員の健康と美を守る福利厚生インフラとして使い倒してください！
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {slide.id === 6 && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            <div className="sm:col-span-2 space-y-2 bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/60 shadow-xs">
                              <h3 className="text-base sm:text-2xl font-black text-slate-900 leading-tight">
                                最初の乗組員として、業界の常識をひっくり返そう！
                              </h3>
                              <p className="text-xs text-emerald-900 font-bold font-sans">
                                健康的に長生きし、美しくあり続ける。みんなが望む未来を、ここから創る。
                              </p>
                              <div className="text-[11px] text-slate-700 space-y-1 font-sans">
                                <div>• スマホで今すぐ先行登録（所要3分 ｜ 初期費用・掲載料 完全 0 円）</div>
                                <div>• <strong>★エリア管理や運営側に興味がある方は終了後に「創業パートナー相談デスク」へ！</strong></div>
                              </div>
                            </div>

                            <div className="bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl p-3.5 text-center space-y-1.5 shadow-xs">
                              <a
                                href="#partner-registration"
                                className="block group cursor-pointer"
                                title="クリックしてページ下部の登録フォームへ移動"
                              >
                                <img
                                  src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=https%3A%2F%2Ftherapist.kotsuka-folio.workers.dev%2Fguide%2Fadmin%23partner-registration"
                                  alt="創業パートナー先行登録QRコード"
                                  className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-xl p-1 bg-white border border-slate-300 shadow-sm transition group-hover:scale-105"
                                />
                              </a>
                              <div className="text-xs font-black text-slate-900">創業パートナー先行登録</div>
                              <div className="text-[9px] text-emerald-800 font-bold font-sans">★各地域・ジャンル限定枠</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* スライド内フッター */}
                      <div className="relative z-10 flex items-center justify-between border-t border-slate-700/20 pt-2 text-[10px] text-slate-800 font-serif">
                        <span>大塚 和宏 / yaShine ｜ {slide.punchlines.slice(0, 3).join(' ')}</span>
                        <span className="font-mono font-sans">{slide.timeRange}</span>
                      </div>
                    </div>
                  </div>

                  {/* スライド投影テキスト ＆ 登壇メモ（最小限・スッキリ） */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* 左側: スライド投影箇条書き（7カラム） */}
                    <div className="lg:col-span-7 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 font-serif">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <span>スライド投影内容（最小限の要点）</span>
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {slide.punchlines.map((kw, kwIdx) => (
                            <span key={kwIdx} className="text-[10px] bg-white border border-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded font-mono">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200/60 text-xs text-emerald-900 font-medium font-sans">
                        💡 <strong>コアメッセージ:</strong> {slide.coreMessage}
                      </div>

                      <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 font-sans">
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
                      <h4 className="text-xs sm:text-sm font-black text-emerald-300 flex items-center gap-1.5 font-serif">
                        <Mic className="w-4 h-4 text-emerald-400" />
                        <span>登壇メモ（語るキーポイント ＆ 熱量）</span>
                      </h4>
                      <div className="space-y-2 text-xs text-slate-200 font-sans leading-relaxed">
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

            {/* ========================================================
          パートナー・参画お問い合わせ（LINE連携窓口）
         ======================================================== */}
      <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-800 text-center space-y-4 font-sans">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
          <span>公式LINE 相談・登録窓口</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black font-serif text-white">
          パートナー参画・ご質問は公式LINEより受付中
        </h3>
        <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl mx-auto leading-relaxed">
          理学療法士・助産師・鍼灸・柔整・エステ・整体等の施術者様、および協業をご検討のリーダー・経営者様のご相談は、LINE公式アカウントにてダイレクトに個別対応いたします。
        </p>
        <div className="pt-2">
          <span className="inline-flex items-center gap-2 px-6 py-3 bg-[#06C755] hover:bg-[#05b34c] text-white text-sm font-black rounded-2xl shadow-lg transition active:scale-95 cursor-pointer">
            <span>LINE公式アカウントを開く</span>
          </span>
        </div>
      </div>
    </div>
  );
}

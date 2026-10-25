'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  ShieldAlert,
  Users,
  Calendar,
  Percent,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  HeartPulse,
  Activity,
  MessageSquare,
  Sparkles,
  Flame,
  Utensils,
  Baby,
  Eye,
  Smile,
  Hand,
  Flower2,
  Bone,
  Printer,
  ChevronRight,
  ChevronLeft,
  Building,
  Target,
  Award,
  Layers,
  ArrowUpRight,
  Sliders,
  LineChart,
  Network,
  Compass,
  History,
  Trash2,
  Lock,
  CreditCard,
  MapPin,
  Navigation,
  Presentation,
  Clock,
  Mic,
  Copy,
  Check,
  Play,
  QrCode,
  UserCheck,
  HeartHandshake,
  Smartphone,
  Send,
  HelpCircle,
  Type,
  Maximize2,
  Info,
  FlameKindling,
} from 'lucide-react';

export default function AdminGuidePage() {
  const { currentBrand } = useApp();
  const [activeView, setActiveView] = useState<'presentation' | 'proposal' | 'operations'>('presentation');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [copiedSlide, setCopiedSlide] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  // プレゼンタイマー
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

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // 5分プレゼン・アップテンポ全6スライド（大塚和宏 / yaShine 様 Keynoteスタイル準拠）
  const presentationSlides = [
    {
      id: 1,
      title: 'セラピストプラットフォームのご紹介',
      subTitle: '大塚 和宏 / yaShine',
      tagline: '理学療法士・元教員・現エンジニアが創る、プロの価値を解き放つ新インフラ',
      timeRange: '00:00 〜 00:30 (30秒)',
      layoutType: '表紙・オープニング（Keynoteセージグラデーション × 明朝体）',
      keynoteFontSizes: 'メインタイトル: 56〜64pt / 登壇者名: 28〜32pt / キャッチ: 22〜24pt',
      bigKeywords: ['#理学療法士', '#全施術者のプラットフォーム', '#価値に見合う報酬', '#自由な働き方'],
      slideHighlights: [
        '【登壇者】大塚 和宏 / yaShine（理学療法士・元教員・現システムエンジニア）',
        '【プロジェクト】施術者の価値を正当に届けるオンデマンド・プラットフォーム',
        '【対象】理学療法士から整体・鍼灸・エステまで、技術あるすべてのプロフェッショナル',
      ],
      speakerNotes: [
        '明るくテンション高めに自己紹介（理学療法士 ➔ 教員 ➔ SEという独自の歩み）。',
        '「今日は皆さんの専門技術の価値をもっと高め、自由に活躍できる場のお話です！」と元気よく宣言。',
      ],
      visualBadge: 'SLIDE 01 / INTRO',
    },
    {
      id: 2,
      title: 'なぜこのプラットフォームなのか？',
      subTitle: '医療・店舗の「枠」を超え、一生涯付き合える専門職に正当な対価と活躍の場を',
      tagline: '会長の心意気で事業化スタート！ 理学療法士から全施術者を束ねる一大基盤へ',
      timeRange: '00:30 〜 01:30 (60秒)',
      layoutType: '左右2分割・対比カード（現場のジレンマ ⇄ 会長の後押しと事業化構想）',
      keynoteFontSizes: 'スライド見出し: 46〜50pt / カードタイトル: 26〜28pt / 本文: 20〜22pt',
      bigKeywords: ['#診療報酬の制約を超える', '#真面目なプロに正当な対価', '#会長の心意気で事業化', '#一大プラットフォーム'],
      slideHighlights: [
        '【現場の想い】理学療法士・施術者は全国民に必要な仕事。人生の最後まで心身を支える専門職。',
        '【直面する壁】病院のリハビリは医療保険・診療報酬の制約があり、仕事の価値に見合う報酬が得られにくい。',
        '【地域の切実な声】病院でリハビリを断られた人、誰に頼めばいいか分からない人、自宅に来てほしい人。',
        '【プロジェクト始動】会長の心意気で事業化が決定！ PTにとどまらず、グループの全施術者を巻き込む一大プラットフォームへ。',
      ],
      speakerNotes: [
        '自らの原体験と、現場で頑張る施術者への熱いリスペクトを込めて語る。',
        '「会長の心意気で公式に事業化されたプロジェクトです！」とバックボーンの強さを堂々とアピール。',
      ],
      visualBadge: 'SLIDE 02 / WHY THIS PLATFORM',
    },
    {
      id: 3,
      title: 'このプラットフォームのメリットは何か？',
      subTitle: '空き時間×得意エリアで、あなたの専門技術を最大化する',
      tagline: '完全自由なシフト × スマホ1台完結 × 初期・月額 0 円の高還元',
      timeRange: '01:30 〜 02:30 (60秒)',
      layoutType: '3大メリット・グリッド（自由度 × 直感操作 × 高還元）',
      keynoteFontSizes: 'スライド見出し: 46〜50pt / メリット見出し: 26〜28pt / 説明文: 18〜20pt',
      bigKeywords: ['#自由度100%', '#スマホ1台完結', '#初期・月額0円', '#事前決済で未回収ゼロ'],
      slideHighlights: [
        '①【完全自由な働き方】出張エリア半径（km単位）・稼働日時・メニュー・料金を自分で設定（週1回でもOK）',
        '②【スマホ1台で完結】予約受付・事前問診・GPS出張ナビ・完了報告まで迷わずワンタップ',
        '③【初期・月額 0 円 ＆ 高還元】店舗・固定費リスクゼロ。事前カード決済でドタキャン・未回収ゼロ',
      ],
      speakerNotes: [
        'テンポよく「1つ目！2つ目！3つ目！」とリズミカルにメリットを畳み掛ける。',
        '「店舗の借金もノルマも一切なし。スマホ1台で今すぐスタートできます！」と強調。',
      ],
      visualBadge: 'SLIDE 03 / ADVANTAGES',
    },
    {
      id: 4,
      title: 'ここの施術者は、なぜ安心なのか？',
      subTitle: 'プロと利用者の双方を守る、妥協のない4重の安心設計',
      tagline: '資格審査・相互評価・事前決済・グループ本部のバックアップ体制',
      timeRange: '02:30 〜 03:30 (60秒)',
      layoutType: '4重のセーフティ・シールド配置（信頼と安全設計）',
      keynoteFontSizes: 'スライド見出し: 46〜50pt / バッジ見出し: 24〜26pt / 説明文: 18〜20pt',
      bigKeywords: ['#100%資格審査', '#事前カード与信', '#住所保護と相互評価', '#グループ本部の後ろ盾'],
      slideHighlights: [
        '🛡【厳格な資格・身元審査】免許証・資格証を事前確認。確かな腕と信頼を持つプロ集団を形成',
        '🛡【事前カード与信確保】施術直前の理不尽なキャンセル時も自動補償（集金トラブル皆無）',
        '🛡【相互評価 ＆ 住所保護】出張先住所は予約確定後のみ開示。悪質なユーザーはシステムが即排除',
        '🛡【グループ本部のバックアップ】（★）専任スタッフ・管理者が日常をサポート。万が一の仲裁窓口を完備',
      ],
      speakerNotes: [
        '出張や個人の活動で誰もが一番気になる「安全性」を先回りしてバシッと払拭。',
        '一部の管理者候補の方に向けて「運営スタッフが後ろ盾として守る」体制をアピール。',
      ],
      visualBadge: 'SLIDE 04 / TRUST & SAFETY',
    },
    {
      id: 5,
      title: '施術者として登録するためには？',
      subTitle: 'スマホでわずか3分。リスクゼロで新しい一歩を踏み出す',
      tagline: 'WEB登録 ➔ 資格確認 ➔ 稼働開始（ノルマ一切なし・休止も再開も自由）',
      timeRange: '03:30 〜 04:15 (45秒)',
      layoutType: '簡単3ステップ・フロー ＆ アクションカード',
      keynoteFontSizes: 'スライド見出し: 46〜50pt / ステップ数字: 32pt / ステップテキスト: 22〜24pt',
      bigKeywords: ['#登録所要3分', '#最短即日承認', '#ノルマ一切なし', '#今日から第一歩'],
      slideHighlights: [
        '【STEP 1】スマホから専用フォームで基本情報・保有資格を入力（所要3分）',
        '【STEP 2】運営事務局による資格確認＆パートナーアカウント発行（最短即日）',
        '【STEP 3】自分の空き時間・出張エリアを設定して、無理のないペースでスタート！',
        '★初期費用・月額利用料・解約金すべて 0 円。休止も再開もいつでも自由です',
      ],
      speakerNotes: [
        '「登録は驚くほど簡単です。今この場でもできます」と促す。',
        '「ノルマは一切ないので、まずは登録しておくだけでも選択肢が広がります！」と背中を押す。',
      ],
      visualBadge: 'SLIDE 05 / HOW TO JOIN',
    },
    {
      id: 6,
      title: 'あなたの専門技術を、待っている人がいます。',
      subTitle: '理学療法士・施術者の新しい時代を、一緒に創りましょう！',
      tagline: '無料先行パートナー登録受付中 ｜ エリア管理・運営参画の個別相談も実施',
      timeRange: '04:15 〜 05:00 (45秒)',
      layoutType: 'CTA・クロージング（QRコード枠 ＋ 登壇者メッセージ ＋ 相談案内）',
      keynoteFontSizes: 'メイン見出し: 46〜52pt / サブ見出し: 24〜28pt / ボタン・QR: 20〜24pt',
      bigKeywords: ['#待っている人がいる', '#新しい時代の主役', '#先行登録スタート', '#個別相談デスク'],
      slideHighlights: [
        '【地域の声】病院に行けない人、出張先で困っている人、あなたに来てほしい人がいます。',
        '【参加リスク 0】費用は完全無料。あなたの真面目で熱心な技術を、一番喜ばれる形でお届けしましょう。',
        '【相談デスク】「地域のマネジメントや管理運営側にも関わりたい」という方は終了後に受付デスクへ！',
      ],
      speakerNotes: [
        '熱気と笑顔で会場全体を包み込む。',
        '「皆さんの確かな腕を、地域が待っています。一緒に新しいステージへ進みましょう！」と締めくくる。',
      ],
      visualBadge: 'SLIDE 06 / CALL TO ACTION',
    },
  ];

  // 全スライドのテキストをクリップボードにコピー
  const handleCopyAll = () => {
    const text = presentationSlides
      .map(
        (s) =>
          `========================================\n【スライド ${s.id}】${s.title}\n時間目安: ${s.timeRange}\nKeynote推奨文字サイズ: ${s.keynoteFontSizes}\nキーワード: ${s.bigKeywords.join(' ')}\n\n■ スライド投影テキスト:\n${s.slideHighlights.map((p) => `・${p}`).join('\n')}\n\n■ 登壇メモ・発表ポイント:\n${s.speakerNotes.map((n) => `▶ ${n}`).join('\n')}\n`
      )
      .join('\n\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    }
  };

  // 単一スライドの原稿コピー
  const handleCopySingle = (slide: typeof presentationSlides[0]) => {
    const text = `【スライド ${slide.id}】${slide.title}\n時間目安: ${slide.timeRange}\nKeynote推奨文字サイズ: ${slide.keynoteFontSizes}\nキーワード: ${slide.bigKeywords.join(' ')}\n\n■ スライド投影テキスト:\n${slide.slideHighlights.map((p) => `・${p}`).join('\n')}\n\n■ 登壇メモ:\n${slide.speakerNotes.map((n) => `▶ ${n}`).join('\n')}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedSlide(slide.id);
      setTimeout(() => setCopiedSlide(null), 2000);
    }
  };

  return (
    <div className="space-y-8 pb-16 text-slate-800 text-sm sm:text-base leading-relaxed">
      {/* 画面トップ: 3本柱ビュー切り替えタブ & 上申用印刷ボタン */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          {/* タブ1: 5分プレゼン構成案 */}
          <button
            onClick={() => setActiveView('presentation')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 cursor-pointer ${
              activeView === 'presentation'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Presentation className="w-4 h-4 text-emerald-400" />
            <span>🎤 5分ピッチ構成案（400名対象）</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/30 text-emerald-300 font-bold">
              Keynote完成版
            </span>
          </button>

          {/* タブ2: 拡大構想・事業計画 */}
          <button
            onClick={() => setActiveView('proposal')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeView === 'proposal'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>専門職拡大構想・事業計画</span>
          </button>

          {/* タブ3: 統括実務運用マニュアル */}
          <button
            onClick={() => setActiveView('operations')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeView === 'operations'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>統括実務運用マニュアル</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-2xl transition cursor-pointer border border-slate-200"
            title="A4形式で印刷またはPDF保存できます"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>印刷 / PDF出力</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          VIEW 1: 5分プレゼンテーション構成案 (アップテンポ・Keynoteスタイル)
         ======================================================== */}
      {activeView === 'presentation' && (
        <div className="space-y-10">
          {/* プレゼン・サマリーカード */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-700 relative overflow-hidden print-avoid-break">
            <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5 font-mono">
                  <FlameKindling className="w-3.5 h-3.5 text-amber-400" />
                  5-Minute High-Energy Pitch Deck
                </span>
                <span className="text-xs sm:text-sm text-slate-300 font-bold font-serif">
                  登壇者: 大塚 和宏 / yaShine（理学療法士・元教員・現SE） ｜ 対象: 意欲的な施術者 約400名
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug font-serif">
                セラピストプラットフォームのご紹介<br />
                <span className="text-emerald-400 text-xl sm:text-2xl font-bold font-sans">
                  アップテンポ5分ピッチ全スライド設計 ＆ Keynoteレイアウト完成版
                </span>
              </h1>

              {/* プロジェクトの背景・意図ハイライト */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs sm:text-sm text-slate-200 font-sans">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>プロジェクトの原点とストーリー</span>
                </div>
                <p className="leading-relaxed text-slate-300">
                  理学療法士・施術者は全国民に必要な素晴らしい専門職。しかし保険診療報酬の枠の中ではその真の価値に見合う報酬が得られにくい。
                  そんな真面目で勉強熱心なプロに自由と正当な活躍の場を提供したい――その想いに共感した<strong>グループ会長の心意気で事業化が正式決定</strong>。
                  理学療法士から全施術者を巻き込む一大プラットフォームとして、病院でのリハビリ難民や外出困難な人々へ安心のケアをお届けします。
                </p>
              </div>

              {/* 仕様 KPI & タイマーツール */}
              <div className="pt-3 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-300 font-medium font-sans">
                  <div>
                    <span className="text-slate-400 block text-xs">発表時間</span>
                    <strong className="text-white font-bold flex items-center gap-1">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      5分ジャスト（アップテンポ設計）
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">スライド構成</span>
                    <strong className="text-emerald-400 font-bold">全6スライド（シンプル・厳選）</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">展開スタイル</span>
                    <strong className="text-white font-bold font-serif">なぜ ➔ メリット ➔ なぜ安心 ➔ 登録方法</strong>
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

          {/* タイムライン・ステップバー */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 font-serif">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <span>5分間のプレゼン展開（無駄を削ぎ落とした4大テーマ）</span>
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                テンポよく目立つ要点を伝える全6スライド
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 font-serif">
              {presentationSlides.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => setActiveSlideIndex(idx)}
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

          {/* 各スライドカード（Keynote実物プレビュー ＆ 最小限のテキスト ＆ 登壇ポイント） */}
          <div className="space-y-10">
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
                        <span className="text-slate-300">形式: {slide.layoutType.split('（')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-block text-[11px] font-mono text-emerald-300 bg-emerald-950/70 border border-emerald-800/80 px-2.5 py-1 rounded-lg font-sans">
                      {slide.keynoteFontSizes.split('/')[0]}
                    </span>

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
                  {/* スライドモックアップ本体: Keynoteスタイル（セージ〜テラコッタオーロラ × 明朝体） */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between text-xs font-bold text-slate-500 gap-2 font-sans">
                      <span className="flex items-center gap-1.5 uppercase tracking-wider text-slate-700 font-serif">
                        <Presentation className="w-4 h-4 text-emerald-600" />
                        【Keynote投影スライド画面（レイアウト ＆ 文字階層）】
                      </span>
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md text-[11px] font-mono">
                        {slide.keynoteFontSizes}
                      </span>
                    </div>

                    <div
                      className="w-full aspect-[16/9] max-h-[460px] rounded-2xl p-6 sm:p-10 flex flex-col justify-between shadow-md relative overflow-hidden select-none border border-slate-300 font-serif"
                      style={{
                        background: 'linear-gradient(135deg, #879798 0%, #9cb0af 28%, #c58d81 68%, #b27b72 82%, #798086 100%)',
                      }}
                    >
                      {/* 背景の柔らかな光・山並みグラデーション */}
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
                        <div className="text-[11px] text-slate-600 font-mono tracking-widest">
                          {slide.visualBadge}
                        </div>
                      </div>

                      {/* スライド内メインコンテンツ */}
                      <div className="relative z-10 my-auto py-2">
                        {/* スライド 1: 表紙（大塚和宏 / yaShine 様 添付テンプレートそのもの） */}
                        {slide.id === 1 && (
                          <div className="space-y-4 max-w-2xl text-left py-4">
                            <div className="space-y-2">
                              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-wide leading-tight drop-shadow-xs">
                                セラピストプラットフォームのご紹介
                              </h2>
                              <p className="text-base sm:text-xl text-slate-800 font-normal tracking-wide">
                                大塚 和宏 / yaShine
                              </p>
                            </div>

                            <div className="pt-2">
                              <span className="inline-block px-3.5 py-1.5 rounded-xl bg-white/75 backdrop-blur-md text-slate-800 text-xs sm:text-sm font-sans font-medium border border-white/60 shadow-xs">
                                理学療法士・元教員・現エンジニアが創る、プロの価値を解き放つ新インフラ
                              </span>
                            </div>
                          </div>
                        )}

                        {/* スライド 2: なぜこのプラットフォームなのか？ */}
                        {slide.id === 2 && (
                          <div className="space-y-3">
                            <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-wide text-center sm:text-left drop-shadow-xs">
                              なぜこのプラットフォームなのか？
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 items-stretch">
                              <div className="bg-white/75 backdrop-blur-md border border-white/60 rounded-2xl p-4 space-y-2 shadow-xs">
                                <div className="text-rose-900 text-xs sm:text-sm font-black">
                                  【現場のジレンマと地域の声】
                                </div>
                                <ul className="text-[11px] sm:text-xs text-slate-700 space-y-1.5 leading-relaxed font-sans">
                                  <li>• 病院のリハビリは医療保険・診療報酬の制約が大きい</li>
                                  <li>• 勉強熱心なプロの価値に見合う対価が得られにくい</li>
                                  <li>• 病院でリハを断られた人、来てほしい人が地域に溢れている</li>
                                </ul>
                              </div>

                              <div className="bg-white/80 backdrop-blur-md border border-emerald-600/30 rounded-2xl p-4 space-y-2 shadow-xs">
                                <div className="text-emerald-900 text-xs sm:text-sm font-black">
                                  【会長の心意気による事業化】
                                </div>
                                <ul className="text-[11px] sm:text-xs text-slate-700 space-y-1.5 leading-relaxed font-sans">
                                  <li>• <strong>グループ会長の心意気で事業化が正式決定！</strong></li>
                                  <li>• PTだけでなく、グループの全施術者を巻き込む一大基盤へ</li>
                                  <li>• スマホ1台で、あなたの得意な地域へ直接価値を届ける</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* スライド 3: このプラットフォームのメリットは何か？ */}
                        {slide.id === 3 && (
                          <div className="space-y-3">
                            <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-wide text-center sm:text-left drop-shadow-xs">
                              このプラットフォームのメリットは何か？
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                              <div className="bg-white/75 backdrop-blur-md border border-white/60 rounded-2xl p-3.5 space-y-1.5 text-center sm:text-left shadow-xs">
                                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black mx-auto sm:mx-0">
                                  <Compass className="w-4 h-4" />
                                </div>
                                <h4 className="text-xs sm:text-sm font-black text-slate-900">① 自由度100%</h4>
                                <p className="text-[11px] text-slate-700 leading-snug font-sans">
                                  出張エリア半径（km指定）や稼働日時、料金メニューを自分で自由に設定。
                                </p>
                              </div>

                              <div className="bg-white/75 backdrop-blur-md border border-white/60 rounded-2xl p-3.5 space-y-1.5 text-center sm:text-left shadow-xs">
                                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-black mx-auto sm:mx-0">
                                  <Smartphone className="w-4 h-4" />
                                </div>
                                <h4 className="text-xs sm:text-sm font-black text-slate-900">② スマホ1台完結</h4>
                                <p className="text-[11px] text-slate-700 leading-snug font-sans">
                                  予約受付・事前カルテ・GPS出張ナビ・完了報告まで迷わずワンタップ。
                                </p>
                              </div>

                              <div className="bg-white/75 backdrop-blur-md border border-white/60 rounded-2xl p-3.5 space-y-1.5 text-center sm:text-left shadow-xs">
                                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black mx-auto sm:mx-0">
                                  <CreditCard className="w-4 h-4" />
                                </div>
                                <h4 className="text-xs sm:text-sm font-black text-slate-900">③ 初期・月額 0 円</h4>
                                <p className="text-[11px] text-slate-700 leading-snug font-sans">
                                  店舗リスクなし。事前カード決済でドタキャン・未回収リスクも完全ゼロ。
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* スライド 4: ここの施術者はなぜ安心なのか？ */}
                        {slide.id === 4 && (
                          <div className="space-y-3">
                            <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-wide text-center sm:text-left drop-shadow-xs">
                              ここの施術者は、なぜ安心なのか？
                            </h3>
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                              <div className="bg-white/75 backdrop-blur-md border border-white/60 rounded-xl p-2.5 sm:p-3 flex items-start gap-2 shadow-xs">
                                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 shrink-0 mt-0.5" />
                                <div>
                                  <h5 className="text-[11px] sm:text-xs font-black text-slate-900">100% 資格・身元審査</h5>
                                  <p className="text-[9px] sm:text-[10px] text-slate-600 mt-0.5 leading-snug font-sans">
                                    免許証・資格証を事前確認。確かなプロ集団のブランドを死守。
                                  </p>
                                </div>
                              </div>

                              <div className="bg-white/75 backdrop-blur-md border border-white/60 rounded-xl p-2.5 sm:p-3 flex items-start gap-2 shadow-xs">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700 shrink-0 mt-0.5" />
                                <div>
                                  <h5 className="text-[11px] sm:text-xs font-black text-slate-900">相互評価 ＆ 住所保護</h5>
                                  <p className="text-[9px] sm:text-[10px] text-slate-600 mt-0.5 leading-snug font-sans">
                                    悪質客は即時排除。出張先住所は予約確定後のみ開示で安全。
                                  </p>
                                </div>
                              </div>

                              <div className="bg-white/75 backdrop-blur-md border border-white/60 rounded-xl p-2.5 sm:p-3 flex items-start gap-2 shadow-xs">
                                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 shrink-0 mt-0.5" />
                                <div>
                                  <h5 className="text-[11px] sm:text-xs font-black text-slate-900">事前与信・自動補償</h5>
                                  <p className="text-[9px] sm:text-[10px] text-slate-600 mt-0.5 leading-snug font-sans">
                                    未払いトラブル皆無。無断キャンセル時もキャンセル料を自動回収。
                                  </p>
                                </div>
                              </div>

                              <div className="bg-white/75 backdrop-blur-md border border-white/60 rounded-xl p-2.5 sm:p-3 flex items-start gap-2 shadow-xs">
                                <Building className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800 shrink-0 mt-0.5" />
                                <div>
                                  <h5 className="text-[11px] sm:text-xs font-black text-slate-900">グループ運営の後ろ盾</h5>
                                  <p className="text-[9px] sm:text-[10px] text-slate-600 mt-0.5 leading-snug font-sans">
                                    本部の管理スタッフが日常をバックアップ。万が一の仲裁窓口を完備。
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* スライド 5: 施術者として登録するためには？ */}
                        {slide.id === 5 && (
                          <div className="space-y-3">
                            <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-wide text-center sm:text-left drop-shadow-xs">
                              施術者として登録するためには？
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                              <div className="bg-white/75 backdrop-blur-md border border-white/60 rounded-2xl p-3.5 space-y-1.5 shadow-xs">
                                <span className="text-xs font-black text-slate-900 bg-emerald-100 px-2 py-0.5 rounded-md inline-block font-sans">
                                  STEP 1
                                </span>
                                <h4 className="text-xs sm:text-sm font-black text-slate-900">WEB簡単入力 (3分)</h4>
                                <p className="text-[11px] text-slate-600 leading-snug font-sans">
                                  スマホから基本情報と保有資格（PT・柔整・鍼灸・エステ等）を入力。
                                </p>
                              </div>

                              <div className="bg-white/75 backdrop-blur-md border border-white/60 rounded-2xl p-3.5 space-y-1.5 shadow-xs">
                                <span className="text-xs font-black text-slate-900 bg-teal-100 px-2 py-0.5 rounded-md inline-block font-sans">
                                  STEP 2
                                </span>
                                <h4 className="text-xs sm:text-sm font-black text-slate-900">資格審査＆承認</h4>
                                <p className="text-[11px] text-slate-600 leading-snug font-sans">
                                  運営事務局が資格証を確認し、パートナーアカウントを発行（最短即日）。
                                </p>
                              </div>

                              <div className="bg-white/75 backdrop-blur-md border border-white/60 rounded-2xl p-3.5 space-y-1.5 shadow-xs">
                                <span className="text-xs font-black text-slate-900 bg-amber-100 px-2 py-0.5 rounded-md inline-block font-sans">
                                  STEP 3
                                </span>
                                <h4 className="text-xs sm:text-sm font-black text-slate-900">空き時間でスタート</h4>
                                <p className="text-[11px] text-slate-600 leading-snug font-sans">
                                  受付可能日時とエリアを設定して完了。ノルマなし、休止も自由。
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* スライド 6: クロージング・アクション */}
                        {slide.id === 6 && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                            <div className="sm:col-span-2 space-y-2 bg-white/75 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-xs">
                              <h3 className="text-base sm:text-xl font-black text-slate-900 leading-tight">
                                あなたの専門技術を、待っている人がいます。
                              </h3>
                              <p className="text-xs text-emerald-800 font-bold font-sans">
                                一緒に、新しいケアの時代を創りましょう！
                              </p>
                              <div className="text-[11px] text-slate-700 space-y-1 font-sans">
                                <div>• 病院に行けない人、出張先で困っている人、あなたを待っている人が地域にいます。</div>
                                <div>• 登録・掲載は完全無料。リスクゼロで新しい一歩を。</div>
                                <div>• <strong>★エリア管理・運営参画に関心のある方は終了後に個別相談デスクへ！</strong></div>
                              </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-3.5 text-center space-y-1.5 shadow-xs">
                              <QrCode className="w-14 h-14 sm:w-16 sm:h-16 text-slate-800 mx-auto" />
                              <div className="text-[11px] font-black text-slate-900">先行パートナー登録</div>
                              <div className="text-[9px] text-emerald-800 font-bold font-sans">★管理側参画の個別相談も受付</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* スライド内フッター */}
                      <div className="relative z-10 flex items-center justify-between border-t border-slate-700/20 pt-2 text-[10px] text-slate-700 font-serif">
                        <span>大塚 和宏 / yaShine ｜ Author and Date</span>
                        <span className="font-mono font-sans">{slide.timeRange}</span>
                      </div>
                    </div>
                  </div>

                  {/* スライド投影テキスト ＆ 登壇メモ（最小限・スッキリ） */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* 左側: スライド投影箇条書き（8カラム） */}
                    <div className="lg:col-span-7 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 font-serif">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <span>スライド投影内容（最小限の要点）</span>
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {slide.bigKeywords.map((kw, kwIdx) => (
                            <span key={kwIdx} className="text-[10px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                        {slide.slideHighlights.map((point, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 右側: 登壇メモ・語るポイント（5カラム） */}
                    <div className="lg:col-span-5 bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-2">
                      <h4 className="text-xs sm:text-sm font-black text-emerald-300 flex items-center gap-1.5 font-serif">
                        <Mic className="w-4 h-4 text-emerald-400" />
                        <span>登壇メモ（語るキーポイント）</span>
                      </h4>
                      <div className="space-y-1.5 text-xs text-slate-300 font-sans leading-relaxed">
                        {slide.speakerNotes.map((note, nIdx) => (
                          <div key={nIdx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold shrink-0">▶</span>
                            <span>{note}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                        Keynote推奨: {slide.keynoteFontSizes}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          VIEW 2: 経営上申・事業戦略提案書 (Proposal View)
         ======================================================== */}
      {activeView === 'proposal' && (
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 relative overflow-hidden print-avoid-break">
            <div className="relative z-10 space-y-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30">
                Business Strategy Proposal
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug font-serif">
                {currentBrand.japaneseName} ({currentBrand.name})<br />
                ヘルスケア＆ウェルネス専門職パートナー拡大構想
              </h1>
              <p className="text-sm sm:text-base text-emerald-100/90 max-w-3xl leading-relaxed">
                理学療法士・作業療法士・助産師などの国家資格保持者と、認定美容・健康指導プロを束ねる、全国規模のオンデマンド・ヘルスケアインフラへの事業飛躍構想です。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">1. 医療国家資格者による高単価・高リピート化</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                医療保険のリハビリ期限切れ患者や産後母子など、切実なペインを直接解決し強固な基盤を形成します。
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">2. 厳格な資格審査とコンプライアンス</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                全パートナーの免許証を本部で事前審査。安心と信頼のブランド価値を死守します。
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">3. 多職種シナジーとLTVの最大化</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                「理学療法×管理栄養士」「助産師×骨盤ケア」など、包括的なヘルスケア基盤を構築します。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          VIEW 3: 統括実務運用マニュアル (Operations View)
         ======================================================== */}
      {activeView === 'operations' && (
        <div className="space-y-8">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5 font-serif">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <span>プラットフォーム統括 実務運用マニュアル</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              管理コンソール（/admin）を用いた日常の審査・監視・設定業務の手順です。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
              <h3 className="text-base font-bold text-slate-900">1. セラピスト資格・身元審査フロー</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                免許証・本人確認書類を確認し、問題がなければ「承認」をONにして公開します。
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
              <h3 className="text-base font-bold text-slate-900">2. 手数料率（Take Rate）設定</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                スライダー操作（5%〜40%）でプラットフォーム利用料率を即時変更可能です。
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
              <h3 className="text-base font-bold text-slate-900">3. 全予約監視・事前与信・強制返金</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                全予約ステータスを監視。トラブル時は管理者権限で即時全額返金キャンセルを実行できます。
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
              <h3 className="text-base font-bold text-slate-900">4. ブランド・ロゴ設定の独立管理</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                アプリ名称、ヘッダーロゴ、ファビコンを管理画面から即時切り替え可能です。
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-100 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <div>
              <h4 className="font-bold text-slate-900 text-base font-serif">実務コンソールへアクセス</h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                管理コンソールから各種審査・監視業務を行えます。
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
      )}
    </div>
  );
}

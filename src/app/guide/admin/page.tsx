'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
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
} from 'lucide-react';

export default function AdminGuidePage() {
  const { currentBrand } = useApp();
  const [activeView, setActiveView] = useState<'presentation' | 'proposal' | 'operations'>('presentation');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isFullscreenMode, setIsFullscreenMode] = useState<boolean>(false);
  const [copiedSlide, setCopiedSlide] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  // 創業パートナー登録フォーム用ステート
  const [formState, setFormState] = useState({
    name: '',
    qualification: '理学療法士 (PT)',
    customQualification: '',
    email: '',
    phone: '',
    motivation: '',
    question: '',
    wantManagement: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [showGoogleGuide, setShowGoogleGuide] = useState(false);
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);

  // localStorageから保存データをロード
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('carearia_partner_registrations');
        if (saved) {
          setRegistrations(JSON.parse(saved));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const newEntry = {
        id: Date.now(),
        name: formState.name,
        qualification: formState.qualification === 'その他' && formState.customQualification ? formState.customQualification : formState.qualification,
        email: formState.email,
        phone: formState.phone,
        motivation: formState.motivation,
        question: formState.question,
        wantManagement: formState.wantManagement,
        submittedAt: new Date().toLocaleString('ja-JP'),
      };
      const updated = [newEntry, ...registrations];
      setRegistrations(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('carearia_partner_registrations', JSON.stringify(updated));
      }
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleCopyQuestionItem = (text: string, index: number) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedQuestionIndex(index);
      setTimeout(() => setCopiedQuestionIndex(null), 2000);
    }
  };

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

  // 全6スライド（抜本的リニューアル: 熱量MAX・ビジョンと大義のストーリーライン）
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

  // 全スライドのテキストをクリップボードにコピー
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

  // 単一スライドの原稿コピー
  const handleCopySingle = (slide: typeof presentationSlides[0]) => {
    const text = `【スライド ${slide.id}】${slide.title}\n時間目安: ${slide.timeRange}\nサブタイトル: ${slide.subTitle}\nKeynote推奨文字サイズ: ${slide.keynoteFontSizes}\nパンチライン: ${slide.punchlines.join(' ')}\n\n■ スライド投影テキスト:\n${slide.slideBulleted.map((p) => `・${p}`).join('\n')}\n\n■ 登壇メモ:\n${slide.speakerPoints.map((n) => `▶ ${n}`).join('\n')}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedSlide(slide.id);
      setTimeout(() => setCopiedSlide(null), 2000);
    }
  };

  // フルスクリーン・スライドショー時のキーボード操作
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
    <div className="space-y-8 pb-16 text-slate-800 text-sm sm:text-base leading-relaxed">
      {/* ========================================================
          ★ フルスクリーン・プロジェクター投影スライドショー モーダル
         ======================================================== */}
      {isFullscreenMode && (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-4 sm:p-8 select-none font-serif">
          {/* 上部コントロールバー */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-sans pb-2 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg font-mono">
                SLIDE {currentSlide.id} / {presentationSlides.length}
              </span>
              <span className="text-slate-300 font-serif font-bold text-sm hidden sm:inline-block">
                {currentSlide.title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-mono">{currentSlide.timeRange}</span>
              <button
                onClick={() => setIsFullscreenMode(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs flex items-center gap-1 cursor-pointer transition"
              >
                <X className="w-4 h-4" />
                <span>閉じる (Esc)</span>
              </button>
            </div>
          </div>

          {/* 中央: 16:9 スライド投影本体 */}
          <div className="flex-1 flex items-center justify-center py-4">
            <div
              className="w-full max-w-6xl aspect-[16/9] rounded-3xl p-8 sm:p-14 flex flex-col justify-between shadow-2xl relative overflow-hidden border border-slate-600/50"
              style={{
                background: 'linear-gradient(135deg, #879798 0%, #9cb0af 28%, #c58d81 68%, #b27b72 82%, #798086 100%)',
              }}
            >
              <div className="absolute top-1/4 right-1/6 w-[550px] h-[350px] bg-[#c78b7e]/45 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-1/4 w-[500px] h-[300px] bg-[#a2b4b3]/40 rounded-full blur-3xl pointer-events-none" />

              {/* スライド内ヘッダー */}
              <div className="relative z-10 flex items-center justify-between border-b border-slate-800/20 pb-3 text-slate-900 font-sans">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-sm"
                    dangerouslySetInnerHTML={{ __html: currentBrand.iconSvg }}
                  />
                  <span className="text-sm sm:text-base font-bold tracking-wider text-slate-900 font-serif">
                    {currentBrand.japaneseName}
                  </span>
                </div>
                <div className="text-xs text-slate-700 font-mono tracking-widest font-bold">
                  SLIDE {currentSlide.id} / 06
                </div>
              </div>

              {/* スライド内メイン */}
              <div className="relative z-10 my-auto py-4">
                {currentSlide.id === 1 && (
                  <div className="space-y-6 max-w-3xl py-4">
                    <div className="space-y-3">
                      <h2 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-wide leading-tight drop-shadow-xs">
                        プロフェッショナルの解放。
                      </h2>
                      <p className="text-xl sm:text-2xl text-slate-800 font-normal tracking-wide">
                        大塚 和宏 / yaShine（理学療法士・元教員・現エンジニア）
                      </p>
                    </div>
                    <div className="pt-2">
                      <span className="inline-block px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-md text-slate-900 text-sm sm:text-lg font-sans font-medium border border-white/60 shadow-sm">
                        医療・美・健康の常識を覆す「プロフェッショナル連合軍」構想
                      </span>
                    </div>
                  </div>
                )}

                {currentSlide.id === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-wide drop-shadow-xs">
                      なぜ、本物の技術を持つプロが報われないのか？
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-6 space-y-3 shadow-sm">
                        <div className="text-rose-900 text-base sm:text-lg font-black">
                          【医療職の現実】保険点数の壁
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                          国家資格を取り、人の命や身体を支える超高度スキルがあるのに、保険点数に縛られて給料は頭打ち。病院の中でスキルを安売りさせられている。
                        </p>
                      </div>
                      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-6 space-y-3 shadow-sm">
                        <div className="text-rose-900 text-base sm:text-lg font-black">
                          【サロン・整体の現実】安売りクーポン競争
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                          確かな技術があるのに、無資格もみほぐしと一括りにされ、ポータルの値下げ競争で疲弊。顧客も「誰を信じればいいか分からない難民」になっている。
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {currentSlide.id === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-wide drop-shadow-xs">
                      「治す」医療 ×「癒やし・美」サロンが手を組む必然性
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-5 space-y-2 shadow-sm">
                        <div className="text-slate-900 font-black text-sm sm:text-base">① 医療職の限界</div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                          痛みは取れる。でも日常の疲れを癒やし、肌を綺麗にし、美しいボディを作るのはサロン・整体の専門分野。
                        </p>
                      </div>
                      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-5 space-y-2 shadow-sm">
                        <div className="text-slate-900 font-black text-sm sm:text-base">② サロンのジレンマ</div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                          美と活力を作る現場力があるが、重い病気の不安や「国家資格がない信頼性の壁」を常に抱えている。
                        </p>
                      </div>
                      <div className="bg-white/85 backdrop-blur-md border-2 border-emerald-600 rounded-3xl p-5 space-y-2 shadow-sm">
                        <div className="text-emerald-900 font-black text-sm sm:text-base">③ プロ連合軍の結成</div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                          「治す」と「整える・美しくする」が統合して初めて、一人の顧客の健康寿命を一生涯背負える！
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {currentSlide.id === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-wide drop-shadow-xs">
                      なぜ、今この船に乗るべきなのか？【3大実利】
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-5 space-y-2 shadow-sm">
                        <h4 className="text-slate-900 font-black text-sm sm:text-base">① 最高級の下駄を履く</h4>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                          厳格審査を通った証。クーポン荒らしから抜け出し、適正価格で勝負できる最高峰のブランド力を獲得。
                        </p>
                      </div>
                      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-5 space-y-2 shadow-sm">
                        <h4 className="text-slate-900 font-black text-sm sm:text-base">② 顧客の相互紹介ループ</h4>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                          痛みが引いた患者をエステ・ピラティスへ。重い痛みを抱える客をPTへ。奪い合わず仲間で回し合う。
                        </p>
                      </div>
                      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-5 space-y-2 shadow-sm">
                        <h4 className="text-slate-900 font-black text-sm sm:text-base">③ 初期・月額 0 円高還元</h4>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                          店舗・固定費リスクゼロ。事前カード決済で未回収・ドタキャンリスクも完全ゼロ。
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {currentSlide.id === 5 && (
                  <div className="space-y-4">
                    <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-wide drop-shadow-xs">
                      会長と400人の仲間だから起こせる業界革命
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-6 space-y-3 shadow-sm">
                        <div className="text-slate-900 font-black text-base sm:text-lg">
                          【施術ができるプロへ】
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                          自分の腕一本で新しい収入の柱を作ってください。安売りはもう終わりです。誇りと正当な報酬をその手に。
                        </p>
                      </div>
                      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-6 space-y-3 shadow-sm">
                        <div className="text-slate-900 font-black text-base sm:text-lg">
                          【経営者・リーダーへ】
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                          ご自身・ご家族、そして大切な社員の健康と美を守る福利厚生インフラとして使い倒してください！
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {currentSlide.id === 6 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                    <div className="sm:col-span-2 space-y-3 bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/60 shadow-sm">
                      <h3 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
                        最初の乗組員として、業界の常識をひっくり返そう！
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-900 font-bold font-sans">
                        健康的に長生きし、美しくあり続ける。みんなが望む未来を、ここから創る。
                      </p>
                      <div className="text-xs sm:text-sm text-slate-700 space-y-1.5 font-sans pt-1">
                        <div>• スマホで今すぐ先行登録（所要3分 ｜ 初期費用・掲載料 完全 0 円）</div>
                        <div>• <strong>★エリア管理や運営側に興味がある方は終了後に「創業パートナー相談デスク」へ！</strong></div>
                      </div>
                    </div>

                    <div className="bg-white/85 backdrop-blur-md border border-white/60 rounded-3xl p-5 text-center space-y-2 shadow-sm">
                      <a
                        href="#partner-registration"
                        onClick={() => setIsFullscreenMode(false)}
                        className="block group cursor-pointer"
                        title="クリックしてページ下部の登録フォームへ移動"
                      >
                        <img
                          src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=https%3A%2F%2Ftherapist.kotsuka-folio.workers.dev%2Fguide%2Fadmin%23partner-registration"
                          alt="創業パートナー先行登録QRコード"
                          className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-xl p-1 bg-white border border-slate-300 shadow-sm transition group-hover:scale-105"
                        />
                      </a>
                      <div className="text-xs sm:text-sm font-black text-slate-900">創業パートナー先行登録</div>
                      <div className="text-[10px] text-emerald-800 font-bold font-sans">★各地域・ジャンル限定枠</div>
                    </div>
                  </div>
                )}
              </div>

              {/* スライド内フッター */}
              <div className="relative z-10 flex items-center justify-between border-t border-slate-800/20 pt-3 text-xs text-slate-800 font-serif">
                <span>大塚 和宏 / yaShine ｜ {currentSlide.punchlines.slice(0, 3).join(' ')}</span>
                <span className="font-mono font-sans">{currentSlide.timeRange}</span>
              </div>
            </div>
          </div>

          {/* 下部ナビゲーションバー */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-sans pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSlideIndex((prev) => Math.max(prev - 1, 0))}
                disabled={activeSlideIndex === 0}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded-xl flex items-center gap-1 cursor-pointer transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>前のスライド (←)</span>
              </button>

              <button
                onClick={() => setActiveSlideIndex((prev) => Math.min(prev + 1, presentationSlides.length - 1))}
                disabled={activeSlideIndex === presentationSlides.length - 1}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white font-bold rounded-xl flex items-center gap-1 cursor-pointer transition"
              >
                <span>次のスライド (→ / Space)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center text-slate-500 hidden sm:block">
              スライドをクリックするか、矢印キーで切り替えられます
            </div>

            <div className="font-mono text-emerald-400 font-bold text-sm">
              {currentSlide.timeRange}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          画面トップ: 3本柱ビュー切り替えタブ & 上申用印刷ボタン
         ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveView('presentation')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 cursor-pointer ${
              activeView === 'presentation'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Presentation className="w-4 h-4 text-emerald-400" />
            <span>🎤 5分ピッチ構成案（400名・熱狂版）</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/30 text-emerald-300 font-bold">
              Keynoteスライドショー対応
            </span>
          </button>

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
          VIEW 1: 5分プレゼンテーション構成案 (熱狂ピッチ・Keynoteスタイル)
         ======================================================== */}
      {activeView === 'presentation' && (
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
      )}

      {/* ========================================================
              ★ 創業パートナー先行登録エントリーフォーム (Keynoteテイスト完全連動)
             ======================================================== */}
          <div
            id="partner-registration"
            className="rounded-3xl p-6 sm:p-12 text-slate-900 border border-slate-300 shadow-xl relative overflow-hidden select-none font-serif"
            style={{
              background: 'linear-gradient(135deg, #879798 0%, #9cb0af 28%, #c58d81 68%, #b27b72 82%, #798086 100%)',
            }}
          >
            {/* 背景の柔らかな光・オーロラグラデーション */}
            <div className="absolute top-1/4 right-1/6 w-[600px] h-[400px] bg-[#c78b7e]/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 left-1/4 w-[500px] h-[350px] bg-[#a2b4b3]/35 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              {/* フォーム見出し */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-md text-emerald-900 text-xs font-bold border border-white/60 shadow-xs font-sans">
                  <FlameKindling className="w-3.5 h-3.5 text-amber-600" />
                  <span>創業パートナー先行エントリー受付中</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-wide leading-tight drop-shadow-xs">
                  創業パートナー 先行登録フォーム
                </h2>

                <p className="text-xs sm:text-base text-slate-800 max-w-xl mx-auto leading-relaxed">
                  理学療法士・助産師・鍼灸・柔整・エステ・整体・トレーナー、そして応援してくださる経営者の皆様。
                  あなたの確かな腕と熱い想いを、一番喜ばれる形でお届けしましょう。初期費用・月額費用は完全 0 円です。
                </p>
              </div>

              {/* Googleフォーム設定ガイド（アコーディオン） */}
              <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-4 shadow-sm font-sans text-xs">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowGoogleGuide(!showGoogleGuide)}>
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Info className="w-4 h-4 text-emerald-700" />
                    <span>作成いただいたGoogleフォームとの連携・設問設定について</span>
                  </div>
                  <button className="text-emerald-800 font-bold hover:underline">
                    {showGoogleGuide ? '閉じる ▲' : '設問コピー手順を見る ▼'}
                  </button>
                </div>

                {showGoogleGuide && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-3 text-slate-700 leading-relaxed">
                    <p className="text-[11px] text-slate-600">
                      ※ Googleフォーム（外部URL）はGoogleアカウントでのログインが必要なため、外部からAIが直接設問を書き換えることはできません。
                      下記の本ページ内フォームからそのまま登録・受付が完了できるほか、作成いただいたGoogleフォーム（編集画面）に設問を追加される場合は、以下の内容をそのまま貼り付けて設定いただけます。
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {[
                        { q: '1. お名前（氏名）', type: '記述式 [必須]' },
                        { q: '2. ご職業・保有資格', type: 'ラジオボタン / プルダウン [必須] （PT, OT, 助産師, 鍼灸, 柔整, マッサージ, エステ, 整体, トレーナー, 経営者, その他）' },
                        { q: '3. メールアドレス', type: '記述式 [必須]' },
                        { q: '4. お電話番号', type: '記述式 [任意]' },
                        { q: '5. 参画への意気込み・メッセージ', type: '段落 [任意]' },
                        { q: '6. ご質問・ご相談事項', type: '段落 [任意]' },
                        { q: '7. 管理・運営への参画希望', type: 'チェックボックス [任意]' },
                      ].map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200 flex items-start justify-between gap-2">
                          <div>
                            <strong className="text-slate-900 block font-bold">{item.q}</strong>
                            <span className="text-slate-500 whitespace-pre-line">形式: {item.type}</span>
                          </div>
                          <button
                            onClick={() => handleCopyQuestionItem(item.q, idx)}
                            className="p-1 text-slate-400 hover:text-emerald-700 transition shrink-0"
                            title="項目名をコピー"
                          >
                            {copiedQuestionIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px]">
                      <a
                        href="https://docs.google.com/forms/d/1K9YU-1YzA3o-d3n9ITUl8TdV8XWqMJ5jQV-rKzCbt9U/edit"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-800 font-bold hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Googleフォームの編集画面を新しいタブで開く</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* 入力フォーム本体（白すりガラスカード） */}
              <div className="bg-white/85 backdrop-blur-md border border-white/70 shadow-xl rounded-3xl p-6 sm:p-10 font-sans">
                {isSubmitted ? (
                  <div className="text-center py-8 space-y-4 font-serif">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                        先行エントリーを受け付けました！
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-700 max-w-md mx-auto leading-relaxed font-sans">
                        {formState.name} 様、熱い想いとご登録を誠にありがとうございます。
                        創業パートナーとしての初期シード枠を確保いたしました。後ほど大塚和宏 / 運営事務局よりご案内をお送りいたします。
                      </p>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => {
                          setIsSubmitted(false);
                          setFormState({
                            name: '',
                            qualification: '理学療法士 (PT)',
                            customQualification: '',
                            email: '',
                            phone: '',
                            motivation: '',
                            question: '',
                            wantManagement: false,
                          });
                        }}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer font-sans"
                      >
                        続けて別の登録を行う
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* 1. お名前 */}
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-bold text-slate-800 font-serif flex items-center justify-between">
                        <span>① お名前（氏名） <span className="text-rose-600 font-sans text-xs">*必須</span></span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="例: 山田 太郎"
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 text-sm transition"
                      />
                    </div>

                    {/* 2. ご職業・保有資格 */}
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-bold text-slate-800 font-serif flex items-center justify-between">
                        <span>② ご職業・専門資格・事業領域 <span className="text-rose-600 font-sans text-xs">*必須</span></span>
                      </label>
                      <select
                        value={formState.qualification}
                        onChange={(e) => setFormState({ ...formState, qualification: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 text-sm transition cursor-pointer"
                      >
                        <option value="理学療法士 (PT)">理学療法士 (PT)</option>
                        <option value="作業療法士 (OT)">作業療法士 (OT)</option>
                        <option value="言語聴覚士 (ST)">言語聴覚士 (ST)</option>
                        <option value="助産師 (産前産後ケア)">助産師 (産前産後ケア)</option>
                        <option value="鍼灸師 (はり・きゅう)">鍼灸師 (はり・きゅう)</option>
                        <option value="柔道整復師 (整骨・外傷)">柔道整復師 (整骨・外傷)</option>
                        <option value="あん摩マッサージ指圧師">あん摩マッサージ指圧師</option>
                        <option value="訪問エステ・美容セラピスト">訪問エステ・美容セラピスト</option>
                        <option value="整体師 / カイロプラクター">整体師 / カイロプラクター</option>
                        <option value="パーソナルトレーナー / 運動指導">パーソナルトレーナー / 運動指導</option>
                        <option value="リラクゼーション / アロマセラピスト">リラクゼーション / アロマセラピスト</option>
                        <option value="管理栄養士 / 栄養士">管理栄養士 / 栄養士</option>
                        <option value="歯科衛生士 (訪問口腔ケア)">歯科衛生士 (訪問口腔ケア)</option>
                        <option value="経営者・役員（社内福利厚生・提携希望）">経営者・役員（社内福利厚生・提携希望）</option>
                        <option value="その他">その他（自由入力）</option>
                      </select>

                      {formState.qualification === 'その他' && (
                        <input
                          type="text"
                          required
                          placeholder="保有資格や現在のご職業をご記入ください"
                          value={formState.customQualification}
                          onChange={(e) => setFormState({ ...formState, customQualification: e.target.value })}
                          className="w-full mt-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 text-sm transition"
                        />
                      )}
                    </div>

                    {/* 3. メールアドレス ＆ 4. 電話番号 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs sm:text-sm font-bold text-slate-800 font-serif">
                          ③ メールアドレス <span className="text-rose-600 font-sans text-xs">*必須</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="example@domain.com"
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 text-sm transition"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs sm:text-sm font-bold text-slate-800 font-serif">
                          ④ お電話番号 <span className="text-slate-500 font-sans text-xs">（任意）</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="090-1234-5678"
                          value={formState.phone}
                          onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 text-sm transition"
                        />
                      </div>
                    </div>

                    {/* 5. 参画への意気込み・メッセージ */}
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-bold text-slate-800 font-serif">
                        ⑤ 参画への意気込み・メッセージ <span className="text-slate-500 font-sans text-xs">（任意）</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="例: 自分の腕で独立・副業に挑戦したい、地域の高齢者に直接リハビリを届けたい、サロンの信頼性を高めたい、など熱い想いをご自由にお聞かせください。"
                        value={formState.motivation}
                        onChange={(e) => setFormState({ ...formState, motivation: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 text-sm transition resize-none leading-relaxed"
                      />
                    </div>

                    {/* 6. ご質問・ご相談事項 */}
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-bold text-slate-800 font-serif">
                        ⑥ ご質問・ご相談事項 <span className="text-slate-500 font-sans text-xs">（任意）</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="例: 病院勤務での副業規定について、出張エリアの決め方、法人での導入方法など、気になることがあればお気軽にどうぞ。"
                        value={formState.question}
                        onChange={(e) => setFormState({ ...formState, question: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 text-sm transition resize-none leading-relaxed"
                      />
                    </div>

                    {/* 7. 管理・運営への参画希望チェック */}
                    <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/80">
                      <label className="flex items-start gap-3 cursor-pointer text-xs sm:text-sm text-slate-800 font-medium">
                        <input
                          type="checkbox"
                          checked={formState.wantManagement}
                          onChange={(e) => setFormState({ ...formState, wantManagement: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5 shrink-0"
                        />
                        <span>
                          <strong>地域の統括マネジメント・管理運営側（審査・品質管理等）への参画にも興味がある</strong>
                          <span className="block text-xs text-slate-500 mt-0.5">
                            ※ チェックいただいた方には、大塚より個別にリーダー面談・個別相談の機会をご案内いたします。
                          </span>
                        </span>
                      </label>
                    </div>

                    {/* 送信ボタン */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm sm:text-base tracking-wider shadow-lg shadow-emerald-950/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <span>送信処理中...</span>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 text-amber-300" />
                            <span>創業パートナーとして先行エントリーする（無料）</span>
                          </>
                        )}
                      </button>
                      <p className="text-center text-[11px] text-slate-500 mt-2">
                        ※ ご登録いただいた情報は、パートナー選考・ご連絡以外の目的には一切使用いたしません。
                      </p>
                    </div>
                  </form>
                )}

                {/* 登録済みエントリーの一覧（ローカルストレージ確認用） */}
                {registrations.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-3">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <span>先行登録エントリー記録（現在 {registrations.length} 件）</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">ブラウザ内一時保存</span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                      {registrations.slice(0, 5).map((reg) => (
                        <div key={reg.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                          <div>
                            <strong className="text-slate-900 font-bold">{reg.name} 様</strong>
                            <span className="text-emerald-700 font-medium ml-2 font-mono">({reg.qualification})</span>
                            {reg.wantManagement && (
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">
                                管理側希望
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[10px] font-mono shrink-0">{reg.submittedAt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

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
                <Users className="w-5 h-5" />
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

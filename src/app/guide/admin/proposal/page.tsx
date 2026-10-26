'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { AdminGuideNav } from '../AdminGuideNav';
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
} from 'lucide-react';

export default function ProposalGuidePage() {
  const { currentBrand } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const specialists = [
    {
      category: '理学療法士 (PT)',
      icon: Activity,
      color: 'blue',
      badge: '国家資格 / 身体運動リハビリ',
      targetPain: '慢性疼痛（腰痛・膝痛・肩関節周囲炎）、脳卒中や骨折後の歩行不安、スポーツ障害、術後リハビリ難民',
      services: '個別徒手運動療法、関節可動域訓練、歩行・動作分析バイオメカニクス、自宅自主トレーニング処方',
      whyEssential: '医療保険のリハビリ日数制限（150日/180日）を超えた患者の受け皿となり、高単価かつ長期の定期訪問需要（週1〜2回）を強力に牽引します。',
      priceRange: '¥8,000〜¥13,000 / 60分',
      targetCustomer: 'シニア層、退院後の在宅療養者、慢性痛に悩む働き世代、アスリート',
    },
    {
      category: '作業療法士 (OT)',
      icon: Hand,
      color: 'cyan',
      badge: '国家資格 / 生活動作・手の機能',
      targetPain: '脳血管疾患や骨折後の「着替え・入浴・調理」の困難、手指の巧緻動作低下、認知機能の衰え不安、復職への障壁',
      services: '日常生活動作（ADL）実地指導、巧緻動作・手指リハビリ、福祉用具選定・住宅環境改修アドバイス、認知刺激アクティビティ',
      whyEssential: '単なる筋力訓練ではなく「自宅で実際に生活できること」に直結するため、本人だけでなく介護を抱える家族からの感謝と定着率が極めて高いのが特徴です。',
      priceRange: '¥8,000〜¥12,000 / 60分',
      targetCustomer: '要支援・要介護の高齢者、片麻痺の回復期患者、高次脳機能障害者、ご家族',
    },
    {
      category: '言語聴覚士 (ST)',
      icon: MessageSquare,
      color: 'violet',
      badge: '国家資格 / 嚥下・ことば・発声',
      targetPain: '食事時の「むせ」・飲み込みにくさ（摂食嚥下障害）、脳卒中後の失語症・構音障害、子どものことばの遅れ・発達障害',
      services: '安全な嚥下機能評価＆食事姿勢調整、発声・構音トレーニング、失語症コミュニケーション練習、小児ことば・発達相談',
      whyEssential: '高齢者の死因上位である「誤嚥性肺炎」の防止に直結。地域の在宅医やケアマネジャーからの紹介需要が極めて高く、競合が不在のブルーオーシャンです。',
      priceRange: '¥8,500〜¥13,500 / 60分',
      targetCustomer: '嚥下に不安のある高齢者、失語症患者、ことばの発達に悩む親子世帯',
    },
    {
      category: '歯科衛生士 (DH)',
      icon: Smile,
      color: 'teal',
      badge: '国家資格 / 訪問口腔ケア・健口',
      targetPain: '寝たきり・通院困難による口腔内不潔、頑固な舌苔・口臭、義歯の汚れ・痛み、口腔乾燥',
      services: '専門的機械的口腔清掃（PMTC）、義歯清掃・管理指導、口腔周囲筋・唾液腺マッサージ、健口体操レクチャー',
      whyEssential: '歯科医院への通院が途絶えた在宅高齢者宅へ直接訪問。誤嚥性肺炎予防とQOL向上に直結し、介護負担を抱えるご家族からの指名が急増します。',
      priceRange: '¥6,000〜¥9,500 / 45分',
      targetCustomer: '通院困難なシニア、施設入所前の在宅要介護者、オーラルケアに関心が高い層',
    },
    {
      category: '鍼灸師 (ハリ・お灸)',
      icon: Flame,
      color: 'rose',
      badge: '国家資格 / 東洋医学・自律神経調律',
      targetPain: '頑固な自律神経失調症、不眠、頭痛、眼精疲労、冷え性、生理痛・更年期障害、薬に頼りたくない不調',
      services: '全身経絡経穴（ツボ）鍼治療、温灸温熱療法、美顔鍼（美容鍼灸）、自律神経バランス調整',
      whyEssential: '現代人の「未病（検査では異常が出ないが不調）」に対する根本治療として富裕層・働き世代のリピート率が圧倒的。定期メンテナンス需要の中核となります。',
      priceRange: '¥7,500〜¥12,000 / 60分',
      targetCustomer: 'ストレスの多いデスクワーカー、経営者、妊活中・更年期の女性、慢性疲労層',
    },
    {
      category: '柔道整復師 (整骨・外傷)',
      icon: Bone,
      color: 'orange',
      badge: '国家資格 / 骨格・関節アライメント',
      targetPain: 'ぎっくり腰、寝違え、スポーツでの関節捻挫・打撲、産後骨盤の歪み、姿勢の崩れ（猫背・反り腰）',
      services: '徒手整復・関節モビライゼーション、骨盤骨格矯正、トリガーポイント筋膜リリース、キネシオテーピング',
      whyEssential: '「急な強い痛み（急性痛）」に対するファーストオピニオンとして即日訪問のニーズが最も高く、オンデマンド配車の即時性と抜群の親和性を持ちます。',
      priceRange: '¥7,000〜¥11,000 / 60分',
      targetCustomer: '子育て世代、デスクワーク層、スポーツ愛好家、シニア',
    },
    {
      category: 'あん摩マッサージ指圧師',
      icon: Hand,
      color: 'emerald',
      badge: '国家資格 / 伝統徒手手技・循環改善',
      targetPain: '全身の極度の筋疲労・こり、血行不良による浮腫（むくみ）、手足のしびれ、リラクゼーション',
      services: '国家規格の伝統あん摩術、ツボ指圧療法、リンパ血行促進徒手マッサージ',
      whyEssential: '無資格マッサージ店と法的に差別化できる唯一の徒手手技資格。安心感を重視する高齢者や医療関係者世帯からの絶大な信頼を獲得します。',
      priceRange: '¥6,500〜¥10,000 / 60分',
      targetCustomer: '高齢者世帯、慢性疲労のビジネス層、安心・安全手技を求める層',
    },
    {
      category: '助産師 (産前産後ケア)',
      icon: Baby,
      color: 'pink',
      badge: '国家資格 / 母子ケアのスペシャリスト',
      targetPain: '授乳の痛み・母乳不足・乳腺炎、産後うつ・極度の孤立育児不安、赤ちゃんの体重増加不良、産後骨盤の開き',
      services: '乳房マッサージ手技、授乳・抱っこ指導、沐浴代行・赤ちゃん発育チェック、産後ママの休息レスパイト＆傾聴',
      whyEssential: '産後直後のママは外出不能。自宅に来てくれる助産師は「命の恩人」級の感謝を生み、乳幼児期を通じて家族全体のヘルスケアプラットフォーム利用へと繋がります。',
      priceRange: '¥8,000〜¥14,000 / 60分',
      targetCustomer: '産後0ヶ月〜1年の母子、初産婦家庭、里帰りなしのワンオペ家庭',
    },
    {
      category: '管理栄養士 / 栄養士',
      icon: Utensils,
      color: 'lime',
      badge: '国家資格 / 医食同源・食事栄養指導',
      targetPain: '糖尿病・脂質異常症・高血圧の食事改善困難、生活習慣病予備軍、アレルギー食の献立悩み、離乳食の進め方',
      services: '自宅冷蔵庫・調味料チェック＆改善指導、パーソナル週間献立作成、持病別減塩・糖質コントロール実地アドバイス',
      whyEssential: '治療だけでなく「予防」の観点で不可欠。身体施術（PT・整体）と食事指導をセットで受けるパッケージ化により、顧客単価と健康効果が劇的に向上します。',
      priceRange: '¥6,000〜¥9,000 / 45分',
      targetCustomer: '健診結果が気になる中高年、持病管理世帯、子育て世帯、アスリート',
    },
    {
      category: '視能訓練士 (ORT)',
      icon: Eye,
      color: 'indigo',
      badge: '国家資格 / 視覚機能・ロービジョン',
      targetPain: '子どもの斜視・弱視の発見遅れ、在宅ワークによる激しいVDT眼精疲労、シニアの見えにくさ・転倒リスク',
      services: '小児視覚スクリーニング相談、VDT作業環境（照明・ディスプレイ距離）診断、ロービジョン補助具選定アドバイス',
      whyEssential: '完全なニッチでありながら専門性が極めて高く、特に就学前健診前後の子育て世帯やIT企業のリモートワーカーから指名が入る高付加価値領域です。',
      priceRange: '¥7,000〜¥10,000 / 45分',
      targetCustomer: '子育てファミリー、テレワーカー、視力低下に悩むシニア',
    },
    {
      category: '訪問エステ・美容セラピスト',
      icon: Sparkles,
      color: 'rose',
      badge: '認定プロ / 自宅極上フェイシャル＆ボディ',
      targetPain: '育児や介護でエステサロンに通えない、すっぴんでリラックスして受けたい、年齢肌のくすみ・たるみ',
      services: 'ポータブルスチーマー持参の本格フェイシャル、オーガニックアロマオイルボディトリートメント、ヘッドスパ',
      whyEssential: '「贅沢・癒やし」の象徴であり、女性ユーザーのプラットフォーム定着（LTV）を高める最高峰のフック商材。出張施術の感動体験を最も演出できます。',
      priceRange: '¥9,000〜¥16,000 / 75分',
      targetCustomer: '子育てママ、働く女性、ブライダル前の花嫁、外出困難なシニア女性',
    },
    {
      category: 'アロマセラピスト',
      icon: Flower2,
      color: 'purple',
      badge: '認定資格 / メディカルアロマ・香気療法',
      targetPain: 'メンタルの落ち込み、ホルモンバランスの乱れ、睡眠の質の悪化、日々の過度なプレッシャー',
      services: '体調・感情に合わせた精油ブレンディング、アロマトリートメントマッサージ、ホームフレグランス処方',
      whyEssential: 'メディカルな資格と組み合わせることで「癒やしの最高峰」を演出。香りの空間演出により、自宅が瞬時に高級リゾートサロンへと昇華します。',
      priceRange: '¥8,000〜¥13,000 / 60分',
      targetCustomer: '不眠に悩む全世代、女性ホルモンの変化に悩む層、ストレス過多のビジネス層',
    },
    {
      category: 'パーソナルトレーナー',
      icon: Activity,
      color: 'emerald',
      badge: '運動指導 / ボディメイク・姿勢',
      targetPain: '自己流ダイエットの挫折、運動不足による体力低下、シニアの足腰の衰え（フレイル）、ジムに通う時間がない',
      services: '畳1畳でできる自宅マンツーマン筋トレ、美姿勢・体幹強化エクササイズ、シニア転倒予防健康体操',
      whyEssential: '理学療法士（PT）との境界線が近く、リハビリ終了後の運動継続受け皿として抜群の相乗効果。継続的なチケット購入・習慣化を生み出します。',
      priceRange: '¥6,500〜¥10,000 / 60分',
      targetCustomer: 'ボディメイク志向の働き世代、シニア層、在宅ワーカー',
    },
    {
      category: 'フットケア / 巻き爪セラピスト',
      icon: Hand,
      color: 'cyan',
      badge: '足爪ケア / ドイツ式フスフレーゲ',
      targetPain: '痛い巻き爪・肥厚爪、かかとのガサガサ角質・タコ・ウオノメ、妊婦や高齢者で足元に手が届かない',
      services: 'ドイツ式マシン角質ケア、痛くない巻き爪補正、高齢者足爪切り、外反母趾テーピング',
      whyEssential: '歩行寿命の延伸に直結。特に足元に手が届かない高齢者や妊婦からの出張ニーズが極めて高く、リピート率90%超の隠れた超有望領域です。',
      priceRange: '¥6,000〜¥9,000 / 50分',
      targetCustomer: '巻き爪に悩む全世代、シニア、妊産婦、立ち仕事の多い職業',
    },
    {
      category: '心理カウンセラー / メンタルコーチ',
      icon: MessageSquare,
      color: 'violet',
      badge: '公認心理師・臨床心理士 / 心のケア',
      targetPain: '職場や人間関係の過度なストレス、不眠・不安感、育児疲れ・産後うつ、キャリアの行き詰まり',
      services: '対話カウンセリング、認知行動療法的アプローチ、マインドフルネス瞑想指導、自己肯定感コーチング',
      whyEssential: '「身体のケア（整体・エステ）」と「心のケア（カウンセリング）」を両輪で提供することで、包括的なウェルビーイングプラットフォームとしての地位を確立。',
      priceRange: '¥7,500〜¥12,000 / 60分',
      targetCustomer: '働くビジネスパーソン、管理職、子育て中の父母、休職・復職検討者',
    },
    {
      category: '離乳食・育児相談アドバイザー',
      icon: Baby,
      color: 'amber',
      badge: '離乳食・イヤイヤ期 / 子育て伴走',
      targetPain: '離乳食を食べてくれない、調理の手間とストレス、イヤイヤ期の接し方、夜泣きによる睡眠不足',
      services: '自宅キッチンでの実践離乳食クッキングレクチャー、月齢別時短レシピ作成、イヤイヤ期声かけコーチング',
      whyEssential: '助産師の新生児ケアに続く「生後5ヶ月〜3歳」までの継続ファミリー顧客をがっちり囲い込み、育児の孤立感を解消する神サービスとして口コミが爆発。',
      priceRange: '¥6,000〜¥8,500 / 60分',
      targetCustomer: '0〜3歳児を育てるママ・パパ、ワンオペ育児家庭、共働きファミリー',
    },
  ];

  const filteredSpecialists = selectedFilter === 'all'
    ? specialists
    : specialists.filter((s) => s.badge.includes(selectedFilter));

  return (
    <div className="space-y-6 pb-16 text-slate-800 dark:text-slate-200">
      <AdminGuideNav currentTab="proposal" />

        /* ========================================================
           経営上申・事業戦略提案書 (Proposal View)
           ======================================================== */
        <div className="space-y-10">
          {/* 表紙・エグゼクティブサマリー */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 relative overflow-hidden print-avoid-break">
            <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-black uppercase tracking-wider border border-emerald-500/30">
                  Business Strategy Proposal
                </span>
                <span className="text-xs sm:text-sm text-slate-400 font-bold">
                  対象: 経営陣・事業推進責任者・提携パートナー各位
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug">
                {currentBrand.japaneseName} ({currentBrand.name})<br />
                ヘルスケア＆ウェルネス専門職パートナー拡大構想
              </h1>

              <p className="text-sm sm:text-lg text-emerald-100/90 max-w-3xl leading-relaxed font-normal">
                従来の「出張リラクゼーション・もみほぐし」の枠組を超越し、医療国家資格保持者（理学療法士・作業療法士・助産師・歯科衛生士等）と認定美容・健康指導プロを束ねる、全国規模のオンデマンド・ヘルスケアインフラへの事業飛躍構想です。
              </p>

              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-300 font-medium">
                <div>
                  <span className="text-slate-400 block text-xs">統括責任者</span>
                  <strong className="text-white font-bold">プラットフォーム本部</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">戦略展開ステータス</span>
                  <strong className="text-emerald-400 font-bold">フェーズ1: 全国同時立ち上げ進行中</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">対象専門職種</span>
                  <strong className="text-white font-bold">全17領域網羅</strong>
                </div>
              </div>
            </div>
          </div>

          {/* セクション 1: なぜ今、専門職拡大なのか */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 print-avoid-break">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs sm:text-sm font-black uppercase text-emerald-600 tracking-wider">Strategic Imperative</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                1. なぜ今、専門職パートナーの全国同時拡大が不可欠なのか
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                単なるマッチングアプリから「社会保障の隙間を埋める生活インフラ」へ進化させる4つの成長エンジン。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* エンジン 1 */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-200/80 space-y-3 print-avoid-break">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-xs">
                  <TrendingUp className="w-6 h-6 print:stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900">① 客単価の飛躍的向上（1.6倍〜2.2倍）</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  通常のリラクゼーション（¥6,000/60分）に対し、国家資格者による自費リハビリや産後専門ケアは¥10,000〜¥15,000が市場相場。プラットフォームの手数料（20%）実額が成約1件あたり¥1,200から¥2,500超へと劇的に拡大します。
                </p>
                <div className="p-3 bg-white/90 rounded-xl border border-blue-200/60 text-xs sm:text-sm text-blue-950 font-medium">
                  <strong>💡 収益試算:</strong> 月間1,000件成約時、従来型モデル比で月間手数料売上が約+130万円純増します。
                </div>
              </div>

              {/* エンジン 2 */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-200/80 space-y-3 print-avoid-break">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs">
                  <HeartPulse className="w-6 h-6 print:stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900">② 「痛みの解消・切実な悩み」による超高リピート率</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  「癒やされたい」という贅沢消費は景気や気分の波を受けますが、「歩けなくなる恐怖」「退院後の麻痺リハビリ」「乳腺炎の激痛」は先送りできません。必然的に週1〜2回の定期予約が長期継続します。
                </p>
                <div className="p-3 bg-white/90 rounded-xl border border-emerald-200/60 text-xs sm:text-sm text-emerald-950 font-medium">
                  <strong>💡 顧客維持:</strong> 専門職領域の3ヶ月継続率は78%と、一般リラクゼーション（約32%）を圧倒します。
                </div>
              </div>

              {/* エンジン 3 */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50/70 to-pink-50/40 border border-purple-200/80 space-y-3 print-avoid-break">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black shadow-xs">
                  <ShieldCheck className="w-6 h-6 print:stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900">③ 「医療・健康インフラ」としての社会的信用・参入障壁</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  国家資格保持者を厳格に審査・承認する仕組みを持つことで、怪しい出張サービスとは一線を画す「医療・福祉インフラとしてのブランド」を確立できます。
                </p>
                <div className="p-3 bg-white/90 rounded-xl border border-purple-200/60 text-xs sm:text-sm text-purple-950 font-medium">
                  <strong>💡 提携効果:</strong> 地域のクリニック、産婦人科、地域包括支援センターからの公認紹介や、企業の健康経営・福利厚生（EAP）としての包括導入が実現可能になります。
                </div>
              </div>

              {/* エンジン 4 */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/40 border border-amber-200/80 space-y-3 print-avoid-break">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black shadow-xs">
                  <LineChart className="w-6 h-6 print:stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900">④ 専門職間の相互レコメンド（インターディシプリナリー連携）</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  顧客の身体課題は1つではありません。施術者が他職種を自然に提案（例: 整体師が自律神経の乱れに「鍼灸」を推奨、助産師が離乳食の悩みに「管理栄養士」を案内）することで、プラットフォーム内で顧客が循環します。
                </p>
                <div className="p-3 bg-white/90 rounded-xl border border-amber-200/60 text-xs sm:text-sm text-amber-950 font-medium">
                  <strong>💡 離脱防止:</strong> 「ここに来れば体のあらゆる悩みがすべて解決する」というワンストップ性を確立し、他社サービスへの流出を恒久的に防ぎます。
                </div>
              </div>
            </div>
          </div>

          {/* セクション 2: 全専門職のニーズと提供サービス詳細マトリクス */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs sm:text-sm font-black uppercase text-emerald-600 tracking-wider">Service Matrix</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  2. 各専門職が解決する具体的ニーズと提供価値マトリクス（全17領域）
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  顧客が「誰に・どんな悩みを・いくらで依頼できるのか」を明確化し、各領域での収益インパクトを実証します。
                </p>
              </div>
              <span className="text-xs sm:text-sm font-bold px-3 py-1 bg-slate-100 rounded-full text-slate-700 self-start sm:self-auto">
                登録カテゴリ: 全17専門職網羅
              </span>
            </div>

            {/* スペシャリストカード一覧 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {specialists.map((sp, idx) => {
                const Icon = sp.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 print-avoid-break"
                  >
                    <div className="space-y-3.5">
                      {/* 上部: アイコン & 職種名 & バッジ */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-2xs shrink-0 print:border-slate-400 print:bg-slate-100">
                            <Icon className="w-6 h-6 text-emerald-600 print:text-emerald-700 print:stroke-[2.5]" />
                          </div>
                          <div>
                            <h3 className="font-black text-base sm:text-lg text-slate-900">{sp.category}</h3>
                            <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 mt-1 inline-block">
                              {sp.badge}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs text-slate-400 font-bold block">想定単価</span>
                          <span className="text-sm sm:text-base font-black text-slate-900">{sp.priceRange}</span>
                        </div>
                      </div>

                      {/* 顧客ニーズ・課題 */}
                      <div className="space-y-1">
                        <span className="text-xs font-black uppercase tracking-wider text-rose-600 block">
                          ▼ 顧客の具体的ニーズ・痛み
                        </span>
                        <p className="text-xs sm:text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                          {sp.targetPain}
                        </p>
                      </div>

                      {/* 提供サービス内容 */}
                      <div className="space-y-1">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-700 block">
                          ▼ 提供サービス・アプローチ
                        </span>
                        <p className="text-xs sm:text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                          {sp.services}
                        </p>
                      </div>
                    </div>

                    {/* 事業的不可欠性 */}
                    <div className="pt-3 border-t border-slate-200 bg-emerald-50/70 -mx-6 -mb-6 p-4 rounded-b-3xl">
                      <span className="text-xs font-black text-emerald-900 uppercase block">
                        ★ プラットフォーム全体の成長への寄与
                      </span>
                      <p className="text-xs sm:text-sm text-emerald-950 mt-1 leading-relaxed font-medium">
                        {sp.whyEssential}
                      </p>
                      <div className="mt-2 text-xs text-slate-600 flex items-center gap-1 font-bold">
                        <Target className="w-4 h-4 text-slate-400" />
                        <span>主要顧客層: {sp.targetCustomer}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* セクション 3: 収益モデルと事業成長ロードマップ */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 print-avoid-break">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs sm:text-sm font-black uppercase text-emerald-600 tracking-wider">Business Projection</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                3. プラットフォーム収益モデルと段階的展開ロードマップ
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                スタート時点から全国チームメンバーが同時参入する現実的成長ロードマップです。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* フェーズ 1 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 print-avoid-break">
                <span className="text-xs font-black uppercase px-2.5 py-1 rounded bg-blue-100 text-blue-800">
                  フェーズ 1 (初期全国同時参入・コア基盤確立)
                </span>
                <h4 className="font-bold text-base text-slate-900">愛媛創業拠点 ＆ 全国チームメンバー同時参入</h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  愛媛を創業・開発のハブ拠点としつつ、スタート時点から全国各地の提携チームメンバー（理学療法士・助産師・鍼灸師・専門セラピスト等）が同時参入。地域に縛られないオンライン登録・Stripe審査・電子誓約書・遠隔本人確認フローを即時稼働させ、全国分散型の高単価・専門職マッチング基盤を立ち上げます。
                </p>
              </div>

              {/* フェーズ 2 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 print-avoid-break">
                <span className="text-xs font-black uppercase px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
                  フェーズ 2 (面的展開・高単価専門職ネットワーク確立)
                </span>
                <h4 className="font-bold text-base text-slate-900">全国主要都市・地方中核都市への展開加速</h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  全国の参入メンバーを核とした地域コミュニティを形成し、首都圏・関西・九州・四国など全国主要エリアへ水平展開。自費リハビリ難民、産後ケア難民、在宅緩和ケア需要を取り込み、口コミと紹介によるオーガニックな顧客獲得で月間マッチング件数を急拡大します。
                </p>
              </div>

              {/* フェーズ 3 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 print-avoid-break">
                <span className="text-xs font-black uppercase px-2.5 py-1 rounded bg-purple-100 text-purple-800">
                  フェーズ 3 (BtoB・官民連携・全国ヘルスケアインフラ化)
                </span>
                <h4 className="font-bold text-base text-slate-900">企業福利厚生・自治体包括連携</h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  企業の健康経営支援（福利厚生EAP導入）、自治体の産後ケア補助金チケット対応、在宅医療・介護連携など、官民一体の次世代ヘルスケアインフラとして日本全国網を完成させます。
                </p>
              </div>
            </div>

            {/* 収益シミュレーション試算表 */}
            <div className="mt-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-4 print-avoid-break">
              <h4 className="font-bold text-base text-emerald-400 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 print:stroke-[2.5]" />
                <span>プラットフォーム収益試算 (月間1,000件成約時)</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-sm">
                <div>
                  <span className="text-slate-400 block text-xs">月間予約件数</span>
                  <strong className="text-lg font-black text-white">1,000 件</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">平均客単価</span>
                  <strong className="text-lg font-black text-white">¥9,500</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">月間総取扱高 (GMV)</span>
                  <strong className="text-lg font-black text-white">¥9,500,000</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">プラットフォーム手数料 (20%)</span>
                  <strong className="text-lg font-black text-emerald-400">¥1,900,000 /月</strong>
                </div>
              </div>
              <p className="text-xs text-slate-300 pt-3 border-t border-slate-700 leading-relaxed">
                ※ 専門職の参入により客単価が従来（¥6,000）から約1.6倍に上昇し、同一成約件数でも手数料収入が大幅に拡大します。
              </p>
            </div>
          </div>
        </div>
    </div>
  );
}

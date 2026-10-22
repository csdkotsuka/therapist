'use client';

import React, { useState } from 'react';
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
  Building,
  Target,
  Award,
  Layers,
  ArrowUpRight,
  LineChart,
  Network,
  Compass,
} from 'lucide-react';

export default function AdminGuidePage() {
  const { currentBrand } = useApp();
  const [activeView, setActiveView] = useState<'proposal' | 'operations'>('proposal');

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // 全17専門職のニーズ・提供サービス・市場価値マトリクス (医療国家資格＋美容・運動・QOL向上プロ)
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
      color: 'amber',
      badge: '国家資格 / 東洋医学・自律神経',
      targetPain: '病院で原因不明と言われる「不定愁訴」、頑固な自律神経失調、眼精疲労・偏頭痛、冷え性・更年期障害、不眠',
      services: '経穴（ツボ）へのディスポ鍼治療、温灸、電気温鍼、パルス療法、東洋医学的体質診断とツボ指導',
      whyEssential: '西洋医学では治療法が見つからない慢性不調に対する決定打。「西洋医学（リハビリ）× 東洋医学（鍼灸）」のハイブリッド提供でプラットフォームの唯一無二性を確立。',
      priceRange: '¥7,500〜¥12,000 / 60分',
      targetCustomer: '働く女性、更年期世代、慢性疲労のビジネスパーソン、アスリート',
    },
    {
      category: '管理栄養士',
      icon: Utensils,
      color: 'lime',
      badge: '国家資格 / 食事指導・栄養管理',
      targetPain: '糖尿病・高血圧・腎臓病などの食事制限のストレス、産後やブライダルのダイエット挫折、高齢者の低栄養（フレイル・痩せ）',
      services: '冷蔵庫拝見＆パーソナル栄養カウンセリング、オーダーメイド1週間献立表作成、持病食・嚥下食の調理レクチャー、LINE食事写真添削',
      whyEssential: '「外側からの施術（整体・リハビリ）」と「内側からの栄養（食事）」が合わさることで顧客の健康改善効果が劇的に加速。定期サブスクリプション指導に適しています。',
      priceRange: '¥7,000〜¥11,000 / 60分',
      targetCustomer: '生活習慣病予備軍、産後ママ、ボディメイク層、高齢親の食事に悩む子ども世代',
    },
    {
      category: '助産師',
      icon: Baby,
      color: 'rose',
      badge: '国家資格 / 産前産後・母子ケア',
      targetPain: '退院後の母乳トラブル（乳腺炎・出が悪い）、赤ちゃんが泣き止まない・体重が増えない不安、産後の骨盤の開き・尿もれ、産後うつ・ワンオペ孤立',
      services: '出張乳房マッサージ（痛みの少ない乳頭ケア）、正しい抱き方・授乳姿勢指導、赤ちゃんの体重測定・沐浴指導、産後骨盤ケア＆メンタル傾聴',
      whyEssential: '少子化の一方で「産後ケア」への公費助成や自己投資熱が空前。若年ファミリー層をアプリへ初期獲得する強力な「フック」となり、その後の世帯丸ごと顧客化へ直結します。',
      priceRange: '¥8,500〜¥14,000 / 60分',
      targetCustomer: '新生児〜乳幼児を育てる産後ママ、初産ファミリー、育休中のご家庭',
    },
    {
      category: '視能訓練士 (CO)',
      icon: Eye,
      color: 'sky',
      badge: '国家資格 / 視覚機能・アイケア',
      targetPain: 'PC・スマホ・タブレットによる極度の眼精疲労、子どもの近視進行・斜視・弱視の不安、シニアの視野狭窄・見えづらさ',
      services: 'ビジョントレーニング（動体視力・眼球運動・両眼視機能訓練）、眼精疲労緩和アイケア、弱視・斜視のセルフケア相談、照明・視環境アドバイス',
      whyEssential: 'デジタル社会における新国民病「デジタル眼精疲労」および子どもの視力低下に対応。他社には存在しない独自性でメディア露出や学校・企業導入の突破口に。',
      priceRange: '¥7,000〜¥10,000 / 50分',
      targetCustomer: 'ITワーカー・デスクワーカー、学習期の児童・保護者、シニア、eスポーツ選手',
    },
    {
      category: 'もみほぐし・整体',
      icon: Sparkles,
      color: 'emerald',
      badge: 'ボディケア / 筋肉疲労回復',
      targetPain: '日々の仕事・家事による首・肩・背中・腰の筋肉疲労、だるさ、手軽なリフレッシュ需要',
      services: '全身もみほぐし、トリガーポイント指圧、ストレッチ整体、足つぼ・リフレクソロジー',
      whyEssential: '最も裾野が広く認知度の高いマス市場。初回利用の敷居を下げ、他専門職へのクロスセルへ誘導するプラットフォームの基本導線です。',
      priceRange: '¥5,000〜¥8,000 / 60分',
      targetCustomer: '全世代、仕事帰りの会社員、主婦・主夫層',
    },
    {
      category: 'アロマ・リンパ',
      icon: Flower2,
      color: 'pink',
      badge: 'オイルケア / 極上リラクゼーション',
      targetPain: '脚や顔のむくみ、冷え、日々の過度なストレス、自律神経の乱れ、肌の乾燥',
      services: '天然精油を用いた全身アロマトリートメント、深層リンパドレナージュ、デトックスオイルケア',
      whyEssential: '女性ユーザーの高リピート率と満足度を牽引。自宅が高級スパに変わる非日常体験で客単価が高く、口コミ拡散の原動力となります。',
      priceRange: '¥7,500〜¥13,000 / 70分',
      targetCustomer: '働く女性、美容意識の高い層、ご褒美ケア需要',
    },
    {
      category: 'カイロ・骨盤矯正',
      icon: Bone,
      color: 'indigo',
      badge: 'アライメント調整 / 姿勢改善',
      targetPain: '猫背、ストレートネック、産後骨盤の歪み、左右の足の長さの違い、姿勢悪化による外見悩み',
      services: '骨盤矯正、脊椎アライメント調整、姿勢写真ビフォーアフター分析、日常生活の姿勢指導',
      whyEssential: 'ビフォーアフターの変化が視覚的にわかりやすく、SNSや紹介による新規獲得が強い。産後骨盤ケアで助産師との強力な連携シナジーを発揮。',
      priceRange: '¥6,500〜¥10,000 / 50分',
      targetCustomer: '産後女性、姿勢が気になる若年層〜ビジネスパーソン',
    },
    {
      category: 'ドライヘッドスパ',
      icon: HeartPulse,
      color: 'purple',
      badge: '脳疲労回復 / 睡眠改善',
      targetPain: '睡眠の質低下（眠りが浅い・不眠）、デスクワークの脳疲労、眼精疲労、側頭筋・首すじの張り',
      services: '水を使わない無水ヘッドマッサージ、側頭筋・後頭下筋群の深層リリース、首肩デコルテほぐし',
      whyEssential: '「服を着たまま、省スペースでベッド不要」という出張の圧倒的相性の良さ。オフィス訪問やホテル出張、スキマ時間の利用に最適です。',
      priceRange: '¥5,500〜¥8,500 / 45分',
      targetCustomer: 'ビジネスパーソン、不眠に悩む全世代、経営者・エグゼクティブ',
    },
    {
      category: 'エステティシャン / 美容セラピスト',
      icon: Sparkles,
      color: 'pink',
      badge: '美肌・フェイシャル / ブライダル',
      targetPain: '毛穴・くすみ・たるみ、ブライダル前の集中痩身、子育てや仕事でサロンに通えない美容ニーズ',
      services: '美白フェイシャル、毛穴クレンジング、小顔リンパリフト、ブライダルデコルテ＆背中トリートメント',
      whyEssential: '自費マッチングの中で最も客単価が高くリピート率も抜群。自宅が高級エステサロンに変わる感動体験で、女性ユーザーの定着を強力に牽引します。',
      priceRange: '¥8,500〜¥15,000 / 70分',
      targetCustomer: '美容意識の高い女性、ブライダル層、外出が難しい子育て中のママ',
    },
    {
      category: 'パーソナルトレーナー / 運動コーチ',
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

  return (
    <div className="space-y-8 pb-16">
      {/* 画面トップ: ビュー切り替えタブ & 上申用印刷ボタン */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('proposal')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeView === 'proposal'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>【経営上申資料】専門職パートナー拡大構想</span>
          </button>
          <button
            onClick={() => setActiveView('operations')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeView === 'operations'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>管理者向け 運用・操作マニュアル</span>
          </button>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-200 shadow-2xs transition"
          title="経営会議・上長報告用にA4形式で印刷またはPDF保存できます"
        >
          <Printer className="w-4 h-4 text-emerald-600" />
          <span>上申資料を印刷 / PDF保存</span>
        </button>
      </div>

      {activeView === 'proposal' ? (
        /* ========================================================
           経営上申・事業戦略提案書 (Proposal View)
           ======================================================== */
        <div className="space-y-10">
          {/* 表紙・エグゼクティブサマリー */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 relative overflow-hidden">
            {/* 装飾背景 */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30">
                  Business Strategy Proposal
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  対象: 経営陣・事業推進責任者・提携パートナー各位
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                専門職パートナー網の拡充による<br />
                『全世代・家庭密着型ウェルネスプラットフォーム』構築構想
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed pt-1">
                単なる出張リラクゼーションの枠組みを超え、理学療法士・作業療法士・言語聴覚士・歯科衛生士・助産師・管理栄養士・鍼灸師などの医療・ヘルスケア国家資格者を包括。制度保険の隙間を埋める自費ヘルスケア市場を制覇し、世帯単位でのクロスセルと圧倒的なLTV向上を実現する事業戦略上申書です。
              </p>

              {/* 3大コアバリュー指標 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="text-[11px] text-slate-400 font-bold">顧客単価 (ARPU)</div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">1.8〜2.5倍</div>
                  <p className="text-[11px] text-slate-400 mt-1">専門資格による付加価値で高客単価（¥8,000〜¥14,000）を確立</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="text-[11px] text-slate-400 font-bold">継続利用率 (LTV向上)</div>
                  <div className="text-xl sm:text-2xl font-black text-sky-400 mt-1">85〜92%</div>
                  <p className="text-[11px] text-slate-400 mt-1">「気晴らし」から「生活維持・健康管理」の習慣化による定期契約化</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="text-[11px] text-slate-400 font-bold">世帯クロスセル率</div>
                  <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">3.2人/世帯</div>
                  <p className="text-[11px] text-slate-400 mt-1">産後ママ・祖父母・ビジネスパーソン・子どもを1つのアプリで包括</p>
                </div>
              </div>
            </div>
          </div>

          {/* セクション 1: なぜ専門職の拡充が「全体の顧客拡大」に直結するのか？ (4大レバレッジ) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-black uppercase text-emerald-600 tracking-wider">Strategic Advantage</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                1. なぜ専門職の追加がプラットフォーム全体の顧客基盤を爆発的に拡大させるのか？
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                一般的なマッチングアプリが直面する「単身利用・低頻度・価格競争」の壁を打ち破る、4つの強力な成長エンジンです。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* エンジン 1: 世帯丸ごと顧客化 */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs">
                  <Network className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">① ファミリー・クロスセル（世帯単位でのアカウント獲得）</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  従来のリラクゼーションは個人完結型でした。しかし、<strong>助産師（産後ケア）</strong>や<strong>歯科衛生士（訪問口腔ケア）</strong>、<strong>理学療法士（歩行リハビリ）</strong>が加わることで、家族内での紹介が連鎖します。
                </p>
                <div className="p-3 bg-white/80 rounded-xl border border-emerald-200/60 text-[11px] text-emerald-950 font-medium">
                  <strong>💡 獲得シナリオ:</strong> 産後ケアで「助産師」を呼んだママが、足腰の弱った同居の親に「理学療法士・歯科衛生士」を手配し、夫は休日に「もみほぐし」、子どもは「弱視トレーニング」を利用。1アカウントの世帯課金額が最大化します。
                </div>
              </div>

              {/* エンジン 2: 制度保険の「隙間」を埋める未開拓巨大市場 */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-xs">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">② 制度保険外「自費リハビリ・自費ヘルスケア」市場の制覇</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  医療保険のリハビリは発症から150〜180日で打ち切られ、介護保険の枠も限度額で埋まっています。「もっと専門的なリハビリやケアを受けたいが、受けられない」という<strong>自費ヘルスケア難民は全国で数百万人規模</strong>に達しています。
                </p>
                <div className="p-3 bg-white/80 rounded-xl border border-blue-200/60 text-[11px] text-blue-950 font-medium">
                  <strong>💡 競争優位:</strong> 病院や既存介護事業所は保険外自費サービスの提供が制度上困難です。当アプリがその受け皿となることで、競合不在のまま優良顧客を独占獲得できます。
                </div>
              </div>

              {/* エンジン 3: 高い参入障壁と信頼性ブランド */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/70 to-pink-50/40 border border-purple-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">③ 圧倒的な社会的信頼性とアライアンス可能性（Moat）</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  国家資格保持者を厳格に審査・承認する仕組みを持つことで、怪しい出張サービスとは一線を画す「医療・福祉インフラとしてのブランド」を確立できます。
                </p>
                <div className="p-3 bg-white/80 rounded-xl border border-purple-200/60 text-[11px] text-purple-950 font-medium">
                  <strong>💡 提携効果:</strong> 地域のクリニック、産婦人科、地域包括支援センターからの公認紹介や、企業の健康経営・福利厚生（EAP）としての包括導入が実現可能になります。
                </div>
              </div>

              {/* エンジン 4: 専門職間の「相互送客」によるLTV最大化 */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/40 border border-amber-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black shadow-xs">
                  <LineChart className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">④ 専門職間の相互レコメンド（インターディシプリナリー連携）</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  顧客の身体課題は1つではありません。施術者が他職種を自然に提案（例: 整体師が自律神経の乱れに「鍼灸」を推奨、助産師が離乳食の悩みに「管理栄養士」を案内）することで、プラットフォーム内で顧客が循環します。
                </p>
                <div className="p-3 bg-white/80 rounded-xl border border-amber-200/60 text-[11px] text-amber-950 font-medium">
                  <strong>💡 離脱防止:</strong> 「ここに来れば体のあらゆる悩みがすべて解決する」というワンストップ性を確立し、他社サービスへの流出を恒久的に防ぎます。
                </div>
              </div>
            </div>
          </div>

          {/* セクション 2: 全専門職のニーズと提供サービス詳細マトリクス */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-black uppercase text-emerald-600 tracking-wider">Service Matrix</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  2. 各専門職が解決する具体的ニーズと提供価値マトリクス（全17領域）
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  顧客が「誰に・どんな悩みを・いくらで依頼できるのか」を明確化し、各領域での収益インパクトを実証します。
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-full text-slate-600 self-start sm:self-auto">
                登録カテゴリ: 全17専門職網羅
              </span>
            </div>

            {/* スペシャリストカード一覧 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {specialists.map((sp, idx) => {
                const Icon = sp.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* 上部: アイコン & 職種名 & バッジ */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-2xs shrink-0">
                            <Icon className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-black text-base text-slate-900">{sp.category}</h3>
                            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 mt-0.5 inline-block">
                              {sp.badge}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 font-bold block">想定単価</span>
                          <span className="text-xs font-black text-slate-800">{sp.priceRange}</span>
                        </div>
                      </div>

                      {/* 顧客ニーズ・課題 */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 block">
                          ▼ 顧客の具体的ニーズ・痛み
                        </span>
                        <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/70 leading-relaxed">
                          {sp.targetPain}
                        </p>
                      </div>

                      {/* 提供サービス内容 */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                          ▼ 提供サービス・アプローチ
                        </span>
                        <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/70 leading-relaxed">
                          {sp.services}
                        </p>
                      </div>
                    </div>

                    {/* 事業的不可欠性 (Why Essential) */}
                    <div className="pt-3 border-t border-slate-200/80 bg-emerald-50/60 -mx-5 -mb-5 p-4 rounded-b-3xl">
                      <span className="text-[10px] font-black text-emerald-800 uppercase block">
                        ★ プラットフォーム全体の成長への寄与
                      </span>
                      <p className="text-[11px] text-emerald-950 mt-0.5 leading-relaxed font-medium">
                        {sp.whyEssential}
                      </p>
                      <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1 font-bold">
                        <Target className="w-3.5 h-3.5 text-slate-400" />
                        <span>主要顧客層: {sp.targetCustomer}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* セクション 3: 収益モデルと事業成長ロードマップ */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-black uppercase text-emerald-600 tracking-wider">Business Projection</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                3. プラットフォーム収益モデルと段階的展開ロードマップ
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                地方都市でのモデル確立から、全国主要都市へのスケールアウトを見据えた成長戦略です。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                  フェーズ 1 (基盤確立)
                </span>
                <h4 className="font-bold text-sm text-slate-900">愛媛・四国モデルの完全確立</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  松山市および周辺都市で専門職50名・提携サロン20店舗体制を構築。助産師・PT・歯科衛生士の口コミにより主婦・ファミリー層の基盤を完成。
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                  フェーズ 2 (政令都市展開)
                </span>
                <h4 className="font-bold text-sm text-slate-900">福岡・広島・関西圏への水平展開</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  確立された審査・マッチング・決済オペレーションをパッケージ化し、人口密集地域へ展開。自費リハビリ難民の多い大都市圏で爆発的なトラフィックを獲得。
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                  フェーズ 3 (BtoB・全国インフラ化)
                </span>
                <h4 className="font-bold text-sm text-slate-900">企業福利厚生・自治体包括連携</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  企業の健康経営銘柄取得支援としての導入、自治体の産後ケア補助金チケット対応など、官民連携のヘルスケアインフラとして全国網を完成。
                </p>
              </div>
            </div>

            {/* 収益シミュレーション試算表 */}
            <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-3">
              <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>プラットフォーム収益試算 (月間1,000件成約時)</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">月間予約件数</span>
                  <strong className="text-base font-black text-white">1,000 件</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">平均客単価</span>
                  <strong className="text-base font-black text-white">¥9,500</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">月間総取扱高 (GMV)</span>
                  <strong className="text-base font-black text-white">¥9,500,000</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">プラットフォーム手数料 (20%)</span>
                  <strong className="text-base font-black text-emerald-400">¥1,900,000 /月</strong>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-700">
                ※ 専門職の参入により客単価が従来（¥6,000）から約1.6倍に上昇し、同一成約件数でも手数料収入が大幅に拡大します。
              </p>
            </div>
          </div>

          {/* セクション 4: 経営陣への上申・決裁要請まとめ */}
          <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Conclusion & Action Plan</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              結論: 専門職パートナー網の拡大は、当社のプラットフォームを「地域唯一無二のヘルスケア・インフラ」へ昇華させる最重要成長レバーです。
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              本構想の推進により、ユーザーにとっては「生涯頼れる健康の伴走者」、施術者にとっては「資格を活かして高所得と柔軟性を両立できるプラットフォーム」を提供し、高い参入障壁と持続可能な高収益モデルを確立いたします。
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 bg-white text-emerald-900 text-xs font-black rounded-xl hover:bg-emerald-50 transition shadow-md flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>この資料を印刷・提出する</span>
              </button>
              <Link
                href="/admin"
                className="px-5 py-2.5 bg-emerald-800 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition border border-emerald-700"
              >
                管理コンソールへ戻る
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================
           管理者向け 実務運用マニュアル (Operations View)
           ======================================================== */
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
              <span className="text-xs uppercase font-bold tracking-widest text-purple-400">
                Role: Admin Operations Manual
              </span>
            </div>
            <h2 className="text-2xl font-black mt-2">
              プラットフォーム統括 実務運用マニュアル
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {currentBrand.japaneseName} ({currentBrand.name}) の全体運営、セラピスト・専門職の資格審査・承認、全予約トランザクション監視、決済・売上分配、および手数料率設定に関する公式手順書です。
            </p>
          </div>

          {/* 運用手順カード一覧 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. 審査承認 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">1. セラピスト・専門職の登録審査・承認フロー</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                新規登録された施術者は初期状態で「未承認（非公開）」です。管理者は国家資格証（PT/OT/ST/助産師/鍼灸等）や身元確認書類を確認し、管理画面の承認トグルスイッチで公開状態へ切り替えます。
              </p>
              <div className="p-3 bg-purple-50 rounded-2xl text-[11px] text-purple-900 font-medium">
                💡 承認された施術者のみが顧客画面や地図上にピンとして表示されます。
              </div>
            </div>

            {/* 2. 予約監視 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">2. 全予約トランザクション監視と強制キャンセル</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                出張・店舗の全予約ステータス（承認待ち・確定・完了・キャンセル）をリアルタイムで追跡。無断キャンセルや顧客都合のトラブル時には、管理者権限で即時全額返金キャンセルを実行できます。
              </p>
              <div className="p-3 bg-emerald-50 rounded-2xl text-[11px] text-emerald-900 font-medium">
                💡 全ての売上は「総決済額」「プラットフォーム手数料」「施術者手取り」に自動計算されます。
              </div>
            </div>

            {/* 3. 手数料設定 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                <Percent className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">3. プラットフォーム手数料率（Take Rate）の動的変更</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                業界標準（通常20%）に合わせた手数料率スライダーを備えており、変更内容は新規予約から自動適用されます（例: 初期誘致キャンペーン時に15%へ引き下げ等）。
              </p>
            </div>

            {/* 4. ブランド切り替え */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">4. アプリ名・ブランドロゴ・ファビコン切り替え</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                管理画面の「ブランド設定」タブから、ワンタップでアプリ名（ケアゴー、ケアリアゴー、セラリンク等）とアイコン、ブラウザタブファビコンを即時切り替えることができます。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

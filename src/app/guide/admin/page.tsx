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

  // 5分プレゼン・スライド構成データ
  const presentationSlides = [
    {
      id: 1,
      title: '専門技術が、もっと自由に届く場所へ。',
      subTitle: `国家資格者＆ウェルネスプロのためのオンデマンド・ヘルスケア「${currentBrand.japaneseName}」`,
      timeRange: '00:00 〜 00:30',
      durationSec: '30秒',
      layoutType: 'ヒーロー型（インパクト全面・センター配置）',
      objective: '聴衆（400名の専門職候補者）の関心を引き込み、本日の5分間で何が得られるかを明快に提示する。',
      audienceState: '「どんなアプリなんだろう？」「自分に関係があるのかな？」という興味・観察フェーズ',
      slideBulletedPoints: [
        '病院やサロンの「場所・組織の壁」を超える新しい働き方',
        'スマホ1台で、あなたの得意な時間・エリアでダイレクトに施術',
        '理学療法士・助産師・鍼灸・エステ等、全17分野の専門職パートナーを募集',
        '初期費用・月額固定費完全 0 円でリスクなく始められる',
      ],
      scriptText: `「みなさん、こんにちは。本日はお集まりいただきありがとうございます。
いま、この会場には理学療法士や助産師、鍼灸・マッサージ師、エステティシャンなど、人の心と身体を支える約400名ものプロフェッショナルの方々がいらっしゃいます。

今日お話しするのは、皆さんが培ってきた確かな専門技術を、病院やサロンという『枠』を超えて、いま本当にケアを求めている地域の生活者へダイレクトに届ける新しい仕組み――『${currentBrand.japaneseName}』についてです。

わずか5分間ですが、皆さんのこれからの働き方の選択肢が大きく広がるお話をさせていただきます。どうぞリラックスしてお聞きください。」`,
      tips: '第一声は明るく堂々と。400人の目を見渡しながら「みなさんのための仕組みです」というメッセージを届けます。',
      visualBadge: 'SLIDE 01 / OPENING',
    },
    {
      id: 2,
      title: 'なぜ今、このプロジェクトなのか？',
      subTitle: '「施設・店舗の制約」と「届かないケア難民」の深いギャップを埋める',
      timeRange: '00:30 〜 01:15',
      durationSec: '45秒',
      layoutType: '左右2カラム対比型（現状の課題 ⇄ プロジェクトの意図）',
      objective: '「なぜこのアプリが必要なのか？」という社会的意義（Why）を共有し、共感と誇りを生み出す。',
      audienceState: '「確かに現場でそういうジレンマを感じていた」「自分の技術をもっと役立てたい」と強く共鳴する',
      slideBulletedPoints: [
        '【課題①】医療保険の日数制限（150/180日ルール）による退院後リハビリ難民の急増',
        '【課題②】産後直後の外出困難な母子や、通院できず我慢している慢性痛・シニア層',
        '【課題③】専門職の独立・副業における高額なテナント料・広告費の壁',
        '【意図】プロの技術を眠らせず、店舗不要で地域住民へ直結させるインフラを創る',
      ],
      scriptText: `「日々の現場で、こんなもどかしさを感じたことはありませんか？
『保険の日数制限が切れてしまい、まだリハビリが必要なのに退院せざるを得ない患者さん』や、
『産後で外出できず、誰にも頼れず一人で泣いているお母さん』。

一方で、『自分の腕で独立したい、もっと自由に働きたい』と思っても、サロンや店舗を借りるには敷金や内装で何百万円もかかり、集客の不安もある。

確かな技術を持つ『プロフェッショナル』と、ケアを渇望している『地域の人々』がこんなにもいるのに、場所と仕組みの壁に阻まれています。

私たちのプロジェクトの意図は極めてシンプルです。
専門職が多額の借金やリスクを背負うことなく、スマホ1台で地域に飛び出し、必要としている人のもとへ駆けつけられる――そんな新しいインフラをつくることです。」`,
      tips: '「もどかしさ」を語る時は落ち着いたトーンで、プロジェクトの意図を語る時は前向きで力強いトーンに切り替えます。',
      visualBadge: 'SLIDE 02 / WHY & MISSION',
    },
    {
      id: 3,
      title: '登録者にとっての3大メリット',
      subTitle: '空き時間×得意エリアで、あなたのスキルを最大化する',
      timeRange: '01:15 〜 02:15',
      durationSec: '60秒',
      layoutType: '3カラム・カードグリッド（特徴 × 直感操作 × 高還元）',
      objective: '「実際に登録したらどう働くのか？」の具体イメージを湧かせ、心理的ハードルを一気に下げる。',
      audienceState: '「これなら自分でもできる！」「今の仕事と両立できるかも」と前向きな意欲が湧く',
      slideBulletedPoints: [
        '①【完全自由な働き方】出張エリア半径（km単位）・稼働日時・メニュー・料金を自分で設定',
        '②【スマホ1台で完結】予約受付・顧客チャット・GPS出張ナビ・施術報告までワンタップ',
        '③【初期・月額 0 円】固定費ゼロ＆業界高水準の還元率。事前カード決済で未回収リスクなし',
      ],
      scriptText: `「では、実際に登録するとどう働くのか？ 特徴は大きく3つあります。

1つ目は『完全な自由』です。出張エリアは何キロ圏内に限定するか、週に何回・何時から働くか、メニューや料金をいくらにするかはすべて皆さんが決められます。本業の休日に週1回・2時間だけ、といった働き方も大歓迎です。

2つ目は『スマホ1台で完結する使いやすさ』です。予約リクエストの承認から、出張先への地図案内、到着予定時間の自動通知、施術後のカルテ・完了報告まで、すべてアプリが直感的にナビゲートします。面倒な事務作業はありません。

3つ目は『初期費用・月額費用は完全0円』という点です。固定費は一切かかりません。さらに、お客様の決済はアプリ上で事前にクレジットカードで行われるため、現金のやり取りも、ドタキャンによる未回収の心配も仕組み上ゼロです。」`,
      tips: '指を1・2・3と立てながらリズミカルに解説。「週1回・2時間だけでも大歓迎」という言葉が400名の参加ハードルを劇的に下げます。',
      visualBadge: 'SLIDE 03 / KEY FEATURES',
    },
    {
      id: 4,
      title: 'プロを守る「4つの安心と配慮」',
      subTitle: '見知らぬ場所への出張や個人活動の不安を、仕組みで徹底ガード',
      timeRange: '02:15 〜 03:15',
      durationSec: '60秒',
      layoutType: '4マトリクス・セーフティシールド配置（信頼・安全設計）',
      objective: '「出張は安全なの？」「変なお客さんが来たら？」という最大の不安を先回りして払拭する。',
      audienceState: '「ここまで安全対策されているなら安心だ」「運営や管理者のサポート体制があるのは心強い」と確信に変わる',
      slideBulletedPoints: [
        '🛡【国家資格・身元の100%事前審査】プロとしての信頼とプラットフォーム全体の品位を担保',
        '🛡【セラピストを守る相互評価】悪質顧客の即時利用停止、住所の直前限定開示、緊急SOS',
        '🛡【事前カード与信確保】施術直前の理不尽なキャンセル時もキャンセル料を自動回収・補償',
        '🛡【地域運営スタッフの伴走】（★）専任の地域管理者が日常のトラブル対応や審査をバックアップ',
      ],
      scriptText: `「ここで、『出張や個人での活動は、安全面がちょっと心配…』と感じる方もいらっしゃると思います。
ご安心ください。私たちはプロの皆さんが安心して施術に集中できるよう、徹底した配慮を講じています。

まず、登録者全員の国家資格証や本人確認書類を運営が厳格に事前審査し、プラットフォーム全体の信頼とブランドを守ります。

次にお客様とのトラブル防止です。お客様の住所は予約が確定するまで非公開ですし、相互レビュー機能によりマナーの悪い顧客はシステムが即座に排除します。

さらに、料金は予約時にカードの事前与信枠を確保するため、『施術したのにお金がもらえない』ということは絶対に起きません。無断キャンセルでも規定通りの報酬が補償されます。

そして本日お集まりの方の中には将来『管理・運営側』に回るリーダー候補の方もいらっしゃいますが、地域の管理スタッフがバックオフィスとして皆様の日常を強力に支えます。」`,
      tips: '400名の中の「不安そうな表情」をしている人に視線を合わせながら、ゆっくり落ち着いて安心感を伝えます。一部の管理者候補への目配せも自然に入れます。',
      visualBadge: 'SLIDE 04 / TRUST & SAFETY',
    },
    {
      id: 5,
      title: 'このプロジェクトが拓く「未来のヘルスケア」',
      subTitle: '単なるマッチングを超え、多職種連携と地域包括ケアの基盤へ進化する',
      timeRange: '03:15 〜 04:00',
      durationSec: '45秒',
      layoutType: '3ステップ・ロードマップ（成長とキャリアの未来絵図）',
      objective: 'アプリの将来性とスケール感を伝え、参加することへのワクワク感とキャリアの広がりを感じてもらう。',
      audienceState: '「単なる一過性のアプリじゃない」「将来的に色んな専門職と繋がれて面白そう」と期待が膨らむ',
      slideBulletedPoints: [
        '【STEP 1 / 現在】17領域の専門職が地域ごとに集結し、顔の見える出張ケア網を確立',
        '【STEP 2 / 展開】「PT×管理栄養士」「助産師×骨盤ケア」等の多職種連携パッケージ＆企業福利厚生導入',
        '【STEP 3 / キャリア】プレイヤーから地域を束ねる「エリア統括ディレクター・品質管理者」へのステップアップ',
      ],
      scriptText: `「このプロジェクトは、単なる『施術のマッチングアプリ』では終わりません。

現在、理学療法士から助産師、エステティシャンまで17の専門領域のプロフェッショナルが続々と集まっています。
次のフェーズでは、例えば『理学療法士のリハビリ』と『管理栄養士の食事指導』がセットになったり、『助産師のケア』と『産後骨盤矯正』が連携したりする、多職種連携パッケージをアプリ上で展開していきます。企業の福利厚生や自治体連携も視野に入っています。

さらに、今日ご参加の熱意ある方の中には、施術者としての活躍にとどまらず、地域のエリアマネージャーや審査・品質管理といった『プラットフォーム運営・管理側』のリーダーとしてキャリアを広げていただく道も大きく用意しています。」`,
      tips: 'ワクワクする未来像を語るスライド。「多職種連携」「管理側へのキャリア」というキーワードを際立たせます。',
      visualBadge: 'SLIDE 05 / FUTURE VISION',
    },
    {
      id: 6,
      title: 'あなたの専門性が、誰かの希望になる。',
      subTitle: '登録・掲載は完全無料。リスクゼロで新しい一歩を踏み出しましょう',
      timeRange: '04:00 〜 04:45',
      durationSec: '45秒',
      layoutType: 'CTA・コンバージョン型（簡単3ステップ ＋ 行動喚起 ＋ 相談窓口）',
      objective: '聴衆400名の背中を押し、今すぐ無料登録または相談へとアクションを起こさせる。',
      audienceState: '「リスクもないし、まずは登録してみよう」「後で質問に行ってみよう」と行動に移る',
      slideBulletedPoints: [
        '【ステップ①】スマホから専用フォームで基本情報・資格を入力（所要3分）',
        '【ステップ②】運営事務局による資格確認＆パートナーアカウント発行（最短即日）',
        '【ステップ③】自分のペースで受付可能日時を設定し、無理なくスタート！',
        '★エリア管理・運営参画にご関心のある方は、終了後に個別相談デスクへ',
      ],
      scriptText: `「皆さんがこれまでのキャリアで磨いてきた専門技術や真心は、地域の中でいまこの瞬間も困っている方々にとって、かけがえのない希望です。

登録や掲載には一切費用はかかりません。リスクは完全にゼロです。
まずは今、お手元のスマートフォンから先行パートナー登録をしてみてください。登録したからといって毎日稼働する必要はありません。月に数回、週に数時間から、ご自身のペースで始められます。

また、『地域の運営やマネジメント、管理業務にも興味がある』という方は、発表終了後にぜひ私や運営スタッフにお声がけいただくか、アンケートの管理希望欄にチェックをお願いします。

ご自身の可能性を広げる新しい一歩を、ぜひ私たちと一緒に踏み出しましょう。ご清聴ありがとうございました！」`,
      tips: '最後のスライド。会場全体へ語りかけ、深々とお辞儀。「登録は完全無料・リスクゼロ」を最後にもう一度印象づけます。',
      visualBadge: 'SLIDE 06 / CALL TO ACTION',
    },
    {
      id: 7,
      title: 'Q&A / よくあるご質問 ＆ 個別相談',
      subTitle: '疑問点や不安な点はお気軽にご相談ください',
      timeRange: '04:45 〜 05:00',
      durationSec: '15秒〜質疑',
      layoutType: 'FAQ・対話型カードレイアウト（安心のQ&Aまとめ）',
      objective: '質疑応答中の投影用。副業規定、損害補償、稼働ノルマなしなどの疑問に即答できる状態を作る。',
      audienceState: '具体的な質問が出やすくなり、個別相談への導入がスムーズになる',
      slideBulletedPoints: [
        'Q. 病院やサロンに勤務中ですが、副業として登録できますか？ ➔ A. 稼働日時は自由選択のため、休日や空き時間のみで活動可能です',
        'Q. 施術中の万が一の事故に対する補償は？ ➔ A. 包括的な損害賠償保険制度の連携ガイドを用意しています',
        'Q. 月の最低稼働ノルマなどはありますか？ ➔ A. ノルマは一切ありません。休止や再開もアプリからいつでも自由です',
        'Q. 管理する側に回りたい場合のステップは？ ➔ A. 専門資格と地域貢献への意欲をお持ちの方を対象に、個別面談を実施しています',
      ],
      scriptText: `「ご質問のある方は挙手いただくか、発表終了後に会場内のスタッフまでお気軽にお声がけください。
また、スライドに記載の通り、副業での活動やノルマの有無、管理・運営への参画についてのご相談も随時受け付けております。どうぞよろしくお願いいたします。」`,
      tips: 'スクリーンに投影したまま、会場からの質問を受け付けるか、個別相談へ促します。',
      visualBadge: 'SLIDE 07 / Q&A & CONTACT',
    },
  ];

  // 全スライドのテキストをクリップボードにコピー
  const handleCopyAll = () => {
    const text = presentationSlides
      .map(
        (s) =>
          `========================================\n【スライド ${s.id}】${s.title}\n時間目安: ${s.timeRange} (${s.durationSec})\nレイアウト形式: ${s.layoutType}\nサブタイトル: ${s.subTitle}\n\n■ 投影箇条書き:\n${s.slideBulletedPoints.map((p) => `・${p}`).join('\n')}\n\n■ トークスクリプト（口頭原稿）:\n${s.scriptText}\n\n■ 発表のコツ:\n${s.tips}\n`
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
    const text = `【スライド ${slide.id}】${slide.title}\n時間目安: ${slide.timeRange} (${slide.durationSec})\nレイアウト: ${slide.layoutType}\nサブタイトル: ${slide.subTitle}\n\n■ 投影箇条書き:\n${slide.slideBulletedPoints.map((p) => `・${p}`).join('\n')}\n\n■ トークスクリプト:\n${slide.scriptText}\n\n■ コツ:\n${slide.tips}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedSlide(slide.id);
      setTimeout(() => setCopiedSlide(null), 2000);
    }
  };

  // 全17専門職のニーズ・提供サービス・市場価値マトリクス
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
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Presentation className="w-4 h-4 text-emerald-200" />
            <span>🎤 5分ピッチ構成案 (400名対象)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 font-bold">
              新設
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
          VIEW 1: 5分プレゼンテーション構成案 (400名向けピッチ)
         ======================================================== */}
      {activeView === 'presentation' && (
        <div className="space-y-10">
          {/* プレゼン・サマリーカード */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 relative overflow-hidden print-avoid-break">
            <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  5-Minute Presentation Kit
                </span>
                <span className="text-xs sm:text-sm text-slate-400 font-bold">
                  対象: 登録候補者 約400名（理学療法士・助産師・鍼灸・エステ等）＋ 管理者候補
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug">
                {currentBrand.japaneseName} 5分プレゼンテーション構成案<br />
                <span className="text-emerald-400 text-xl sm:text-2xl font-bold">
                  プロジェクトの意図・特徴・配慮・未来をシンプルに伝える全スライド設計
                </span>
              </h1>

              <p className="text-sm sm:text-base text-emerald-100/90 max-w-3xl leading-relaxed font-normal">
                本ページは、実際のプレゼンテーションファイル（PowerPoint / Keynote / Googleスライド）を作成・発表するための完全な設計書です。
                各スライドの<strong>「投影テキスト（箇条書き）」「推奨レイアウトのビジュアル概要」「そのまま話せるトークスクリプト（口頭原稿）」</strong>を完備しています。
              </p>

              {/* プレゼン仕様 KPI & タイマーツール */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-300 font-medium">
                  <div>
                    <span className="text-slate-400 block text-xs">発表持ち時間</span>
                    <strong className="text-white font-bold flex items-center gap-1 text-sm sm:text-base">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      5分00秒 (300秒)
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">スライド総数</span>
                    <strong className="text-emerald-400 font-bold text-sm sm:text-base">全6枚 + 予備1枚</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">主眼テーマ</span>
                    <strong className="text-white font-bold">プロジェクトの意図 ＆ 特徴・配慮・未来</strong>
                  </div>
                </div>

                {/* 練習用タイマー ＆ 一括コピーボタン */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl">
                    <span className="text-xs text-slate-400 font-mono">練習タイマー:</span>
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
                    title="すべてのスライドのテキスト・スクリプトを一括コピーします"
                  >
                    {copiedAll ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedAll ? '全原稿コピー完了！' : '全原稿を一括コピー'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 5分タイムライン進行バー（全体の流れを視覚化） */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <span>5分間のストーリーライン（時間配分と構成）</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  1スライドあたり約30〜60秒。無駄を省き、意図 ➔ 特徴 ➔ 配慮 ➔ 未来 ➔ アクションへと自然に繋がる黄金比です。
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full self-start sm:self-auto">
                合計 300 秒（5分ジャスト設計）
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
              {presentationSlides.slice(0, 6).map((s, idx) => (
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
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-emerald-700">スライド {s.id}</span>
                      <span className="text-slate-400 font-mono">{s.durationSec}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">{s.title}</div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-200/60">
                    {s.timeRange}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 各スライドの詳細カード（レイアウト画像・テキスト・トークスクリプト） */}
          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
                  <Layers className="w-6 h-6 text-emerald-600" />
                  <span>各スライドのレイアウト画像・テキスト・発表原稿</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  実際のプレゼン作成時にそのまま投影できるレイアウト画面イメージと、壇上でそのまま読めるスクリプトを掲載しています。
                </p>
              </div>
            </div>

            {presentationSlides.map((slide, index) => (
              <div
                key={slide.id}
                id={`slide-${slide.id}`}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden print-avoid-break transition hover:shadow-md"
              >
                {/* スライドヘッダーバー */}
                <div className="p-4 sm:px-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm tracking-wider">
                      SLIDE {slide.id}
                    </span>
                    <div>
                      <h3 className="font-black text-sm sm:text-base text-white">{slide.title}</h3>
                      <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                        <span className="text-emerald-400 font-mono flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {slide.timeRange} ({slide.durationSec})
                        </span>
                        <span>•</span>
                        <span className="text-slate-300">レイアウト: {slide.layoutType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopySingle(slide)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
                      title="このスライドのテキストとトーク原稿をコピー"
                    >
                      {copiedSlide === slide.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">コピー済</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>原稿をコピー</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-8">
                  {/* ========================================================
                      1. 使用するレイアウトの画像・視覚的スライドモックアップ
                     ======================================================== */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5 uppercase tracking-wider text-slate-600">
                        <Presentation className="w-4 h-4 text-emerald-600" />
                        【投影スライド・レイアウト画像イメージ（16:9 プレビュー）】
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md text-[11px]">
                        {slide.layoutType}
                      </span>
                    </div>

                    {/* スライドモックアップ本体 (16:9比率のアスペクト枠) */}
                    <div className="w-full aspect-[16/9] max-h-[460px] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-2xl p-5 sm:p-8 text-white flex flex-col justify-between shadow-inner relative overflow-hidden border border-slate-800 select-none">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                      {/* スライド内ヘッダー */}
                      <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-md overflow-hidden shrink-0 shadow-sm"
                            dangerouslySetInnerHTML={{ __html: currentBrand.iconSvg }}
                          />
                          <span className="text-xs sm:text-sm font-black tracking-wider text-emerald-300">
                            {currentBrand.japaneseName}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono tracking-widest">
                          {slide.visualBadge}
                        </div>
                      </div>

                      {/* スライド内メインコンテンツ（各スライド固有のレイアウト） */}
                      <div className="relative z-10 my-auto py-2">
                        {/* スライド 1: ヒーロー型（インパクト全面配置） */}
                        {slide.id === 1 && (
                          <div className="text-center space-y-4 max-w-2xl mx-auto">
                            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-xs font-bold border border-emerald-500/30">
                              Healthcare & Wellness Professional Platform
                            </span>
                            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                              あなたの専門技術が、<br />
                              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                                もっと自由に届く場所へ。
                              </span>
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl mx-auto leading-relaxed">
                              理学療法士・助産師・鍼灸・マッサージ・エステ等、プロフェッショナルのための新しい働き方
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[10px] sm:text-xs text-emerald-300 font-bold">
                              <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">#完全自由なシフト</span>
                              <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">#店舗・固定費ゼロ</span>
                              <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">#高還元・即時性</span>
                              <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">#安心の安全設計</span>
                            </div>
                          </div>
                        )}

                        {/* スライド 2: 左右2カラム対比型（現状の課題 ⇄ プロジェクトの意図） */}
                        {slide.id === 2 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 items-stretch">
                            <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-3 sm:p-4 space-y-2">
                              <div className="flex items-center gap-1.5 text-rose-400 text-xs sm:text-sm font-black">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>【現状の課題】届かないケア難民</span>
                              </div>
                              <ul className="text-[10px] sm:text-xs text-rose-100/90 space-y-1.5 leading-relaxed">
                                <li>• 保険日数制限（150/180日）による退院後リハビリ難民</li>
                                <li>• 産後外出できず孤独に悩むワンオペ育児世帯</li>
                                <li>• 店舗開業の高額なテナント・固定費・集客リスク</li>
                              </ul>
                            </div>

                            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 sm:p-4 space-y-2">
                              <div className="flex items-center gap-1.5 text-emerald-400 text-xs sm:text-sm font-black">
                                <Sparkles className="w-4 h-4 shrink-0" />
                                <span>【私たちが創る未来】意図とミッション</span>
                              </div>
                              <ul className="text-[10px] sm:text-xs text-emerald-100/90 space-y-1.5 leading-relaxed">
                                <li>• スマホ1台で、あなたの空き時間に直接ケアを提供</li>
                                <li>• 店舗を持たず、高い還元率で正当な対価を獲得</li>
                                <li>• 地域の隅々までプロの技術を届ける新インフラ</li>
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* スライド 3: 3カラム・カードグリッド（特徴 × 直感操作 × 高還元） */}
                        {slide.id === 3 && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
                            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-1.5 text-center sm:text-left">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black mx-auto sm:mx-0">
                                <Compass className="w-4 h-4" />
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-white">① 自由度MAX</h4>
                              <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug">
                                出張可能エリア（半径km指定）や稼働日時、料金メニューを完全自由に決定。
                              </p>
                            </div>

                            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-1.5 text-center sm:text-left">
                              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-black mx-auto sm:mx-0">
                                <Smartphone className="w-4 h-4" />
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-white">② スマホ1台完結</h4>
                              <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug">
                                予約受付・顧客チャット・リアルタイムGPS移動ナビ・完了報告まで迷わず操作。
                              </p>
                            </div>

                            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-1.5 text-center sm:text-left">
                              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black mx-auto sm:mx-0">
                                <CreditCard className="w-4 h-4" />
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-white">③ 初期・月額 0 円</h4>
                              <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug">
                                事前決済で未回収・ドタキャンリスクなし。高水準の手取り報酬が自動振込。
                              </p>
                            </div>
                          </div>
                        )}

                        {/* スライド 4: 4マトリクス・セーフティシールド配置 */}
                        {slide.id === 4 && (
                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-2.5 sm:p-3 flex items-start gap-2">
                              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0 mt-0.5" />
                              <div>
                                <h5 className="text-[11px] sm:text-xs font-bold text-white">100% 資格・身元審査</h5>
                                <p className="text-[9px] sm:text-[10px] text-slate-300 mt-0.5 leading-snug">
                                  国家資格・免許証を事前確認。質の高いプロ集団のブランドを死守。
                                </p>
                              </div>
                            </div>

                            <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-2.5 sm:p-3 flex items-start gap-2">
                              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400 shrink-0 mt-0.5" />
                              <div>
                                <h5 className="text-[11px] sm:text-xs font-bold text-white">相互評価 ＆ 住所保護</h5>
                                <p className="text-[9px] sm:text-[10px] text-slate-300 mt-0.5 leading-snug">
                                  悪質客は即時排除。出張先住所は予約確定後のみ開示で安全。
                                </p>
                              </div>
                            </div>

                            <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-2.5 sm:p-3 flex items-start gap-2">
                              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <h5 className="text-[11px] sm:text-xs font-bold text-white">事前与信・自動補償</h5>
                                <p className="text-[9px] sm:text-[10px] text-slate-300 mt-0.5 leading-snug">
                                  未払いトラブル皆無。無断キャンセル時もキャンセル料を自動回収。
                                </p>
                              </div>
                            </div>

                            <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-2.5 sm:p-3 flex items-start gap-2">
                              <Building className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0 mt-0.5" />
                              <div>
                                <h5 className="text-[11px] sm:text-xs font-bold text-white">地域管理者のサポート網</h5>
                                <p className="text-[9px] sm:text-[10px] text-slate-300 mt-0.5 leading-snug">
                                  地域の統括スタッフが日常をバックアップ。万が一の相談窓口を完備。
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* スライド 5: 3ステップ・ロードマップ（将来展望） */}
                        {slide.id === 5 && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                              <div className="bg-slate-800/80 border-t-2 border-emerald-400 rounded-xl p-3 space-y-1">
                                <span className="text-[10px] text-emerald-400 font-bold block">STEP 1 / 現在進行形</span>
                                <h5 className="text-xs sm:text-sm font-bold text-white">17専門職の地域集結</h5>
                                <p className="text-[10px] text-slate-300 leading-snug">
                                  PT・助産師・鍼灸・エステ等、顔の見える出張ケア網を全国構築。
                                </p>
                              </div>

                              <div className="bg-slate-800/80 border-t-2 border-teal-400 rounded-xl p-3 space-y-1">
                                <span className="text-[10px] text-teal-400 font-bold block">STEP 2 / 展開フェーズ</span>
                                <h5 className="text-xs sm:text-sm font-bold text-white">多職種連携 ＆ 法人導入</h5>
                                <p className="text-[10px] text-slate-300 leading-snug">
                                  「リハビリ×栄養」「助産×産後骨盤」等の連携パッケージと福利厚生導入。
                                </p>
                              </div>

                              <div className="bg-slate-800/80 border-t-2 border-cyan-400 rounded-xl p-3 space-y-1">
                                <span className="text-[10px] text-cyan-400 font-bold block">STEP 3 / キャリア進化</span>
                                <h5 className="text-xs sm:text-sm font-bold text-white">地域統括ディレクター</h5>
                                <p className="text-[10px] text-slate-300 leading-snug">
                                  施術者からエリアを束ねる運営管理・教育リーダーへの昇格キャリア。
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* スライド 6: CTA・コンバージョン型 */}
                        {slide.id === 6 && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                            <div className="sm:col-span-2 space-y-2.5">
                              <h3 className="text-base sm:text-xl font-black text-white leading-tight">
                                あなたの技術が、地域のかけがえのない希望になる。
                              </h3>
                              <p className="text-xs text-emerald-200">
                                登録・掲載は完全無料。リスクゼロで新しい一歩を。
                              </p>
                              <div className="flex flex-col gap-1.5 text-[11px] text-slate-200">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">1</span>
                                  <span>スマホで専用フォームに入力（所要約3分）</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">2</span>
                                  <span>運営が資格確認・パートナーアカウント発行</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">3</span>
                                  <span>空き時間を設定して、無理のないペースでスタート！</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-emerald-950/70 border border-emerald-500/40 rounded-xl p-3 text-center space-y-1.5">
                              <QrCode className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-400 mx-auto" />
                              <div className="text-[11px] font-bold text-white">無料先行パートナー登録</div>
                              <div className="text-[9px] text-emerald-300">★管理側参画の個別相談も受付中</div>
                            </div>
                          </div>
                        )}

                        {/* スライド 7: Q&A / FAQ 型 */}
                        {slide.id === 7 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-left">
                            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-2.5">
                              <div className="text-[11px] font-bold text-emerald-300">Q. 勤務先があり副業ですが大丈夫？</div>
                              <div className="text-[10px] text-slate-300 mt-0.5">A. 完全自由シフトです。休日の数時間のみでも問題ありません。</div>
                            </div>
                            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-2.5">
                              <div className="text-[11px] font-bold text-emerald-300">Q. 万が一の物損・事故補償は？</div>
                              <div className="text-[10px] text-slate-300 mt-0.5">A. 包括的な賠償責任保険制度の連携ガイドを用意しています。</div>
                            </div>
                            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-2.5">
                              <div className="text-[11px] font-bold text-emerald-300">Q. 稼働ノルマや違約金はありますか？</div>
                              <div className="text-[10px] text-slate-300 mt-0.5">A. ノルマは一切ありません。休止・再開もいつでも自由です。</div>
                            </div>
                            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-2.5">
                              <div className="text-[11px] font-bold text-emerald-300">Q. 管理・運営側に回りたい場合は？</div>
                              <div className="text-[10px] text-slate-300 mt-0.5">A. 発表終了後に個別相談デスクへお越しいただくかアンケートへ。</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* スライド内フッター */}
                      <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] text-slate-400">
                        <span>{currentBrand.name} Healthcare On-Demand Pitch Deck</span>
                        <span className="font-mono">{slide.timeRange}</span>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================
                      2. スライド投影テキスト ＆ 狙い
                     ======================================================== */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div className="space-y-3">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>スライド投影テキスト（箇条書き概要）</span>
                      </h4>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                        {slide.slideBulletedPoints.map((point, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-teal-600" />
                        <span>スライドの狙いと聴衆心理</span>
                      </h4>
                      <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                        <div>
                          <strong className="text-slate-800 block text-xs">スライドの目的:</strong>
                          <span>{slide.objective}</span>
                        </div>
                        <div>
                          <strong className="text-slate-800 block text-xs">聴衆（400名）の心理状態:</strong>
                          <span className="text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded inline-block">
                            {slide.audienceState}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================
                      3. そのまま話せるトークスクリプト（口頭原稿・語りかけ例）
                     ======================================================== */}
                  <div className="space-y-3 bg-emerald-950 text-white p-5 sm:p-6 rounded-2xl shadow-sm border border-emerald-800">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/80 pb-2.5">
                      <h4 className="text-xs sm:text-sm font-black text-emerald-300 flex items-center gap-2">
                        <Mic className="w-4 h-4 text-emerald-400" />
                        <span>🎙 そのまま話せるトークスクリプト（口頭原稿・語りかけ例）</span>
                      </h4>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-700">
                        発話目安: 約{slide.durationSec}
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-emerald-50 leading-relaxed whitespace-pre-line font-normal">
                      {slide.scriptText}
                    </div>

                    {/* 発表のコツ・立ち振る舞い */}
                    <div className="pt-3 border-t border-emerald-900 flex items-start gap-2 text-xs text-emerald-300/90">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                      <span><strong>発表のコツ:</strong> {slide.tips}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* プレゼン本番前の最終チェックリスト */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4 print-avoid-break">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>5分プレゼン本番の成功チェックリスト（発表直前用）</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-700">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <strong className="font-bold text-slate-900 block">① 最初の30秒で心をつかむ</strong>
                <p className="text-xs text-slate-500 leading-relaxed">
                  「自分たちのための仕組みだ」と感じてもらえるよう、PTや助産師などの職種名を具体的に口にして呼びかけます。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <strong className="font-bold text-slate-900 block">② 不安を先回りして解消する</strong>
                <p className="text-xs text-slate-500 leading-relaxed">
                  「出張や個人活動は安全面が心配…」という会場の空気をスライド4でしっかり受け止め、事前決済と審査体制をアピールします。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <strong className="font-bold text-slate-900 block">③ 管理者候補への導線を作る</strong>
                <p className="text-xs text-slate-500 leading-relaxed">
                  「運営や管理に興味がある方向けの相談デスク」を一言添えることで、意欲の高いリーダー層を確実に拾い上げられます。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          VIEW 2: 経営上申・事業戦略提案書 (Proposal View)
         ======================================================== */}
      {activeView === 'proposal' && (
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

          {/* 事業戦略サマリー 3つの柱 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 print-avoid-break">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. 医療国家資格者による高単価・高リピート化</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                医療保険のリハビリ期限（150/180日）切れによる「リハビリ難民」や、産後外出不能な母子への助産師ケアなど、切実なペインを直接解決。客単価1万円超・リピート率70%超の強固な収益基盤を形成します。
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 print-avoid-break">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. 厳格な資格審査とコンプライアンス</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                全パートナーの免許証・修了証を本部で事前審査。無資格者による医療類似行為のトラブルを完全に排除し、医師法・薬機法・あはき法に準拠した最高水準の安心と信頼をユーザーへ提供します。
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 print-avoid-break">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                <Network className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. 多職種シナジーとLTVの最大化</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                「理学療法（運動）× 管理栄養士（食事）」「助産師（母子ケア）× エステ（美容）」など、ユーザーのライフステージに応じたクロスセルをアプリ内で自然に誘発し、顧客生涯価値（LTV）を劇的に向上させます。
              </p>
            </div>
          </div>

          {/* 全17専門職種ニーズ・市場価値カタログ */}
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-600 uppercase tracking-wider">
                <Target className="w-4 h-4" />
                <span>Specialist Portfolio Matrix</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                参入・展開する全17専門職領域の市場性・提供サービス一覧
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                各専門職種が解決するターゲット顧客のペイン、提供サービス、およびプラットフォーム導入意義の詳細です。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {specialists.map((spec, i) => {
                const IconComponent = spec.icon;
                return (
                  <div
                    key={i}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition print-avoid-break"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-black">
                          <IconComponent className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base sm:text-lg text-slate-900">{spec.category}</h3>
                          <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5">
                            {spec.badge}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl shrink-0">
                        {spec.priceRange}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs sm:text-sm">
                      <div>
                        <strong className="text-slate-900 font-bold block text-xs">解決するペイン・お悩み:</strong>
                        <p className="text-slate-600 mt-0.5">{spec.targetPain}</p>
                      </div>
                      <div>
                        <strong className="text-slate-900 font-bold block text-xs">提供施術・指導内容:</strong>
                        <p className="text-slate-600 mt-0.5">{spec.services}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <strong className="text-emerald-900 font-bold block text-xs">導入意義・収益インパクト:</strong>
                        <p className="text-slate-700 mt-0.5 text-xs leading-relaxed">{spec.whyEssential}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          VIEW 3: 統括実務運用マニュアル (Operations View)
         ======================================================== */}
      {activeView === 'operations' && (
        <div className="space-y-10">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <span>プラットフォーム統括 実務運用マニュアル</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              管理コンソール（/admin）を用いた日常のオペレーション手順、審査フロー、トランザクション監視、およびブランド設定の変更手順です。
            </p>
          </div>

          {/* 6大実務オペレーション */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. セラピスト資格・本人確認審査 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                <FileText className="w-6 h-6 print:stroke-[2.5]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                1. セラピスト資格・本人確認審査フロー
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                新規登録があったセラピストの「保有資格証（理学療法士・柔道整復師・鍼灸等）」および「公的身元証明書」を管理コンソールで確認。記載氏名・有効期限の整合性を確認し、問題がなければ「承認」をONにして公開します。
              </p>
              <div className="p-3.5 bg-blue-50 rounded-2xl text-xs sm:text-sm text-blue-900 font-medium">
                💡 資格証の確認が完了するまで、一般ユーザーの検索一覧には非表示となります。
              </div>
            </div>

            {/* 2. 手数料率（Take Rate）の柔軟調整 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                <Sliders className="w-6 h-6 print:stroke-[2.5]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                2. 手数料率（Take Rate）のスライダー動的変更
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                管理画面の「手数料率設定」から、スライダー操作（5%〜40%）でプラットフォーム利用料率を即時変更可能。新規登録キャンペーン期間中は10%、通常運用時は20%など、事業フェーズに即した機動的な設定が可能です。
              </p>
              <div className="p-3.5 bg-purple-50 rounded-2xl text-xs sm:text-sm text-purple-900 font-medium">
                💡 変更した手数料率は、新規に作成される予約トランザクションから即時適用されます。
              </div>
            </div>

            {/* 3. チャット監査・トラブル監視 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                <MessageSquare className="w-6 h-6 print:stroke-[2.5]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                3. 全チャットログの透明化 ＆ トラブル仲裁
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                出張前の顧客とセラピスト間の全メッセージ履歴を管理者がリアルタイムで監査可能。不適切な発言や直前キャンセルの兆候を早期に検知し、未然にトラブルを防ぐことができます。
              </p>
              <div className="p-3.5 bg-amber-50 rounded-2xl text-xs sm:text-sm text-amber-900 font-medium">
                💡 送信者・宛先・本文が横一列に整然と並び、各ユーザー名からワンクリックで詳細や視点切替が可能です。
              </div>
            </div>

            {/* 4. 口コミ・レビューモデレーション */}
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
      )}
    </div>
  );
}

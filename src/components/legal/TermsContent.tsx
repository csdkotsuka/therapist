'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Shield, FileText, CheckCircle2, AlertTriangle, Scale, Lock, DollarSign, Users, Award } from 'lucide-react';

export const TermsContent: React.FC = () => {
  const { currentBrand } = useApp();
  const brandName = currentBrand.japaneseName || 'CareKuru';
  const brandEng = currentBrand.name || 'CareKuru';

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
      {/* 規約前文 */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-3">
        <p>
          本利用規約（以下「本規約」といいます。）は、{brandName}（英語表記：{brandEng}、以下「本サービス」といいます。）の利用条件および本サービスの運営者（以下「当社」といいます。）と本サービスを利用するすべてのお客様（顧客会員および登録セラピストを含み、以下総称して「ユーザー」といいます。）との間の権利義務関係を定めるものです。
        </p>
        <p>
          本サービスをご利用になる方（LINE公式アカウントの友だち追加、LINEログイン、会員登録、予約申込、または施術提供を行う方を含みます。）は、本規約の全文をお読みいただき、これに同意した上でご利用ください。
        </p>
      </div>

      {/* 第1条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">1</span>
          第1条（定義）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300">
          <p>本規約において使用する主要な用語の定義は、次のとおりとします。</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>「本プラットフォーム」:</strong> 当社がウェブサイト、スマートフォン向けウェブアプリ、LINE公式アカウント等を介して提供するマッチングシステムおよび付帯サービス全般をいいます。</li>
            <li><strong>「顧客」:</strong> 本プラットフォームを通じてセラピストを検索し、出張訪問または店舗での施術を予約・受講する個人または法人をいいます。</li>
            <li><strong>「セラピスト」:</strong> 当社の審査および本人確認・資格確認を経て、本プラットフォーム上で自身の施術サービスを提供する個人事業者または施術者をいいます。</li>
            <li><strong>「施術契約」:</strong> 本プラットフォームを通じて顧客とセラピストの間で直接成立する、ボディケア、コンディショニング、リラクゼーション等のサービス提供契約をいいます。</li>
            <li><strong>「出張施術」:</strong> セラピストが顧客の指定する自宅、オフィス、提携施設等に訪問して実施する施術をいいます。</li>
            <li><strong>「店舗施術」:</strong> 顧客がセラピストの指定するサロン、施術所、提携レンタルサロン等に来訪して実施する施術をいいます。</li>
          </ul>
        </div>
      </section>

      {/* 第2条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">2</span>
          第2条（本サービスの性質と当社の役割）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            1. 本サービスは、専門知識や国家資格・認定資格を有するセラピストと、ボディケア・ヘルスケアサービスを希望する顧客をつなぐマッチングおよび予約・決済仲介プラットフォームです。
          </p>
          <p>
            2. 施術契約は顧客とセラピストとの間で直接成立するものであり、当社は施術契約の当事者とはなりません。ただし、安心・安全な取引環境を確保するため、当社はセラピストの身元確認・資格審査、決済の安全な代行（Stripe等の連携）、トラブル防止のためのガイドライン策定を行います。
          </p>
          <p>
            3. 本プラットフォーム上で提供される施術は、リラクゼーション、健康維持、コンディショニング、産後ケア、ストレッチ等を主たる目的とするものであり、医師法に定める「医業」または治療を目的とした医療行為ではありません。
          </p>
        </div>
      </section>

      {/* 第3条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">3</span>
          第3条（会員登録・LINE公式アカウント連携）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            1. ユーザーは、当社の定める手続に従い、真実かつ正確な情報を提供して会員登録またはLINE公式アカウント連携を行うものとします。
          </p>
          <p>
            2. ユーザーがLINE公式アカウントを友だち追加し、またはLINE連携認証を行う場合、当社はLINEヤフー株式会社が提供するMessaging APIおよびLINEログイン等の技術仕様に基づき、ユーザーのLINE識別子、プロフィール名、およびチャット送受信データを取り扱います。
          </p>
          <p>
            3. セラピストとして登録を希望する者は、当社所定の審査（本人確認書類、保有資格証書の提示、面談等）を受け、審査承認および登録審査手数料（3,300円・Stripe決済）の支払いを完了する必要があります。当社は審査結果について独自の裁量権を有し、不承認の理由を開示する義務を負いません。
          </p>
        </div>
      </section>

      {/* 第4条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">4</span>
          第4条（予約・決済およびキャンセルポリシー）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            1. <strong>予約の成立:</strong> 顧客が本プラットフォーム上で予約を申し込み、セラピストが承諾した時点、または即時予約枠においてクレジットカード等の決済承認が完了した時点で、施術契約が正式に成立します。
          </p>
          <p>
            2. <strong>代金の決済:</strong> 施術代金、出張交通費等の合計金額は、当社が提携する安全な決済代行会社（Stripe, Inc.等）を通じて事前決済されます。施術現場での直接の現金授受は原則禁止とします。
          </p>
          <p>
            3. <strong>顧客都合によるキャンセル:</strong> 顧客が予約成立後にキャンセルする場合、以下の基準に基づくキャンセル料が発生します。
          </p>
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-1 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
              <span className="font-bold">施術予定日時の24時間前まで</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">キャンセル料無料（全額返金）</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
              <span className="font-bold">施術予定日時の24時間以内〜開始前</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">施術代金の50%</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-bold">無断キャンセル または 施術開始後のご連絡</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">施術代金の100%</span>
            </div>
          </div>
          <p>
            4. <strong>セラピスト都合によるキャンセル:</strong> 事故、急病、天災等によりセラピストの都合で施術が中止となった場合、顧客に対して施術代金全額を速やかに返金します。
          </p>
        </div>
      </section>

      {/* 第5条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">5</span>
          第5条（出張・訪問施術における安全管理とGPS送信）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            1. 出張施術において、顧客は安全かつ適切な施術スペース（清潔な環境、施術に必要な広さ、適正な空調環境）を提供するものとします。
          </p>
          <p>
            2. セラピストの安全確保および顧客への正確な到着案内を目的として、セラピストは移動中に本プラットフォームの位置情報送信機能（GPS連携）を使用することができます。位置情報は当該予約の目的達成に必要な範囲でのみ利用されます。
          </p>
          <p>
            3. 出張施術におけるトラブル防止および防犯の観点から、当社は必要に応じて家族や同居人の同席、または第三者の立ち会いを推奨します。
          </p>
        </div>
      </section>

      {/* 第6条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-black">6</span>
          第6条（直接取引・引き抜き行為の禁止および違約金）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl p-3.5 text-rose-900 dark:text-rose-300 text-xs">
            <strong>重要事項（直契約の厳格な禁止）:</strong>
            <p className="mt-1 leading-relaxed">
              ユーザーは、本プラットフォームを介して知り得た顧客またはセラピストとの間で、本プラットフォームを経由せずに直接施術契約を締結し、または代金を直接授受する行為（以下「直接取引」といいます。）を行ってはなりません。
            </p>
          </div>
          <p>
            1. 本条に違反して直接取引を行ったことが発覚した場合、当社は直ちに当該ユーザーのアカウント利用を永久停止し、違反者に対して違約金として金300,000円、または直接取引により得た金額（もし高額である場合はその金額）を請求することができるものとします。
          </p>
        </div>
      </section>

      {/* 第7条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">7</span>
          第7条（禁止事項）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>性的サービス、風俗的サービスの要求またはこれに応じる行為</li>
            <li>セラピストまたは顧客に対するハラスメント、ストーカー行為、暴言、威迫行為</li>
            <li>事前の同意を得ない無断撮影・録音・録画、またはSNS等への公開</li>
            <li>感染症に罹患している状態での対面施術の申込または提供</li>
            <li>虚偽の資格、経歴、本人情報の登録・申告</li>
            <li>公序良俗に反する行為、法令に違反する行為、またはそれらを助長する行為</li>
            <li>当社システムの不正アクセス、改ざん、リバースエンジニアリング行為</li>
          </ul>
        </div>
      </section>

      {/* 第8条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">8</span>
          第8条（免責事項および損害賠償の制限）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            1. 当社は、本プラットフォームに実質的瑕疵がないこと、ならびにシステムの中断・遅延・停止等が発生しないことを明示的にも黙示的にも保証しません。
          </p>
          <p>
            2. 施術に起因する身体の負傷、健康状態の悪化、物損等のトラブルは、顧客と施術担当セラピストとの間で協議・解決を図るものとします。ただし、当社は円滑な解決に向けて客観的な予約記録や決済情報の照会等の必要な協力を行うものとします。
          </p>
          <p>
            3. 当社が債務不履行または不法行為に基づきユーザーに対して損害賠償責任を負う場合であっても、当社の責任は、当該損害の原因となった予約について当社が受領した仲介手数料額を上限とします（当社に故意または重過失がある場合を除きます）。
          </p>
        </div>
      </section>

      {/* 第9条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">9</span>
          第9条（規約の変更）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            当社は、法令の改正、サービス改善その他の必要に応じて本規約を変更することができます。本規約を変更する場合、変更後の規約の効力発生時期および内容を本サービス上またはLINE公式アカウント等の適切な方法により周知します。周知後にユーザーが本サービスを利用した場合、変更に同意したものとみなします。
          </p>
        </div>
      </section>

      {/* 第10条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">10</span>
          第10条（準拠法および管轄裁判所）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            本規約の解釈および適用は、日本法に準拠するものとします。本サービスまたは本規約に関して紛争が生じた場合には、東京地方裁判所または当社の本店所在地を管轄する地方裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </div>
      </section>

      {/* 附則 */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p>制定日：2026年10月28日</p>
        <p>{brandName} 運営事務局</p>
      </div>
    </div>
  );
};

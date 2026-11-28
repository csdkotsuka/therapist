'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { REVIEW_FEE_YEN } from '@/lib/verification';

export const TherapistTermsContent: React.FC = () => {
  const { currentBrand } = useApp();
  const brandName = currentBrand.name || 'CareKuru';

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
      {/* 規約前文 */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-3">
        <p>
          本施術者向け利用規約（以下「本規約」といいます。）は、Creative System Design（代表：大塚和宏、以下「当社」といいます。）が運営する「{brandName}」（以下「本プラットフォーム」といいます。）に登録し、利用者に対して施術・ケアサービスを提供する個人事業者または法人（以下「施術者」といいます。）と当社との間の権利義務関係を定めるものです。
        </p>
        <p>
          施術者は、登録審査の申込および電子誓約書への署名をもって、本規約およびプライバシーポリシーのすべてに同意したものとみなします。
        </p>
      </div>

      {/* 第1条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black">1</span>
          第1条（独立事業者としての地位および当社のサービス範囲）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            1. <strong>独立事業者性:</strong> 施術者は、当社と雇用契約、労働者派遣契約、委任契約または代理関係にない<strong>独立した事業者</strong>として自己の責任と計算において業務を行います。
          </p>
          <p>
            2. <strong>契約当事者:</strong> 施術契約は利用者と施術者の間で直接成立するものであり、施術サービスの提供主体および契約当事者は施術者本人です。当社は施術契約の当事者とはなりません。
          </p>
          <p>
            3. <strong>当社のサービス範囲:</strong> 当社は、本プラットフォームにおける予約・マッチング機能、決済代行事業者（Stripe, Inc.）を通じた決済仲介、および登録審査の補助のみを提供します。
          </p>
        </div>
      </section>

      {/* 第2条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black">2</span>
          第2条（登録審査・資格確認および保険加入要件）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            1. <strong>登録審査および審査手数料:</strong> 施術者としての登録を希望する者は、当社所定の手続により審査手数料（{REVIEW_FEE_YEN.toLocaleString('ja-JP')}円・税込／審査結果にかかわらず返金不可）を決済し、本人確認、資格確認、保険加入確認の審査を受けるものとします。
          </p>
          <p>
            2. <strong>国家資格と民間資格等の正確な申告:</strong> 施術者は、自身が保有する資格について「国家資格」と「民間資格・認定」「実務経験」を正確に区分して申告し、虚偽の資格名・登録番号を登録してはなりません。
          </p>
          <p>
            3. <strong>損害賠償責任保険への加入・維持義務:</strong> 施術者は、本プラットフォームを通じた業務に起因する対人・対物事故を補償する<strong>損害賠償責任保険に有効に加入していること</strong>を登録の必須要件とし、登録期間中も途切れることなく有効に維持する義務を負います。保険の失効・解約があった場合は直ちに当社へ報告しなければならず、未加入状態での施術提供を禁止します。
          </p>
        </div>
      </section>

      {/* 第3条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black">3</span>
          第3条（業法遵守および広告・表示規制）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            1. <strong>資格範囲とサービス区分の遵守:</strong> 施術者は、自身の保有資格の法的範囲内で認められたサービス区分のみを登録・提供するものとし、医師法上の医業その他法令上無資格での実施が禁止されている行為を行ってはなりません。
          </p>
          <p>
            2. <strong>広告・表示規制の遵守:</strong> 施術者が本プラットフォーム上に掲載するプロフィール、資格名、メニュー名、説明文等の情報は、施術者自身の責任において表示・広告するものであり、資格名だけでなく実際のサービス内容に即して、景品表示法、医療広告ガイドライン、あはき法、柔道整復師法、薬機法等の関連法令を遵守しなければなりません。
          </p>
          <p>
            3. <strong>運営による広告協力と修正権限:</strong> 当社が本プラットフォーム全体の集客・広報のために広告を行う場合であっても、施術者は自身の掲載情報が法令に適合していることを保証するものとします。当社は、法令違反または誤認のおそれがあると判断した掲載情報を事前の通知なく修正要請、非公開化、または削除できるものとします。
          </p>
        </div>
      </section>

      {/* 第4条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black">4</span>
          第4条（施術者の安全管理義務および事故・苦情対応）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            1. <strong>安全管理義務:</strong> 施術者は、施術の前後および施術中において以下の安全管理義務を負います。
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>施術前の問診による利用者の体調、既往歴、禁忌事項、妊娠の有無等の確認</li>
            <li>手指・器具・タオルの消毒、感染症予防等の衛生管理の徹底</li>
            <li>利用者に痛み・気分不良・体調急変等の異常が生じた場合の即時施術中止および適切な応急・救急手配</li>
            <li>無理な施術や資格・技術範囲を超えた施術の強行禁止</li>
          </ul>
          <p>
            2. <strong>施術内容・技術・効果に関する責任:</strong> 施術に起因して利用者の身体、健康または財物に損害を与えた場合、施術者が一次的かつ直接的な法的責任を負い、自己の費用と責任（加入保険の適用を含む）において解決するものとします。
          </p>
          <p>
            3. <strong>事故・苦情発生時の報告・対応手続:</strong> 身体被害、物損、ハラスメント等の事故・苦情が発生した場合、施術者は直ちに安全確保と一次対応を行った上、<strong>発生から24時間以内</strong>に当社窓口（kotsuka@creativesd.net）へ事実経過を報告し、当社の調査および保険会社との手続に誠実に協力するものとします。
          </p>
        </div>
      </section>

      {/* 第5条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black">5</span>
          第5条（Stripe Connect を前提とした決済・資金の流れ・返金）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            1. <strong>Stripe Connect 契約関係:</strong> 施術者は、報酬を受領するために Stripe, Inc. が提供する Stripe Connect（Express アカウント等）を開設し、Stripe Connected Account Agreement に同意・遵守するものとします。
          </p>
          <p>
            2. <strong>資金の流れと代理受領:</strong> 施術者は、利用者からの施術代金等について、当社およびStripeが施術者に代わって受領する権限を付与します。利用者が決済した代金から、当社所定のプラットフォーム手数料（および決済関連費用）を控除した残額が、Stripe Connect を通じて施術者の登録銀行口座へ振り込まれます。
          </p>
          <p>
            3. <strong>返金およびチャージバック:</strong> キャンセルポリシーに基づく返金、施術者都合の中止による全額返金、または利用者のクレジットカード会社を通じたチャージバックが発生した場合、当該返金額および関連手数料は施術者の負担とし、未払報酬との相殺または別途請求により精算するものとします。
          </p>
          <p>
            4. <strong>確定申告・納税義務:</strong> 施術者は、本プラットフォームを通じて得た報酬について、自己の責任において確定申告および納税を行うものとします。
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
            <strong>禁止対象および禁止期間:</strong>
            <p className="mt-1 leading-relaxed">
              施術者は、本プラットフォームを通じて知り得た利用者または他の施術者との間で、<strong>最終予約日または本プラットフォームの登録終了日から1年間</strong>、本プラットフォームを介さずに直接施術契約を締結し、予約・連絡先交換による継続施術・現金等の直接決済を行い、または他社サービスへ勧誘・引き抜く行為（直接取引）を行ってはなりません。
            </p>
          </div>
          <p>
            前項に違反したことが判明した場合、当社は当該施術者の登録を直ちに抹消し、違反1件につき「当該直接取引について本来当社が受領すべきプラットフォーム手数料相当額の2倍」または「金50,000円」のいずれか高い金額（ならびに調査・弁護士費用等の実費）を違約金として請求できるものとします。
          </p>
        </div>
      </section>

      {/* 第7条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black">7</span>
          第7条（守秘義務・個人情報の取扱い）
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          施術者は、業務上知り得た利用者の氏名、住所、電話番号、健康状態、問診内容、住居環境等の秘密情報および個人情報を、当該予約の施術遂行以外の目的に利用し、または第三者に開示・漏洩してはなりません。この義務は登録終了後も存続します。
        </p>
      </section>

      {/* 第8条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black">8</span>
          第8条（免責・規約変更・準拠法および管轄）
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          当社が施術者に対して損害賠償責任を負う場合であっても、当社に故意または重過失がある場合を除き、当該損害の原因となった予約に関し当社が受領した手数料額を上限とします。本規約は日本法に準拠し、広島地方裁判所を第一審の専属的合意管轄裁判所とします。
        </p>
      </section>

      {/* 附則・事業者情報 */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p>制定日：2026年10月28日 ／ 改定日：2026年11月28日</p>
        <p>運営事業者：Creative System Design（代表：大塚和宏）</p>
        <p>所在地：広島県広島市中区大手町1-1-20 相生橋ビル7階 A号室</p>
        <p>連絡先：kotsuka@creativesd.net</p>
      </div>
    </div>
  );
};

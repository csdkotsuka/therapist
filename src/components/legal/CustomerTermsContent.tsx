'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export const CustomerTermsContent: React.FC = () => {
  const { currentBrand } = useApp();
  const brandName = currentBrand.name || 'CareKuru';

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
      {/* 規約前文 */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-3">
        <p>
          本利用者向け利用規約（以下「本規約」といいます。）は、Creative System Design（代表：大塚和宏、以下「当社」といいます。）が運営する「{brandName}」（以下「本プラットフォーム」といいます。）を利用するお客様（以下「利用者」といいます。）と当社との間の権利義務関係を定めるものです。
        </p>
        <p>
          本プラットフォームの利用（LINE公式アカウントの友だち追加、会員登録、検索、予約申込、決済等を含みます。）を行う利用者は、本規約およびプライバシーポリシーの全文に同意した上でご利用ください。なお、施術者として登録・活動する方に対しては、別途「施術者向け利用規約」が適用されます。
        </p>
      </div>

      {/* 第1条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">1</span>
          第1条（定義）
        </h2>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <li><strong>「本プラットフォーム」:</strong> 当社がウェブサイト、ウェブアプリ、LINE公式アカウント等を通じて提供する予約・マッチング・決済仲介システム全般をいいます。</li>
          <li><strong>「利用者」:</strong> 本プラットフォームを通じて施術者を検索し、出張または店舗での施術・ケアサービスを予約・利用する個人または法人をいいます。</li>
          <li><strong>「施術者」:</strong> 当社所定の本人確認・資格確認等の審査を経て、本プラットフォーム上に自身のサービスを掲載・提供する独立した事業者（セラピスト・専門職等）をいいます。</li>
          <li><strong>「施術契約」:</strong> 本プラットフォームを通じて利用者と施術者との間で直接成立する、ボディケア、リラクゼーション、コンディショニング等のサービス提供契約をいいます。</li>
        </ul>
      </section>

      {/* 第2条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">2</span>
          第2条（本プラットフォームの性質および当社の立場）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            1. <strong>施術者の独立事業者性:</strong> 本プラットフォームに登録する施術者は、当社と雇用契約、代理権、または共同事業関係にない独立した事業者です。
          </p>
          <p>
            2. <strong>サービスの提供主体と契約当事者:</strong> 施術サービスの提供主体は施術者本人であり、施術契約は利用者と施術者との間で直接成立します。当社は施術契約の当事者にはなりません。
          </p>
          <p>
            3. <strong>当社が提供するサービスの範囲:</strong> 当社が利用者に提供するサービスは、マッチングシステムの提供、予約管理、決済代行事業者を通じた決済仲介、および一定の本人確認・資格証・保険加入証書の確認補助に限られます。
          </p>
          <p>
            4. <strong>医療行為ではないこと:</strong> 本プラットフォーム上で提供されるサービスは、リラクゼーション、健康維持、コンディショニング、生活支援等を目的とするものであり、医師法に定める「医業」その他疾病の診断・治療を目的とした医療行為ではありません。
          </p>
          <p>
            5. <strong>国家資格と民間資格等の区別:</strong> 本プラットフォームでは、施術者が保有する資格について「国家資格」と「民間資格・認定」「実務経験」を区別して表示します。資格の種別・名称をご確認の上、ご自身の目的に合った施術者をご選択ください。
          </p>
        </div>
      </section>

      {/* 第3条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">3</span>
          第3条（予約・決済およびキャンセルポリシー）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            1. <strong>予約の成立:</strong> 利用者が本プラットフォーム上で予約を申し込み、施術者が承諾した時点、または即時予約において決済承認が完了した時点で、利用者と施術者との間に施術契約が成立します。
          </p>
          <p>
            2. <strong>決済および資金の流れ（Stripe Connect）:</strong> 利用者が支払う施術代金等の合計金額は、提携決済代行事業者（Stripe, Inc.）を通じて事前決済されます。当社およびStripeは、施術者から受領権限の付与（代理受領または決済仲介）を受けて代金を受領し、プラットフォーム手数料を控除した残額を施術者のStripe Connectアカウントへ引き渡します。現金の直接授受は禁止とします。
          </p>
          <p>
            3. <strong>利用者都合によるキャンセル:</strong> 予約成立後の利用者都合によるキャンセルには、以下のキャンセル料が適用されます。
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
            4. <strong>施術者都合による中止・返金:</strong> 施術者の急病、事故、天災等により施術が中止となった場合、支払済みの代金はStripeを通じて速やかに全額返金されます。
          </p>
        </div>
      </section>

      {/* 第4条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">4</span>
          第4条（安全管理および利用者の協力義務）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            1. 利用者は、施術を受けるにあたり、既往歴、服薬状況、アレルギー、妊娠の有無その他体調に関する重要な事項を施術者へ正確に申告するものとします。
          </p>
          <p>
            2. 出張施術の場合、利用者は清潔で安全かつ施術に支障のないスペースを提供するものとします。
          </p>
          <p>
            3. 安全・防犯および到着案内のため、施術者が移動中に位置情報（GPS）を共有する場合があることに同意するものとします。
          </p>
        </div>
      </section>

      {/* 第5条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-black">5</span>
          第5条（直接取引の禁止および違約金）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl p-3.5 text-rose-900 dark:text-rose-300 text-xs">
            <strong>禁止対象と禁止期間:</strong>
            <p className="mt-1 leading-relaxed">
              利用者は、本プラットフォームを通じて知り得た施術者との間で、最終予約日または本プラットフォームの退会・利用終了日から<strong>1年間</strong>、本プラットフォームを介さずに直接施術契約を締結し、予約または金銭の直接授受を行う行為（直接取引）を行ってはなりません。
            </p>
          </div>
          <p>
            前項に違反した場合、当社は当該利用者のアカウントを停止または抹消し、当該直接取引に関して当社が本来受領すべきプラットフォーム手数料相当額および調査に要した合理的費用を違約金として請求できるものとします。
          </p>
        </div>
      </section>

      {/* 第6条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">6</span>
          第6条（禁止事項）
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <li>性的サービス、風俗的サービスの要求またはこれに類する言動</li>
          <li>施術者に対するハラスメント、ストーカー行為、暴言、威迫、暴力行為</li>
          <li>施術者の事前同意を得ない撮影・録音・録画、またはSNS等への公開</li>
          <li>感染症に罹患している状態での対面施術の申込</li>
          <li>虚偽の個人情報・健康情報の申告、法令または公序良俗に反する行為</li>
        </ul>
      </section>

      {/* 第7条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">7</span>
          第7条（事故・苦情発生時の責任および対応手続）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            1. <strong>施術内容・効果・技術に関する責任:</strong> 施術の内容、技術、安全性および効果に関する責任は施術者が負い、当社はこれらを保証しません。
          </p>
          <p>
            2. <strong>事故・トラブルの種類別の責任と対応手続:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li><strong>身体被害・体調急変:</strong> 異常が生じた場合は直ちに施術を中止し、必要に応じて医療機関の受診または救急要請を行ってください。原因が施術者の過失にある場合は施術者および施術者が加入する損害賠償責任保険により補償協議を行います。</li>
            <li><strong>物損事故:</strong> 訪問先等の器物破損が生じた場合は、速やかに現場状況の記録を保全し、施術者およびその加入保険を通じて賠償協議を行います。</li>
            <li><strong>ハラスメント・安全トラブル:</strong> 危険や迷惑行為がある場合は直ちに中断・退避し、必要に応じて警察へ通報の上、当社窓口へご連絡ください。</li>
            <li><strong>連絡・対応窓口:</strong> 事故または苦情が発生した場合、利用者は発生から原則24時間以内に当社窓口（kotsuka@creativesd.net またはアプリ内サポート）へご連絡ください。当社は予約履歴・決済記録等の客観的情報の照会・提供を通じて解決に協力します。</li>
          </ul>
          <p>
            3. <strong>当社の損害賠償責任の上限:</strong> 当社が債務不履行または不法行為に基づき利用者に対して損害賠償責任を負う場合、当社の責任は、当社に故意または重過失がある場合を除き、当該損害の原因となった予約について当社が受領したプラットフォーム手数料額を上限とします。
          </p>
        </div>
      </section>

      {/* 第8条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">8</span>
          第8条（規約の変更・準拠法および管轄裁判所）
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          当社は必要に応じて本規約を変更することができ、変更後の効力発生時期および内容を本プラットフォーム上等で周知します。本規約は日本法に準拠し、紛争が生じた場合は広島地方裁判所を第一審の専属的合意管轄裁判所とします。
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

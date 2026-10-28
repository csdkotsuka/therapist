'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ShieldCheck, Lock, Eye, Server, MessageSquare, Smartphone, Bell, FileCheck } from 'lucide-react';

export const PrivacyContent: React.FC = () => {
  const { currentBrand } = useApp();
  const brandName = currentBrand.name || 'CareKuru';

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
      {/* ポリシー前文 */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-3">
        <p>
          {brandName}（以下「当社」または「本サービス」といいます。）は、お客様（顧客会員および登録セラピストを含み、以下「ユーザー」といいます。）のプライバシーを尊重し、個人情報の保護に関する法律（以下「個人情報保護法」といいます。）および関連法令を遵守して、ユーザーの個人情報を適正に取り扱います。
        </p>
        <p>
          本プライバシーポリシー（以下「本ポリシー」といいます。）は、ウェブサイト、スマートフォン向けウェブアプリ、およびLINE公式アカウント（Messaging API・LINEログイン等の連携機能を含む）における個人情報の収集、利用、管理、および保護の方針を定めたものです。
        </p>
      </div>

      {/* 第1条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black">1</span>
          第1条（収集する情報および収集方法）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>当社は、本サービスの提供・運営にあたり、以下の個人情報および関連情報を適法かつ公正な手段によって取得します。</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>ユーザー基本情報:</strong> 氏名、フリガナ、生年月日、性別、電話番号、メールアドレス。
            </li>
            <li>
              <strong>出張先・配送先情報:</strong> 出張施術の訪問先住所（郵便番号、都道府県、市区町村、番地、建物名・部屋番号）、道順・駐車場の有無等の付帯情報。
            </li>
            <li>
              <strong>LINE公式アカウント連携情報:</strong> LINEユーザー識別子（LINE UID）、LINE表示名、プロフィール画像URL、友だち追加ステータス、LINEチャットの送受信メッセージ。
            </li>
            <li>
              <strong>セラピスト資格・身元確認情報:</strong> 保有資格証明書（理学療法士、助産師、鍼灸師、あん摩マッサージ指圧師等の免許証写し）、本人確認書類（運転免許証、マイナンバーカード表面等）、振込先口座情報。
            </li>
            <li>
              <strong>健康カウンセリング・問診情報:</strong> 施術の安全性を確保するための主訴、お身体の気になる部位、妊娠週数（マタニティケアの場合）、既往歴、留意事項等の情報。
            </li>
            <li>
              <strong>位置情報（GPSデータ）:</strong> セラピストが出張訪問時にアプリ上で「出発」「現在地共有」を有効にした際の一時的な位置情報（到着予測および防犯目的のみに使用）。
            </li>
            <li>
              <strong>決済・取引履歴情報:</strong> 予約履歴、決済金額、取引日時。なお、クレジットカード番号は提携決済代行会社（Stripe, Inc.）が直接取得・処理し、当社のサーバー内には保持いたしません。
            </li>
          </ul>
        </div>
      </section>

      {/* 第2条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black">2</span>
          第2条（個人情報の利用目的）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>当社は、取得した個人情報を以下の利用目的の範囲内でのみ利用します。</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>顧客とセラピストとの間の施術予約の受付、日程調整、およびマッチングの円滑な成立のため</li>
            <li>出張施術先への適切な訪問および安全な施術環境の提供のため</li>
            <li>LINE公式アカウントを通じた予約完了通知、予約前日のリマインド、チャットによる事前相談の配信のため</li>
            <li>Stripe等を通じた施術料金の決済処理、およびセラピストへの報酬支払処理のため</li>
            <li>セラピストの身元確認、資格保有状況の審査、およびプラットフォーム品質基準の維持のため</li>
            <li>直契約や引き抜き行為、ハラスメント等の不正・規約違反行為の防止および調査のため</li>
            <li>本サービスに関する重要なお知らせ、規約変更通知、障害情報等のご案内のため</li>
            <li>ユーザーからのお問い合わせ、トラブル対応、およびカスタマーサポートの実施のため</li>
          </ul>
        </div>
      </section>

      {/* 第3条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black">3</span>
          第3条（LINE公式アカウントおよび外部サービス連携）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            1. <strong>LINE Messaging APIの利用:</strong> 当社は、LINEヤフー株式会社が提供するMessaging APIおよびLINEログイン機能を利用して、LINE公式アカウントとWebアプリを連携させています。
          </p>
          <p>
            2. <strong>友だち追加と通知配信:</strong> ユーザーが当社のLINE公式アカウントを友だち追加した場合、本サービスに関する重要なお知らせや予約リマインド通知をお送りすることがあります。メッセージ配信はLINEアプリ内の設定からいつでも停止（ブロック）することができます。
          </p>
          <p>
            3. <strong>LINEヤフー社のプライバシーポリシー:</strong> LINEアプリを通じた通信およびデータの取り扱いについては、LINEヤフー株式会社が定めるプライバシーポリシーもあわせて適用されます。
          </p>
        </div>
      </section>

      {/* 第4条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black">4</span>
          第4条（マッチング当事者間における情報の開示）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            1. 予約が成立した場合、出張訪問および適切な施術実施のために必要な範囲に限り、顧客の氏名、電話番号、訪問先住所、および問診情報が担当セラピストに対して開示されます。
          </p>
          <p>
            2. セラピストには厳格な守秘義務が課されており、業務上知り得た顧客の個人情報、住居環境、身体状況等を第三者に開示・漏洩することは規約上固く禁止されています。
          </p>
          <p>
            3. 同様に、顧客に対しても担当セラピストの氏名、顔写真、保有資格、自己紹介、および移動状況が開示されます。
          </p>
        </div>
      </section>

      {/* 第5条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black">5</span>
          第5条（個人情報の第三者提供および委託）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>当社は、以下の場合を除き、あらかじめユーザーの同意を得ることなく個人情報を第三者に提供しません。</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>法令に基づく場合（警察、裁判所等の公的機関からの正式な開示要請）</li>
            <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難である場合</li>
            <li>
              <strong>業務委託:</strong> 利用目的の達成に必要な範囲において、信頼できる外部委託先（Stripe社による決済代行、Supabase/Vercel/Google Cloud等によるセキュアなインフラ構築、LINEヤフー社によるAPI配信）に個人情報の取扱いを委託する場合。この場合、当社は適切な委託先管理を行います。
            </li>
          </ul>
        </div>
      </section>

      {/* 第6条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black">6</span>
          第6条（安全管理措置）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            当社は、個人情報の漏えい、滅失または毀損の防止その他の個人情報の安全管理のため、通信のSSL/TLS暗号化、アクセス権限の最小化、データベースの暗号化保護、定期的なセキュリティチェック等の必要かつ適切な技術的・組織的安全管理措置を講じています。
          </p>
        </div>
      </section>

      {/* 第7条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black">7</span>
          第7条（保有個人データの開示・訂正・利用停止）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            ユーザーは、当社に対してご自身の保有個人データの開示、訂正、追加、削除、または利用停止を請求することができます。ご請求を希望される場合は、下記のお問い合わせ窓口までご連絡ください。ご本人確認を行った上で、法令の定めに従って速やかに対応いたします。
          </p>
        </div>
      </section>

      {/* 第8条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black">8</span>
          第8条（本ポリシーの改定）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>
            当社は、個人情報保護に関する法令や社会規範の変更、サービスの機能改善に伴い、本ポリシーを適宜改定することがあります。重要な改定を行う場合は、本サービス上またはLINE公式アカウント等にて事前に通知します。
          </p>
        </div>
      </section>

      {/* 第9条 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black">9</span>
          第9条（お問い合わせ窓口）
        </h2>
        <div className="space-y-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          <p>個人情報の取扱いに関するご相談、開示等の請求、苦情のお申し立ては、下記窓口までお問い合わせください。</p>
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs space-y-1">
            <p className="font-bold text-slate-900 dark:text-white">{brandName} 個人情報保護相談窓口</p>
            <p className="text-slate-600 dark:text-slate-400">受付方法：本サービス内のお問い合わせフォーム または 公式LINEアカウントのチャットサポート</p>
            <p className="text-slate-600 dark:text-slate-400">受付時間：平日 10:00〜18:00（土日祝・年末年始を除く）</p>
          </div>
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

'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Car,
  CreditCard,
  ArrowRight,
  Sparkles,
  Home,
  Building,
  Navigation,
  FileText,
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
  DollarSign,
  UserCheck,
  Award,
} from 'lucide-react';

export default function TherapistGuidePage() {
  const { currentBrand } = useApp();

  return (
    <div className="space-y-8 pb-16 text-slate-800 text-sm sm:text-base leading-relaxed">
      {/* Title & Badge */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-800 print-avoid-break">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-300">
            Therapist Partner Practical Manual
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black mt-2 text-white">
          セラピスト・専門職向け 実務運用マニュアル
        </h1>
        <p className="text-sm sm:text-base text-emerald-100 mt-3 max-w-3xl leading-relaxed">
          {currentBrand.japaneseName} ({currentBrand.name}) の提携セラピスト・医療専門職として、新規登録審査から予約受付、出張GPS送信、施術完了、そしてStripe報酬受取までの全実務フローを網羅した公式ガイドです。
        </p>

        {/* 顧客向けページへ行くだけのリンク */}
        <div className="mt-6 pt-6 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-emerald-200">
            顧客がどのような画面で検索し予約しているかを確認できます：
          </div>
          <Link
            href="/guide/customer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition shadow-md"
          >
            <span>顧客向けご利用ガイドを確認する</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Steps Grid */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-600">Operations Workflow</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            実運用時の標準オペレーション（全7ステップ）
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1: 登録・書類提出 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
            <div className="flex items-center gap-2.5 text-emerald-700 font-bold">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                1
              </span>
              <span className="text-base sm:text-lg text-slate-900 font-black">
                専門職プロフィール登録 ＆ 必要書類提出
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              アカウント作成後、セラピスト管理画面から「身分証明書（運転免許証・マイナンバー等）」「国家資格免許証または専門認定証」「損害賠償責任保険の証書」をアップロードします。
            </p>
            <div className="p-3.5 bg-emerald-50 rounded-2xl text-xs sm:text-sm text-emerald-950 space-y-1 font-medium">
              <p className="font-bold text-emerald-900">🛡️ 個人情報保護と原本自動削除:</p>
              <p>
                提出された画像ファイルは管理本部の照合審査完了と同時にサーバーから自動完全削除されます。保管リスクがなく、漏洩の心配はありません。
              </p>
            </div>
          </div>

          {/* Step 2: 審査料決済 ＆ 電子誓約書 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
            <div className="flex items-center gap-2.5 text-indigo-700 font-bold">
              <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black text-sm">
                2
              </span>
              <span className="text-base sm:text-lg text-slate-900 font-black">
                審査手数料決済 ＆ 電子誓約書への同意
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              適正なプラットフォーム品質と安全なマッチング環境を担保するため、登録審査手数料（3,300円・Stripe決済）をお支払いいただき、利用規約・直契約禁止・コンプライアンスに関する電子誓約書に署名同意します。
            </p>
            <div className="p-3.5 bg-indigo-50 rounded-2xl text-xs sm:text-sm text-indigo-950 font-medium">
              💡 審査完了後、管理本部より「本登録・専門認定」バッジが付与され、マップ上にピンが表示されます。
            </div>
          </div>

          {/* Step 3: メニュー・稼働設定 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
            <div className="flex items-center gap-2.5 text-teal-700 font-bold">
              <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-sm">
                3
              </span>
              <span className="text-base sm:text-lg text-slate-900 font-black">
                施術メニュー・受付エリア・シフト設定
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              ご自身の専門スキルに応じた施術コース（料金・所要時間・詳細説明）を登録します。「出張施術のみ」「店舗訪問のみ」「両方対応」を選択でき、拠点からの出張可能半径（3km〜30km）や受付曜日・時間帯を自由に設定できます。
            </p>
            <div className="p-3.5 bg-teal-50 rounded-2xl text-xs sm:text-sm text-teal-950 font-medium">
              💡 自費リハビリ（PT/OT）や助産師ケア、美容鍼灸など、高単価な専門メニューの設定が推奨されます。
            </div>
          </div>

          {/* Step 4: 予約リクエスト受付とチャット */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
            <div className="flex items-center gap-2.5 text-blue-700 font-bold">
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-sm">
                4
              </span>
              <span className="text-base sm:text-lg text-slate-900 font-black">
                予約リクエストの受信・承認と事前ヒアリング
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              顧客から新規予約が入ると通知が届きます。日時、施術場所、顧客の症状・要望メモを確認し、「承認して確定」または「辞退」をタップします。確定後は内蔵チャット機能で駐車場所や事前の体調確認を行えます。
            </p>
            <div className="p-3.5 bg-blue-50 rounded-2xl text-xs sm:text-sm text-blue-950 font-medium">
              ⚠️ 直契約の勧誘やLINE交換、外部決済の誘導は自動検知され、アカウント停止の対象となります。
            </div>
          </div>

          {/* Step 5: 出張時のリアルタイムGPS送信 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
            <div className="flex items-center gap-2.5 text-sky-700 font-bold">
              <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-black text-sm">
                5
              </span>
              <span className="text-base sm:text-lg text-slate-900 font-black">
                移動時のリアルタイムGPS送信（Uber風安心機能）
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              出張施術へ出発する際、予約詳細から「GPS現在地を送信」をONにします。顧客側の画面にリアルタイムマップと到着予定時刻（ETAカウントダウン）が表示され、「いつ来るかわからない」という不安を完全に解消できます。
            </p>
            <div className="p-3.5 bg-sky-50 rounded-2xl text-xs sm:text-sm text-sky-950 font-medium">
              💡 到着後はワンタップで到着完了を報告。安心とプロ意識の演出につながり高評価を獲得できます。
            </div>
          </div>

          {/* Step 6: 施術実施と完了報告 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
            <div className="flex items-center gap-2.5 text-purple-700 font-bold">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black text-sm">
                6
              </span>
              <span className="text-base sm:text-lg text-slate-900 font-black">
                施術実施 ＆ ワンタップ完了報告（自動決済）
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              施術完了後、管理画面で「施術完了を報告」ボタンを押します。予約時に顧客のクレジットカードで事前確保（オーソリ）されていた決済が即座に自動確定（キャプチャ）され、現金のやり取りは一切不要です。
            </p>
            <div className="p-3.5 bg-purple-50 rounded-2xl text-xs sm:text-sm text-purple-950 font-medium">
              💡 施術後は顧客へレビュー投稿依頼が自動送信され、良質な口コミが次の指名獲得を生みます。
            </div>
          </div>

          {/* Step 7: Stripe Connect 報酬受取 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-3.5 print-avoid-break">
            <div className="flex items-center gap-2.5 text-amber-700 font-bold">
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm">
                7
              </span>
              <span className="text-base sm:text-lg text-slate-900 font-black">
                Stripe Expressによる売上報酬の自動振込
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              施術売上からプラットフォーム手数料（20%）が自動控除された純手取り額が、Stripe Connect Expressダッシュボードに反映されます。ご登録いただいた銀行口座へ自動で入金されます。
            </p>
            <div className="p-3.5 bg-amber-50 rounded-2xl text-xs sm:text-sm text-amber-950 font-medium">
              💡 売上管理・振込明細は24時間いつでもStripeダッシュボードから確認・ダウンロード可能です。
            </div>
          </div>

          {/* 安全・コンプライアンス遵守事項 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-rose-200 shadow-xs space-y-3.5 print-avoid-break">
            <div className="flex items-center gap-2.5 text-rose-700 font-bold">
              <ShieldCheck className="w-6 h-6 text-rose-600" />
              <span className="text-base sm:text-lg text-slate-900 font-black">
                プラットフォーム利用規約 ＆ 安全・禁止事項
              </span>
            </div>
            <ul className="text-sm text-slate-700 space-y-2 list-disc list-inside leading-relaxed">
              <li>
                <strong>プラットフォーム外取引の厳禁:</strong> 顧客との直接金銭授受、LINEや個人連絡先を通じた中抜き取引は固く禁止されています。
              </li>
              <li>
                <strong>損害賠償保険の加入義務:</strong> 出張・施術中の対人・対物事故に備え、業務損害賠償責任保険への加入が必須です。
              </li>
              <li>
                <strong>プライバシーの遵守:</strong> 訪問先で知り得た顧客の個人情報・住居環境・健康情報は厳格な守秘義務が課されます。
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

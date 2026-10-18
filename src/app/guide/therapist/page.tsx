'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Car,
  CreditCard,
  Plus,
  ArrowRight,
  Sparkles,
  Home,
  Building,
  Navigation,
} from 'lucide-react';

export default function TherapistGuidePage() {
  return (
    <div className="space-y-8">
      {/* Title & Badge */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
            Role: Therapist Partner
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black mt-2">
          ② セラピスト向け 運用・操作マニュアル
        </h1>
        <p className="text-sm text-emerald-200 mt-2 max-w-2xl leading-relaxed">
          予約リクエストの受付・承認、出張時のリアルタイムGPS送信、シフト・受付エリア設定、メニュー管理、および売上受取の流れを解説します。
        </p>

        {/* 権限ナビゲーション (セラピストからは顧客向けガイドのみ閲覧可能。管理者へのリンクは無し) */}
        <div className="mt-6 pt-6 border-t border-emerald-800/80 flex flex-wrap items-center gap-3">
          <span className="text-xs text-emerald-300 font-semibold">顧客の利用イメージを確認:</span>
          <Link
            href="/guide/customer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow"
          >
            <span>③ 顧客向けご利用ガイドへ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* セクション 1: 予約リクエスト対応 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">1. 予約リクエストの受信と「承認 / 辞退」</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            顧客からの新規リクエストが届くと「承認待ち」として一覧表示されます。日時・施術メニュー・出張先住所・顧客メモを確認し、ワンタップで「承認して確定」または「辞退」を選択します。
          </p>
        </div>

        {/* セクション 2: 出張時のリアルタイムGPS送信 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <Car className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">2. 出張移動時の「現在地GPS送信」</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            出張施術へ向かう際、「GPS位置情報を送信」ボタンを押すことで、顧客の画面上にあるマップと到着予定時間（ETAカウントダウン）へ現在地がリアルタイムに共有されます。
          </p>
          <div className="p-3 bg-teal-50 rounded-2xl text-[11px] text-teal-900 font-medium">
            💡 Uber Eats の配達追跡と同様の安心感を顧客に提供できます。
          </div>
        </div>

        {/* セクション 3: スケジュール・出張エリア設定 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">3. 受付曜日・時間帯・出張可能エリア</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            「月〜日」の稼働可能曜日、および受付時間（例: 09:00〜21:00）を柔軟に指定できます。また、拠点からの「出張可能半径（3km〜30km）」をスライダーで設定可能です。
          </p>
        </div>

        {/* セクション 4: メニュー管理とStripe売上振込 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">4. メニュー管理 & Stripe Express 売上受取</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            施術時間や料金、施術内容をいつでも自由に追加・編集できます。施術完了を報告すると、プラットフォーム手数料（20%）が自動控除された純手取り報酬が Stripe Connect 経由で口座へ振り込まれます。
          </p>
        </div>
      </div>
    </div>
  );
}

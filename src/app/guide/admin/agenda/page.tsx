'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, HelpCircle, FileText, ExternalLink, Sparkles } from 'lucide-react';

export default function AgendaPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* ページタイトルヘッダー */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-700/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              役員・会長事前相談用
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              【事前相談・報告アジェンダ】「Care KURU」プロジェクト推進計画
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              決定済み仕様の前提共有と、推進にあたり会長のご判断・ご助言を仰ぎたい相談事項（全9項目）
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <a
              href="/documents/carekuru-agenda-a4.png"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              A4資料(PNG)
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* セクション 1: 決定事項のご報告（前提共有） */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">1</span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">決定事項のご報告（前提共有）</h2>
          </div>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            基本骨子 確定済
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-2.5 px-4 w-32 border-r border-slate-200">項目</th>
                <th className="py-2.5 px-4 w-72 border-r border-slate-200">決定内容</th>
                <th className="py-2.5 px-4">メリット・事業上の狙い</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-900 bg-slate-50/30 border-r border-slate-200">アプリ名称</td>
                <td className="py-3 px-4 font-bold text-emerald-800 border-r border-slate-200">
                  Care KURU（ケア・クル）
                </td>
                <td className="py-3 px-4 text-slate-600">
                  「ケアが来る」というオンデマンド出張ヘルスケアの明快な想起と親しみやすさ。
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-900 bg-slate-50/30 border-r border-slate-200">提供形態</td>
                <td className="py-3 px-4 font-semibold text-slate-900 border-r border-slate-200">
                  PWA（審査不要Webアプリ）
                </td>
                <td className="py-3 px-4 text-slate-600">
                  App Store規約・手数料（15〜30%）・審査落ちを回避し最速公開。ホーム画面追加で通常アプリと同様に動作。
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-900 bg-slate-50/30 border-r border-slate-200">セキュリティ</td>
                <td className="py-3 px-4 font-semibold text-slate-900 border-r border-slate-200">
                  Stripe Connect直接管理
                  <span className="block text-[11px] text-emerald-600 font-normal mt-0.5">※ゼロリスク設計</span>
                </td>
                <td className="py-3 px-4 text-slate-600">
                  免許証・口座情報を自社DBに一切保存せずStripeで管理。万一の攻撃時も漏洩する機密情報自体が存在しない設計。
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-900 bg-slate-50/30 border-r border-slate-200">信頼性担保</td>
                <td className="py-3 px-4 font-semibold text-slate-900 border-r border-slate-200">
                  5段階チェック体制
                </td>
                <td className="py-3 px-4 text-slate-600">
                  ①審査料 ②誓約書 ③Stripe本人確認 ④資格証原本確認 ⑤損害保険証書。<br />
                  <span className="text-[11px] text-slate-500">※資格証などの提出書類画像は目視確認後、即時自動破棄して安全運用。</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* セクション 2: 会長への相談・決裁事項 (全9項目) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-amber-50/80 px-4 py-3 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center text-xs font-bold">2</span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">会長への相談・決裁事項（全9項目）</h2>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
            役員決裁対象 全9項目
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3 w-12 text-center border-r border-slate-200">No</th>
                <th className="py-2.5 px-4 w-44 border-r border-slate-200">相談項目</th>
                <th className="py-2.5 px-4 w-72 border-r border-slate-200">検討案（背景）</th>
                <th className="py-2.5 px-4 bg-amber-50/50 text-amber-950 font-black">
                  会長への相談・確認内容（判断ポイント）
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {/* ① 施術者の入会金 */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-3 text-center font-bold text-amber-700 border-r border-slate-200">1</td>
                <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200">
                  <div>施術者入会金</div>
                  <span className="text-[11px] font-normal text-amber-600">（初期登録料）</span>
                </td>
                <td className="py-3 px-4 border-r border-slate-200 leading-relaxed text-slate-600">
                  初期は登録者を広く集めるため<strong className="text-emerald-700">「入会金0円（無料）」</strong>で開始。<br />
                  運営・マッチング安定後に、<strong className="text-slate-900">「入会金: メンバー1万円 / 外部少し高め」</strong>へ有料化する移行計画。
                </td>
                <td className="py-3 px-4 bg-amber-50/30 text-amber-950 leading-relaxed">
                  <div className="font-bold text-slate-900">
                    ・初期0円スタート ➔ 安定後に「入会金: メンバー1万円／外部少し高め」とする移行方針でよろしいでしょうか？
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    ・業界相場を踏まえ、適切な入会金水準や有料化のタイミングについて会長のご意見を伺えますでしょうか？
                  </div>
                </td>
              </tr>

              {/* ② 手数料率・粗利率 */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-3 text-center font-bold text-emerald-700 border-r border-slate-200">2</td>
                <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200">
                  <div>手数料率・粗利率</div>
                  <span className="text-[11px] font-normal text-emerald-600">手数料20%・粗利16.4%</span>
                </td>
                <td className="py-3 px-4 border-r border-slate-200 leading-relaxed text-slate-600">
                  ・予約手数料率（テイクレイト）: <strong className="text-slate-900">20%</strong>（相場20〜30%）<br />
                  ・Stripe決済手数料: <strong className="text-rose-600">▲ 約3.6%</strong>（クレカ決済実費）<br />
                  ・実質粗利益率: <strong className="text-emerald-700">約 16.4%</strong>（売上1万円あたり粗利1,640円）
                </td>
                <td className="py-3 px-4 bg-amber-50/30 text-amber-950 leading-relaxed">
                  <div className="font-bold text-slate-900">
                    1) 手数料率は「20%」の設定で問題ないでしょうか？（初期利用促進のためさらに低めにする案の要否）
                  </div>
                  <div className="font-bold text-slate-900 mt-1">
                    2) Stripe決済費控除後の実質粗利率（約16.4%）へのご意見。
                  </div>
                </td>
              </tr>

              {/* ③ 売上受取口座 */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-3 text-center font-bold text-blue-700 border-r border-slate-200">3</td>
                <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200">
                  <div>収益受取口座の指定</div>
                  <span className="text-[11px] font-normal text-blue-600">Stripe Connect連携</span>
                </td>
                <td className="py-3 px-4 border-r border-slate-200 leading-relaxed text-slate-600">
                  Stripeで集金したプラットフォーム手数料（20%）を受け取るメイン法人口座の登録。
                </td>
                <td className="py-3 px-4 bg-amber-50/30 text-amber-950 leading-relaxed">
                  <div className="font-bold text-slate-900">
                    プラットフォーム側の手数料収益を受け取る口座は、<span className="underline decoration-amber-500 font-black">どの法人名義（既存法人または新規管理口座等）</span>で登録・開設を進めるべきでしょうか？
                  </div>
                </td>
              </tr>

              {/* ④ 公開ドメイン・ブランド */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-3 text-center font-bold text-indigo-700 border-r border-slate-200">4</td>
                <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200">
                  <div>公開ドメイン・ブランド</div>
                  <span className="text-[11px] font-normal text-indigo-600">NEOFAMILYブランド活用</span>
                </td>
                <td className="py-3 px-4 border-r border-slate-200 leading-relaxed text-slate-600">
                  サービスの信頼性と安心感を担保するため、既存のNEOFAMILYブランド傘下でのWeb公開を想定。
                </td>
                <td className="py-3 px-4 bg-amber-50/30 text-amber-950 leading-relaxed">
                  <div className="font-bold text-slate-900">
                    1) 「NEOFAMILY」関連で活用可能なドメインはあるでしょうか？
                  </div>
                  <div className="font-bold text-slate-900 mt-1">
                    2) ある場合、そのサブドメイン（例: carekuru.neofamily.jp 等）を使用させていただくことは可能でしょうか？（2段階相談）
                  </div>
                </td>
              </tr>

              {/* ⑤ インフラ初期実費 */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-3 text-center font-bold text-purple-700 border-r border-slate-200">5</td>
                <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200">
                  <div>インフラ初期実費</div>
                  <span className="text-[11px] font-normal text-purple-600">予算・経費精算</span>
                </td>
                <td className="py-3 px-4 border-r border-slate-200 leading-relaxed text-slate-600">
                  データベース・認証基盤（Supabase等）の維持費。<br />
                  <span className="text-xs text-slate-500">（月額数千円〜1万円程度の実費経費）</span>
                </td>
                <td className="py-3 px-4 bg-amber-50/30 text-amber-950 leading-relaxed">
                  <div className="font-bold text-slate-900">
                    このシステム維持実費は、自己負担しても良いと考えておりますが、<span className="underline decoration-amber-500 font-black">プロジェクト経費として計上・精算</span>させていただけるでしょうか？
                  </div>
                </td>
              </tr>

              {/* ⑥ 損害賠償責任保険（NEO保険事業連携） */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-3 text-center font-bold text-rose-700 border-r border-slate-200">6</td>
                <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200">
                  <div>損害賠償責任保険</div>
                  <span className="text-[11px] font-normal text-rose-600 font-bold">NEO保険事業連携</span>
                </td>
                <td className="py-3 px-4 border-r border-slate-200 leading-relaxed text-slate-600">
                  出張訪問のため、施術事故（怪我等）に加え、<strong className="text-slate-900">「顧客宅の家具・家電破損（受託物物損）」</strong>は全職種共通リスク。原則、全専門職に保険加入を必須条件化。<br />
                  <span className="text-xs text-slate-500">（相談系職種も訪問時の物損リスクがあるため要加入）</span>
                </td>
                <td className="py-3 px-4 bg-amber-50/30 text-amber-950 leading-relaxed">
                  <div className="font-bold text-slate-900">
                    1) <span className="bg-amber-200/80 px-1 rounded text-amber-950">「NEO FAMILY 保険事業」</span>のサービス・相談枠を、登録専門職向けの推奨損害保険窓口として利用・連携させていただくことは可能でしょうか？
                  </div>
                  <div className="text-xs text-slate-700 mt-1.5">
                    2) 訪問型のため全職種必須とし、まずは専門職個人の加入徹底、規模拡大時に運営会社の包括保険を検討する2段階想定でよろしいでしょうか？
                  </div>
                </td>
              </tr>

              {/* ⑦ 残存個人情報保管（AI事業部連携） */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-3 text-center font-bold text-emerald-700 border-r border-slate-200">7</td>
                <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200">
                  <div>残存個人情報の保管</div>
                  <span className="text-[11px] font-normal text-emerald-600">AI事業部連携・保護</span>
                </td>
                <td className="py-3 px-4 border-r border-slate-200 leading-relaxed text-slate-600">
                  免許証や口座はStripe直接管理でゼロリスク化済だが、訪問に不可欠な<strong className="text-slate-900">「氏名・住所・電話番号」</strong>は自社DBで保管せざるを得ない。
                </td>
                <td className="py-3 px-4 bg-amber-50/30 text-amber-950 leading-relaxed">
                  <div className="font-bold text-slate-900">
                    残さざるを得ない個人情報の安全な暗号化保管・マスキング等について、<span className="underline decoration-amber-500 font-black">「AI事業部」に相談し設計チェックやアドバイスを伺うこと</span>は可能でしょうか？推奨の良い方法はございますか？
                  </div>
                </td>
              </tr>

              {/* ⑧ PR広報活動・集客方針 */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-3 text-center font-bold text-sky-700 border-r border-slate-200">8</td>
                <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200">
                  <div>PR広報活動・集客方針</div>
                  <span className="text-[11px] font-normal text-sky-600">広報・マーケティング</span>
                </td>
                <td className="py-3 px-4 border-r border-slate-200 leading-relaxed text-slate-600">
                  サービス公開初期の施術者・顧客双方の認知拡大に向けた広報・プロモーション・集客展開。
                </td>
                <td className="py-3 px-4 bg-amber-50/30 text-amber-950 leading-relaxed">
                  <div className="font-bold text-slate-900">
                    初期の<span className="underline decoration-amber-500 font-black">PR活動・広報マーケティング展開はどう進めるべきか？</span> グループ内リソースの活用等、会長のアイデア・ご意見を伺いたい。
                  </div>
                </td>
              </tr>

              {/* ⑨ システム構造チェック依頼（AI事業部） */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-3 text-center font-bold text-purple-700 border-r border-slate-200">9</td>
                <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200">
                  <div>システム構造チェック</div>
                  <span className="text-[11px] font-normal text-purple-600">AI事業部・技術監査</span>
                </td>
                <td className="py-3 px-4 border-r border-slate-200 leading-relaxed text-slate-600">
                  Next.js + Supabase + Stripe Connect の設計構造、権限管理・セキュリティ、将来の負荷耐性。
                </td>
                <td className="py-3 px-4 bg-amber-50/30 text-amber-950 leading-relaxed">
                  <div className="font-bold text-slate-900">
                    本番稼働前に万全を期すため、<span className="underline decoration-amber-500 font-black">「AI事業部」に依頼してシステム全体の構造チェック・セキュリティ技術レビュー</span>を行っていただくことは可能でしょうか？
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

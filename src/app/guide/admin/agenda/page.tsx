'use client';

import React from 'react';

export default function AgendaPage() {
  return (
    <div className="space-y-4 max-w-5xl mx-auto -mt-2">
      {/* タイトルのみのシンプルなヘッダー */}
      <div className="pb-2.5 border-b border-slate-300">
        <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
          【事前相談・報告アジェンダ】「Care KURU」プロジェクト推進計画
        </h1>
      </div>

      {/* ======================================================== */}
      {/* 第1部: 決定事項のご報告（前提共有） */}
      {/* ======================================================== */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-slate-700 text-white text-[10px] font-bold inline-flex items-center justify-center">1</span>
            <span>決定事項のご報告（前提共有・基本設計）</span>
          </h2>
          <span className="text-[10px] text-slate-500 font-medium">最速リリース＆ゼロリスク設計</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-300 shadow-2xs bg-white">
          <table className="w-full min-w-[650px] text-left border-collapse text-[11px] sm:text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                <th className="py-2 px-3 w-[20%] min-w-[120px] border-r border-slate-200">項目</th>
                <th className="py-2 px-3 w-[38%] min-w-[240px] border-r border-slate-200">決定内容・アーキテクチャ</th>
                <th className="py-2 px-3 w-[42%] min-w-[280px]">メリット・事業上の狙い</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              <tr className="hover:bg-slate-50/70">
                <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                  アプリ名称
                </td>
                <td className="py-2 px-3 font-semibold text-emerald-800 border-r border-slate-200">
                  Care KURU（ケア・クル）
                  <span className="text-[10px] font-normal text-slate-400 ml-1.5">※ロゴ検討中</span>
                </td>
                <td className="py-2 px-3 text-slate-600 leading-normal">
                  「ケアが来る・クルマで来る」オンデマンド出張ヘルスケアの明快な想起と親しみやすさ。
                </td>
              </tr>

              <tr className="hover:bg-slate-50/70">
                <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                  提供形態（PWA）
                </td>
                <td className="py-2 px-3 border-r border-slate-200">
                  <span className="font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded text-[11px] mr-1.5">アプリ風Web（審査不要）</span>
                  <span className="text-slate-600">ホーム画面追加で通常アプリ同様に動作</span>
                </td>
                <td className="py-2 px-3 text-slate-600 leading-normal">
                  <strong className="text-slate-900">App Store審査・規約リスク・初期ストア申請コストを完全回避。</strong> 最短で実用リリースが可能。
                </td>
              </tr>

              <tr className="hover:bg-slate-50/70">
                <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                  セキュリティ
                </td>
                <td className="py-2 px-3 border-r border-slate-200">
                  <span className="font-bold text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px] mr-1.5">Stripe連携（ゼロリスク）</span>
                  <span className="text-slate-600">免許証・口座は自社DBに一切保存せず</span>
                </td>
                <td className="py-2 px-3 text-slate-600 leading-normal">
                  万一の攻撃時も<strong className="text-slate-900">「そもそも盗まれる重要情報が存在しない」</strong>ため情報漏洩リスクを遮断（現在テスト運用中）。
                </td>
              </tr>

              <tr className="hover:bg-slate-50/70">
                <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                  信頼性担保
                </td>
                <td className="py-2 px-3 border-r border-slate-200">
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] mr-1.5">厳格な5段階チェック体制</span>
                  <span className="text-[10px] text-slate-500 block sm:inline">①審査料 ②誓約 ③Stripe確認 ④国家資格 ⑤保険証書</span>
                </td>
                <td className="py-2 px-3 text-slate-600 leading-normal">
                  提出された証明書画像は運営確認完了と同時に<strong className="text-slate-900">自動破棄</strong>（承認ログのみ保持し漏洩防止）。
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 第2部: 会長への相談・決裁事項（全6項目） */}
      {/* ======================================================== */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-amber-600 text-white text-[10px] font-bold inline-flex items-center justify-center">2</span>
            <span>会長への相談・決裁事項（全6項目）</span>
          </h2>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">要決裁</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-300 shadow-2xs bg-white">
          <table className="w-full min-w-[760px] text-left border-collapse text-[11px] sm:text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                <th className="py-2 px-2.5 w-9 text-center border-r border-slate-200">No</th>
                <th className="py-2 px-3 w-[18%] min-w-[130px] border-r border-slate-200">相談項目</th>
                <th className="py-2 px-3 w-[34%] min-w-[250px] border-r border-slate-200">検討案（背景）</th>
                <th className="py-2 px-3.5 w-[44%] min-w-[320px] bg-amber-50/70 text-amber-950">会長への相談・確認内容</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {/* ① 登録料・月額会費設定 */}
              <tr className="hover:bg-slate-50/70">
                <td className="py-2 px-2.5 text-center font-bold text-slate-500 border-r border-slate-200">
                  1
                </td>
                <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">
                  <div>施術者登録料・月額会費</div>
                  <span className="text-[10px] font-normal text-amber-700">初期供給数最大化</span>
                </td>
                <td className="py-2 px-3 border-r border-slate-200 leading-normal">
                  初期は登録者を増やすため<strong className="text-emerald-700">「無料（0円）」</strong>で開始し、安定後に<strong className="text-slate-900">「メンバー月額1万円 / 外部少し高め」</strong>へ移行する計画。
                </td>
                <td className="py-2 px-3.5 bg-amber-50/30 font-medium text-slate-900 leading-normal">
                  初期0円→安定後「メンバー1万円・外部高め」の段階移行でよいか？また相場を踏まえた価格水準や移行時期についてのご意見。
                </td>
              </tr>

              {/* ② 手数料率・想定利益率 */}
              <tr className="hover:bg-slate-50/70">
                <td className="py-2 px-2.5 text-center font-bold text-slate-500 border-r border-slate-200">
                  2
                </td>
                <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">
                  <div>手数料率・想定利益率</div>
                  <span className="text-[10px] font-normal text-emerald-700">手数料20%・粗利16.4%</span>
                </td>
                <td className="py-2 px-3 border-r border-slate-200 leading-normal">
                  <div className="space-y-0.5">
                    <div>・手数料率: <strong className="text-slate-900">20%</strong>（業界相場20〜30%）</div>
                    <div>・Stripe決済費: <span className="text-rose-600 font-semibold">▲約3.6%</span></div>
                    <div>・プラットフォーム粗利: <strong className="text-emerald-700">約16.4%</strong>（1万円で1,640円）</div>
                  </div>
                </td>
                <td className="py-2 px-3.5 bg-amber-50/30 font-medium text-slate-900 leading-normal">
                  1) 手数料率20%の設定で問題ないか？（初期は利用促進のためさらに低めにするか？）<br />
                  2) Stripe控除後の実質粗利率（約16.4%）および利益率設計へのご意見。
                </td>
              </tr>

              {/* ③ 収益受取口座 */}
              <tr className="hover:bg-slate-50/70">
                <td className="py-2 px-2.5 text-center font-bold text-slate-500 border-r border-slate-200">
                  3
                </td>
                <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">
                  <div>収益受取口座の指定</div>
                  <span className="text-[10px] font-normal text-blue-700">法人・税務</span>
                </td>
                <td className="py-2 px-3 border-r border-slate-200 leading-normal text-slate-600">
                  プラットフォーム利用料・会費・手数料決済を受け取るための、Stripe連携メイン口座の指定が必要。
                </td>
                <td className="py-2 px-3.5 bg-amber-50/30 font-medium text-slate-900 leading-normal">
                  プラットフォーム側の売上受取口座は、<strong>どの法人（または口座）</strong>に紐付ける形にするか？
                </td>
              </tr>

              {/* ④ 公開ドメイン */}
              <tr className="hover:bg-slate-50/70">
                <td className="py-2 px-2.5 text-center font-bold text-slate-500 border-r border-slate-200">
                  4
                </td>
                <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">
                  <div>公開URL・ドメイン確認</div>
                  <span className="text-[10px] font-normal text-indigo-700">ブランド信用力</span>
                </td>
                <td className="py-2 px-3 border-r border-slate-200 leading-normal text-slate-600">
                  安心感と信頼性を担保するため、既存のNEOFAMILYブランド傘下でのWebアプリ公開を想定。
                </td>
                <td className="py-2 px-3.5 bg-amber-50/30 font-medium text-slate-900 leading-normal">
                  1) 「NEOFAMILY」関連で活用可能なドメインはあるか？<br />
                  2) ある場合、サブドメイン（例: carekuru.neofamily.jp 等）を使用させていただけるか？
                </td>
              </tr>

              {/* ⑤ インフラ初期経費 */}
              <tr className="hover:bg-slate-50/70">
                <td className="py-2 px-2.5 text-center font-bold text-slate-500 border-r border-slate-200">
                  5
                </td>
                <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">
                  <div>インフラ初期実費経費</div>
                  <span className="text-[10px] font-normal text-purple-700">予算・経費精算</span>
                </td>
                <td className="py-2 px-3 border-r border-slate-200 leading-normal text-slate-600">
                  データベース・認証基盤（Supabase等）の維持費（月額数千円〜1万円程度）。
                </td>
                <td className="py-2 px-3.5 bg-amber-50/30 font-medium text-slate-900 leading-normal">
                  自己負担も可能だが、<strong>プロジェクト経費として計上・精算</strong>させていただけるか？
                </td>
              </tr>

              {/* ⑥ 事業賠償責任保険 */}
              <tr className="hover:bg-slate-50/70">
                <td className="py-2 px-2.5 text-center font-bold text-slate-500 border-r border-slate-200">
                  6
                </td>
                <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">
                  <div>事業賠償責任保険の時期</div>
                  <span className="text-[10px] font-normal text-rose-700">リスク管理</span>
                </td>
                <td className="py-2 px-3 border-r border-slate-200 leading-normal text-slate-600">
                  施術者個人の損害保険加入は必須。プラットフォーム（運営会社）全体としての事業保険の要否。
                </td>
                <td className="py-2 px-3.5 bg-amber-50/30 font-medium text-slate-900 leading-normal">
                  スタート時は個人の保険徹底で立ち上げ、<strong>本格稼働・規模拡大時に会社として包括加入する2段階想定</strong>でよいか？
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

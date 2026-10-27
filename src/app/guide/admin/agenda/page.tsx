'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ZoomIn, Download, ExternalLink } from 'lucide-react';

export default function AgendaPage() {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* 1枚物アジェンダ資料画像 */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-2 sm:p-4 overflow-hidden">
        <div className="relative group cursor-pointer" onClick={() => setIsZoomed(true)}>
          <img
            src="/documents/carekuru-agenda-a4.svg"
            alt="【事前相談・報告アジェンダ】「Care KURU」プロジェクト推進計画"
            className="w-full h-auto rounded-xl shadow-xs transition-transform duration-200 group-hover:scale-[1.005]"
          />

          {/* ホバー時の拡大ヒント */}
          <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center pointer-events-none">
            <span className="bg-slate-900/80 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm shadow-md">
              <ZoomIn className="w-4 h-4" />
              タップして拡大表示
            </span>
          </div>
        </div>

        {/* 下部アクションリンク */}
        <div className="pt-3 px-2 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px]">※画像をタップすると全画面で拡大できます</span>
          <div className="flex items-center gap-3">
            <a
              href="/documents/carekuru-agenda-a4.png"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              高解像度PNGで開く
            </a>
            <a
              href="/documents/carekuru-agenda-a4.png"
              download="CareKURU_会長事前相談アジェンダ.png"
              className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              画像を保存
            </a>
          </div>
        </div>
      </div>

      {/* 拡大ライトボックスモーダル */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 overflow-auto animate-fadeIn cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-5xl w-full max-h-[96vh] overflow-y-auto rounded-2xl shadow-2xl bg-white p-1 sm:p-2">
            <img
              src="/documents/carekuru-agenda-a4.svg"
              alt="Care KURU アジェンダ拡大表示"
              className="w-full h-auto rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

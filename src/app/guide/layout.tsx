'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ArrowLeft } from 'lucide-react';

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentBrand } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Guide Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-sm"
              dangerouslySetInnerHTML={{ __html: currentBrand.iconSvg }}
            />
            <div>
              <span className="text-lg font-black bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent">
                {currentBrand.japaneseName}
              </span>
              <span className="text-xs text-slate-400 ml-2 font-medium">Docs & Manuals</span>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>アプリトップに戻る</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Guide Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400 print:hidden">
        <p>{currentBrand.japaneseName} ({currentBrand.name}) Platform Operations & Architecture Manuals</p>
      </footer>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { HeartPulse, ArrowLeft } from 'lucide-react';

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Guide Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
                CareHub
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
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>CareHub Platform Operations & Architecture Manuals</p>
      </footer>
    </div>
  );
}

'use client';

import { useEffect } from 'react';

export default function AdminIndexPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.replace('/admin/therapists');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-300">管理コンソールへ移動中...</p>
      </div>
    </div>
  );
}

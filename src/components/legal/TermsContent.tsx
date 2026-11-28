'use client';

import React, { useEffect, useState } from 'react';
import { Users, Award } from 'lucide-react';
import { CustomerTermsContent } from './CustomerTermsContent';
import { TherapistTermsContent } from './TherapistTermsContent';

interface TermsContentProps {
  defaultTab?: 'customer' | 'therapist';
}

export const TermsContent: React.FC<TermsContentProps> = ({ defaultTab = 'customer' }) => {
  const [activeTab, setActiveTab] = useState<'customer' | 'therapist'>(defaultTab);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'therapist' || tab === 'customer') {
      setActiveTab(tab);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* 利用者向け / 施術者向け 切り替えタブ */}
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('customer')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'customer'
              ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>利用者（お客様）向け規約</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('therapist')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'therapist'
              ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 shrink-0" />
          <span>施術者（セラピスト）向け規約</span>
        </button>
      </div>

      {activeTab === 'customer' ? <CustomerTermsContent /> : <TherapistTermsContent />}
    </div>
  );
};

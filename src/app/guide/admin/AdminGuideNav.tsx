'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Crown,
  Presentation,
  Award,
  ShieldCheck,
  Printer,
} from 'lucide-react';

interface AdminGuideNavProps {
  currentTab?: 'agenda' | 'pitch' | 'proposal' | 'operations';
}

export const AdminGuideNav: React.FC<AdminGuideNavProps> = ({ currentTab }) => {
  const pathname = usePathname();

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const navItems = [
    {
      id: 'agenda',
      href: '/guide/admin/agenda',
      label: '👑 会長事前相談・決裁アジェンダ',
      badge: '重要',
      icon: Crown,
      isActive: currentTab === 'agenda' || pathname === '/guide/admin/agenda' || pathname === '/guide/admin',
      activeClass: 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/50',
      badgeClass: 'bg-white/20 text-white',
    },
    {
      id: 'pitch',
      href: '/guide/admin/pitch',
      label: '🎤 5分ピッチ構成案（400名・熱狂版）',
      badge: 'Keynote',
      icon: Presentation,
      isActive: currentTab === 'pitch' || pathname === '/guide/admin/pitch' || pathname === '/guide/admin/presentation',
      activeClass: 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-md',
      badgeClass: 'bg-emerald-500/30 text-emerald-300',
    },
    {
      id: 'proposal',
      href: '/guide/admin/proposal',
      label: '専門職拡大構想・事業計画',
      icon: Award,
      isActive: currentTab === 'proposal' || pathname === '/guide/admin/proposal',
      activeClass: 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-md',
    },
    {
      id: 'operations',
      href: '/guide/admin/operations',
      label: '統括実務運用マニュアル',
      icon: ShieldCheck,
      isActive: currentTab === 'operations' || pathname === '/guide/admin/operations',
      activeClass: 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-md',
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#1c1c1e] p-4 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xs print:hidden transition-colors">
      <div className="flex flex-wrap items-center gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                item.isActive
                  ? item.activeClass
                  : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/15'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold hidden sm:inline ${item.badgeClass || ''}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold rounded-2xl transition cursor-pointer border border-slate-200 dark:border-white/10"
          title="A4形式で印刷またはPDF保存できます"
        >
          <Printer className="w-4 h-4" />
          <span>A4印刷 / PDF保存</span>
        </button>
      </div>
    </div>
  );
};

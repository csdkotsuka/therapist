'use client';

import React from 'react';
import { LoginForm } from './LoginForm';
import { useApp } from '@/context/AppContext';
import { X, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { currentBrand, currentUser } = useApp();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 max-w-md w-full p-6 sm:p-7 relative overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="閉じる"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ヘッダーブランド表示 */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs border border-slate-200 bg-white flex items-center justify-center shrink-0">
            {currentBrand.iconUrl ? (
              <img
                src={currentBrand.iconUrl}
                alt={currentBrand.japaneseName}
                className="w-full h-full object-contain p-0.5"
              />
            ) : (
              <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: currentBrand.iconSvg }}
              />
            )}
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {currentBrand.japaneseName} ログイン
            </h2>
            <p className="text-[10px] text-slate-400">スムーズ認証（LINE / Google / Passkey）</p>
          </div>
        </div>

        {/* ログインフォームコンポーネント */}
        <LoginForm
          initialRole={currentUser.role === 'admin' ? 'admin' : currentUser.role === 'therapist' ? 'therapist' : 'customer'}
          onSuccess={() => {
            setTimeout(() => {
              onClose();
            }, 500);
          }}
          isModal
        />
      </div>
    </div>
  );
};

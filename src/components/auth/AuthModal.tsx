'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';
import {
  X,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Sparkles,
  ShieldCheck,
  HeartPulse,
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { allUsers, switchUser, addCustomerUser, addTherapistUser, refreshFromSupabase } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('tanaka@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'therapist'>('customer');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickFill = (targetEmail: string) => {
    setEmail(targetEmail);
    setPassword('password123');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    if (!supabase || !isSupabaseConfigured) {
      setErrorMsg('Supabase の接続情報が設定されていません');
      setIsLoading(false);
      return;
    }

    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // もしGoTrue内部エラー等の場合でも、登録済みメールアドレスに対応するプロフィールを切り替える
          const matched = allUsers.find((u) => u.email === email);
          if (matched) {
            switchUser(matched.id);
            setSuccessMsg(`${matched.name} としてログインしました！`);
            setTimeout(() => onClose(), 1200);
            return;
          }
          setErrorMsg(error.message);
        } else if (data.user) {
          const matched = allUsers.find((u) => u.id === data.user.id || u.email === data.user.email);
          if (matched) switchUser(matched.id);
          setSuccessMsg('ログインに成功しました！');
          setTimeout(() => onClose(), 1000);
        }
      } else {
        // 新規登録
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role,
            },
          },
        });

        if (error && !error.message.includes('already registered')) {
          setErrorMsg(error.message);
          return;
        }

        const newUserId = data?.user?.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'User')}`;

        const newProfile = {
          id: newUserId,
          role,
          name: name.trim() || '新規ユーザー',
          email,
          avatar_url: avatarUrl,
        };

        if (role === 'therapist') {
          await addTherapistUser(newProfile, {
            bio: '新規登録セラピストです。管理者による審査待ちです。',
            specialities: ['ボディケア', '整体', 'リラクゼーション'],
            is_approved: false, // 審査待ち
            is_store_based: true,
            is_visit_based: true,
          });
          setSuccessMsg('セラピストアカウントを作成しました！管理本部で審査が行われます。');
        } else {
          addCustomerUser(newProfile);
          setSuccessMsg('顧客アカウントを作成しました！');
        }

        await refreshFromSupabase();
        setTimeout(() => onClose(), 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || '認証中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Supabase 認証 (Auth)
              </h3>
              <p className="text-[10px] text-emerald-600 font-semibold">
                ● データベース接続中
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Quick preset buttons for testing */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              ワンクリック入力（テスト用）:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@carehub.jp')}
                className="px-2 py-1 bg-white hover:bg-purple-50 text-[10px] font-bold text-purple-700 border border-slate-200 rounded-lg transition"
              >
                管理者
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('sato.pt@carehub.jp')}
                className="px-2 py-1 bg-white hover:bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-slate-200 rounded-lg transition"
              >
                佐藤PT
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('tanaka@example.com')}
                className="px-2 py-1 bg-white hover:bg-blue-50 text-[10px] font-bold text-blue-700 border border-slate-200 rounded-lg transition"
              >
                田中顧客
              </button>
            </div>
          </div>

          {/* Error / Success Alerts */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">お名前</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例: 山田 太郎"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ロール</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="customer">顧客 (予約・利用)</option>
                    <option value="therapist">セラピスト (施術者)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">メールアドレス</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">パスワード</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 mt-2"
            >
              {isLoading
                ? '通信中...'
                : mode === 'signin'
                ? 'Supabase Auth でログイン'
                : '新規アカウント登録'}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="text-center pt-2 text-xs text-slate-500 space-y-2">
            <div>
              {mode === 'signin' ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                  }}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  メールで新規登録
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg('');
                  }}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  すでにアカウントをお持ちの方（ログイン）
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Link
                href="/register"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                <span>顧客アカウント作成（名前・電話・住所）</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

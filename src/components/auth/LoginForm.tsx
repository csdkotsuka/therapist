'use client';

// ========================================================
// ログイン・新規登録フォーム（Supabase Auth）
//   - targetRole ('customer' | 'therapist' | 'admin') に応じた専用画面
//   - 役割不一致アカウントの厳格遮断
// ========================================================
import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertCircle, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getSupabase } from '@/lib/supabase';
import { getLiffIdToken, lineLoginUrl, signInWithLiffToken } from '@/lib/line';
import { safeRedirectPath } from '@/lib/redirect';
import type { UserRole } from '@/types';

interface LoginFormProps {
  targetRole?: UserRole;
  initialRole?: UserRole;
  /** URL の ?error= の値（ログイン失敗時にサーバーから戻される） */
  errorCode?: string;
  onSuccess?: (role: UserRole) => void;
  redirectTo?: string;
  isModal?: boolean;
}

const URL_ERRORS: Record<string, string> = {
  LINE_NOT_CONFIGURED: 'LINE ログインはまだ設定されていません（LINE Channel ID / Secret が未設定です）。',
  AUTH_CANCELLED: 'ログインがキャンセルされました。',
  INVALID_STATE: 'ログインの有効期限が切れました。もう一度お試しください。',
  TOKEN_EXCHANGE_FAILED: 'LINE との認証に失敗しました。もう一度お試しください。',
  ID_TOKEN_INVALID: 'LINE の認証情報を確認できませんでした。',
  SERVER_NOT_CONFIGURED: 'サーバー設定（SUPABASE_SERVICE_ROLE_KEY）が未完了のため LINE ログインを利用できません。',
  SERVER_ERROR: 'サーバーエラーが発生しました。時間をおいて再度お試しください。',
  AUTH_CALLBACK_FAILED: 'ログイン処理を完了できませんでした。リンクの有効期限切れの可能性があります。',
  UNAUTHORIZED_ACCOUNT: 'このアカウントは利用が許可されていません。指定されたアカウントでログインしてください。',
};

function authErrorMessage(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'メールアドレスまたはパスワードが正しくありません。';
  if (/email not confirmed/i.test(message)) return 'メールアドレスの確認が完了していません。届いた確認メールのリンクを開いてください。';
  if (/already registered|already exists/i.test(message)) return 'このメールアドレスは既に登録されています。ログインしてください。';
  if (/password should be at least|weak password/i.test(message)) return 'パスワードは8文字以上で、推測されにくいものを設定してください。';
  if (/provider is not enabled|unsupported provider/i.test(message)) return 'この認証方法は現在利用できません（Supabase で未設定です）。';
  if (/rate limit/i.test(message)) return '試行回数が多すぎます。しばらく待ってから再度お試しください。';
  return '認証に失敗しました。入力内容を確認してもう一度お試しください。';
}

const homeFor = (role: UserRole | null | undefined) => (role === 'admin' ? '/admin' : role === 'therapist' ? '/therapist' : '/');

export const LoginForm: React.FC<LoginFormProps> = ({
  targetRole,
  initialRole = 'customer',
  errorCode,
  onSuccess,
  redirectTo,
  isModal = false,
}) => {
  const { currentBrand } = useApp();
  const supabase = getSupabase();

  const effectiveRole: UserRole = targetRole ?? initialRole;
  const [activeRole, setActiveRole] = useState<UserRole>(effectiveRole);
  const [authMode] = useState<'login' | 'register'>('login');
  
  // セラピスト・管理者は直接メール・パスワード入力画面を開く
  const initialStep = effectiveRole === 'therapist' || effectiveRole === 'admin' ? 'email_input' : 'select_provider';
  const [step, setStep] = useState<'select_provider' | 'email_input' | 'working' | 'check_email'>(initialStep);
  const [statusText, setStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState(errorCode ? URL_ERRORS[errorCode] ?? 'ログインに失敗しました。' : '');

  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const isRegister = authMode === 'register' && activeRole !== 'admin';
  const safeRedirect = redirectTo ? safeRedirectPath(redirectTo) : null;

  const finish = (role: UserRole | null) => {
    if (onSuccess && role) onSuccess(role);
    window.location.assign(safeRedirect ?? homeFor(role));
  };

  // LINE アプリ内（LIFF）で開かれた場合の自動ログイン
  useEffect(() => {
    let cancelled = false;
    getLiffIdToken().then(async (idToken) => {
      if (!idToken || cancelled) return;
      setStep('working');
      setStatusText('LINE アカウントでログインしています...');
      try {
        window.location.assign(await signInWithLiffToken(idToken, activeRole, safeRedirect ?? '/'));
      } catch (e) {
        setStep('select_provider');
        setErrorMessage(e instanceof Error ? e.message : 'LINE ログインに失敗しました。');
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLine = () => {
    setErrorMessage('');
    setStep('working');
    setStatusText('LINE の認証画面へ移動しています...');
    window.location.assign(lineLoginUrl(activeRole, safeRedirect ?? homeFor(activeRole)));
  };

  const handleGoogle = async () => {
    if (!supabase) return setErrorMessage('Supabase が設定されていません。');
    setErrorMessage('');
    setStep('working');
    setStatusText('Google の認証画面へ移動しています...');
    const next = safeRedirect ?? homeFor(activeRole);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      setStep('select_provider');
      setErrorMessage(authErrorMessage(error.message));
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return setErrorMessage('Supabase が設定されていません。');
    setErrorMessage('');

    const email = emailInput.trim();
    if (!email || !passwordInput) return setErrorMessage('メールアドレスとパスワードを入力してください。');

    setStep('working');
    setStatusText('ログインしています...');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: passwordInput });
    if (error || !data.user) {
      setStep('email_input');
      return setErrorMessage(authErrorMessage(error?.message ?? ''));
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
    const actualRole = (profile?.role as UserRole | undefined) ?? null;

    if (!actualRole) {
      await supabase.auth.signOut();
      setStep('email_input');
      return setErrorMessage('アカウントの役割情報が見つかりません。管理者にお問い合わせください。');
    }

    const expectedRole = targetRole ?? activeRole;
    if (actualRole !== expectedRole) {
      await supabase.auth.signOut();
      setStep('email_input');
      const rolePortals: Record<UserRole, { name: string; url: string }> = {
        admin: { name: '管理・運営本部', url: '/admin/login' },
        therapist: { name: 'セラピスト', url: '/therapist/login' },
        customer: { name: 'お客様（顧客）', url: '/login' },
      };
      const portal = rolePortals[actualRole] ?? { name: '別区分', url: '/login' };
      return setErrorMessage(
        `このアカウントは「${portal.name}」用です。「${portal.name}専用ログイン画面（${portal.url}）」からログインしてください。`
      );
    }

    finish(actualRole);
  };

  const selectRole = (role: UserRole) => {
    setActiveRole(role);
    setStep(role === 'therapist' || role === 'admin' ? 'email_input' : 'select_provider');
    setErrorMessage('');
  };

  const roleCard = (
    role: UserRole,
    icon: React.ReactNode,
    title: string,
    desc: string,
    activeBorder: string,
    activeBg: string,
    activeText: string,
    badgeText: string
  ) => {
    const isSelected = activeRole === role;
    return (
      <button
        type="button"
        onClick={() => selectRole(role)}
        className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
          isSelected
            ? `${activeBorder} ${activeBg} shadow-xs ring-2 ring-emerald-500/10`
            : 'border-slate-200 bg-white hover:bg-slate-50/80 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base font-bold transition ${
              isSelected ? activeText : 'bg-slate-100 text-slate-500'
            }`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <div className={`text-xs sm:text-sm ${isSelected ? 'text-slate-900 font-black' : 'text-slate-700 font-bold'}`}>
              {title}
            </div>
            <div className="text-[11px] text-slate-400 truncate">{desc}</div>
          </div>
        </div>
        <div className="shrink-0 flex items-center">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isSelected
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            {isSelected ? '選択中' : badgeText}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className={isModal ? '' : 'w-full'}>
      {/* 独立した画面（targetRole 指定時）は切り替えボタンを非表示、未指定時のみ縦並びカードを表示 */}
      {!targetRole && (
        <div className="space-y-2 mb-5">
          <label className="block text-xs font-bold text-slate-500 mb-1.5">ログイン区分を選択してください</label>
          {roleCard(
            'customer',
            '👤',
            'お客様（顧客）ログイン',
            '予約確認・セラピスト検索・予約履歴',
            'border-emerald-600',
            'bg-emerald-50/50',
            'bg-emerald-100 text-emerald-800',
            '一般'
          )}
          {roleCard(
            'therapist',
            '💆',
            'セラピスト ログイン',
            '受付管理・スケジュール設定・プロフィール',
            'border-indigo-600',
            'bg-indigo-50/50',
            'bg-indigo-100 text-indigo-800',
            'セラピスト'
          )}
          {roleCard(
            'admin',
            <ShieldCheck className="w-4 h-4 text-amber-500" />,
            '管理・運営本部 ログイン',
            'プラットフォーム全体管理・セラピスト審査',
            'border-slate-800',
            'bg-slate-100/70',
            'bg-slate-900 text-amber-400',
            '管理者'
          )}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <p className="leading-relaxed">{errorMessage}</p>
        </div>
      )}

      {step === 'working' && (
        <div className="py-12 px-4 text-center space-y-4 animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
          <div className="text-sm font-bold text-slate-800">{statusText}</div>
        </div>
      )}

      {step === 'check_email' && (
        <div className="py-10 px-4 text-center space-y-3 animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="text-base font-black text-slate-900">確認メールを送信しました</h3>
          <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
            {emailInput} に届いたメールのリンクを開くと、登録が完了してログインします。
          </p>
        </div>
      )}

      {step === 'email_input' && (
        <form onSubmit={handleEmailSubmit} className="space-y-4 animate-fadeIn">
          {targetRole !== 'admin' && targetRole !== 'therapist' && (
            <h3 className="text-base font-bold text-slate-900 text-center">
              メールアドレスでログイン
            </h3>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-bold text-slate-700 mb-1">
              メールアドレス（ログインID）
            </label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              placeholder={
                activeRole === 'admin'
                  ? 'kotsuka@creativesd.net'
                  : activeRole === 'therapist'
                  ? 'therapist.1@carehub.ehime.jp'
                  : 'customer.1@example.com'
              }
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-bold text-slate-700 mb-1">
              パスワード
            </label>
            <input
              id="auth-password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-emerald-500"
            />
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                activeRole === 'admin'
                  ? 'bg-slate-900 hover:bg-slate-800'
                  : activeRole === 'therapist'
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>ログインする</span>
            </button>
            {activeRole === 'customer' && !targetRole && (
              <button
                type="button"
                onClick={() => setStep('select_provider')}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 transition"
              >
                ← LINE・Googleログインに戻る
              </button>
            )}
          </div>
        </form>
      )}

      {step === 'select_provider' && (
        <div className="space-y-4 animate-fadeIn">
          {activeRole === 'customer' && (
            <>
              <button
                type="button"
                onClick={handleLine}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-3 hover:brightness-105"
                style={{ backgroundColor: '#06C755' }}
              >
                <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.019 9.572.391.082.923.254 1.058.583.12.295.079.757.038 1.053l-.161 1.059c-.048.318-.237 1.243 1.09.678 1.327-.565 7.165-4.223 9.774-7.227 1.48-1.637 2.182-3.344 2.182-5.718z" />
                </svg>
                <span className="tracking-wide">LINE でログイン</span>
              </button>

              <button
                type="button"
                onClick={handleGoogle}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.675-5.17 3.675-9.15z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.15C3.26 21.36 7.34 24 12 24z" />
                  <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.28C.46 8.23 0 10.06 0 12s.46 3.77 1.28 5.39l3.99-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.28 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.73-4.96z" />
                </svg>
                <span className="tracking-wide">Google アカウントでログイン</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setStep('email_input');
              setErrorMessage('');
            }}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-2xs transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <Mail className="w-5 h-5 text-slate-600 shrink-0" />
            <span className="tracking-wide">メールアドレスとパスワードでログイン</span>
          </button>

          <p className="text-[11px] text-center text-slate-400 pt-2 leading-relaxed">
            ログインすることで、{currentBrand.name}の
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline mx-0.5">利用規約</a>
            および
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline mx-0.5">プライバシーポリシー</a>
            に同意したものとみなされます。
          </p>
        </div>
      )}
    </div>
  );
};

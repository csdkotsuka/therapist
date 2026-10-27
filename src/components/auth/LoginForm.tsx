'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  KeyRound,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  Sparkles,
  Lock,
  Smartphone,
  ChevronDown,
  Mail,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface LoginFormProps {
  initialRole?: UserRole;
  onSuccess?: (role: UserRole) => void;
  redirectTo?: string;
  isModal?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  initialRole = 'customer',
  onSuccess,
  redirectTo,
  isModal = false,
}) => {
  const router = useRouter();
  const { allUsers, switchUser } = useApp();

  const [activeRole, setActiveRole] = useState<UserRole>(initialRole);
  const [authStep, setAuthStep] = useState<'select_provider' | 'passkey_required' | 'authenticating' | 'success'>('select_provider');
  const [selectedProvider, setSelectedProvider] = useState<'line' | 'google' | null>(null);
  const [statusText, setStatusText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 開発・テスト用メールログインのアコーディオン開閉
  const [showEmailLogin, setShowEmailLogin] = useState<boolean>(false);
  const [customEmail, setCustomEmail] = useState<string>('');

  // 各ロールの代表モックユーザー
  const representativeUsers: Record<UserRole, { id: string; name: string; email: string }> = {
    customer: {
      id: 'd68b1a8b-fa70-4895-a799-e42e68e6d108',
      name: '渡部 大輔',
      email: 'customer.1@example.com',
    },
    therapist: {
      id: 'ddadeee4-9c54-460e-b2b2-cf0b55025fea',
      name: '松田 美穂',
      email: 'therapist.1@carehub.ehime.jp',
    },
    admin: {
      id: '6ecacd4b-8d2a-4b06-8cc3-a3cca87a3f12',
      name: '愛媛プラットフォーム運営本部',
      email: 'admin@carehub.ehime.jp',
    },
  };

  // ソーシャル認証クリック時（LINE / Google）
  const handleSocialLogin = (provider: 'line' | 'google') => {
    setSelectedProvider(provider);
    setErrorMessage('');

    if (activeRole === 'admin') {
      // 管理者はLINE/Googleの後にPasskey必須！
      setStatusText(`${provider === 'line' ? 'LINE' : 'Google'} 認証成功。Passkey生体認証へ進みます...`);
      setAuthStep('authenticating');

      setTimeout(() => {
        setAuthStep('passkey_required');
      }, 700);
    } else {
      // 顧客またはセラピストはそのままログイン完了
      completeLogin(provider);
    }
  };

  // Passkey認証実行（管理者用）
  const handlePasskeyAuth = async () => {
    setAuthStep('authenticating');
    setStatusText('Face ID / Touch ID / セキュリティキー を照合中...');

    try {
      // ブラウザがWebAuthnをサポートしている場合のシミュレーション / 呼び出し
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        // 将来的なリアルWebAuthn API呼び出しポイント
        // await navigator.credentials.get({ publicKey: ... });
      }

      // ダミー認証のスムーズな完了体験
      setTimeout(() => {
        completeLogin(selectedProvider || 'google', true);
      }, 900);
    } catch (err) {
      setErrorMessage('Passkey認証に失敗しました。もう一度お試しください。');
      setAuthStep('passkey_required');
    }
  };

  // ログイン完了処理
  const completeLogin = (provider: 'line' | 'google', withPasskey = false) => {
    setAuthStep('authenticating');
    setStatusText('ログイン情報を同期中...');

    setTimeout(() => {
      const targetUser = representativeUsers[activeRole];
      const found = allUsers.find((u) => u.id === targetUser.id) || allUsers.find((u) => u.role === activeRole);

      if (found) {
        switchUser(found.id);
      } else {
        switchUser(targetUser.id);
      }

      setAuthStep('success');
      setStatusText(
        withPasskey
          ? `Passkey生体認証が完了しました！ ${targetUser.name} としてログイン`
          : `${provider === 'line' ? 'LINE' : 'Google'} でログインしました！ (${targetUser.name})`
      );

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // confetti fallback
      }

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(activeRole);
        }

        if (redirectTo) {
          router.push(redirectTo);
        } else {
          // デフォルトのリダイレクト先
          if (activeRole === 'admin') {
            router.push('/admin');
          } else if (activeRole === 'therapist') {
            router.push('/therapist');
          } else {
            router.push('/');
          }
        }
      }, 1000);
    }, 600);
  };

  // テスト用メールログイン切り替え
  const handleEmailDirectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const match = allUsers.find((u) => u.email.toLowerCase() === customEmail.toLowerCase());
    if (match) {
      switchUser(match.id);
      setAuthStep('success');
      setStatusText(`${match.name} (${match.role}) としてログインしました`);
      setTimeout(() => {
        if (onSuccess) onSuccess(match.role);
        if (match.role === 'admin') router.push('/admin');
        else if (match.role === 'therapist') router.push('/therapist');
        else router.push('/');
      }, 800);
    } else {
      setErrorMessage('該当する登録メールアドレスが見つかりませんでした');
    }
  };

  return (
    <div className="w-full">
      {/* 1. ロール切り替えセグメントタブ (顧客 / セラピスト / 管理) */}
      <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 mb-6 border border-slate-200/80">
        <button
          type="button"
          onClick={() => {
            setActiveRole('customer');
            setAuthStep('select_provider');
            setErrorMessage('');
          }}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeRole === 'customer'
              ? 'bg-white text-emerald-700 shadow-xs scale-[1.02]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <span className="text-sm">👤</span>
          <span>お客様</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveRole('therapist');
            setAuthStep('select_provider');
            setErrorMessage('');
          }}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeRole === 'therapist'
              ? 'bg-white text-indigo-700 shadow-xs scale-[1.02]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <span className="text-sm">💆</span>
          <span>セラピスト</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveRole('admin');
            setAuthStep('select_provider');
            setErrorMessage('');
          }}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeRole === 'admin'
              ? 'bg-slate-900 text-white shadow-xs scale-[1.02]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>管理・運営</span>
        </button>
      </div>

      {/* エラーメッセージ */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. 状態別コンテンツ表示 */}
      {/* 2-A: ローディング・認証中 */}
      {authStep === 'authenticating' && (
        <div className="py-12 px-4 text-center space-y-4 animate-fadeIn">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 animate-ping absolute opacity-40"></div>
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-800">{statusText}</div>
          <div className="text-xs text-slate-400">暗号化通信で認証情報を検証しています</div>
        </div>
      )}

      {/* 2-B: ログイン成功 */}
      {authStep === 'success' && (
        <div className="py-10 px-4 text-center space-y-3 animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="text-base font-black text-slate-900">認証に成功しました！</h3>
          <p className="text-xs text-slate-600 max-w-xs mx-auto">{statusText}</p>
          <div className="text-[11px] text-emerald-700 font-semibold animate-pulse pt-2">
            画面を移動しています...
          </div>
        </div>
      )}

      {/* 2-C: 管理者専用 Passkey（生体認証）要求ステップ */}
      {authStep === 'passkey_required' && activeRole === 'admin' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg border border-indigo-800/40 text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              ステップ 2 / 2: Passkey認証（必須）
            </div>

            <div className="py-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner group">
                <Fingerprint className="w-9 h-9 text-indigo-300 animate-pulse" />
              </div>
            </div>

            <div>
              <h3 className="text-base font-black text-white">Passkeyで本人確認</h3>
              <p className="text-xs text-slate-300 mt-1">
                端末の Face ID / Touch ID またはセキュリティキーで管理者権限をロック解除します
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handlePasskeyAuth}
                className="w-full py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Fingerprint className="w-5 h-5 text-slate-950" />
                <span>Passkey（生体認証）でログイン</span>
              </button>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>第1認証: {selectedProvider === 'line' ? 'LINE連携済' : 'Google認証済'}</span>
              <button
                type="button"
                onClick={() => setAuthStep('select_provider')}
                className="text-slate-300 hover:text-white underline"
              >
                やり直す
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2-D: 通常のプロバイダ選択ステップ (LINE / Google) */}
      {authStep === 'select_provider' && (
        <div className="space-y-4 animate-fadeIn">
          {/* 見出し説明 */}
          <div className="text-center space-y-1 mb-2">
            <h3 className="text-base font-bold text-slate-900">
              {activeRole === 'customer' && 'お客様アカウントでログイン'}
              {activeRole === 'therapist' && 'セラピスト専用ログイン'}
              {activeRole === 'admin' && '運営本部・管理者ログイン'}
            </h3>
            <p className="text-xs text-slate-500">
              {activeRole === 'customer' && 'LINEまたはGoogleで簡単ログイン。予約やチャットを管理できます。'}
              {activeRole === 'therapist' && 'LINE通知連携で、新規予約や変更リクエストを即座に受信できます。'}
              {activeRole === 'admin' && '※LINE/Google認証後、Passkey（生体認証）による承認が必要です。'}
            </p>
          </div>

          {/* LINE ログインボタン (公式カラー #06C755) */}
          <button
            type="button"
            onClick={() => handleSocialLogin('line')}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group hover:brightness-105"
            style={{ backgroundColor: '#06C755' }}
          >
            {/* LINE 公式フキダシ風アイコン */}
            <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.019 9.572.391.082.923.254 1.058.583.12.295.079.757.038 1.053l-.161 1.059c-.048.318-.237 1.243 1.09.678 1.327-.565 7.165-4.223 9.774-7.227 1.48-1.637 2.182-3.344 2.182-5.718z" />
            </svg>
            <span className="tracking-wide">LINE でログイン</span>
            <span className="absolute right-4 text-xs opacity-75 hidden sm:inline">スムーズ認証</span>
          </button>

          {/* Google ログインボタン (公式ホワイト & Gロゴ) */}
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            {/* Google 公式 4色 Gロゴ */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.675-5.17 3.675-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.28C.46 8.23 0 10.06 0 12s.46 3.77 1.28 5.39l3.99-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.28 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
              />
            </svg>
            <span className="tracking-wide">Google でログイン</span>
            <span className="absolute right-4 text-xs text-slate-400 hidden sm:inline">ワンタップ</span>
          </button>

          {/* 管理者時のPasskey必須注釈バッジ */}
          {activeRole === 'admin' && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <Fingerprint className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>Passkey必須:</strong> どちらかを選択後、続けて端末のTouch ID / Face IDで認証します。
              </span>
            </div>
          )}

          {/* セラピスト・顧客向け案内リンク */}
          <div className="pt-2 text-center text-xs text-slate-500">
            {activeRole === 'customer' && (
              <p>
                アカウントをお持ちでない方も、上記からログインすると
                <br />
                <span className="font-bold text-slate-700">自動でアカウントが作成されます</span>
              </p>
            )}
            {activeRole === 'therapist' && (
              <p>
                セラピストの新規本登録をご希望の方は
                <br />
                <span className="text-emerald-700 font-bold">「4ステップ本登録・審査」</span>へお進みください
              </p>
            )}
          </div>
        </div>
      )}

      {/* 3. テスト用・開発者用メールログイン アコーディオン */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => setShowEmailLogin(!showEmailLogin)}
          className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 transition py-1"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            開発テスト用 メール指定ログイン
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${showEmailLogin ? 'rotate-180' : ''}`}
          />
        </button>

        {showEmailLogin && (
          <form onSubmit={handleEmailDirectLogin} className="mt-3 space-y-2 animate-fadeIn bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500">
              登録済みのメールアドレスを直接入力して特定ユーザーとしてログインできます。
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="例: customer.1@example.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shrink-0"
              >
                切替
              </button>
            </div>
            {/* クイックフィル */}
            <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
              <button
                type="button"
                onClick={() => setCustomEmail('customer.1@example.com')}
                className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                顧客: 渡部 大輔
              </button>
              <button
                type="button"
                onClick={() => setCustomEmail('therapist.1@carehub.ehime.jp')}
                className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                セラピスト: 松田 美穂
              </button>
              <button
                type="button"
                onClick={() => setCustomEmail('admin@carehub.ehime.jp')}
                className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                管理: 運営本部
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

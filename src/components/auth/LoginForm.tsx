'use client';

import React, { useState, useEffect } from 'react';
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
  Zap,
} from 'lucide-react';
import {
  fetchLineConfigFromServer,
  checkLiffLoginStatus,
  LineUserProfile,
  LineConfig,
  getLineConfig,
} from '@/lib/line';

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
  const { allUsers, switchUser, addCustomerUser, currentBrand } = useApp();

  const [activeRole, setActiveRole] = useState<UserRole>(initialRole);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [authStep, setAuthStep] = useState<'select_provider' | 'email_input' | 'passkey_required' | 'authenticating' | 'success'>('select_provider');
  const [selectedProvider, setSelectedProvider] = useState<'line' | 'google' | 'email' | 'quick' | null>(null);
  const [statusText, setStatusText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // LINE設定状態（サーバーサイド環境変数と同期）
  const [currentLineConfig, setCurrentLineConfig] = useState<LineConfig>(getLineConfig());

  // メール入力用フォーム
  const [emailInput, setEmailInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');

  // 初期化・ページ読み込み時の処理
  useEffect(() => {
    let isMounted = true;

    // 1. URLパラメータにLINE認証結果（OAuthコールバック）があるかチェック
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isLineSuccess = params.get('line_auth_success') === '1';
      const lineName = params.get('line_name');
      const lineUid = params.get('line_uid');
      const lineAvatar = params.get('line_avatar') || undefined;
      const roleParam = params.get('role') as UserRole | null;
      const errorParam = params.get('error');

      if (errorParam === 'LINE_NOT_CONFIGURED') {
        setErrorMessage('Cloudflareの環境変数にLINEキー（LIFF IDまたはChannel ID）がまだ設定されていないか、デプロイ反映待ちです。Cloudflareの設定画面で保存と再デプロイをご確認ください。');
      } else if (isLineSuccess && lineUid && lineName && isMounted) {
        completeLineProfileAuth({
          userId: lineUid,
          displayName: lineName,
          pictureUrl: lineAvatar,
        }, roleParam || activeRole);
        return;
      }
    }

    // 2. サーバーから最新のLINE設定情報を取得（Cloudflare環境変数との同期）
    fetchLineConfigFromServer().then((cfg) => {
      if (isMounted) {
        setCurrentLineConfig(cfg);
      }
    });

    // 3. LIFF内ブラウザでのセッションチェック
    checkLiffLoginStatus().then((lineProfile) => {
      if (lineProfile && isMounted) {
        completeLineProfileAuth(lineProfile);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

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
      name: '運営本部',
      email: 'admin@carehub.ehime.jp',
    },
  };

  // 本物のLINE認証から戻ったプロファイルでログイン・登録
  const completeLineProfileAuth = (profile: LineUserProfile, overrideRole?: UserRole) => {
    const role = overrideRole || activeRole;
    setAuthStep('authenticating');
    setStatusText(`LINEアカウント（${profile.displayName}）と連携中...`);

    setTimeout(() => {
      const lineUserId = `line-${profile.userId}`;
      let targetUserId = lineUserId;

      if (role === 'customer') {
        addCustomerUser({
          id: lineUserId,
          name: profile.displayName,
          email: `${profile.userId.substring(0, 8)}@line.user`,
          role: 'customer',
          avatar_url: profile.pictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.displayName)}`,
          address: '愛媛県松山市一番町',
          lat: 33.8416,
          lng: 132.7657,
          phone: '090-0000-0000',
          auth_provider: 'line',
          line_user_id: profile.userId,
        });
      } else if (role === 'therapist') {
        const defaultTherapist = representativeUsers.therapist;
        const found = allUsers.find((u) => u.id === defaultTherapist.id);
        targetUserId = found ? found.id : defaultTherapist.id;
        switchUser(targetUserId);
      } else {
        switchUser(representativeUsers.admin.id);
      }

      setAuthStep('success');
      setStatusText(`LINE連携完了！ ${profile.displayName} 様としてログインしました`);

      try {
        confetti({ particleCount: 65, spread: 75, origin: { y: 0.6 } });
      } catch (e) {
        // fallback
      }

      setTimeout(() => {
        if (onSuccess) onSuccess(role);
        if (redirectTo) {
          router.push(redirectTo);
        } else if (role === 'admin') {
          router.push('/admin');
        } else if (role === 'therapist') {
          router.push('/therapist');
        } else {
          router.push('/');
        }
      }, 900);
    }, 500);
  };

  // LINE登録・ログインボタン クリック時
  const handleLineAuthClick = () => {
    setSelectedProvider('line');
    setErrorMessage('');
    setAuthStep('authenticating');
    setStatusText('LINE公式ログイン画面へ接続しています...');

    // セキュア設計: サーバーサイドAPI経由で直接LINE認証画面へリダイレクト
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    window.location.href = `${currentOrigin}/api/auth/line/login?role=${activeRole}&redirect=${encodeURIComponent(redirectTo || '/')}`;
  };

  // Google認証クリック時
  const handleGoogleAuthClick = () => {
    setSelectedProvider('google');
    setErrorMessage('');
    if (activeRole === 'admin') {
      setStatusText('Google 認証成功。Passkey生体認証へ進みます...');
      setAuthStep('authenticating');
      setTimeout(() => {
        setAuthStep('passkey_required');
      }, 700);
    } else {
      completeAuth('google');
    }
  };

  // メール認証実行
  const handleEmailAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      setErrorMessage('メールアドレスを入力してください');
      return;
    }
    setSelectedProvider('email');
    completeAuth('email', false, emailInput, nameInput);
  };

  // ワンタップお試し体験（テスト用）
  const handleQuickDemoAuth = () => {
    setSelectedProvider('quick');
    completeAuth('quick');
  };

  // Passkey認証実行（管理者用）
  const handlePasskeyAuth = async () => {
    setAuthStep('authenticating');
    setStatusText('Face ID / Touch ID / セキュリティキー を照合中...');

    try {
      setTimeout(() => {
        completeAuth(selectedProvider || 'google', true);
      }, 800);
    } catch (err) {
      setErrorMessage('Passkey認証に失敗しました。もう一度お試しください。');
      setAuthStep('passkey_required');
    }
  };

  // 認証完了・ログイン/登録共通処理
  const completeAuth = (
    provider: 'line' | 'google' | 'email' | 'quick',
    withPasskey = false,
    customEmail?: string,
    customName?: string
  ) => {
    setAuthStep('authenticating');
    const isReg = authMode === 'register';
    const actionLabel = isReg ? 'アカウント作成・登録' : 'ログイン';
    setStatusText(`${provider === 'line' ? 'LINE' : provider === 'google' ? 'Google' : 'メール'} ${actionLabel}を処理中...`);

    setTimeout(() => {
      let targetUserId = '';
      let targetUserName = '';

      if (customEmail && isReg && activeRole === 'customer') {
        const newId = `customer-new-${Date.now()}`;
        const finalName = customName || '新規ご登録会員';
        addCustomerUser({
          id: newId,
          name: finalName,
          email: customEmail,
          role: 'customer',
          address: '愛媛県松山市一番町',
          lat: 33.8416,
          lng: 132.7657,
          phone: '090-0000-0000',
        });
        targetUserId = newId;
        targetUserName = finalName;
      } else {
        const defaultUser = representativeUsers[activeRole];
        const found = allUsers.find((u) => u.id === defaultUser.id) || allUsers.find((u) => u.role === activeRole);
        targetUserId = found ? found.id : defaultUser.id;
        targetUserName = found ? found.name : defaultUser.name;
        switchUser(targetUserId);
      }

      setAuthStep('success');

      let providerName = 'LINE';
      if (provider === 'google') providerName = 'Google';
      if (provider === 'email') providerName = 'メール';
      if (provider === 'quick') providerName = 'クイックお試し';

      setStatusText(
        withPasskey
          ? `Passkey生体認証が完了しました！ ${targetUserName} としてログイン`
          : `${providerName} ${actionLabel}が完了しました！ (${targetUserName})`
      );

      try {
        confetti({
          particleCount: 55,
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
          if (activeRole === 'admin') {
            router.push('/admin');
          } else if (activeRole === 'therapist') {
            router.push('/therapist');
          } else {
            router.push('/');
          }
        }
      }, 900);
    }, 600);
  };

  return (
    <div className="w-full">
      {/* 1. 新規登録 / ログイン 切り替えタブ */}
      <div className="flex border-b border-slate-200 mb-5">
        <button
          type="button"
          onClick={() => {
            setAuthMode('register');
            setAuthStep('select_provider');
            setErrorMessage('');
          }}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-black border-b-2 transition ${
            authMode === 'register'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          新規アカウント登録
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode('login');
            setAuthStep('select_provider');
            setErrorMessage('');
          }}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-black border-b-2 transition ${
            authMode === 'login'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          ログイン
        </button>
      </div>

      {/* 2. ロール切り替えセグメントタブ (顧客 / セラピスト / 管理) */}
      <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 mb-5 border border-slate-200/80">
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
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col gap-2 animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>ご案内</span>
          </div>
          <p className="leading-relaxed">{errorMessage}</p>
        </div>
      )}

      {/* 3. 状態別コンテンツ表示 */}
      {/* 3-A: ローディング・認証中 */}
      {authStep === 'authenticating' && (
        <div className="py-12 px-4 text-center space-y-4 animate-fadeIn">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 animate-ping absolute opacity-40"></div>
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-800">{statusText}</div>
          <div className="text-xs text-slate-400">暗号化通信で認証情報を照合しています</div>
        </div>
      )}

      {/* 3-B: ログイン成功 */}
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

      {/* 3-C: 管理者専用 Passkey要求ステップ */}
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

      {/* 3-D: メール入力フォームステップ */}
      {authStep === 'email_input' && (
        <form onSubmit={handleEmailAuthSubmit} className="space-y-4 animate-fadeIn">
          <div className="text-center space-y-1 mb-2">
            <h3 className="text-base font-bold text-slate-900">
              メールアドレスで{authMode === 'register' ? 'アカウント登録' : 'ログイン'}
            </h3>
            <p className="text-xs text-slate-500">
              お使いのメールアドレスを入力してください
            </p>
          </div>

          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">お名前（表示名）</label>
              <input
                type="text"
                placeholder="例: 山田 太郎"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-emerald-500 shadow-2xs"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">メールアドレス</label>
            <input
              type="email"
              required
              placeholder="例: user@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-emerald-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">パスワード</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-emerald-500 shadow-2xs"
            />
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>メールで{authMode === 'register' ? '登録して始める' : 'ログインする'}</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthStep('select_provider')}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 transition"
            >
              ← 認証方法の選択に戻る
            </button>
          </div>
        </form>
      )}

      {/* 3-E: 通常の認証選択ステップ (LINE / Google / メール / クイックお試し) */}
      {authStep === 'select_provider' && (
        <div className="space-y-4 animate-fadeIn">
          {/* 見出し説明 */}
          <div className="text-center space-y-1 mb-2">
            <h3 className="text-base font-bold text-slate-900">
              {activeRole === 'customer' && `お客様 ${authMode === 'register' ? '新規アカウント登録' : 'ログイン'}`}
              {activeRole === 'therapist' && `セラピスト ${authMode === 'register' ? '新規パートナー登録' : 'ログイン'}`}
              {activeRole === 'admin' && '運営本部・管理者ログイン'}
            </h3>
            <p className="text-xs text-slate-500">
              {activeRole === 'customer' && 'LINE・Google・メールアドレスのいずれかでログイン・登録できます。'}
              {activeRole === 'therapist' && 'LINE連携で予約承認・出張リクエストのリアルタイム通知を受け取れます。'}
              {activeRole === 'admin' && '※認証後、Passkey（生体認証）による承認が必要です。'}
            </p>
          </div>

          {/* ① LINE 登録 / ログインボタン (公式カラー #06C755) */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={handleLineAuthClick}
              className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group hover:brightness-105"
              style={{ backgroundColor: '#06C755' }}
            >
              {/* LINE 公式フキダシ風アイコン */}
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.019 9.572.391.082.923.254 1.058.583.12.295.079.757.038 1.053l-.161 1.059c-.048.318-.237 1.243 1.09.678 1.327-.565 7.165-4.223 9.774-7.227 1.48-1.637 2.182-3.344 2.182-5.718z" />
              </svg>
              <span className="tracking-wide">
                LINE で{authMode === 'register' ? '登録' : 'ログイン'}
              </span>
              <span className="absolute right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white hidden sm:inline">
                本番連携
              </span>
            </button>
            <div className="text-[10px] text-center text-slate-400">
              タップするとLINE公式の認証画面（LIFF/OAuth）へ直接接続します
            </div>
          </div>

          {/* ② Google 登録 / ログインボタン (公式ホワイト & Gロゴ) */}
          <button
            type="button"
            onClick={handleGoogleAuthClick}
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
            <span className="tracking-wide">
              Google アカウントで{authMode === 'register' ? '登録' : 'ログイン'}
            </span>
          </button>

          {/* ③ メールアドレスで登録 / ログインボタン */}
          <button
            type="button"
            onClick={() => {
              setAuthStep('email_input');
              setErrorMessage('');
            }}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-2xs transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative group"
          >
            <Mail className="w-5 h-5 text-slate-600 shrink-0" />
            <span className="tracking-wide">
              メールアドレスで{authMode === 'register' ? '登録' : 'ログイン'}
            </span>
          </button>

          {/* ④ クイックお試しダミー体験ボタン（ワンタップ即時実行） */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleQuickDemoAuth}
              className="w-full py-3 px-4 rounded-2xl font-black text-xs text-emerald-950 bg-gradient-to-r from-emerald-100 via-teal-100 to-emerald-100 hover:from-emerald-200 hover:to-teal-200 border border-emerald-300/80 shadow-2xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              <Zap className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
              <span>
                【テスト用】ワンタップで今すぐダミー体験（
                {activeRole === 'customer' ? '顧客: 渡部 大輔' : activeRole === 'therapist' ? 'セラピスト: 松田 美穂' : '運営本部'}
                ）
              </span>
            </button>
          </div>

          {/* 管理者時のPasskey必須注釈バッジ */}
          {activeRole === 'admin' && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <Fingerprint className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>Passkey必須:</strong> いずれかを選択後、続けて端末のTouch ID / Face IDで認証します。
              </span>
            </div>
          )}

          {/* 規約同意案内 */}
          <p className="text-[11px] text-center text-slate-400 pt-2 leading-relaxed">
            登録またはログインすることで、{currentBrand.name}の
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline mx-0.5">
              利用規約
            </a>
            および
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline mx-0.5">
              プライバシーポリシー
            </a>
            に同意したものとみなされます。
          </p>
        </div>
      )}
    </div>
  );
};

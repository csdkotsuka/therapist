// ========================================================
// Proxy（旧 Middleware）
//   1. Supabase の認証 Cookie をリクエストごとに更新（トークンのリフレッシュ）
//   2. 要ログインのページに未ログインで来たらログイン画面へ（楽観的チェック）
//   3. リクエストごとに nonce を作り、Content-Security-Policy を付ける
//      （Next.js はリクエストヘッダーの CSP から nonce を読み取り、自身のスクリプトに付与する）
//   ※ 役割（admin / therapist）の確認は各 layout.tsx（サーバー）で、データの権限は RLS で行う。
// ========================================================
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PROTECTED_PREFIXES = ['/admin', '/therapist', '/bookings', '/profile'];

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === 'development';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseWs = supabaseUrl.replace(/^https:/, 'wss:');

  const directives = [
    "default-src 'self'",
    // nonce 付きのスクリプトと、そこから読み込まれたスクリプトだけを実行する
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    // React の style 属性・Leaflet のマーカー HTML がインラインスタイルを使うため unsafe-inline が必要
    "style-src 'self' 'unsafe-inline'",
    // アバターは Supabase Storage・LINE・外部画像など、地図タイルは OpenStreetMap
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    [
      "connect-src 'self'",
      supabaseUrl,
      supabaseWs,
      'https://zipcloud.ibsnet.co.jp',
      'https://nominatim.openstreetmap.org',
      'https://api.line.me',
      'https://*.line.me',
      'https://*.line-scdn.net',
    ].filter(Boolean).join(' '),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ];
  return directives.join('; ');
}

export async function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  // 毎回 request.headers から作り直す（setAll で更新された Cookie も反映される）
  const nextResponse = () => {
    const headers = new Headers(request.headers);
    headers.set('x-nonce', nonce);
    headers.set('Content-Security-Policy', csp);
    const res = NextResponse.next({ request: { headers } });
    res.headers.set('Content-Security-Policy', csp);
    return res;
  };

  let response = nextResponse();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = nextResponse();
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  // getUser() は Auth サーバーでトークンを検証し、必要ならリフレッシュして setAll を呼ぶ
  const { data } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const isAuthPath =
    pathname === '/login' ||
    pathname === '/therapist/login' ||
    pathname === '/admin/login' ||
    pathname.startsWith('/login/') ||
    pathname.startsWith('/api/auth/');

  const isProtected = !isAuthPath && PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isProtected && !data.user) {
    const loginUrl = request.nextUrl.clone();
    if (pathname.startsWith('/admin')) {
      loginUrl.pathname = '/admin/login';
    } else if (pathname.startsWith('/therapist')) {
      loginUrl.pathname = '/therapist/login';
    } else {
      loginUrl.pathname = '/login';
    }
    loginUrl.search = '';
    loginUrl.searchParams.set('redirect', `${pathname}${search}`);
    const redirect = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  return response;
}

export const config = {
  matcher: [
    // 静的ファイル・画像・API（API は各 Route Handler で認証する）を除外
    '/((?!api|_next/static|_next/image|favicon.ico|branding/|documents/|presentation/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pptx|pdf)$).*)',
  ],
};

import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/server/supabaseServer';
import { safeRedirectPath } from '@/lib/redirect';

export const dynamic = 'force-dynamic';

// Supabase Auth の戻り先
//   ?code=...                 OAuth（Google 等）の PKCE コード交換
//   ?token_hash=...&type=...  メール確認・マジックリンク（LINE ログインのセッション発行にも使用）
export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = safeRedirectPath(url.searchParams.get('next'));
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
      if (profile?.role !== 'admin' && profile?.role !== 'therapist') {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/login?error=UNAUTHORIZED_ACCOUNT', url.origin));
      }
      return NextResponse.redirect(new URL(next, url.origin));
    }
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error && data.user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
      if (profile?.role !== 'admin' && profile?.role !== 'therapist') {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/login?error=UNAUTHORIZED_ACCOUNT', url.origin));
      }
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(new URL('/login?error=AUTH_CALLBACK_FAILED', url.origin));
}

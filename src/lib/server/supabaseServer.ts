// ========================================================
// サーバー用 Supabase クライアント（Cookie セッション / RLS 適用）
//   Server Component・Route Handler から利用する。
// ========================================================
import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { UserRole } from '@/types';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component からは Cookie を書けない（proxy 側でセッション更新済みなので無視してよい）
        }
      },
    },
  });
}

export interface SessionUser {
  id: string;
  role: UserRole | null;
}

/** 現在のログインユーザーと profiles.role（未ログインなら null） */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
  return { id: data.user.id, role: (profile?.role as UserRole | undefined) ?? null };
}

// ========================================================
// 審査機能のクライアント側 API（Supabase Storage / Route Handler 呼び出し）
// ライブモード（Supabase セッションあり）でのみ使用。セッションなしのデモ動作は AppContext 側で完結する。
// ========================================================
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { STORAGE_BUCKET } from '@/lib/verification';

export async function getAccessToken(): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export interface ApiResult<T = Record<string, unknown>> {
  ok: boolean;
  status: number;
  message: string;
  data: T;
}

/** 認証付きで自社 Route Handler を呼び出す */
export async function postAuthed<T = Record<string, unknown>>(path: string, body: unknown): Promise<ApiResult<T>> {
  const token = await getAccessToken();
  if (!token) {
    return { ok: false, status: 401, message: 'ログインセッションがありません。ログインし直してください。', data: {} as T };
  }
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body ?? {}),
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const message = typeof json.message === 'string' ? json.message : res.ok ? '' : `エラーが発生しました (${res.status})`;
    return { ok: res.ok && json.ok !== false, status: res.status, message, data: json as T };
  } catch {
    return { ok: false, status: 0, message: 'サーバーに接続できませんでした。', data: {} as T };
  }
}

/** 一時バケットへアップロード（本人のフォルダ配下のみ許可される） */
export async function uploadToTempBucket(path: string, file: File): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase が設定されていません。' };
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  return { error: error ? error.message : null };
}

export async function removeFromTempBucket(path: string): Promise<void> {
  if (!supabase) return;
  await supabase.storage.from(STORAGE_BUCKET).remove([path]);
}

/** 閲覧用の署名付きURL（5分間有効） */
export async function createSignedViewUrl(path: string): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, 300);
  if (error || !data) return null;
  return data.signedUrl;
}

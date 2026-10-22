// ========================================================
// サーバー専用: temp-qualifications バケットの該当セラピスト分ファイルを完全削除
// ========================================================
import type { SupabaseClient } from '@supabase/supabase-js';
import { STORAGE_BUCKET } from '@/lib/verification';

export interface PurgeResult {
  deleted: number;
  remaining: number;
}

/**
 * {therapistId}/ 配下のすべてのファイルを削除し、残存数を返す。
 * DB に記録されたパスではなくフォルダ内の実ファイルを列挙するため、再アップロードで
 * 残った古いファイルも漏れなく消える。remaining > 0 のときは削除未完了。
 */
export async function purgeTherapistFiles(svc: SupabaseClient, therapistId: string): Promise<PurgeResult> {
  const bucket = svc.storage.from(STORAGE_BUCKET);
  let deleted = 0;

  // 1回の list は limit 件までなので、空になるまで繰り返す（無限ループ防止で上限あり）
  for (let round = 0; round < 10; round++) {
    const { data, error } = await bucket.list(therapistId, { limit: 100 });
    if (error) throw new Error(`ファイル一覧の取得に失敗しました: ${error.message}`);
    // フォルダのプレースホルダーは id が null
    const files = (data ?? []).filter((f) => f.id !== null && f.name);
    if (files.length === 0) break;

    const { error: removeError } = await bucket.remove(files.map((f) => `${therapistId}/${f.name}`));
    if (removeError) throw new Error(`ファイルの削除に失敗しました: ${removeError.message}`);
    deleted += files.length;
  }

  const { data: left, error: leftError } = await bucket.list(therapistId, { limit: 100 });
  if (leftError) throw new Error(`削除結果の確認に失敗しました: ${leftError.message}`);
  const remaining = (left ?? []).filter((f) => f.id !== null && f.name).length;

  return { deleted, remaining };
}

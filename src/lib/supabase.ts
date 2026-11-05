// ========================================================
// ブラウザ用 Supabase クライアント
//   セッションは @supabase/ssr により Cookie に保存され、サーバー（proxy / Route Handler /
//   Server Component）と共有される。業務データはブラウザに永続化しない。
// ========================================================
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http') && !supabaseUrl.includes('your-project')
);

let browserClient: SupabaseClient | null = null;

/** ブラウザ用クライアント（シングルトン）。環境変数が未設定なら null。 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  }
  return browserClient;
}

export const supabase = typeof window !== 'undefined' ? getSupabase() : null;

/** DB 側の例外コード（RAISE EXCEPTION 'XXX'）を利用者向けメッセージに変換 */
const DB_ERROR_MESSAGES: Record<string, string> = {
  AUTH_REQUIRED: 'ログインが必要です。',
  CUSTOMER_ONLY: '予約は顧客アカウントでのみ行えます。',
  INVALID_BOOKING_TYPE: '予約種別が不正です。',
  SCHEDULE_IN_PAST: '過去の日時は予約できません。',
  SERVICE_NOT_FOUND: 'このメニューは現在予約できません。',
  THERAPIST_NOT_AVAILABLE: 'このセラピストは現在予約を受け付けていません。',
  VISIT_NOT_SUPPORTED: 'このセラピストは出張に対応していません。',
  STORE_NOT_SUPPORTED: 'このセラピストは店舗での施術に対応していません。',
  VISIT_ADDRESS_REQUIRED: '出張先の住所を入力してください。',
  BOOKING_NOT_FOUND: '予約が見つかりません。',
  FORBIDDEN: 'この操作を行う権限がありません。',
  INVALID_TRANSITION: '現在の予約状態ではこの操作を行えません。画面を更新してください。',
  DUMMY_PAYMENT_DISABLED: 'ダミー決済は無効化されています。',
  INVALID_COORDINATES: '位置情報が不正です。',
  THERAPIST_NOT_FOUND: 'セラピストが見つかりません。',
  PAYMENT_INCOMPLETE: '先に審査手数料の決済を完了してください。',
};

export function toUserMessage(error: { message?: string } | null | undefined, fallback = '処理に失敗しました。'): string {
  const msg = error?.message ?? '';
  const code = Object.keys(DB_ERROR_MESSAGES).find((k) => msg.includes(k));
  if (code) return DB_ERROR_MESSAGES[code];
  if (msg.includes('row-level security')) return DB_ERROR_MESSAGES.FORBIDDEN;
  return fallback;
}

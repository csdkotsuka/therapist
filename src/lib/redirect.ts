/**
 * ログイン後の遷移先として安全な同一オリジンのパスだけを返す（オープンリダイレクト防止）。
 * URL パーサーはタブ・改行を除去し、バックスラッシュを / とみなすため、
 * 文字列の先頭チェックではなく実際に URL として解釈した結果で判定する。
 */
export function safeRedirectPath(input: string | null | undefined, fallback = '/'): string {
  if (!input || !input.startsWith('/') || /[\u0000-\u001f\\]/.test(input)) return fallback;
  try {
    const base = 'http://carekuru.invalid';
    const url = new URL(input, base);
    if (url.origin !== base) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

// Leaflet の divIcon / tooltip など、文字列を HTML として埋め込む箇所で使うエスケープ処理

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** テキストや属性値を HTML に埋め込めるようにエスケープする */
export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

/** http(s) の URL だけを許可し、それ以外（javascript: など）は空文字にする。結果はエスケープ済み */
export function safeUrlAttr(value: unknown): string {
  if (typeof value !== 'string' || value === '') return '';
  try {
    const url = new URL(value, 'https://placeholder.invalid');
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
  } catch {
    return '';
  }
  return escapeHtml(value);
}

// ========================================================
// サーバー専用: Stripe REST / Webhook 署名検証（SDK 不使用・Web Crypto のみ）
// Cloudflare Workers でも動作するよう Node 固有 API に依存しない
// ========================================================
import { ConfigError } from './supabaseAdmin';

export function stripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new ConfigError('サーバー環境変数 STRIPE_SECRET_KEY が設定されていません。');
  return key;
}

/** ネストしたオブジェクトを Stripe の form-encoded（a[b][c]=v）に変換 */
export function toForm(input: Record<string, unknown>): URLSearchParams {
  const params = new URLSearchParams();
  const walk = (value: unknown, prefix: string) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'object') {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        walk(v, prefix ? `${prefix}[${k}]` : k);
      }
    } else {
      params.append(prefix, String(value));
    }
  };
  walk(input, '');
  return params;
}

export class StripeApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/** Stripe API への POST（form-encoded） */
export async function stripePost<T>(
  path: string,
  body: Record<string, unknown>,
  idempotencyKey?: string
): Promise<T> {
  const res = await fetch(`https://api.stripe.com${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: toForm(body).toString(),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } } & T;
  if (!res.ok) {
    throw new StripeApiError(json.error?.message ?? `Stripe API error (${res.status})`, res.status);
  }
  return json;
}

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Stripe-Signature ヘッダー（t=タイムスタンプ,v1=署名,...）を検証する。
 * 署名対象は `${t}.${rawBody}` を HMAC-SHA256 したもの。許容時間差はデフォルト5分。
 */
export async function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  toleranceSeconds = 300,
  nowMs = Date.now()
): Promise<boolean> {
  if (!header || !secret) return false;

  let timestamp = '';
  const signatures: string[] = [];
  for (const part of header.split(',')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k === 't') timestamp = v;
    if (k === 'v1') signatures.push(v);
  }
  if (!timestamp || signatures.length === 0) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(nowMs / 1000 - ts) > toleranceSeconds) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const expected = toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${rawBody}`)));
  return signatures.some((sig) => timingSafeEqualHex(sig, expected));
}

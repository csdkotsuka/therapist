import { NextResponse } from 'next/server';
import { ConfigError, getServiceClient } from '@/lib/server/supabaseAdmin';
import { verifyStripeSignature } from '@/lib/server/stripe';

// Stripe Webhook 受信エンドポイント
//   checkout.session.completed / async_payment_succeeded → Step1: payment_status = completed
//   account.updated（payouts_enabled: true）          → Step2: is_identity_verified = true
//
// Stripe ダッシュボードでは「アカウント」用と「Connect（接続アカウント）」用でエンドポイントが
// 別になり署名シークレットも別なので、STRIPE_WEBHOOK_SECRET / STRIPE_CONNECT_WEBHOOK_SECRET の
// どちらで署名検証が通ってもよい仕様にしている。
// ※ 免許証等の本人確認画像は Stripe 側にのみ存在し、ここでは一切受け取らない・保存しない。

interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
}

interface StripeAccount {
  id: string;
  payouts_enabled?: boolean;
  metadata?: Record<string, string>;
  individual?: {
    first_name?: string | null;
    last_name?: string | null;
    first_name_kanji?: string | null;
    last_name_kanji?: string | null;
  };
}

function verifiedName(account: StripeAccount): string | null {
  const ind = account.individual;
  if (!ind) return null;
  const kanji = `${ind.last_name_kanji ?? ''} ${ind.first_name_kanji ?? ''}`.trim();
  if (kanji) return kanji;
  const roman = `${ind.last_name ?? ''} ${ind.first_name ?? ''}`.trim();
  return roman || null;
}

export async function POST(req: Request) {
  const secrets = [process.env.STRIPE_WEBHOOK_SECRET, process.env.STRIPE_CONNECT_WEBHOOK_SECRET].filter(
    (s): s is string => Boolean(s)
  );
  if (secrets.length === 0) {
    return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 501 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  let valid = false;
  for (const secret of secrets) {
    if (await verifyStripeSignature(rawBody, signature, secret)) {
      valid = true;
      break;
    }
  }
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    const svc = getServiceClient();
    const obj = event.data.object;

    // ---- Step1: 審査手数料の決済完了 ----
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const metadata = (obj.metadata ?? {}) as Record<string, string>;
      const therapistId = metadata.therapist_id;
      if (metadata.purpose === 'review_fee' && therapistId && obj.payment_status === 'paid') {
        const { error } = await svc
          .from('therapist_profiles')
          .update({ payment_status: 'completed', payment_completed_at: new Date().toISOString() })
          .eq('user_id', therapistId)
          .neq('payment_status', 'completed'); // 再送されても初回の決済日時を上書きしない
        if (error) throw error;
      }
    }

    // ---- Step2: Stripe Connect の口座登録＋本人確認が完了 ----
    if (event.type === 'account.updated') {
      const account = obj as unknown as StripeAccount;
      if (account.payouts_enabled === true) {
        const { data: byAccount, error: findErr } = await svc
          .from('therapist_profiles')
          .select('user_id,is_identity_verified')
          .eq('stripe_account_id', account.id)
          .maybeSingle();
        if (findErr) throw findErr;

        let therapistId = (byAccount?.user_id as string | undefined) ?? null;
        const alreadyVerified = byAccount?.is_identity_verified === true;

        // 口座IDの保存が間に合っていない場合のみ metadata から補完
        if (!therapistId && account.metadata?.therapist_id) {
          therapistId = account.metadata.therapist_id;
        }

        if (therapistId) {
          const name = verifiedName(account);
          const { error } = await svc
            .from('therapist_profiles')
            .update({
              stripe_account_id: account.id,
              is_identity_verified: true,
              // account.updated は頻繁に届くため、確認日時は初回のみ記録する
              ...(alreadyVerified ? {} : { identity_verified_at: new Date().toISOString() }),
              ...(name ? { identity_verified_name: name } : {}),
            })
            .eq('user_id', therapistId);
          if (error) throw error;
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    if (err instanceof ConfigError) {
      return NextResponse.json({ error: err.message }, { status: 501 });
    }
    console.error('stripe webhook handler error', event.id, event.type, err);
    // 5xx を返すと Stripe が自動再送する
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}

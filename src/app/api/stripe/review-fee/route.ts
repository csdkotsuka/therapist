import { NextResponse } from 'next/server';
import { authenticate, ConfigError, getServiceClient, siteOrigin } from '@/lib/server/supabaseAdmin';
import { StripeApiError, stripePost } from '@/lib/server/stripe';
import { REVIEW_FEE_YEN } from '@/lib/verification';

// Step1: アカウント開設・審査手数料（5,000円・返金不可）の Stripe Checkout セッションを作成する。
// 決済完了の反映（payment_status = completed）は改ざん防止のため Webhook のみで行う。
export async function POST(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ message: 'ログインが必要です。' }, { status: 401 });
    }
    if (user.role !== 'therapist') {
      return NextResponse.json({ message: 'セラピストアカウントでのみ実行できます。' }, { status: 403 });
    }

    const svc = getServiceClient();
    const { data: tp } = await svc
      .from('therapist_profiles')
      .select('user_id,payment_status')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!tp) {
      return NextResponse.json({ message: 'セラピストプロフィールが見つかりません。' }, { status: 404 });
    }
    if (tp.payment_status === 'completed') {
      return NextResponse.json({ message: '審査手数料は決済済みです。' }, { status: 409 });
    }

    const origin = siteOrigin(req);
    const session = await stripePost<{ url: string }>('/v1/checkout/sessions', {
      mode: 'payment',
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'jpy',
            unit_amount: REVIEW_FEE_YEN,
            product_data: { name: 'セラピスト審査手数料（返金不可）' },
          },
        },
      ],
      metadata: { therapist_id: user.id, purpose: 'review_fee' },
      payment_intent_data: { metadata: { therapist_id: user.id, purpose: 'review_fee' } },
      success_url: `${origin}/therapist?onboarding=fee_done`,
      cancel_url: `${origin}/therapist?onboarding=fee_cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof ConfigError) {
      return NextResponse.json({ message: err.message }, { status: 501 });
    }
    if (err instanceof StripeApiError) {
      console.error('stripe checkout error', err.message);
      return NextResponse.json({ message: `Stripe エラー: ${err.message}` }, { status: 502 });
    }
    console.error('review-fee error', err);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}

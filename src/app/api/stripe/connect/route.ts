import { NextResponse } from 'next/server';
import { authenticate, ConfigError, getServiceClient, siteOrigin } from '@/lib/server/supabaseAdmin';
import { StripeApiError, stripePost } from '@/lib/server/stripe';

// Step2: Stripe Connect Express アカウントを作成し、オンボーディング画面（口座登録＋本人確認）の URL を返す。
// 身分証明書の画像は Stripe のホスト画面で直接提出され、当社のDB/Storageには一切渡らない。
// eKYC 完了（payouts_enabled）の反映は Webhook(account.updated) のみで行う。
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
      .select('user_id,payment_status,stripe_account_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!tp) {
      return NextResponse.json({ message: 'セラピストプロフィールが見つかりません。' }, { status: 404 });
    }
    if (tp.payment_status !== 'completed') {
      return NextResponse.json({ message: '先に Step1（審査手数料のお支払い）を完了してください。' }, { status: 409 });
    }

    let accountId = (tp.stripe_account_id as string | null) ?? null;
    if (!accountId) {
      const account = await stripePost<{ id: string }>(
        '/v1/accounts',
        {
          type: 'express',
          country: 'JP',
          email: user.email ?? undefined,
          business_type: 'individual',
          capabilities: { transfers: { requested: true } },
          metadata: { therapist_id: user.id },
        },
        `connect-account-${user.id}` // 連打しても口座を二重作成しない
      );
      accountId = account.id;
      const { error } = await svc.from('therapist_profiles').update({ stripe_account_id: accountId }).eq('user_id', user.id);
      if (error) throw error;
    }

    const origin = siteOrigin(req);
    const link = await stripePost<{ url: string }>('/v1/account_links', {
      account: accountId,
      type: 'account_onboarding',
      refresh_url: `${origin}/therapist?onboarding=stripe_refresh`,
      return_url: `${origin}/therapist?onboarding=stripe_return`,
    });

    return NextResponse.json({ url: link.url });
  } catch (err) {
    if (err instanceof ConfigError) {
      return NextResponse.json({ message: err.message }, { status: 501 });
    }
    if (err instanceof StripeApiError) {
      console.error('stripe connect error', err.message);
      return NextResponse.json({ message: `Stripe エラー: ${err.message}` }, { status: 502 });
    }
    console.error('connect error', err);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}

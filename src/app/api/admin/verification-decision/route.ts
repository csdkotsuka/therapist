import { NextResponse } from 'next/server';
import { authenticate, ConfigError, getServiceClient } from '@/lib/server/supabaseAdmin';
import { purgeTherapistFiles } from '@/lib/server/purge';

// 承認 / 差戻し / 削除再実行。管理者（Supabase セッションの profiles.role = 'admin'）のみ実行可能。
// 前提条件の検証〜フラグ更新〜承認ログ記録は DB の RPC（1トランザクション）で行い、
// その直後に Storage の提出ファイルを完全削除して結果をログに記録する。

const RPC_ERRORS: Record<string, string> = {
  THERAPIST_NOT_FOUND: '対象のセラピストがデータベースに存在しません（デモデータの可能性があります）。',
  ONBOARDING_NOT_FOUND: '提出情報（誓約書・書類）が登録されていません。',
  PAYMENT_INCOMPLETE: '審査手数料の決済が完了していません。',
  IDENTITY_UNVERIFIED: 'Stripe の本人確認（eKYC）が完了していません。',
  TERMS_MISSING: '電子誓約書への同意がありません。',
  QUALIFICATION_MISSING: '資格証が提出されていません。',
  INSURANCE_MISSING: '損害賠償責任保険の証票が提出されていません。',
  QUALIFICATION_TYPE_REQUIRED: '確認した資格名を選択してください。',
  NAME_MATCH_NOT_CONFIRMED: 'Stripe認証氏名と資格証の氏名の一致確認にチェックしてください。',
  INSURANCE_NOT_CONFIRMED: '保険証票の内容確認にチェックしてください。',
  REASON_REQUIRED: '差戻し理由を入力してください。',
  ALREADY_CERTIFIED: '認定済みのセラピストは差戻しできません。',
};

function rpcErrorMessage(message: string | undefined): string {
  const code = Object.keys(RPC_ERRORS).find((k) => message?.includes(k));
  return code ? RPC_ERRORS[code] : `処理に失敗しました: ${message ?? '不明なエラー'}`;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface DecisionBody {
  therapistId?: string;
  decision?: 'approve' | 'reject' | 'purge';
  qualificationType?: string;
  registrationNumber?: string;
  nameMatchConfirmed?: boolean;
  insuranceConfirmed?: boolean;
  reason?: string;
  logId?: string;
}

export async function POST(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ ok: false, message: 'ログインが必要です。管理者アカウントでログインしてください。' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ ok: false, message: '管理者のみ実行できます。' }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) as DecisionBody;
    const decision = body.decision;
    if (decision !== 'approve' && decision !== 'reject' && decision !== 'purge') {
      return NextResponse.json({ ok: false, message: 'decision が不正です。' }, { status: 400 });
    }

    const svc = getServiceClient();

    // --- 削除の再実行（前回の自動削除が失敗した承認ログに対して） ---
    if (decision === 'purge') {
      if (!body.logId || !UUID_RE.test(body.logId)) {
        return NextResponse.json({ ok: false, message: 'logId が不正です。' }, { status: 400 });
      }
      const { data: log, error: logErr } = await svc
        .from('therapist_verification_logs')
        .select('id,therapist_id,files_deleted_at')
        .eq('id', body.logId)
        .maybeSingle();
      if (logErr || !log || !log.therapist_id) {
        return NextResponse.json({ ok: false, message: '対象の承認ログが見つかりません。' }, { status: 404 });
      }
      return await purgeAndRecord(svc, log.therapist_id as string, log.id as string);
    }

    if (!body.therapistId || !UUID_RE.test(body.therapistId)) {
      return NextResponse.json({ ok: false, message: 'therapistId が不正です。' }, { status: 400 });
    }

    // --- 承認 / 差戻し（DB RPC：前提条件の検証・フラグ更新・証跡記録を原子的に実行） ---
    const rpc =
      decision === 'approve'
        ? await svc.rpc('approve_therapist_verification', {
            p_therapist_id: body.therapistId,
            p_admin_id: user.id,
            p_qualification_type: body.qualificationType ?? '',
            p_registration_number: body.registrationNumber ?? null,
            p_name_match_confirmed: body.nameMatchConfirmed === true,
            p_insurance_confirmed: body.insuranceConfirmed === true,
          })
        : await svc.rpc('reject_therapist_verification', {
            p_therapist_id: body.therapistId,
            p_admin_id: user.id,
            p_reason: body.reason ?? '',
          });

    if (rpc.error) {
      return NextResponse.json({ ok: false, message: rpcErrorMessage(rpc.error.message) }, { status: 422 });
    }

    // --- 承認・差戻し確定後に、提出ファイルを Storage から完全削除 ---
    return await purgeAndRecord(svc, body.therapistId, rpc.data as string, decision);
  } catch (err) {
    if (err instanceof ConfigError) {
      return NextResponse.json({ ok: false, message: err.message }, { status: 501 });
    }
    console.error('verification-decision error', err);
    return NextResponse.json({ ok: false, message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}

async function purgeAndRecord(
  svc: ReturnType<typeof getServiceClient>,
  therapistId: string,
  logId: string,
  decision?: 'approve' | 'reject'
) {
  const doneLabel = decision === 'reject' ? '差戻しを記録しました。' : decision === 'approve' ? '承認しました。' : '';
  try {
    const { deleted, remaining } = await purgeTherapistFiles(svc, therapistId);

    if (remaining > 0) {
      return NextResponse.json({
        ok: true,
        logId,
        deletedCount: deleted,
        purgeComplete: false,
        message: `${doneLabel}ただし提出ファイル ${remaining} 件の削除が完了していません。「削除を再実行」してください。`,
      });
    }

    const { error } = await svc
      .from('therapist_verification_logs')
      .update({ files_deleted_count: deleted, files_deleted_at: new Date().toISOString() })
      .eq('id', logId);
    if (error) console.error('failed to record purge result', error);

    return NextResponse.json({
      ok: true,
      logId,
      deletedCount: deleted,
      purgeComplete: true,
      message: `${doneLabel}提出ファイル ${deleted} 件を完全に削除しました。`.trim(),
    });
  } catch (err) {
    console.error('purge error', err);
    return NextResponse.json({
      ok: true,
      logId,
      deletedCount: 0,
      purgeComplete: false,
      message: `${doneLabel}ただし提出ファイルの削除に失敗しました。「削除を再実行」してください。`,
    });
  }
}

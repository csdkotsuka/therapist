// ========================================================
// セラピスト本登録審査（4ステップ）の共通定数・判定ロジック
// ※ このファイルはクライアント/サーバー両方から import 可能（副作用なし）
// ========================================================
import type { TherapistOnboarding, TherapistProfile, VerificationDocKind } from '@/types';

/** 審査手数料（返金不可） */
export const REVIEW_FEE_YEN = 5000;

/** 一時保管バケット（承認・差戻し時に該当セラピストのフォルダごと削除される） */
export const STORAGE_BUCKET = 'temp-qualifications';

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] as const;

const MIME_EXTENSION: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const DOC_LABELS: Record<VerificationDocKind, string> = {
  qualification: '保有資格証（国家資格の免状等）',
  insurance: '損害賠償責任保険の加入証明',
};

/** アップロード前の検証。問題なければ null、あればエラーメッセージを返す */
export function validateDocFile(file: { name: string; type: string; size: number }): string | null {
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return 'PDF・JPEG・PNG・WebP のいずれかの形式でアップロードしてください。';
  }
  if (file.size > MAX_FILE_BYTES) {
    return `ファイルサイズは ${MAX_FILE_BYTES / 1024 / 1024}MB 以下にしてください。`;
  }
  if (file.size === 0) {
    return '空のファイルはアップロードできません。';
  }
  return null;
}

/** Storage のパス規約: {therapist_id}/{kind}_{timestamp}.{ext} */
export function buildStoragePath(therapistId: string, kind: VerificationDocKind, mime: string): string {
  const ext = MIME_EXTENSION[mime] ?? 'bin';
  return `${therapistId}/${kind}_${Date.now()}.${ext}`;
}

export function isPdfName(name?: string | null): boolean {
  return Boolean(name && name.toLowerCase().endsWith('.pdf'));
}

// --------------------------------------------------------
// 資格名の選択肢（承認ログの qualification_type に記録される）
// --------------------------------------------------------
export const QUALIFICATION_TYPES = [
  '理学療法士（PT）',
  '作業療法士（OT）',
  '言語聴覚士（ST）',
  '助産師',
  '看護師・保健師',
  '歯科衛生士',
  'はり師・きゅう師',
  'あん摩マッサージ指圧師',
  '柔道整復師',
  '管理栄養士',
  '視能訓練士',
  '公認心理師・臨床心理士',
  '民間資格（整体・エステ・アロマ等）',
  'その他',
] as const;

// --------------------------------------------------------
// 電子誓約書（Step3）
// ※ 文面は運用開始前に必ず法務確認を行ってください
// --------------------------------------------------------
export const TERMS_VERSION = '2026-10-v1';

export const TERMS_ITEMS: { id: string; title: string; body: string }[] = [
  {
    id: 'tos',
    title: '利用規約への同意',
    body: '本サービスの利用規約およびプライバシーポリシーの内容を確認し、これに同意します。',
  },
  {
    id: 'no_direct',
    title: '直契約の禁止',
    body: '本サービスを通じて紹介を受けた顧客と、プラットフォームを介さずに直接契約・取引（個人間での予約・決済・連絡先交換による継続施術など）を行いません。',
  },
  {
    id: 'no_poaching',
    title: '引き抜き行為の禁止',
    body: '本サービスに登録する他のセラピストおよび顧客を、本サービス外への取引へ勧誘・引き抜く行為を行いません。',
  },
  {
    id: 'authenticity',
    title: '提出書類の真正性',
    body: '提出する資格証および損害賠償責任保険の証票は真正かつ有効期間内のものであり、虚偽があった場合は登録の取消しに異議を述べません。',
  },
  {
    id: 'privacy',
    title: '書類の取扱いの理解',
    body: '身分証明書（運転免許証等）の画像は Stripe が取得し運営は保持しないこと、資格証・保険証票は審査のためだけに一時保管され承認完了と同時に完全削除されることを理解しました。',
  },
  {
    id: 'fee',
    title: '審査手数料',
    body: `審査手数料（${REVIEW_FEE_YEN.toLocaleString('ja-JP')}円）は審査の結果にかかわらず返金されないことを理解しました。`,
  },
];

// --------------------------------------------------------
// 提出状況チェックリスト（管理画面・セラピスト画面で共通利用）
// --------------------------------------------------------
export type CheckKey = 'fee' | 'terms' | 'ekyc' | 'qualification' | 'insurance';

export interface CheckItem {
  key: CheckKey;
  label: string;
  shortLabel: string;
  ok: boolean;
  detail: string;
}

export function isTherapistCertified(tp: TherapistProfile | undefined): boolean {
  return Boolean(tp?.is_certified) || Boolean(tp?.is_approved && tp?.is_certified === undefined);
}

export function getChecklist(
  tp: TherapistProfile | undefined,
  ob: TherapistOnboarding | undefined
): CheckItem[] {
  const certified = isTherapistCertified(tp);
  const done = '承認済み（原本は自動削除済・承認ログ保持）';
  const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('ja-JP') : '');

  const fee = tp?.payment_status === 'completed';
  const terms = Boolean(ob?.terms_agreed_at);
  const ekyc = Boolean(tp?.is_identity_verified);
  const qualification = Boolean(ob?.qualification_file_path);
  const insurance = Boolean(ob?.insurance_file_path);

  return [
    {
      key: 'fee',
      label: 'Step1 審査手数料の決済',
      shortLabel: '手数料',
      ok: certified || fee,
      detail: certified || fee ? `決済済み ${fmt(tp?.payment_completed_at)}`.trim() : '未決済（5,000円）',
    },
    {
      key: 'terms',
      label: '電子誓約書（利用規約への同意）',
      shortLabel: '電子誓約書',
      ok: certified || terms,
      detail: certified
        ? '同意・電子署名済み'
        : terms
          ? `${ob?.terms_signature_name ?? ''} が同意（${ob?.terms_version ?? '-'}・${fmt(ob?.terms_agreed_at)}）`
          : '未同意',
    },
    {
      key: 'ekyc',
      label: '身分証明書（Stripe eKYC）',
      shortLabel: '身分証(eKYC)',
      ok: certified || ekyc,
      detail: certified || ekyc
        ? `Stripe自動eKYC確認済${tp?.identity_verified_name ? `（認証氏名: ${tp.identity_verified_name}）` : '（画像は自社非保持）'}`
        : tp?.stripe_account_id
          ? 'Stripe 審査中（本人確認の完了待ち）'
          : '未実施',
    },
    {
      key: 'qualification',
      label: '保有資格証（PDF/画像）',
      shortLabel: '保有資格証',
      ok: certified || qualification,
      detail: certified ? done : qualification ? `提出済み: ${ob?.qualification_file_name ?? ''}` : '未提出',
    },
    {
      key: 'insurance',
      label: '損害賠償責任保険の加入証明',
      shortLabel: '賠償責任保険',
      ok: certified || insurance,
      detail: certified ? done : insurance ? `提出済み: ${ob?.insurance_file_name ?? ''}` : '未提出',
    },
  ];
}

// --------------------------------------------------------
// 審査ステージ
// --------------------------------------------------------
export type VerificationStage =
  | 'ready' // 5項目すべて完了＝運営の確認・承認待ち
  | 'rejected' // 差戻し（再提出待ち）
  | 'in_progress' // 一部完了
  | 'not_started' // 未着手
  | 'certified' // 承認済み（専門認定）
  | 'legacy'; // 本機能導入前から登録済みで書類未取得

export function getVerificationStage(
  tp: TherapistProfile | undefined,
  ob: TherapistOnboarding | undefined
): VerificationStage {
  if (isTherapistCertified(tp)) return 'certified';
  const items = getChecklist(tp, ob);
  if (items.every((i) => i.ok)) return 'ready';
  if (ob?.rejection_reason) return 'rejected';
  if (items.some((i) => i.ok)) return 'in_progress';
  return 'not_started';
}

export const STAGE_META: Record<
  VerificationStage,
  { label: string; badge: string; description: string }
> = {
  ready: {
    label: '承認待ち',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: '書類がすべて揃っています。内容を確認して承認してください',
  },
  rejected: {
    label: '差戻し中',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    description: '再提出待ち',
  },
  in_progress: {
    label: '提出中',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    description: '一部の手続き・書類が未完了',
  },
  not_started: {
    label: '未着手',
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
    description: '仮登録のみ',
  },
  certified: {
    label: '認定済み',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    description: '承認ログあり',
  },
  legacy: {
    label: '既存登録（書類未取得）',
    badge: 'bg-zinc-100 text-zinc-600 border-zinc-300',
    description: '本機能の導入前から登録済み',
  },
};

// --------------------------------------------------------
// 承認・差戻しの入力検証（サーバー側 RPC と同じ順序・同じ条件。デモモードはこちらで検証する）
// --------------------------------------------------------
export interface ApprovalInput {
  qualificationType: string;
  nameMatchConfirmed: boolean;
  insuranceConfirmed: boolean;
}

/** 承認できない理由（日本語）を返す。承認可能なら null */
export function validateApproval(
  tp: TherapistProfile | undefined,
  ob: TherapistOnboarding | undefined,
  input: ApprovalInput
): string | null {
  if (!tp) return '対象のセラピストが見つかりません。';
  if (!ob) return '提出情報（誓約書・書類）が登録されていません。';
  if (tp.payment_status !== 'completed') return '審査手数料の決済が完了していません。';
  if (!tp.is_identity_verified) return 'Stripe の本人確認（eKYC）が完了していません。';
  if (!ob.terms_agreed_at) return '電子誓約書への同意がありません。';
  if (!ob.qualification_file_path) return '資格証が提出されていません。';
  if (!ob.insurance_file_path) return '損害賠償責任保険の証票が提出されていません。';
  if (!input.qualificationType.trim()) return '確認した資格名を選択してください。';
  if (!input.nameMatchConfirmed) return 'Stripe認証氏名と資格証の氏名の一致確認にチェックしてください。';
  if (!input.insuranceConfirmed) return '保険証票の内容確認にチェックしてください。';
  return null;
}

// --------------------------------------------------------
// デモモード用のサンプル書類（実ファイルを使わず画面確認するための SVG）
// --------------------------------------------------------
export const DEMO_PATH_PREFIX = 'demo:';

export function sampleDocumentDataUrl(kind: VerificationDocKind, ownerName: string): string {
  const title = kind === 'qualification' ? '免　許　証（サンプル）' : '損害賠償責任保険 加入証明書（サンプル）';
  const body =
    kind === 'qualification'
      ? ['氏名', ownerName, '登録番号  第 00000 号', '※ デモ用のダミー画像です']
      : ['被保険者', ownerName, '保険期間  2026/04/01 〜 2027/03/31', '※ デモ用のダミー画像です'];
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">` +
    `<rect width="640" height="420" fill="#fefce8" stroke="#a16207" stroke-width="6"/>` +
    `<text x="320" y="70" font-size="30" text-anchor="middle" fill="#713f12" font-family="sans-serif" font-weight="bold">${esc(title)}</text>` +
    body
      .map(
        (line, i) =>
          `<text x="60" y="${150 + i * 55}" font-size="${i === 1 ? 34 : 22}" fill="#422006" font-family="sans-serif">${esc(line)}</text>`
      )
      .join('') +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// ========================================================
// 型定義 (TypeScript Definitions)
// ========================================================

export type UserRole = 'admin' | 'therapist' | 'customer';

export type BookingType = 'visit' | 'store';

export type BookingStatus = 'pending' | 'awaiting_payment' | 'confirmed' | 'completed' | 'cancelled';

export type AuthProvider = 'line' | 'google' | 'email' | 'passkey';

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  address?: string;
  postal_code?: string;
  lat?: number;
  lng?: number;
  auth_provider?: AuthProvider;
  line_user_id?: string;
  google_sub?: string;
  passkey_required?: boolean;
  is_admin?: boolean;
  last_sign_in_at?: string;
  last_passkey_verified_at?: string;
}

export interface PasskeyCredential {
  id: string;
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: number;
  device_name?: string;
  aaguid?: string;
  transports?: string[];
  created_at: string;
  last_used_at?: string;
}

export interface TherapistProfile {
  user_id: string;
  bio: string;
  specialities: string[];
  is_store_based: boolean;
  is_visit_based: boolean;
  address: string;
  lat: number;
  lng: number;
  visit_radius_km: number;
  rating_avg: number;
  reviews_count: number;
  is_approved: boolean;
  stripe_account_id?: string;
  // 店舗・サロン詳細情報
  store_name?: string;
  store_address?: string;
  store_lat?: number;
  store_lng?: number;
  store_access?: string;
  store_parking?: string;
  store_hours?: string;
  store_facilities?: string[];
  store_notes?: string;
  // 稼働シフト・営業時間設定
  available_days?: string[];
  available_hours_start?: string;
  available_hours_end?: string;
  is_separate_store_hours?: boolean;
  store_hours_start?: string;
  store_hours_end?: string;
  // 特典・キャンペーン情報
  campaign?: {
    badge: string;
    title?: string;
    description?: string;
    valid_until?: string;
    discount_type?: 'fixed' | 'percent' | 'gift';
    discount_value?: number;
  };
  // 本登録審査（4ステップ）のステータス
  payment_status?: PaymentStatus; // Step1: 審査手数料の決済
  payment_completed_at?: string | null;
  is_identity_verified?: boolean; // Step2: Stripe Connect eKYC 完了 (payouts_enabled)
  identity_verified_at?: string | null;
  identity_verified_name?: string | null; // Stripe側の認証氏名（資格証との照合用テキスト）
  is_certified?: boolean; // Step4: 運営承認済み（専門認定バッジ）
  certified_at?: string | null;
}

export type PaymentStatus = 'pending' | 'completed';

// 提出書類の種別（temp-qualifications バケットに一時保管される2種）
export type VerificationDocKind = 'qualification' | 'insurance';

// Step3 の提出状況（誓約書の同意記録 ＋ 一時ファイルのパス）
export interface TherapistOnboarding {
  therapist_id: string;
  terms_version?: string | null;
  terms_agreed_at?: string | null;
  terms_signature_name?: string | null;
  claimed_qualification_type?: string | null;
  qualification_file_path?: string | null;
  qualification_file_name?: string | null;
  qualification_uploaded_at?: string | null;
  insurance_file_path?: string | null;
  insurance_file_name?: string | null;
  insurance_uploaded_at?: string | null;
  rejection_reason?: string | null;
  rejected_at?: string | null;
  files_purged_at?: string | null;
  updated_at?: string | null;
}

// 承認ログ（画像削除後も保持するテキストのみ）
export interface VerificationLog {
  id: string;
  therapist_id: string | null;
  therapist_name: string | null;
  decision: 'approved' | 'rejected';
  verified_at: string;
  verified_by: string | null;
  qualification_type: string | null;
  registration_number: string | null;
  confirmed_name: string | null;
  insurance_confirmed: boolean;
  reason: string | null;
  files_deleted_count: number | null;
  files_deleted_at: string | null;
}

export type ServiceCategory =
  | 'physical_therapy'
  | 'occupational_therapy'
  | 'speech_therapy'
  | 'dental_hygiene'
  | 'acupuncture'
  | 'dietitian'
  | 'midwife'
  | 'orthoptist'
  | 'massage'
  | 'aroma'
  | 'chiropractic'
  | 'beauty'
  | 'esthetic'
  | 'personal_training'
  | 'footcare'
  | 'counseling'
  | 'parenting';

export interface Service {
  id: string;
  therapist_id: string;
  title: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: ServiceCategory;
  is_active: boolean;
}

export interface Booking {
  id: string;
  serial_number?: string; // 表示用シリアル番号 (例: BK-0001)
  customer_id: string;
  therapist_id: string;
  service_id: string;
  booking_type: BookingType;
  scheduled_at: string; // ISO string
  status: BookingStatus;
  total_amount: number;
  platform_fee: number;
  therapist_earnings: number;
  stripe_payment_intent_id?: string;
  is_paid?: boolean;
  paid_at?: string;
  lat?: number;
  lng?: number;
  visit_address?: string;
  customer_notes?: string;
  therapist_notes?: string;
  therapist_current_lat?: number;
  therapist_current_lng?: number;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  therapist_id: string;
  rating: number; // 1 - 5
  comment: string;
  created_at: string;
}

export interface PlatformSettings {
  fee_percentage: number;
}

export interface ChatMessage {
  id: string;
  booking_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

// アプリのブランド切り替え (公式決定: CareKuru + 候補ブランド)
export type AppBrandId =
  | 'care_kuru'          // 公式決定ブランド: CareKuru
  | 'care_go_blue'       // 画像1-②: ケアゴー CARE GO (ブルーC×若葉)
  | 'carearia_go_green'  // 画像1-⑬: ケアリアゴー CAREARIA GO (グリーン芽吹き＆人)
  | 'careia_go_pink'     // 画像2-⑩: ケアリアゴー CAREIA GO (ピンクハート×ゴールドリーフ)
  | 'theralink'          // 画像2-⑫: セラリンク THERALINK (オーバルリース×花びらリング)
  | 'carea_go'           // 互換性: Carea Go
  | 'care_go'            // 互換性: Care Go
  | 'thera_go';          // 互換性: Thera Go

export interface AppBrandConfig {
  id: AppBrandId;
  name: string;
  japaneseName: string;
  tagline: string;
  catchphrase: string;
  description: string;
  logoUrl?: string;
  fullImageUrl?: string;
  faviconUrl?: string;
  iconUrl?: string; // 提供画像からトリミングした実画像アイコンのパス
  themeColor: string;
  accentColor: string;
  iconSvg: string; // アイコン部分のSVG定義
}

// 独立設定可能なカスタムブランド設定
export interface CustomBrandingSettings {
  appName?: string;
  appJapaneseName?: string;
  appCatchphrase?: string;
  appTagline?: string;
  selectedLogo?: string; // ロゴ画像パス or プリセット識別子
  selectedIcon?: string; // アイコン画像パス or プリセット識別子
}

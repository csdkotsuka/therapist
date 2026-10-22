// ========================================================
// 型定義 (TypeScript Definitions)
// ========================================================

export type UserRole = 'admin' | 'therapist' | 'customer';

export type BookingType = 'visit' | 'store';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

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
  | 'beauty';

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

// アプリのブランド切り替え (赤枠ロゴ4種 + 既存)
export type AppBrandId =
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
  themeColor: string;
  accentColor: string;
  iconSvg: string; // アイコン部分だけのSVG（ファビコン及びアイコン表示用）
}

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
}

export interface Service {
  id: string;
  therapist_id: string;
  title: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: 'physical_therapy' | 'massage' | 'aroma' | 'chiropractic' | 'beauty';
  is_active: boolean;
}

export interface Booking {
  id: string;
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

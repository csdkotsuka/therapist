import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project')
);

// Supabaseクライアント（設定されている場合のみ有効）
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export interface CustomerRegistrationData {
  name: string;
  email: string;
  password?: string;
  phone: string;
  postalCode: string;
  prefecture: string;
  city: string;
  street: string;
  building?: string;
  lat: number;
  lng: number;
}

export interface SupabaseRegistrationResult {
  success: boolean;
  uid: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    lat: number;
    lng: number;
  };
  isSavedToSupabase: boolean;
  error?: string;
}

/**
 * 顧客新規アカウント作成 & Supabase (Auth + profilesテーブル) へのデータ保存
 */
export async function registerCustomerToSupabase(
  data: CustomerRegistrationData
): Promise<SupabaseRegistrationResult> {
  const fullAddress = `${data.prefecture}${data.city}${data.street}${data.building ? ' ' + data.building : ''}`;
  const generatedId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  let userId = generatedId;
  let isSavedToSupabase = false;

  if (supabase && isSupabaseConfigured) {
    try {
      // 1. Supabase Auth でアカウント登録
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password || 'password123',
        options: {
          data: {
            name: data.name,
            role: 'customer',
            phone: data.phone,
            address: fullAddress,
            postal_code: data.postalCode,
            lat: data.lat,
            lng: data.lng,
          },
        },
      });

      if (authError) {
        // 重複エラー等のユーザーフレンドリーなハンドリング
        if (authError.message.includes('already registered')) {
          throw new Error('このメールアドレスは既に登録されています。ログイン画面からログインしてください。');
        }
        console.warn('Supabase Auth error, attempting direct profile record:', authError.message);
      }

      if (authData?.user) {
        userId = authData.user.id;
      }

      // 2. public.profiles テーブルにレコードを保存 (upsert)
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`;
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        role: 'customer',
        name: data.name,
        email: data.email,
        phone: data.phone,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.warn('Supabase profiles table insert note:', profileError.message);
      } else {
        isSavedToSupabase = true;
      }
    } catch (err: any) {
      if (err.message && err.message.includes('既に登録されています')) {
        throw err;
      }
      console.warn('Supabase connection note:', err.message);
    }
  }

  // ローカルストレージにもバックアップ（オフライン・開発時互換）
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('carehub_registered_customers') || '[]';
      const list = JSON.parse(stored);
      list.push({
        id: userId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: fullAddress,
        lat: data.lat,
        lng: data.lng,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem('carehub_registered_customers', JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  return {
    success: true,
    uid: userId,
    customer: {
      id: userId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: fullAddress,
      lat: data.lat,
      lng: data.lng,
    },
    isSavedToSupabase,
  };
}

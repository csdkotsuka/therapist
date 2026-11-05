'use client';

// ========================================================
// アプリ全体の状態（Supabase が唯一のデータソース）
//   - ログイン状態は Supabase Auth（Cookie セッション）から取得する。クライアント側でユーザーを切り替える手段はない。
//   - 業務データはブラウザに保存しない（localStorage 等は使わない）。表示用にメモリ上へ読み込むだけ。
//   - 読み取りは RLS で「見てよい行」だけが返る。書き込みは RLS / RPC が権限と金額を検証する。
// ========================================================
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type {
  AppBrandConfig,
  AppBrandId,
  Booking,
  BookingStatus,
  ChatMessage,
  CustomBrandingSettings,
  Profile,
  Review,
  Service,
  TherapistOnboarding,
  TherapistProfile,
  VerificationDocKind,
  VerificationLog,
} from '@/types';
import { APP_BRANDS, DEFAULT_BRAND_ID, updateDocumentBranding } from '@/lib/branding';
import { getSupabase, isSupabaseConfigured, toUserMessage } from '@/lib/supabase';
import {
  buildStoragePath,
  DEMO_PATH_PREFIX,
  sampleDocumentDataUrl,
  TERMS_VERSION,
  validateApproval,
  validateDocFile,
} from '@/lib/verification';
import { createSignedViewUrl, postAuthed, removeFromTempBucket, uploadToTempBucket } from '@/lib/verificationApi';

export interface UserLocation {
  name: string;
  lat: number;
  lng: number;
}

export const PRESET_LOCATIONS: UserLocation[] = [
  { name: '松山市駅・大街道 (松山中心部)', lat: 33.8392, lng: 132.7656 },
  { name: '道後温泉本館前 (松山)', lat: 33.852, lng: 132.7865 },
  { name: '今治駅前 (今治)', lat: 34.066, lng: 132.9976 },
  { name: '新居浜駅前 (新居浜)', lat: 33.9602, lng: 133.2831 },
  { name: '西条駅前 (西条)', lat: 33.9182, lng: 133.1818 },
  { name: '宇和島駅前 (南予・宇和島)', lat: 33.2263, lng: 132.5658 },
  { name: '大洲駅前 (大洲)', lat: 33.5074, lng: 132.5447 },
];

const DEFAULT_CENTER = PRESET_LOCATIONS[0];

const DEFAULT_CUSTOM_BRANDING: CustomBrandingSettings = {
  appName: 'CareKuru',
  appJapaneseName: 'CareKuru',
  appTagline: 'CareKuru',
  appCatchphrase: 'プロがあなたの元へ届く。出張・店舗ヘルスケア＆ボディケア',
  selectedIcon: '/branding/icon_carearia_symbol.png',
  selectedLogo: '/branding/icon_carearia_symbol.png',
};

export type PaymentMode = 'dummy' | 'stripe';

type ActionResult = { ok: boolean; message: string };

export interface CreateBookingInput {
  therapist_id: string;
  service_id: string;
  booking_type: Booking['booking_type'];
  scheduled_at: string;
  visit_address?: string;
  customer_notes?: string;
  /** 表示用に渡されても無視する（金額は DB 側でメニューから算出） */
  total_amount?: number;
  customer_id?: string;
}

interface AppContextType {
  // --- 認証 ---
  currentUser: Profile | null;
  isLoggedIn: boolean;
  authReady: boolean;
  logout: () => Promise<void>;

  // --- データ（RLS で許可された範囲のみ） ---
  allUsers: Profile[];
  therapistProfiles: Record<string, TherapistProfile>;
  services: Service[];
  bookings: Booking[];
  reviews: Review[];
  messages: ChatMessage[];
  onboardings: Record<string, TherapistOnboarding>;
  verificationLogs: VerificationLog[];
  platformFeeRate: number;
  paymentMode: PaymentMode;
  isLiveSupabase: boolean;
  isLoadingDb: boolean;
  refreshFromSupabase: () => Promise<void>;

  // --- 画面状態 ---
  userLocation: UserLocation;
  setUserLocation: (loc: UserLocation) => void;
  notice: string | null;
  clearNotice: () => void;

  // --- 予約・チャット・レビュー ---
  createBooking: (input: CreateBookingInput) => Promise<Booking>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<boolean>;
  payBooking: (bookingId: string) => Promise<boolean>;
  updateTherapistLocation: (bookingId: string, lat: number, lng: number) => Promise<void>;
  sendChatMessage: (bookingId: string, receiverId: string, content: string) => Promise<ChatMessage | null>;
  markMessagesAsRead: (bookingId: string) => void;
  createReview: (review: Omit<Review, 'id' | 'created_at'>) => Promise<boolean>;

  // --- プロフィール・メニュー ---
  updateUserProfile: (userId: string, data: Partial<Profile>) => Promise<boolean>;
  updateTherapistInfo: (userId: string, profileData: Partial<Profile>, therapistData: Partial<TherapistProfile>) => Promise<boolean>;
  addService: (service: Omit<Service, 'id'>) => Promise<boolean>;

  // --- 管理者 ---
  toggleTherapistApproval: (userId: string) => Promise<void>;
  setPlatformFeeRate: (rate: number) => Promise<void>;

  // --- ブランド ---
  appBrand: AppBrandId;
  currentBrand: AppBrandConfig;
  customBranding: CustomBrandingSettings;
  setAppBrand: (brandId: AppBrandId) => Promise<void>;
  updateCustomBranding: (settings: Partial<CustomBrandingSettings>) => Promise<void>;

  // --- 本登録審査（4ステップ） ---
  completeReviewFeePayment: (therapistId: string) => Promise<{ ok: boolean; redirectUrl?: string; message: string }>;
  completeStripeEkyc: (therapistId: string, verifiedName?: string) => Promise<{ ok: boolean; redirectUrl?: string; message: string }>;
  submitTermsAgreement: (therapistId: string, signatureName: string, claimedQualificationType?: string) => Promise<ActionResult>;
  uploadVerificationDoc: (therapistId: string, kind: VerificationDocKind, file: File) => Promise<ActionResult>;
  getVerificationDocPreviewUrl: (therapistId: string, kind: VerificationDocKind) => Promise<string | null>;
  approveTherapistVerification: (params: {
    therapistId: string;
    qualificationType: string;
    registrationNumber?: string;
    nameMatchConfirmed: boolean;
    insuranceConfirmed: boolean;
  }) => Promise<{ ok: boolean; message: string; deletedFilesCount: number }>;
  rejectTherapistVerification: (params: {
    therapistId: string;
    reason: string;
  }) => Promise<{ ok: boolean; message: string; deletedFilesCount: number }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ---------------- DB 行 → アプリの型 ----------------
type Row = Record<string, unknown>;

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
};

function toProfile(row: Row): Profile {
  return {
    ...(row as unknown as Profile),
    email: (row.email as string | null) ?? '',
    phone: (row.phone as string | null) ?? undefined,
    avatar_url: (row.avatar_url as string | null) ?? undefined,
    address: (row.address as string | null) ?? undefined,
    lat: row.lat == null ? undefined : num(row.lat),
    lng: row.lng == null ? undefined : num(row.lng),
  };
}

function toTherapistProfile(row: Row): TherapistProfile {
  const t = row as unknown as TherapistProfile & { location?: unknown };
  const { location: _location, ...rest } = t;
  void _location;
  return {
    ...rest,
    bio: t.bio ?? '',
    specialities: t.specialities ?? [],
    address: t.address ?? '',
    lat: num(row.lat, DEFAULT_CENTER.lat),
    lng: num(row.lng, DEFAULT_CENTER.lng),
    visit_radius_km: num(row.visit_radius_km, 10),
    rating_avg: num(row.rating_avg),
    reviews_count: num(row.reviews_count),
    campaign: t.campaign ?? undefined,
  };
}

function toBooking(row: Row): Booking {
  const b = row as unknown as Booking & { location?: unknown };
  const { location: _location, ...rest } = b;
  void _location;
  return {
    ...rest,
    therapist_current_lat: row.therapist_current_lat == null ? undefined : num(row.therapist_current_lat),
    therapist_current_lng: row.therapist_current_lng == null ? undefined : num(row.therapist_current_lng),
    lat: row.lat == null ? undefined : num(row.lat),
    lng: row.lng == null ? undefined : num(row.lng),
  };
}

const byId = <T extends { id: string }>(rows: T[]) => new Map(rows.map((r) => [r.id, r]));

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sb = getSupabase();

  // --- 認証 ---
  const [userId, setUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);

  // --- データ ---
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [therapistProfiles, setTherapistProfiles] = useState<Record<string, TherapistProfile>>({});
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onboardings, setOnboardings] = useState<Record<string, TherapistOnboarding>>({});
  const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>([]);
  const [platformFeeRate, setPlatformFeeRateState] = useState<number>(20);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('dummy');
  const [appBrand, setAppBrandState] = useState<AppBrandId>(DEFAULT_BRAND_ID);
  const [customBranding, setCustomBrandingState] = useState<CustomBrandingSettings>(DEFAULT_CUSTOM_BRANDING);
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  // --- 画面状態 ---
  const [userLocation, setUserLocation] = useState<UserLocation>(DEFAULT_CENTER);
  const locationTouched = useRef(false);
  const [notice, setNotice] = useState<string | null>(null);

  const notify = useCallback((message: string) => setNotice(message), []);
  const clearNotice = useCallback(() => setNotice(null), []);

  const currentUser = useMemo(
    () => (userId ? allUsers.find((u) => u.id === userId) ?? null : null),
    [allUsers, userId]
  );

  // ========================================================
  // 読み込み
  // ========================================================
  const loadPublicData = useCallback(async () => {
    if (!sb) return { profiles: [] as Profile[], therapists: {} as Record<string, TherapistProfile> };
    const [pubProfiles, pubTherapists, svc, rev, settings] = await Promise.all([
      sb.from('public_profiles').select('*'),
      sb.from('public_therapist_profiles').select('*'),
      sb.from('services').select('*').order('created_at', { ascending: true }),
      sb.from('reviews').select('*').order('created_at', { ascending: false }),
      sb.from('platform_settings').select('key,value'),
    ]);

    if (svc.data) setServices(svc.data as Service[]);
    if (rev.data) setReviews(rev.data as Review[]);

    for (const s of (settings.data ?? []) as { key: string; value: Record<string, unknown> }[]) {
      if (s.key === 'fee_rate' && s.value?.percentage != null) setPlatformFeeRateState(num(s.value.percentage, 20));
      if (s.key === 'payment_mode') setPaymentMode(s.value?.mode === 'stripe' ? 'stripe' : 'dummy');
      if (s.key === 'app_brand' && APP_BRANDS[s.value?.brand_id as AppBrandId]) setAppBrandState(s.value.brand_id as AppBrandId);
      if (s.key === 'custom_branding' && s.value) {
        setCustomBrandingState({ ...DEFAULT_CUSTOM_BRANDING, ...(s.value as CustomBrandingSettings) });
      }
    }

    const profiles = ((pubProfiles.data ?? []) as Row[]).map(toProfile);
    const therapists: Record<string, TherapistProfile> = {};
    for (const row of (pubTherapists.data ?? []) as Row[]) therapists[row.user_id as string] = toTherapistProfile(row);

    const firstError = pubProfiles.error ?? pubTherapists.error ?? svc.error ?? rev.error;
    if (firstError) console.warn('[supabase] public data load error:', firstError.message);
    return { profiles, therapists };
  }, [sb]);

  // 読み込みの世代番号。ログアウトやアカウント切替の直後に、古い読み込み結果で上書きしないようにする
  const loadSeq = useRef(0);

  const loadAll = useCallback(
    async (uid: string | null) => {
      if (!sb) return;
      const seq = ++loadSeq.current;
      setIsLoadingDb(true);
      try {
        const [pub, priv] = await Promise.all([
          loadPublicData(),
          uid
            ? Promise.all([
                sb.from('profiles').select('*'),
                sb.from('therapist_profiles').select('*'),
                sb.from('bookings').select('*').order('created_at', { ascending: false }),
                sb.from('chat_messages').select('*').order('created_at', { ascending: true }),
                sb.from('therapist_onboarding').select('*'),
                sb.from('therapist_verification_logs').select('*').order('verified_at', { ascending: false }),
              ])
            : Promise.resolve(null),
        ]);
        if (seq !== loadSeq.current) return;

        // 公開情報（表示名・アイコン）に、閲覧権限のある詳細情報（本人・取引相手・管理者）を上書き
        const users = byId(pub.profiles);
        const therapists = { ...pub.therapists };
        if (priv) {
          const [profiles, tps, bks, msgs, obs, logs] = priv;
          for (const row of (profiles.data ?? []) as Row[]) users.set(row.id as string, toProfile(row));
          for (const row of (tps.data ?? []) as Row[]) therapists[row.user_id as string] = toTherapistProfile(row);
          setBookings(((bks.data ?? []) as Row[]).map(toBooking));
          setMessages((msgs.data ?? []) as ChatMessage[]);
          const obMap: Record<string, TherapistOnboarding> = {};
          for (const row of (obs.data ?? []) as TherapistOnboarding[]) obMap[row.therapist_id] = row;
          setOnboardings(obMap);
          setVerificationLogs((logs.data ?? []) as VerificationLog[]);
          const err = profiles.error ?? tps.error ?? bks.error ?? msgs.error;
          if (err) console.warn('[supabase] private data load error:', err.message);
        } else {
          setBookings([]);
          setMessages([]);
          setOnboardings({});
          setVerificationLogs([]);
        }
        setAllUsers([...users.values()]);
        setTherapistProfiles(therapists);
      } finally {
        if (seq === loadSeq.current) setIsLoadingDb(false);
      }
    },
    [sb, loadPublicData]
  );

  const refreshFromSupabase = useCallback(() => loadAll(userId), [loadAll, userId]);

  // 旧バージョンが localStorage に保存していた個人情報・業務データを削除する
  useEffect(() => {
    try {
      for (const key of ['therapist_platform_state_ehime_v5', 'carehub_registered_customers', 'carehub_custom_branding']) {
        localStorage.removeItem(key);
      }
      Object.keys(localStorage)
        .filter((k) => k.startsWith('therapist_platform_state'))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      // ストレージ無効環境では何もしない
    }
  }, []);

  // ログイン状態の監視（Cookie セッション）
  useEffect(() => {
    if (!sb) return;
    let active = true;
    sb.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUserId(data.user?.id ?? null);
      setAuthReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [sb]);

  // ログイン状態が確定・変化したら、その権限で見られるデータを取り直す（外部データの同期なので effect で行う）
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (authReady) loadAll(userId);
  }, [authReady, userId, loadAll]);

  // 予約・チャットの変更をリアルタイムで反映（RLS により自分に関係する行のみ届く）
  useEffect(() => {
    if (!sb || !userId) return;
    const channel = sb
      .channel(`app-changes-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        if (payload.eventType === 'DELETE') return;
        const row = toBooking(payload.new as Row);
        setBookings((prev) => (prev.some((b) => b.id === row.id) ? prev.map((b) => (b.id === row.id ? row : b)) : [row, ...prev]));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, (payload) => {
        if (payload.eventType === 'DELETE') return;
        const row = payload.new as ChatMessage;
        setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev.map((m) => (m.id === row.id ? row : m)) : [...prev, row]));
      })
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [sb, userId]);

  // ログインユーザーの登録住所を初期の現在地にする（利用者が手動で変更した後は上書きしない）
  useEffect(() => {
    if (locationTouched.current || !currentUser?.lat || !currentUser?.lng) return;
    setUserLocation({ name: currentUser.address || `${currentUser.name}の登録住所`, lat: currentUser.lat, lng: currentUser.lng });
  }, [currentUser?.id, currentUser?.lat, currentUser?.lng, currentUser?.address, currentUser?.name]);

  const setUserLocationManual = useCallback((loc: UserLocation) => {
    locationTouched.current = true;
    setUserLocation(loc);
  }, []);

  const logout = useCallback(async () => {
    if (sb) await sb.auth.signOut();
    locationTouched.current = false;
    setUserLocation(DEFAULT_CENTER);
    setUserId(null);
  }, [sb]);

  // ========================================================
  // ブランド
  // ========================================================
  const currentBrand: AppBrandConfig = useMemo(() => {
    const baseBrand = APP_BRANDS[appBrand] || APP_BRANDS[DEFAULT_BRAND_ID];
    const icon = customBranding.selectedIcon || baseBrand.iconUrl;
    return {
      ...baseBrand,
      name: customBranding.appName || baseBrand.name,
      japaneseName: customBranding.appJapaneseName || baseBrand.japaneseName,
      catchphrase: customBranding.appCatchphrase || baseBrand.catchphrase,
      tagline: customBranding.appTagline || baseBrand.tagline,
      iconUrl: icon,
      logoUrl: icon,
    };
  }, [appBrand, customBranding]);

  useEffect(() => {
    updateDocumentBranding(currentBrand);
  }, [currentBrand]);

  const saveSetting = useCallback(
    async (key: string, value: unknown) => {
      if (!sb) return false;
      const { error } = await sb.from('platform_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) {
        notify(toUserMessage(error, '設定の保存に失敗しました。'));
        return false;
      }
      return true;
    },
    [sb, notify]
  );

  const setAppBrand = async (brandId: AppBrandId) => {
    if (await saveSetting('app_brand', { brand_id: brandId })) setAppBrandState(brandId);
  };

  const updateCustomBranding = async (settings: Partial<CustomBrandingSettings>) => {
    const next = { ...customBranding, ...settings };
    if (await saveSetting('custom_branding', next)) setCustomBrandingState(next);
  };

  const setPlatformFeeRate = async (rate: number) => {
    if (await saveSetting('fee_rate', { percentage: rate })) setPlatformFeeRateState(rate);
  };

  // ========================================================
  // 予約
  // ========================================================
  const replaceBooking = (row: Row) => {
    const b = toBooking(row);
    setBookings((prev) => (prev.some((x) => x.id === b.id) ? prev.map((x) => (x.id === b.id ? b : x)) : [b, ...prev]));
    return b;
  };

  const createBooking = async (input: CreateBookingInput): Promise<Booking> => {
    if (!sb || !userId) throw new Error('予約にはログインが必要です。');
    const isVisit = input.booking_type === 'visit';
    const { data, error } = await sb.rpc('create_booking', {
      p_service_id: input.service_id,
      p_booking_type: input.booking_type,
      p_scheduled_at: input.scheduled_at,
      p_visit_address: isVisit ? input.visit_address ?? null : null,
      p_lat: isVisit ? userLocation.lat : null,
      p_lng: isVisit ? userLocation.lng : null,
      p_customer_notes: input.customer_notes ?? null,
    });
    if (error || !data) throw new Error(toUserMessage(error, '予約リクエストの送信に失敗しました。'));
    return replaceBooking(data as Row);
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus): Promise<boolean> => {
    if (!sb) return false;
    if (status === 'confirmed') return payBooking(bookingId);
    const { data, error } = await sb.rpc('update_booking_status', { p_booking_id: bookingId, p_status: status });
    if (error || !data) {
      notify(toUserMessage(error, '予約の更新に失敗しました。'));
      return false;
    }
    replaceBooking(data as Row);
    return true;
  };

  const payBooking = async (bookingId: string): Promise<boolean> => {
    if (!sb) return false;
    if (paymentMode !== 'dummy') {
      notify('オンライン決済は準備中です。');
      return false;
    }
    const { data, error } = await sb.rpc('pay_booking_dummy', { p_booking_id: bookingId });
    if (error || !data) {
      notify(toUserMessage(error, '決済に失敗しました。'));
      return false;
    }
    replaceBooking(data as Row);
    return true;
  };

  const updateTherapistLocation = async (bookingId: string, lat: number, lng: number) => {
    if (!sb) return;
    const { error } = await sb.rpc('update_therapist_location', { p_booking_id: bookingId, p_lat: lat, p_lng: lng });
    if (error) {
      console.warn('[location] update rejected:', error.message);
      return;
    }
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, therapist_current_lat: lat, therapist_current_lng: lng } : b)));
  };

  // ========================================================
  // チャット・レビュー
  // ========================================================
  const sendChatMessage = async (bookingId: string, receiverId: string, content: string): Promise<ChatMessage | null> => {
    if (!sb || !userId) return null;
    const { data, error } = await sb
      .from('chat_messages')
      .insert({ booking_id: bookingId, sender_id: userId, receiver_id: receiverId, content })
      .select()
      .single();
    if (error || !data) {
      notify(toUserMessage(error, 'メッセージを送信できませんでした。'));
      return null;
    }
    const msg = data as ChatMessage;
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    return msg;
  };

  const messagesRef = useRef<ChatMessage[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const markMessagesAsRead = useCallback(
    (bookingId: string) => {
      if (!sb || !userId) return;
      const isUnreadForMe = (m: ChatMessage) => m.booking_id === bookingId && m.receiver_id === userId && !m.is_read;
      if (!messagesRef.current.some(isUnreadForMe)) return;
      setMessages((prev) => prev.map((m) => (isUnreadForMe(m) ? { ...m, is_read: true } : m)));
      sb.rpc('mark_messages_read', { p_booking_id: bookingId }).then(({ error }) => {
        if (error) console.warn('[chat] mark read failed:', error.message);
      });
    },
    [sb, userId]
  );

  const createReview = async (review: Omit<Review, 'id' | 'created_at'>): Promise<boolean> => {
    if (!sb || !userId) return false;
    const { data, error } = await sb
      .from('reviews')
      .insert({
        booking_id: review.booking_id,
        customer_id: userId,
        therapist_id: review.therapist_id,
        rating: review.rating,
        comment: review.comment,
      })
      .select()
      .single();
    if (error || !data) {
      notify(toUserMessage(error, 'レビューを投稿できませんでした。'));
      return false;
    }
    setReviews((prev) => [data as Review, ...prev]);
    // 平均評価は DB トリガーで再計算されるので最新値を取り直す
    const { data: tp } = await sb.from('public_therapist_profiles').select('*').eq('user_id', review.therapist_id).maybeSingle();
    if (tp) setTherapistProfiles((prev) => ({ ...prev, [review.therapist_id]: { ...prev[review.therapist_id], ...toTherapistProfile(tp as Row) } }));
    return true;
  };

  // ========================================================
  // プロフィール・メニュー
  // ========================================================
  const updateUserProfile = async (targetId: string, update: Partial<Profile>): Promise<boolean> => {
    if (!sb) return false;
    const payload: Row = {};
    for (const key of ['name', 'phone', 'address', 'postal_code', 'lat', 'lng', 'avatar_url'] as const) {
      if (update[key] !== undefined) payload[key] = update[key];
    }
    if (Object.keys(payload).length === 0) return true;
    const { data, error } = await sb.from('profiles').update(payload).eq('id', targetId).select().single();
    if (error || !data) {
      notify(toUserMessage(error, 'プロフィールを保存できませんでした。'));
      return false;
    }
    const saved = toProfile(data as Row);
    setAllUsers((prev) => prev.map((u) => (u.id === targetId ? saved : u)));
    if (targetId === userId && saved.lat && saved.lng) {
      setUserLocation({ name: saved.address || '登録住所', lat: saved.lat, lng: saved.lng });
    }
    return true;
  };

  const THERAPIST_EDITABLE = [
    'bio', 'specialities', 'is_store_based', 'is_visit_based', 'visit_radius_km', 'address', 'lat', 'lng',
    'store_name', 'store_address', 'store_lat', 'store_lng', 'store_access', 'store_parking', 'store_hours',
    'store_facilities', 'store_notes', 'available_days', 'available_hours_start', 'available_hours_end',
    'is_separate_store_hours', 'store_hours_start', 'store_hours_end',
  ] as const;

  const updateTherapistInfo = async (
    targetId: string,
    profileData: Partial<Profile>,
    therapistData: Partial<TherapistProfile>
  ): Promise<boolean> => {
    if (!sb) return false;
    if (!(await updateUserProfile(targetId, profileData))) return false;

    const merged: Partial<TherapistProfile> = {
      ...therapistData,
      address: profileData.address ?? therapistData.address,
      lat: profileData.lat ?? therapistData.lat,
      lng: profileData.lng ?? therapistData.lng,
    };
    const payload: Row = {};
    for (const key of THERAPIST_EDITABLE) {
      if (merged[key] !== undefined) payload[key] = merged[key];
    }
    if ('campaign' in therapistData) payload.campaign = therapistData.campaign ?? null;

    const { data, error } = await sb.from('therapist_profiles').update(payload).eq('user_id', targetId).select().single();
    if (error || !data) {
      notify(toUserMessage(error, 'セラピスト情報を保存できませんでした。'));
      return false;
    }
    setTherapistProfiles((prev) => ({ ...prev, [targetId]: toTherapistProfile(data as Row) }));
    return true;
  };

  const addService = async (service: Omit<Service, 'id'>): Promise<boolean> => {
    if (!sb) return false;
    const { data, error } = await sb
      .from('services')
      .insert({
        therapist_id: service.therapist_id,
        title: service.title,
        description: service.description,
        price: service.price,
        duration_minutes: service.duration_minutes,
        category: service.category,
        is_active: service.is_active,
      })
      .select()
      .single();
    if (error || !data) {
      notify(toUserMessage(error, 'メニューを追加できませんでした。'));
      return false;
    }
    setServices((prev) => [...prev, data as Service]);
    return true;
  };

  // ========================================================
  // 管理者
  // ========================================================
  const toggleTherapistApproval = async (targetId: string) => {
    if (!sb) return;
    const current = therapistProfiles[targetId];
    const { data, error } = await sb
      .from('therapist_profiles')
      .update({ is_approved: !current?.is_approved })
      .eq('user_id', targetId)
      .select()
      .single();
    if (error || !data) {
      notify(toUserMessage(error, '承認状態を変更できませんでした。'));
      return;
    }
    setTherapistProfiles((prev) => ({ ...prev, [targetId]: toTherapistProfile(data as Row) }));
  };

  // ========================================================
  // 本登録審査（4ステップ）
  // ========================================================
  const reloadTherapist = async (therapistId: string) => {
    if (!sb) return;
    const [tp, ob] = await Promise.all([
      sb.from('therapist_profiles').select('*').eq('user_id', therapistId).maybeSingle(),
      sb.from('therapist_onboarding').select('*').eq('therapist_id', therapistId).maybeSingle(),
    ]);
    if (tp.data) setTherapistProfiles((prev) => ({ ...prev, [therapistId]: toTherapistProfile(tp.data as Row) }));
    setOnboardings((prev) => {
      const next = { ...prev };
      if (ob.data) next[therapistId] = ob.data as TherapistOnboarding;
      else delete next[therapistId];
      return next;
    });
  };

  // 【Step 1】審査手数料（Stripe 接続前はダミー決済）
  const completeReviewFeePayment = async (therapistId: string) => {
    if (!sb) return { ok: false, message: 'Supabase が設定されていません。' };
    if (paymentMode === 'stripe') {
      const res = await postAuthed<{ url?: string }>('/api/stripe/review-fee', {});
      return res.ok && res.data?.url
        ? { ok: true, redirectUrl: res.data.url, message: 'Stripe Checkout 決済画面へ移動します。' }
        : { ok: false, message: res.message || '決済画面を開けませんでした。' };
    }
    const { error } = await sb.rpc('dummy_complete_review_fee', { p_therapist_id: therapistId });
    if (error) return { ok: false, message: toUserMessage(error, '決済処理に失敗しました。') };
    await reloadTherapist(therapistId);
    return { ok: true, message: '審査手数料（5,000円）のダミー決済が完了しました。Step 2（口座登録・本人確認）へ進めます。' };
  };

  // 【Step 2】Stripe Connect 口座登録・本人確認（Stripe 接続前はダミー完了）
  const completeStripeEkyc = async (therapistId: string, verifiedName?: string) => {
    if (!sb) return { ok: false, message: 'Supabase が設定されていません。' };
    if (therapistProfiles[therapistId]?.payment_status !== 'completed') {
      return { ok: false, message: '先に Step 1（審査手数料 5,000円の決済）を完了してください。' };
    }
    if (paymentMode === 'stripe') {
      const res = await postAuthed<{ url?: string }>('/api/stripe/connect', {});
      return res.ok && res.data?.url
        ? { ok: true, redirectUrl: res.data.url, message: 'Stripe Express オンボーディング画面へ移動します。' }
        : { ok: false, message: res.message || 'Stripe の画面を開けませんでした。' };
    }
    const name = (verifiedName || allUsers.find((u) => u.id === therapistId)?.name || '').replace(/\s*\(.*?\)\s*$/, '').trim();
    const { error } = await sb.rpc('dummy_complete_identity_verification', { p_therapist_id: therapistId, p_verified_name: name });
    if (error) return { ok: false, message: toUserMessage(error, '本人確認の処理に失敗しました。') };
    await reloadTherapist(therapistId);
    return { ok: true, message: `本人確認（ダミー）が完了しました（認証氏名: ${name || '未設定'}）。` };
  };

  // 【Step 3-A】電子誓約書への同意・電子署名
  const submitTermsAgreement = async (therapistId: string, signatureName: string, claimedQualificationType?: string) => {
    if (!sb) return { ok: false, message: 'Supabase が設定されていません。' };
    const trimmed = signatureName.trim();
    if (!trimmed) return { ok: false, message: '電子署名（氏名）を入力してください。' };
    const now = new Date().toISOString();
    const { data, error } = await sb
      .from('therapist_onboarding')
      .upsert({
        therapist_id: therapistId,
        terms_version: TERMS_VERSION,
        terms_agreed_at: now,
        terms_signature_name: trimmed,
        claimed_qualification_type: claimedQualificationType || onboardings[therapistId]?.claimed_qualification_type || null,
        updated_at: now,
      })
      .select()
      .single();
    if (error || !data) return { ok: false, message: toUserMessage(error, '同意の記録に失敗しました。') };
    setOnboardings((prev) => ({ ...prev, [therapistId]: data as TherapistOnboarding }));
    return { ok: true, message: '電子誓約書への同意・署名を記録しました。' };
  };

  // 【Step 3-B】資格証・保険証票のアップロード（temp-qualifications 一時バケット）
  const uploadVerificationDoc = async (therapistId: string, kind: VerificationDocKind, file: File) => {
    if (!sb) return { ok: false, message: 'Supabase が設定されていません。' };
    const validationErr = validateDocFile(file);
    if (validationErr) return { ok: false, message: validationErr };

    const storagePath = buildStoragePath(therapistId, kind, file.type);
    const { error: uploadError } = await uploadToTempBucket(storagePath, file);
    if (uploadError) return { ok: false, message: `アップロードに失敗しました: ${uploadError}` };

    const prevPath = kind === 'qualification' ? onboardings[therapistId]?.qualification_file_path : onboardings[therapistId]?.insurance_file_path;
    const now = new Date().toISOString();
    const { data, error } = await sb
      .from('therapist_onboarding')
      .upsert({
        therapist_id: therapistId,
        ...(kind === 'qualification'
          ? { qualification_file_path: storagePath, qualification_file_name: file.name, qualification_uploaded_at: now }
          : { insurance_file_path: storagePath, insurance_file_name: file.name, insurance_uploaded_at: now }),
        rejection_reason: null,
        rejected_at: null,
        files_purged_at: null,
        updated_at: now,
      })
      .select()
      .single();
    if (error || !data) {
      await removeFromTempBucket(storagePath);
      return { ok: false, message: toUserMessage(error, '提出情報の保存に失敗しました。') };
    }
    if (prevPath && !prevPath.startsWith(DEMO_PATH_PREFIX)) await removeFromTempBucket(prevPath);
    setOnboardings((prev) => ({ ...prev, [therapistId]: data as TherapistOnboarding }));
    return {
      ok: true,
      message: `${kind === 'qualification' ? '保有資格証' : '損害賠償責任保険の加入証明'}（${file.name}）をアップロードしました。`,
    };
  };

  // 提出書類のプレビュー URL（5分間有効の署名付き URL。デモデータはサンプル画像）
  const getVerificationDocPreviewUrl = async (therapistId: string, kind: VerificationDocKind) => {
    const ob = onboardings[therapistId];
    const path = kind === 'qualification' ? ob?.qualification_file_path : ob?.insurance_file_path;
    if (!path) return null;
    if (path.startsWith(DEMO_PATH_PREFIX)) {
      const owner = (therapistProfiles[therapistId]?.identity_verified_name || ob?.terms_signature_name || '申請者')
        .replace(/\s*\(.*?\)\s*$/, '')
        .trim();
      return sampleDocumentDataUrl(kind, owner);
    }
    return createSignedViewUrl(path);
  };

  // 【Step 4】承認・差戻し（サーバー API: 検証・フラグ更新・ログ記録・提出ファイル削除をまとめて実行）
  const decideVerification = async (body: Record<string, unknown>) => {
    const res = await postAuthed<{ deletedCount?: number }>('/api/admin/verification-decision', body);
    if (res.ok) await loadAll(userId);
    return { ok: res.ok, message: res.message || (res.ok ? '処理しました。' : '処理に失敗しました。'), deletedFilesCount: res.data?.deletedCount ?? 0 };
  };

  const approveTherapistVerification: AppContextType['approveTherapistVerification'] = async (params) => {
    const validationErr = validateApproval(therapistProfiles[params.therapistId], onboardings[params.therapistId], {
      qualificationType: params.qualificationType,
      nameMatchConfirmed: params.nameMatchConfirmed,
      insuranceConfirmed: params.insuranceConfirmed,
    });
    if (validationErr) return { ok: false, message: validationErr, deletedFilesCount: 0 };
    return decideVerification({
        decision: 'approve',
        therapistId: params.therapistId,
        qualificationType: params.qualificationType.trim(),
        registrationNumber: params.registrationNumber?.trim() || null,
        nameMatchConfirmed: params.nameMatchConfirmed,
        insuranceConfirmed: params.insuranceConfirmed,
      });
  };

  const rejectTherapistVerification: AppContextType['rejectTherapistVerification'] = async ({ therapistId, reason }) => {
    if (!reason.trim()) return { ok: false, message: '差戻し理由を入力してください。', deletedFilesCount: 0 };
    return decideVerification({ decision: 'reject', therapistId, reason: reason.trim() });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isLoggedIn: Boolean(currentUser),
        authReady,
        logout,
        allUsers,
        therapistProfiles,
        services,
        bookings,
        reviews,
        messages,
        onboardings,
        verificationLogs,
        platformFeeRate,
        paymentMode,
        isLiveSupabase: isSupabaseConfigured,
        isLoadingDb,
        refreshFromSupabase,
        userLocation,
        setUserLocation: setUserLocationManual,
        notice,
        clearNotice,
        createBooking,
        updateBookingStatus,
        payBooking,
        updateTherapistLocation,
        sendChatMessage,
        markMessagesAsRead,
        createReview,
        updateUserProfile,
        updateTherapistInfo,
        addService,
        toggleTherapistApproval,
        setPlatformFeeRate,
        appBrand,
        currentBrand,
        customBranding,
        setAppBrand,
        updateCustomBranding,
        completeReviewFeePayment,
        completeStripeEkyc,
        submitTermsAgreement,
        uploadVerificationDoc,
        getVerificationDocPreviewUrl,
        approveTherapistVerification,
        rejectTherapistVerification,
      }}
    >
      {children}
      {notice && (
        <div
          role="alert"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-[calc(100%-2rem)] bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-2xl px-4 py-3 flex items-start gap-3"
        >
          <span className="flex-1 leading-relaxed">{notice}</span>
          <button type="button" onClick={clearNotice} className="text-slate-400 hover:text-white" aria-label="閉じる">
            ✕
          </button>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

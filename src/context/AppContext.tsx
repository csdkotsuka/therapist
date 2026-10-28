'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Profile,
  TherapistProfile,
  Service,
  Booking,
  Review,
  UserRole,
  BookingStatus,
  ChatMessage,
  AppBrandId,
  AppBrandConfig,
  CustomBrandingSettings,
  TherapistOnboarding,
  VerificationLog,
  VerificationDocKind,
} from '@/types';
import {
  APP_BRANDS,
  DEFAULT_BRAND_ID,
  updateDocumentBranding,
} from '@/lib/branding';
import {
  initialProfiles,
  initialTherapistProfiles,
  initialServices,
  initialBookings,
  initialReviews,
  initialChatMessages,
  initialOnboardings,
  initialVerificationLogs,
} from '@/lib/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  TERMS_VERSION,
  validateDocFile,
  buildStoragePath,
  validateApproval,
  DEMO_PATH_PREFIX,
  sampleDocumentDataUrl,
} from '@/lib/verification';
import {
  postAuthed,
  uploadToTempBucket,
  removeFromTempBucket,
  createSignedViewUrl,
} from '@/lib/verificationApi';

interface UserLocation {
  name: string;
  lat: number;
  lng: number;
}

export const PRESET_LOCATIONS: UserLocation[] = [
  { name: '松山市駅・大街道 (松山中心部)', lat: 33.8392, lng: 132.7656 },
  { name: '道後温泉本館前 (松山)', lat: 33.8520, lng: 132.7865 },
  { name: '今治駅前 (今治)', lat: 34.0660, lng: 132.9976 },
  { name: '新居浜駅前 (新居浜)', lat: 33.9602, lng: 133.2831 },
  { name: '西条駅前 (西条)', lat: 33.9182, lng: 133.1818 },
  { name: '宇和島駅前 (南予・宇和島)', lat: 33.2263, lng: 132.5658 },
  { name: '大洲駅前 (大洲)', lat: 33.5074, lng: 132.5447 },
];

interface AppContextType {
  currentUser: Profile;
  allUsers: Profile[];
  therapistProfiles: Record<string, TherapistProfile>;
  services: Service[];
  bookings: Booking[];
  reviews: Review[];
  messages: ChatMessage[];
  platformFeeRate: number; // percentage (e.g. 20)
  userLocation: UserLocation;
  isLiveSupabase: boolean;
  isLoadingDb: boolean;
  isLoggedIn: boolean;
  login: (user: Profile) => void;
  logout: () => void;
  setUserLocation: (loc: UserLocation) => void;
  switchUser: (userId: string) => void;
  sendChatMessage: (bookingId: string, receiverId: string, content: string, senderId?: string) => Promise<ChatMessage>;
  markMessagesAsRead: (bookingId: string, readerId?: string) => void;
  createBooking: (booking: Omit<Booking, 'id' | 'created_at' | 'platform_fee' | 'therapist_earnings' | 'status'>) => Promise<Booking>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  updateTherapistLocation: (bookingId: string, lat: number, lng: number) => Promise<void>;
  toggleTherapistApproval: (userId: string) => Promise<void>;
  setPlatformFeeRate: (rate: number) => Promise<void>;
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  createReview: (review: Omit<Review, 'id' | 'created_at'>) => Promise<void>;
  refreshFromSupabase: () => Promise<void>;
  resetToMock: () => void;
  addCustomerUser: (user: Profile) => void;
  addTherapistUser: (user: Profile, therapistData?: Partial<TherapistProfile>) => Promise<void>;
  updateUserProfile: (userId: string, data: Partial<Profile>) => Promise<void>;
  updateTherapistInfo: (userId: string, profileData: Partial<Profile>, therapistData: Partial<TherapistProfile>) => Promise<void>;
  appBrand: AppBrandId;
  currentBrand: AppBrandConfig;
  customBranding: CustomBrandingSettings;
  setAppBrand: (brandId: AppBrandId) => Promise<void>;
  updateCustomBranding: (settings: Partial<CustomBrandingSettings>) => Promise<void>;
  // 本登録審査（4ステップ）・提出書類確認・承認＆Storage自動削除
  onboardings: Record<string, TherapistOnboarding>;
  verificationLogs: VerificationLog[];
  completeReviewFeePayment: (therapistId: string) => Promise<{ ok: boolean; redirectUrl?: string; message: string }>;
  completeStripeEkyc: (therapistId: string, verifiedName?: string) => Promise<{ ok: boolean; redirectUrl?: string; message: string }>;
  submitTermsAgreement: (therapistId: string, signatureName: string, claimedQualificationType?: string) => Promise<{ ok: boolean; message: string }>;
  uploadVerificationDoc: (therapistId: string, kind: VerificationDocKind, file: File) => Promise<{ ok: boolean; message: string }>;
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

const STORAGE_KEY = 'therapist_platform_state_ehime_v5';

// セラピスト全体の約2〜3割に特典・キャンペーンが確実に設定されている状態を保証するヘルパー関数
const ensureCampaigns = (profiles: Record<string, TherapistProfile>): Record<string, TherapistProfile> => {
  const keys = Object.keys(profiles);
  if (keys.length === 0) return profiles;

  const currentWithCamp = keys.filter((k) => Boolean(profiles[k]?.campaign));
  // キャンペーン設定者が全体の15%未満（極端に少ない、または0人）の場合、
  // initialTherapistProfiles からキャンペーンを復元・適用する
  if (currentWithCamp.length < Math.max(1, Math.floor(keys.length * 0.15))) {
    const updated = { ...profiles };
    keys.forEach((id) => {
      if (initialTherapistProfiles[id]?.campaign && !updated[id]?.campaign) {
        updated[id] = {
          ...updated[id],
          campaign: initialTherapistProfiles[id].campaign,
        };
      }
    });
    return updated;
  }
  return profiles;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialCustomer = initialProfiles.find((p) => p.role === 'customer') || initialProfiles[0];
  const [currentUser, setCurrentUser] = useState<Profile>(initialCustomer);
  const [allUsers, setAllUsers] = useState<Profile[]>(initialProfiles);
  const [therapistProfiles, setTherapistProfiles] = useState<Record<string, TherapistProfile>>(initialTherapistProfiles);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [onboardings, setOnboardings] = useState<Record<string, TherapistOnboarding>>(initialOnboardings);
  const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>(initialVerificationLogs);
  const [localDocPreviews, setLocalDocPreviews] = useState<Record<string, string>>({});
  const [platformFeeRate, setPlatformFeeRateState] = useState<number>(20);
  const [appBrand, setAppBrandState] = useState<AppBrandId>(DEFAULT_BRAND_ID);
  const [customBranding, setCustomBrandingState] = useState<CustomBrandingSettings>(() => {
    const defaultBranding: CustomBrandingSettings = {
      appName: 'CareKuru',
      appJapaneseName: 'CareKuru',
      appTagline: 'CareKuru',
      appCatchphrase: 'プロがあなたの元へ届く。出張・店舗ヘルスケア＆ボディケア',
      selectedIcon: '/branding/icon_carearia_symbol.png',
      selectedLogo: '/branding/icon_carearia_symbol.png',
    };

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('carehub_custom_branding');
        if (saved) {
          const parsed = JSON.parse(saved);
          let changed = false;

          // 旧テキスト入りロゴ設定が残っている場合はアイコンシンボルに統一
          if (
            parsed.selectedLogo &&
            (parsed.selectedLogo.includes('logo_') ||
              parsed.selectedLogo.includes('logo-') ||
              parsed.selectedLogo !== parsed.selectedIcon)
          ) {
            parsed.selectedLogo = parsed.selectedIcon || defaultBranding.selectedIcon;
            changed = true;
          }

          // 名称が未設定の場合はデフォルト名称 'CareKuru' を設定
          if (!parsed.appName) {
            parsed.appName = defaultBranding.appName;
            parsed.appJapaneseName = defaultBranding.appJapaneseName;
            parsed.appTagline = defaultBranding.appTagline;
            parsed.appCatchphrase = defaultBranding.appCatchphrase;
            changed = true;
          }

          if (changed) {
            localStorage.setItem('carehub_custom_branding', JSON.stringify(parsed));
          }
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse local custom branding', e);
      }
    }
    return defaultBranding;
  });

  // ベースブランドと独立カスタム設定を合成したアクティブブランド
  const baseBrand = APP_BRANDS[appBrand] || APP_BRANDS[DEFAULT_BRAND_ID];
  const activeIcon = customBranding.selectedIcon || baseBrand.iconUrl;
  const currentBrand: AppBrandConfig = {
    ...baseBrand,
    name: customBranding.appName || baseBrand.name,
    japaneseName: customBranding.appJapaneseName || baseBrand.japaneseName,
    catchphrase: customBranding.appCatchphrase || baseBrand.catchphrase,
    tagline: customBranding.appTagline || baseBrand.tagline,
    iconUrl: activeIcon,
    logoUrl: activeIcon, // アプリアイコンとヘッダー用ブランドロゴは同一アイコンを使用
  };

  // ブランド変更時にブラウザタイトルとファビコンを即時更新
  useEffect(() => {
    updateDocumentBranding(currentBrand);
  }, [currentBrand]);
  const [userLocation, setUserLocation] = useState<UserLocation>(() => {
    if (initialCustomer.lat && initialCustomer.lng) {
      return {
        name: initialCustomer.address || `${initialCustomer.name}の登録住所`,
        lat: initialCustomer.lat,
        lng: initialCustomer.lng,
      };
    }
    return PRESET_LOCATIONS[0];
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Supabase からのデータ取得
  const fetchSupabaseData = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) return;

    try {
      setIsLoadingDb(true);

      // 1. profiles
      // 1. profiles: Supabaseのデータをベースにしつつ、mockDataの新規追加ユーザーも確実にマージ
      const { data: dbProfiles, error: pErr } = await supabase.from('profiles').select('*');
      if (!pErr && dbProfiles && dbProfiles.length > 0) {
        setAllUsers((prev) => {
          const dbIds = new Set(dbProfiles.map((p: any) => p.id));
          const mockOnly = initialProfiles.filter((p) => !dbIds.has(p.id));
          return [...(dbProfiles as Profile[]), ...mockOnly];
        });
      }

      // 2. therapist_profiles
      const { data: dbTherapists, error: tErr } = await supabase.from('therapist_profiles').select('*');
      const mapped: Record<string, TherapistProfile> = {};
      if (!tErr && dbTherapists && dbTherapists.length > 0) {
        dbTherapists.forEach((t: any) => {
          const firstTherapistKey = Object.keys(initialTherapistProfiles)[0];
          const fallback = initialTherapistProfiles[t.user_id] || (firstTherapistKey ? initialTherapistProfiles[firstTherapistKey] : { lat: 33.8392, lng: 132.7656 });
          const campaign = (t.campaign !== undefined && t.campaign !== null) ? t.campaign : fallback?.campaign;
          mapped[t.user_id] = {
            ...fallback,
            ...t,
            lat: t.lat || fallback.lat,
            lng: t.lng || fallback.lng,
            ...(campaign ? { campaign } : {}),
          };
        });
      }

      // mockData の新規専門職プロフィールで Supabase にまだないものを確実に補完
      Object.entries(initialTherapistProfiles).forEach(([uid, tp]) => {
        if (!mapped[uid]) {
          mapped[uid] = tp;
        }
      });

      // profiles に therapist として存在するが therapist_profiles に未登録のユーザーを自動補完
      if (dbProfiles) {
        dbProfiles
          .filter((p: any) => p.role === 'therapist')
          .forEach((tpUser: any) => {
            if (!mapped[tpUser.id]) {
              const fallback = initialTherapistProfiles[tpUser.id];
              mapped[tpUser.id] = {
                user_id: tpUser.id,
                bio: '新規登録セラピストです。管理本部による審査待ちです。',
                specialities: ['ボディケア', 'リラクゼーション'],
                is_store_based: true,
                is_visit_based: true,
                address: tpUser.address || '愛媛県松山市',
                lat: tpUser.lat || 33.8392,
                lng: tpUser.lng || 132.7656,
                visit_radius_km: 10,
                rating_avg: 5.0,
                reviews_count: 0,
                is_approved: false, // デフォルト審査中
                ...(fallback?.campaign ? { campaign: fallback.campaign } : {}),
              };
            }
          });
      }
      setTherapistProfiles((prev) => {
        const merged: Record<string, TherapistProfile> = {
          ...initialTherapistProfiles,
          ...prev,
          ...mapped,
        };
        return ensureCampaigns(merged);
      });

      // 3. services: Supabaseのサービスをベースにしつつ、mockDataの新規カテゴリサービスも確実にマージ
      const { data: dbServices, error: sErr } = await supabase.from('services').select('*');
      if (!sErr && dbServices && dbServices.length > 0) {
        setServices((prev) => {
          const dbIds = new Set(dbServices.map((s: any) => s.id));
          const mockOnly = initialServices.filter((s) => !dbIds.has(s.id));
          return [...(dbServices as Service[]), ...mockOnly];
        });
      }

      // 4. bookings
      const { data: dbBookings, error: bErr } = await supabase.from('bookings').select('*');
      if (!bErr && dbBookings && dbBookings.length > 0) {
        setBookings(dbBookings as Booking[]);
      }

      // 5. reviews
      const { data: dbReviews, error: rErr } = await supabase.from('reviews').select('*');
      if (!rErr && dbReviews && dbReviews.length > 0) {
        setReviews(dbReviews as Review[]);
      }

      // 6. platform_settings
      const { data: dbSettings, error: setErr } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('key', 'fee_rate')
        .maybeSingle();

      if (!setErr && dbSettings && dbSettings.value?.percentage) {
        setPlatformFeeRateState(Number(dbSettings.value.percentage));
      }

      // 6-2. platform_settings: app_brand (ブランド切り替え設定)
      const { data: dbBrand, error: brandErr } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('key', 'app_brand')
        .maybeSingle();

      if (!brandErr && dbBrand?.value?.brand_id && APP_BRANDS[dbBrand.value.brand_id as AppBrandId]) {
        setAppBrandState(dbBrand.value.brand_id as AppBrandId);
      }

      // 6-3. platform_settings: custom_branding (アプリ名・ロゴ・アイコン独立設定)
      const { data: dbCustomBrand, error: cbErr } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('key', 'custom_branding')
        .maybeSingle();

      if (!cbErr && dbCustomBrand?.value) {
        const val = { ...dbCustomBrand.value };
        if (
          val.selectedLogo &&
          (val.selectedLogo.includes('logo_') || val.selectedLogo.includes('logo-'))
        ) {
          val.selectedLogo = val.selectedIcon || '/branding/icon_carearia_symbol.png';
        }
        setCustomBrandingState((prev) => ({ ...prev, ...val }));
      }

      // 7. chat_messages (独立テーブルからチャット履歴を取得)
      const { data: dbMessages, error: mErr } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });
      if (!mErr && dbMessages && dbMessages.length > 0) {
        setMessages(dbMessages as ChatMessage[]);
      }

      // 8. therapist_onboarding (本登録審査 Step3 提出書類・誓約書同意)
      const { data: dbOnboardings, error: obErr } = await supabase
        .from('therapist_onboarding')
        .select('*');
      if (!obErr && dbOnboardings && dbOnboardings.length > 0) {
        const obMap: Record<string, TherapistOnboarding> = {};
        dbOnboardings.forEach((row: any) => {
          obMap[row.therapist_id] = row as TherapistOnboarding;
        });
        setOnboardings((prev) => ({
          ...initialOnboardings,
          ...prev,
          ...obMap,
        }));
      }

      // 9. therapist_verification_logs (承認・差戻しテキストログ)
      const { data: dbLogs, error: logErr } = await supabase
        .from('therapist_verification_logs')
        .select('*')
        .order('verified_at', { ascending: false });
      if (!logErr && dbLogs && dbLogs.length > 0) {
        setVerificationLogs((prev) => {
          const dbIds = new Set(dbLogs.map((l: any) => l.id));
          const mockOnly = prev.filter((l) => !dbIds.has(l.id));
          return [...(dbLogs as VerificationLog[]), ...mockOnly];
        });
      }
    } catch (e) {
      console.error('Failed to fetch data from Supabase, falling back to local cache:', e);
    } finally {
      setIsLoadingDb(false);
    }
  }, []);

  // 初回マウント時
  useEffect(() => {
    // まず localStorage からキャッシュを読み込む
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.allUsers) {
          const savedIds = new Set((parsed.allUsers as Profile[]).map((u) => u.id));
          const missingProfiles = initialProfiles.filter((p) => !savedIds.has(p.id));
          setAllUsers([...(parsed.allUsers as Profile[]), ...missingProfiles]);
        }
        if (parsed.therapistProfiles) {
          const mergedTp = { ...initialTherapistProfiles, ...parsed.therapistProfiles };
          setTherapistProfiles(ensureCampaigns(mergedTp));
        }
        if (parsed.services) {
          const savedSvcIds = new Set((parsed.services as Service[]).map((s) => s.id));
          const missingServices = initialServices.filter((s) => !savedSvcIds.has(s.id));
          setServices([...(parsed.services as Service[]), ...missingServices]);
        }
        if (parsed.bookings) setBookings(parsed.bookings);
        if (parsed.reviews) {
          const savedRevIds = new Set((parsed.reviews as Review[]).map((r) => r.id));
          const missingReviews = initialReviews.filter((r) => !savedRevIds.has(r.id));
          setReviews([...(parsed.reviews as Review[]), ...missingReviews]);
        }
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.onboardings) {
          setOnboardings({ ...initialOnboardings, ...parsed.onboardings });
        }
        if (parsed.verificationLogs) {
          const savedLogIds = new Set((parsed.verificationLogs as VerificationLog[]).map((l) => l.id));
          const missingLogs = initialVerificationLogs.filter((l) => !savedLogIds.has(l.id));
          setVerificationLogs([...(parsed.verificationLogs as VerificationLog[]), ...missingLogs]);
        }
        if (parsed.platformFeeRate) setPlatformFeeRateState(parsed.platformFeeRate);
        if (parsed.appBrand && APP_BRANDS[parsed.appBrand as AppBrandId]) {
          setAppBrandState(parsed.appBrand as AppBrandId);
        }
        if (typeof parsed.isLoggedIn === 'boolean') setIsLoggedIn(parsed.isLoggedIn);
        if (parsed.currentUserId) {
          const user = (parsed.allUsers || initialProfiles).find((u: Profile) => u.id === parsed.currentUserId);
          if (user) {
            setCurrentUser(user);
            if (user.lat && user.lng) {
              setUserLocation({
                name: user.address || `${user.name}の登録住所`,
                lat: user.lat,
                lng: user.lng,
              });
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    } finally {
      setIsLoaded(true);
    }

    // Supabase が有効なら最新のクラウドデータを取得
    if (isSupabaseConfigured) {
      fetchSupabaseData();
    }
  }, [fetchSupabaseData]);

  // localStorage へのバックアップ同期
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          allUsers,
          therapistProfiles,
          services,
          bookings,
          reviews,
          messages,
          onboardings,
          verificationLogs,
          platformFeeRate,
          appBrand,
          isLoggedIn,
          currentUserId: currentUser.id,
        })
      );
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [allUsers, therapistProfiles, services, bookings, reviews, messages, onboardings, verificationLogs, platformFeeRate, appBrand, currentUser, isLoggedIn, isLoaded]);

  const login = (user: Profile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    if (user.lat && user.lng) {
      setUserLocation({
        name: user.address || `${user.name}の登録住所`,
        lat: user.lat,
        lng: user.lng,
      });
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const switchUser = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      if (user.lat && user.lng) {
        setUserLocation({
          name: user.address || `${user.name}の登録住所`,
          lat: user.lat,
          lng: user.lng,
        });
      }
    }
  };

  const sendChatMessage = async (
    bookingId: string,
    receiverId: string,
    content: string,
    senderId?: string
  ): Promise<ChatMessage> => {
    const actualSenderId = senderId || currentUser.id;
    const newMessage: ChatMessage = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      booking_id: bookingId,
      sender_id: actualSenderId,
      receiver_id: receiverId,
      content,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setMessages((prev) => [...prev, newMessage]);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('chat_messages').insert({
          id: newMessage.id,
          booking_id: newMessage.booking_id,
          sender_id: newMessage.sender_id,
          receiver_id: newMessage.receiver_id,
          content: newMessage.content,
          is_read: newMessage.is_read,
        });
      } catch (err) {
        console.warn('Supabase chat message insert warning:', err);
      }
    }

    return newMessage;
  };

  const markMessagesAsRead = async (bookingId: string, readerId?: string) => {
    const actualReaderId = readerId || currentUser.id;
    setMessages((prev) =>
      prev.map((m) =>
        m.booking_id === bookingId && m.receiver_id === actualReaderId
          ? { ...m, is_read: true }
          : m
      )
    );

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('chat_messages')
          .update({ is_read: true })
          .eq('booking_id', bookingId)
          .eq('receiver_id', actualReaderId);
      } catch (err) {
        console.warn('Supabase chat message mark as read warning:', err);
      }
    }
  };

  const createBooking = async (
    bookingData: Omit<Booking, 'id' | 'created_at' | 'platform_fee' | 'therapist_earnings' | 'status'>
  ): Promise<Booking> => {
    const fee = Math.round(bookingData.total_amount * (platformFeeRate / 100));
    const earnings = bookingData.total_amount - fee;

    const serialNum = bookingData.serial_number || `BK-${String(bookings.length + 1).padStart(4, '0')}`;
    const newBooking: Booking = {
      ...bookingData,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `book-${Date.now().toString(36)}`,
      serial_number: serialNum,
      status: 'pending',
      platform_fee: fee,
      therapist_earnings: earnings,
      created_at: new Date().toISOString(),
    };

    // ローカルUIの即時更新
    setBookings((prev) => [newBooking, ...prev]);

    // Supabase への非同期保存
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('bookings').insert({
          id: newBooking.id,
          serial_number: newBooking.serial_number,
          customer_id: newBooking.customer_id,
          therapist_id: newBooking.therapist_id,
          service_id: newBooking.service_id,
          booking_type: newBooking.booking_type,
          scheduled_at: newBooking.scheduled_at,
          status: newBooking.status,
          total_amount: newBooking.total_amount,
          platform_fee: newBooking.platform_fee,
          therapist_earnings: newBooking.therapist_earnings,
          visit_address: newBooking.visit_address,
          customer_notes: newBooking.customer_notes,
        });
      } catch (err) {
        console.warn('Supabase bookings insert warning:', err);
      }
    }

    return newBooking;
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('bookings').update({ status }).eq('id', bookingId);
      } catch (err) {
        console.warn('Supabase booking status update warning:', err);
      }
    }
  };

  const updateTherapistLocation = async (bookingId: string, lat: number, lng: number) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, therapist_current_lat: lat, therapist_current_lng: lng }
          : b
      )
    );

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('bookings')
          .update({ therapist_current_lat: lat, therapist_current_lng: lng })
          .eq('id', bookingId);
      } catch (err) {
        console.warn('Supabase therapist location update warning:', err);
      }
    }
  };

  const toggleTherapistApproval = async (userId: string) => {
    const current = therapistProfiles[userId] || {
      user_id: userId,
      bio: '新規登録セラピストです。よろしくお願いいたします。',
      specialities: ['ボディケア', 'リラクゼーション'],
      is_store_based: true,
      is_visit_based: true,
      address: '東京都内',
      lat: 35.6666,
      lng: 139.7092,
      visit_radius_km: 10,
      rating_avg: 5.0,
      reviews_count: 0,
      is_approved: false,
    };
    const newStatus = !current.is_approved;

    setTherapistProfiles((prev) => ({
      ...prev,
      [userId]: {
        ...current,
        is_approved: newStatus,
      },
    }));

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('therapist_profiles')
          .upsert({
            user_id: userId,
            is_approved: newStatus,
            bio: current.bio,
            specialities: current.specialities,
            address: current.address,
            is_store_based: current.is_store_based,
            is_visit_based: current.is_visit_based,
          });
      } catch (err) {
        console.warn('Supabase therapist approval update warning:', err);
      }
    }
  };

  const setPlatformFeeRate = async (rate: number) => {
    setPlatformFeeRateState(rate);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('platform_settings')
          .upsert({ key: 'fee_rate', value: { percentage: rate } });
      } catch (err) {
        console.warn('Supabase fee rate update warning:', err);
      }
    }
  };

  const addService = async (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: `srv-${Date.now().toString(36)}`,
    };
    setServices((prev) => [...prev, newService]);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('services').insert({
          therapist_id: serviceData.therapist_id,
          title: serviceData.title,
          description: serviceData.description,
          price: serviceData.price,
          duration_minutes: serviceData.duration_minutes,
          category: serviceData.category,
          is_active: serviceData.is_active,
        });
      } catch (err) {
        console.warn('Supabase service insert warning:', err);
      }
    }
  };

  const createReview = async (reviewData: Omit<Review, 'id' | 'created_at'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
    };
    setReviews((prev) => [newReview, ...prev]);

    // セラピストの平均評価を再計算
    setTherapistProfiles((prev) => {
      const tp = prev[reviewData.therapist_id];
      if (!tp) return prev;
      const therapistReviews = [...reviews, newReview].filter((r) => r.therapist_id === reviewData.therapist_id);
      const avg = therapistReviews.reduce((sum, r) => sum + r.rating, 0) / therapistReviews.length;
      return {
        ...prev,
        [reviewData.therapist_id]: {
          ...tp,
          rating_avg: Number(avg.toFixed(2)),
          reviews_count: therapistReviews.length,
        },
      };
    });

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('reviews').insert({
          booking_id: reviewData.booking_id,
          customer_id: reviewData.customer_id,
          therapist_id: reviewData.therapist_id,
          rating: reviewData.rating,
          comment: reviewData.comment,
        });
      } catch (err) {
        console.warn('Supabase review insert warning:', err);
      }
    }
  };

  const addCustomerUser = (newUser: Profile) => {
    setAllUsers((prev) => {
      const exists = prev.some((u) => u.id === newUser.id);
      if (exists) {
        return prev.map((u) => (u.id === newUser.id ? newUser : u));
      }
      return [...prev, newUser];
    });
    setCurrentUser(newUser);
    setIsLoggedIn(true);
  };

  const addTherapistUser = async (
    newUser: Profile,
    therapistData?: Partial<TherapistProfile>
  ) => {
    // 1. allUsers に追加
    setAllUsers((prev) => {
      const exists = prev.some((u) => u.id === newUser.id);
      if (exists) {
        return prev.map((u) => (u.id === newUser.id ? { ...u, ...newUser, role: 'therapist' as const } : u));
      }
      return [...prev, { ...newUser, role: 'therapist' as const }];
    });

    // 2. therapistProfiles に追加（デフォルト審査中・Step 1未決済）
    const initialTp: TherapistProfile = {
      user_id: newUser.id,
      bio: therapistData?.bio || '新規登録セラピストです。管理者による審査待ちです。',
      specialities: therapistData?.specialities || ['ボディケア', 'リラクゼーション'],
      is_store_based: therapistData?.is_store_based ?? true,
      is_visit_based: therapistData?.is_visit_based ?? true,
      address: therapistData?.address || newUser.address || '愛媛県松山市',
      lat: therapistData?.lat || newUser.lat || 33.8392,
      lng: therapistData?.lng || newUser.lng || 132.7656,
      visit_radius_km: therapistData?.visit_radius_km || 10,
      rating_avg: 5.0,
      reviews_count: 0,
      is_approved: therapistData?.is_approved ?? false, // 審査中
      payment_status: therapistData?.payment_status ?? 'pending',
      payment_completed_at: therapistData?.payment_completed_at ?? null,
      is_identity_verified: therapistData?.is_identity_verified ?? false,
      identity_verified_at: therapistData?.identity_verified_at ?? null,
      identity_verified_name: therapistData?.identity_verified_name ?? null,
      is_certified: therapistData?.is_certified ?? false,
      certified_at: therapistData?.certified_at ?? null,
    };

    setTherapistProfiles((prev) => ({
      ...prev,
      [newUser.id]: initialTp,
    }));

    setCurrentUser({ ...newUser, role: 'therapist' });
    setIsLoggedIn(true);

    // 3. Supabase が利用可能な場合は profiles と therapist_profiles に保存
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('profiles').upsert({
          id: newUser.id,
          role: 'therapist',
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          avatar_url: newUser.avatar_url,
          address: initialTp.address,
          lat: initialTp.lat,
          lng: initialTp.lng,
          updated_at: new Date().toISOString(),
        });

        await supabase.from('therapist_profiles').upsert({
          user_id: newUser.id,
          bio: initialTp.bio,
          specialities: initialTp.specialities,
          is_store_based: initialTp.is_store_based,
          is_visit_based: initialTp.is_visit_based,
          address: initialTp.address,
          is_approved: initialTp.is_approved,
          visit_radius_km: initialTp.visit_radius_km,
          rating_avg: initialTp.rating_avg,
          reviews_count: initialTp.reviews_count,
        });
      } catch (err) {
        console.warn('Supabase therapist add warning:', err);
      }
    }
  };

  const updateUserProfile = async (userId: string, updateData: Partial<Profile>) => {
    // 1. allUsers の更新
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updateData } : u))
    );

    // 2. 現在ログイン中のユーザーなら currentUser も更新
    setCurrentUser((prev) => {
      if (prev.id === userId) {
        return { ...prev, ...updateData };
      }
      return prev;
    });

    // 3. 住所や位置情報が更新されたら userLocation も更新
    if (updateData.lat && updateData.lng) {
      setUserLocation({
        name: updateData.address || '更新された現在地',
        lat: updateData.lat,
        lng: updateData.lng,
      });
    }

    // 4. Supabase profiles テーブルの更新
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({
            name: updateData.name,
            phone: updateData.phone,
            address: updateData.address,
            postal_code: updateData.postal_code,
            lat: updateData.lat,
            lng: updateData.lng,
            avatar_url: updateData.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      } catch (err) {
        console.warn('Supabase profile update warning:', err);
      }
    }
  };

  const updateTherapistInfo = async (
    userId: string,
    profileData: Partial<Profile>,
    therapistData: Partial<TherapistProfile>
  ) => {
    // 1. プロフィールの更新
    await updateUserProfile(userId, profileData);

    // 2. セラピスト詳細プロフィールの更新
    setTherapistProfiles((prev) => {
      const existing = prev[userId] || ({} as TherapistProfile);
      const updatedItem: TherapistProfile = {
        ...existing,
        ...therapistData,
        address: profileData.address || therapistData.address || existing.address,
        lat: profileData.lat !== undefined ? profileData.lat : (therapistData.lat !== undefined ? therapistData.lat : existing.lat),
        lng: profileData.lng !== undefined ? profileData.lng : (therapistData.lng !== undefined ? therapistData.lng : existing.lng),
      };
      if ('campaign' in therapistData && !therapistData.campaign) {
        delete updatedItem.campaign;
      }
      return {
        ...prev,
        [userId]: updatedItem,
      };
    });

    // 3. Supabase therapist_profiles テーブルの更新
    if (supabase && isSupabaseConfigured) {
      try {
        const updatePayload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (therapistData.bio !== undefined) updatePayload.bio = therapistData.bio;
        if (therapistData.specialities !== undefined) updatePayload.specialities = therapistData.specialities;
        if (therapistData.is_store_based !== undefined) updatePayload.is_store_based = therapistData.is_store_based;
        if (therapistData.is_visit_based !== undefined) updatePayload.is_visit_based = therapistData.is_visit_based;
        if (therapistData.visit_radius_km !== undefined) updatePayload.visit_radius_km = therapistData.visit_radius_km;
        if (profileData.address || therapistData.address) {
          updatePayload.address = profileData.address || therapistData.address;
        }
        if (therapistData.store_name !== undefined) updatePayload.store_name = therapistData.store_name;
        if (therapistData.store_address !== undefined) updatePayload.store_address = therapistData.store_address;
        if (therapistData.store_access !== undefined) updatePayload.store_access = therapistData.store_access;
        if (therapistData.store_parking !== undefined) updatePayload.store_parking = therapistData.store_parking;
        if (therapistData.store_hours !== undefined) updatePayload.store_hours = therapistData.store_hours;
        if (therapistData.store_facilities !== undefined) updatePayload.store_facilities = therapistData.store_facilities;
        if (therapistData.store_notes !== undefined) updatePayload.store_notes = therapistData.store_notes;
        if (therapistData.available_days !== undefined) updatePayload.available_days = therapistData.available_days;
        if (therapistData.available_hours_start !== undefined) updatePayload.available_hours_start = therapistData.available_hours_start;
        if (therapistData.available_hours_end !== undefined) updatePayload.available_hours_end = therapistData.available_hours_end;
        if (therapistData.is_separate_store_hours !== undefined) updatePayload.is_separate_store_hours = therapistData.is_separate_store_hours;
        if (therapistData.store_hours_start !== undefined) updatePayload.store_hours_start = therapistData.store_hours_start;
        if (therapistData.store_hours_end !== undefined) updatePayload.store_hours_end = therapistData.store_hours_end;
        if ('campaign' in therapistData) updatePayload.campaign = therapistData.campaign || null;

        await supabase
          .from('therapist_profiles')
          .update(updatePayload)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Supabase therapist_profiles update warning:', err);
      }
    }
  };

  const setAppBrand = async (brandId: AppBrandId) => {
    setAppBrandState(brandId);
    const brand = APP_BRANDS[brandId];
    if (brand) {
      updateDocumentBranding(brand);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('platform_settings')
          .upsert({ key: 'app_brand', value: { brand_id: brandId } }, { onConflict: 'key' });
      } catch (e) {
        console.warn('Failed to sync app_brand to Supabase', e);
      }
    }
  };

  const updateCustomBranding = async (settings: Partial<CustomBrandingSettings>) => {
    setCustomBrandingState((prev) => {
      const next = { ...prev, ...settings };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('carehub_custom_branding', JSON.stringify(next));
        } catch (e) {
          console.warn('Failed to save custom branding locally', e);
        }
      }
      return next;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('platform_settings')
          .upsert({ key: 'custom_branding', value: settings }, { onConflict: 'key' });
      } catch (e) {
        console.warn('Failed to sync custom_branding to Supabase', e);
      }
    }
  };

  // ========================================================
  // 本登録審査（4ステップ）・提出書類確認・自動削除承認ロジック
  // ========================================================

  // 【Step 1】アカウント開設・審査手数料（5,000円 / 返金不可）の決済完了処理
  const completeReviewFeePayment = async (
    therapistId: string
  ): Promise<{ ok: boolean; redirectUrl?: string; message: string }> => {
    // 認証セッションがある場合は Stripe Checkout セッション発行を試行
    const res = await postAuthed<{ url?: string }>('/api/stripe/review-fee', {});
    if (res.ok && res.data?.url) {
      return {
        ok: true,
        redirectUrl: res.data.url,
        message: 'Stripe Checkout 決済画面へ移動します。',
      };
    }

    // Stripe 未設定時またはデモ・管理確認モード時は即時決済完了（Webhook 相当）を更新
    const now = new Date().toISOString();
    setTherapistProfiles((prev) => {
      const current = prev[therapistId] || ({ user_id: therapistId } as TherapistProfile);
      return {
        ...prev,
        [therapistId]: {
          ...current,
          payment_status: 'completed',
          payment_completed_at: now,
        },
      };
    });

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('therapist_profiles')
          .update({
            payment_status: 'completed',
            payment_completed_at: now,
            updated_at: now,
          })
          .eq('user_id', therapistId);
      } catch (err) {
        console.warn('Supabase payment_status update warning:', err);
      }
    }

    return {
      ok: true,
      message: '審査手数料（5,000円）のStripe決済が完了しました。Step 2（口座登録・eKYC）へ進めます。',
    };
  };

  // 【Step 2】Stripe Connect Express 口座登録 ＆ 自動eKYC（身元確認）完了処理
  const completeStripeEkyc = async (
    therapistId: string,
    verifiedName?: string
  ): Promise<{ ok: boolean; redirectUrl?: string; message: string }> => {
    const tp = therapistProfiles[therapistId];
    if (tp?.payment_status !== 'completed') {
      return {
        ok: false,
        message: '先に Step 1（審査手数料 5,000円の決済）を完了してください。',
      };
    }

    // 認証セッションがある場合は Stripe Connect オンボーディング URL 発行を試行
    const res = await postAuthed<{ url?: string; account_id?: string }>('/api/stripe/connect', {});
    if (res.ok && res.data?.url) {
      return {
        ok: true,
        redirectUrl: res.data.url,
        message: 'Stripe Express オンボーディング画面へ移動します。',
      };
    }

    // Stripe Connect Webhook (`account.updated`, `payouts_enabled: true`) 通知受信のシミュレーション
    // ※ 運転免許証等の身分証画像は自社DB/Storageに一切保存せず、認証結果フラグと認証氏名のみ反映
    const now = new Date().toISOString();
    const userObj = allUsers.find((u) => u.id === therapistId);
    const cleanName = (verifiedName || userObj?.name || '本人確認済ユーザー').replace(/\s*\(.*?\)\s*$/, '').trim();
    const acctId = tp?.stripe_account_id || `acct_ehime_${therapistId.replace(/-/g, '').slice(0, 16)}`;

    setTherapistProfiles((prev) => {
      const current = prev[therapistId] || ({ user_id: therapistId } as TherapistProfile);
      return {
        ...prev,
        [therapistId]: {
          ...current,
          stripe_account_id: acctId,
          is_identity_verified: true,
          identity_verified_at: now,
          identity_verified_name: cleanName,
        },
      };
    });

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('therapist_profiles')
          .update({
            stripe_account_id: acctId,
            is_identity_verified: true,
            identity_verified_at: now,
            identity_verified_name: cleanName,
            updated_at: now,
          })
          .eq('user_id', therapistId);
      } catch (err) {
        console.warn('Supabase is_identity_verified update warning:', err);
      }
    }

    return {
      ok: true,
      message: `Stripe Connect 自動eKYCが完了しました（認証氏名: ${cleanName} / 身分証画像は自社DB非保持）。`,
    };
  };

  // 【Step 3-A】電子誓約書への同意・電子署名
  const submitTermsAgreement = async (
    therapistId: string,
    signatureName: string,
    claimedQualificationType?: string
  ): Promise<{ ok: boolean; message: string }> => {
    const trimmed = signatureName.trim();
    if (!trimmed) {
      return { ok: false, message: '電子署名（氏名）を入力してください。' };
    }

    const now = new Date().toISOString();
    const existing = onboardings[therapistId] || { therapist_id: therapistId };
    const updatedOb: TherapistOnboarding = {
      ...existing,
      therapist_id: therapistId,
      terms_version: TERMS_VERSION,
      terms_agreed_at: now,
      terms_signature_name: trimmed,
      claimed_qualification_type: claimedQualificationType || existing.claimed_qualification_type || null,
      updated_at: now,
    };

    setOnboardings((prev) => ({
      ...prev,
      [therapistId]: updatedOb,
    }));

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('therapist_onboarding').upsert({
          therapist_id: therapistId,
          terms_version: updatedOb.terms_version,
          terms_agreed_at: updatedOb.terms_agreed_at,
          terms_signature_name: updatedOb.terms_signature_name,
          claimed_qualification_type: updatedOb.claimed_qualification_type,
          updated_at: now,
        });
      } catch (err) {
        console.warn('Supabase therapist_onboarding terms upsert warning:', err);
      }
    }

    return { ok: true, message: '電子誓約書への同意・署名を記録しました。' };
  };

  // 【Step 3-B】保有資格証・損害賠償責任保険証票のアップロード（temp-qualifications 一時バケット）
  const uploadVerificationDoc = async (
    therapistId: string,
    kind: VerificationDocKind,
    file: File
  ): Promise<{ ok: boolean; message: string }> => {
    const validationErr = validateDocFile(file);
    if (validationErr) {
      return { ok: false, message: validationErr };
    }

    const storagePath = buildStoragePath(therapistId, kind, file.type);
    const now = new Date().toISOString();
    const existing = onboardings[therapistId] || { therapist_id: therapistId };
    const prevPath = kind === 'qualification' ? existing.qualification_file_path : existing.insurance_file_path;

    // プレビュー用のローカルDataURLを保持（Storage未構築環境でも管理画面で照合プレビュー可能にする）
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => reject(new Error('File read error'));
        reader.readAsDataURL(file);
      });
      if (dataUrl) {
        setLocalDocPreviews((prev) => ({ ...prev, [storagePath]: dataUrl }));
      }
    } catch {
      // ignore preview error
    }

    // Supabase Storage (temp-qualifications) へのアップロード試行
    if (supabase && isSupabaseConfigured) {
      try {
        if (prevPath && !prevPath.startsWith(DEMO_PATH_PREFIX)) {
          await removeFromTempBucket(prevPath);
        }
        await uploadToTempBucket(storagePath, file);
      } catch (err) {
        console.warn('Supabase temp-qualifications upload warning:', err);
      }
    }

    const updatedOb: TherapistOnboarding = {
      ...existing,
      therapist_id: therapistId,
      ...(kind === 'qualification'
        ? {
            qualification_file_path: storagePath,
            qualification_file_name: file.name,
            qualification_uploaded_at: now,
          }
        : {
            insurance_file_path: storagePath,
            insurance_file_name: file.name,
            insurance_uploaded_at: now,
          }),
      rejection_reason: null,
      rejected_at: null,
      files_purged_at: null,
      updated_at: now,
    };

    setOnboardings((prev) => ({
      ...prev,
      [therapistId]: updatedOb,
    }));

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('therapist_onboarding').upsert({
          therapist_id: therapistId,
          terms_version: updatedOb.terms_version ?? null,
          terms_agreed_at: updatedOb.terms_agreed_at ?? null,
          terms_signature_name: updatedOb.terms_signature_name ?? null,
          claimed_qualification_type: updatedOb.claimed_qualification_type ?? null,
          qualification_file_path: updatedOb.qualification_file_path ?? null,
          qualification_file_name: updatedOb.qualification_file_name ?? null,
          qualification_uploaded_at: updatedOb.qualification_uploaded_at ?? null,
          insurance_file_path: updatedOb.insurance_file_path ?? null,
          insurance_file_name: updatedOb.insurance_file_name ?? null,
          insurance_uploaded_at: updatedOb.insurance_uploaded_at ?? null,
          rejection_reason: null,
          rejected_at: null,
          files_purged_at: null,
          updated_at: now,
        });
      } catch (err) {
        console.warn('Supabase therapist_onboarding file upsert warning:', err);
      }
    }

    return {
      ok: true,
      message: `${kind === 'qualification' ? '保有資格証' : '損害賠償責任保険の加入証明'}（${file.name}）を一時保管領域（temp-qualifications）へアップロードしました。`,
    };
  };

  // 管理画面での提出書類プレビューURL取得（署名付きURL または サンプル/ローカルプレビュー）
  const getVerificationDocPreviewUrl = async (
    therapistId: string,
    kind: VerificationDocKind
  ): Promise<string | null> => {
    const ob = onboardings[therapistId];
    const path = kind === 'qualification' ? ob?.qualification_file_path : ob?.insurance_file_path;
    if (!path) return null;

    if (localDocPreviews[path]) {
      return localDocPreviews[path];
    }

    const userObj = allUsers.find((u) => u.id === therapistId);
    const ownerName = (
      therapistProfiles[therapistId]?.identity_verified_name ||
      ob?.terms_signature_name ||
      userObj?.name ||
      '申請者'
    )
      .replace(/\s*\(.*?\)\s*$/, '')
      .trim();

    if (path.startsWith(DEMO_PATH_PREFIX)) {
      return sampleDocumentDataUrl(kind, ownerName);
    }

    const signedUrl = await createSignedViewUrl(path);
    if (signedUrl) return signedUrl;

    // 署名URLが取得できない場合（Storageバケット未作成等）はサンプルプレビューへフォールバック
    return sampleDocumentDataUrl(kind, ownerName);
  };

  // 【Step 4】運営管理画面でのチェック ＆ 自動データ破棄（Storage Delete）付き本登録承認
  const approveTherapistVerification = async (params: {
    therapistId: string;
    qualificationType: string;
    registrationNumber?: string;
    nameMatchConfirmed: boolean;
    insuranceConfirmed: boolean;
  }): Promise<{ ok: boolean; message: string; deletedFilesCount: number }> => {
    const { therapistId, qualificationType, registrationNumber, nameMatchConfirmed, insuranceConfirmed } = params;
    const tp = therapistProfiles[therapistId];
    const ob = onboardings[therapistId];

    const validationErr = validateApproval(tp, ob, {
      qualificationType,
      nameMatchConfirmed,
      insuranceConfirmed,
    });
    if (validationErr) {
      return { ok: false, message: validationErr, deletedFilesCount: 0 };
    }

    const now = new Date().toISOString();
    const userObj = allUsers.find((u) => u.id === therapistId);
    const cleanName = (tp?.identity_verified_name || ob?.terms_signature_name || userObj?.name || '').replace(/\s*\(.*?\)\s*$/, '').trim();

    // 削除対象の一時ファイル数をカウント
    const pathsToDelete = [ob?.qualification_file_path, ob?.insurance_file_path].filter(
      (p): p is string => Boolean(p)
    );
    let deletedCount = pathsToDelete.length;

    // 1. サーバーAPI（service_role によるトランザクションRPC + Storage自動削除）の呼び出し試行
    const apiRes = await postAuthed<{ deleted_count?: number }>('/api/admin/verification-decision', {
      decision: 'approve',
      therapist_id: therapistId,
      qualification_type: qualificationType.trim(),
      registration_number: registrationNumber?.trim() || '',
      name_match_confirmed: nameMatchConfirmed,
      insurance_confirmed: insuranceConfirmed,
    });
    if (apiRes.ok && typeof apiRes.data?.deleted_count === 'number') {
      deletedCount = Math.max(deletedCount, apiRes.data.deleted_count);
    }

    // 2. クライアント側からも temp-qualifications バケットの該当ファイルを確実に Delete & ローカルキャッシュ破棄
    for (const p of pathsToDelete) {
      if (!p.startsWith(DEMO_PATH_PREFIX)) {
        try {
          await removeFromTempBucket(p);
        } catch {
          // ignore
        }
      }
    }
    setLocalDocPreviews((prev) => {
      const next = { ...prev };
      pathsToDelete.forEach((p) => delete next[p]);
      return next;
    });

    // 3. therapist_profiles の is_certified = true, is_approved = true 更新
    setTherapistProfiles((prev) => {
      const current = prev[therapistId] || ({ user_id: therapistId } as TherapistProfile);
      return {
        ...prev,
        [therapistId]: {
          ...current,
          is_approved: true,
          is_certified: true,
          certified_at: now,
        },
      };
    });

    // 4. therapist_onboarding の一時ファイルパスを NULL クリアし files_purged_at を記録
    setOnboardings((prev) => {
      const current = prev[therapistId] || { therapist_id: therapistId };
      return {
        ...prev,
        [therapistId]: {
          ...current,
          claimed_qualification_type: qualificationType.trim(),
          qualification_file_path: null,
          qualification_file_name: null,
          qualification_uploaded_at: null,
          insurance_file_path: null,
          insurance_file_name: null,
          insurance_uploaded_at: null,
          rejection_reason: null,
          rejected_at: null,
          files_purged_at: now,
          updated_at: now,
        },
      };
    });

    // 5. 審査証跡（テキストログのみ）を verificationLogs に記録
    const newLog: VerificationLog = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `vlog-${Date.now().toString(36)}`,
      therapist_id: therapistId,
      therapist_name: cleanName || userObj?.name || therapistId,
      decision: 'approved',
      verified_at: now,
      verified_by: currentUser.id,
      qualification_type: qualificationType.trim(),
      registration_number: registrationNumber?.trim() || null,
      confirmed_name: cleanName || null,
      insurance_confirmed: true,
      reason: null,
      files_deleted_count: deletedCount,
      files_deleted_at: now,
    };
    setVerificationLogs((prev) => [newLog, ...prev]);

    // 6. Supabase テーブルへの直接同期（API未経由時のフォールバック）
    if (!apiRes.ok && supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('therapist_profiles')
          .update({
            is_approved: true,
            is_certified: true,
            certified_at: now,
            updated_at: now,
          })
          .eq('user_id', therapistId);

        await supabase
          .from('therapist_onboarding')
          .update({
            qualification_file_path: null,
            qualification_file_name: null,
            qualification_uploaded_at: null,
            insurance_file_path: null,
            insurance_file_name: null,
            insurance_uploaded_at: null,
            rejection_reason: null,
            rejected_at: null,
            files_purged_at: now,
            updated_at: now,
          })
          .eq('therapist_id', therapistId);

        await supabase.from('therapist_verification_logs').insert(newLog);
      } catch (err) {
        console.warn('Supabase verification approve sync warning:', err);
      }
    }

    return {
      ok: true,
      deletedFilesCount: deletedCount,
      message: `${cleanName} さんの本登録を承認し、専門認定バッジを付与しました。temp-qualifications バケット内の提出ファイル（${deletedCount}件）を自動削除し、テキスト承認ログを保存しました。`,
    };
  };

  // 【Step 4 差戻し】提出書類の自動削除 ＆ 差戻し理由の記録
  const rejectTherapistVerification = async (params: {
    therapistId: string;
    reason: string;
  }): Promise<{ ok: boolean; message: string; deletedFilesCount: number }> => {
    const { therapistId, reason } = params;
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return { ok: false, message: '差戻し理由を入力してください。', deletedFilesCount: 0 };
    }

    const ob = onboardings[therapistId];
    const now = new Date().toISOString();
    const userObj = allUsers.find((u) => u.id === therapistId);
    const cleanName = (userObj?.name || '').replace(/\s*\(.*?\)\s*$/, '').trim();

    const pathsToDelete = [ob?.qualification_file_path, ob?.insurance_file_path].filter(
      (p): p is string => Boolean(p)
    );
    let deletedCount = pathsToDelete.length;

    const apiRes = await postAuthed<{ deleted_count?: number }>('/api/admin/verification-decision', {
      decision: 'reject',
      therapist_id: therapistId,
      reason: trimmedReason,
    });
    if (apiRes.ok && typeof apiRes.data?.deleted_count === 'number') {
      deletedCount = Math.max(deletedCount, apiRes.data.deleted_count);
    }

    for (const p of pathsToDelete) {
      if (!p.startsWith(DEMO_PATH_PREFIX)) {
        try {
          await removeFromTempBucket(p);
        } catch {
          // ignore
        }
      }
    }
    setLocalDocPreviews((prev) => {
      const next = { ...prev };
      pathsToDelete.forEach((p) => delete next[p]);
      return next;
    });

    setTherapistProfiles((prev) => {
      const current = prev[therapistId] || ({ user_id: therapistId } as TherapistProfile);
      return {
        ...prev,
        [therapistId]: {
          ...current,
          is_approved: false,
          is_certified: false,
          certified_at: null,
        },
      };
    });

    setOnboardings((prev) => {
      const current = prev[therapistId] || { therapist_id: therapistId };
      return {
        ...prev,
        [therapistId]: {
          ...current,
          qualification_file_path: null,
          qualification_file_name: null,
          qualification_uploaded_at: null,
          insurance_file_path: null,
          insurance_file_name: null,
          insurance_uploaded_at: null,
          rejection_reason: trimmedReason,
          rejected_at: now,
          files_purged_at: now,
          updated_at: now,
        },
      };
    });

    const newLog: VerificationLog = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `vlog-${Date.now().toString(36)}`,
      therapist_id: therapistId,
      therapist_name: cleanName || userObj?.name || therapistId,
      decision: 'rejected',
      verified_at: now,
      verified_by: currentUser.id,
      qualification_type: null,
      registration_number: null,
      confirmed_name: null,
      insurance_confirmed: false,
      reason: trimmedReason,
      files_deleted_count: deletedCount,
      files_deleted_at: now,
    };
    setVerificationLogs((prev) => [newLog, ...prev]);

    if (!apiRes.ok && supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('therapist_onboarding')
          .upsert({
            therapist_id: therapistId,
            qualification_file_path: null,
            qualification_file_name: null,
            qualification_uploaded_at: null,
            insurance_file_path: null,
            insurance_file_name: null,
            insurance_uploaded_at: null,
            rejection_reason: trimmedReason,
            rejected_at: now,
            files_purged_at: now,
            updated_at: now,
          });
        await supabase.from('therapist_verification_logs').insert(newLog);
      } catch (err) {
        console.warn('Supabase verification reject sync warning:', err);
      }
    }

    return {
      ok: true,
      deletedFilesCount: deletedCount,
      message: `${cleanName} さんの提出書類を差戻し、一時保管ファイル（${deletedCount}件）を自動削除しました。`,
    };
  };

  const resetToMock = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAllUsers(initialProfiles);
    setTherapistProfiles(initialTherapistProfiles);
    setServices(initialServices);
    setBookings(initialBookings);
    setReviews(initialReviews);
    setMessages(initialChatMessages);
    setOnboardings(initialOnboardings);
    setVerificationLogs(initialVerificationLogs);
    setLocalDocPreviews({});
    setPlatformFeeRateState(20);
    setCurrentUser(initialProfiles[4]);
    setUserLocation(PRESET_LOCATIONS[0]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        therapistProfiles,
        services,
        bookings,
        reviews,
        messages,
        platformFeeRate,
        userLocation,
        isLiveSupabase: isSupabaseConfigured,
        isLoadingDb,
        isLoggedIn,
        login,
        logout,
        setUserLocation,
        switchUser,
        sendChatMessage,
        markMessagesAsRead,
        createBooking,
        updateBookingStatus,
        updateTherapistLocation,
        toggleTherapistApproval,
        setPlatformFeeRate,
        addService,
        createReview,
        refreshFromSupabase: fetchSupabaseData,
        resetToMock,
        addCustomerUser,
        addTherapistUser,
        updateUserProfile,
        updateTherapistInfo,
        appBrand,
        currentBrand,
        customBranding,
        setAppBrand,
        updateCustomBranding,
        onboardings,
        verificationLogs,
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

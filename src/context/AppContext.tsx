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
} from '@/types';
import {
  initialProfiles,
  initialTherapistProfiles,
  initialServices,
  initialBookings,
  initialReviews,
} from '@/lib/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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
  platformFeeRate: number; // percentage (e.g. 20)
  userLocation: UserLocation;
  isLiveSupabase: boolean;
  isLoadingDb: boolean;
  setUserLocation: (loc: UserLocation) => void;
  switchUser: (userId: string) => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'therapist_platform_state_ehime_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialCustomer = initialProfiles.find((p) => p.role === 'customer') || initialProfiles[0];
  const [currentUser, setCurrentUser] = useState<Profile>(initialCustomer);
  const [allUsers, setAllUsers] = useState<Profile[]>(initialProfiles);
  const [therapistProfiles, setTherapistProfiles] = useState<Record<string, TherapistProfile>>(initialTherapistProfiles);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [platformFeeRate, setPlatformFeeRateState] = useState<number>(20);
  const [userLocation, setUserLocation] = useState<UserLocation>(PRESET_LOCATIONS[0]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  // Supabase からのデータ取得
  const fetchSupabaseData = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) return;

    try {
      setIsLoadingDb(true);

      // 1. profiles
      const { data: dbProfiles, error: pErr } = await supabase.from('profiles').select('*');
      if (!pErr && dbProfiles && dbProfiles.length > 0) {
        setAllUsers(dbProfiles as Profile[]);
      }

      // 2. therapist_profiles
      const { data: dbTherapists, error: tErr } = await supabase.from('therapist_profiles').select('*');
      const mapped: Record<string, TherapistProfile> = {};
      if (!tErr && dbTherapists && dbTherapists.length > 0) {
        dbTherapists.forEach((t: any) => {
          const firstTherapistKey = Object.keys(initialTherapistProfiles)[0];
          const fallback = initialTherapistProfiles[t.user_id] || (firstTherapistKey ? initialTherapistProfiles[firstTherapistKey] : { lat: 33.8392, lng: 132.7656 });
          mapped[t.user_id] = {
            ...t,
            lat: t.lat || fallback.lat,
            lng: t.lng || fallback.lng,
          };
        });
      }

      // profiles に therapist として存在するが therapist_profiles に未登録のユーザーを自動補完
      if (dbProfiles) {
        dbProfiles
          .filter((p: any) => p.role === 'therapist')
          .forEach((tpUser: any) => {
            if (!mapped[tpUser.id]) {
              mapped[tpUser.id] = {
                user_id: tpUser.id,
                bio: '新規登録セラピストです。管理本部による審査待ちです。',
                specialities: ['ボディケア', 'リラクゼーション'],
                is_store_based: true,
                is_visit_based: true,
                address: tpUser.address || '東京都内',
                lat: tpUser.lat || 35.6666,
                lng: tpUser.lng || 139.7092,
                visit_radius_km: 10,
                rating_avg: 5.0,
                reviews_count: 0,
                is_approved: false, // デフォルト審査中
              };
            }
          });
      }
      setTherapistProfiles((prev) => ({ ...prev, ...mapped }));

      // 3. services
      const { data: dbServices, error: sErr } = await supabase.from('services').select('*');
      if (!sErr && dbServices && dbServices.length > 0) {
        setServices(dbServices as Service[]);
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
        if (parsed.allUsers) setAllUsers(parsed.allUsers);
        if (parsed.therapistProfiles) setTherapistProfiles(parsed.therapistProfiles);
        if (parsed.services) setServices(parsed.services);
        if (parsed.bookings) setBookings(parsed.bookings);
        if (parsed.reviews) setReviews(parsed.reviews);
        if (parsed.platformFeeRate) setPlatformFeeRateState(parsed.platformFeeRate);
        if (parsed.currentUserId) {
          const user = (parsed.allUsers || initialProfiles).find((u: Profile) => u.id === parsed.currentUserId);
          if (user) setCurrentUser(user);
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
          platformFeeRate,
          currentUserId: currentUser.id,
        })
      );
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [allUsers, therapistProfiles, services, bookings, reviews, platformFeeRate, currentUser, isLoaded]);

  const switchUser = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const createBooking = async (
    bookingData: Omit<Booking, 'id' | 'created_at' | 'platform_fee' | 'therapist_earnings' | 'status'>
  ): Promise<Booking> => {
    const fee = Math.round(bookingData.total_amount * (platformFeeRate / 100));
    const earnings = bookingData.total_amount - fee;

    const newBooking: Booking = {
      ...bookingData,
      id: `book-${Date.now().toString(36)}`,
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

    // 2. therapistProfiles に追加（デフォルト審査中）
    const initialTp: TherapistProfile = {
      user_id: newUser.id,
      bio: therapistData?.bio || '新規登録セラピストです。管理者による審査待ちです。',
      specialities: therapistData?.specialities || ['ボディケア', 'リラクゼーション'],
      is_store_based: therapistData?.is_store_based ?? true,
      is_visit_based: therapistData?.is_visit_based ?? true,
      address: therapistData?.address || newUser.address || '東京都内',
      lat: therapistData?.lat || newUser.lat || 35.6666,
      lng: therapistData?.lng || newUser.lng || 139.7092,
      visit_radius_km: therapistData?.visit_radius_km || 10,
      rating_avg: 5.0,
      reviews_count: 0,
      is_approved: therapistData?.is_approved ?? false, // 審査中
    };

    setTherapistProfiles((prev) => ({
      ...prev,
      [newUser.id]: initialTp,
    }));

    setCurrentUser({ ...newUser, role: 'therapist' });

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
      return {
        ...prev,
        [userId]: {
          ...existing,
          ...therapistData,
          address: profileData.address || therapistData.address || existing.address,
          lat: profileData.lat !== undefined ? profileData.lat : (therapistData.lat !== undefined ? therapistData.lat : existing.lat),
          lng: profileData.lng !== undefined ? profileData.lng : (therapistData.lng !== undefined ? therapistData.lng : existing.lng),
        },
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

        await supabase
          .from('therapist_profiles')
          .update(updatePayload)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Supabase therapist_profiles update warning:', err);
      }
    }
  };

  const resetToMock = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAllUsers(initialProfiles);
    setTherapistProfiles(initialTherapistProfiles);
    setServices(initialServices);
    setBookings(initialBookings);
    setReviews(initialReviews);
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
        platformFeeRate,
        userLocation,
        isLiveSupabase: isSupabaseConfigured,
        isLoadingDb,
        setUserLocation,
        switchUser,
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

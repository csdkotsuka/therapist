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
  { name: '渋谷・表参道 (現在地)', lat: 35.6620, lng: 139.7030 },
  { name: '新宿駅東口', lat: 35.6910, lng: 139.7020 },
  { name: '六本木ヒルズ', lat: 35.6604, lng: 139.7292 },
  { name: '銀座・有楽町', lat: 35.6719, lng: 139.7648 },
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'therapist_platform_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile>(initialProfiles[4]); // 田中 太郎 (customer)
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
      if (!tErr && dbTherapists && dbTherapists.length > 0) {
        const mapped: Record<string, TherapistProfile> = {};
        dbTherapists.forEach((t: any) => {
          const fallback = initialTherapistProfiles[t.user_id] || initialTherapistProfiles['therapist-001'];
          mapped[t.user_id] = {
            ...t,
            lat: t.lat || fallback.lat,
            lng: t.lng || fallback.lng,
          };
        });
        setTherapistProfiles((prev) => ({ ...prev, ...mapped }));
      }

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
    const current = therapistProfiles[userId];
    if (!current) return;
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
          .update({ is_approved: newStatus })
          .eq('user_id', userId);
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

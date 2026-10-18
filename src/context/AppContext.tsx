'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  setUserLocation: (loc: UserLocation) => void;
  switchUser: (userId: string) => void;
  createBooking: (booking: Omit<Booking, 'id' | 'created_at' | 'platform_fee' | 'therapist_earnings' | 'status'>) => Promise<Booking>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  updateTherapistLocation: (bookingId: string, lat: number, lng: number) => void;
  toggleTherapistApproval: (userId: string) => void;
  setPlatformFeeRate: (rate: number) => void;
  addService: (service: Omit<Service, 'id'>) => void;
  createReview: (review: Omit<Review, 'id' | 'created_at'>) => void;
  resetToMock: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'therapist_platform_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile>(initialProfiles[4]); // デフォルト: 田中 太郎 (customer)
  const [allUsers, setAllUsers] = useState<Profile[]>(initialProfiles);
  const [therapistProfiles, setTherapistProfiles] = useState<Record<string, TherapistProfile>>(initialTherapistProfiles);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [platformFeeRate, setPlatformFeeRateState] = useState<number>(20);
  const [userLocation, setUserLocation] = useState<UserLocation>(PRESET_LOCATIONS[0]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 初回マウント時にlocalStorageから復元
  useEffect(() => {
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
  }, []);

  // 状態変更時にlocalStorageに保存
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

    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
  };

  const updateTherapistLocation = (bookingId: string, lat: number, lng: number) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, therapist_current_lat: lat, therapist_current_lng: lng }
          : b
      )
    );
  };

  const toggleTherapistApproval = (userId: string) => {
    setTherapistProfiles((prev) => {
      const current = prev[userId];
      if (!current) return prev;
      return {
        ...prev,
        [userId]: {
          ...current,
          is_approved: !current.is_approved,
        },
      };
    });
  };

  const setPlatformFeeRate = (rate: number) => {
    setPlatformFeeRateState(rate);
  };

  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: `srv-${Date.now().toString(36)}`,
    };
    setServices((prev) => [...prev, newService]);
  };

  const createReview = (reviewData: Omit<Review, 'id' | 'created_at'>) => {
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
        setUserLocation,
        switchUser,
        createBooking,
        updateBookingStatus,
        updateTherapistLocation,
        toggleTherapistApproval,
        setPlatformFeeRate,
        addService,
        createReview,
        resetToMock,
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

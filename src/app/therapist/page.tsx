'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { isTherapistCertified } from '@/lib/verification';

export default function TherapistRootRedirectPage() {
  const router = useRouter();
  const { currentUser, allUsers, therapistProfiles } = useApp();

  useEffect(() => {
    const therapists = allUsers.filter((u) => u.role === 'therapist');
    const target = (currentUser.role === 'therapist' ? currentUser : therapists[0]) || null;

    if (target) {
      const tp = therapistProfiles[target.id];
      const certified = isTherapistCertified(tp);
      const section = certified ? 'requests' : 'verification';
      router.replace(`/therapist/${target.id}/${section}`);
    }
  }, [currentUser, allUsers, therapistProfiles, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-300">セラピストポータルへ移動中...</p>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { isTherapistCertified } from '@/lib/verification';

export function TherapistIdRedirectClient({ therapistId }: { therapistId: string }) {
  const router = useRouter();
  const { therapistProfiles } = useApp();

  useEffect(() => {
    if (therapistId) {
      const tp = therapistProfiles[therapistId];
      const certified = isTherapistCertified(tp);
      const targetSection = certified ? 'requests' : 'verification';
      router.replace(`/therapist/${therapistId}/${targetSection}`);
    }
  }, [therapistId, therapistProfiles, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-300">セラピストポータルへ移動中...</p>
      </div>
    </div>
  );
}

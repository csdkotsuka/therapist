'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PresentationRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/guide/admin/pitch');
  }, [router]);
  return null;
}

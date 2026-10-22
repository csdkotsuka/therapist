import React, { Suspense } from 'react';
import { TherapistIdRedirectClient } from './TherapistIdRedirectClient';

async function TherapistIdResolver({
  params,
}: {
  params: Promise<{ therapistId: string }>;
}) {
  const { therapistId } = await params;
  return <TherapistIdRedirectClient therapistId={therapistId} />;
}

export default function TherapistIdIndexPage({
  params,
}: {
  params: Promise<{ therapistId: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <TherapistIdResolver params={params} />
    </Suspense>
  );
}

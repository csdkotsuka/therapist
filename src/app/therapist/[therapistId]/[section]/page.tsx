import React, { Suspense } from 'react';
import { TherapistSectionClient } from './TherapistSectionClient';

async function TherapistSectionResolver({
  params,
}: {
  params: Promise<{ therapistId: string; section: string }>;
}) {
  const { therapistId, section } = await params;
  return <TherapistSectionClient therapistId={therapistId} rawSection={section} />;
}

export default function TherapistSectionPage({
  params,
}: {
  params: Promise<{ therapistId: string; section: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <TherapistSectionResolver params={params} />
    </Suspense>
  );
}

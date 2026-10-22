import React, { Suspense } from 'react';
import { AdminSectionClient } from './AdminSectionClient';

async function AdminSectionResolver({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return <AdminSectionClient rawSection={section} />;
}

export default function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <AdminSectionResolver params={params} />
    </Suspense>
  );
}

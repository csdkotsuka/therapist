import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/server/supabaseServer';

// セラピストは自分のページのみ。管理者は任意のセラピストのページを閲覧できる。
export default async function TherapistIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ therapistId: string }>;
}) {
  const { therapistId } = await params;
  const user = await getSessionUser();
  if (!user) redirect('/login?role=therapist&redirect=/therapist');
  if (user.role === 'therapist' && user.id !== therapistId) redirect(`/therapist/${user.id}`);
  if (user.role !== 'therapist' && user.role !== 'admin') redirect('/');
  return <>{children}</>;
}

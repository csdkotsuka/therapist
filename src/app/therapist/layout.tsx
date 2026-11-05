import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/server/supabaseServer';

// セラピストポータルはセラピスト本人と管理者のみ
export default async function TherapistLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/login?role=therapist&redirect=/therapist');
  if (user.role !== 'therapist' && user.role !== 'admin') redirect('/');
  return <>{children}</>;
}

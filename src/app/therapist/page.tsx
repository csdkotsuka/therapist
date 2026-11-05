import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/server/supabaseServer';

export default async function TherapistRootRedirectPage() {
  const user = await getSessionUser();
  if (user?.role === 'therapist') redirect(`/therapist/${user.id}`);
  redirect('/admin/therapists');
}

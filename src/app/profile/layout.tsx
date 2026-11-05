import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/server/supabaseServer';

export default async function LoggedInLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  return <>{children}</>;
}

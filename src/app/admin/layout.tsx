import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/server/supabaseServer';

// 管理画面はサーバー側で profiles.role = 'admin' を確認してから表示する
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/login?role=admin&redirect=/admin');
  if (user.role !== 'admin') redirect('/');
  return <>{children}</>;
}

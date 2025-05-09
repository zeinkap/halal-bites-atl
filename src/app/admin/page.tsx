import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const req = { headers: { cookie: cookieStore.toString() } };
  if (!isAdminAuthenticated(req)) {
    redirect('/admin-login');
  }
  return <AdminDashboardClient />;
} 
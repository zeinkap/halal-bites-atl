'use client';

import { useRouter } from 'next/navigation'; // ✅ fixed from next/router (Pages Router)
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch('/api/admin-logout', { method: 'POST' });
    router.push('/admin-login');
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 px-4 py-2 rounded-full transition-colors disabled:opacity-60"
    >
      <ArrowRightOnRectangleIcon className="h-4 w-4" />
      {loading ? 'Signing out…' : 'Sign Out'}
    </button>
  );
}

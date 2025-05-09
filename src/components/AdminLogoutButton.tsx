import { useRouter } from 'next/router';
import { Button } from './ui/Button';
import { useState } from 'react';

export default function AdminLogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    await fetch('/api/admin-logout', { method: 'POST' });
    setLoading(false);
    router.push('/admin-login');
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
      disabled={loading}
    >
      {loading ? 'Logging out...' : 'Logout'}
    </Button>
  );
} 
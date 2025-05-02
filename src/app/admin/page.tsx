'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  DocumentArrowDownIcon, 
  EnvelopeIcon, 
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BuildingStorefrontIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface SystemStats {
  totalRestaurants: number;
  totalComments: number;
  totalReports: number;
  lastBackupDate: string | null;
}

interface BackupHistory {
  id: string;
  filename: string;
  createdAt: string;
  size: number;
  status: string;
}

interface BugReport {
  id: string;
  title: string;
  description: string;
  email?: string;
  createdAt: string;
}

interface RestaurantReport {
  id: string;
  restaurantId: string;
  status: string;
  createdAt: string;
  details: string;
  restaurant?: {
    name?: string;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([]);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [restaurantReports, setRestaurantReports] = useState<RestaurantReport[]>([]);

  // Fetch system stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load system statistics');
    }
  };

  // Fetch backup history
  const fetchBackupHistory = async () => {
    try {
      const response = await fetch('/api/admin/backup-history');
      if (!response.ok) throw new Error('Failed to fetch backup history');
      const data = await response.json();
      setBackupHistory(data);
    } catch (error) {
      console.error('Failed to fetch backup history:', error);
      toast.error('Failed to load backup history');
    }
  };

  // Fetch bug reports
  const fetchBugReports = async () => {
    try {
      const response = await fetch('/api/admin/bug-reports');
      if (!response.ok) throw new Error('Failed to fetch bug reports');
      const data = await response.json();
      setBugReports(data);
    } catch (error) {
      setBugReports([]);
    }
  };

  // Fetch restaurant reports
  const fetchRestaurantReports = async () => {
    try {
      const response = await fetch('/api/admin/reports');
      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      setRestaurantReports(data);
    } catch (error) {
      setRestaurantReports([]);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log('Admin Page - Unauthenticated');
      router.push('/');
    } else if (status === 'authenticated') {
      console.log('Admin Page - Session:', {
        email: session?.user?.email,
        expectedEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
        fullSession: session
      });
      fetchStats();
      fetchBackupHistory();
      fetchBugReports();
      fetchRestaurantReports();
    }
  }, [status, router, session]);

  const handleBackup = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/backup');
      
      if (!response.ok) {
        throw new Error('Failed to create backup');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `halal-restaurants-atl-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Backup created successfully!');
      fetchBackupHistory(); // Refresh backup history
    } catch (error) {
      console.error('Backup failed:', error);
      toast.error('Failed to create backup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/test-email');
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send test email');
      }

      toast.success('Test email sent successfully!');
    } catch (error) {
      console.error('Test email failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send test email');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user?.email || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
            <p className="mt-2 text-gray-600">You do not have permission to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end mb-8">
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Sign Out
          </button>
        </div>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="mt-2 text-lg text-gray-600">Manage your application here</p>
        </div>

        {/* System Stats */}
        {stats && (
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BuildingStorefrontIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Restaurants</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalRestaurants}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Comments</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalComments}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Reports</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalReports}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Last Backup</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.lastBackupDate 
                          ? new Date(stats.lastBackupDate).toLocaleDateString()
                          : 'Never'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-4 lg:max-w-none">
          {/* Backup Card */}
          <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white">
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <DocumentArrowDownIcon className="h-6 w-6 text-indigo-600" />
                  <h3 className="ml-2 text-xl font-semibold text-gray-900">Database Backup</h3>
                </div>
                <p className="mt-3 text-base text-gray-500">
                  Create a backup of all restaurants and comments data.
                </p>
                
                {/* Backup History */}
                {backupHistory.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900">Recent Backups</h4>
                    <div className="mt-2 flow-root">
                      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="py-2 pl-4 pr-3 text-left text-xs font-medium text-gray-500">
                                    Date
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                    Size
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-white">
                                {backupHistory.slice(0, 3).map((backup) => (
                                  <tr key={backup.id}>
                                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-xs text-gray-900">
                                      {new Date(backup.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-500">
                                      {(backup.size / 1024).toFixed(2)} KB
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2 text-xs">
                                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                        backup.status === 'success'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {backup.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <button
                  onClick={handleBackup}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Backup...' : 'Create Backup'}
                </button>
              </div>
            </div>
          </div>

          {/* Test Email Card */}
          <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white">
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-6 w-6 text-green-600" />
                  <h3 className="ml-2 text-xl font-semibold text-gray-900">Test Email</h3>
                </div>
                <p className="mt-3 text-base text-gray-500">
                  Send a test email to verify email configuration.
                </p>
              </div>
              <div className="mt-6">
                <button
                  onClick={handleTestEmail}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Test Email'}
                </button>
              </div>
            </div>
          </div>

          {/* Bug Reports Card */}
          <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white">
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
                  <h3 className="ml-2 text-xl font-semibold text-gray-900">Recent Bug Reports</h3>
                </div>
                <p className="mt-3 text-base text-gray-500">
                  Latest issues reported by users.
                </p>
                {bugReports.length === 0 ? (
                  <div className="mt-4 text-gray-500 text-sm">No bug reports found.</div>
                ) : (
                  <ul className="mt-4 divide-y divide-gray-200">
                    {bugReports.slice(0, 3).map((bug) => (
                      <li key={bug.id} className="py-2">
                        <div className="font-medium text-gray-900 truncate" title={bug.title}>{bug.title}</div>
                        <div className="text-xs text-gray-500 truncate" title={bug.description}>{bug.description}</div>
                        <div className="text-xs text-gray-400">{bug.email || '-'} &middot; {new Date(bug.createdAt).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/admin/bug-reports')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  View All
                </button>
              </div>
            </div>
          </div>

          {/* Restaurant Reports Card */}
          <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white">
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
                  <h3 className="ml-2 text-xl font-semibold text-gray-900">Recent Restaurant Reports</h3>
                </div>
                <p className="mt-3 text-base text-gray-500">
                  Latest incorrect info reports from users.
                </p>
                {restaurantReports.length === 0 ? (
                  <div className="mt-4 text-gray-500 text-sm">No reports found.</div>
                ) : (
                  <ul className="mt-4 divide-y divide-gray-200">
                    {restaurantReports.slice(0, 3).map((report) => (
                      <li key={report.id} className="py-2">
                        <div className="font-medium text-gray-900 truncate" title={report.restaurant?.name || report.restaurantId}>
                          {report.restaurant?.name ? report.restaurant.name : `Restaurant ID: ${report.restaurantId}`}
                        </div>
                        <div className="text-xs text-gray-500 truncate" title={report.details}>{report.details}</div>
                        <div className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/admin/reports')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  View All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          <div className="mt-4 space-x-4">
            <button
              onClick={() => router.push('/admin/restaurants')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Manage Restaurants
            </button>
            <button
              onClick={() => router.push('/admin/reports')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
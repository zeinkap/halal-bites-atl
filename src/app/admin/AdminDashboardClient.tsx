'use client';

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
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface SystemStats {
  totalRestaurants: number;
  totalComments: number;
  totalReports: number;
  lastBackupDate: string | null;
  reportsOverTime: { date: string; count: number }[];
  restaurantsOverTime: { date: string; count: number }[];
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
  status?: string;
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

export default function AdminDashboardClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([]);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [restaurantReports, setRestaurantReports] = useState<RestaurantReport[]>([]);
  const [reportsOverTime, setReportsOverTime] = useState<{ date: string; count: number }[]>([]);
  const [restaurantsOverTime, setRestaurantsOverTime] = useState<{ date: string; count: number }[]>([]);

  // Fetch system stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
      setReportsOverTime(data.reportsOverTime || []);
      setRestaurantsOverTime(data.restaurantsOverTime || []);
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
    } catch {
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
    } catch {
      setRestaurantReports([]);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchBackupHistory();
    fetchBugReports();
    fetchRestaurantReports();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-500 py-6 shadow-md mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="h-8 w-8 text-white drop-shadow" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow">Admin Dashboard</h1>
            <Badge color="orange" size="sm" className="ml-2">Admin</Badge>
          </div>
          {/* Desktop Sign Out Button */}
          <Button
            variant="danger"
            size="md"
            onClick={async () => {
              await fetch('/api/admin-logout', { method: 'POST' });
              router.push('/');
            }}
            className="shadow-md text-base px-6 py-2 hidden sm:inline-flex"
          >
            Sign Out
          </Button>
          {/* Mobile Sign Out Button */}
          <Button
            variant="danger"
            size="sm"
            onClick={async () => {
              await fetch('/api/admin-logout', { method: 'POST' });
              router.push('/');
            }}
            className="shadow-md sm:hidden"
          >
            Sign Out
          </Button>
        </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* System Stats */}
        <h2 className="text-lg font-semibold text-gray-800 mb-3">System Stats</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            variant="info"
            size="md"
            onClick={() => router.push('/admin/restaurants')}
            className="flex items-center gap-2 shadow-sm"
            data-testid="manage-restaurants-button"
          >
            Manage Restaurants
          </Button>
        </div>
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            <Card className="bg-white shadow-md border-0">
              <div className="flex items-center gap-3">
                <BuildingStorefrontIcon className="h-7 w-7 text-orange-500" />
                <div>
                  <div className="text-xs text-gray-500">Total Restaurants</div>
                  <div className="text-xl font-bold text-gray-900">{stats.totalRestaurants}</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white shadow-md border-0">
              <div className="flex items-center gap-3">
                <ChartBarIcon className="h-7 w-7 text-emerald-500" />
                <div>
                  <div className="text-xs text-gray-500">Total Comments</div>
                  <div className="text-xl font-bold text-gray-900">{stats.totalComments}</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white shadow-md border-0">
              <div className="flex items-center gap-3">
                <ExclamationTriangleIcon className="h-7 w-7 text-rose-500" />
                <div>
                  <div className="text-xs text-gray-500">Bug Reports</div>
                  <div className="text-xl font-bold text-gray-900">{stats.totalReports}</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white shadow-md border-0">
              <div className="flex items-center gap-3">
                <ClockIcon className="h-7 w-7 text-blue-500" />
                <div>
                  <div className="text-xs text-gray-500">Last Backup</div>
                  <div className="text-xl font-bold text-gray-900">{stats.lastBackupDate ? new Date(stats.lastBackupDate).toLocaleString() : 'Never'}</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-10">
          <Button
            variant="primary"
            size="md"
            onClick={handleBackup}
            disabled={isLoading}
            className="flex items-center gap-2 shadow-sm"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            Create Backup
          </Button>
          <Button
            variant="amber"
            size="md"
            onClick={handleTestEmail}
            disabled={isLoading}
            className="flex items-center gap-2 shadow-sm"
          >
            <EnvelopeIcon className="h-5 w-5" />
            Send Test Email
          </Button>
                </div>

                {/* Backup History */}
        <h2 className="text-lg font-semibold text-gray-800 mb-3 mt-10">Recent Backups</h2>
        <Card className="mb-10 bg-white shadow-md border-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Filename</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Created</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Size</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                                </tr>
                              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {backupHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 py-4">No backups found.</td>
                  </tr>
                ) : (
                  backupHistory.map((backup) => (
                                  <tr key={backup.id}>
                      <td className="px-4 py-2 text-gray-800">{backup.filename}</td>
                      <td className="px-4 py-2 text-gray-700">{new Date(backup.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-2 text-gray-700">{(backup.size / 1024).toFixed(1)} KB</td>
                      <td className="px-4 py-2">
                        <Badge color={backup.status === 'success' ? 'green' : 'orange'} size="sm">
                                        {backup.status}
                                      </Badge>
                                    </td>
                                  </tr>
                  ))
                )}
                              </tbody>
                            </table>
                          </div>
          </Card>

        {/* Bug Reports */}
        <h2 className="text-lg font-semibold text-gray-800 mb-3 mt-10">Bug Reports</h2>
        <Card className="mb-2 bg-white shadow-md border-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Title</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Description</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {bugReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-4">No bug reports found.</td>
                  </tr>
                ) : (
                  bugReports.map((bug) => (
                    <tr key={bug.id}>
                      <td className="px-4 py-2 font-medium text-gray-900">{bug.title}</td>
                      <td className="px-4 py-2 text-gray-700">{bug.description}</td>
                      <td className="px-4 py-2 text-gray-500">{bug.email || '-'}</td>
                      <td className="px-4 py-2">
                        <Badge color={
                          (bug.status || 'open') === 'rejected' ? 'pink' :
                          (bug.status || 'open') === 'open' ? 'yellow' :
                          (bug.status || 'open') === 'resolved' ? 'green' :
                          'gray'
                        } size="sm">
                          {bug.status || 'open'}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-gray-500">{new Date(bug.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
              </div>
        </Card>
        <div className="flex justify-end mb-10">
                <Button variant="neutral" size="sm" onClick={() => router.push('/admin/bug-reports')}>
                  View All
                </Button>
              </div>

        {/* Restaurant Reports */}
        <h2 className="text-lg font-semibold text-gray-800 mb-3 mt-10">Restaurant Reports</h2>
        <Card className="mb-2 bg-white shadow-md border-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Restaurant</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Details</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {restaurantReports.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 py-4">No restaurant reports found.</td>
                  </tr>
                ) : (
                  restaurantReports.map((report) => (
                    <tr key={report.id}>
                      <td className="px-4 py-2 font-medium text-gray-900">{report.restaurant?.name || '-'}</td>
                      <td className="px-4 py-2 text-gray-700">{report.details}</td>
                      <td className="px-4 py-2">
                        <Badge color={
                          report.status === 'rejected' ? 'pink' :
                          report.status === 'open' ? 'yellow' :
                          report.status === 'resolved' ? 'green' :
                          'gray'
                        } size="sm">
                          {report.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-gray-500">{new Date(report.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
              </div>
        </Card>
        <div className="flex justify-end mb-10">
                <Button variant="neutral" size="sm" onClick={() => router.push('/admin/reports')}>
                  View All
                </Button>
        </div>
      </div>
    </div>
  );
} 
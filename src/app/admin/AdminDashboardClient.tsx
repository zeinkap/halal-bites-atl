'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  DocumentArrowDownIcon,
  EnvelopeIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  ClockIcon as PendingIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
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
import { Line } from 'react-chartjs-2';
import { Badge } from '../../components/ui/Badge';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface SystemStats {
  totalRestaurants: number;
  pendingRestaurants: number;
  newRestaurants: number;
  totalComments: number;
  openReports: number;
  resolvedReports: number;
  rejectedReports: number;
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
  restaurant?: { name?: string };
}

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
  accent = 'stone',
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'teal' | 'amber' | 'rose' | 'stone' | 'blue';
  onClick?: () => void;
}) {
  const iconBg = {
    teal: 'bg-teal-100 text-teal-600',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600',
    stone: 'bg-stone-100 text-stone-500',
    blue: 'bg-blue-100 text-blue-600',
  }[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex items-center gap-4 ${onClick ? 'hover:border-teal-300 hover:shadow-md transition-all cursor-pointer' : 'cursor-default'}`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-stone-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
      </div>
    </button>
  );
}

// ── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = (status || 'open').toLowerCase();
  if (s === 'resolved') return <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700">Resolved</span>;
  if (s === 'rejected') return <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600">Rejected</span>;
  return <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">Open</span>;
}

// ── Table skeleton ──────────────────────────────────────────────────────────
function TableSkeleton({ rows = 3, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-stone-100">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-3.5 bg-stone-100 rounded animate-pulse" style={{ width: `${60 + (j * 13) % 30}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export default function AdminDashboardClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([]);
  const [backupsLoading, setBackupsLoading] = useState(true);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [bugsLoading, setBugsLoading] = useState(true);
  const [restaurantReports, setRestaurantReports] = useState<RestaurantReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => toast.error('Failed to load statistics'))
      .finally(() => setStatsLoading(false));

    fetch('/api/admin/backup-history')
      .then(r => r.json())
      .then(setBackupHistory)
      .catch(() => setBackupHistory([]))
      .finally(() => setBackupsLoading(false));

    fetch('/api/admin/bug-reports')
      .then(r => r.json())
      .then(data => setBugReports(data.slice(0, 5)))
      .catch(() => setBugReports([]))
      .finally(() => setBugsLoading(false));

    fetch('/api/admin/reports')
      .then(r => r.json())
      .then(data => setRestaurantReports(data.slice(0, 5)))
      .catch(() => setRestaurantReports([]))
      .finally(() => setReportsLoading(false));
  }, []);

  const handleBackup = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/backup');
      if (!response.ok) throw new Error('Failed to create backup');
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
      fetch('/api/admin/backup-history').then(r => r.json()).then(setBackupHistory).catch(() => null);
    } catch {
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
      toast.success('Test email sent!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send test email');
    } finally {
      setIsLoading(false);
    }
  };

  // Chart data
  const chartLabels = stats?.restaurantsOverTime.map(d =>
    new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  ) ?? [];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#a8a29e', font: { size: 11 } } },
      y: { grid: { color: '#f5f5f4' }, ticks: { color: '#a8a29e', font: { size: 11 }, stepSize: 1 } },
    },
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 py-6 shadow-md mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="h-8 w-8 text-white/90" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-teal-100 text-sm mt-0.5 hidden sm:block">Halal Bites ATL — control panel</p>
            </div>
            <span className="hidden sm:inline-flex text-xs font-bold text-teal-700 bg-white/90 px-2.5 py-1 rounded-full ml-1">Admin</span>
          </div>
          <button
            onClick={async () => {
              await fetch('/api/admin-logout', { method: 'POST' });
              router.push('/');
            }}
            className="text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-full transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* ── Stat cards ─────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">Overview</h2>
          {statsLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-stone-200 p-5 h-24 animate-pulse" />
              ))}
            </div>
          ) : stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<BuildingStorefrontIcon className="h-5 w-5" />}
                label="Live Restaurants"
                value={stats.totalRestaurants}
                sub={stats.newRestaurants > 0 ? `+${stats.newRestaurants} this month` : undefined}
                accent="teal"
                onClick={() => router.push('/admin/restaurants')}
              />
              <StatCard
                icon={<PendingIcon className="h-5 w-5" />}
                label="Pending Review"
                value={stats.pendingRestaurants}
                sub={stats.pendingRestaurants > 0 ? 'Tap to review' : 'All clear'}
                accent={stats.pendingRestaurants > 0 ? 'amber' : 'stone'}
                onClick={() => router.push('/admin/pending')}
              />
              <StatCard
                icon={<ChatBubbleLeftIcon className="h-5 w-5" />}
                label="Total Comments"
                value={stats.totalComments}
                accent="blue"
              />
              <StatCard
                icon={<ExclamationTriangleIcon className="h-5 w-5" />}
                label="Open Reports"
                value={stats.openReports}
                sub={stats.openReports > 0 ? 'Tap to review' : 'None pending'}
                accent={stats.openReports > 0 ? 'rose' : 'stone'}
                onClick={() => router.push('/admin/reports')}
              />
            </div>
          )}
        </section>

        {/* ── Charts ─────────────────────────────────────────── */}
        {stats && (
          <section>
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">Last 30 Days</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                <p className="text-sm font-semibold text-stone-700 mb-3">New Restaurants</p>
                <div className="h-40">
                  <Line
                    data={{
                      labels: chartLabels,
                      datasets: [{
                        data: stats.restaurantsOverTime.map(d => d.count),
                        borderColor: '#0d9488',
                        backgroundColor: 'rgba(13,148,136,0.08)',
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.4,
                        fill: true,
                      }],
                    }}
                    options={chartOptions}
                  />
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                <p className="text-sm font-semibold text-stone-700 mb-3">Restaurant Reports</p>
                <div className="h-40">
                  <Line
                    data={{
                      labels: chartLabels,
                      datasets: [{
                        data: stats.reportsOverTime.map(d => d.count),
                        borderColor: '#f43f5e',
                        backgroundColor: 'rgba(244,63,94,0.08)',
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.4,
                        fill: true,
                      }],
                    }}
                    options={chartOptions}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Quick actions ───────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/admin/restaurants')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2.5 rounded-full transition-colors shadow-sm"
              data-testid="manage-restaurants-button"
            >
              <BuildingStorefrontIcon className="h-4 w-4" />
              Manage Restaurants
            </button>
            {stats && stats.pendingRestaurants > 0 && (
              <button
                onClick={() => router.push('/admin/pending')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-200 px-4 py-2.5 rounded-full transition-colors"
              >
                <PendingIcon className="h-4 w-4" />
                Review Pending
                <span className="bg-amber-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                  {stats.pendingRestaurants}
                </span>
              </button>
            )}
            <button
              onClick={handleBackup}
              disabled={isLoading}
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-full transition-colors shadow-sm disabled:opacity-50"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              Create Backup
            </button>
            <button
              onClick={handleTestEmail}
              disabled={isLoading}
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-full transition-colors shadow-sm disabled:opacity-50"
            >
              <EnvelopeIcon className="h-4 w-4" />
              Test Email
            </button>
          </div>
        </section>

        {/* ── Recent backups ──────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">Recent Backups</h2>
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="border-b border-stone-100">
                <tr>
                  {['Filename', 'Created', 'Size', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              {backupsLoading ? (
                <TableSkeleton rows={3} cols={4} />
              ) : (
                <tbody>
                  {backupHistory.length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-stone-400 py-8 text-sm">No backups yet.</td></tr>
                  ) : backupHistory.map(b => (
                    <tr key={b.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                      <td className="px-4 py-3 text-stone-700 font-medium">{b.filename}</td>
                      <td className="px-4 py-3 text-stone-500">{new Date(b.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-stone-500">{(b.size / 1024).toFixed(1)} KB</td>
                      <td className="px-4 py-3">
                        <Badge color={b.status === 'success' ? 'green' : 'orange'} size="sm">{b.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        </section>

        {/* ── Bug reports ─────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">Bug Reports</h2>
            <button
              onClick={() => router.push('/admin/bug-reports')}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              View all <ArrowRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="border-b border-stone-100">
                <tr>
                  {['Title', 'Email', 'Status', 'Submitted'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              {bugsLoading ? (
                <TableSkeleton rows={4} cols={4} />
              ) : (
                <tbody>
                  {bugReports.length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-stone-400 py-8 text-sm">No bug reports.</td></tr>
                  ) : bugReports.map(bug => (
                    <tr key={bug.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                      <td className="px-4 py-3 font-medium text-stone-800 max-w-[200px] truncate">{bug.title}</td>
                      <td className="px-4 py-3 text-stone-500">{bug.email || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={bug.status || 'open'} /></td>
                      <td className="px-4 py-3 text-stone-400 whitespace-nowrap">{new Date(bug.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        </section>

        {/* ── Restaurant reports ──────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">Restaurant Reports</h2>
            <button
              onClick={() => router.push('/admin/reports')}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              View all <ArrowRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="border-b border-stone-100">
                <tr>
                  {['Restaurant', 'Details', 'Status', 'Submitted'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              {reportsLoading ? (
                <TableSkeleton rows={4} cols={4} />
              ) : (
                <tbody>
                  {restaurantReports.length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-stone-400 py-8 text-sm">No restaurant reports.</td></tr>
                  ) : restaurantReports.map(report => (
                    <tr key={report.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                      <td className="px-4 py-3 font-medium text-stone-800">{report.restaurant?.name || '—'}</td>
                      <td className="px-4 py-3 text-stone-500 max-w-[220px] truncate">{report.details}</td>
                      <td className="px-4 py-3"><StatusBadge status={report.status} /></td>
                      <td className="px-4 py-3 text-stone-400 whitespace-nowrap">{new Date(report.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        </section>

        {/* Last backup note */}
        {stats?.lastBackupDate && (
          <p className="text-xs text-stone-400 flex items-center gap-1.5 pb-4">
            <ClockIcon className="h-3.5 w-3.5" />
            Last successful backup: {new Date(stats.lastBackupDate).toLocaleString()}
          </p>
        )}

      </div>
    </div>
  );
}

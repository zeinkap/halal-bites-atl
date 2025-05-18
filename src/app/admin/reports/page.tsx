"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";
import { Button } from '../../../components/ui/Button';

interface Report {
  id: string;
  restaurantId: string;
  details: string;
  status: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  restaurant?: {
    name: string;
    address?: string;
  };
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'restaurant'|'status'|'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/admin/reports");
      if (!response.ok) throw new Error("Failed to fetch reports");
      const data = await response.json();
      setReports(data);
    } catch {
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  function getAdminEmailFromCookie() {
    if (typeof document === 'undefined') return undefined;
    const match = document.cookie.match(/(?:^|; )admin_session=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : undefined;
  }

  // Filtering, searching, sorting
  const filtered = reports
    .filter(report =>
      (!statusFilter || report.status === statusFilter) &&
      ((report.restaurant?.name || '').toLowerCase().includes(search.toLowerCase()) || (report.restaurantId || '').toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'createdAt') {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return sortDir === 'asc' ? aTime - bTime : bTime - aTime;
      } else if (sortBy === 'restaurant') {
        const aVal = (a.restaurant?.name || '').toLowerCase();
        const bVal = (b.restaurant?.name || '').toLowerCase();
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else {
        const aVal = (a[sortBy] || '').toString().toLowerCase();
        const bVal = (b[sortBy] || '').toString().toLowerCase();
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
    });

  const allSelected = selected.length > 0 && selected.length === filtered.length;
  const toggleSelectAll = () => setSelected(allSelected ? [] : filtered.map(r => r.id));
  const toggleSelect = (id: string) => setSelected(selected.includes(id) ? selected.filter(i => i !== id) : [...selected, id]);

  // Bulk actions
  const bulkAction = async (action: 'resolved'|'rejected'|'delete') => {
    for (const id of selected) {
      if (action === 'delete') {
        await fetch(`/api/admin/reports?id=${id}`, { method: 'DELETE' });
      } else {
        const adminEmail = getAdminEmailFromCookie();
        await fetch(`/api/admin/reports?id=${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: action, resolvedBy: adminEmail }) });
      }
    }
    setSelected([]);
    fetchReports();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-4 gap-4">
          <Button variant="neutral" onClick={() => router.push('/admin')} className="inline-block px-4 py-2 text-sm font-medium">Back to Dashboard</Button>
          <Button variant="secondary" onClick={() => setShowAllColumns((v) => !v)}>
            {showAllColumns ? 'Hide Extra Columns' : 'Show All Columns'}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <input
            type="text"
            placeholder="Search by restaurant name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-2 py-1 text-sm text-gray-800 placeholder-gray-500"
            style={{ minWidth: 200 }}
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm text-gray-800"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        {selected.length > 0 && (
          <div className="mb-2 flex gap-2 items-center bg-gray-100 p-2 rounded">
            <span>{selected.length} selected</span>
            <Button size="sm" variant="info" onClick={() => bulkAction('resolved')}>Mark as Fixed</Button>
            <Button size="sm" variant="danger" onClick={() => bulkAction('rejected')}>Reject</Button>
            <Button size="sm" variant="danger" onClick={() => bulkAction('delete')}>Delete</Button>
          </div>
        )}
        <div className="mb-8 flex justify-center">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Reports</h2>
        </div>
        {reports.length === 0 ? (
          <div className="text-gray-600">No reports found.</div>
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <div className="relative">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2">
                      <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                    </th>
                    <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-normal break-words cursor-pointer" onClick={() => { setSortBy('restaurant'); setSortDir(sortBy === 'restaurant' && sortDir === 'asc' ? 'desc' : 'asc'); }}>Restaurant Name</th>
                    <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-normal break-words">Restaurant ID</th>
                    {showAllColumns && <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-normal break-words">Restaurant Address</th>}
                    <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-normal break-words">Reason</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => { setSortBy('status'); setSortDir(sortBy === 'status' && sortDir === 'asc' ? 'desc' : 'asc'); }}>Status</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => { setSortBy('createdAt'); setSortDir(sortBy === 'createdAt' && sortDir === 'asc' ? 'desc' : 'asc'); }}>Created</th>
                    {showAllColumns && <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved At</th>}
                    {showAllColumns && <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved By</th>}
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((report) => (
                    <tr key={report.id}>
                      <td className="px-2 py-2 text-center">
                        <input type="checkbox" checked={selected.includes(report.id)} onChange={() => toggleSelect(report.id)} />
                      </td>
                      <td className="px-2 py-4 text-sm text-gray-900 whitespace-normal break-words" title={report.restaurant?.name}>{report.restaurant?.name || '-'}</td>
                      <td className="px-2 py-4 text-sm text-gray-500 whitespace-normal break-words" title={report.restaurantId}>{report.restaurantId}</td>
                      {showAllColumns && <td className="px-2 py-4 text-sm text-gray-500 whitespace-normal break-words" title={report.restaurant?.address}>{report.restaurant?.address || '-'}</td>}
                      <td className="px-2 py-4 text-sm text-gray-500 whitespace-normal break-words" title={report.details}>{report.details}</td>
                      <td className="px-2 py-2 text-sm text-gray-500">{report.status}</td>
                      <td className="px-2 py-2 text-sm text-gray-500">{new Date(report.createdAt).toLocaleString()}</td>
                      {showAllColumns && <td className="px-2 py-2 text-sm text-gray-500">{report.resolvedAt ? new Date(report.resolvedAt).toLocaleString() : '-'}</td>}
                      {showAllColumns && <td className="px-2 py-2 text-sm text-gray-500">{report.resolvedBy || '-'}</td>}
                      <td className="px-2 py-2 text-sm sticky right-0 bg-white z-10">
                        {report.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              variant="info"
                              size="sm"
                              className="bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium shadow"
                              onClick={async () => {
                                const adminEmail = getAdminEmailFromCookie();
                                await fetch(`/api/admin/reports?id=${report.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'resolved', resolvedBy: adminEmail }),
                                });
                                fetchReports();
                              }}
                            >
                              Mark as Fixed
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              className="bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium shadow"
                              onClick={async () => {
                                const adminEmail = getAdminEmailFromCookie();
                                await fetch(`/api/admin/reports?id=${report.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'rejected', resolvedBy: adminEmail }),
                                });
                                fetchReports();
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
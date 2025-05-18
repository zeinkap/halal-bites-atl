"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

interface BugReport {
  id: string;
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  browser?: string;
  device?: string;
  email?: string;
  screenshotUrl?: string;
  createdAt: string;
  status?: string;
}

export default function AdminBugReportsPage() {
  const router = useRouter();
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'title'|'email'|'status'|'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');

  useEffect(() => {
    fetchBugReports();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchBugReports = async () => {
    try {
      const response = await fetch("/api/admin/bug-reports");
      if (!response.ok) throw new Error("Failed to fetch bug reports");
      const data = await response.json();
      setBugReports(data);
    } catch {
      setBugReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtering, searching, sorting
  const filtered = bugReports
    .filter(bug =>
      (!statusFilter || (bug.status || 'open') === statusFilter) &&
      (bug.title.toLowerCase().includes(search.toLowerCase()) || (bug.email || '').toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'createdAt') {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return sortDir === 'asc' ? aTime - bTime : bTime - aTime;
      } else {
        const aVal = (a[sortBy] || '').toString().toLowerCase();
        const bVal = (b[sortBy] || '').toString().toLowerCase();
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
    });

  const allSelected = selected.length > 0 && selected.length === filtered.length;
  const toggleSelectAll = () => setSelected(allSelected ? [] : filtered.map(b => b.id));
  const toggleSelect = (id: string) => setSelected(selected.includes(id) ? selected.filter(i => i !== id) : [...selected, id]);

  // Bulk actions
  const bulkAction = async (action: 'resolved'|'rejected'|'delete') => {
    for (const id of selected) {
      if (action === 'delete') {
        await fetch(`/api/admin/bug-reports`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      } else {
        await fetch(`/api/admin/bug-reports`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: action }) });
      }
    }
    setSelected([]);
    fetchBugReports();
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-4 gap-4">
          <Button variant="neutral" onClick={() => router.push('/admin')} className="inline-block px-4 py-2 text-sm font-medium">Back to Dashboard</Button>
          <Button variant="secondary" onClick={() => setShowAllColumns((v) => !v)}>
            {showAllColumns ? 'Hide Extra Columns' : 'Show All Columns'}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <input
            type="text"
            placeholder="Search by title or email..."
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
            <option value="open">Open</option>
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
          <h2 className="text-3xl font-bold text-gray-900 text-center">Bug Reports</h2>
        </div>
        {filtered.length === 0 ? (
          <div className="text-gray-600">No bug reports found.</div>
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <colgroup>
                <col style={{ width: '4%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '24%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '8%', display: showAllColumns ? undefined : 'none' }} />
                <col style={{ width: '8%', display: showAllColumns ? undefined : 'none' }} />
                <col style={{ width: '8%', display: showAllColumns ? undefined : 'none' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '16%' }} />
              </colgroup>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2">
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                  </th>
                  <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-normal break-words cursor-pointer" onClick={() => { setSortBy('title'); setSortDir(sortBy === 'title' && sortDir === 'asc' ? 'desc' : 'asc'); }}>Title</th>
                  <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-normal break-words">Description</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => { setSortBy('email'); setSortDir(sortBy === 'email' && sortDir === 'asc' ? 'desc' : 'asc'); }}>Email</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => { setSortBy('status'); setSortDir(sortBy === 'status' && sortDir === 'asc' ? 'desc' : 'asc'); }}>Status</th>
                  {showAllColumns && <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[80px] truncate">Browser</th>}
                  {showAllColumns && <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[80px] truncate">Device</th>}
                  {showAllColumns && <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[80px] truncate">Screenshot</th>}
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => { setSortBy('createdAt'); setSortDir(sortBy === 'createdAt' && sortDir === 'asc' ? 'desc' : 'asc'); }}>Created</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[160px] truncate">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((bug) => (
                  <tr key={bug.id}>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={selected.includes(bug.id)} onChange={() => toggleSelect(bug.id)} />
                    </td>
                    <td className="px-2 py-4 text-sm text-gray-900 whitespace-normal break-words" title={bug.title}>{bug.title}</td>
                    <td className="px-2 py-4 text-sm text-gray-500 whitespace-normal break-words" title={bug.description}>{bug.description}</td>
                    <td className="px-2 py-2 text-sm text-gray-500">{bug.email || '-'}</td>
                    <td className="px-2 py-2 text-sm max-w-[80px] truncate">
                      <Badge color={
                        (bug.status || 'open') === 'rejected' ? 'pink' :
                        (bug.status || 'open') === 'open' ? 'yellow' :
                        (bug.status || 'open') === 'resolved' ? 'green' :
                        'gray'
                      } size="sm">
                        {bug.status || 'open'}
                      </Badge>
                    </td>
                    {showAllColumns && <td className="px-2 py-2 text-sm text-gray-500 max-w-[80px] truncate">{bug.browser || '-'}</td>}
                    {showAllColumns && <td className="px-2 py-2 text-sm text-gray-500 max-w-[80px] truncate">{bug.device || '-'}</td>}
                    {showAllColumns && (
                      <td className="px-2 py-2 text-sm text-gray-500 max-w-[80px] truncate">
                      {bug.screenshotUrl ? (
                        <a href={bug.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a>
                      ) : (
                        '-')
                      }
                    </td>
                    )}
                    <td className="px-2 py-2 text-sm text-gray-500">{new Date(bug.createdAt).toLocaleString()}</td>
                    <td className="px-2 py-2 text-sm max-w-[160px] truncate">
                      {(!bug.status || bug.status === 'open') && (
                        <div className="flex gap-2">
                          <Button
                            variant="info"
                            size="sm"
                            className="bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium shadow"
                            onClick={async () => {
                              await fetch(`/api/admin/bug-reports`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: bug.id, status: 'resolved' }),
                              });
                              fetchBugReports();
                            }}
                          >
                            Mark as Fixed
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium shadow"
                            onClick={async () => {
                              await fetch(`/api/admin/bug-reports`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: bug.id, status: 'rejected' }),
                              });
                              fetchBugReports();
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
        )}
      </div>
    </div>
  );
} 
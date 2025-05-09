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
  restaurant?: {
    name: string;
    address?: string;
  };
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        <div className="flex items-center mb-4">
          <Button variant="neutral" onClick={() => router.push('/admin')} className="inline-block px-4 py-2 text-sm font-medium">Back to Dashboard</Button>
        </div>
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
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[120px] truncate">Restaurant ID</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[160px] truncate">Restaurant Name</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[180px] truncate">Reason</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[100px] truncate">Status</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[140px] truncate">Created</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td className="px-2 py-2 text-sm text-gray-500 truncate max-w-[120px]" title={report.restaurantId}>{report.restaurantId}</td>
                      <td className="px-2 py-2 text-sm text-gray-900 truncate max-w-[160px]" title={report.restaurant?.name}>{report.restaurant?.name || '-'}</td>
                      <td className="px-2 py-2 text-sm text-gray-500 truncate max-w-[180px]" title={report.details}>{report.details}</td>
                      <td className="px-2 py-2 text-sm text-gray-500 truncate max-w-[100px] uppercase">{report.status}</td>
                      <td className="px-2 py-2 text-sm text-gray-500 truncate max-w-[140px]">{new Date(report.createdAt).toLocaleString()}</td>
                      <td className="px-2 py-2 text-sm sticky right-0 bg-white z-10">
                        {report.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              variant="info"
                              size="sm"
                              className="bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium shadow"
                              onClick={async () => {
                                await fetch(`/api/admin/reports?id=${report.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'resolved' }),
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
                                await fetch(`/api/admin/reports?id=${report.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'rejected' }),
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
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";

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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchReports();
    }
  }, [status, router]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/admin/reports");
      if (!response.ok) throw new Error("Failed to fetch reports");
      const data = await response.json();
      setReports(data);
    } catch (error) {
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!session?.user?.email || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-xl text-red-600">Access Denied</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-4">
          <a
            href="/admin"
            className="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm font-medium shadow"
          >
            Back to Dashboard
          </a>
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
                            <button
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium shadow"
                              onClick={async () => {
                                await fetch(`/api/admin/reports?id=${report.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'resolved', resolvedBy: session?.user?.email }),
                                });
                                fetchReports();
                              }}
                            >
                              Mark as Fixed
                            </button>
                            <button
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium shadow"
                              onClick={async () => {
                                await fetch(`/api/admin/reports?id=${report.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'rejected', resolvedBy: session?.user?.email }),
                                });
                                fetchReports();
                              }}
                            >
                              Reject
                            </button>
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
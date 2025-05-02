"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
}

export default function AdminBugReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchBugReports();
    }
  }, [status, router]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchBugReports = async () => {
    try {
      const response = await fetch("/api/admin/bug-reports");
      if (!response.ok) throw new Error("Failed to fetch bug reports");
      const data = await response.json();
      setBugReports(data);
    } catch (error) {
      setBugReports([]);
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-4">
          <a
            href="/admin"
            className="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm font-medium shadow"
          >
            Back to Dashboard
          </a>
        </div>
        <div className="mb-8 flex justify-center">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Bug Reports</h2>
        </div>
        {bugReports.length === 0 ? (
          <div className="text-gray-600">No bug reports found.</div>
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Browser</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Screenshot</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bugReports.map((bug) => (
                  <tr key={bug.id}>
                    <td className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate" title={bug.title}>{bug.title}</td>
                    <td className="px-4 py-2 text-sm text-gray-500 max-w-xs truncate" title={bug.description}>{bug.description}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{bug.email || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{bug.browser || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{bug.device || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {bug.screenshotUrl ? (
                        <a href={bug.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a>
                      ) : (
                        '-')
                      }
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">{new Date(bug.createdAt).toLocaleString()}</td>
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
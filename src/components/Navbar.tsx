'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import BugReportModal from '@/components/BugReportModal';

export default function Navbar() {
  const router = useRouter();
  const [showBugReportModal, setShowBugReportModal] = useState(false);

  return (
    <>
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => {
                router.push('/');
                window.location.reload();
              }}
              className="flex items-start gap-2 w-fit hover:opacity-80 transition-opacity cursor-pointer"
              data-testid="logo-home-link"
            >
              <div className="relative w-10 h-10">
                <Image
                  src="/images/logo.svg"
                  alt="Halal Bites ATL Logo"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 768px) 40px, 40px"
                />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900">
                  Halal Bites ATL
                </h1>
                <p className="text-sm text-gray-600">
                  Discover the best halal restaurants & muslim-owned cafes in Atlanta
                </p>
              </div>
            </button>

            <button
              onClick={() => setShowBugReportModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 cursor-pointer"
              data-testid="report-issue-button"
            >
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Report Issue</span>
            </button>
          </div>
        </div>
      </nav>

      {showBugReportModal && (
        <BugReportModal
          isOpen={showBugReportModal}
          onClose={() => setShowBugReportModal(false)}
        />
      )}
    </>
  );
} 
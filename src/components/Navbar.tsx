'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ExclamationTriangleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import BugReportModal from '@/components/BugReportModal';
import DonationModal from '@/components/DonationModal';
import AddRestaurantForm from '@/components/AddRestaurantForm';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showBugReportModal, setShowBugReportModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showAddRestaurantForm, setShowAddRestaurantForm] = useState(false);

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                router.push('/');
                window.location.reload();
              }}
              className="flex items-center gap-2 sm:gap-3 w-fit hover:opacity-80 transition-opacity cursor-pointer group"
              data-testid="logo-home-link"
            >
              <div className="relative w-12 h-12 sm:w-14 sm:h-14">
                <Image
                  src="/images/logo-transparent.png"
                  alt="Halal Bites ATL Logo"
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-300"
                  priority
                  sizes="(max-width: 768px) 48px, 56px"
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 max-w-[160px] sm:max-w-[200px] text-left leading-tight">
                Discover the best halal restaurants & muslim-owned cafes in Atlanta
              </p>
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              {status === 'authenticated' && session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                <button
                  onClick={() => router.push('/admin')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-100 text-purple-700 rounded-xl text-sm font-medium hover:bg-purple-200 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-sm"
                >
                  Admin
                </button>
              )}
              <button
                onClick={() => setShowAddRestaurantForm(true)}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl text-sm font-medium hover:from-orange-500 hover:to-orange-600 transform transition-all duration-200 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-sm cursor-pointer"
                data-testid="add-restaurant-button"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Restaurant</span>
              </button>
              <button
                onClick={() => setShowDonationModal(true)}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-1.5 sm:px-4 py-1.5 sm:py-2.5 text-[11px] sm:text-sm font-medium rounded-xl bg-green-50 text-green-700 hover:bg-green-100 shadow-sm border border-green-200/50 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-200 hover:shadow-green-500/10 backdrop-blur-sm whitespace-nowrap"
                data-testid="donate-navbar-button"
              >
                Support Us ❤️
              </button>
              <button
                onClick={() => setShowBugReportModal(true)}
                className="flex items-center justify-center w-10 sm:w-auto gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-200"
                data-testid="report-issue-button"
                title="Report Issue"
              >
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Report Issue</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Add Restaurant Button for Mobile */}
      <button
        onClick={() => setShowAddRestaurantForm(true)}
        className="sm:hidden fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2.5 rounded-xl shadow-sm hover:shadow-orange-500/25 flex items-center gap-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 hover:from-orange-500 hover:to-orange-600 transform transition-all duration-200 ease-in-out hover:scale-[1.02]"
        data-testid="add-restaurant-floating-button"
      >
        <PlusIcon className="h-4 w-4" />
        <span>Add Restaurant</span>
      </button>

      {showBugReportModal && (
        <BugReportModal
          isOpen={showBugReportModal}
          onClose={() => setShowBugReportModal(false)}
        />
      )}

      {showDonationModal && (
        <DonationModal
          isOpen={showDonationModal}
          onClose={() => {
            setShowDonationModal(false);
            toast.success('Thank you for supporting Halal Bites ATL!');
          }}
        />
      )}

      {showAddRestaurantForm && (
        <AddRestaurantForm
          isOpen={showAddRestaurantForm}
          onClose={() => setShowAddRestaurantForm(false)}
          onRestaurantAdded={() => {
            setShowAddRestaurantForm(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
} 
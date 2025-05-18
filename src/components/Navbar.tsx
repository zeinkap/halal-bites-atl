'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ExclamationTriangleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import BugReportModal from '@/components/BugReportModal';
import DonationModal from '@/components/DonationModal';
import AddRestaurantForm from '@/components/AddRestaurantForm';
import { toast } from 'react-hot-toast';
import { Button } from './ui/Button';

interface NavbarProps {
  showBanner?: boolean;
}

export default function Navbar({ showBanner = false }: NavbarProps) {
  const router = useRouter();
  const [showBugReportModal, setShowBugReportModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showAddRestaurantForm, setShowAddRestaurantForm] = useState(false);

  return (
    <>
      <nav className={`bg-orange-50 backdrop-blur-sm shadow-sm sticky ${showBanner ? 'top-[52px]' : 'top-0'} z-40`}>
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex justify-between items-center">
            <Button
              onClick={() => {
                localStorage.removeItem('halal-atl-radius-miles');
                router.push('/');
                window.location.reload();
              }}
              className="flex items-center gap-2 sm:gap-3 w-fit hover:opacity-80 transition-opacity cursor-pointer group"
              data-testid="logo-home-link"
              variant="neutral"
              size="icon"
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
              <p className="text-xs sm:text-sm text-gray-600 max-w-[160px] sm:max-w-[200px] text-left leading-tight font-normal">
                Discover the best halal restaurants & cafes in Atlanta
              </p>
            </Button>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* If session-based logic is needed, use your custom admin authentication instead */}
              <Button
                onClick={() => setShowAddRestaurantForm(true)}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
                data-testid="add-restaurant-button"
                variant="primary"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Restaurant</span>
              </Button>
              <Button
                onClick={() => setShowDonationModal(true)}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer focus:outline-none whitespace-nowrap bg-gradient-to-r from-pink-400 via-rose-400 to-amber-400 text-white hover:to-amber-500"
                data-testid="donate-navbar-button"
                size="sm"
              >
                <HeartIcon className="h-5 w-5 text-red-500 mr-1 sm:mr-0" />
                <span className="hidden sm:inline">Support Us</span>
              </Button>
              <Button
                onClick={() => setShowBugReportModal(true)}
                className="flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer focus:outline-none bg-gradient-to-r from-rose-400 to-rose-600 text-white hover:to-rose-700"
                data-testid="report-issue-button"
                title="Report Issue"
                size="sm"
                aria-label="Report Issue"
              >
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Report Issue</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Add Restaurant Button for Mobile */}
      <Button
        onClick={() => setShowAddRestaurantForm(true)}
        className="sm:hidden fixed bottom-6 right-6 z-50 shadow-md flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:to-orange-700"
        data-testid="add-restaurant-floating-button"
        size="icon"
        aria-label="Add Restaurant"
        title="Add Restaurant"
      >
        <PlusIcon className="h-6 w-6" />
        <span className="sr-only">Add Restaurant</span>
      </Button>

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
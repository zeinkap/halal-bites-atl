'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ExclamationTriangleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import BugReportModal from '@/components/modals/BugReportModal/index';
import DonationModal from '@/components/modals/DonationModal/index';
import AddRestaurantForm from '@/components/modals/AddRestaurantForm/index';
import { toast } from 'react-hot-toast';
import { Button } from '../ui/Button';

interface NavbarProps {
  showBanner?: boolean;
}

export default function Navbar({ showBanner = false }: NavbarProps) {
  const router = useRouter();
  const [showBugReportModal, setShowBugReportModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showAddRestaurantForm, setShowAddRestaurantForm] = useState(false);

  const handleHomeClick = () => {
    localStorage.removeItem('halal-atl-radius-miles');
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <nav 
        className={`bg-orange-50/95 backdrop-blur-md shadow-sm sticky ${showBanner ? 'top-[52px]' : 'top-0'} z-40 border-b border-orange-100/50`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-4 py-3">
            {/* Logo and Tagline */}
            <button
              onClick={handleHomeClick}
              className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0 hover:opacity-80 transition-opacity group focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-lg p-1 -m-1"
              data-testid="logo-home-link"
              aria-label="Halal Bites ATL - Go to homepage"
            >
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex-shrink-0">
                <Image
                  src="/images/logo-transparent.png"
                  alt="Halal Bites ATL Logo"
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-300"
                  priority
                  sizes="(max-width: 640px) 40px, (max-width: 1024px) 48px, 56px"
                />
              </div>
              <p className="hidden min-[375px]:block text-xs sm:text-sm lg:text-base text-gray-700 max-w-[140px] sm:max-w-[180px] lg:max-w-[220px] text-left leading-tight font-medium">
                Discover the best halal restaurants & cafes in Atlanta
              </p>
            </button>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
              {/* Add Restaurant Button - Desktop only */}
              <Button
                onClick={() => setShowAddRestaurantForm(true)}
                className="hidden md:inline-flex items-center gap-2"
                data-testid="add-restaurant-button"
                variant="primary"
                size="md"
                aria-label="Add a new restaurant"
              >
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                <span>Add Restaurant</span>
              </Button>

              {/* Support Us Button */}
              <Button
                onClick={() => setShowDonationModal(true)}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap bg-gradient-to-r from-pink-400 via-rose-400 to-amber-400 text-white hover:from-pink-500 hover:via-rose-500 hover:to-amber-500 focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
                data-testid="donate-navbar-button"
                size="sm"
                aria-label="Support Halal Bites ATL"
              >
                <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" aria-hidden="true" />
                <span className="hidden sm:inline">Support Us</span>
              </Button>

              {/* Report Issue Button */}
              <Button
                onClick={() => setShowBugReportModal(true)}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap bg-gradient-to-r from-rose-400 to-rose-600 text-white hover:from-rose-500 hover:to-rose-700 focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
                data-testid="report-issue-button"
                size="sm"
                aria-label="Report an issue"
                title="Report Issue"
              >
                <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                <span className="hidden sm:inline">Report Issue</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Add Restaurant Button for Mobile */}
      <Button
        onClick={() => setShowAddRestaurantForm(true)}
        className="md:hidden fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 shadow-lg hover:shadow-xl flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-full w-12 h-12 sm:w-14 sm:h-14 transition-all duration-200"
        data-testid="add-restaurant-floating-button"
        size="icon"
        aria-label="Add a new restaurant"
        title="Add Restaurant"
      >
        <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
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
            router.refresh();
          }}
        />
      )}
    </>
  );
} 
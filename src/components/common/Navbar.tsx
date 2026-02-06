'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ExclamationTriangleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import BugReportModal from '@/components/modals/BugReportModal/index';
import DonationModal from '@/components/modals/DonationModal/index';
import { toast } from 'react-hot-toast';
import { Button } from '../ui/Button';

const AddRestaurantForm = dynamic(
  () => import('@/components/modals/AddRestaurantForm/index'),
  { ssr: false, loading: () => null }
);

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
    window.location.href = '/';
  };

  return (
    <>
      <nav
        className={`bg-white/80 backdrop-blur-xl border-b border-stone-200/80 sticky ${showBanner ? 'top-[52px]' : 'top-0'} z-40 shadow-soft`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-4 py-3.5">
            <button
              onClick={handleHomeClick}
              className="flex items-center gap-3 sm:gap-4 flex-shrink-0 rounded-xl px-2 py-1.5 -ml-2 hover:bg-stone-50 active:bg-stone-100 transition-colors group focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              data-testid="logo-home-link"
              aria-label="Halal Bites ATL - Go to homepage"
            >
              {/* Logo mark: icon or image */}
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-teal-100 to-teal-200 shadow-md ring-1 ring-stone-200/80 flex items-center justify-center">
                <Image
                  src="/images/logo-transparent.png"
                  alt=""
                  fill
                  className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                  priority
                  sizes="48px"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const next = target.nextElementSibling as HTMLElement | null;
                    if (next) next.style.display = 'flex';
                  }}
                />
                <span className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-teal-200 to-teal-300 text-teal-800 text-lg sm:text-xl font-bold" aria-hidden="true">
                  HB
                </span>
              </div>
              {/* Wordmark + tagline */}
              <div className="hidden min-[380px]:block text-left min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-bold text-stone-900 text-lg sm:text-xl tracking-tight leading-none group-hover:text-teal-700 transition-colors">
                    Halal Bites
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-700 text-xs sm:text-sm font-bold tracking-wide uppercase">
                    ATL
                  </span>
                </div>
                <span className="block mt-1 text-xs sm:text-sm text-stone-500 font-medium">
                  Restaurants &amp; cafes in Atlanta
                </span>
              </div>
            </button>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Button
                onClick={() => setShowAddRestaurantForm(true)}
                className="hidden md:inline-flex items-center gap-2"
                data-testid="add-restaurant-button"
                variant="primary"
                size="md"
                aria-label="Add a new restaurant"
              >
                <PlusIcon className="h-4 w-4" aria-hidden="true" />
                <span>Add Restaurant</span>
              </Button>

              <Button
                onClick={() => setShowDonationModal(true)}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap"
                data-testid="donate-navbar-button"
                variant="donate"
                size="sm"
                aria-label="Support Halal Bites ATL"
              >
                <HeartIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
                <span className="hidden sm:inline">Support Us</span>
              </Button>

              <Button
                onClick={() => setShowBugReportModal(true)}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap"
                data-testid="report-issue-button"
                variant="outline"
                size="sm"
                aria-label="Report an issue"
                title="Report Issue"
              >
                <ExclamationTriangleIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
                <span className="hidden sm:inline">Report Issue</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <Button
        onClick={() => setShowAddRestaurantForm(true)}
        className="md:hidden fixed z-50 shadow-soft-lg rounded-full w-14 h-14 min-w-[3.5rem] min-h-[3.5rem] flex items-center justify-center right-5"
        style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
        data-testid="add-restaurant-floating-button"
        size="icon"
        variant="primary"
        aria-label="Add a new restaurant"
        title="Add Restaurant"
      >
        <PlusIcon className="h-6 w-6" aria-hidden="true" />
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

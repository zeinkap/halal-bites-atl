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
        className={`bg-white/90 backdrop-blur-xl border-b border-teal-100/80 sticky ${showBanner ? 'top-[52px]' : 'top-0'} z-40 shadow-soft`}
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
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-stone-900 text-lg sm:text-xl tracking-tight leading-none group-hover:text-teal-700 transition-colors">
                    Halal Bites
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] sm:text-xs font-bold tracking-widest uppercase">
                    ATL
                  </span>
                </div>
                <span className="block mt-0.5 text-[11px] sm:text-xs text-stone-400 font-medium tracking-wide">
                  Atlanta&apos;s Halal Dining Guide
                </span>
              </div>
            </button>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Add Restaurant — desktop only; mobile uses the FAB */}
              <button
                onClick={() => setShowAddRestaurantForm(true)}
                className="hidden md:inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm transition-all duration-150 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 whitespace-nowrap"
                data-testid="add-restaurant-button"
                aria-label="Add a new restaurant"
              >
                <PlusIcon className="h-4 w-4" aria-hidden="true" />
                <span>Add Restaurant</span>
              </button>

              {/* Support Us — soft rose pill, secondary priority */}
              <button
                onClick={() => setShowDonationModal(true)}
                className="inline-flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-600 text-sm font-semibold px-3 sm:px-4 py-2 rounded-full border border-rose-200 hover:border-rose-300 transition-all duration-150 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 whitespace-nowrap"
                data-testid="donate-navbar-button"
                aria-label="Support Halal Bites ATL"
              >
                <HeartIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Support Us</span>
              </button>

              {/* Report Issue — ghost / tertiary, barely visible until hovered */}
              <button
                onClick={() => setShowBugReportModal(true)}
                className="inline-flex items-center justify-center gap-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 active:bg-stone-200 text-sm font-medium px-2.5 sm:px-3.5 py-2 rounded-full transition-all duration-150 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-2 whitespace-nowrap"
                data-testid="report-issue-button"
                aria-label="Report an issue"
                title="Report Issue"
              >
                <ExclamationTriangleIcon className="h-[18px] w-[18px] flex-shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Report</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile FAB — fixed bottom-right, primary teal pill */}
      <button
        onClick={() => setShowAddRestaurantForm(true)}
        className="md:hidden fixed z-50 right-5 w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-lg flex items-center justify-center transition-all duration-150 active:scale-[0.95] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom, 1.25rem))" }}
        data-testid="add-restaurant-floating-button"
        aria-label="Add a new restaurant"
        title="Add Restaurant"
      >
        <PlusIcon className="h-6 w-6" aria-hidden="true" />
        <span className="sr-only">Add Restaurant</span>
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
            router.refresh();
          }}
        />
      )}
    </>
  );
}

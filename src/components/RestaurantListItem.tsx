import { Restaurant } from '@/types';
import { MapPinIcon, HomeModernIcon, HeartIcon, ChatBubbleLeftIcon, BeakerIcon, FlagIcon } from '@heroicons/react/24/solid';
import { useState, lazy, Suspense } from 'react';
import Image from 'next/image';

// Lazy load modals
const CommentModal = lazy(() => import('./CommentModal'));
const ReportModal = lazy(() => import('./ReportModal'));

interface RestaurantListItemProps {
  restaurant: Restaurant;
}

const formatCuisine = (cuisine: string) => {
  return cuisine.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
};

const formatPriceRange = (priceRange: string) => {
  switch (priceRange) {
    case 'LOW': return '$';
    case 'MEDIUM': return '$$';
    case 'HIGH': return '$$$';
    default: return priceRange;
  }
};

const WineGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M12 2C13.1 2 14 2.9 14 4V7.5C14 9.43 12.43 11 10.5 11H10V13C10 14.1 10.9 15 12 15C13.1 15 14 14.1 14 13V11H13.5C11.57 11 10 9.43 10 7.5V4C10 2.9 10.9 2 12 2ZM7 4V7.5C7 10.54 9.46 13 12.5 13C15.54 13 18 10.54 18 7.5V4C18 2.9 17.1 2 16 2H8C6.9 2 6 2.9 6 4V7.5C6 10.54 8.46 13 11.5 13C14.54 13 17 10.54 17 7.5V4C17 2.9 16.1 2 15 2H9C7.9 2 7 2.9 7 4ZM12 17C10.34 17 9 18.34 9 20H15C15 18.34 13.66 17 12 17Z" />
  </svg>
);

const HighChairIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <rect x="7" y="2" width="10" height="4" rx="2" className="fill-yellow-400" />
    <rect x="9" y="6" width="6" height="8" rx="2" className="fill-yellow-300" />
    <rect x="8" y="14" width="2" height="6" className="fill-yellow-600" />
    <rect x="14" y="14" width="2" height="6" className="fill-yellow-600" />
    <rect x="11" y="14" width="2" height="4" className="fill-yellow-500" />
  </svg>
);

const HalalBadgeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
    <circle cx="16" cy="16" r="15" fill="#34D399" stroke="#059669" strokeWidth="2"/>
    <text x="16" y="21" textAnchor="middle" fontSize="14" fontFamily="Arial, sans-serif" fill="white" fontWeight="bold">حلال</text>
  </svg>
);

const PartiallyHalalBadgeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
    <defs>
      <linearGradient id="half" x1="0" y1="0" x2="32" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="50%" stopColor="#34D399" />
        <stop offset="50%" stopColor="#D1D5DB" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="15" fill="url(#half)" stroke="#059669" strokeWidth="2"/>
    <text x="16" y="21" textAnchor="middle" fontSize="14" fontFamily="Arial, sans-serif" fill="#059669" fontWeight="bold">حلال</text>
  </svg>
);

const OutdoorSeatingIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
    <ellipse cx="16" cy="10" rx="10" ry="4" fill="#FBBF24" />
    <rect x="15" y="10" width="2" height="10" fill="#A3A3A3" />
    <rect x="10" y="20" width="12" height="2" rx="1" fill="#6B7280" />
    <rect x="12" y="22" width="2" height="4" rx="1" fill="#6B7280" />
    <rect x="18" y="22" width="2" height="4" rx="1" fill="#6B7280" />
  </svg>
);

export default function RestaurantListItem({ restaurant }: RestaurantListItemProps) {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [localRestaurant, setLocalRestaurant] = useState(restaurant);

  const handleCommentAdded = async () => {
    try {
      const response = await fetch(`/api/restaurants`);
      if (!response.ok) throw new Error('Failed to fetch restaurant');
      const restaurants = await response.json();
      const updatedRestaurant = restaurants.find((r: Restaurant) => r.id === localRestaurant.id);
      if (updatedRestaurant) {
        setLocalRestaurant(updatedRestaurant);
      }
    } catch (error) {
      console.error('Error refreshing restaurant data:', error);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
        <div 
          className="cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          data-testid={`restaurant-item-${localRestaurant.id}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start">
            {/* Restaurant Image */}
            <div className="relative w-full h-48 sm:w-40 sm:h-40 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100">
              <Image
                src={localRestaurant.imageUrl || '/images/logo.png'}
                alt={localRestaurant.name}
                fill
                className="object-contain sm:object-cover p-4 sm:p-0"
                sizes="(max-width: 768px) 100vw, 25vw"
                priority={true}
                quality={85}
              />
            </div>

            <div className="flex-1 p-4 sm:p-5 space-y-3">
              {/* Header Section */}
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-gray-900" data-testid={`restaurant-name-${localRestaurant.id}`}>
                  {localRestaurant.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"
                    data-testid={`restaurant-cuisine-${localRestaurant.id}`}
                  >
                    {formatCuisine(localRestaurant.cuisineType)}
                  </span>
                  <span
                    className={
                      localRestaurant.priceRange === 'LOW'
                        ? 'px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800'
                        : localRestaurant.priceRange === 'MEDIUM'
                        ? 'px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800'
                        : 'px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800'
                    }
                    data-testid={`restaurant-price-${localRestaurant.id}`}
                  >
                    {formatPriceRange(localRestaurant.priceRange)}
                  </span>
                </div>
              </div>
              
              {/* Address Section */}
              <div className="flex items-start gap-2">
                <MapPinIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600 line-clamp-2" data-testid={`restaurant-address-${localRestaurant.id}`}>
                  {localRestaurant.address}
                </p>
              </div>

              {/* Description Section */}
              {localRestaurant.description && (
                <p className="text-sm text-gray-700 line-clamp-2 sm:line-clamp-none leading-relaxed border-t border-gray-100 pt-3" data-testid={`restaurant-description-${localRestaurant.id}`}> 
                  {localRestaurant.description}
                </p>
              )}

              {/* Quick Features */}
              <div className="flex flex-wrap gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                {localRestaurant.hasPrayerRoom && (
                  <div className="flex items-center gap-1">
                    <HomeModernIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Prayer Space</span>
                  </div>
                )}
                {localRestaurant.isZabiha && (localRestaurant.zabihaChicken || localRestaurant.zabihaLamb || localRestaurant.zabihaBeef || localRestaurant.zabihaGoat) && (
                  <div className="bg-orange-50 rounded-lg p-3 space-y-1.5 mt-2 w-full">
                    <div className="flex items-center gap-1.5">
                      <HeartIcon className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">Zabiha Status:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {localRestaurant.zabihaChicken && (
                        <span className="text-xs bg-white text-orange-700 px-2 py-0.5 rounded-full">✓ Chicken</span>
                      )}
                      {localRestaurant.zabihaLamb && (
                        <span className="text-xs bg-white text-orange-700 px-2 py-0.5 rounded-full">✓ Lamb</span>
                      )}
                      {localRestaurant.zabihaBeef && (
                        <span className="text-xs bg-white text-orange-700 px-2 py-0.5 rounded-full">✓ Beef</span>
                      )}
                      {localRestaurant.zabihaGoat && (
                        <span className="text-xs bg-white text-orange-700 px-2 py-0.5 rounded-full">✓ Goat</span>
                      )}
                    </div>
                      {localRestaurant.zabihaVerified && (
                      <div className="text-xs text-orange-700">
                          Verified: {new Date(localRestaurant.zabihaVerified).toLocaleDateString()}
                          {localRestaurant.zabihaVerifiedBy && (
                          <div className="text-xs text-orange-600">
                              By: {localRestaurant.zabihaVerifiedBy}
                          </div>
                      )}
                    </div>
                    )}
                  </div>
                )}
                {localRestaurant.hasOutdoorSeating && (
                  <div className="flex items-center gap-1">
                    <OutdoorSeatingIcon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Outdoor Seating</span>
                  </div>
                )}
                {localRestaurant.hasHighChair && (
                  <div className="flex items-center gap-1">
                    <HighChairIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">High Chairs</span>
                  </div>
                )}
                {localRestaurant.servesAlcohol ? (
                  <div className="flex items-center gap-1 bg-pink-100 px-2 py-1 rounded-full">
                    <WineGlassIcon className="h-4 w-4 text-pink-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-pink-700 font-semibold whitespace-nowrap" data-testid={`restaurant-alcohol-${localRestaurant.id}`}>
                      Serves Alcohol
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <WineGlassIcon className="h-4 w-4 text-pink-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap" data-testid={`restaurant-alcohol-${localRestaurant.id}`}>No Alcohol</span>
                  </div>
                )}
                {localRestaurant.isFullyHalal && (
                  <div className="flex items-center gap-1">
                    <HalalBadgeIcon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Fully Halal</span>
                  </div>
                )}
                {localRestaurant.isPartiallyHalal && (
                  <div className="flex items-center gap-1">
                    <PartiallyHalalBadgeIcon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Partially Halal</span>
                  </div>
                )}
                {/* Partially Halal Details (always show if present) */}
                {localRestaurant.isPartiallyHalal && (localRestaurant.partiallyHalalChicken || localRestaurant.partiallyHalalLamb || localRestaurant.partiallyHalalBeef || localRestaurant.partiallyHalalGoat) && (
                  <div className="bg-yellow-50 rounded-lg p-3 space-y-1.5 mt-2 w-full">
                    <div className="flex items-center gap-1.5">
                      <BeakerIcon className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-600">Partially Halal:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {localRestaurant.partiallyHalalChicken && (
                        <span className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded-full">✓ Chicken</span>
                      )}
                      {localRestaurant.partiallyHalalLamb && (
                        <span className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded-full">✓ Lamb</span>
                      )}
                      {localRestaurant.partiallyHalalBeef && (
                        <span className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded-full">✓ Beef</span>
                      )}
                      {localRestaurant.partiallyHalalGoat && (
                        <span className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded-full">✓ Goat</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex sm:flex-col gap-2 p-4 border-t sm:border-t-0 sm:border-l border-gray-100 bg-gray-50 sm:bg-white">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCommentModalOpen(true);
                }}
                className="flex-1 sm:flex-initial p-2 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-900 transition-colors cursor-pointer rounded-lg border border-blue-200 relative shadow-sm"
                title="Comments"
                data-testid={`restaurant-comment-icon-${localRestaurant.id}`}
              >
                <ChatBubbleLeftIcon className="h-6 w-6 mx-auto" />
                {localRestaurant.commentCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {localRestaurant.commentCount}
                  </span>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsReportModalOpen(true);
                }}
                className="flex-1 sm:flex-initial p-2 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-900 transition-colors cursor-pointer rounded-lg border border-red-200 shadow-sm"
                title="Report Issue"
                data-testid={`restaurant-report-icon-${localRestaurant.id}`}
              >
                <FlagIcon className="h-6 w-6 mx-auto" />
              </button>
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="border-t border-gray-100 bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${localRestaurant.name} ${localRestaurant.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 text-center shadow-sm flex items-center justify-center gap-2"
                >
                  {/* Improved Google Maps pin SVG, visible on all screens */}
                  <span className="inline-flex">
                    <svg className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#4285F4"/>
                      <circle cx="12" cy="9" r="2.5" fill="#fff"/>
                    </svg>
                  </span>
                  View on Google Maps
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(localRestaurant.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-slate-400 to-slate-500 text-white rounded-lg text-sm font-medium hover:from-slate-500 hover:to-slate-600 transition-all duration-200 text-center shadow-sm flex items-center justify-center gap-2"
                >
                  {/* Custom directions/navigation SVG icon */}
                  <span className="inline-flex">
                    <svg className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="#fff"/>
                    </svg>
                  </span>
                  Get Directions
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        {isCommentModalOpen && (
          <CommentModal
            isOpen={isCommentModalOpen}
            onClose={() => setIsCommentModalOpen(false)}
            restaurantId={localRestaurant.id}
            restaurantName={localRestaurant.name}
            onCommentAdded={handleCommentAdded}
          />
        )}

        {isReportModalOpen && (
          <ReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            restaurantId={localRestaurant.id}
            restaurantName={localRestaurant.name}
          />
        )}
      </Suspense>
    </>
  );
} 

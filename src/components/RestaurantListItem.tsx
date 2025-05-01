import { Restaurant } from '@/types';
import { MapPinIcon, HomeModernIcon, SunIcon, HeartIcon, UserGroupIcon, ChatBubbleLeftIcon, BeakerIcon, CheckBadgeIcon, FlagIcon } from '@heroicons/react/24/solid';
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
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600" data-testid={`restaurant-price-${localRestaurant.id}`}>
                    {formatPriceRange(localRestaurant.priceRange)}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600" data-testid={`restaurant-cuisine-${localRestaurant.id}`}>
                    {formatCuisine(localRestaurant.cuisineType)}
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
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <HeartIcon className="h-4 w-4 text-red-600" />
                      <span className="text-xs font-semibold text-gray-600">Zabiha Status:</span>
                    </div>
                    <div className="ml-5 flex flex-col gap-1">
                      {localRestaurant.zabihaChicken && (
                        <span className="text-xs text-gray-600">✓ Chicken</span>
                      )}
                      {localRestaurant.zabihaLamb && (
                        <span className="text-xs text-gray-600">✓ Lamb</span>
                      )}
                      {localRestaurant.zabihaBeef && (
                        <span className="text-xs text-gray-600">✓ Beef</span>
                      )}
                      {localRestaurant.zabihaGoat && (
                        <span className="text-xs text-gray-600">✓ Goat</span>
                      )}
                      {localRestaurant.zabihaVerified && (
                        <span className="text-xs text-gray-500 italic">
                          Verified: {new Date(localRestaurant.zabihaVerified).toLocaleDateString()}
                          {localRestaurant.zabihaVerifiedBy && (
                            <span className="block text-xs text-gray-500">
                              By: {localRestaurant.zabihaVerifiedBy}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {localRestaurant.hasOutdoorSeating && (
                  <div className="flex items-center gap-1">
                    <SunIcon className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Outdoor</span>
                  </div>
                )}
                {localRestaurant.hasHighChair && (
                  <div className="flex items-center gap-1">
                    <UserGroupIcon className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">High Chairs</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <BeakerIcon className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap" data-testid={`restaurant-alcohol-${localRestaurant.id}`}>
                    {localRestaurant.servesAlcohol ? 'Serves Alcohol' : 'No Alcohol'}
                  </span>
                </div>
                {localRestaurant.isFullyHalal && (
                  <div className="flex items-center gap-1">
                    <CheckBadgeIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Fully Halal</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex sm:flex-col gap-2 p-4 border-t sm:border-t-0 sm:border-l border-gray-100 bg-gray-50 sm:bg-white">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${localRestaurant.name} ${localRestaurant.address}`
                    )}`,
                    '_blank'
                  );
                }}
                className="flex-1 sm:flex-initial p-2 text-gray-600 hover:text-green-600 transition-colors cursor-pointer rounded-lg hover:bg-white sm:hover:bg-green-50 border border-gray-200"
                title="View on Maps"
                data-testid={`restaurant-map-icon-${localRestaurant.id}`}
              >
                <MapPinIcon className="h-5 w-5 mx-auto" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCommentModalOpen(true);
                }}
                className="flex-1 sm:flex-initial p-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer rounded-lg hover:bg-white sm:hover:bg-blue-50 border border-gray-200 relative"
                title="Comments"
                data-testid={`restaurant-comment-icon-${localRestaurant.id}`}
              >
                <ChatBubbleLeftIcon className="h-5 w-5 mx-auto" />
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
                className="flex-1 sm:flex-initial p-2 text-gray-600 hover:text-red-600 transition-colors cursor-pointer rounded-lg hover:bg-white sm:hover:bg-red-50 border border-gray-200"
                title="Report Issue"
                data-testid={`restaurant-report-icon-${localRestaurant.id}`}
              >
                <FlagIcon className="h-5 w-5 mx-auto" />
              </button>
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="border-t border-gray-100 bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${localRestaurant.name} ${localRestaurant.address}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 text-center shadow-sm"
                >
                  View on Maps
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${localRestaurant.name} ${localRestaurant.address}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-slate-400 to-slate-500 text-white rounded-lg text-sm font-medium hover:from-slate-500 hover:to-slate-600 transition-all duration-200 text-center shadow-sm"
                >
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
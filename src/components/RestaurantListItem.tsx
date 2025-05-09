import { Restaurant } from '@/types';
import { MapPinIcon, HomeModernIcon, HeartIcon, ChatBubbleLeftIcon, BeakerIcon, FlagIcon } from '@heroicons/react/24/solid';
import { useState, lazy, Suspense } from 'react';
import Image from 'next/image';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { WineGlassIcon, HighChairIcon, HalalBadgeIcon, PartiallyHalalBadgeIcon, OutdoorSeatingIcon } from './ui/icons';
import { Button } from './ui/Button';

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
      <Card hoverable>
        <div 
          className="cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          data-testid={`restaurant-item-${localRestaurant.id}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start">
            {/* Restaurant Image */}
            <div className="relative w-full h-32 sm:w-40 sm:h-40 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100">
              <Image
                src={localRestaurant.imageUrl || '/images/logo.png'}
                alt={localRestaurant.name}
                fill
                className="object-contain sm:object-cover p-2 sm:p-0"
                sizes="(max-width: 768px) 100vw, 25vw"
                priority={true}
                quality={85}
              />
            </div>

            <div className="flex-1 p-2 sm:p-5 space-y-2 sm:space-y-3">
              {/* Header Section */}
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900" data-testid={`restaurant-name-${localRestaurant.id}`}>
                  {localRestaurant.name}
                </h3>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Badge color="blue" size="xs">{formatCuisine(localRestaurant.cuisineType)}</Badge>
                  <Badge color={
                      localRestaurant.priceRange === 'LOW'
                      ? 'green'
                        : localRestaurant.priceRange === 'MEDIUM'
                      ? 'yellow'
                      : 'orange'
                  } size="xs">{formatPriceRange(localRestaurant.priceRange)}</Badge>
                </div>
              </div>
              
              {/* Address Section */}
              <div className="flex items-start gap-1 sm:gap-2">
                <MapPinIcon className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2" data-testid={`restaurant-address-${localRestaurant.id}`}>
                  {localRestaurant.address}
                </p>
              </div>

              {/* Description Section */}
              {localRestaurant.description && (
                <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 sm:line-clamp-none leading-relaxed border-t border-gray-100 pt-2 sm:pt-3" data-testid={`restaurant-description-${localRestaurant.id}`}> 
                  {localRestaurant.description}
                </p>
              )}

              {/* Quick Features */}
              <div className="flex flex-wrap gap-1 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-100">
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
            <div className="flex sm:flex-col gap-2 sm:gap-3 p-2 sm:p-4 border-t sm:border-t-0 sm:border-l border-gray-100 bg-gray-50 sm:bg-white">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCommentModalOpen(true);
                }}
                size="sm"
                className="relative flex-1 sm:flex-initial p-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white hover:to-blue-600 transition-all duration-200"
                title="Comments"
                data-testid={`restaurant-comment-icon-${localRestaurant.id}`}
              >
                <ChatBubbleLeftIcon className="h-6 w-6 mx-auto" />
                {localRestaurant.commentCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-slate-200 text-slate-700 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {localRestaurant.commentCount}
                  </span>
                )}
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsReportModalOpen(true);
                }}
                size="sm"
                className="flex-1 sm:flex-initial p-2 bg-gradient-to-r from-rose-400 to-rose-600 text-white hover:to-rose-700 transition-all duration-200"
                title="Report Issue"
                data-testid={`restaurant-report-icon-${localRestaurant.id}`}
              >
                <FlagIcon className="h-6 w-6 mx-auto text-white" />
              </Button>
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
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-lg text-sm font-medium hover:to-emerald-800 transition-all duration-200 text-center shadow-sm flex items-center justify-center gap-2"
                >
                  <MapPinIcon className="h-5 w-5 mr-1 text-white" />
                  View on Google Maps
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(localRestaurant.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-slate-500 to-slate-700 text-white rounded-lg text-sm font-medium hover:to-slate-800 transition-all duration-200 text-center shadow-sm flex items-center justify-center gap-2"
                >
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

          {!isExpanded && (
            <div className="mt-2 text-xs text-gray-400 text-center select-none">
              Tap the card to view map & directions
            </div>
          )}
        </div>
      </Card>

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

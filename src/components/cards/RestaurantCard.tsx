import { Restaurant } from '@/types';
import React, { useState } from 'react';
import { MapPinIcon, HomeModernIcon, HeartIcon, ChatBubbleLeftIcon, BeakerIcon, FlagIcon, ArrowRightCircleIcon } from '@heroicons/react/24/solid';
import CommentModal from '../modals/CommentModal/index';
import ReportModal from '../modals/ReportModal';
import Image from 'next/image';
import { formatCuisineName } from '@/utils/formatCuisineName';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { WineGlassIcon, HighChairIcon, HalalBadgeIcon, PartiallyHalalBadgeIcon, OutdoorSeatingIcon } from '../ui/icons';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [localRestaurant, setLocalRestaurant] = useState(restaurant);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCommentAdded = async () => {
    try {
      const response = await fetch(`/api/restaurants`);
      if (!response.ok) throw new Error('Failed to fetch restaurant');
      const restaurants = await response.json();
      const updatedRestaurant = restaurants.find((r: Restaurant) => r.id === localRestaurant.id);
      if (updatedRestaurant) {
        setLocalRestaurant(updatedRestaurant);
      } else {
        // Restaurant no longer exists, refresh the page
        console.warn(`Restaurant ${localRestaurant.id} no longer exists in database`);
        if (confirm('This restaurant is no longer available. Would you like to refresh the page?')) {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error refreshing restaurant data:', error);
    }
  };

  const renderFeatureIcon = (condition: boolean, icon: React.ReactNode, label: string) => (
    <div 
      className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
        condition 
          ? 'text-green-700 bg-green-50' 
          : 'text-gray-500 bg-gray-50'
      }`}
      title={label}
    >
      {icon}
      <span className="inline text-xs font-medium">{label}</span>
    </div>
  );

  const isFallbackLogo =
    !localRestaurant.imageUrl ||
    localRestaurant.imageUrl.trim() === '' ||
    localRestaurant.imageUrl === '/images/logo.png';

  return (
    <>
      <Card hoverable onClick={() => setIsExpanded((prev) => !prev)} className="cursor-pointer overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Restaurant Image */}
          <div className="relative w-full h-40 sm:w-48 sm:h-48 border-b sm:border-b-0 sm:border-r border-gray-100 flex-shrink-0">
            <Image
              src={isFallbackLogo ? '/images/logo.png' : (localRestaurant.imageUrl as string)}
              alt={localRestaurant.name}
              fill
              className={isFallbackLogo ? 'object-contain sm:object-cover p-2' : 'object-cover'}
              sizes="(max-width: 768px) 100vw, 192px"
              priority={true}
              quality={85}
            />
          </div>
          <div className="flex-1 p-3 sm:p-4">
            <div className="space-y-2.5 sm:space-y-3">
              {/* Header & Address */}
              <div>
                <h3 className="text-lg sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-1 leading-tight" 
                  data-testid={`restaurant-name-${localRestaurant.id}`}>
                  {localRestaurant.name}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                  <Badge color={
                    localRestaurant.priceRange === 'LOW'
                      ? 'green'
                      : localRestaurant.priceRange === 'MEDIUM'
                      ? 'yellow'
                      : 'orange'
                  } className="text-xs">
                    {localRestaurant.priceRange === 'LOW'
                      ? '$'
                      : localRestaurant.priceRange === 'MEDIUM'
                      ? '$$'
                      : '$$$'}
                  </Badge>
                  <Badge color="blue" className="text-xs">
                    {formatCuisineName(localRestaurant.cuisineType)}
                  </Badge>
                </div>
                <div className="flex items-start gap-1.5 text-xs sm:text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="line-clamp-2 leading-relaxed" data-testid={`restaurant-address-${localRestaurant.id}`}>{localRestaurant.address}</p>
                </div>
              </div>
              {/* Description */}
              {localRestaurant.description && (
                <p className="text-sm sm:text-sm text-gray-600 line-clamp-2 leading-relaxed" data-testid={`restaurant-description-${localRestaurant.id}`}>{localRestaurant.description}</p>
              )}
              {/* Features */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1 sm:pt-2">
                {localRestaurant.hasPrayerRoom && renderFeatureIcon(
                  true,
                  <HomeModernIcon className="h-4 w-4" />,
                  'Prayer Space'
                )}
                {localRestaurant.hasOutdoorSeating && renderFeatureIcon(
                  true,
                  <OutdoorSeatingIcon className="h-5 w-5" />,
                  'Outdoor Seating'
                )}
                {(localRestaurant.isZabiha && (
                  localRestaurant.zabihaChicken ||
                  localRestaurant.zabihaLamb ||
                  localRestaurant.zabihaBeef ||
                  localRestaurant.zabihaGoat
                )) && renderFeatureIcon(
                  true,
                  <HeartIcon className="h-4 w-4" />,
                  'Zabihah (Hand-cut)'
                )}
                {localRestaurant.hasHighChair && renderFeatureIcon(
                  true,
                  <HighChairIcon className="h-4 w-4" />,
                  'High Chairs'
                )}
                {localRestaurant.servesAlcohol
                  ? (
                    <div className="flex items-center gap-1.5 text-pink-700 bg-pink-100 px-2 py-1 rounded-md font-semibold" title="Serves Alcohol">
                      <WineGlassIcon className="h-4 w-4 text-pink-600" />
                      <span className="inline text-xs">Serves Alcohol</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-2 py-1 rounded-md font-medium" title="No Alcohol">
                      <WineGlassIcon className="h-4 w-4 text-green-600" />
                      <span className="inline text-xs">No Alcohol</span>
                    </div>
                  )}
                {localRestaurant.isFullyHalal && renderFeatureIcon(
                  true,
                  <HalalBadgeIcon className="h-5 w-5" />,
                  'Fully Halal'
                )}
                {(localRestaurant.isPartiallyHalal && (
                  localRestaurant.partiallyHalalChicken ||
                  localRestaurant.partiallyHalalLamb ||
                  localRestaurant.partiallyHalalBeef ||
                  localRestaurant.partiallyHalalGoat
                )) && renderFeatureIcon(
                  true,
                  <PartiallyHalalBadgeIcon className="h-5 w-5" />,
                  'Partially Halal'
                )}
              </div>

              {/* Zabihah Details (always show if present) */}
                {localRestaurant.isZabiha && (localRestaurant.zabihaChicken || localRestaurant.zabihaLamb || localRestaurant.zabihaBeef || localRestaurant.zabihaGoat) && (
                <div className="bg-orange-50 rounded-lg p-3 sm:p-3 space-y-1.5 mt-2 border border-orange-100">
                    <div className="flex items-center gap-1.5">
                      <HeartIcon className="h-4 w-4" />
                      <span className="text-sm font-medium text-orange-900">Zabihah (Hand-cut) Status:</span>
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

                {/* Partially Halal Details (always show if present) */}
                {localRestaurant.isPartiallyHalal && (localRestaurant.partiallyHalalChicken || localRestaurant.partiallyHalalLamb || localRestaurant.partiallyHalalBeef || localRestaurant.partiallyHalalGoat) && (
                  <div className="bg-yellow-50 rounded-lg p-3 sm:p-3 space-y-1.5 mt-2 border border-yellow-100">
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

                {/* Action Buttons - only show map buttons when expanded, but always show comment/report */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 pt-3 sm:pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 sm:px-3 sm:py-1.5 text-white bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 relative w-full sm:w-auto text-sm sm:text-sm font-medium"
                    title="Add Comment"
                    onClick={e => { e.stopPropagation(); setIsCommentModalOpen(true); }}
                  >
                    <ChatBubbleLeftIcon className="h-4 w-4 sm:h-4 sm:w-4" />
                    <span>Add Comment</span>
                    {localRestaurant.commentCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-white text-blue-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border border-blue-200 shadow-sm">
                        {localRestaurant.commentCount}
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 sm:px-3 sm:py-1.5 text-white bg-gradient-to-r from-rose-400 to-red-600 hover:from-rose-500 hover:to-red-700 w-full sm:w-auto text-sm sm:text-sm font-medium"
                    title="Report Issue"
                    onClick={e => { e.stopPropagation(); setIsReportModalOpen(true); }}
                  >
                    <FlagIcon className="h-4 w-4 sm:h-4 sm:w-4" />
                    <span>Report Issue</span>
                  </Button>
                </div>
                {isExpanded && (
                  <div className="flex flex-wrap gap-2 pt-2 justify-center">
                    <Button
                      variant="info"
                      size="sm"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-white bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700"
                      title="View on Google Maps"
                      onClick={e => { e.stopPropagation(); window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${localRestaurant.name} ${localRestaurant.address}`)}`, '_blank'); }}
                    >
                      <MapPinIcon className="h-4 w-4" />
                      <span>View on Google Maps</span>
                    </Button>
                    <Button
                      variant="neutral"
                      size="sm"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700"
                      title="Get Directions"
                      onClick={e => { e.stopPropagation(); window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(localRestaurant.address)}`, '_blank'); }}
                    >
                      <ArrowRightCircleIcon className="h-5 w-5" />
                      <span>Get Directions</span>
                    </Button>
                  </div>
                )}
                {!isExpanded && (
                  <div className="mt-2 text-xs text-gray-400 text-center select-none">
                    Tap the card to view map & directions
                  </div>
                )}
            </div>
          </div>
        </div>
      </Card>

      {/* Comment Modal */}
      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        restaurantId={localRestaurant.id}
        restaurantName={localRestaurant.name}
        onCommentAdded={handleCommentAdded}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        restaurantId={localRestaurant.id}
        restaurantName={localRestaurant.name}
      />
    </>
  );
}
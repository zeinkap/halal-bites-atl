import { Restaurant } from '@/types';
import React, { useState } from 'react';
import { MapPinIcon, HomeModernIcon, HeartIcon, ChatBubbleLeftIcon, BeakerIcon, FlagIcon } from '@heroicons/react/24/solid';
import CommentModal from './CommentModal';
import ReportModal from './ReportModal';
import Image from 'next/image';
import { formatCuisineName } from '@/utils/formatCuisineName';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { WineGlassIcon, HighChairIcon, HalalBadgeIcon, PartiallyHalalBadgeIcon, OutdoorSeatingIcon } from './ui/icons';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
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

  const renderFeatureIcon = (condition: boolean, icon: React.ReactNode, label: string) => (
    <div 
      className={`flex items-center gap-1.5 ${
        condition 
          ? 'text-green-700' 
          : 'text-gray-500'
      }`}
      title={label}
    >
      {icon}
      <span className="hidden sm:inline text-xs">{label}</span>
    </div>
  );

  return (
    <>
      <Card hoverable>
          <div className="flex flex-col sm:flex-row">
            {/* Restaurant Image */}
            <div className="relative w-full h-32 sm:w-48 sm:h-full border-b sm:border-b-0 sm:border-r border-gray-100 flex-shrink-0">
              <Image
                src={localRestaurant.imageUrl || '/images/logo.png'}
                alt={localRestaurant.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 192px"
                priority={true}
                quality={85}
              />
            </div>

            <div className="flex-1 p-2 sm:p-4">
              <div className="space-y-2 sm:space-y-3">
                {/* Header & Address */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-0.5 sm:mb-1">{localRestaurant.name}</h3>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <p className="line-clamp-1" data-testid={`restaurant-address-${localRestaurant.id}`}>
                      {localRestaurant.address}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {localRestaurant.description && (
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed" data-testid={`restaurant-description-${localRestaurant.id}`}>
                    {localRestaurant.description}
                  </p>
                )}

                {/* Features */}
                <div className="flex flex-wrap gap-1 sm:gap-2 pt-1 sm:pt-2">
                  {/* Price Range Badge */}
                <Badge color={
                      localRestaurant.priceRange === 'LOW'
                    ? 'green'
                        : localRestaurant.priceRange === 'MEDIUM'
                    ? 'yellow'
                    : 'orange'
                }>
                    {localRestaurant.priceRange === 'LOW'
                      ? '$'
                      : localRestaurant.priceRange === 'MEDIUM'
                      ? '$$'
                      : '$$$'}
                </Badge>
                  {/* Cuisine Type Badge */}
                <Badge color="blue">
                    {formatCuisineName(localRestaurant.cuisineType)}
                </Badge>
                  {renderFeatureIcon(
                    localRestaurant.hasPrayerRoom,
                    <HomeModernIcon className="h-4 w-4" />,
                    'Prayer Space'
                  )}
                  {renderFeatureIcon(
                    localRestaurant.hasOutdoorSeating,
                    <OutdoorSeatingIcon className="h-5 w-5" />,
                    'Outdoor Seating'
                  )}
                  {renderFeatureIcon(
                    localRestaurant.isZabiha,
                    <HeartIcon className="h-4 w-4" />,
                    'Zabiha'
                  )}
                  {renderFeatureIcon(
                    localRestaurant.hasHighChair,
                    <HighChairIcon className="h-4 w-4" />,
                    'High Chairs'
                  )}
                  {localRestaurant.servesAlcohol
                    ? (
                      <div className="flex items-center gap-1.5 text-pink-700 bg-pink-100 px-2 py-1 rounded-full font-semibold" title="Serves Alcohol">
                        <WineGlassIcon className="h-4 w-4 text-pink-600" />
                        <span className="hidden sm:inline text-xs">Serves Alcohol</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-gray-500" title="No Alcohol">
                        <WineGlassIcon className="h-4 w-4 text-pink-600" />
                        <span className="hidden sm:inline text-xs">No Alcohol</span>
                      </div>
                    )
                  }
                  {renderFeatureIcon(
                    localRestaurant.isFullyHalal,
                    <HalalBadgeIcon className="h-5 w-5" />,
                    'Fully Halal'
                  )}
                  {renderFeatureIcon(
                    localRestaurant.isPartiallyHalal,
                    <PartiallyHalalBadgeIcon className="h-5 w-5" />,
                    'Partially Halal'
                  )}
                </div>

              {/* Zabiha Details (always show if present) */}
                {localRestaurant.isZabiha && (localRestaurant.zabihaChicken || localRestaurant.zabihaLamb || localRestaurant.zabihaBeef || localRestaurant.zabihaGoat) && (
                <div className="bg-orange-50 rounded-lg p-3 space-y-1.5 mt-2">
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

              {/* Partially Halal Details (always show if present) */}
                {localRestaurant.isPartiallyHalal && (localRestaurant.partiallyHalalChicken || localRestaurant.partiallyHalalLamb || localRestaurant.partiallyHalalBeef || localRestaurant.partiallyHalalGoat) && (
                  <div className="bg-yellow-50 rounded-lg p-3 space-y-1.5 mt-2">
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

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="info"
                  size="sm"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-white"
                  title="View on Google Maps"
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${localRestaurant.name} ${localRestaurant.address}`)}`, '_blank')}
                  >
                    <MapPinIcon className="h-4 w-4" />
                  <span>View on Google Maps</span>
                </Button>
                <Button
                  variant="neutral"
                  size="sm"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700"
                    title="Get Directions"
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(localRestaurant.address)}`, '_blank')}
                  >
                    <MapPinIcon className="h-4 w-4" />
                  <span>Get Directions</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-white"
                    title="Add Comment"
                  onClick={() => setIsCommentModalOpen(true)}
                  >
                    <ChatBubbleLeftIcon className="h-4 w-4" />
                  <span>Add Comment</span>
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-white"
                    title="Report Issue"
                  onClick={() => setIsReportModalOpen(true)}
                  >
                    <FlagIcon className="h-4 w-4" />
                  <span>Report Issue</span>
                </Button>
              </div>
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
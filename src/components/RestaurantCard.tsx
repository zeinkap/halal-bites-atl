import { Restaurant } from '@/types';
import React, { useState } from 'react';
import { MapPinIcon, HomeModernIcon, SunIcon, HeartIcon, UserGroupIcon, ChatBubbleLeftIcon, BeakerIcon, CheckBadgeIcon, FlagIcon } from '@heroicons/react/24/solid';
import CommentModal from './CommentModal';
import ReportModal from './ReportModal';
import Image from 'next/image';

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
      <div className="group">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            {/* Restaurant Image */}
            <div className="relative w-full sm:w-48 h-48 sm:h-full border-b sm:border-b-0 sm:border-r border-gray-100 flex-shrink-0">
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

            <div className="flex-1 p-4">
              <div className="space-y-3">
                {/* Header & Address */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{localRestaurant.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <p className="line-clamp-1" data-testid={`restaurant-address-${localRestaurant.id}`}>
                      {localRestaurant.address}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {localRestaurant.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed" data-testid={`restaurant-description-${localRestaurant.id}`}>
                    {localRestaurant.description}
                  </p>
                )}

                {/* Features */}
                <div className="flex flex-wrap gap-4">
                  {renderFeatureIcon(
                    localRestaurant.hasPrayerRoom,
                    <HomeModernIcon className="h-4 w-4" />,
                    'Prayer Space'
                  )}
                  {renderFeatureIcon(
                    localRestaurant.hasOutdoorSeating,
                    <SunIcon className="h-4 w-4" />,
                    'Outdoor Seating'
                  )}
                  {renderFeatureIcon(
                    localRestaurant.isZabiha,
                    <HeartIcon className="h-4 w-4" />,
                    'Zabiha'
                  )}
                  {renderFeatureIcon(
                    localRestaurant.hasHighChair,
                    <UserGroupIcon className="h-4 w-4" />,
                    'High Chairs'
                  )}
                  {renderFeatureIcon(
                    !localRestaurant.servesAlcohol,
                    <BeakerIcon className="h-4 w-4" />,
                    'No Alcohol'
                  )}
                  {renderFeatureIcon(
                    localRestaurant.isFullyHalal,
                    <CheckBadgeIcon className="h-4 w-4" />,
                    'Fully Halal'
                  )}
                </div>

                {/* Zabiha Details */}
                {localRestaurant.isZabiha && (localRestaurant.zabihaChicken || localRestaurant.zabihaLamb || localRestaurant.zabihaBeef || localRestaurant.zabihaGoat) && (
                  <div className="bg-orange-50 rounded-lg p-3 space-y-1.5">
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

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
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
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                    title="View on Maps"
                    data-testid={`restaurant-card-map-icon-${localRestaurant.id}`}
                  >
                    <MapPinIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">View on Maps</span>
                  </button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${localRestaurant.name} ${localRestaurant.address}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`get-directions-button-${localRestaurant.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                    title="Get Directions"
                  >
                    <MapPinIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Get Directions</span>
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCommentModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors relative"
                    title="Add Comment"
                    data-testid={`restaurant-card-comment-icon-${localRestaurant.id}`}
                  >
                    <ChatBubbleLeftIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Comment</span>
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
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    title="Report Issue"
                    data-testid={`restaurant-card-report-icon-${localRestaurant.id}`}
                  >
                    <FlagIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Report Issue</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
import { Restaurant } from '@/types';
import React, { useState } from 'react';
import { MapPinIcon, HomeModernIcon, SunIcon, HeartIcon, UserGroupIcon, ChatBubbleLeftIcon, BeakerIcon, CheckBadgeIcon, FlagIcon } from '@heroicons/react/24/solid';
import CommentModal from './CommentModal';
import ReportModal from './ReportModal';
import Image from 'next/image';
import { formatCuisineName } from '@/utils/formatCuisineName';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

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
                  <span
                    className={
                      localRestaurant.priceRange === 'LOW'
                        ? 'px-1.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800'
                        : localRestaurant.priceRange === 'MEDIUM'
                        ? 'px-1.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800'
                        : 'px-1.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800'
                    }
                    data-testid={`restaurant-card-price-${localRestaurant.id}`}
                  >
                    {localRestaurant.priceRange === 'LOW'
                      ? '$'
                      : localRestaurant.priceRange === 'MEDIUM'
                      ? '$$'
                      : '$$$'}
                  </span>
                  {/* Cuisine Type Badge */}
                  <span
                    className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"
                    data-testid={`restaurant-card-cuisine-${localRestaurant.id}`}
                  >
                    {formatCuisineName(localRestaurant.cuisineType)}
                  </span>
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${localRestaurant.name} ${localRestaurant.address}`)}`,
                        '_blank'
                      );
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                    title="View on Maps"
                    data-testid={`restaurant-card-map-icon-${localRestaurant.id}`}
                  >
                    <MapPinIcon className="h-4 w-4" />
                    {/* Improved Google Maps pin SVG, visible on all screens */}
                    <span className="inline-flex">
                      <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#4285F4"/>
                        <circle cx="12" cy="9" r="2.5" fill="#fff"/>
                      </svg>
                    </span>
                    <span className="hidden sm:inline">View on Google Maps</span>
                  </button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(localRestaurant.address)}`}
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
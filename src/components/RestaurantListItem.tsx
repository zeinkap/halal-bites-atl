import { Restaurant } from '@/types';
import { MapPinIcon, HomeModernIcon, SunIcon, HeartIcon, UserGroupIcon, ChatBubbleLeftIcon, BeakerIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import CommentModal from './CommentModal';

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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        <div 
          className="p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          data-testid={`restaurant-item-${restaurant.id}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {restaurant.name}
                </h3>
                <span className="text-sm font-medium text-gray-600">
                  {formatPriceRange(restaurant.priceRange)}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 mt-1">
                {formatCuisine(restaurant.cuisineType)}
              </div>

              <div className="flex items-start gap-2 mt-2">
                <MapPinIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600 line-clamp-1">
                  {restaurant.address}
                </p>
              </div>

              {/* Quick Features */}
              <div className="flex flex-wrap gap-3 mt-2">
                {restaurant.hasPrayerRoom && (
                  <div className="flex items-center gap-1">
                    <HomeModernIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-gray-600">Prayer Room</span>
                  </div>
                )}
                {restaurant.isZabiha && (
                  <div className="flex items-center gap-1">
                    <HeartIcon className="h-4 w-4 text-red-600" />
                    <span className="text-xs text-gray-600">Zabiha</span>
                  </div>
                )}
                {restaurant.hasOutdoorSeating && (
                  <div className="flex items-center gap-1">
                    <SunIcon className="h-4 w-4 text-yellow-600" />
                    <span className="text-xs text-gray-600">Outdoor</span>
                  </div>
                )}
                {restaurant.hasHighChair && (
                  <div className="flex items-center gap-1">
                    <UserGroupIcon className="h-4 w-4 text-purple-600" />
                    <span className="text-xs text-gray-600">High Chairs</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <BeakerIcon className="h-4 w-4 text-amber-600" />
                  <span className="text-xs text-gray-600" data-testid={`restaurant-alcohol-${restaurant.id}`}>
                    {restaurant.servesAlcohol ? 'Serves Alcohol' : 'No Alcohol ✓'}
                  </span>
                </div>
                {restaurant.isFullyHalal && (
                  <div className="flex items-center gap-1">
                    <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-gray-600">Fully Halal</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${restaurant.name} ${restaurant.address}`
                    )}`,
                    '_blank'
                  );
                }}
                className="p-2 text-gray-600 hover:text-green-600 transition-colors cursor-pointer"
                title="View on Maps"
                data-testid={`restaurant-map-icon-${restaurant.id}`}
              >
                <MapPinIcon className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCommentModalOpen(true);
                }}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                title="Comments"
                data-testid={`restaurant-comment-icon-${restaurant.id}`}
              >
                <ChatBubbleLeftIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              {restaurant.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {restaurant.description}
                </p>
              )}
              <div className="flex gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${restaurant.name} ${restaurant.address}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-teal-600 hover:to-emerald-600 transition-all duration-200"
                >
                  View on Maps
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${restaurant.name} ${restaurant.address}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-slate-400 to-slate-500 text-white rounded-lg text-sm font-medium hover:from-slate-500 hover:to-slate-600 transition-all duration-200"
                >
                  Get Directions
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
      />
    </>
  );
} 
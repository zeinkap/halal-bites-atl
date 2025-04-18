import { Restaurant } from '@/types';
import { useState } from 'react';
import { MapPinIcon, HomeModernIcon, SunIcon, HeartIcon, UserGroupIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/solid';
import CommentModal from './CommentModal';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  return (
    <>
      <div className="group relative">
        <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
          <div className="flex flex-col h-full">
            <div>
              <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
              <p className="text-gray-600 mb-2">{restaurant.address}</p>
              <p className="text-gray-700 mb-4">{restaurant.description}</p>
            </div>

            {/* Quick Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2">
                <MapPinIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600 line-clamp-2" data-testid={`restaurant-address-${restaurant.id}`}>
                  {restaurant.address}
                </p>
              </div>

              {/* Description */}
              {restaurant.description && (
                <p 
                  className="text-sm text-gray-600 mt-2 line-clamp-3" 
                  data-testid={`restaurant-description-${restaurant.id}`}
                >
                  {restaurant.description}
                </p>
              )}
              
              {/* New Features Section */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                {/* Prayer Room */}
                <div className="flex items-center gap-2">
                  <HomeModernIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600" data-testid={`restaurant-prayer-room-${restaurant.id}`}>
                    {restaurant.hasPrayerRoom ? 'Prayer Room ✓' : 'No Prayer Room'}
                  </span>
                </div>
                
                {/* Outdoor Seating */}
                <div className="flex items-center gap-2">
                  <SunIcon className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-gray-600" data-testid={`restaurant-outdoor-seating-${restaurant.id}`}>
                    {restaurant.hasOutdoorSeating ? 'Outdoor Seating ✓' : 'Indoor Only'}
                  </span>
                </div>
                
                {/* Zabiha Status */}
                <div className="flex items-center gap-2">
                  <HeartIcon className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-gray-600" data-testid={`restaurant-zabiha-${restaurant.id}`}>
                    {restaurant.isZabiha ? 'Zabiha ✓' : 'Non-Zabiha'}
                  </span>
                </div>
                
                {/* High Chair */}
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-600" data-testid={`restaurant-high-chair-${restaurant.id}`}>
                    {restaurant.hasHighChair ? 'High Chairs ✓' : 'No High Chairs'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
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
                data-testid={`restaurant-card-map-icon-${restaurant.id}`}
              >
                <MapPinIcon className="h-5 w-5" />
              </button>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  `${restaurant.name} ${restaurant.address}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`get-directions-button-${restaurant.id}`}
                className="px-4 py-2 bg-gradient-to-r from-slate-400 to-slate-500 text-white rounded-lg text-sm font-medium hover:from-slate-500 hover:to-slate-600 transform transition-all duration-200 ease-in-out hover:scale-[1.02] shadow-sm cursor-pointer"
              >
                Directions
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCommentModalOpen(true);
                }}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                title="Comments"
                data-testid={`restaurant-card-comment-icon-${restaurant.id}`}
              >
                <ChatBubbleLeftIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Modal - moved outside the card */}
      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
      />
    </>
  );
} 
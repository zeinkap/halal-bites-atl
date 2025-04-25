import { Restaurant } from '@/types';
import { useState } from 'react';
import { MapPinIcon, HomeModernIcon, SunIcon, HeartIcon, UserGroupIcon, ChatBubbleLeftIcon, BeakerIcon, CheckBadgeIcon, FlagIcon } from '@heroicons/react/24/solid';
import CommentModal from './CommentModal';
import ReportModal from './ReportModal';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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
                {/* Prayer Space */}
                <div className="flex items-center gap-2">
                  <HomeModernIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600" data-testid={`restaurant-prayer-room-${restaurant.id}`}>
                    {restaurant.hasPrayerRoom ? 'Prayer Space ✓' : 'No Prayer Space'}
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
                    {restaurant.isZabiha ? 'Zabiha (hand-cut) ✓' : 'Non-Zabiha'}
                  </span>
                </div>
                
                {/* High Chair */}
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-600" data-testid={`restaurant-high-chair-${restaurant.id}`}>
                    {restaurant.hasHighChair ? 'High Chairs ✓' : 'No High Chairs'}
                  </span>
                </div>

                {/* Alcohol Status */}
                <div className="flex items-center gap-2">
                  <BeakerIcon className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-gray-600" data-testid={`restaurant-alcohol-${restaurant.id}`}>
                    {restaurant.servesAlcohol ? 'Serves Alcohol' : 'No Alcohol ✓'}
                  </span>
                </div>

                {/* Halal Menu Status */}
                <div className="flex items-center gap-2">
                  <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600" data-testid={`restaurant-fully-halal-${restaurant.id}`}>
                    {restaurant.isFullyHalal ? 'Fully Halal ✓' : 'Partial Halal'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 mt-4">
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
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transform transition-all duration-200 ease-in-out hover:scale-[1.02] shadow-sm cursor-pointer flex items-center justify-center gap-2"
                title="View on Maps"
                data-testid={`restaurant-card-map-icon-${restaurant.id}`}
              >
                <MapPinIcon className="h-5 w-5" />
                View on Maps
              </button>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  `${restaurant.name} ${restaurant.address}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`get-directions-button-${restaurant.id}`}
                className="px-4 py-2 bg-slate-500 text-white rounded-lg text-sm font-medium hover:bg-slate-600 transform transition-all duration-200 ease-in-out hover:scale-[1.02] shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <MapPinIcon className="h-5 w-5" />
                Get Directions
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCommentModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transform transition-all duration-200 ease-in-out hover:scale-[1.02] shadow-sm cursor-pointer flex items-center justify-center gap-2"
                title="Add Comment"
                data-testid={`restaurant-card-comment-icon-${restaurant.id}`}
              >
                <ChatBubbleLeftIcon className="h-5 w-5" />
                Add Comment
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsReportModalOpen(true);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transform transition-all duration-200 ease-in-out hover:scale-[1.02] shadow-sm cursor-pointer flex items-center justify-center gap-2"
                title="Report Issue"
                data-testid={`restaurant-card-report-icon-${restaurant.id}`}
              >
                <FlagIcon className="h-5 w-5" />
                Report Issue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
      />
    </>
  );
}
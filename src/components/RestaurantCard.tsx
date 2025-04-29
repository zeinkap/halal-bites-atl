import { Restaurant } from '@/types';
import { useState } from 'react';
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

  return (
    <>
      <div className="group relative">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
          {/* Restaurant Image */}
          <div className="relative w-full h-48 sm:h-56 border-b border-gray-100">
            <Image
              src={restaurant.imageUrl || '/images/logo.png'}
              alt={restaurant.name}
              fill
              className="object-contain sm:object-cover p-4 sm:p-0"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={true}
              quality={85}
            />
          </div>
          
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col h-full">
              <div className="space-y-4">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{restaurant.name}</h3>
                </div>

                {/* Address Section */}
                <div className="flex items-start gap-2">
                  <MapPinIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 line-clamp-2" data-testid={`restaurant-address-${restaurant.id}`}>
                    {restaurant.address}
                  </p>
                </div>

                {/* Description Section */}
                {restaurant.description && (
                  <div>
                    <p 
                      className="text-sm text-gray-700 line-clamp-3 sm:line-clamp-none leading-relaxed" 
                      data-testid={`restaurant-description-${restaurant.id}`}
                    >
                      {restaurant.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                {/* Prayer Space */}
                <div className="flex items-center gap-2">
                  <HomeModernIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600 truncate" data-testid={`restaurant-prayer-room-${restaurant.id}`}>
                    {restaurant.hasPrayerRoom ? 'Prayer Space ✓' : 'No Prayer Space'}
                  </span>
                </div>
                
                {/* Outdoor Seating */}
                <div className="flex items-center gap-2">
                  <SunIcon className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600 truncate" data-testid={`restaurant-outdoor-seating-${restaurant.id}`}>
                    {restaurant.hasOutdoorSeating ? 'Outdoor Seating ✓' : 'Indoor Only'}
                  </span>
                </div>
                
                {/* Zabiha Status */}
                <div className="flex items-center gap-2">
                  <HeartIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600 truncate" data-testid={`restaurant-zabiha-${restaurant.id}`}>
                    {restaurant.isZabiha ? 'Zabiha (hand-cut) ✓' : 'Non-Zabiha'}
                  </span>
                </div>
                
                {/* High Chair */}
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600 truncate" data-testid={`restaurant-high-chair-${restaurant.id}`}>
                    {restaurant.hasHighChair ? 'High Chairs ✓' : 'No High Chairs'}
                  </span>
                </div>

                {/* Alcohol Status */}
                <div className="flex items-center gap-2">
                  <BeakerIcon className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600 truncate" data-testid={`restaurant-alcohol-${restaurant.id}`}>
                    {restaurant.servesAlcohol ? 'Serves Alcohol' : 'No Alcohol ✓'}
                  </span>
                </div>

                {/* Halal Menu Status */}
                <div className="flex items-center gap-2">
                  <CheckBadgeIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600 truncate" data-testid={`restaurant-fully-halal-${restaurant.id}`}>
                    {restaurant.isFullyHalal ? 'Fully Halal ✓' : 'Partial Halal'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-6">
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
                  className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transform transition-all duration-200 ease-in-out hover:scale-[1.02] shadow-sm cursor-pointer flex items-center justify-center gap-1 sm:gap-2"
                  title="View on Maps"
                  data-testid={`restaurant-card-map-icon-${restaurant.id}`}
                >
                  <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="truncate">View on Maps</span>
                </button>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${restaurant.name} ${restaurant.address}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`get-directions-button-${restaurant.id}`}
                  className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-slate-600 hover:to-slate-700 transform transition-all duration-200 ease-in-out hover:scale-[1.02] shadow-sm cursor-pointer flex items-center justify-center gap-1 sm:gap-2"
                  title="Get Directions"
                >
                  <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="truncate">Get Directions</span>
                </a>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCommentModalOpen(true);
                  }}
                  className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-blue-600 hover:to-blue-700 transform transition-all duration-200 ease-in-out hover:scale-[1.02] shadow-sm cursor-pointer flex items-center justify-center gap-1 sm:gap-2"
                  title="Add Comment"
                  data-testid={`restaurant-card-comment-icon-${restaurant.id}`}
                >
                  <ChatBubbleLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="truncate">Add Comment</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsReportModalOpen(true);
                  }}
                  className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-red-600 hover:to-red-700 transform transition-all duration-200 ease-in-out hover:scale-[1.02] shadow-sm cursor-pointer flex items-center justify-center gap-1 sm:gap-2"
                  title="Report Issue"
                  data-testid={`restaurant-card-report-icon-${restaurant.id}`}
                >
                  <FlagIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="truncate">Report Issue</span>
                </button>
              </div>
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
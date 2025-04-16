import { Restaurant } from '@/types';
import Image from 'next/image';
import { useState } from 'react';
import { MapPinIcon, HomeModernIcon, SunIcon, HeartIcon, UserGroupIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/solid';
import CommentModal from './CommentModal';

interface RestaurantCardProps {
  restaurant: Restaurant;
  isPriority?: boolean;
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

export default function RestaurantCard({ restaurant, isPriority = false }: RestaurantCardProps) {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  return (
    <>
      <div className="group relative">
        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
          {/* Image Container */}
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={restaurant.imageUrl || '/images/placeholder.jpg'}
              alt={restaurant.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={isPriority}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Price Range */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-black shadow-lg">
              {formatPriceRange(restaurant.priceRange)}
            </div>

            {/* Restaurant Name and Cuisine - Overlaid on image */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 
                className="text-xl font-bold mb-1 drop-shadow-lg" 
                data-testid={`restaurant-name-${restaurant.name}`}
                data-restaurant-id={restaurant.id}
              >
                {restaurant.name}
              </h3>
              <p className="text-sm text-white/90 font-medium drop-shadow-lg" data-testid={`restaurant-cuisine-${restaurant.id}`}>
                {formatCuisine(restaurant.cuisineType)}
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4">
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
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${restaurant.name} ${restaurant.address}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`view-maps-button-${restaurant.id}`}
                className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-teal-600 hover:to-emerald-600 transform transition-all duration-200 ease-in-out hover:scale-[1.02] shadow-sm cursor-pointer"
              >
                View on Maps
              </a>
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
                onClick={() => setIsCommentModalOpen(true)}
                data-testid={`open-comments-button-${restaurant.id}`}
                className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg text-sm font-medium hover:from-blue-500 hover:to-blue-600 transform transition-all duration-200 ease-in-out hover:scale-[1.02] shadow-sm cursor-pointer flex items-center gap-1"
              >
                <ChatBubbleLeftIcon className="h-4 w-4" />
                Comments
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
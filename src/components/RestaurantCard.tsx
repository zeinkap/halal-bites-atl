import { Restaurant } from '@/types';
import Image from 'next/image';
import { MapPinIcon, ClockIcon } from '@heroicons/react/24/solid';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  // Function to check if restaurant is open
  const isOpenNow = () => {
    if (!restaurant.hours) return null;
    
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    const todayHours = restaurant.hours[day.toLowerCase()];
    if (!todayHours) return null;
    
    const [open, close] = todayHours.split(' - ').map(time => {
      const [hours, minutes] = time.replace(/[APM]/g, '').trim().split(':');
      let hour = parseInt(hours);
      if (time.includes('PM') && hour !== 12) hour += 12;
      if (time.includes('AM') && hour === 12) hour = 0;
      return `${hour.toString().padStart(2, '0')}:${minutes || '00'}`;
    });
    
    return currentTime >= open && currentTime <= close;
  };

  const openStatus = isOpenNow();

  return (
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
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Price Range */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-black shadow-lg">
            {restaurant.priceRange}
          </div>

          {/* Open Status */}
          {openStatus !== null && (
            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium shadow-lg ${
              openStatus 
                ? 'bg-green-500/90 text-white backdrop-blur-sm' 
                : 'bg-red-500/90 text-white backdrop-blur-sm'
            }`}>
              {openStatus ? 'Open Now' : 'Closed'}
            </div>
          )}

          {/* Restaurant Name and Cuisine - Overlaid on image */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-xl font-bold mb-1 drop-shadow-lg">
              {restaurant.name}
            </h3>
            <p className="text-sm text-white/90 font-medium drop-shadow-lg">
              {restaurant.cuisine}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Quick Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-start gap-2">
              <MapPinIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600 line-clamp-2">{restaurant.address}</p>
            </div>
            {restaurant.hours && (
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-green-600" />
                <p className="text-sm text-gray-600">
                  {restaurant.hours['monday']?.split(' - ')[0]} - {restaurant.hours['monday']?.split(' - ')[1]}
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${restaurant.name} ${restaurant.address}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
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
              className="px-4 py-2 bg-gradient-to-r from-slate-400 to-slate-500 text-white rounded-lg text-sm font-medium hover:from-slate-500 hover:to-slate-600 transform transition-all duration-200 ease-in-out hover:scale-[1.02] shadow-sm cursor-pointer"
            >
              Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 
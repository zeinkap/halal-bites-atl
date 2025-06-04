import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import FeatureRestaurantModal from '../modals/FeatureRestaurantModal';
import { formatPriceRange } from '@/utils/formatPriceRange';
import { PriceRange } from '@prisma/client';
import Image from 'next/image';

interface FeaturedRestaurant {
  id: string;
  name: string;
  address: string;
  imageUrl?: string | null;
  description?: string | null;
  cuisineType: string;
  priceRange: string;
}

interface FeaturedRestaurantsCarouselProps {
  onSelectRestaurant?: (name: string) => void;
}

export default function FeaturedRestaurantsCarousel({ onSelectRestaurant }: FeaturedRestaurantsCarouselProps) {
  const [restaurants, setRestaurants] = useState<FeaturedRestaurant[]>([]);
  const [current, setCurrent] = useState(0);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    fetch('/api/restaurants?featured=true')
      .then(res => res.json())
      .then(data => setRestaurants(data.slice(0, 5)))
      .catch(() => setRestaurants([]));
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (!restaurants.length) return;
    if (isPaused) return;
    autoPlayRef.current = setInterval(() => {
      setCurrent((c) => (c === restaurants.length - 1 ? 0 : c + 1));
    }, 5000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [restaurants.length, isPaused]);

  // Touch/Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) > 40) { // threshold
        if (diff > 0) {
          next(); // swipe left
        } else {
          prev(); // swipe right
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!restaurants.length) return null;

  const prev = () => setCurrent((c) => (c === 0 ? restaurants.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === restaurants.length - 1 ? 0 : c + 1));

  const restaurant = restaurants[current];

  return (
    <section
      className="mb-4 rounded-xl bg-gradient-to-r from-orange-50 via-white to-green-50 py-4 px-1 shadow-inner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      tabIndex={0}
      aria-label="Featured Restaurants Carousel"
    >
      <h2 className="text-xl font-bold mb-4 text-center text-gray-800 tracking-tight drop-shadow-sm">🌟 Featured Restaurants</h2>
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={prev}
          aria-label="Previous"
          className="rounded-full bg-white/70 backdrop-blur shadow-md hover:bg-orange-100 transition"
        >
          <ChevronLeftIcon className="w-5 h-5 text-orange-500" />
        </Button>
        <div
          className="w-full max-w-xs"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Card
            className="p-3 flex flex-col items-center text-center rounded-xl shadow-lg border border-orange-100 hover:scale-[1.02] transition-transform duration-200 bg-white/90 relative cursor-pointer hover:ring-2 hover:ring-orange-300"
            onClick={() => {
              onSelectRestaurant?.(restaurant.name)
            }}
            tabIndex={0}
            role="button"
            aria-label={`Show ${restaurant.name} in search`}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelectRestaurant?.(restaurant.name);
              }
            }}
          >
            <span className="absolute top-2 left-2">
              <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-orange-100 text-orange-600 shadow-sm border border-orange-200">Featured</span>
            </span>
            {restaurant.imageUrl && (
              <Image
                src={restaurant.imageUrl}
                alt={restaurant.name}
                width={80}
                height={80}
                className="w-20 h-20 object-cover rounded-lg mb-2 border border-gray-200 shadow-sm"
                style={{ objectFit: 'cover' }}
                loading="lazy"
              />
            )}
            <h3 className="text-base font-bold mb-0.5 text-gray-800 tracking-tight drop-shadow-sm">{restaurant.name}</h3>
            <p className="text-xs text-gray-700 mb-0.5 font-medium">
              {restaurant.cuisineType.replace(/_/g, ' ')}
              {restaurant.priceRange && (
                <span className="mx-1 text-gray-400">&bull;</span>
              )}
              <span>{formatPriceRange(restaurant.priceRange as PriceRange)}</span>
            </p>
            <p className="text-[11px] text-gray-500 mb-1 line-clamp-2">{restaurant.address}</p>
            {restaurant.description && (
              <p className="text-[11px] text-gray-700 line-clamp-3 mb-1">{restaurant.description}</p>
            )}
          </Card>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={next}
          aria-label="Next"
          className="rounded-full bg-white/70 backdrop-blur shadow-md hover:bg-orange-100 transition"
        >
          <ChevronRightIcon className="w-5 h-5 text-orange-500" />
        </Button>
      </div>
      <div className="flex justify-center mt-3 gap-1.5">
        {restaurants.map((_, idx) => (
          <button
            key={idx}
            className={`w-2.5 h-2.5 rounded-full border transition-all duration-200 ${idx === current ? 'bg-orange-500 border-orange-400 scale-105 shadow' : 'bg-gray-300 border-gray-200'}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
      <div className="flex justify-center mt-4">
        <div className="bg-transparent rounded px-2 py-1 text-gray-500 text-xs font-normal">
          Interested in having your restaurant featured? Please reach out to us{' '}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFeatureModal(true)}
            className="text-gray-500 px-1 py-0 h-auto min-w-0 align-baseline ml-1 hover:underline focus:underline"
          >
            here
          </Button>
        </div>
      </div>
      <FeatureRestaurantModal isOpen={showFeatureModal} onClose={() => setShowFeatureModal(false)} />
    </section>
  );
}
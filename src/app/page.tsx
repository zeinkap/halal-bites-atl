'use client';

import { Suspense, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import RestaurantList from '@/components/restaurants/RestaurantList/RestaurantList';
import FeaturedRestaurantsCarousel from '@/components/restaurants/FeaturedRestaurantsCarousel';

// Separate component for search functionality
function SearchWrapper() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const listRef = useRef<HTMLDivElement>(null);
  const firstResultRef = useRef<HTMLDivElement>(null);

  // Scroll to restaurant list when a featured card is clicked
  const handleSelectRestaurant = (name: string) => {
    setSearch(name);
    setTimeout(() => {
      if (firstResultRef.current) {
        firstResultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100); // Wait for state update/render
  };

  return (
    <div ref={listRef}>
      <RestaurantList
        initialSearch={search}
        setSearchQuery={setSearch}
        aboveResults={<FeaturedRestaurantsCarousel onSelectRestaurant={handleSelectRestaurant} />}
        firstResultRef={firstResultRef as React.RefObject<HTMLDivElement>}
      />
    </div>
  );
}

export default function Home() {
  return (
    <main className="bg-white py-8">
      <div className="container mx-auto px-4">
        <Suspense fallback={<div>Loading...</div>}>
          <SearchWrapper />
        </Suspense>
      </div>
    </main>
  );
}

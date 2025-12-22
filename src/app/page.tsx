'use client';

import { Suspense, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import RestaurantList from '@/components/restaurants/RestaurantList/RestaurantList';

// Separate component for search functionality
function SearchWrapper() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const listRef = useRef<HTMLDivElement>(null);
  const firstResultRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={listRef}>
      <RestaurantList
        initialSearch={search}
        setSearchQuery={setSearch}
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

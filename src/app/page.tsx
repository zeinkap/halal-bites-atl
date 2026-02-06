'use client';

import { Suspense, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import RestaurantList from '@/components/restaurants/RestaurantList/RestaurantList';

function SearchWrapper() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const firstResultRef = useRef<HTMLDivElement>(null);

  return (
    <RestaurantList
      initialSearch={search}
      setSearchQuery={setSearch}
      firstResultRef={firstResultRef as React.RefObject<HTMLDivElement>}
    />
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Suspense fallback={<div className="animate-pulse h-64 rounded-2xl bg-stone-200/50" />}>
          <SearchWrapper />
        </Suspense>
      </div>
    </main>
  );
}

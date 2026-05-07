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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pt-10 sm:pb-20">
        <Suspense fallback={
          <div className="text-center pt-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-stone-200 border-t-teal-500" />
          </div>
        }>
          <SearchWrapper />
        </Suspense>
      </div>
    </main>
  );
}

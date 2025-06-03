'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RestaurantList from '@/components/restaurants/RestaurantList/RestaurantList';

// Separate component for search functionality
function SearchWrapper() {
  const searchParams = useSearchParams();
  const search = searchParams?.get('search') || '';
  
  return (
    <RestaurantList initialSearch={search} />
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

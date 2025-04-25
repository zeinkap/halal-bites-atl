'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RestaurantList from '@/components/RestaurantList';
import AddRestaurantForm from '@/components/AddRestaurantForm';

// Separate component for search functionality
function SearchWrapper() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  
  return (
    <RestaurantList initialSearch={search} />
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">Halal Bites Atlanta</h1>
        <AddRestaurantForm isOpen={false} onClose={() => {}} />
        <Suspense fallback={<div>Loading...</div>}>
          <SearchWrapper />
        </Suspense>
      </div>
    </main>
  );
}

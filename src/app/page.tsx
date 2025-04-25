'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import RestaurantList from '@/components/RestaurantList';
import AddRestaurantForm from '@/components/AddRestaurantForm';
import { PlusIcon } from '@heroicons/react/24/outline';

// Separate component for search functionality
function SearchWrapper() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  
  return (
    <RestaurantList initialSearch={search} />
  );
}

export default function Home() {
  const [showAddRestaurantForm, setShowAddRestaurantForm] = useState(false);

  return (
    <main className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Halal Bites Atlanta</h1>
          <button
            onClick={() => setShowAddRestaurantForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-orange-500 hover:to-orange-600 transform transition-all duration-200 ease-in-out hover:scale-[1.02] shadow-sm cursor-pointer flex items-center gap-2"
            data-testid="add-restaurant-button"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Add Restaurant</span>
          </button>
        </div>
        <AddRestaurantForm 
          isOpen={showAddRestaurantForm} 
          onClose={() => setShowAddRestaurantForm(false)}
          onRestaurantAdded={() => {
            // Force a page refresh to show the new restaurant
            window.location.reload();
          }}
        />
        <Suspense fallback={<div>Loading...</div>}>
          <SearchWrapper />
        </Suspense>
      </div>
    </main>
  );
}

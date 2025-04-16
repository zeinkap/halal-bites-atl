'use client';

import { useState, useEffect, useMemo } from 'react';
import { Restaurant } from '@/types';
import RestaurantCard from '@/components/RestaurantCard';
import AddRestaurantForm from '@/components/AddRestaurantForm';
import ScrollToTop from '@/components/ScrollToTop';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

// Helper function to format cuisine names
const formatCuisineName = (cuisine: string) => {
  if (cuisine === 'all') return 'All Cuisines';
  return cuisine.split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

// Helper function to format price ranges
const formatPriceRange = (price: string) => {
  if (price === 'all') return 'Any Price';
  switch (price) {
    case 'LOW': return '$';
    case 'MEDIUM': return '$$';
    case 'HIGH': return '$$$';
    default: return price;
  }
};

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants');
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Extract unique cuisines
  const cuisines = useMemo(() => {
    return ['all', ...new Set(restaurants.map(r => r.cuisine))].sort();
  }, [restaurants]);

  // Extract unique price ranges
  const priceRanges = useMemo(() => {
    return ['all', ...new Set(restaurants.map(r => r.priceRange))].sort();
  }, [restaurants]);

  // Filter and sort restaurants
  const filteredAndSortedRestaurants = useMemo(() => {
    const filtered = restaurants.filter(restaurant => {
      const matchesCuisine = selectedCuisine === 'all' || restaurant.cuisine === selectedCuisine;
      const matchesPriceRange = selectedPriceRange === 'all' || restaurant.priceRange === selectedPriceRange;
      const matchesSearch = searchQuery === '' || 
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCuisine && matchesPriceRange && matchesSearch;
    });

    // Sort restaurants
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.priceRange.length - b.priceRange.length;
        case 'price-desc':
          return b.priceRange.length - a.priceRange.length;
        default:
          return 0;
      }
    });
  }, [restaurants, selectedCuisine, selectedPriceRange, searchQuery, sortBy]);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-end mb-8">
          <button
            onClick={() => setShowAddForm(true)}
            data-testid="add-restaurant-button"
            className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-orange-500 hover:to-orange-600 transform transition-all duration-200 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-sm cursor-pointer"
          >
            Add Restaurant
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurants by name, cuisine, or location..."
                className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-900"
                data-testid="search-input"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center gap-2 cursor-pointer"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="bg-white rounded-lg shadow-lg p-4 mb-4 space-y-4">
              {/* Sort Options */}
              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                >
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {/* Cuisine Filter */}
              <div>
                <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">
                  Cuisine
                </label>
                <select
                  id="cuisine"
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                >
                  <option value="all">All Cuisines</option>
                  {cuisines.filter(c => c !== 'all').map((cuisine) => (
                    <option key={cuisine} value={cuisine}>
                      {formatCuisineName(cuisine)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range
                </label>
                <select
                  id="price"
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                >
                  <option value="all">Any Price</option>
                  {priceRanges.filter(p => p !== 'all').map((price) => (
                    <option key={price} value={price}>
                      {formatPriceRange(price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCuisine('all');
                  setSelectedPriceRange('all');
                  setSortBy('name-asc');
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="text-gray-600">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                <span>Loading restaurants...</span>
              </div>
            ) : (
              `Found ${filteredAndSortedRestaurants.length} restaurant${filteredAndSortedRestaurants.length !== 1 ? 's' : ''}`
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            <>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200"></div>
                  <div className="p-4 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            filteredAndSortedRestaurants.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-600 mb-4">No restaurants found matching your criteria.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-orange-500 hover:to-orange-600 transform transition-all duration-200 ease-in-out hover:scale-[1.02] shadow-sm"
                >
                  Add a Restaurant
                </button>
              </div>
            ) : (
              filteredAndSortedRestaurants.map((restaurant, index) => (
                <RestaurantCard 
                  key={restaurant.id} 
                  restaurant={restaurant}
                  isPriority={index < 3} // First 3 cards will have priority loading
                />
              ))
            )
          )}
        </div>

        <AddRestaurantForm
          isOpen={showAddForm}
          onClose={() => {
            setShowAddForm(false);
            fetchRestaurants(); // Refresh the list after adding
          }}
        />
      </div>
      <ScrollToTop />
    </main>
  );
}

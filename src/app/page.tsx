'use client';

import { useState, useEffect, useMemo } from 'react';
import { Restaurant } from '@/types';
import AddRestaurantForm from '@/components/AddRestaurantForm';
import ScrollToTop from '@/components/ScrollToTop';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import RestaurantListItem from '@/components/RestaurantListItem';
import { usePathname, useSearchParams } from 'next/navigation';

// Helper function to format cuisine names
const formatCuisineName = (cuisine: string) => {
  if (cuisine === 'all') return 'All Cuisines';
  if (cuisine === 'OTHER') return 'Other';
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  const fetchRestaurants = async () => {
    try {
      setError(null);
      const response = await fetch('/api/restaurants');
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      setRestaurants(data);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch restaurants');
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCuisine('all');
    setSelectedPriceRange('all');
    setSortBy('name-asc');
    setShowFilters(false);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Reset filters when navigating to home page
  useEffect(() => {
    if (pathname === '/') {
      resetFilters();
    }
  }, [pathname, searchParams]);

  // Extract unique cuisines
  const cuisines = useMemo(() => {
    const uniqueCuisines = new Set(restaurants.map(r => r.cuisineType));
    // Remove OTHER from the set if it exists
    uniqueCuisines.delete('OTHER');
    // Convert to array, sort, and add OTHER at the end
    return ['all', ...[...uniqueCuisines].sort(), 'OTHER'];
  }, [restaurants]);

  // Extract unique price ranges
  const priceRanges = useMemo(() => {
    const uniquePrices = new Set(restaurants.map(r => r.priceRange));
    // Order them specifically as LOW, MEDIUM, HIGH
    const orderedPrices = ['LOW', 'MEDIUM', 'HIGH'].filter(price => uniquePrices.has(price));
    return ['all', ...orderedPrices];
  }, [restaurants]);

  // Filter and sort restaurants
  const filteredAndSortedRestaurants = useMemo(() => {
    const filtered = restaurants.filter(restaurant => {
      const matchesCuisine = selectedCuisine === 'all' || restaurant.cuisineType === selectedCuisine;
      const matchesPriceRange = selectedPriceRange === 'all' || restaurant.priceRange === selectedPriceRange;
      const matchesSearch = searchQuery === '' || 
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisineType.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Search, Filter, and Add Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, cuisine, or location"
                className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                data-testid="search-input"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center gap-2 cursor-pointer"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                data-testid="add-restaurant-button"
                className="flex-shrink-0 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-orange-500 hover:to-orange-600 transform transition-all duration-200 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-sm cursor-pointer flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="sm:hidden">Add Restaurant/Cafe</span>
                <span className="hidden sm:inline">Add Restaurant/Cafe</span>
              </button>
            </div>
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
                onClick={resetFilters}
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

        {/* Restaurant List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedRestaurants.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedRestaurants.map((restaurant) => (
              <RestaurantListItem
                key={restaurant.id}
                restaurant={restaurant}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No restaurants found matching your criteria.</p>
          </div>
        )}

        <ScrollToTop />

        {showAddForm && (
          <AddRestaurantForm
            isOpen={true}
            onClose={() => setShowAddForm(false)}
            onRestaurantAdded={() => {
              setShowAddForm(false);
              fetchRestaurants();
            }}
          />
        )}
      </div>
    </main>
  );
}

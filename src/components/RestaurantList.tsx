'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Restaurant, CuisineType } from '@/types';
import RestaurantListItem from './RestaurantListItem';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { formatCuisineName } from '@/utils/formatCuisineName';

const ITEMS_PER_PAGE = 10;

interface RestaurantListProps {
  initialSearch?: string;
}

export default function RestaurantList({ initialSearch = '' }: RestaurantListProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [displayedRestaurants, setDisplayedRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType | 'all'>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'>('name-asc');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | undefined>(undefined);
  const lastRestaurantRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setError(null);
        const response = await fetch('/api/restaurants');
        if (!response.ok) {
          throw new Error('Failed to fetch restaurants');
        }
        const data = await response.json();
        setRestaurants(data);
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch restaurants');
        setRestaurants([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Filter and sort restaurants
  useEffect(() => {
    const filteredRestaurants = restaurants.filter(restaurant => {
      const matchesCuisine = selectedCuisine === 'all' || restaurant.cuisineType === selectedCuisine;
      const matchesPriceRange = selectedPriceRange === 'all' || restaurant.priceRange === selectedPriceRange;
      const matchesSearch = !searchQuery || 
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisineType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCuisine && matchesPriceRange && matchesSearch;
    }).sort((a, b) => {
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

    setFilteredCount(filteredRestaurants.length);

    // Update displayed restaurants based on pagination
    const startIndex = 0;
    const endIndex = page * ITEMS_PER_PAGE;
    setDisplayedRestaurants(filteredRestaurants.slice(startIndex, endIndex));
    setHasMore(endIndex < filteredRestaurants.length);
  }, [restaurants, searchQuery, selectedCuisine, selectedPriceRange, sortBy, page]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCuisine, selectedPriceRange, sortBy]);

  // Add state for filtered count
  const [filteredCount, setFilteredCount] = useState(0);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full" data-testid="restaurant-list-container">
      <div className="mb-8 bg-white z-10 p-4 shadow-sm" data-testid="restaurant-list-searchbar-section">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, cuisine, or location"
              className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-400"
              data-testid="search-input"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center gap-2 cursor-pointer"
            data-testid="filters-button"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4 space-y-4" data-testid="filters-panel">
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700"
                data-testid="sort-select"
              >
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            <div>
              <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">
                Cuisine
              </label>
              <select
                id="cuisine"
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value as CuisineType | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700"
                data-testid="cuisine-select"
              >
                <option value="all" className="text-gray-700">All Cuisines</option>
                {Array.from(new Set(restaurants.map(r => r.cuisineType))).sort().map((cuisine) => (
                  <option key={cuisine} value={cuisine} className="text-gray-700">
                    {formatCuisineName(cuisine as CuisineType)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <select
                id="price"
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700"
                data-testid="price-select"
              >
                <option value="all" className="text-gray-700">Any Price</option>
                {['LOW', 'MEDIUM', 'HIGH'].map((price) => (
                  <option key={price} value={price} className="text-gray-700">
                    {price === 'LOW' ? '$' : price === 'MEDIUM' ? '$$' : '$$$'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="text-gray-600" data-testid="restaurant-list-results-count">
          {isLoading ? (
            <div className="flex items-center gap-2" data-testid="restaurant-list-loading-spinner">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              <span>Loading restaurants...</span>
            </div>
          ) : (
            `Found ${filteredCount} restaurant${filteredCount !== 1 ? 's' : ''}`
          )}
        </div>
      </div>

      {/* Restaurant List */}
      {isLoading ? (
        <div className="space-y-4" data-testid="restaurant-list-loading-section">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse" data-testid="restaurant-list-loading-item">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : displayedRestaurants.length > 0 ? (
        <div className="space-y-4" data-testid="restaurant-list-items-section">
          {displayedRestaurants.map((restaurant, index) => (
            <div
              key={restaurant.id}
              ref={index === displayedRestaurants.length - 1 ? lastRestaurantRef : undefined}
              data-testid={`restaurant-list-item-${restaurant.id}`}
            >
              <RestaurantListItem restaurant={restaurant} />
            </div>
          ))}
          {hasMore && (
            <div className="flex justify-center p-4" data-testid="restaurant-list-has-more-spinner">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12" data-testid="restaurant-list-no-results">
          <p className="text-gray-600">No restaurants found matching your criteria.</p>
        </div>
      )}
    </div>
  );
} 
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Restaurant } from '@/types';
import { CuisineType } from '@prisma/client';
import RestaurantListItem from './RestaurantListItem';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
  const [selectedFeatures, setSelectedFeatures] = useState<{
    isZabiha: boolean;
    hasPrayerRoom: boolean;
    hasHighChair: boolean;
    hasOutdoorSeating: boolean;
    isFullyHalal: boolean;
    servesAlcohol: boolean;
    isPartiallyHalal: boolean;
  }>({
    isZabiha: false,
    hasPrayerRoom: false,
    hasHighChair: false,
    hasOutdoorSeating: false,
    isFullyHalal: false,
    servesAlcohol: false,
    isPartiallyHalal: false,
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [radiusMiles, setRadiusMiles] = useState<string>('5'); // Default to 5 miles
  const [showingNearMe, setShowingNearMe] = useState(false);

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
        restaurant.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.address.match(/\b\d{5}\b/)?.[0]?.includes(searchQuery);
      
      // Check if restaurant matches selected features
      const matchesFeatures = Object.entries(selectedFeatures).every(([feature, isSelected]) => {
        if (!isSelected) return true; // Skip if feature is not selected
        if (feature === 'servesAlcohol') {
          // When 'No Alcohol' is selected, only show restaurants that do NOT serve alcohol
          return restaurant.servesAlcohol === false;
        }
        return restaurant[feature as keyof typeof selectedFeatures];
      });
      
      return matchesCuisine && matchesPriceRange && matchesSearch && matchesFeatures;
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
  }, [restaurants, searchQuery, selectedCuisine, selectedPriceRange, sortBy, page, selectedFeatures]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCuisine, selectedPriceRange, sortBy, selectedFeatures]);

  // Add state for filtered count
  const [filteredCount, setFilteredCount] = useState(0);

  const handleFeatureChange = (feature: keyof typeof selectedFeatures) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  // On mount, check if user previously allowed location and auto-fetch
  useEffect(() => {
    if (typeof window !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          handleLocationSearch(true); // true = auto
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocationSearch = async (auto = false) => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        setIsLoading(true);
        let url = `/api/restaurants?lat=${latitude}&lng=${longitude}`;
        if (radiusMiles !== 'all') {
          // Convert miles to kilometers for the API
          const radiusKm = (parseFloat(radiusMiles) * 1.60934).toFixed(2);
          url += `&radius=${radiusKm}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch by location');
        const data = await response.json();
        setRestaurants(data);
        setSearchQuery('');
        setSelectedCuisine('all');
        setSelectedPriceRange('all');
        setSelectedFeatures({
          isZabiha: false,
          hasPrayerRoom: false,
          hasHighChair: false,
          hasOutdoorSeating: false,
          isFullyHalal: false,
          servesAlcohol: false,
          isPartiallyHalal: false,
        });
        setShowingNearMe(true);
        if (!auto) localStorage.setItem('halal-atl-location-allowed', '1');
      } catch (err) {
        setLocationError('Failed to fetch restaurants by location.');
        setShowingNearMe(false);
      } finally {
        setIsLoading(false);
        setLocationLoading(false);
      }
    }, () => {
      setLocationError('Unable to retrieve your location.');
      setLocationLoading(false);
      setShowingNearMe(false);
      if (!auto) localStorage.removeItem('halal-atl-location-allowed');
    });
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full" data-testid="restaurant-list-container">
      <h1 className="text-4xl font-extrabold tracking-tight text-center sm:text-left mb-1 bg-gradient-to-r from-orange-500 via-orange-400 to-green-500 bg-clip-text text-transparent drop-shadow-md">
        Halal Bites ATL
      </h1>
      <div className="mb-8 bg-white z-10 p-4 shadow-sm" data-testid="restaurant-list-searchbar-section">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Search input and location controls */}
          <div className="flex-1 flex flex-col gap-2 sm:flex-row sm:gap-2 items-center">
            {/* Search input */}
            <div className="relative flex-grow min-w-[280px] max-w-full overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, cuisine, city, or zip code"
                className="w-full px-4 py-2 pl-10 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-400 text-xs sm:text-sm"
                data-testid="search-input"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  aria-label="Clear search"
                  tabIndex={0}
                >
                  <XMarkIcon className="h-5 w-5 text-gray-400" />
                </button>
              )}
            </div>
            {/* Minimal Radius and Near Me controls - improved mobile grouping */}
            <div className="w-full sm:w-auto">
              {/* Mobile layout */}
              <div className="bg-orange-50 rounded-xl p-4 flex flex-col items-center w-full max-w-xs mx-auto mb-2 shadow-sm sm:hidden">
                <div className="flex flex-row items-center gap-2 w-full justify-start overflow-x-auto">
                  <MapPinIcon className="h-5 w-5 text-orange-500 flex-shrink-0" />
                  <label htmlFor="radius-select" className="text-xs text-gray-700 flex-shrink-0">Distance:</label>
                  <select
                    id="radius-select"
                    value={radiusMiles}
                    onChange={e => setRadiusMiles(e.target.value)}
                    className="px-2 py-2 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 flex-shrink-0"
                    style={{ minWidth: 70 }}
                  >
                    <option value="3">3 mi</option>
                    <option value="5">5 mi</option>
                    <option value="10">10 mi</option>
                    <option value="all">All</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleLocationSearch(false)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg shadow-md hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-xs flex-shrink-0"
                    disabled={locationLoading}
                    style={{ minWidth: 80 }}
                  >
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {locationLoading ? 'Locating...' : 'Near Me'}
                  </button>
                </div>
                <div className="mt-2 w-full text-center">
                  <div className="text-xs text-gray-500">Choose distance and tap Near Me.</div>
                  {showingNearMe && !locationError && (
                    <div className="text-xs text-green-600 mt-1">Showing results near you.</div>
                  )}
                  {locationError && (
                    <div className="text-xs text-red-600 mt-1">{locationError}</div>
                  )}
                </div>
                {/* Mobile Filters Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-full shadow-md hover:from-orange-500 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 text-xs font-semibold tracking-wide w-full mt-3 sm:hidden transition-all duration-150 active:scale-95 cursor-pointer"
                  data-testid="filters-button-mobile"
                  type="button"
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  <span>Filters</span>
                </button>
              </div>
              {/* Desktop/tablet layout */}
              <div className="hidden sm:flex flex-col gap-y-1 w-full sm:max-w-md">
                {/* Controls row */}
                <div className="flex flex-row items-end gap-x-2 w-full">
                  <MapPinIcon className="h-5 w-5 text-orange-500" />
                  <label htmlFor="radius-select" className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">Distance:</label>
                  <select
                    id="radius-select"
                    value={radiusMiles}
                    onChange={e => setRadiusMiles(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                    style={{ minWidth: 80 }}
                    data-testid="radius-select"
                    title="Search radius"
                  >
                    <option value="3">3 mi</option>
                    <option value="5">5 mi</option>
                    <option value="10">10 mi</option>
                    <option value="all">All</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleLocationSearch(false)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg shadow-md hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-xs sm:text-sm whitespace-nowrap justify-center"
                    disabled={locationLoading}
                    data-testid="location-search-button"
                    title="Search by your current location"
                  >
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {locationLoading ? 'Locating...' : 'Near Me'}
                  </button>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-full shadow-md hover:from-orange-500 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 text-xs sm:text-sm whitespace-nowrap justify-center transition-all duration-150 active:scale-95 cursor-pointer"
                    data-testid="filters-button"
                  >
                    <AdjustmentsHorizontalIcon className="h-5 w-5" />
                    <span className="font-semibold tracking-wide">Filters</span>
                  </button>
                </div>
                {/* Helper/success/error messages row */}
                <div className="flex flex-row justify-between items-center mt-1 min-h-[20px] w-full">
                  <div className="text-xs text-gray-500 flex-1 text-left">
                    Select a distance and click Near Me to use your location.
                  </div>
                  <div className="flex-1 text-right">
                    {showingNearMe && !locationError && (
                      <span className="text-xs text-green-600">Showing results near you.</span>
                    )}
                    {locationError && (
                      <span className="text-xs text-red-600">{locationError}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                className="w-full px-1 py-0.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 text-xs"
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
                className="w-full px-1 py-0.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 text-xs"
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
                className="w-full px-1 py-0.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 text-xs"
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

            {/* Features Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <label className="flex items-center space-x-2 p-1 min-h-[28px] w-full rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer bg-white text-xs">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.isZabiha}
                    onChange={() => handleFeatureChange('isZabiha')}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
                  />
                  <span className="text-xs text-gray-700">Zabiha</span>
                </label>
                <label className="flex items-center space-x-2 p-1 min-h-[28px] w-full rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer bg-white text-xs">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.hasPrayerRoom}
                    onChange={() => handleFeatureChange('hasPrayerRoom')}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
                  />
                  <span className="text-xs text-gray-700">Prayer Space</span>
                </label>
                <label className="flex items-center space-x-2 p-1 min-h-[28px] w-full rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer bg-white text-xs">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.hasHighChair}
                    onChange={() => handleFeatureChange('hasHighChair')}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
                  />
                  <span className="text-xs text-gray-700">High Chairs</span>
                </label>
                <label className="flex items-center space-x-2 p-1 min-h-[28px] w-full rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer bg-white text-xs">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.hasOutdoorSeating}
                    onChange={() => handleFeatureChange('hasOutdoorSeating')}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
                  />
                  <span className="text-xs text-gray-700">Outdoor Seating</span>
                </label>
                <label className="flex items-center space-x-2 p-1 min-h-[28px] w-full rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer bg-white text-xs">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.isFullyHalal}
                    onChange={() => handleFeatureChange('isFullyHalal')}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
                  />
                  <span className="text-xs text-gray-700">Fully Halal</span>
                </label>
                <label className="flex items-center space-x-2 p-1 min-h-[28px] w-full rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer bg-white text-xs">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.servesAlcohol}
                    onChange={() => handleFeatureChange('servesAlcohol')}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
                  />
                  <span className="text-xs text-gray-700">No Alcohol</span>
                </label>
                <label className="flex items-center space-x-2 p-1 min-h-[28px] w-full rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer bg-white text-xs">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.isPartiallyHalal}
                    onChange={() => handleFeatureChange('isPartiallyHalal')}
                    className="rounded border-yellow-400 text-gray-700 focus:ring-yellow-500 h-4 w-4"
                  />
                  <span className="text-xs text-gray-700">Partially Halal</span>
                </label>
              </div>
            </div>

            {/* Clear All Filters Button */}
            <button
              type="button"
              className="mt-2 w-full px-1 py-0.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-xs"
              onClick={() => {
                setSelectedCuisine('all');
                setSelectedPriceRange('all');
                setSortBy('name-asc');
                setSelectedFeatures({
                  isZabiha: false,
                  hasPrayerRoom: false,
                  hasHighChair: false,
                  hasOutdoorSeating: false,
                  isFullyHalal: false,
                  servesAlcohol: false,
                  isPartiallyHalal: false,
                });
                setSearchQuery('');
              }}
              data-testid="clear-filters-button"
            >
              Clear All Filters
            </button>
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
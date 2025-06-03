'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Restaurant } from '@/types';
import { CuisineType } from '@prisma/client';
import { formatCuisineName } from '@/utils/formatCuisineName';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { useRouter } from 'next/navigation';
import RestaurantFeatureFilters from '../RestaurantFeatureFilters';
import RestaurantSearchBar from '../RestaurantSearchBar';
import RestaurantFilterControls from '../RestaurantFilterControls';
import RestaurantListLoadingSkeleton from './LoadingSkeleton';
import RestaurantListItems from './ListItems';
import RestaurantResultsCount from '../RestaurantResultsCount';

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
  const router = useRouter();

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
      } catch {
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

  // Helper to clear near me mode and fetch all restaurants
  const handleClearNearMe = async () => {
    setLocationError(null);
    setShowingNearMe(false);
    setIsLoading(true);
    try {
      const response = await fetch('/api/restaurants');
      if (!response.ok) throw new Error('Failed to fetch restaurants');
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch restaurants');
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
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
      <Button
        variant="ghost"
        className="mx-auto block p-0 bg-transparent hover:bg-transparent focus:bg-transparent shadow-none"
        onClick={() => {
          router.push('/');
          window.location.reload();
        }}
        aria-label="Refresh Home Page"
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-center mb-1 bg-gradient-to-r from-orange-500 via-orange-400 to-green-500 bg-clip-text text-transparent drop-shadow-md">
          Halal Bites ATL
        </h1>
      </Button>
      <div className="mb-8 bg-white z-10 p-4 shadow-sm" data-testid="restaurant-list-searchbar-section">
        <RestaurantSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          radiusMiles={radiusMiles}
          setRadiusMiles={setRadiusMiles}
          locationLoading={locationLoading}
          handleLocationSearch={() => handleLocationSearch(false)}
          showingNearMe={showingNearMe}
          locationError={locationError}
          handleClearNearMe={handleClearNearMe}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />

        {showFilters && (
          <Card className="bg-white rounded-lg shadow-lg p-4 mb-4 space-y-4" data-testid="filters-panel">
            <RestaurantFilterControls
              sortBy={sortBy}
              setSortBy={(value) => setSortBy(value as typeof sortBy)}
              selectedCuisine={selectedCuisine}
              setSelectedCuisine={(value) => setSelectedCuisine(value as typeof selectedCuisine)}
              selectedPriceRange={selectedPriceRange}
              setSelectedPriceRange={(value) => setSelectedPriceRange(value as typeof selectedPriceRange)}
              restaurants={restaurants}
              formatCuisineName={formatCuisineName as (cuisine: string) => string}
            />

            {/* Features Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <RestaurantFeatureFilters
                selectedFeatures={selectedFeatures}
                onFeatureChange={handleFeatureChange}
              />
            </div>

            {/* Clear All Filters Button */}
            <Button
              variant="outline"
              size="sm"
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
            </Button>
          </Card>
        )}

        {/* Results count */}
        <RestaurantResultsCount isLoading={isLoading} filteredCount={filteredCount} />
      </div>

      {/* Restaurant List */}
      {isLoading ? (
        <RestaurantListLoadingSkeleton count={3} />
      ) : displayedRestaurants.length > 0 ? (
        <>
          <RestaurantListItems
            restaurants={displayedRestaurants}
            lastRestaurantRef={lastRestaurantRef}
          />
          {hasMore && (
            <div className="flex justify-center p-4" data-testid="restaurant-list-has-more-spinner">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12" data-testid="restaurant-list-no-results">
          <p className="text-gray-600">No restaurants found matching your criteria.</p>
        </div>
      )}
    </div>
  );
} 
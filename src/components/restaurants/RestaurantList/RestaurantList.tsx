'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Restaurant } from '@/types';
import { CuisineType } from '@prisma/client';
import { formatCuisineName } from '@/utils/formatCuisineName';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { ConfirmationDialog } from '../../ui/ConfirmationDialog';
import RestaurantFeatureFilters from '../RestaurantFeatureFilters';
import RestaurantSearchBar from '../RestaurantSearchBar';
import RestaurantFilterControls from '../RestaurantFilterControls';
import RestaurantListLoadingSkeleton from './LoadingSkeleton';
import RestaurantListItems from './ListItems';
import RestaurantResultsCount from '../RestaurantResultsCount';
import QuickFilterChips from '../QuickFilterChips';

const ITEMS_PER_PAGE = 10;

interface RestaurantListProps {
  initialSearch?: string;
  aboveResults?: React.ReactNode;
  setSearchQuery?: (q: string) => void;
  firstResultRef?: React.RefObject<HTMLDivElement>;
}

export default function RestaurantList({ initialSearch = '', aboveResults, setSearchQuery, firstResultRef }: RestaurantListProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [displayedRestaurants, setDisplayedRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, _setSearchQuery] = useState(initialSearch);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialSearch);
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
  const [showLocationConfirmDialog, setShowLocationConfirmDialog] = useState(false);

  const handleSetSearchQuery = (q: string) => {
    if (setSearchQuery) {
      setSearchQuery(q);
    } else {
      _setSearchQuery(q);
    }
  };

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

  // Sync searchQuery with initialSearch if not controlled
  useEffect(() => {
    if (!setSearchQuery) {
      _setSearchQuery(initialSearch);
      setDebouncedSearchQuery(initialSearch);
    }
  }, [initialSearch, setSearchQuery]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(setSearchQuery ? initialSearch : searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, initialSearch, setSearchQuery]);

  // Use the correct search query depending on controlled/uncontrolled mode
  const effectiveSearchQuery = setSearchQuery ? initialSearch : debouncedSearchQuery;

  // Filter and sort restaurants
  useEffect(() => {
    const filteredRestaurants = restaurants.filter(restaurant => {
      const matchesCuisine = selectedCuisine === 'all' || restaurant.cuisineType === selectedCuisine;
      const matchesPriceRange = selectedPriceRange === 'all' || restaurant.priceRange === selectedPriceRange;
      const matchesSearch = !effectiveSearchQuery || 
        restaurant.name.toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
        restaurant.cuisineType.toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
        restaurant.address.match(/\b\d{5}\b/)?.[0]?.includes(effectiveSearchQuery);
      
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
  }, [restaurants, effectiveSearchQuery, selectedCuisine, selectedPriceRange, sortBy, page, selectedFeatures]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [effectiveSearchQuery, selectedCuisine, selectedPriceRange, sortBy, selectedFeatures]);

  // Add state for filtered count
  const [filteredCount, setFilteredCount] = useState(0);

  // Calculate active filter count
  const activeFilterCount = useCallback(() => {
    let count = 0;
    if (selectedCuisine !== 'all') count++;
    if (selectedPriceRange !== 'all') count++;
    if (sortBy !== 'name-asc') count++;
    if (Object.values(selectedFeatures).some(v => v === true)) {
      count += Object.values(selectedFeatures).filter(v => v === true).length;
    }
    return count;
  }, [selectedCuisine, selectedPriceRange, sortBy, selectedFeatures]);

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
    if (!auto) {
      setLocationLoading(true);
    }
    setLocationError(null);

    // Safety: if browser never calls success/error (e.g. prompt ignored), clear loading after 20s
    const safetyTimeoutId = setTimeout(() => {
      setLocationLoading(false);
      setLocationError('Location request timed out. Please try again.');
      setShowingNearMe(false);
    }, 20000);

    const clearSafety = () => clearTimeout(safetyTimeoutId);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearSafety();
        const { latitude, longitude } = position.coords;
        const doFetch = async () => {
          try {
            setIsLoading(true);
            let url = `/api/restaurants?lat=${latitude}&lng=${longitude}`;
            if (radiusMiles !== 'all') {
              const radiusKm = (parseFloat(radiusMiles) * 1.60934).toFixed(2);
              url += `&radius=${radiusKm}`;
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch by location');
            const data = await response.json();
            setRestaurants(data);
            handleSetSearchQuery('');
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
        };
        void doFetch();
      },
      (err: GeolocationPositionError) => {
        clearSafety();
        const message =
          err?.code === 1
            ? 'Location permission denied. Allow location in your browser or device settings and try again.'
            : err?.code === 2
              ? 'Location unavailable. Turn on location services and try again.'
              : err?.code === 3
                ? 'Location request timed out. Please try again.'
                : 'Unable to retrieve your location. Use HTTPS, allow location access, and ensure location services are on.';
        setLocationError(message);
        setLocationLoading(false);
        setShowingNearMe(false);
        if (!auto) localStorage.removeItem('halal-atl-location-allowed');
      },
      { timeout: 15000, maximumAge: 0, enableHighAccuracy: false }
    );
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
      <div className="p-5 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full" data-testid="restaurant-list-container">
      <ConfirmationDialog
        open={showLocationConfirmDialog}
        onConfirm={() => {
          setShowLocationConfirmDialog(false);
          handleLocationSearch(false);
        }}
        onCancel={() => setShowLocationConfirmDialog(false)}
        title="Use your location?"
        message="We'll use your location to show restaurants near you. Your browser may ask for permission."
        confirmText="Use my location"
        cancelText="Cancel"
        confirmPrimary
        icon={<MapPinIcon className="h-7 w-7 sm:h-6 sm:w-6 text-teal-600" />}
        iconContainerClassName="bg-teal-100"
        testIds={{ root: 'location-confirm-dialog', confirm: 'location-confirm-use', cancel: 'location-confirm-cancel' }}
      />
      {/* Hero */}
      <header className="text-center mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 mb-2">
          Halal Bites ATL
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-md mx-auto">
          Discover halal restaurants and cafes across Atlanta, GA
        </p>
      </header>

      {aboveResults}

      <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-soft z-10" data-testid="restaurant-list-searchbar-section">
        <RestaurantSearchBar
          searchQuery={effectiveSearchQuery}
          setSearchQuery={handleSetSearchQuery}
          radiusMiles={radiusMiles}
          setRadiusMiles={setRadiusMiles}
          locationLoading={locationLoading}
          handleLocationSearch={() => setShowLocationConfirmDialog(true)}
          onLocationRetry={() => handleLocationSearch(false)}
          showingNearMe={showingNearMe}
          locationError={locationError}
          handleClearNearMe={handleClearNearMe}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          activeFilterCount={activeFilterCount()}
        />

        {showFilters && (
          <Card className="bg-stone-50/80 rounded-xl border border-stone-200 p-4 sm:p-5 mb-4 space-y-4" data-testid="filters-panel">
            {/* Quick Filter Chips */}
            <QuickFilterChips
              selectedCuisine={selectedCuisine}
              selectedPriceRange={selectedPriceRange}
              selectedFeatures={selectedFeatures}
              onRemoveCuisine={() => setSelectedCuisine('all')}
              onRemovePriceRange={() => setSelectedPriceRange('all')}
              onRemoveFeature={handleFeatureChange}
              formatCuisineName={formatCuisineName as (cuisine: string) => string}
            />

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

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
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
                handleSetSearchQuery('');
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
          {displayedRestaurants.map((restaurant, idx) => (
            <div
              key={restaurant.id}
              ref={idx === 0 ? firstResultRef : undefined}
              className="w-full"
            >
              <RestaurantListItems
                restaurants={[restaurant]}
                lastRestaurantRef={lastRestaurantRef}
              />
            </div>
          ))}
          {hasMore && (
            <div className="flex justify-center p-6" data-testid="restaurant-list-has-more-spinner">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-stone-200 border-t-teal-600"></div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 rounded-2xl border border-stone-200 bg-white" data-testid="restaurant-list-no-results">
          <p className="text-stone-600">No restaurants found matching your criteria.</p>
        </div>
      )}
    </div>
  );
} 
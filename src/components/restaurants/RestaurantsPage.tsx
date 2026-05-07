import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapPinIcon, ListBulletIcon, MapIcon } from '@heroicons/react/24/outline';
import { Restaurant } from '@/types';
import { CuisineType } from '@prisma/client';
import { formatCuisineName } from '@/utils/formatCuisineName';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import RestaurantSearchBar from './RestaurantSearchBar';
import RestaurantFilterControls from './RestaurantFilterControls';
import RestaurantFeatureFilters from './RestaurantFeatureFilters';
import RestaurantListLoadingSkeleton from './RestaurantList/LoadingSkeleton';
import RestaurantResultsCount from './RestaurantResultsCount';
import RestaurantListItems from './RestaurantList/ListItems';

// Leaflet map must be loaded client-side only (uses browser APIs)
const RestaurantMapView = dynamic(() => import('./RestaurantMapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-2xl border border-stone-200 bg-stone-50 flex items-center justify-center" style={{ height: '560px' }}>
      <div className="flex flex-col items-center gap-3 text-stone-400">
        <div className="h-8 w-8 border-2 border-stone-300 border-t-teal-500 rounded-full animate-spin" />
        <span className="text-sm">Loading map…</span>
      </div>
    </div>
  ),
});

const ITEMS_PER_PAGE = 10;

interface RestaurantsPageProps {
  initialSearch?: string;
}

const RestaurantsPage: React.FC<RestaurantsPageProps> = ({ initialSearch = '' }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [displayedRestaurants, setDisplayedRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType | 'all'>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'rating-desc' | 'comments-desc'>('name-asc');
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
  const [view, setView] = useState<'list' | 'map'>('list');
  const [allFilteredRestaurants, setAllFilteredRestaurants] = useState<Restaurant[]>([]);

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
        case 'rating-desc':
          return (b.avgRating ?? -1) - (a.avgRating ?? -1);
        case 'comments-desc':
          return b.commentCount - a.commentCount;
        default:
          return 0;
      }
    });
    setFilteredCount(filteredRestaurants.length);
    setAllFilteredRestaurants(filteredRestaurants);
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
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
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
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
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
      <RestaurantSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
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
      />
      <div className="mb-8 bg-white z-10 p-4 shadow-sm" data-testid="restaurant-list-searchbar-section">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <RestaurantFeatureFilters
                selectedFeatures={selectedFeatures}
                onFeatureChange={handleFeatureChange}
              />
            </div>
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
        <div className="flex items-center justify-between gap-2">
          <RestaurantResultsCount isLoading={isLoading} filteredCount={filteredCount} />
          {/* Map / List view toggle */}
          <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1 flex-shrink-0" role="group" aria-label="View toggle">
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === 'list'
                  ? 'bg-white text-teal-700 shadow-sm border border-stone-200'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
              aria-pressed={view === 'list'}
            >
              <ListBulletIcon className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setView('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === 'map'
                  ? 'bg-white text-teal-700 shadow-sm border border-stone-200'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
              aria-pressed={view === 'map'}
            >
              <MapIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Map View */}
      {view === 'map' && (
        <div className="px-1">
          <RestaurantMapView restaurants={allFilteredRestaurants} />
        </div>
      )}

      {/* Restaurant List */}
      {view === 'list' && (isLoading ? (
        <RestaurantListLoadingSkeleton count={3} />
      ) : displayedRestaurants.length > 0 ? (
        <RestaurantListItems
          restaurants={displayedRestaurants}
          lastRestaurantRef={lastRestaurantRef}
        />
      ) : (
        <div className="text-center py-12" data-testid="restaurant-list-no-results">
          <p className="text-gray-600">No restaurants found matching your criteria.</p>
        </div>
      ))}
    </div>
  );
};

export default RestaurantsPage; 
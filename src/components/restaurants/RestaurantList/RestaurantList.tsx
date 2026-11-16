'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Restaurant } from '@/types';
import { CuisineType } from '@prisma/client';
import { formatCuisineName } from '@/utils/formatCuisineName';
import { MapPinIcon, ListBulletIcon, MapIcon } from '@heroicons/react/24/outline';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { ConfirmationDialog } from '../../ui/ConfirmationDialog';
import RestaurantFeatureFilters from '../RestaurantFeatureFilters';
import RestaurantSearchBar from '../RestaurantSearchBar';
import RestaurantFilterControls from '../RestaurantFilterControls';
import RestaurantListLoadingSkeleton from './LoadingSkeleton';
import RestaurantCard from '../../cards/RestaurantCard';
import BrandCard from '../../cards/BrandCard';
import { groupRestaurants, type CardEntry } from '@/utils/groupRestaurants';
import RestaurantResultsCount from '../RestaurantResultsCount';
import QuickFilterChips from '../QuickFilterChips';

// Leaflet must be loaded client-side only (uses browser APIs)
const RestaurantMapView = dynamic(() => import('../RestaurantMapView'), {
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

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'rating-desc' | 'comments-desc' | 'distance-asc';

const NO_FEATURES = {
  isZabiha: false,
  hasPrayerRoom: false,
  hasHighChair: false,
  hasOutdoorSeating: false,
  isFullyHalal: false,
  servesAlcohol: false,
  isPartiallyHalal: false,
};

interface RestaurantListProps {
  initialSearch?: string;
  aboveResults?: React.ReactNode;
  setSearchQuery?: (q: string) => void;
  firstResultRef?: React.RefObject<HTMLDivElement>;
}

export default function RestaurantList({ initialSearch = '', aboveResults, setSearchQuery, firstResultRef }: RestaurantListProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [totalUniqueCount, setTotalUniqueCount] = useState<number>(0);
  const [displayedEntries, setDisplayedEntries] = useState<CardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, _setSearchQuery] = useState(initialSearch);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialSearch);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType | 'all'>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [allFilteredRestaurants, setAllFilteredRestaurants] = useState<Restaurant[]>([]);
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
  }>(NO_FEATURES);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [radiusMiles, setRadiusMiles] = useState<string>('5'); // Default to 5 miles
  const [showingNearMe, setShowingNearMe] = useState(false);
  const [showLocationConfirmDialog, setShowLocationConfirmDialog] = useState(false);
  // City/ZIP fallback (used when device location is denied/unavailable)
  const [locationQuery, setLocationQuery] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [showCityZip, setShowCityZip] = useState(false);
  // Remember the last searched coordinates so changing the distance re-filters in place.
  const lastCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

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
        setTotalUniqueCount(new Set(data.map((r: Restaurant) => r.brandId ?? r.id)).size);
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
        case 'rating-desc':
          return (b.avgRating ?? -1) - (a.avgRating ?? -1);
        case 'comments-desc':
          return b.commentCount - a.commentCount;
        case 'distance-asc':
          // Near Me results carry a distance; anything without one goes last.
          return (a.distance ?? Infinity) - (b.distance ?? Infinity);
        default:
          return 0;
      }
    });

    // Collapse multi-location brands into single cards. Order is preserved, so with the
    // distance sort a brand's nearest location represents it and places the card.
    const entries = groupRestaurants(filteredRestaurants);

    setFilteredCount(entries.length);
    setAllFilteredRestaurants(filteredRestaurants); // map view keeps every location pin

    // Paginate over grouped entries
    const endIndex = page * ITEMS_PER_PAGE;
    setDisplayedEntries(entries.slice(0, endIndex));
    setHasMore(endIndex < entries.length);
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
    // The default sort is name order, or nearest-first while Near Me is on.
    if (sortBy !== (showingNearMe ? 'distance-asc' : 'name-asc')) count++;
    if (Object.values(selectedFeatures).some(v => v === true)) {
      count += Object.values(selectedFeatures).filter(v => v === true).length;
    }
    return count;
  }, [selectedCuisine, selectedPriceRange, sortBy, selectedFeatures, showingNearMe]);

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

  // Fetch + display restaurants near a given coordinate. Shared by the device-location
  // ("Near Me") flow, the city/ZIP fallback, and the mobile distance re-filter.
  // radiusOverride lets callers pass a just-chosen radius without waiting for state to settle.
  const applyProximityResults = useCallback(async (latitude: number, longitude: number, radiusOverride?: string): Promise<boolean> => {
    lastCoordsRef.current = { lat: latitude, lng: longitude };
    const effectiveRadius = radiusOverride ?? radiusMiles;
    try {
      setIsLoading(true);
      let url = `/api/restaurants?lat=${latitude}&lng=${longitude}`;
      if (effectiveRadius !== 'all') {
        const radiusKm = (parseFloat(effectiveRadius) * 1.60934).toFixed(2);
        url += `&radius=${radiusKm}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch by location');
      const data = await response.json();
      setRestaurants(data);
      // A typed name/ZIP search would fight the location search, so it is cleared. Cuisine,
      // price and feature filters (Zabihah, Fully Halal, No Alcohol) are kept, so a user who
      // tapped Zabihah and then Near Me sees Zabihah places nearby.
      handleSetSearchQuery('');
      // Entering Near Me sorts nearest-first; re-filtering by a new distance keeps the
      // user's chosen sort.
      if (!showingNearMe) setSortBy('distance-asc');
      setShowingNearMe(true);
      return true;
    } catch {
      setLocationError('Failed to fetch restaurants by location.');
      setShowingNearMe(false);
      return false;
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiusMiles, showingNearMe]);

  // Geocode a typed city or ZIP, then show restaurants near it (location-denied fallback).
  const handleCityZipSearch = useCallback(async () => {
    const q = locationQuery.trim();
    if (!q) return;
    setLocationError(null);
    setGeocoding(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({} as { error?: string }));
        setLocationError(body.error || 'We could not find that location. Try a city or ZIP.');
        return;
      }
      const { lat, lng } = await res.json();
      await applyProximityResults(lat, lng);
    } catch {
      setLocationError('We could not search that location. Please try again.');
    } finally {
      setGeocoding(false);
    }
  }, [locationQuery, applyProximityResults]);

  // Mobile distance pills: change the radius and, when already showing Near Me results,
  // re-filter around the same coordinates immediately (no need to tap Near Me again).
  // Desktop keeps the plain setRadiusMiles + tap flow.
  const handleRadiusChange = useCallback((value: string) => {
    setRadiusMiles(value);
    if (showingNearMe && lastCoordsRef.current) {
      void applyProximityResults(lastCoordsRef.current.lat, lastCoordsRef.current.lng, value);
    }
  }, [showingNearMe, applyProximityResults]);

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
        void applyProximityResults(latitude, longitude).then((ok) => {
          if (ok && !auto) localStorage.setItem('halal-atl-location-allowed', '1');
          setLocationLoading(false);
        });
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
    // Without Near Me there are no distances to sort by.
    setSortBy(prev => (prev === 'distance-asc' ? 'name-asc' : prev));
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
      {/* Hero. Below sm it is a one-line title only, so the first result starts on screen;
          the badge and subtitle show from sm up. */}
      <header className="text-center mb-3 sm:mb-10 px-2">
        {/* Pill badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200/80 text-teal-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-4 shadow-sm">
          🕌 <span>Atlanta&apos;s Halal Restaurant Guide</span>
        </div>
        <h1 className="text-xl sm:text-4xl font-bold tracking-tight text-stone-900 sm:mb-3 leading-tight">
          Find Halal Food in{' '}
          <span className="text-teal-600">Atlanta</span>
        </h1>
        <p className="hidden sm:block text-stone-500 text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
          {!isLoading && totalUniqueCount > 0
            ? `Explore ${totalUniqueCount} halal-verified restaurants & cafes across Metro Atlanta`
            : 'Discover halal-verified restaurants & cafes across Metro Atlanta'}
        </p>
      </header>

      {aboveResults}

      <div className="mb-4 sm:mb-8 rounded-2xl border border-stone-200 bg-white p-3 sm:p-5 shadow-soft z-10 ring-1 ring-teal-100/40" data-testid="restaurant-list-searchbar-section">
        <RestaurantSearchBar
          searchQuery={effectiveSearchQuery}
          setSearchQuery={handleSetSearchQuery}
          radiusMiles={radiusMiles}
          setRadiusMiles={setRadiusMiles}
          onRadiusChange={handleRadiusChange}
          locationLoading={locationLoading}
          handleLocationSearch={() => setShowLocationConfirmDialog(true)}
          onLocationRetry={() => handleLocationSearch(false)}
          showingNearMe={showingNearMe}
          locationError={locationError}
          handleClearNearMe={handleClearNearMe}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          activeFilterCount={activeFilterCount()}
          locationQuery={locationQuery}
          setLocationQuery={setLocationQuery}
          handleCityZipSearch={handleCityZipSearch}
          geocoding={geocoding}
          showCityZip={showCityZip}
          setShowCityZip={setShowCityZip}
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
              setSortBy={(value) => setSortBy(value as SortOption)}
              showDistanceSort={showingNearMe}
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
                setSortBy(showingNearMe ? 'distance-asc' : 'name-asc');
                setSelectedFeatures(NO_FEATURES);
                handleSetSearchQuery('');
              }}
              data-testid="clear-filters-button"
            >
              Clear All Filters
            </Button>
          </Card>
        )}

        {/* Zabiha / Halal / No Alcohol — always-visible quick-filter pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          {(
            [
              { key: 'isZabiha',     label: '🥩 Zabihah',    activeClass: 'bg-amber-500 text-white border-amber-500',    inactiveClass: 'bg-white text-amber-700 border-amber-300 hover:border-amber-500 hover:bg-amber-50' },
              { key: 'isFullyHalal', label: '✅ Fully Halal', activeClass: 'bg-teal-600 text-white border-teal-600',      inactiveClass: 'bg-white text-teal-700 border-teal-300 hover:border-teal-500 hover:bg-teal-50'   },
              { key: 'servesAlcohol',label: '🚫 No Alcohol',  activeClass: 'bg-rose-500 text-white border-rose-500',      inactiveClass: 'bg-white text-rose-700 border-rose-300 hover:border-rose-500 hover:bg-rose-50'    },
            ] as const
          ).map(({ key, label, activeClass, inactiveClass }) => (
            <button
              key={key}
              onClick={() => handleFeatureChange(key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedFeatures[key] ? activeClass : inactiveClass
              }`}
              aria-pressed={selectedFeatures[key]}
              data-testid={`feature-pill-${key}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Results count + Map/List toggle */}
        <div className="flex items-center justify-between gap-2 mt-3">
          <RestaurantResultsCount isLoading={isLoading} filteredCount={filteredCount} />
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
        <RestaurantMapView restaurants={allFilteredRestaurants} />
      )}

      {/* Restaurant List */}
      {view === 'list' && (
        isLoading ? (
          <RestaurantListLoadingSkeleton count={3} />
        ) : displayedEntries.length > 0 ? (
          <div className="flex flex-col gap-4 sm:gap-5">
            {displayedEntries.map((entry, idx) => (
              <div
                key={entry.key}
                ref={idx === 0 ? firstResultRef : undefined}
                className="w-full"
                data-testid={`restaurant-list-item-${entry.key}`}
              >
                <div ref={idx === displayedEntries.length - 1 ? lastRestaurantRef : undefined}>
                  {entry.kind === 'brand' ? (
                    <BrandCard
                      brandName={entry.brandName}
                      representative={entry.representative}
                      locations={entry.locations}
                    />
                  ) : (
                    <RestaurantCard restaurant={entry.restaurant} />
                  )}
                </div>
              </div>
            ))}
            {hasMore && (
              <div className="flex justify-center p-6" data-testid="restaurant-list-has-more-spinner">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-stone-200 border-t-teal-600"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center" data-testid="restaurant-list-no-results">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-stone-800 font-semibold text-lg mb-1">No restaurants found</p>

            {/* What caused it */}
            {effectiveSearchQuery ? (
              <p className="text-stone-500 text-sm mb-5">
                No results for &ldquo;<span className="font-medium text-stone-700">{effectiveSearchQuery}</span>&rdquo;
                {(selectedCuisine !== 'all' || selectedPriceRange !== 'all' || Object.values(selectedFeatures).some(Boolean))
                  ? ' with your current filters applied.'
                  : '.'}
              </p>
            ) : (
              <p className="text-stone-500 text-sm mb-5">
                Your current filters didn&apos;t match any restaurants.
              </p>
            )}

            {/* Suggested actions */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {effectiveSearchQuery && (
                <button
                  onClick={() => handleSetSearchQuery('')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-300 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  ✕ Clear &ldquo;{effectiveSearchQuery}&rdquo;
                </button>
              )}
              {selectedCuisine !== 'all' && (
                <button
                  onClick={() => setSelectedCuisine('all')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-300 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  ✕ Remove cuisine filter
                </button>
              )}
              {selectedPriceRange !== 'all' && (
                <button
                  onClick={() => setSelectedPriceRange('all')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-300 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  ✕ Remove price filter
                </button>
              )}
              {Object.values(selectedFeatures).some(Boolean) && (
                <button
                  onClick={() => setSelectedFeatures(NO_FEATURES)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-300 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  ✕ Remove feature filters
                </button>
              )}
            </div>

            {/* Browse available cuisines */}
            {(() => {
              const availableCuisines = Array.from(new Set(restaurants.map(r => r.cuisineType)))
                .filter(c => c !== 'OTHER')
                .sort()
                .slice(0, 6);
              return availableCuisines.length > 0 ? (
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold mb-2">Browse by cuisine</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {availableCuisines.map(cuisine => (
                      <button
                        key={cuisine}
                        onClick={() => { setSelectedCuisine(cuisine as typeof selectedCuisine); handleSetSearchQuery(''); }}
                        className="inline-flex items-center px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-medium hover:bg-teal-100 transition-colors"
                      >
                        {formatCuisineName(cuisine)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )
      )}
    </div>
  );
} 
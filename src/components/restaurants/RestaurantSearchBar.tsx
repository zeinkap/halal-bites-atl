import React from 'react';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';

interface RestaurantSearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  radiusMiles: string;
  setRadiusMiles: (value: string) => void;
  /** Mobile distance pills: change radius and re-filter in place when already in Near Me mode. */
  onRadiusChange?: (value: string) => void;
  locationLoading: boolean;
  handleLocationSearch: () => void;
  /** Optional: when provided, Retry button uses this instead of handleLocationSearch (e.g. to skip the location confirmation dialog). */
  onLocationRetry?: () => void;
  showingNearMe: boolean;
  locationError: string | null;
  handleClearNearMe: () => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  activeFilterCount?: number;
  /** City/ZIP fallback (mobile) — used when device location is denied/unavailable. */
  locationQuery?: string;
  setLocationQuery?: (value: string) => void;
  handleCityZipSearch?: () => void;
  geocoding?: boolean;
  showCityZip?: boolean;
  setShowCityZip?: (value: boolean) => void;
}

const RADIUS_OPTIONS = [
  { value: '3', label: '3 mi' },
  { value: '5', label: '5 mi' },
  { value: '10', label: '10 mi' },
  { value: 'all', label: 'Any' },
] as const;

const RestaurantSearchBar: React.FC<RestaurantSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  radiusMiles,
  setRadiusMiles,
  onRadiusChange,
  locationLoading,
  handleLocationSearch,
  onLocationRetry,
  showingNearMe,
  locationError,
  handleClearNearMe,
  showFilters,
  setShowFilters,
  activeFilterCount = 0,
  locationQuery = '',
  setLocationQuery,
  handleCityZipSearch,
  geocoding = false,
  showCityZip = false,
  setShowCityZip,
}) => (
  <>
    {/* Desktop: Search input row */}
    <div className="hidden sm:flex justify-center mb-3 w-full">
      <div className="relative w-full max-w-xl">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setSearchQuery('');
              e.currentTarget.blur();
            }
          }}
          placeholder="Search by name, cuisine, or zip code"
          className="w-full px-4 py-3 pl-11 pr-10 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 text-stone-900 placeholder-stone-400 text-sm transition-colors"
          data-testid="search-input"
          aria-label="Search restaurants"
        />
        <MagnifyingGlassIcon className="h-5 w-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-stone-200/80 focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-stone-500"
            aria-label="Clear search"
            data-testid="search-clear-button"
            tabIndex={0}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>

    {/* Desktop: Controls row below search */}
    <div className="hidden sm:flex w-full justify-center mt-3">
      <div className="flex flex-row items-center gap-3 max-w-xl w-full justify-center flex-wrap">
        <MapPinIcon className="h-5 w-5 text-teal-600 flex-shrink-0" />
        <label htmlFor="radius-select" className="text-sm text-stone-600 whitespace-nowrap flex-shrink-0">Distance:</label>
        <select
          id="radius-select"
          value={radiusMiles}
          onChange={(e) => setRadiusMiles(e.target.value)}
          className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 text-stone-800 min-w-[100px]"
          data-testid="radius-select"
          title="Search radius"
        >
          <option value="3">3 mi</option>
          <option value="5">5 mi</option>
          <option value="10">10 mi</option>
          <option value="all">All</option>
        </select>
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleLocationSearch()}
          disabled={locationLoading}
          data-testid="location-search-button"
          title="Search by your current location"
          className="min-w-[120px] flex items-center justify-center"
        >
          <MapPinIcon className="h-4 w-4 mr-1.5" />
          {locationLoading ? 'Locating...' : 'Near Me'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          data-testid="filters-button"
          className="min-w-[110px] flex items-center justify-center relative"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-teal-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
              {activeFilterCount}
            </span>
          )}
        </Button>
        <div className="text-xs text-stone-500 flex items-center justify-center gap-2 flex-wrap">
          {showingNearMe && !locationError && (
            <>
              <span className="text-emerald-700 font-medium flex items-center gap-1" data-testid="near-me-chip">
                <MapPinIcon className="h-4 w-4" />
                Within {radiusMiles === 'all' ? 'all distances' : `${radiusMiles} mi`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearNearMe}
                className="px-2 py-1"
                aria-label="Clear Near Me"
                data-testid="clear-near-me-button"
                title="Show all restaurants"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </>
          )}
          {locationError && (
            <span className="text-red-600 flex items-center gap-1">
              <span>{locationError}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onLocationRetry ?? handleLocationSearch}
                disabled={locationLoading}
                className="px-2 py-1 text-xs"
                title="Retry location search"
              >
                Retry
              </Button>
            </span>
          )}
        </div>
      </div>
    </div>

    {/* Mobile — Near-Me-first */}
    <div className="flex flex-col sm:hidden gap-4 mb-4" data-testid="near-me-mobile">
      {/* Primary action: find restaurants near me */}
      <div className="rounded-2xl border border-teal-100 bg-gradient-to-b from-teal-50/90 to-white p-4 flex flex-col gap-3 shadow-sm">
        <Button
          variant="primary"
          onClick={handleLocationSearch}
          disabled={locationLoading}
          className="w-full flex items-center justify-center gap-2 py-3.5 text-base font-semibold"
          data-testid="location-search-button"
        >
          <MapPinIcon className="h-5 w-5" />
          {locationLoading ? 'Finding you…' : 'Find halal food near me'}
        </Button>

        {/* Distance — segmented control, default 5 mi */}
        <div>
          <p className="text-xs font-medium text-stone-500 mb-1.5 text-center">Within</p>
          <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Search distance">
            {RADIUS_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => (onRadiusChange ?? setRadiusMiles)(value)}
                aria-pressed={radiusMiles === value}
                data-testid={`radius-option-${value}`}
                className={`py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  radiusMiles === value
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-teal-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Status: active Near Me chip, or error + retry */}
        {showingNearMe && !locationError && (
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="text-emerald-700 font-semibold flex items-center gap-1" data-testid="near-me-chip">
              <MapPinIcon className="h-4 w-4" />
              Within {radiusMiles === 'all' ? 'all' : `${radiusMiles} mi`}
            </span>
            <Button variant="outline" size="sm" onClick={handleClearNearMe} className="px-2 py-1" aria-label="Clear Near Me" data-testid="clear-near-me-button">
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
        {locationError && (
          <div className="flex flex-col items-center gap-2 text-xs text-center">
            <span className="text-red-600">{locationError}</span>
            <Button variant="outline" size="sm" onClick={onLocationRetry ?? handleLocationSearch} disabled={locationLoading} className="px-2 py-1 text-xs">
              Retry
            </Button>
          </div>
        )}

        {/* City/ZIP fallback */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowCityZip?.(!showCityZip)}
            className="w-full text-xs font-medium text-teal-700 hover:text-teal-800 flex items-center justify-center gap-1"
            data-testid="city-zip-toggle"
            aria-expanded={showCityZip}
          >
            <MagnifyingGlassIcon className="h-3.5 w-3.5" />
            {showCityZip ? 'Hide city / ZIP search' : 'Not here? Search by city or ZIP'}
          </button>
          {showCityZip && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery?.(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCityZipSearch?.();
                }}
                placeholder="City or ZIP (e.g. 30303)"
                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-stone-900 placeholder-stone-400 text-sm"
                data-testid="city-zip-input"
                aria-label="Search by city or ZIP"
                inputMode="text"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleCityZipSearch?.()}
                disabled={geocoding || !locationQuery.trim()}
                className="px-4 flex-shrink-0"
                data-testid="city-zip-search-button"
              >
                {geocoding ? '…' : 'Go'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Secondary: search by name. Filters open from the bottom bar (MobileBottomBar). */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearchQuery('');
                e.currentTarget.blur();
              }
            }}
            placeholder="Search by name, cuisine, or zip code"
            className="w-full px-4 py-3 pl-11 pr-10 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-stone-900 placeholder-stone-400 text-sm"
            data-testid="search-input"
            aria-label="Search restaurants"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-stone-200/80"
              aria-label="Clear search"
              data-testid="search-clear-button"
              tabIndex={0}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  </>
);

export default RestaurantSearchBar;

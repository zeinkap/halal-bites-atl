import React from 'react';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';

interface RestaurantSearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  radiusMiles: string;
  setRadiusMiles: (value: string) => void;
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
}

const RestaurantSearchBar: React.FC<RestaurantSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  radiusMiles,
  setRadiusMiles,
  locationLoading,
  handleLocationSearch,
  onLocationRetry,
  showingNearMe,
  locationError,
  handleClearNearMe,
  showFilters,
  setShowFilters,
  activeFilterCount = 0,
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
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <MapPinIcon className="h-4 w-4" />
                Within {radiusMiles === 'all' ? 'all distances' : `${radiusMiles} mi`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearNearMe}
                className="px-2 py-1"
                aria-label="Clear Near Me"
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

    {/* Mobile */}
    <div className="flex flex-col sm:hidden gap-4 mb-4">
      <div className="flex-1 flex flex-col gap-3 items-center">
        <div className="relative flex-grow min-w-0 w-full max-w-full">
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
              tabIndex={0}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="w-full">
          <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 grid grid-cols-1 gap-3 w-full">
            <div className="flex items-center gap-2 w-full">
              <MapPinIcon className="h-5 w-5 text-teal-600 flex-shrink-0" />
              <label htmlFor="radius-select-mobile" className="text-xs text-stone-600 flex-shrink-0">Distance:</label>
              <select
                id="radius-select-mobile"
                value={radiusMiles}
                onChange={(e) => setRadiusMiles(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-stone-800 flex-1 min-w-0"
                data-testid="radius-select"
              >
                <option value="3">3 mi</option>
                <option value="5">5 mi</option>
                <option value="10">10 mi</option>
                <option value="all">All</option>
              </select>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleLocationSearch}
              disabled={locationLoading}
              className="w-full flex items-center justify-center"
              data-testid="location-search-button"
            >
              <MapPinIcon className="h-4 w-4 mr-1.5" />
              {locationLoading ? 'Locating...' : 'Near Me'}
            </Button>
            {!showingNearMe && (
              <p className="text-xs text-stone-500 text-center">Choose distance and tap Near Me.</p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center gap-2 relative"
              data-testid="filters-button-mobile"
              type="button"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-teal-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              {showingNearMe && !locationError && (
                <>
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <MapPinIcon className="h-4 w-4" />
                    Within {radiusMiles === 'all' ? 'all' : `${radiusMiles} mi`}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleClearNearMe} className="px-2 py-1" aria-label="Clear Near Me">
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </>
              )}
              {locationError && (
                <>
                  <span className="text-red-600">{locationError}</span>
                  <Button variant="outline" size="sm" onClick={onLocationRetry ?? handleLocationSearch} disabled={locationLoading} className="px-2 py-1 text-xs">
                    Retry
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default RestaurantSearchBar;

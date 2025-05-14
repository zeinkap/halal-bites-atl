import React from 'react';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/Button';

interface RestaurantSearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  radiusMiles: string;
  setRadiusMiles: (value: string) => void;
  locationLoading: boolean;
  handleLocationSearch: () => void;
  showingNearMe: boolean;
  locationError: string | null;
  handleClearNearMe: () => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
}

const RestaurantSearchBar: React.FC<RestaurantSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  radiusMiles,
  setRadiusMiles,
  locationLoading,
  handleLocationSearch,
  showingNearMe,
  locationError,
  handleClearNearMe,
  showFilters,
  setShowFilters,
}) => (
  <>
    {/* Desktop: Search input row */}
    <div className="hidden sm:flex justify-center mb-2 w-full">
      <div className="relative w-full max-w-2xl">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, cuisine, feature or zip code"
          className="w-full px-4 py-2 pl-10 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-400 text-sm"
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
    </div>
    {/* Desktop: Controls row below search */}
    <div className="hidden sm:flex w-full justify-center mt-2">
      <div className="flex flex-row items-center gap-x-3 max-w-2xl w-full justify-center">
        <MapPinIcon className="h-5 w-5 text-orange-500 flex-shrink-0" />
        <label htmlFor="radius-select" className="text-xs sm:text-sm text-gray-700 whitespace-nowrap flex-shrink-0">Distance:</label>
        <select
          id="radius-select"
          value={radiusMiles}
          onChange={e => setRadiusMiles(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 min-w-[110px]"
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
          className="min-w-[128px] w-32 flex items-center justify-center"
        >
          <MapPinIcon className="h-4 w-4 mr-1" />
          {locationLoading ? 'Locating...' : 'Near Me'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          data-testid="filters-button"
          className="min-w-[128px] w-32 flex items-center justify-center"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
          <span className="font-semibold tracking-wide">Filters</span>
        </Button>
        <div className="text-xs text-gray-500 flex items-center justify-center gap-2">
          {showingNearMe && !locationError && (
            <>
              <span className="text-green-600">Showing results near you.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearNearMe}
                className="ml-2 px-2 py-1"
                aria-label="Clear Near Me"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </>
          )}
          {locationError && (
            <span className="text-red-600">{locationError}</span>
          )}
        </div>
      </div>
    </div>
    {/* Mobile: search and controls (unchanged) */}
    <div className="flex flex-col sm:hidden gap-4 mb-4">
      <div className="flex-1 flex flex-col gap-2 items-center">
        {/* Search input */}
        <div className="relative flex-grow min-w-[280px] max-w-full overflow-hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, cuisine, feature or zip code"
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
        {/* Two-column grid for controls */}
        <div className="w-full">
          <div className="bg-orange-50 rounded-xl p-4 grid grid-cols-1 gap-3 w-full max-w-xs mx-auto mb-2 shadow-sm sm:hidden">
            {/* Distance select */}
            <div className="col-span-1 flex items-center gap-2 w-full">
              <MapPinIcon className="h-5 w-5 text-orange-500 flex-shrink-0" />
              <label htmlFor="radius-select" className="text-xs text-gray-700 flex-shrink-0">Distance:</label>
              <select
                id="radius-select"
                value={radiusMiles}
                onChange={e => setRadiusMiles(e.target.value)}
                className="px-2 py-2 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 flex-1 min-w-[60px]"
              >
                <option value="3">3 mi</option>
                <option value="5">5 mi</option>
                <option value="10">10 mi</option>
                <option value="all">All</option>
              </select>
            </div>
            {/* Near Me button */}
            <div className="col-span-1 flex items-center w-full">
              <Button
                variant="primary"
                size="sm"
                onClick={handleLocationSearch}
                disabled={locationLoading}
                className="w-full flex items-center justify-center"
              >
                <MapPinIcon className="h-4 w-4 mr-1" />
                {locationLoading ? 'Locating...' : 'Near Me'}
              </Button>
            </div>
            {/* Instruction text above Filters button */}
            <div className="col-span-2 w-full text-center mb-1">
              <div className="text-xs text-gray-500">Choose distance and tap Near Me.</div>
            </div>
            {/* Filters button, spans both columns */}
            <div className="col-span-2 mt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center gap-2"
                data-testid="filters-button-mobile"
                type="button"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                <span>Filters</span>
              </Button>
            </div>
            {/* Status and errors */}
            <div className="col-span-2 mt-2 w-full text-center">
              {showingNearMe && !locationError && (
                <div className="flex items-center justify-center gap-2 text-xs text-green-600 mt-1">
                  <span>Showing results near you.</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearNearMe}
                    className="px-2 py-1"
                    aria-label="Clear Near Me"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {locationError && (
                <div className="text-xs text-red-600 mt-1">{locationError}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default RestaurantSearchBar; 
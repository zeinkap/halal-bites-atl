'use client';

import React from 'react';
import {
  MapPinIcon,
  MapIcon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { MapPinIcon as MapPinSolidIcon } from '@heroicons/react/24/solid';

interface MobileBottomBarProps {
  view: 'list' | 'map';
  onToggleView: () => void;
  showingNearMe: boolean;
  locationLoading: boolean;
  onNearMe: () => void;
  activeFilterCount: number;
  onOpenFilters: () => void;
  onAddRestaurant: () => void;
}

const itemClass =
  'relative flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[56px] rounded-2xl text-[11px] font-semibold transition-colors active:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500';

/**
 * Thumb-reach navigation for phones (below `sm`): Near me, Map/List, Filters and Add, pinned to
 * the bottom edge above the home indicator. Its height is `--bottom-bar-h` (globals.css), which
 * the page, the toasts and the full-screen map use to stay clear of it.
 */
export default function MobileBottomBar({
  view,
  onToggleView,
  showingNearMe,
  locationLoading,
  onNearMe,
  activeFilterCount,
  onOpenFilters,
  onAddRestaurant,
}: MobileBottomBarProps) {
  return (
    <nav
      className="sm:hidden fixed inset-x-0 bottom-0 z-[46] border-t border-stone-200 bg-white/95 backdrop-blur-xl shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Quick actions"
      data-testid="mobile-bottom-bar"
      data-bottom-bar=""
    >
      <div className="flex items-stretch gap-1 px-2 py-1" style={{ height: 'var(--bottom-bar-h)' }}>
        <button
          type="button"
          onClick={onNearMe}
          disabled={locationLoading}
          aria-pressed={showingNearMe}
          className={`${itemClass} ${showingNearMe ? 'text-teal-700' : 'text-stone-600'}`}
          data-testid="bottom-bar-near-me"
        >
          {locationLoading ? (
            <span className="h-6 w-6 rounded-full border-2 border-stone-200 border-t-teal-600 animate-spin" aria-hidden="true" />
          ) : showingNearMe ? (
            <MapPinSolidIcon className="h-6 w-6" aria-hidden="true" />
          ) : (
            <MapPinIcon className="h-6 w-6" aria-hidden="true" />
          )}
          <span>{locationLoading ? 'Locating…' : 'Near me'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleView}
          className={`${itemClass} text-stone-600`}
          data-testid="bottom-bar-view-toggle"
          aria-label={view === 'list' ? 'Show map' : 'Show list'}
        >
          {view === 'list' ? (
            <MapIcon className="h-6 w-6" aria-hidden="true" />
          ) : (
            <ListBulletIcon className="h-6 w-6" aria-hidden="true" />
          )}
          <span>{view === 'list' ? 'Map' : 'List'}</span>
        </button>

        {/* "filters-button-*" so the shared openFilters() helper finds it (one visible per layout). */}
        <button
          type="button"
          onClick={onOpenFilters}
          className={`${itemClass} ${activeFilterCount > 0 ? 'text-teal-700' : 'text-stone-600'}`}
          data-testid="filters-button-mobile"
          aria-label={activeFilterCount > 0 ? `Filters (${activeFilterCount} active)` : 'Filters'}
        >
          <AdjustmentsHorizontalIcon className="h-6 w-6" aria-hidden="true" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span
              className="absolute top-1 left-1/2 ml-2 min-w-[18px] h-[18px] px-1 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center"
              data-testid="bottom-bar-filter-count"
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onAddRestaurant}
          className={`${itemClass} text-stone-600`}
          data-testid="bottom-bar-add-restaurant"
          aria-label="Add a restaurant"
        >
          <span className="h-7 w-7 -my-0.5 rounded-full bg-teal-600 text-white flex items-center justify-center" aria-hidden="true">
            <PlusIcon className="h-5 w-5" />
          </span>
          <span>Add</span>
        </button>
      </div>
    </nav>
  );
}

import React from 'react';
import { Card } from '../../ui/Card';

interface RestaurantListLoadingSkeletonProps {
  count?: number;
}

const RestaurantListLoadingSkeleton: React.FC<RestaurantListLoadingSkeletonProps> = ({ count = 3 }) => (
  <div className="space-y-4" data-testid="restaurant-list-loading-section">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="overflow-hidden" padding={false} data-testid="restaurant-list-loading-item">
        {/* Same shape as the cards: a small thumbnail beside the text on phones, an image
            column from sm up. */}
        <div className="flex flex-row gap-3 p-3 sm:gap-0 sm:p-0">
          {/* Image skeleton */}
          <div className="w-[4.5rem] h-[4.5rem] rounded-xl sm:rounded-none sm:w-52 sm:h-52 bg-gradient-to-br from-stone-100 to-stone-200 animate-pulse shrink-0" />
          <div className="flex-1 min-w-0 sm:p-5 space-y-3">
            {/* Title + badge row */}
            <div className="flex items-center gap-2">
              <div className="h-5 bg-stone-200 rounded-lg w-1/2 animate-pulse" />
              <div className="h-5 w-10 bg-stone-100 rounded-full animate-pulse" />
            </div>
            {/* Badges */}
            <div className="flex gap-2">
              <div className="h-5 w-8 bg-stone-200 rounded-lg animate-pulse" />
              <div className="h-5 w-16 bg-stone-200 rounded-lg animate-pulse" />
              <div className="h-5 w-12 bg-stone-100 rounded-lg animate-pulse" />
            </div>
            {/* Address + description (sm and up; hidden behind "More" on phones) */}
            <div className="hidden sm:block h-4 bg-stone-100 rounded w-4/5 animate-pulse" />
            <div className="hidden sm:block h-4 bg-stone-100 rounded w-full animate-pulse" />
            <div className="hidden sm:block h-4 bg-stone-100 rounded w-3/4 animate-pulse" />
            {/* Feature chips */}
            <div className="hidden sm:flex gap-2 pt-1">
              <div className="h-7 w-20 bg-stone-100 rounded-lg animate-pulse" />
              <div className="h-7 w-24 bg-stone-100 rounded-lg animate-pulse" />
              <div className="h-7 w-16 bg-stone-100 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </Card>
    ))}
  </div>
);

export default RestaurantListLoadingSkeleton;

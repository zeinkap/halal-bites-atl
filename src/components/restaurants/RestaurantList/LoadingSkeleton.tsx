import React from 'react';
import { Card } from '../../ui/Card';

interface RestaurantListLoadingSkeletonProps {
  count?: number;
}

const RestaurantListLoadingSkeleton: React.FC<RestaurantListLoadingSkeletonProps> = ({ count = 3 }) => (
  <div className="space-y-4" data-testid="restaurant-list-loading-section">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="overflow-hidden" padding={false} data-testid="restaurant-list-loading-item">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full h-40 sm:w-48 sm:h-48 bg-stone-200 animate-pulse shrink-0" />
          <div className="flex-1 p-4 sm:p-5 space-y-3">
            <div className="h-5 bg-stone-200 rounded-lg w-2/3 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-5 w-12 bg-stone-200 rounded-lg animate-pulse" />
              <div className="h-5 w-16 bg-stone-200 rounded-lg animate-pulse" />
            </div>
            <div className="h-4 bg-stone-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-stone-200 rounded w-4/5 animate-pulse" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-20 bg-stone-200 rounded-lg animate-pulse" />
              <div className="h-6 w-24 bg-stone-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </Card>
    ))}
  </div>
);

export default RestaurantListLoadingSkeleton;

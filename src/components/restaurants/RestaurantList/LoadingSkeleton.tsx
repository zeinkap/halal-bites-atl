import React from 'react';
import { Card } from '../../ui/Card';

interface RestaurantListLoadingSkeletonProps {
  count?: number;
}

const RestaurantListLoadingSkeleton: React.FC<RestaurantListLoadingSkeletonProps> = ({ count = 3 }) => (
  <div className="space-y-4" data-testid="restaurant-list-loading-section">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse" data-testid="restaurant-list-loading-item">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </Card>
    ))}
  </div>
);

export default RestaurantListLoadingSkeleton; 
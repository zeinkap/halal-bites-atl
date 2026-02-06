import React from 'react';

interface RestaurantResultsCountProps {
  isLoading: boolean;
  filteredCount: number;
}

const RestaurantResultsCount: React.FC<RestaurantResultsCountProps> = ({ isLoading, filteredCount }) => (
  <div className="text-stone-600 text-sm" data-testid="restaurant-list-results-count">
    {isLoading ? (
      <div className="flex items-center gap-2" data-testid="restaurant-list-loading-spinner">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-stone-200 border-t-teal-600" />
        <span>Loading restaurants...</span>
      </div>
    ) : (
      <span className="font-medium">
        {filteredCount} restaurant{filteredCount !== 1 ? 's' : ''} found
      </span>
    )}
  </div>
);

export default RestaurantResultsCount;

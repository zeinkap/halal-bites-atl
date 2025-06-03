import React from 'react';

interface RestaurantResultsCountProps {
  isLoading: boolean;
  filteredCount: number;
}

const RestaurantResultsCount: React.FC<RestaurantResultsCountProps> = ({ isLoading, filteredCount }) => (
  <div className="text-gray-600" data-testid="restaurant-list-results-count">
    {isLoading ? (
      <div className="flex items-center gap-2" data-testid="restaurant-list-loading-spinner">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        <span>Loading restaurants...</span>
      </div>
    ) : (
      `Found ${filteredCount} restaurant${filteredCount !== 1 ? 's' : ''}`
    )}
  </div>
);

export default RestaurantResultsCount; 
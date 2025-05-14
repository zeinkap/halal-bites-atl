import React from 'react';
import { Restaurant } from '@/types';

interface RestaurantFilterControlsProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  selectedCuisine: string;
  setSelectedCuisine: (value: string) => void;
  selectedPriceRange: string;
  setSelectedPriceRange: (value: string) => void;
  restaurants: Restaurant[];
  formatCuisineName: (cuisine: string) => string;
}

const RestaurantFilterControls: React.FC<RestaurantFilterControlsProps> = ({
  sortBy,
  setSortBy,
  selectedCuisine,
  setSelectedCuisine,
  selectedPriceRange,
  setSelectedPriceRange,
  restaurants,
  formatCuisineName,
}) => (
  <>
    <div>
      <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
        Sort By
      </label>
      <select
        id="sort"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="w-full px-1 py-0.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 text-xs"
        data-testid="sort-select"
      >
        <option value="name-asc">Name: A to Z</option>
        <option value="name-desc">Name: Z to A</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
    </div>

    <div>
      <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">
        Cuisine
      </label>
      <select
        id="cuisine"
        value={selectedCuisine}
        onChange={(e) => setSelectedCuisine(e.target.value)}
        className="w-full px-1 py-0.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 text-xs"
        data-testid="cuisine-select"
      >
        <option value="all" className="text-gray-700">All Cuisines</option>
        {(() => {
          const cuisines = Array.from(new Set(restaurants.map(r => r.cuisineType)));
          const sorted = [...cuisines.filter(c => c !== 'OTHER').sort((a, b) => a.localeCompare(b)), 'OTHER'];
          return sorted.map((cuisine) => (
            <option key={cuisine} value={cuisine} className="text-gray-700">
              {formatCuisineName(cuisine)}
            </option>
          ));
        })()}
      </select>
    </div>

    <div>
      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
        Price Range
      </label>
      <select
        id="price"
        value={selectedPriceRange}
        onChange={(e) => setSelectedPriceRange(e.target.value)}
        className="w-full px-1 py-0.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 text-xs"
        data-testid="price-select"
      >
        <option value="all" className="text-gray-700">Any Price</option>
        {['LOW', 'MEDIUM', 'HIGH'].map((price) => (
          <option key={price} value={price} className="text-gray-700">
            {price === 'LOW' ? '$' : price === 'MEDIUM' ? '$$' : '$$$'}
          </option>
        ))}
      </select>
    </div>
  </>
);

export default RestaurantFilterControls; 
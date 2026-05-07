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
}) => {
  const inputClass =
    'w-full px-3 py-2 border border-stone-200 rounded-xl bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500';
  const labelClass = 'block text-sm font-medium text-stone-700 mb-1.5';

  return (
    <>
      <div>
        <label htmlFor="sort" className={labelClass}>Sort by</label>
        <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={inputClass} data-testid="sort-select">
          <option value="name-asc">Name: A → Z</option>
          <option value="name-desc">Name: Z → A</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">⭐ Highest Rated</option>
          <option value="comments-desc">💬 Most Reviewed</option>
        </select>
      </div>
      <div>
        <label htmlFor="cuisine" className={labelClass}>Cuisine</label>
        <select id="cuisine" value={selectedCuisine} onChange={(e) => setSelectedCuisine(e.target.value)} className={inputClass} data-testid="cuisine-select">
          <option value="all">All cuisines</option>
          {(() => {
            const cuisines = Array.from(new Set(restaurants.map((r) => r.cuisineType)));
            const sorted = [...cuisines.filter((c) => c !== 'OTHER').sort((a, b) => a.localeCompare(b)), 'OTHER'];
            return sorted.map((cuisine) => (
              <option key={cuisine} value={cuisine}>{formatCuisineName(cuisine)}</option>
            ));
          })()}
        </select>
      </div>
      <div>
        <label htmlFor="price" className={labelClass}>Price</label>
        <select id="price" value={selectedPriceRange} onChange={(e) => setSelectedPriceRange(e.target.value)} className={inputClass} data-testid="price-select">
          <option value="all">Any price</option>
          <option value="LOW">$ ($1–10)</option>
          <option value="MEDIUM">$$ ($10–20)</option>
          <option value="HIGH">$$$ ($30+)</option>
        </select>
      </div>
    </>
  );
};

export default RestaurantFilterControls;

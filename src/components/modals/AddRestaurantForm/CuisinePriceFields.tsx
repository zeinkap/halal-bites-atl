import React from 'react';
import { CuisineType, PriceRange } from '@prisma/client';
import type { FormData } from './add-restaurant-helpers';

type Props = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
};

const CuisinePriceFields: React.FC<Props> = ({ formData, setFormData }) => (
  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4 w-full">
    <div>
      <label htmlFor="cuisineType" className="block text-sm font-medium text-gray-700 mb-1.5">
        Cuisine Type <span className="text-red-500">*</span>
      </label>
      <select
        id="cuisineType"
        name="cuisineType"
        data-testid="cuisine-type-select"
        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base sm:text-sm transition-colors text-gray-900 h-11 sm:h-10 py-2.5 sm:py-2 px-3 sm:px-3"
        value={formData.cuisineType}
        onChange={(e) => setFormData(prev => ({ ...prev, cuisineType: e.target.value as CuisineType }))}
        required
      >
        <option value="" className="text-gray-400">Select cuisine type</option>
        {(() => {
          const types = Object.values(CuisineType);
          const sorted = [...types.filter(t => t !== 'OTHER').sort((a, b) => a.localeCompare(b)), 'OTHER'] as CuisineType[];
          return sorted.map((type) => (
            <option key={type} value={type}>
              {type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ));
        })()}
      </select>
    </div>
    <div>
      <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1.5">
        Price Range <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-gray-500 mb-2">$ = $1-10, $$ = $10-20, $$$ = $30+</p>
      <select
        id="priceRange"
        name="priceRange"
        data-testid="price-range-select"
        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base sm:text-sm transition-colors text-gray-900 h-11 sm:h-10 py-2.5 sm:py-2 px-3 sm:px-3"
        value={formData.priceRange}
        onChange={(e) => setFormData(prev => ({ ...prev, priceRange: e.target.value as PriceRange }))}
        required
      >
        <option value="" className="text-gray-400">Select price range</option>
        {Object.values(PriceRange).map((range) => (
          <option key={range} value={range}>
            {range === 'LOW' ? '$ ($1-10)' : range === 'MEDIUM' ? '$$ ($10-20)' : range === 'HIGH' ? '$$$ ($30+)' : range}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default CuisinePriceFields; 
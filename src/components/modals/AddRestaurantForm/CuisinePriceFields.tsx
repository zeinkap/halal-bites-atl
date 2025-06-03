import React from 'react';
import { CuisineType, PriceRange } from '@prisma/client';
import type { FormData } from './add-restaurant-helpers';

type Props = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
};

const CuisinePriceFields: React.FC<Props> = ({ formData, setFormData }) => (
  <div className="bg-gray-50 rounded-xl p-4 space-y-4 w-full">
    <div>
      <label htmlFor="cuisineType" className="block text-sm font-medium text-gray-700 mb-1">
        Cuisine Type <span className="text-red-500">*</span>
      </label>
      <select
        id="cuisineType"
        name="cuisineType"
        data-testid="cuisine-type-select"
        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm transition-colors text-gray-900"
        value={formData.cuisineType}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, cuisineType: e.target.value as CuisineType }))}
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
      <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">
        Price Range <span className="text-red-500">*</span>
      </label>
      <select
        id="priceRange"
        name="priceRange"
        data-testid="price-range-select"
        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm transition-colors text-gray-900"
        value={formData.priceRange}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, priceRange: e.target.value as PriceRange }))}
        required
      >
        <option value="" className="text-gray-400">Select price range</option>
        {Object.values(PriceRange).map((range) => (
          <option key={range} value={range}>
            {range === 'LOW' ? '$' : range === 'MEDIUM' ? '$$' : range === 'HIGH' ? '$$$' : range}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default CuisinePriceFields; 
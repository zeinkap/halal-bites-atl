import React from 'react';
import { CuisineType, PriceRange } from '@prisma/client';
import type { FormData } from './add-restaurant-helpers';

type Props = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
};

const CuisinePriceFields: React.FC<Props> = ({ formData, setFormData }) => (
  <div className="bg-stone-50 rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4 w-full border border-stone-100">
    <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">Cuisine &amp; Price</h3>
    <div>
      <label htmlFor="cuisineType" className="block text-sm font-medium text-stone-700 mb-1.5">
        Cuisine Type <span className="text-red-500">*</span>
      </label>
      <select
        id="cuisineType"
        name="cuisineType"
        data-testid="cuisine-type-select"
        className="w-full rounded-xl border border-stone-200 bg-white shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 focus:outline-none text-sm transition-colors text-stone-900 h-11 py-2.5 px-3.5"
        value={formData.cuisineType}
        onChange={(e) => setFormData(prev => ({ ...prev, cuisineType: e.target.value as CuisineType }))}
        required
      >
        <option value="" className="text-stone-400">Select cuisine type</option>
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
      <label htmlFor="priceRange" className="block text-sm font-medium text-stone-700 mb-1.5">
        Price Range <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-stone-400 mb-2">$ = under $10 · $$ = $10–20 · $$$ = $30+</p>
      <select
        id="priceRange"
        name="priceRange"
        data-testid="price-range-select"
        className="w-full rounded-xl border border-stone-200 bg-white shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 focus:outline-none text-sm transition-colors text-stone-900 h-11 py-2.5 px-3.5"
        value={formData.priceRange}
        onChange={(e) => setFormData(prev => ({ ...prev, priceRange: e.target.value as PriceRange }))}
        required
      >
        <option value="" className="text-stone-400">Select price range</option>
        {Object.values(PriceRange).map((range) => (
          <option key={range} value={range}>
            {range === 'LOW' ? '$ (under $10)' : range === 'MEDIUM' ? '$$ ($10–20)' : range === 'HIGH' ? '$$$ ($30+)' : range}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default CuisinePriceFields; 
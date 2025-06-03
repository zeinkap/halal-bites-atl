import React from 'react';

interface FeatureFiltersProps {
  selectedFeatures: {
    isZabiha: boolean;
    hasPrayerRoom: boolean;
    hasHighChair: boolean;
    hasOutdoorSeating: boolean;
    isFullyHalal: boolean;
    servesAlcohol: boolean;
    isPartiallyHalal: boolean;
  };
  onFeatureChange: (feature: keyof FeatureFiltersProps['selectedFeatures']) => void;
}

const RestaurantFeatureFilters: React.FC<FeatureFiltersProps> = ({ selectedFeatures, onFeatureChange }) => (
  <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2">
    <div className="flex flex-row gap-2 sm:contents">
      <div className="flex-1 flex flex-col gap-2">
        <label className="flex items-center space-x-2 p-1 min-h-[28px] w-full rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer bg-white text-xs">
          <input
            type="checkbox"
            checked={selectedFeatures.isZabiha}
            onChange={() => onFeatureChange('isZabiha')}
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
          />
          <span className="text-xs text-gray-700">Zabihah (Hand-cut)</span>
        </label>
        <label className="flex items-center space-x-2 p-1 min-h-[28px] w-full rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer bg-white text-xs">
          <input
            type="checkbox"
            checked={selectedFeatures.hasHighChair}
            onChange={() => onFeatureChange('hasHighChair')}
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
          />
          <span className="text-xs text-gray-700">High Chairs</span>
        </label>
        <label className="flex items-center space-x-2 p-1 min-h-[28px] w-full rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer bg-white text-xs">
          <input
            type="checkbox"
            checked={selectedFeatures.isFullyHalal}
            onChange={() => onFeatureChange('isFullyHalal')}
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
          />
          <span className="text-xs text-gray-700">Fully Halal</span>
        </label>
        <label className="flex items-center space-x-2 p-1 min-h-[28px] w-full rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer bg-white text-xs">
          <input
            type="checkbox"
            checked={selectedFeatures.isPartiallyHalal}
            onChange={() => onFeatureChange('isPartiallyHalal')}
            className="rounded border-yellow-400 text-gray-700 focus:ring-yellow-500 h-4 w-4"
          />
          <span className="text-xs text-gray-700">Partially Halal</span>
        </label>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <label className="flex items-center space-x-2 p-1 min-h-[28px] w-full rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer bg-white text-xs">
          <input
            type="checkbox"
            checked={selectedFeatures.hasPrayerRoom}
            onChange={() => onFeatureChange('hasPrayerRoom')}
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
          />
          <span className="text-xs text-gray-700">Prayer Space</span>
        </label>
        <label className="flex items-center space-x-2 p-1 min-h-[28px] w-full rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer bg-white text-xs">
          <input
            type="checkbox"
            checked={selectedFeatures.hasOutdoorSeating}
            onChange={() => onFeatureChange('hasOutdoorSeating')}
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
          />
          <span className="text-xs text-gray-700">Outdoor Seating</span>
        </label>
        <label className="flex items-center space-x-2 p-1 min-h-[28px] w-full rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer bg-white text-xs">
          <input
            type="checkbox"
            checked={selectedFeatures.servesAlcohol}
            onChange={() => onFeatureChange('servesAlcohol')}
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
          />
          <span className="text-xs text-gray-700">No Alcohol</span>
        </label>
      </div>
    </div>
    <div className="hidden sm:block" />
  </div>
);

export default RestaurantFeatureFilters; 
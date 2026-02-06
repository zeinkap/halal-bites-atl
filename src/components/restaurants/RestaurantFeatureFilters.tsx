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

const checkboxLabelClass =
  'flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] w-full rounded-xl border border-stone-200 hover:border-teal-300 cursor-pointer bg-white text-sm text-stone-700 transition-colors has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50/50 has-[:checked]:text-teal-800';
const checkboxInputClass = 'rounded border-stone-300 text-teal-600 focus:ring-teal-500 h-4 w-4 shrink-0';

const RestaurantFeatureFilters: React.FC<FeatureFiltersProps> = ({ selectedFeatures, onFeatureChange }) => (
  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2">
    <label className={checkboxLabelClass}>
      <input type="checkbox" checked={selectedFeatures.isZabiha} onChange={() => onFeatureChange('isZabiha')} className={checkboxInputClass} />
      <span>Zabihah (Hand-cut)</span>
    </label>
    <label className={checkboxLabelClass}>
      <input type="checkbox" checked={selectedFeatures.hasPrayerRoom} onChange={() => onFeatureChange('hasPrayerRoom')} className={checkboxInputClass} />
      <span>Prayer space</span>
    </label>
    <label className={checkboxLabelClass}>
      <input type="checkbox" checked={selectedFeatures.hasHighChair} onChange={() => onFeatureChange('hasHighChair')} className={checkboxInputClass} />
      <span>High chairs</span>
    </label>
    <label className={checkboxLabelClass}>
      <input type="checkbox" checked={selectedFeatures.hasOutdoorSeating} onChange={() => onFeatureChange('hasOutdoorSeating')} className={checkboxInputClass} />
      <span>Outdoor seating</span>
    </label>
    <label className={checkboxLabelClass}>
      <input type="checkbox" checked={selectedFeatures.isFullyHalal} onChange={() => onFeatureChange('isFullyHalal')} className={checkboxInputClass} />
      <span>Fully halal</span>
    </label>
    <label className={checkboxLabelClass}>
      <input type="checkbox" checked={selectedFeatures.servesAlcohol} onChange={() => onFeatureChange('servesAlcohol')} className={checkboxInputClass} />
      <span>No alcohol</span>
    </label>
    <label className={checkboxLabelClass}>
      <input type="checkbox" checked={selectedFeatures.isPartiallyHalal} onChange={() => onFeatureChange('isPartiallyHalal')} className="rounded border-amber-400 text-amber-600 focus:ring-amber-500 h-4 w-4 shrink-0" />
      <span>Partially halal</span>
    </label>
  </div>
);

export default RestaurantFeatureFilters;

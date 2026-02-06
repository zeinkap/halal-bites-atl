import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface QuickFilterChipsProps {
  selectedCuisine: string;
  selectedPriceRange: string;
  selectedFeatures: {
    isZabiha: boolean;
    hasPrayerRoom: boolean;
    hasHighChair: boolean;
    hasOutdoorSeating: boolean;
    isFullyHalal: boolean;
    servesAlcohol: boolean;
    isPartiallyHalal: boolean;
  };
  onRemoveCuisine: () => void;
  onRemovePriceRange: () => void;
  onRemoveFeature: (feature: keyof QuickFilterChipsProps['selectedFeatures']) => void;
  formatCuisineName: (cuisine: string) => string;
}

const QuickFilterChips: React.FC<QuickFilterChipsProps> = ({
  selectedCuisine,
  selectedPriceRange,
  selectedFeatures,
  onRemoveCuisine,
  onRemovePriceRange,
  onRemoveFeature,
  formatCuisineName,
}) => {
  const activeFilters: Array<{ label: string; onRemove: () => void }> = [];

  if (selectedCuisine !== 'all') {
    activeFilters.push({ label: formatCuisineName(selectedCuisine), onRemove: onRemoveCuisine });
  }
  if (selectedPriceRange !== 'all') {
    const priceLabel = selectedPriceRange === 'LOW' ? '$' : selectedPriceRange === 'MEDIUM' ? '$$' : '$$$';
    activeFilters.push({ label: `Price: ${priceLabel}`, onRemove: onRemovePriceRange });
  }
  const featureLabels: Record<keyof typeof selectedFeatures, string> = {
    isZabiha: 'Zabihah',
    hasPrayerRoom: 'Prayer Space',
    hasHighChair: 'High Chairs',
    hasOutdoorSeating: 'Outdoor Seating',
    isFullyHalal: 'Fully Halal',
    servesAlcohol: 'No Alcohol',
    isPartiallyHalal: 'Partially Halal',
  };
  Object.entries(selectedFeatures).forEach(([feature, isSelected]) => {
    if (isSelected) {
      activeFilters.push({
        label: featureLabels[feature as keyof typeof selectedFeatures],
        onRemove: () => onRemoveFeature(feature as keyof typeof selectedFeatures),
      });
    }
  });

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {activeFilters.map((filter, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-800 rounded-full text-xs font-medium border border-teal-100"
        >
          {filter.label}
          <button
            onClick={filter.onRemove}
            className="hover:bg-teal-100 rounded-full p-0.5 transition-colors text-teal-600"
            aria-label={`Remove ${filter.label} filter`}
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
    </div>
  );
};

export default QuickFilterChips;

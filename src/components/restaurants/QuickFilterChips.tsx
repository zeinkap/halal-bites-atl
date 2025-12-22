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
    activeFilters.push({
      label: formatCuisineName(selectedCuisine),
      onRemove: onRemoveCuisine,
    });
  }

  if (selectedPriceRange !== 'all') {
    const priceLabel = selectedPriceRange === 'LOW' ? '$ ($1-10)' : selectedPriceRange === 'MEDIUM' ? '$$ ($10-20)' : '$$$ ($30+)';
    activeFilters.push({
      label: `Price: ${priceLabel}`,
      onRemove: onRemovePriceRange,
    });
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
          className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium"
        >
          {filter.label}
          <button
            onClick={filter.onRemove}
            className="hover:bg-orange-200 rounded-full p-0.5 transition-colors"
            aria-label={`Remove ${filter.label} filter`}
          >
            <XMarkIcon className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
};

export default QuickFilterChips;


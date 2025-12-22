import { PriceRange } from '@prisma/client';

export const formatPriceRange = (priceRange: PriceRange): string => {
  switch (priceRange) {
    case PriceRange.LOW:
      return '$';
    case PriceRange.MEDIUM:
      return '$$';
    case PriceRange.HIGH:
      return '$$$';
    default:
      return '$';
  }
};

export const formatPriceRangeWithDescription = (priceRange: PriceRange): string => {
  switch (priceRange) {
    case PriceRange.LOW:
      return '$ ($1-10)';
    case PriceRange.MEDIUM:
      return '$$ ($10-20)';
    case PriceRange.HIGH:
      return '$$$ ($30+)';
    default:
      return '$ ($1-10)';
  }
}; 
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
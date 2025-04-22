import { CuisineType } from '@prisma/client';

export const formatCuisineName = (cuisine: CuisineType): string => {
  // Convert SNAKE_CASE to Title Case and handle special cases
  return cuisine
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}; 
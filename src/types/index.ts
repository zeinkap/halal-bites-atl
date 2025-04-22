/**
 * Represents a restaurant in the application.
 * 
 * Note on ID format:
 * The id field uses CUID format (e.g., 'clm2p3mf9j0001pgp6edund7yb')
 * This provides better security and scalability compared to sequential IDs.
 * For more details, see docs/database.md
 */
export interface Restaurant {
  id: string;
  name: string;
  cuisineType: string;
  address: string;
  description?: string;
  priceRange: string;
  hasPrayerRoom: boolean;
  hasOutdoorSeating: boolean;
  isZabiha: boolean;
  hasHighChair: boolean;
  servesAlcohol: boolean;
  isFullyHalal: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 
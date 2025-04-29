export enum CuisineType {
  MIDDLE_EASTERN = 'MIDDLE_EASTERN',
  INDIAN_PAKISTANI = 'INDIAN_PAKISTANI',
  TURKISH = 'TURKISH',
  PERSIAN = 'PERSIAN',
  MEDITERRANEAN = 'MEDITERRANEAN',
  AFGHAN = 'AFGHAN',
  CAFE = 'CAFE',
  MEXICAN = 'MEXICAN',
  CHINESE = 'CHINESE',
  THAI = 'THAI',
  OTHER = 'OTHER'
}

export enum PriceRange {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface Restaurant {
  id: string;
  name: string;
  cuisineType: CuisineType;
  address: string;
  description?: string;
  priceRange: PriceRange;
  hasPrayerRoom: boolean;
  hasOutdoorSeating: boolean;
  isZabiha: boolean;
  hasHighChair: boolean;
  servesAlcohol: boolean;
  isFullyHalal: boolean;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 
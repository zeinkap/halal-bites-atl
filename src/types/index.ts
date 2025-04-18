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
  createdAt: Date;
  updatedAt: Date;
} 
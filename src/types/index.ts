export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  description: string;
  priceRange: string;
  imageUrl?: string;
  hasPrayerRoom: boolean;
  hasOutdoorSeating: boolean;
  isZabiha: boolean;
  hasHighChair: boolean;
  createdAt: Date;
  updatedAt: Date;
} 
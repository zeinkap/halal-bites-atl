import { CuisineType, PriceRange } from '@prisma/client';

export interface Restaurant {
  id: string;
  name: string;
  cuisineType: CuisineType;
  address: string;
  description?: string | null;
  priceRange: PriceRange;
  hasPrayerRoom: boolean;
  hasOutdoorSeating: boolean;
  hasHighChair: boolean;
  servesAlcohol: boolean;
  isFullyHalal: boolean;
  isZabiha: boolean;
  isPartiallyHalal: boolean;
  partiallyHalalChicken: boolean;
  partiallyHalalLamb: boolean;
  partiallyHalalBeef: boolean;
  partiallyHalalGoat: boolean;
  imageUrl?: string | null;
  zabihaChicken: boolean;
  zabihaLamb: boolean;
  zabihaBeef: boolean;
  zabihaGoat: boolean;
  zabihaVerified?: Date | null;
  zabihaVerifiedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  commentCount: number;
  latitude?: number | null;
  longitude?: number | null;
} 
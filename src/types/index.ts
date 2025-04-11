import { CuisineType, PriceRange } from '@prisma/client';

export type Cuisine = 
  | 'Middle Eastern'
  | 'Indian'
  | 'Pakistani'
  | 'Turkish'
  | 'Mediterranean'
  | 'American'
  | 'African'
  | 'Uzbek'
  | 'Malaysian'
  | 'Indonesian'
  | 'Persian'
  | 'Cafe'
  | 'Afghan'
  | 'Chinese';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  restaurantId: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: CuisineType;
  address: string;
  description: string;
  priceRange: PriceRange;
  website?: string;
  hours?: {
    [key: string]: string;
  };
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 
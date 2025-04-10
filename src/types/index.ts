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
  cuisine: Cuisine;
  address: string;
  description: string;
  priceRange: '$' | '$$' | '$$$';
  website?: string;
  hours?: {
    [key: string]: string;
  };
  imageUrl?: string;
} 
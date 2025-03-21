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
  | 'Indonesian';

export interface Restaurant {
  id: string;
  name: string;
  cuisine: Cuisine;
  address: string;
  description: string;
  rating: number;
  votes: {
    upvotes: number;
    downvotes: number;
  };
  priceRange: '£' | '££' | '£££';
  phoneNumber?: string;
  website?: string;
  hours?: {
    [key: string]: string;
  };
  imageUrl?: string;
} 
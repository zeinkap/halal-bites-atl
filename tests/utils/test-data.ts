import { CuisineType, PriceRange } from '@prisma/client';
import { generateRandomAtlantaAddress } from './address-generator';

/**
 * Interface representing a test restaurant's data structure
 * Used for creating consistent test data across test scenarios
 * 
 * @property name - Unique name for the restaurant
 * @property cuisineType - Type of cuisine from predefined CuisineType enum
 * @property priceRange - Price category from predefined PriceRange enum
 * @property address - Physical location of the restaurant
 * @property description - Optional detailed description of the restaurant
 * @property features - Object containing boolean flags for various restaurant features:
 *                     - hasPrayerRoom: Whether the restaurant has a prayer space
 *                     - hasOutdoorSeating: Whether outdoor seating is available
 *                     - isZabiha: Whether they serve Zabihah (hand-cut) halal meat
 *                     - hasHighChair: Whether they provide high chairs for children
 *                     - servesAlcohol: Whether alcohol is served
 *                     - isFullyHalal: Whether the entire menu is halal
 */
export interface TestRestaurant {
  name: string;
  cuisineType: CuisineType;
  priceRange: PriceRange;
  address: string;
  description: string;
  features: {
    hasPrayerRoom: boolean;
    hasOutdoorSeating: boolean;
    isZabiha: boolean;
    hasHighChair: boolean;
    servesAlcohol: boolean;
    isFullyHalal: boolean;
  };
}

/**
 * Collection of predefined test restaurant data
 * Each key represents a different test scenario
 * 
 * BASIC: Standard test restaurant with all features enabled
 * - Uses dynamic name generation to ensure uniqueness
 * - Sets Middle Eastern cuisine and low price range
 * - Enables most positive features (prayer space, Zabihah, etc.)
 * 
 * DUPLICATE: Used for testing duplicate restaurant validation
 * - Also uses dynamic name generation
 * - Sets medium price range
 * - Has all features disabled for testing negative scenarios
 * 
 * The 'as const' assertion ensures type safety and immutability
 */
export const TEST_RESTAURANTS: Record<string, TestRestaurant> = {
  BASIC: {
    name: `Test Restaurant ${Date.now()}-${crypto.randomUUID()}`,
    cuisineType: CuisineType.MIDDLE_EASTERN,
    priceRange: PriceRange.LOW,
    address: generateRandomAtlantaAddress(),
    description: 'A test restaurant description',
    features: {
      hasPrayerRoom: true,
      hasOutdoorSeating: true,
      isZabiha: true,
      hasHighChair: true,
      servesAlcohol: false,
      isFullyHalal: true
    }
  },
  DUPLICATE: {
    name: `Duplicate Restaurant ${Date.now()}-${crypto.randomUUID()}`,
    cuisineType: CuisineType.MIDDLE_EASTERN,
    priceRange: PriceRange.MEDIUM,
    address: generateRandomAtlantaAddress(),
    description: '',
    features: {
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: false,
      hasHighChair: false,
      servesAlcohol: false,
      isFullyHalal: false
    }
  }
} as const;

/**
 * Interface representing a test comment's data structure
 * Used for creating consistent comment test data
 * 
 * @property content - The main text content of the comment
 * @property authorName - Name of the comment author
 * @property rating - Numerical rating from 1-5
 * @property imageUrl - Optional URL to an image attached to the comment
 */
export interface TestComment {
  content: string;
  authorName: string;
  rating: number;
  imageUrl?: string;
}

/**
 * Collection of predefined test comment data
 * Each key represents a different test scenario
 * 
 * VALID: Basic positive test case
 * - Short, positive content
 * - Maximum rating (5)
 * 
 * LONG: Tests handling of longer comment content
 * - Detailed review with multiple aspects
 * - High but not maximum rating (4)
 * 
 * CRITICAL: Tests handling of critical reviews
 * - Negative feedback
 * - Lower rating (3)
 * 
 * The 'as const' assertion ensures type safety and immutability
 */
export const TEST_COMMENTS: Record<string, TestComment> = {
  VALID: {
    content: 'Great halal food and excellent service!',
    authorName: 'Test User',
    rating: 5
  },
  LONG: {
    content: 'This is a very detailed review of the restaurant. The food was amazing, service was great, and the prayer space was clean and spacious. Would definitely recommend to others!',
    authorName: 'Detailed Reviewer',
    rating: 4
  },
  CRITICAL: {
    content: 'Food was okay but service was slow.',
    authorName: 'Honest Reviewer',
    rating: 3
  }
} as const;
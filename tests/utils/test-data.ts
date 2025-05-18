import { generateRandomAtlantaAddress } from './address-generator';
import { CuisineType, PriceRange } from '@prisma/client';

/**
 * Interface representing a test restaurant's data structure
 * Used for creating consistent test data across test scenarios
 *
 * All fields correspond to the Restaurant model in schema.prisma
 */
export interface TestRestaurant {
  name: string;
  cuisineType: CuisineType;
  priceRange: PriceRange;
  address: string;
  description: string;
  hasPrayerRoom: boolean;
  hasOutdoorSeating: boolean;
  isZabiha: boolean;
  hasHighChair: boolean;
  servesAlcohol: boolean;
  isFullyHalal: boolean;
  imageUrl?: string | null;
  zabihaBeef: boolean;
  zabihaChicken: boolean;
  zabihaGoat: boolean;
  zabihaLamb: boolean;
  zabihaVerified?: string | null;
  zabihaVerifiedBy?: string | null;
  brandId?: string | null;
  isPartiallyHalal: boolean;
  partiallyHalalBeef: boolean;
  partiallyHalalChicken: boolean;
  partiallyHalalGoat: boolean;
  partiallyHalalLamb: boolean;
  latitude?: number | null;
  longitude?: number | null;
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
    cuisineType: CuisineType.THAI,
    priceRange: PriceRange.HIGH,
    address: generateRandomAtlantaAddress(),
    description: 'A test restaurant description',
    hasPrayerRoom: true,
    hasOutdoorSeating: true,
    isZabiha: true,
    hasHighChair: true,
    servesAlcohol: false,
    isFullyHalal: true,
    imageUrl: 'https://example.com/test-image.jpg',
    zabihaBeef: true,
    zabihaChicken: true,
    zabihaGoat: false,
    zabihaLamb: false,
    zabihaVerified: new Date().toISOString(),
    zabihaVerifiedBy: 'Test Admin',
    brandId: null,
    isPartiallyHalal: false,
    partiallyHalalBeef: false,
    partiallyHalalChicken: false,
    partiallyHalalGoat: false,
    partiallyHalalLamb: false,
    latitude: 33.7490,
    longitude: -84.3880
  },
  DUPLICATE: {
    name: `Duplicate Restaurant ${Date.now()}-${crypto.randomUUID()}`,
    cuisineType: CuisineType.MIDDLE_EASTERN,
    priceRange: PriceRange.MEDIUM,
    address: generateRandomAtlantaAddress(),
    description: '',
    hasPrayerRoom: false,
    hasOutdoorSeating: false,
    isZabiha: false,
    hasHighChair: false,
    servesAlcohol: false,
    isFullyHalal: false,
    imageUrl: null,
    zabihaBeef: false,
    zabihaChicken: false,
    zabihaGoat: false,
    zabihaLamb: false,
    zabihaVerified: null,
    zabihaVerifiedBy: null,
    brandId: null,
    isPartiallyHalal: false,
    partiallyHalalBeef: false,
    partiallyHalalChicken: false,
    partiallyHalalGoat: false,
    partiallyHalalLamb: false,
    latitude: null,
    longitude: null
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
 * @property hearts - Optional number of hearts (likes) for the comment
 */
export interface TestComment {
  content: string;
  authorName: string;
  rating: number;
  imageUrl?: string;
  hearts?: number;
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
    rating: 5,
    hearts: 0
  },
  LONG: {
    content: 'This is a very detailed review of the restaurant. The food was amazing, service was great, and the prayer space was clean and spacious. Would definitely recommend to others!',
    authorName: 'Detailed Reviewer',
    rating: 4,
    hearts: 0
  },
  CRITICAL: {
    content: 'Food was okay but service was slow.',
    authorName: 'Honest Reviewer',
    rating: 3,
    hearts: 0
  }
} as const;
import { Restaurant } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Helper function to escape special characters in strings for safe insertion into code
 */
function escapeString(str: string | null): string {
  return (str || '').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

/**
 * Appends a new restaurant to the production seed file.
 * Only runs in production environment to maintain production data.
 * 
 * @param restaurant - The restaurant to append to the seed file
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export async function appendToProdSeed(restaurant: Restaurant) {
  // Only add restaurants in production environment
  if (process.env.NODE_ENV !== 'production') {
    console.log('Skipping production seed addition - not in production environment');
    return false;
  }

  try {
    const seedFilePath = path.join(process.cwd(), 'prisma', 'seed.prod.ts');
    let seedContent = await fs.readFile(seedFilePath, 'utf8');

    // Find the position before the summary logging
    const summaryPosition = seedContent.indexOf('// Log summary');
    if (summaryPosition === -1) {
      throw new Error('Could not find position to insert new restaurant in production seed file');
    }

    // Create the new restaurant entry
    const newEntry = `
    await upsertRestaurant('${escapeString(restaurant.name)}', {
      name: '${escapeString(restaurant.name)}',
      cuisineType: CuisineType.${restaurant.cuisineType},
      address: '${escapeString(restaurant.address)}',
      description: '${escapeString(restaurant.description)}',
      priceRange: PriceRange.${restaurant.priceRange},
      hasPrayerRoom: ${restaurant.hasPrayerRoom},
      hasOutdoorSeating: ${restaurant.hasOutdoorSeating},
      isZabiha: ${restaurant.isZabiha},
      hasHighChair: ${restaurant.hasHighChair},
      servesAlcohol: ${restaurant.servesAlcohol},
      isFullyHalal: ${restaurant.isFullyHalal},
    });
`;

    // Insert the new entry before the summary
    seedContent = seedContent.slice(0, summaryPosition) + newEntry + seedContent.slice(summaryPosition);

    // Write back to the file
    await fs.writeFile(seedFilePath, seedContent);

    console.log(`✓ Added ${restaurant.name} to production seed file`);
    return true;
  } catch (error) {
    console.error('Error updating production seed file:', error);
    return false;
  }
} 
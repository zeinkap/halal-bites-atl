import fs from 'fs';
import path from 'path';
import { Restaurant } from '@prisma/client';

/**
 * Helper function to escape strings for safe insertion into seed file
 * @param str - The string to escape
 * @returns Escaped string safe for use in seed file
 */
function escapeString(str: string): string {
  return str.replace(/'/g, "\\'").replace(/\n/g, ' ');
}

/**
 * Appends a new restaurant to the seed file.
 * 
 * Note on ID handling:
 * - We use restaurant names as unique identifiers for upserts
 * - Actual IDs are generated as CUIDs by Prisma
 * - This approach ensures consistency with the database schema
 * - For more details, see docs/database.md
 * 
 * @param restaurant - The restaurant to append to the seed file
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export async function appendRestaurantToSeed(restaurant: Restaurant) {
  try {
    const seedFilePath = path.join(process.cwd(), 'prisma', 'seed.ts');
    let seedContent = fs.readFileSync(seedFilePath, 'utf8');

    // Create the new restaurant entry with proper escaping and null checks
    // Note: We use the restaurant name as the unique identifier for upserts
    // The actual ID will be generated as a CUID by Prisma
    const newEntry = `
    await upsertRestaurant('${escapeString(restaurant.name)}', {
      name: '${escapeString(restaurant.name || '')}',
      cuisineType: CuisineType.${restaurant.cuisineType},
      address: '${escapeString(restaurant.address || '')}',
      description: '${escapeString(restaurant.description || '')}',
      priceRange: PriceRange.${restaurant.priceRange},
      hasPrayerRoom: ${restaurant.hasPrayerRoom},
      hasOutdoorSeating: ${restaurant.hasOutdoorSeating},
      isZabiha: ${restaurant.isZabiha},
      hasHighChair: ${restaurant.hasHighChair},
      servesAlcohol: ${restaurant.servesAlcohol},
      isFullyHalal: ${restaurant.isFullyHalal},
    });
`;

    // Find the UI-Added Restaurants section
    const uiSectionMarker = '// UI-Added Restaurants - Add new entries here';
    const uiSectionIndex = seedContent.indexOf(uiSectionMarker);
    
    if (uiSectionIndex === -1) {
      throw new Error('Could not find UI-Added Restaurants section in seed file');
    }

    // Find the end of the section (next comment or Log summary)
    const nextSectionIndex = seedContent.indexOf('// Log summary', uiSectionIndex);
    if (nextSectionIndex === -1) {
      throw new Error('Could not find end of UI-Added Restaurants section');
    }

    // Insert the new entry after the section marker with proper spacing
    const insertPosition = uiSectionIndex + uiSectionMarker.length;
    
    // Add a newline before the new entry if there isn't one already
    const needsNewline = !seedContent.slice(insertPosition, insertPosition + 2).includes('\n');
    const spacing = needsNewline ? '\n' : '';
    
    // Insert the new entry
    seedContent = seedContent.slice(0, insertPosition) + spacing + newEntry + seedContent.slice(insertPosition);

    // Write back to the file
    fs.writeFileSync(seedFilePath, seedContent);

    console.log(`Successfully added restaurant "${restaurant.name}" to seed file`);
    return true;
  } catch (error) {
    console.error('Error updating seed file:', error);
    return false;
  }
} 
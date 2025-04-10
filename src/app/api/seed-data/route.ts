import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const restaurant = await request.json();
    
    // Read the current seed data
    const seedDataPath = path.join(process.cwd(), 'prisma', 'seed-data.ts');
    const seedDataContent = await fs.readFile(seedDataPath, 'utf-8');
    
    // Parse the existing restaurants array
    const match = seedDataContent.match(/export const restaurants = \[([\s\S]*?)\];/);
    if (!match) {
      throw new Error('Could not parse seed data file');
    }
    
    // Format the new restaurant entry
    const newRestaurantEntry = `  {
    id: '${restaurant.id}',
    name: '${restaurant.name}',
    cuisine: '${restaurant.cuisine}',
    address: '${restaurant.address}',
    description: '${restaurant.description || ''}',
    priceRange: '${restaurant.priceRange || '$'}',
    imageUrl: '${restaurant.imageUrl || 'https://images.unsplash.com/photo-1540914124281-342587941389?auto=format&fit=crop&w=800&q=80'}',
  }`;
    
    // Create new content with the added restaurant
    const existingRestaurants = match[1].trim();
    const newContent = `export const restaurants = [${existingRestaurants ? `${existingRestaurants},\n${newRestaurantEntry}` : newRestaurantEntry}\n];`;
    
    // Write the updated content back to the file
    await fs.writeFile(seedDataPath, newContent, 'utf-8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update seed data:', error);
    return NextResponse.json(
      { error: 'Failed to update seed data' },
      { status: 500 }
    );
  }
} 
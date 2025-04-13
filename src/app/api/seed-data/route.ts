import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Restaurant } from '@prisma/client';

// Function to read seed data
function readSeedData(): Restaurant[] {
  const seedDataPath = path.join(process.cwd(), 'prisma', 'seed-data.json');
  if (!fs.existsSync(seedDataPath)) {
    fs.writeFileSync(seedDataPath, '[]', 'utf8');
    return [];
  }
  return JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
}

// Function to write seed data
function writeSeedData(data: Restaurant[]): void {
  const seedDataPath = path.join(process.cwd(), 'prisma', 'seed-data.json');
  fs.writeFileSync(seedDataPath, JSON.stringify(data, null, 2), 'utf8');
}

export async function GET() {
  try {
    const seedData = readSeedData();
    return NextResponse.json(seedData);
  } catch (err) {
    console.error('Failed to read seed data:', err);
    return NextResponse.json(
      { error: 'Failed to read seed data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const restaurant = await request.json() as Restaurant;
    const seedData = readSeedData();
    
    // Add new restaurant
    seedData.push(restaurant);
    writeSeedData(seedData);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to update seed data:', err);
    return NextResponse.json(
      { error: 'Failed to update seed data' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    const seedData = readSeedData();
    const updatedData = seedData.filter(restaurant => restaurant.id !== id);
    writeSeedData(updatedData);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete from seed data:', err);
    return NextResponse.json(
      { error: 'Failed to delete from seed data' },
      { status: 500 }
    );
  }
} 
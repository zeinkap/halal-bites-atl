import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CuisineType, PriceRange } from '@prisma/client';

// Get all restaurants
export async function GET() {
  try {
    // Test database connection first
    await prisma.$connect();
    
    const restaurants = await prisma.restaurant.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    // Return an empty array instead of an error object to prevent frontend mapping errors
    return NextResponse.json([]);
  } finally {
    await prisma.$disconnect();
  }
}

// Add a new restaurant
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      cuisineType, 
      address, 
      priceRange,
      description,
      hasPrayerRoom,
      hasOutdoorSeating,
      isZabiha,
      hasHighChair
    } = body;

    // Validate required fields
    if (!name || !cuisineType || !address || !priceRange) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate enum values
    if (!Object.values(CuisineType).includes(cuisineType)) {
      return NextResponse.json(
        { error: 'Invalid cuisine type' },
        { status: 400 }
      );
    }

    if (!Object.values(PriceRange).includes(priceRange)) {
      return NextResponse.json(
        { error: 'Invalid price range' },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        cuisineType,
        address,
        priceRange,
        description: description || '',
        hasPrayerRoom: hasPrayerRoom || false,
        hasOutdoorSeating: hasOutdoorSeating || false,
        isZabiha: isZabiha || false,
        hasHighChair: hasHighChair || false
      },
    });

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Error creating restaurant:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Error creating restaurant: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Error creating restaurant' },
      { status: 500 }
    );
  }
}

// Delete a restaurant
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

    // Delete associated comments first
    await prisma.comment.deleteMany({
      where: { restaurantId: id }
    });

    // Then delete the restaurant
    await prisma.restaurant.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    return NextResponse.json(
      { error: 'Error deleting restaurant' },
      { status: 500 }
    );
  }
} 
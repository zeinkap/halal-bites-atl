import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      { error: 'Error fetching restaurants' },
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

    // Delete the restaurant
    await prisma.restaurant.delete({
      where: { id },
    });

    // Update seed data by removing the restaurant
    try {
      const seedResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/seed-data?id=${id}`, {
        method: 'DELETE',
      });

      if (!seedResponse.ok) {
        console.error('Failed to update seed data:', await seedResponse.text());
      }
    } catch (error) {
      console.error('Failed to update seed data:', error);
      // Don't fail the request if seed data update fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to delete restaurant', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, cuisine, address, priceRange } = body;

    // Validate required fields
    if (!name || !cuisine || !address) {
      console.error('Missing required fields:', { name, cuisine, address });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the highest existing ID and increment it
    const restaurants = await prisma.restaurant.findMany({
      orderBy: {
        id: 'desc'
      },
      take: 1
    });

    let nextId = restaurants.length > 0 
      ? (parseInt(restaurants[0].id) + 1).toString()
      : '1';

    // Ensure ID is unique
    let isUnique = false;
    while (!isUnique) {
      const existing = await prisma.restaurant.findUnique({
        where: { id: nextId }
      });
      if (!existing) {
        isUnique = true;
      } else {
        nextId = (parseInt(nextId) + 1).toString();
      }
    }

    console.log('Creating restaurant with ID:', nextId);

    // Create new restaurant
    const restaurant = await prisma.restaurant.create({
      data: {
        id: nextId,
        name,
        cuisine,
        address,
        description: body.description || '',
        priceRange: priceRange || 'MEDIUM',
        imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1540914124281-342587941389?auto=format&fit=crop&w=800&q=80',
      },
    });

    console.log('Restaurant created successfully:', restaurant);

    // Update seed data
    try {
      const seedResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/seed-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurant),
      });

      if (!seedResponse.ok) {
        console.error('Failed to update seed data:', await seedResponse.text());
      }
    } catch (error) {
      console.error('Failed to update seed data:', error);
      // Don't fail the request if seed data update fails
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Failed to add restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to add restaurant', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 
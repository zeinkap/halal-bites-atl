import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, cuisine, address, priceRange } = body;

    // Validate required fields
    if (!name || !cuisine || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the highest existing ID and increment it
    const restaurants = await prismaClient.restaurant.findMany({
      orderBy: {
        id: 'desc'
      },
      take: 1
    });

    const nextId = restaurants.length > 0 
      ? (parseInt(restaurants[0].id) + 1).toString()
      : '1';

    // Create new restaurant
    const restaurant = await prismaClient.restaurant.create({
      data: {
        id: nextId,
        name,
        cuisine,
        address,
        description: '',
        priceRange: priceRange || '$',
        imageUrl: 'https://images.unsplash.com/photo-1540914124281-342587941389?auto=format&fit=crop&w=800&q=80',
      },
    });

    // Update seed data
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/seed-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurant),
      });
    } catch (error) {
      console.error('Failed to update seed data:', error);
      // Don't fail the request if seed data update fails
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Failed to add restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to add restaurant' },
      { status: 500 }
    );
  }
} 
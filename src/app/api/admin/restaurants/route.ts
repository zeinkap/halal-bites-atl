import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const RESTAURANTS_CACHE_KEY = 'restaurants:all';

// Helper function to verify admin access
async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: 'Unauthorized', status: 401 };
  }

  const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!isAdmin) {
    return { error: 'Forbidden', status: 403 };
  }

  return null;
}

// Helper to fetch lat/lng from Nominatim
async function getLatLng(address: string): Promise<{ lat: number | null, lng: number | null }> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'halal-restaurants-atl/1.0 (admin@halalbitesatl.com)' }
  });
  const data = await res.json();
  if (data.length > 0) {
    const { lat, lon } = data[0];
    return { lat: parseFloat(lat), lng: parseFloat(lon) };
  }
  return { lat: null, lng: null };
}

// Get all restaurants with comments count and reports count
export async function GET() {
  try {
    const adminCheck = await verifyAdmin();
    if (adminCheck) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const restaurants = await prisma.restaurant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { 
            comments: true,
            reports: true
          }
        }
      }
    });

    // Transform the data to include counts
    const restaurantsWithCounts = restaurants.map(restaurant => {
      const { _count, ...rest } = restaurant;
      return {
        ...rest,
        commentCount: _count.comments,
        reportCount: _count.reports
      };
    });

    return NextResponse.json(restaurantsWithCounts);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    );
  }
}

// Update a restaurant
export async function PATCH(request: Request) {
  try {
    const adminCheck = await verifyAdmin();
    if (adminCheck) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // If address is being updated, fetch new lat/lng
    let updateData = { ...data };
    if (typeof data.address === 'string' && data.address.trim() !== '') {
      const { lat, lng } = await getLatLng(data.address);
      updateData.latitude = lat;
      updateData.longitude = lng;
    }

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: updateData
    });

    // Clear Redis cache to ensure fresh data
    await redis.del(RESTAURANTS_CACHE_KEY);

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Error updating restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to update restaurant' },
      { status: 500 }
    );
  }
}

// Delete a restaurant
export async function DELETE(request: Request) {
  try {
    const adminCheck = await verifyAdmin();
    if (adminCheck) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // Delete associated comments and reports first
    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { restaurantId: id } }),
      prisma.report.deleteMany({ where: { restaurantId: id } }),
      prisma.restaurant.delete({ where: { id } })
    ]);

    // Clear Redis cache to ensure fresh data
    await redis.del(RESTAURANTS_CACHE_KEY);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to delete restaurant' },
      { status: 500 }
    );
  }
} 
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CuisineType, PriceRange } from '@prisma/client';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const CACHE_TTL = 60 * 5; // 5 minutes
const RESTAURANTS_CACHE_KEY = 'restaurants:all';

// Get all restaurants
export async function GET(req: NextRequest) {
  try {
    // Parse query params for proximity search
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius'); // in kilometers
    const featured = searchParams.get('featured');

    // Build a unique cache key based on query params
    let cacheKey = RESTAURANTS_CACHE_KEY;
    if (featured === 'true') cacheKey += ':featured';
    if (lat && lng) cacheKey += `:lat=${lat}:lng=${lng}`;
    if (radius) cacheKey += `:radius=${radius}`;

    // Try to get from cache first (skip cache if proximity search)
    if (!lat && !lng) {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return NextResponse.json(cachedData);
      }
    }

    // If not in cache, get from database
    await prisma.$connect();
    const whereClause = featured === 'true' ? { isFeatured: true } : undefined;
    const restaurants = await prisma.restaurant.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { comments: true }
        }
      }
    });

    // Transform the data to include only the fields needed for the API response
    const restaurantsWithCommentCount = restaurants.map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      cuisineType: restaurant.cuisineType,
      address: restaurant.address,
      description: restaurant.description,
      priceRange: restaurant.priceRange,
      hasPrayerRoom: restaurant.hasPrayerRoom,
      hasOutdoorSeating: restaurant.hasOutdoorSeating,
      hasHighChair: restaurant.hasHighChair,
      servesAlcohol: restaurant.servesAlcohol,
      isFullyHalal: restaurant.isFullyHalal,
      isZabiha: restaurant.isZabiha,
      isPartiallyHalal: restaurant.isPartiallyHalal,
      partiallyHalalChicken: restaurant.partiallyHalalChicken,
      partiallyHalalLamb: restaurant.partiallyHalalLamb,
      partiallyHalalBeef: restaurant.partiallyHalalBeef,
      partiallyHalalGoat: restaurant.partiallyHalalGoat,
      imageUrl: restaurant.imageUrl,
      zabihaChicken: restaurant.zabihaChicken,
      zabihaLamb: restaurant.zabihaLamb,
      zabihaBeef: restaurant.zabihaBeef,
      zabihaGoat: restaurant.zabihaGoat,
      zabihaVerified: restaurant.zabihaVerified,
      zabihaVerifiedBy: restaurant.zabihaVerifiedBy,
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
      brandId: restaurant.brandId,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      isFeatured: restaurant.isFeatured,
      commentCount: restaurant._count.comments
    }));

    // If lat/lng provided, sort/filter by proximity
    let result = restaurantsWithCommentCount;
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const rad = radius ? parseFloat(radius) : null;
      // Haversine formula
      function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
        const toRad = (v: number) => (v * Math.PI) / 180;
        const R = 6371; // Earth radius in km
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      }
      result = result
        .map(r => {
          const distance = (r.latitude != null && r.longitude != null)
            ? getDistanceKm(userLat, userLng, r.latitude, r.longitude)
            : null;
          return { ...r, distance };
        })
        .filter(r => r.distance !== null && (!rad || r.distance <= rad))
        .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }

    // Store in cache (only if not proximity search)
    if (!lat && !lng) {
      await redis.set(cacheKey, result, {
        ex: CACHE_TTL
      });
    }

    return NextResponse.json(result);
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
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.address || !data.cuisineType || !data.priceRange) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Geocode address using Nominatim, fallback to Google Maps if needed
    let latitude: number | null = null;
    let longitude: number | null = null;
    try {
      // Try Nominatim first
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.address)}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'halal-restaurants-atl/1.0 (your-email@example.com)' }
      });
      const geo = await res.json();
      if (geo.length > 0) {
        latitude = parseFloat(geo[0].lat);
        longitude = parseFloat(geo[0].lon);
      } else {
        // Fallback to Google Maps Geocoding API
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (apiKey) {
          const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(data.address)}&key=${apiKey}`;
          const googleRes = await fetch(googleUrl);
          const googleData = await googleRes.json();
          if (googleData.status === 'OK' && googleData.results.length > 0) {
            latitude = googleData.results[0].geometry.location.lat;
            longitude = googleData.results[0].geometry.location.lng;
          }
        }
      }
    } catch (e) {
      console.error('Geocoding failed:', e);
    }

    // Create restaurant in database
    const restaurant = await prisma.restaurant.create({
      data: {
        id: data.id,
        name: data.name,
        cuisineType: data.cuisineType as CuisineType,
        address: data.address,
        description: data.description || '',
        priceRange: data.priceRange as PriceRange,
        hasPrayerRoom: data.hasPrayerRoom || false,
        hasOutdoorSeating: data.hasOutdoorSeating || false,
        isZabiha: data.isZabiha || false,
        hasHighChair: data.hasHighChair || false,
        servesAlcohol: data.servesAlcohol || false,
        isFullyHalal: data.isFullyHalal || false,
        isPartiallyHalal: data.isPartiallyHalal || false,
        imageUrl: data.imageUrl || '/images/logo.png',
        zabihaChicken: data.zabihaChicken || false,
        zabihaLamb: data.zabihaLamb || false,
        zabihaBeef: data.zabihaBeef || false,
        zabihaGoat: data.zabihaGoat || false,
        partiallyHalalChicken: data.partiallyHalalChicken || false,
        partiallyHalalLamb: data.partiallyHalalLamb || false,
        partiallyHalalBeef: data.partiallyHalalBeef || false,
        partiallyHalalGoat: data.partiallyHalalGoat || false,
        zabihaVerified: data.zabihaVerified || null,
        zabihaVerifiedBy: data.zabihaVerifiedBy || null,
        latitude,
        longitude
      }
    });

    // Clear the cache to ensure fresh data
    await redis.del(RESTAURANTS_CACHE_KEY);

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

// Update a restaurant
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
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
      hasHighChair,
      servesAlcohol,
      isFullyHalal,
      isPartiallyHalal,
      // New Zabihah fields
      zabihaChicken,
      zabihaLamb,
      zabihaBeef,
      zabihaGoat,
      partiallyHalalChicken,
      partiallyHalalLamb,
      partiallyHalalBeef,
      partiallyHalalGoat,
      zabihaVerified,
      zabihaVerifiedBy
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // Validate enum values if provided
    if (cuisineType && !Object.values(CuisineType).includes(cuisineType)) {
      return NextResponse.json(
        { error: 'Invalid cuisine type' },
        { status: 400 }
      );
    }

    if (priceRange && !Object.values(PriceRange).includes(priceRange)) {
      return NextResponse.json(
        { error: 'Invalid price range' },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        name: name || undefined,
        cuisineType: cuisineType || undefined,
        address: address || undefined,
        priceRange: priceRange || undefined,
        description: description || undefined,
        hasPrayerRoom: hasPrayerRoom !== undefined ? hasPrayerRoom : undefined,
        hasOutdoorSeating: hasOutdoorSeating !== undefined ? hasOutdoorSeating : undefined,
        isZabiha: isZabiha !== undefined ? isZabiha : undefined,
        hasHighChair: hasHighChair !== undefined ? hasHighChair : undefined,
        servesAlcohol: servesAlcohol !== undefined ? servesAlcohol : undefined,
        isFullyHalal: isFullyHalal !== undefined ? isFullyHalal : undefined,
        isPartiallyHalal: isPartiallyHalal !== undefined ? isPartiallyHalal : undefined,
        // Add new Zabihah fields
        zabihaChicken: zabihaChicken !== undefined ? zabihaChicken : undefined,
        zabihaLamb: zabihaLamb !== undefined ? zabihaLamb : undefined,
        zabihaBeef: zabihaBeef !== undefined ? zabihaBeef : undefined,
        zabihaGoat: zabihaGoat !== undefined ? zabihaGoat : undefined,
        partiallyHalalChicken: partiallyHalalChicken !== undefined ? partiallyHalalChicken : undefined,
        partiallyHalalLamb: partiallyHalalLamb !== undefined ? partiallyHalalLamb : undefined,
        partiallyHalalBeef: partiallyHalalBeef !== undefined ? partiallyHalalBeef : undefined,
        partiallyHalalGoat: partiallyHalalGoat !== undefined ? partiallyHalalGoat : undefined,
        zabihaVerified: zabihaVerified || undefined,
        zabihaVerifiedBy: zabihaVerifiedBy || undefined
      },
    });

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Error updating restaurant:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Error updating restaurant: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Error updating restaurant' },
      { status: 500 }
    );
  }
}

// Delete endpoint removed - all deletions should go through the admin API 
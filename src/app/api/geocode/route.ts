import { NextRequest, NextResponse } from 'next/server';

/**
 * Geocode a free-text location (city or ZIP) into coordinates.
 * Used by the "Search by city or ZIP" fallback when device location is
 * unavailable. Biased toward the US / Metro Atlanta so a bare ZIP or city
 * name resolves to the expected place.
 *
 * GET /api/geocode?q=30303  ->  { lat, lng, label }
 */

const UA = 'halal-restaurants-atl/1.0 (admin@halalbitesatl.com)';

async function geocodeNominatim(query: string): Promise<{ lat: number; lng: number; label: string } | null> {
  const url =
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us` +
    `&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    const { lat, lon, display_name } = data[0];
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lon);
    if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) {
      return { lat: parsedLat, lng: parsedLng, label: display_name ?? query };
    }
  }
  return null;
}

async function geocodeGoogle(query: string): Promise<{ lat: number; lng: number; label: string } | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;
  const url =
    `https://maps.googleapis.com/maps/api/geocode/json?region=us` +
    `&address=${encodeURIComponent(query)}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const result = data?.results?.[0];
  const loc = result?.geometry?.location;
  if (loc && Number.isFinite(loc.lat) && Number.isFinite(loc.lng)) {
    return { lat: loc.lat, lng: loc.lng, label: result.formatted_address ?? query };
  }
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get('q') || '').trim();

  if (!raw) {
    return NextResponse.json({ error: 'Missing location query.' }, { status: 400 });
  }

  // A bare 5-digit ZIP geocodes far more reliably as "<zip>, USA".
  const query = /^\d{5}$/.test(raw) ? `${raw}, USA` : raw;

  try {
    const result = (await geocodeNominatim(query)) ?? (await geocodeGoogle(query));
    if (!result) {
      return NextResponse.json(
        { error: 'We could not find that location. Try a city name or 5-digit ZIP.' },
        { status: 404 }
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Geocoding failed:', error);
    return NextResponse.json({ error: 'Geocoding failed. Please try again.' }, { status: 500 });
  }
}

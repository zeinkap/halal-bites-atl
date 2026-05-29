import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { isAdminAuthenticated } from '@/lib/admin-auth';

// Verify admin access using the custom admin cookie (same pattern as
// /api/admin/restaurants).
async function verifyAdminCustom() {
  const cookieStore = await cookies();
  const reqObj = { headers: { cookie: cookieStore.toString() } };
  if (!isAdminAuthenticated(reqObj)) {
    return { error: 'Unauthorized', status: 401 };
  }
  return null;
}

// List all brands (id + name), alphabetical.
export async function GET() {
  const adminCheck = await verifyAdminCustom();
  if (adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const brands = await prisma.brand.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

// Create a brand (or return the existing one with the same name).
export async function POST(request: Request) {
  const adminCheck = await verifyAdminCustom();
  if (adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const { name } = await request.json();
    const trimmed = typeof name === 'string' ? name.trim() : '';
    if (!trimmed) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    // Brand.name is unique — upsert avoids a duplicate-name error.
    const brand = await prisma.brand.upsert({
      where: { name: trimmed },
      update: {},
      create: { name: trimmed },
      select: { id: true, name: true },
    });

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}

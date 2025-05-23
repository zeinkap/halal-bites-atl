import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET() {
  try {
    // Verify admin access using custom admin cookie
    const cookieStore = await cookies();
    const reqObj = { headers: { cookie: cookieStore.toString() } };
    if (!isAdminAuthenticated(reqObj)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Export restaurants with their comments
    const data = await prisma.restaurant.findMany({
      include: {
        comments: true
      }
    });

    // Generate export filename
    const date = new Date().toISOString().split('T')[0];
    const filename = `halal-restaurants-atl-export-${date}.json`;

    // Create backup record
    const jsonData = JSON.stringify(data, null, 2);
    await prisma.backup.create({
      data: {
        filename,
        size: Buffer.from(jsonData).length,
        status: 'success'
      }
    });

    // Return data as downloadable JSON
    return new NextResponse(jsonData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename=${filename}`
      }
    });
  } catch (error) {
    console.error('Export failed:', error);
    
    // Log backup failure
    const date = new Date().toISOString().split('T')[0];
    const filename = `halal-restaurants-atl-export-${date}.json`;
    await prisma.backup.create({
      data: {
        filename,
        size: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });

    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
} 
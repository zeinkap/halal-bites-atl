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

    // Get backup history
    const backups = await prisma.backup.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10 // Limit to last 10 backups
    });

    return NextResponse.json(backups);
  } catch (error) {
    console.error('Error fetching backup history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backup history' },
      { status: 500 }
    );
  }
} 
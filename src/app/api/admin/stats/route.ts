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

    // Get total restaurants count
    const totalRestaurants = await prisma.restaurant.count();

    // Get total comments count
    const totalComments = await prisma.comment.count();

    // Get total reports count
    const totalReports = await prisma.report.count();

    // Get last backup date
    const lastBackup = await prisma.backup.findFirst({
      orderBy: { createdAt: 'desc' },
      where: { status: 'success' }
    });

    return NextResponse.json({
      totalRestaurants,
      totalComments,
      totalReports,
      lastBackupDate: lastBackup?.createdAt || null
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
} 
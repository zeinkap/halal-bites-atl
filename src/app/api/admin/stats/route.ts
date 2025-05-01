import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Verify admin access
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = session.user.email === process.env.ADMIN_EMAIL;
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get total restaurants count
    const totalRestaurants = await prisma.restaurant.count();

    // Get total comments count
    const totalComments = await prisma.comment.count();

    // Get total reports count (assuming there's a reports table)
    const totalReports = 0; // This will be implemented when reports feature is added

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
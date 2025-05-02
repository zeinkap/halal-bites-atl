import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Verify admin access
    const session = await getServerSession(authOptions);
    console.log('Admin Stats - Session:', {
      exists: !!session,
      email: session?.user?.email,
      expectedEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL
    });

    if (!session?.user?.email) {
      console.log('Admin Stats - No session email');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    console.log('Admin Stats - Is Admin:', {
      isAdmin,
      userEmail: session.user.email,
      adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL
    });

    if (!isAdmin) {
      console.log('Admin Stats - Not admin');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
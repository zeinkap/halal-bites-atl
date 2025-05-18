import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { isAdminAuthenticated } from '@/lib/admin-auth';

function getPastDates(days: number) {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    dates.push(new Date(d));
  }
  return dates;
}

export async function GET() {
  try {
    // Verify admin access using custom admin cookie
    const cookieStore = await cookies();
    const reqObj = { headers: { cookie: cookieStore.toString() } };
    if (!isAdminAuthenticated(reqObj)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Reports
    const openReports = await prisma.report.count({ where: { status: 'pending' } });
    const resolvedReports = await prisma.report.count({ where: { status: 'resolved' } });
    const rejectedReports = await prisma.report.count({ where: { status: 'rejected' } });

    // Restaurants
    const totalRestaurants = await prisma.restaurant.count();
    const newRestaurants = await prisma.restaurant.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Get total comments count
    const totalComments = await prisma.comment.count();

    // Get last backup date
    const lastBackup = await prisma.backup.findFirst({
      orderBy: { createdAt: 'desc' },
      where: { status: 'success' }
    });

    // Reports over time (last 30 days)
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - 29);
    const reportCounts = await prisma.report.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: startDate } },
      _count: { _all: true },
    });
    const reportsOverTime = getPastDates(30).map(date => {
      const day = reportCounts.find(r => new Date(r.createdAt).toDateString() === date.toDateString());
      return { date: date.toISOString().split('T')[0], count: day ? day._count._all : 0 };
    });

    // Restaurants over time (last 30 days)
    const restaurantCounts = await prisma.restaurant.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: startDate } },
      _count: { _all: true },
    });
    const restaurantsOverTime = getPastDates(30).map(date => {
      const day = restaurantCounts.find(r => new Date(r.createdAt).toDateString() === date.toDateString());
      return { date: date.toISOString().split('T')[0], count: day ? day._count._all : 0 };
    });

    return NextResponse.json({
      openReports,
      resolvedReports,
      rejectedReports,
      newRestaurants,
      totalRestaurants,
      totalComments,
      lastBackupDate: lastBackup?.createdAt || null,
      reportsOverTime,
      restaurantsOverTime,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
} 
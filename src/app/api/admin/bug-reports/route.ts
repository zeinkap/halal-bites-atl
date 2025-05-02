import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  // Verify admin access
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const bugReports = await prisma.bugReport.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(bugReports);
} 
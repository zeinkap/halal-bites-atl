import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { isAdminAuthenticated } from '@/lib/admin-auth';

// Helper function to verify admin access using custom admin cookie
async function verifyAdminCustom() {
  const cookieStore = await cookies();
  const reqObj = { headers: { cookie: cookieStore.toString() } };
  if (!isAdminAuthenticated(reqObj)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  // Verify admin access
  const session = await verifyAdminCustom();
  if (session) {
    return session;
  }

  const bugReports = await prisma.bugReport.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(bugReports);
} 
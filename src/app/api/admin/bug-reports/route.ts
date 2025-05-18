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

export async function PATCH(req: Request) {
  // Verify admin access
  const session = await verifyAdminCustom();
  if (session) {
    return session;
  }

  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }
    const updated = await prisma.bugReport.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update bug report status' }, { status: 500 });
  }
} 
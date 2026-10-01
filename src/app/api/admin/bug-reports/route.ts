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

export async function DELETE(req: Request) {
  // Verify admin access
  const session = await verifyAdminCustom();
  if (session) {
    return session;
  }

  try {
    // The admin page sends { id } in the body; ?id= is accepted too (like /api/admin/reports).
    const { searchParams } = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const id = searchParams.get('id') ?? body?.id;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    await prisma.bugReport.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    // Prisma P2025: the record to delete does not exist
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Bug report not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete bug report' }, { status: 500 });
  }
}

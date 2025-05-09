import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { isAdminAuthenticated } from '@/lib/admin-auth';

// Helper function to verify admin access using custom admin cookie
async function verifyAdminCustom() {
  const cookieStore = await cookies();
  const reqObj = { headers: { cookie: cookieStore.toString() } };
  if (!isAdminAuthenticated(reqObj)) {
    return { error: 'Unauthorized', status: 401 };
  }
  return null;
}

// Get all reports with restaurant details
export async function GET(req: Request) {
  try {
    const adminCheck = await verifyAdminCustom();
    if (adminCheck) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const reports = await prisma.report.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        restaurant: {
          select: {
            name: true,
            address: true
          }
        }
      }
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// Update a report's status
export async function PATCH(req: Request) {
  try {
    const adminCheck = await verifyAdminCustom();
    if (adminCheck) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const data = await req.json();
    const { status, resolvedBy } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    if (!status || !['pending', 'resolved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const report = await prisma.report.update({
      where: { id },
      data: {
        status,
        resolvedAt: status !== 'pending' ? new Date() : null,
        resolvedBy: status !== 'pending' ? resolvedBy : null
      }
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

// Delete a report
export async function DELETE(request: Request) {
  try {
    const adminCheck = await verifyAdminCustom();
    if (adminCheck) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    await prisma.report.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
} 
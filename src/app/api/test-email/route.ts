import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
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

    // Send test email
    await sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: 'Email Configuration Test',
      text: `
        This is a test email to verify your email configuration.
        
        If you're receiving this, your email setup is working correctly!
        
        Time sent: ${new Date().toISOString()}
      `
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully' 
    });
  } catch (error) {
    console.error('Failed to send test email:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
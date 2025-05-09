import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
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

    // Send test email
    await sendEmail({
      to: process.env.NEXT_PUBLIC_ADMIN_EMAIL!,
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
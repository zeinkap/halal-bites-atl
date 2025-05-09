import { NextResponse } from 'next/server';
import { clearAdminSessionCookie } from '@/lib/admin-auth';
 
export async function POST() {
  const res = NextResponse.json({ success: true });
  res.headers.set('Set-Cookie', clearAdminSessionCookie());
  return res;
} 
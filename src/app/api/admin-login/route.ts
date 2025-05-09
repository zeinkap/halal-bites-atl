import { NextResponse } from 'next/server';
import { verifyAdminPassword, setAdminSessionCookie } from '@/lib/admin-auth';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }
  const valid = await verifyAdminPassword(email, password);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const res = NextResponse.json({ success: true });
  res.headers.set('Set-Cookie', setAdminSessionCookie(email));
  return res;
} 
import { serialize, parse } from 'cookie';

const COOKIE_NAME = 'admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

export function getAdminUsersAndHashes() {
  const users = (process.env.ADMIN_USERS || '').split(',').map(u => u.trim());
  const hashes = (process.env.ADMIN_PASSWORDS || '').split(',').map(h => h.trim());
  return { users, hashes };
}

export function findAdminIndex(email: string) {
  const { users } = getAdminUsersAndHashes();
  return users.findIndex(u => u.toLowerCase() === email.toLowerCase());
}

export async function verifyAdminPassword(email: string, password: string) {
  const { hashes } = getAdminUsersAndHashes();
  const idx = findAdminIndex(email);
  if (idx === -1) return false;
  const hash = hashes[idx];
  // DEVELOPMENT ONLY: compare plain text password
  return password === hash;
}

export function setAdminSessionCookie(email: string) {
  return serialize(COOKIE_NAME, email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearAdminSessionCookie() {
  return serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}

export function isAdminAuthenticated(req: { headers: { cookie?: string } }) {
  if (!req.headers.cookie) return false;
  const cookies = parse(req.headers.cookie);
  const { users } = getAdminUsersAndHashes();
  const email = cookies[COOKIE_NAME];
  return !!email && users.includes(email);
} 
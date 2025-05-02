import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: process.env.NEXT_PUBLIC_DOMAIN // This should be .halalbitesatl.org
      }
    }
  },
  callbacks: {
    async signIn({ user }) {
      // Only allow admin email to sign in
      return user.email === process.env.ADMIN_EMAIL;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        session.user.email = token.email;
      }
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
  pages: {
    signIn: '/secret-login',
    error: '/secret-login',
  },
}; 
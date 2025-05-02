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
        domain: 'halalbitesatl.org'
      }
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: 'halalbitesatl.org'
      }
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    }
  },
  callbacks: {
    async signIn({ user }) {
      // Only allow admin email to sign in
      console.log('Auth - Sign In:', {
        userEmail: user.email,
        adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
        isMatch: user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
      });
      return user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    },
    async session({ session, token }) {
      // Send properties to the client
      console.log('Auth - Session Callback:', {
        sessionEmail: session?.user?.email,
        tokenEmail: token.email
      });
      if (session.user) {
        session.user.email = token.email;
      }
      return session;
    },
    async jwt({ token }) {
      console.log('Auth - JWT Callback:', {
        tokenEmail: token.email
      });
      return token;
    },
  },
  pages: {
    signIn: '/secret-login',
    error: '/secret-login',
  },
}; 
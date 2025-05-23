import { NextAuthOptions, User, Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';

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
  callbacks: {
    async signIn({ user }: { user: User }) {
      // Enhanced logging for debugging production issues
      console.log('Auth - Sign In:', {
        userEmail: user.email,
        adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
        isMatch: user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL,
        nodeEnv: process.env.NODE_ENV,
        nextauthSecret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
        nextauthUrl: process.env.NEXTAUTH_URL,
      });
      return user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    },
    async session({ session, token }: { session: Session, token: JWT }) {
      // Send properties to the client
      console.log('Auth - Session Callback:', {
        sessionEmail: session.user?.email,
        tokenEmail: token.email
      });
      if (session.user) {
        session.user.email = token.email as string;
      }
      return session;
    },
    async jwt({ token }: { token: JWT }) {
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
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';
import { authenticateGoogleUserWithBackend } from '@/lib/google-oauth-backend';

type BackendUser = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: 'USER' | 'ADMIN';
  plan?: string;
  avatar?: string;
};

type CredentialsUser = {
  id: string;
  name?: string;
  email?: string;
  role?: 'USER' | 'ADMIN';
  token?: string;
  image?: string | null;
  plan?: string;
};

const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000';

const googleClientId =
  process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || '';
const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || '';

const extractAuthPayload = (payload: Record<string, unknown> | null) => {
  const data = (payload?.data ?? payload) as Record<string, unknown> | undefined;
  if (!data || typeof data !== 'object') {
    return { token: undefined, user: undefined };
  }

  const token =
    (typeof data.accessToken === 'string' && data.accessToken) ||
    (typeof data.token === 'string' && data.token) ||
    undefined;
  const user = data.user;

  return { token, user: user && typeof user === 'object' ? user : undefined };
};

const safeJson = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const payload = await safeJson(response);

        if (!response.ok) {
          const message = payload?.message || 'Invalid email or password';
          throw new Error(String(message));
        }

        const { token: tokenValue, user: userValue } = extractAuthPayload(payload);

        if (!userValue || !tokenValue) {
          throw new Error(String(payload?.message || 'Invalid login response from server'));
        }

        const user = userValue as BackendUser;
        return {
          id: String(user._id || user.id || email),
          name: user.name,
          email: user.email || email,
          role: user.role || 'USER',
          plan: user.plan,
          token: tokenValue,
        } as CredentialsUser;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true;

      const email = user.email?.trim();
      if (!email) {
        return '/login?error=GoogleSignInFailed';
      }

      const result = await authenticateGoogleUserWithBackend({
        name: user.name || email.split('@')[0],
        email,
        googleId: account.providerAccountId,
        avatar: user.image,
      });

      if (!result.ok) {
        switch (result.reason) {
          case 'admin_email':
            return '/login?error=AdminUseEmailPassword';
          case 'email_exists_manual':
            return '/login?error=EmailRegisteredUsePassword';
          default:
            return '/login?error=GoogleSignInFailed';
        }
      }

      const sessionUser = user as CredentialsUser;
      sessionUser.token = result.token;
      sessionUser.role = (result.user.role as 'USER' | 'ADMIN') || 'USER';
      sessionUser.id = String(result.user._id || result.user.id || user.id || email);
      sessionUser.name = result.user.name || user.name || undefined;
      sessionUser.email = result.user.email || email;
      sessionUser.plan = result.user.plan;
      sessionUser.image = result.user.avatar || user.image;

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const sessionUser = user as CredentialsUser;
        token.id = sessionUser.id;
        token.role = sessionUser.role;
        token.token = sessionUser.token;
        if (sessionUser.name) token.name = sessionUser.name;
        if (sessionUser.plan) token.plan = sessionUser.plan;
        const avatar = sessionUser.image || (user as { image?: string }).image;
        if (avatar) token.avatar = avatar;
      }

      if (trigger === 'update' && session) {
        const patch = session as { name?: string; bio?: string; avatar?: string };
        if (patch.name) token.name = patch.name;
        if (patch.bio !== undefined) token.bio = patch.bio;
        if (patch.avatar !== undefined) token.avatar = patch.avatar;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'USER' | 'ADMIN';
        session.user.token = token.token as string;
        if (token.name) session.user.name = token.name as string;
        if (token.bio !== undefined) {
          session.user.bio = token.bio as string;
        }
        if (token.avatar !== undefined) {
          session.user.avatar = token.avatar as string;
          session.user.image = token.avatar as string;
        }
        if (token.plan) {
          session.user.plan = token.plan as string;
        }
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/** NextAuth Google callback — must match Google Cloud Console Authorized redirect URIs exactly. */
export function getGoogleOAuthRedirectUri(): string {
  const base = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
  return `${base}/api/auth/callback/google`;
}

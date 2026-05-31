import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';

type BackendUser = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: 'USER' | 'ADMIN';
  plan?: string;
};

type CredentialsUser = {
  id: string;
  name?: string;
  email?: string;
  role?: 'USER' | 'ADMIN';
  token?: string;
};

const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000';

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
    return JSON.parse(text) as any;
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
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
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
          throw new Error(message);
        }

        const { token: tokenValue, user: userValue } = extractAuthPayload(payload);

        if (!userValue || !tokenValue) {
          throw new Error(payload?.message || 'Invalid login response from server');
        }

        const user = userValue as BackendUser;
        return {
          id: String(user._id || user.id || email),
          name: user.name,
          email: user.email || email,
          role: user.role || 'USER',
          plan: user.plan,
          token: tokenValue,
        } as CredentialsUser & { plan?: string };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true;

      try {
        const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/api/auth/google-upsert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            googleId: account.providerAccountId,
          }),
        });

        const payload = await safeJson(response);
        const data = payload?.data;

        if (response.ok && data?.token) {
          (user as CredentialsUser).token = data.token;
          (user as CredentialsUser).role = data.user?.role || 'USER';
          (user as CredentialsUser).id = data.user?._id || data.user?.id || user.id;
        } else {
          (user as CredentialsUser).role = (user as CredentialsUser).role || 'USER';
        }
      } catch {
        (user as CredentialsUser).role = (user as CredentialsUser).role || 'USER';
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const sessionUser = user as CredentialsUser;
        token.id = sessionUser.id;
        token.role = sessionUser.role;
        token.token = sessionUser.token;
        if (sessionUser.name) token.name = sessionUser.name;
        const withPlan = sessionUser as CredentialsUser & { plan?: string };
        if (withPlan.plan) token.plan = withPlan.plan;
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
          (session.user as { bio?: string }).bio = token.bio as string;
        }
        if (token.avatar !== undefined) {
          (session.user as { avatar?: string }).avatar = token.avatar as string;
        }
        if (token.plan) {
          (session.user as { plan?: string }).plan = token.plan as string;
        }
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

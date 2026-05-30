import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';
import { authApi } from '@/lib/api';

export type AppRole = 'USER' | 'ADMIN';
export type AppPlan = 'FREE' | 'PRO' | 'TEAM';
export type AppStatus = 'ACTIVE' | 'BANNED';

export interface AppUser {
  _id: string;
  name: string;
  email: string;
  role: AppRole;
  plan: AppPlan;
  status: AppStatus;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

type SessionPayload = AppUser & {
  id: string;
  accessToken?: string;
  refreshToken?: string;
};

const demoAccounts: Record<string, { password: string; role: AppRole; plan: AppPlan }> = {
  'user@writeflow.com': { password: '123456', role: 'USER', plan: 'FREE' },
  'admin@writeflow.com': { password: '123456', role: 'ADMIN', plan: 'TEAM' },
};

const parseAdminEmails = () =>
  (process.env.AUTH_ADMIN_EMAILS || 'admin@writeflow.com')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const getRoleFromEmail = (email?: string | null): AppRole => {
  if (!email) return 'USER';
  return parseAdminEmails().includes(email.toLowerCase()) ? 'ADMIN' : 'USER';
};

const buildUser = (payload: Partial<AppUser> & { email: string; name?: string; role?: AppRole }): AppUser => ({
  _id: payload._id || payload.email,
  name: payload.name || payload.email.split('@')[0],
  email: payload.email,
  role: payload.role || getRoleFromEmail(payload.email),
  plan: payload.plan || (payload.role === 'ADMIN' ? 'TEAM' : 'FREE'),
  status: payload.status || 'ACTIVE',
  avatar: payload.avatar,
  bio: payload.bio,
  createdAt: payload.createdAt || new Date().toISOString(),
  updatedAt: payload.updatedAt || new Date().toISOString(),
});

const buildDemoUser = (email: string): SessionPayload => {
  const account = demoAccounts[email.toLowerCase()] || demoAccounts['user@writeflow.com'];

  return {
    id: email,
    ...buildUser({
      _id: email,
      name: account.role === 'ADMIN' ? 'Admin User' : 'Demo User',
      email,
      role: account.role,
      plan: account.plan,
      status: 'ACTIVE',
    }),
    accessToken: `demo-access-${account.role.toLowerCase()}`,
    refreshToken: `demo-refresh-${account.role.toLowerCase()}`,
  };
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
      clientId: process.env.AUTH_GOOGLE_ID || '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        try {
          const { data } = await authApi.login({ email, password });
          const payload = data?.data;

          if (!payload?.user) {
            return null;
          }

          const user = buildUser({
            ...payload.user,
            _id: payload.user._id || payload.user.id || email,
          });

          return {
            id: user._id,
            ...user,
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken,
          } as SessionPayload;
        } catch {
          const demo = demoAccounts[email];

          if (demo && demo.password === password) {
            return buildDemoUser(email);
          }

          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        const sessionUser = user as SessionPayload;
        token.user = {
          ...buildUser(sessionUser),
          avatar: sessionUser.avatar,
        };
        token.accessToken = sessionUser.accessToken;
        token.refreshToken = sessionUser.refreshToken;
      }

      if (account?.provider === 'google' && profile) {
        const googleProfile = profile as Record<string, string | undefined>;
        const profileEmail = googleProfile.email || token.email || '';
        const googleUser = buildUser({
          _id: googleProfile.sub || profileEmail,
          name: googleProfile.name || token.name || profileEmail.split('@')[0],
          email: profileEmail,
          role: getRoleFromEmail(profileEmail),
          plan: getRoleFromEmail(profileEmail) === 'ADMIN' ? 'TEAM' : 'FREE',
          avatar: googleProfile.picture || undefined,
          status: 'ACTIVE',
        });

        token.user = googleUser;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

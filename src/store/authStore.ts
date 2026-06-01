import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSession, signIn, signOut } from 'next-auth/react';
import { authApi } from '@/lib/api';
type AppUser = {
  _id: string;
  name: string;
  email: string;
  role?: 'USER' | 'ADMIN';
  plan?: 'FREE' | 'PRO' | 'TEAM';
  status?: 'ACTIVE' | 'BANNED';
  avatar?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
};
import type { Session } from 'next-auth';

interface AuthState {
  user: AppUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (email: string, password: string) => Promise<AppUser | null>;
  register: (name: string, email: string, password: string) => Promise<AppUser | null>;
  logout: () => void;
  updateUser: (user: Partial<AppUser>) => void;
  syncSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

const syncStorage = (accessToken?: string | null, refreshToken?: string | null, clear = false) => {
  if (typeof window === 'undefined') return;

  if (clear) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return;
  }

  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  }

  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

const syncApiToken = (
  token?: string | null,
  user?: AppUser | null,
  options?: { clear?: boolean }
) => {
  if (typeof window === 'undefined') return;

  if (options?.clear) {
    localStorage.removeItem('writeflow_token');
    localStorage.removeItem('writeflow_user');
    return;
  }

  if (token) {
    localStorage.setItem('writeflow_token', token);
  }

  if (user) {
    localStorage.setItem('writeflow_user', JSON.stringify(user));
  }
};

const toAppUser = (session: Session | null): AppUser | null => {
  if (!session?.user) return null;

  const user = session.user;

  const sessionUser = user as Session['user'] & { _id?: string };

  return {
    _id: sessionUser.id || sessionUser._id || sessionUser.email || '',
    name: user.name || user.email.split('@')[0],
    email: user.email,
    role: user.role || 'USER',
    plan: user.plan || 'FREE',
    status: user.status || 'ACTIVE',
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString(),
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      hasHydrated: false,

      syncSession: (session: Session | null) => {
        const sessionUser = toAppUser(session);
        const apiToken = (session?.user as { token?: string })?.token || null;

        if (!sessionUser) {
          syncStorage(null, null, true);
          syncApiToken(null, null, { clear: true });
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
          return;
        }

        let cachedUser: AppUser | null = null;
        let cachedToken: string | null = null;
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem('writeflow_user');
            cachedUser = raw ? (JSON.parse(raw) as AppUser) : null;
          } catch {
            cachedUser = null;
          }
          cachedToken = localStorage.getItem('writeflow_token');
        }

        const existing = get().user;
        const profileSource = cachedUser ?? existing;
        const user =
          profileSource && profileSource._id === sessionUser._id
            ? {
                ...sessionUser,
                name: profileSource.name,
                bio: profileSource.bio,
                avatar: profileSource.avatar,
                plan: profileSource.plan ?? sessionUser.plan,
                createdAt: profileSource.createdAt ?? sessionUser.createdAt,
                updatedAt: profileSource.updatedAt ?? sessionUser.updatedAt,
              }
            : sessionUser;

        const resolvedToken = apiToken || cachedToken || get().accessToken;

        syncStorage(session?.accessToken, session?.refreshToken);
        syncApiToken(resolvedToken, user);
        set({
          user,
          accessToken: resolvedToken || session?.accessToken || null,
          refreshToken: session?.refreshToken || null,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          await authApi.login(email, password);

          const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
          });

          if (result?.error) {
            throw new Error(
              result.error === 'CredentialsSignin'
                ? 'Invalid email or password'
                : result.error
            );
          }

          const session = await getSession();
          const user = toAppUser(session);
          const apiToken =
            (session?.user as { token?: string })?.token ||
            (typeof window !== 'undefined' ? localStorage.getItem('writeflow_token') : null);

          syncStorage(session?.accessToken, session?.refreshToken);
          syncApiToken(apiToken, user);
          set({
            user,
            accessToken: session?.accessToken || null,
            refreshToken: session?.refreshToken || null,
            isAuthenticated: !!user,
            isLoading: false,
          });

          return user;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          await authApi.register({ name, email, password });

          const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
          });

          if (result?.error) {
            throw new Error(result.error);
          }

          const session = await getSession();
          const user = toAppUser(session);
          const apiToken =
            (session?.user as { token?: string })?.token ||
            (typeof window !== 'undefined' ? localStorage.getItem('writeflow_token') : null);

          syncStorage(session?.accessToken, session?.refreshToken);
          syncApiToken(apiToken, user);
          set({
            user,
            accessToken: apiToken || session?.accessToken || null,
            refreshToken: session?.refreshToken || null,
            isAuthenticated: !!user,
            isLoading: false,
          });

          return user;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        syncStorage(null, null, true);
        syncApiToken(null, null, { clear: true });
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
        void signOut({ callbackUrl: '/login' });
      },

      updateUser: (updatedUser: Partial<AppUser>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const nextUser = { ...currentUser, ...updatedUser };
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('writeflow_token') || get().accessToken
            : get().accessToken;
        syncApiToken(token, nextUser);
        set({ user: nextUser });
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setHasHydrated: (hydrated: boolean) => set({ hasHydrated: hydrated }),
    }),
    {
      name: 'writeflow-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

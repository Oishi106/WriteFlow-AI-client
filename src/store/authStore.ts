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

const syncStorage = (accessToken?: string | null, refreshToken?: string | null) => {
  if (typeof window === 'undefined') return;

  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  } else {
    localStorage.removeItem('accessToken');
  }

  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  } else {
    localStorage.removeItem('refreshToken');
  }
};

const syncApiToken = (token?: string | null, user?: AppUser | null) => {
  if (typeof window === 'undefined') return;

  if (token) {
    localStorage.setItem('writeflow_token', token);
  } else {
    localStorage.removeItem('writeflow_token');
  }

  if (user) {
    localStorage.setItem('writeflow_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('writeflow_user');
  }
};

const toAppUser = (session: Session | null): AppUser | null => {
  if (!session?.user) return null;

  const user = session.user;

  return {
    _id: user._id || user.email,
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
        const user = toAppUser(session);
        const apiToken = (session?.user as { token?: string })?.token || null;

        if (!user) {
          syncStorage(null, null);
          syncApiToken(null, null);
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
          return;
        }

        syncStorage(session?.accessToken, session?.refreshToken);
        syncApiToken(apiToken, user);
        set({
          user,
          accessToken: session?.accessToken || null,
          refreshToken: session?.refreshToken || null,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
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
          const apiToken = (session?.user as { token?: string })?.token || null;

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
          const apiToken = (session?.user as { token?: string })?.token || null;

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

      logout: () => {
        syncStorage(null, null);
        syncApiToken(null, null);
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
        void signOut({ callbackUrl: '/login' });
      },

      updateUser: (updatedUser: Partial<AppUser>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updatedUser } });
        }
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

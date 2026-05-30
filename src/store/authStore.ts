import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSession, signIn, signOut } from 'next-auth/react';
import { authApi } from '@/lib/api';
import type { AppUser } from '@/lib/auth';
import type { Session } from 'next-auth';

interface AuthState {
  user: AppUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AppUser | null>;
  register: (name: string, email: string, password: string) => Promise<AppUser | null>;
  logout: () => void;
  updateUser: (user: Partial<AppUser>) => void;
  syncSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
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

      syncSession: (session: Session | null) => {
        const user = toAppUser(session);

        if (!user) {
          syncStorage(null, null);
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
          return;
        }

        syncStorage(session?.accessToken, session?.refreshToken);
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

          syncStorage(session?.accessToken, session?.refreshToken);
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
          const { data } = await authApi.register({ name, email, password });
          const payload = data.data;

          if (payload?.accessToken || payload?.refreshToken) {
            syncStorage(payload.accessToken, payload.refreshToken);
            set({
              user: payload.user,
              accessToken: payload.accessToken,
              refreshToken: payload.refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
          }

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

          syncStorage(session?.accessToken, session?.refreshToken);
          set({
            user,
            accessToken: session?.accessToken || payload?.accessToken || null,
            refreshToken: session?.refreshToken || payload?.refreshToken || null,
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
    }),
    {
      name: 'writeflow-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

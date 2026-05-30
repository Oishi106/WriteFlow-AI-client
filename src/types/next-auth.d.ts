import type { AppUser } from '@/lib/auth';

declare module 'next-auth' {
  interface Session {
    user: AppUser;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user?: AppUser;
    accessToken?: string;
    refreshToken?: string;
  }
}

import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'USER' | 'ADMIN';
      token: string;
      bio?: string;
      avatar?: string;
      plan?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: 'USER' | 'ADMIN';
    token?: string;
    name?: string;
    bio?: string;
    avatar?: string;
    plan?: string;
  }
}

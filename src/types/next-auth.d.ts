declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'USER' | 'ADMIN';
      token: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      bio?: string;
      avatar?: string;
      plan?: string;
    };
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

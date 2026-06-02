import type { Session } from 'next-auth';

export function getPostAuthPath(session: Session | null): string | null {
  if (!session?.user) return null;
  return session.user.role === 'ADMIN' ? '/admin/analytics' : '/dashboard';
}

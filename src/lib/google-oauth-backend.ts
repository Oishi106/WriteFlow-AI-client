import { createHmac } from 'crypto';

const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000';

export type GoogleBackendAuthResult =
  | {
      ok: true;
      token: string;
      user: {
        _id?: string;
        id?: string;
        name?: string;
        email?: string;
        role?: string;
        plan?: string;
        avatar?: string;
      };
    }
  | { ok: false; reason: 'email_exists_manual' | 'admin_email' | 'missing_email' | 'backend_error'; message?: string };

/** Deterministic password so repeat Google sign-ins use existing /api/auth/login (no new backend routes). */
export function googleOAuthPassword(googleId: string): string {
  const secret =
    process.env.OAUTH_PASSWORD_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'writeflow-oauth-fallback';
  return createHmac('sha256', secret).update(`google:${googleId}`).digest('hex').slice(0, 32);
}

const safeJson = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
};

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

  return {
    token,
    user: user && typeof user === 'object' ? (user as Record<string, unknown>) : undefined,
  };
};

const isEmailExistsMessage = (message: string) =>
  /already|exists|registered|in use/i.test(message);

/**
 * Uses only existing backend routes: POST /api/auth/login then POST /api/auth/register.
 */
export async function authenticateGoogleUserWithBackend(params: {
  name: string;
  email: string;
  googleId: string;
  avatar?: string | null;
}): Promise<GoogleBackendAuthResult> {
  const email = params.email.trim().toLowerCase();
  if (!email) {
    return { ok: false, reason: 'missing_email' };
  }

  const adminEmails = (process.env.AUTH_ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.includes(email)) {
    return { ok: false, reason: 'admin_email' };
  }

  const base = API_BASE_URL.replace(/\/$/, '');
  const password = googleOAuthPassword(params.googleId);
  const displayName = params.name?.trim() || email.split('@')[0];

  const loginRes = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const loginPayload = await safeJson(loginRes);

  if (loginRes.ok) {
    const { token, user } = extractAuthPayload(loginPayload);
    if (token && user) {
      return {
        ok: true,
        token,
        user: {
          _id: user._id as string | undefined,
          id: user.id as string | undefined,
          name: (user.name as string) || displayName,
          email: (user.email as string) || email,
          role: user.role as string | undefined,
          plan: user.plan as string | undefined,
          avatar: (user.avatar as string) || params.avatar || undefined,
        },
      };
    }
  }

  const registerBody: Record<string, string> = {
    name: displayName,
    email,
    password,
  };
  if (params.avatar) {
    registerBody.avatar = params.avatar;
  }

  const registerRes = await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerBody),
  });
  const registerPayload = await safeJson(registerRes);

  if (registerRes.ok) {
    const { token, user } = extractAuthPayload(registerPayload);
    if (token && user) {
      return {
        ok: true,
        token,
        user: {
          _id: user._id as string | undefined,
          id: user.id as string | undefined,
          name: (user.name as string) || displayName,
          email: (user.email as string) || email,
          role: user.role as string | undefined,
          plan: user.plan as string | undefined,
          avatar: (user.avatar as string) || params.avatar || undefined,
        },
      };
    }
  }

  const registerMessage = String(registerPayload?.message || '');
  if (isEmailExistsMessage(registerMessage)) {
    return { ok: false, reason: 'email_exists_manual', message: registerMessage };
  }

  return {
    ok: false,
    reason: 'backend_error',
    message: registerMessage || String(loginPayload?.message || 'Authentication failed'),
  };
}

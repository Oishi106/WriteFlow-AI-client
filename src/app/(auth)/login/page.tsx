'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Zap, Loader2 } from 'lucide-react';
import {
  GoogleSignInButton,
  getGoogleOAuthErrorMessage,
} from '@/components/auth/GoogleSignInButton';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { getPostAuthPath } from '@/lib/session-redirect';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, isLoggingOut } =
    useAuthStore();

  useEffect(() => {
    if (!hasHydrated || isLoggingOut || !isAuthenticated || !user) return;

    const path =
      user.role === 'ADMIN' ? '/admin/analytics' : '/dashboard';

    router.replace(path);
  }, [hasHydrated, isLoggingOut, isAuthenticated, user, router]);

  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [origin, setOrigin] = useState<string | null>(null);

  const { login, isLoading } = useAuthStore();

  const oauthErrorMessage = getGoogleOAuthErrorMessage(
    searchParams.get('error')
  );

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);

    try {
      const user = await login(data.email.trim(), data.password);

      if (!user) throw new Error('Invalid email or password');

      const nextSession = await getSession();
      const path = getPostAuthPath(nextSession) ?? '/dashboard';

      toast({
        title: 'Welcome back',
        description: 'Login successful',
      });

      router.replace(path);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : '';

      const message =
        raw === 'CredentialsSignin' || !raw
          ? 'Invalid email or password'
          : raw;

      toast({
        title: 'Login failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = async () => {
    const email = 'admin@writeflow.com';
    const password = '123456';

    setValue('email', email);
    setValue('password', password);

    await onSubmit({ email, password });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(45,78,232,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(45,78,232,0.18) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-brand-500/30 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-purple-500/30 blur-[150px] rounded-full" />
        <div className="absolute top-1/3 right-1/3 w-[320px] h-[320px] bg-accent-500/20 blur-[160px] rounded-full" />
      </div>

      <div className="relative z-10 grid lg:grid-cols-2 min-h-screen">
        {/* LEFT PANEL */}
        <div className="hidden lg:flex flex-col justify-center px-20 relative">
          <div className="absolute inset-0 -z-10 rounded-none animated-gradient opacity-70" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-background/40" />
          <Link href="/" className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-3xl font-bold text-white">WriteFlow AI</span>
          </Link>

          <span className="w-fit px-4 py-2 rounded-full text-sm bg-brand-500/10 text-brand-500 border border-brand-500/20">
            AI Writing Workspace
          </span>

          <h1 className="font-display text-5xl font-bold mt-6 leading-tight text-white">
            Build content
            <span className="block gradient-text">
              10× faster
            </span>
          </h1>

          <p className="text-white/70 mt-6 text-lg max-w-md">
            Write blogs, marketing copy, and ideas using AI-powered
            tools designed for creators and teams.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-10 max-w-md">
            {[
              'AI Blog Writer',
              'Rewrite Tone',
              'SEO Assist',
              'Team Workspace',
            ].map((item) => (
              <div
                key={item}
                className="p-4 rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="rounded-3xl border bg-card/80 backdrop-blur-2xl shadow-2xl p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="font-display text-3xl font-bold">
                  Welcome back
                </h2>
                <p className="text-muted-foreground mt-2">
                  Sign in to continue
                </p>
              </div>

              {/* Google */}
              <GoogleSignInButton
                callbackUrl="/dashboard"
                className="mb-6"
                externalError={oauthErrorMessage}
              />

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">
                  OR EMAIL
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* FORM */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {/* EMAIL */}
                <div>
                  <label className="text-sm font-medium">
                    Email
                  </label>

                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="mt-2 w-full h-12 px-4 rounded-xl border bg-background focus:ring-2 focus:ring-brand-500"
                  />

                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="text-sm font-medium">
                    Password
                  </label>

                  <div className="relative mt-2">
                    <input
                      {...register('password')}
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full h-12 px-4 pr-12 rounded-xl border bg-background focus:ring-2 focus:ring-brand-500"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPass ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={submitting || isLoading}
                  className="w-full h-12 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition"
                >
                  {submitting || isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* DEMO */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => void fillDemo()}
                  className="w-full h-10 rounded-xl border border-brand-500 text-brand-500"
                >
                  Admin Demo
                </button>
              </div>

              {/* FOOTER */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                No account?{' '}
                <Link
                  href="/register"
                  className="text-brand-500 font-semibold"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
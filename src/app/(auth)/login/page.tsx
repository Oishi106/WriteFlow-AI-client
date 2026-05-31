'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSession, signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Chrome, Eye, EyeOff, Zap, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login, isLoading } = useAuthStore();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) {
      return;
    }

    router.replace((session.user as any).role === 'ADMIN' ? '/admin/analytics' : '/dashboard');
  }, [router, session, status]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const user = await login(data.email.trim(), data.password);

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const nextSession = await getSession();
      const role = (nextSession?.user as { role?: string })?.role ?? user.role;

      toast({ title: 'Welcome back!', description: 'Login successful.' });
      router.replace(role === 'ADMIN' ? '/admin/analytics' : '/dashboard');
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : '';
      const message =
        raw === 'CredentialsSignin' || !raw
          ? 'Invalid email or password. Try Demo User Login or create an account.'
          : raw;
      toast({ title: 'Login failed', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = async (type: 'user' | 'admin') => {
    const email = type === 'admin' ? 'admin@writeflow.com' : 'user@writeflow.com';
    const password = '123456';
    setValue('email', email);
    setValue('password', password);
    await onSubmit({ email, password });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 animated-gradient flex-col items-center justify-center p-12 relative">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 text-center text-white">
          <Link href="/" className="inline-flex w-16 h-16 bg-white/10 border border-white/20 rounded-2xl items-center justify-center mx-auto mb-6 transition-colors hover:bg-white/15">
            <Zap className="w-8 h-8 text-white" />
          </Link>
          <h2 className="font-display text-4xl font-bold mb-4">WriteFlow AI</h2>
          <p className="text-white/70 text-lg max-w-sm">Your agentic content workspace. Draft 10× faster with AI.</p>
          <div className="mt-12 space-y-4">
            {['Blog posts in minutes', 'AI tone rewriting', 'Team collaboration'].map((feat) => (
              <div key={feat} className="flex items-center gap-3 text-white/80">
                <div className="w-5 h-5 bg-green-400/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold gradient-text">WriteFlow AI</span>
            </Link>
            <h1 className="font-display text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue writing.</p>
          </div>

          <button
            type="button"
            onClick={() => void signIn('google', { callbackUrl: '/dashboard' })}
            className="w-full mb-4 py-3 bg-white text-slate-900 font-semibold rounded-xl transition-colors hover:bg-slate-100 flex items-center justify-center gap-2 shadow-sm"
          >
            <Chrome className="w-4 h-4" />
            Continue with Google
          </button>

          {/* Demo Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              disabled={submitting || isLoading}
              onClick={() => void fillDemo('user')}
              className="flex-1 py-2.5 text-xs font-semibold border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-60"
            >
              Demo User Login
            </button>
            <button
              type="button"
              disabled={submitting || isLoading}
              onClick={() => void fillDemo('admin')}
              className="flex-1 py-2.5 text-xs font-semibold border border-brand-500/50 text-brand-500 rounded-lg hover:bg-brand-500/5 transition-colors disabled:opacity-60"
            >
              Demo Admin Login
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs text-muted-foreground"><span className="bg-background px-3">or sign in with email</span></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition-shadow"
              />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Password</label>
                <Link href="/forgot-password" className="text-xs text-brand-500 hover:text-brand-600">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting || isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-500 font-semibold hover:text-brand-600">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

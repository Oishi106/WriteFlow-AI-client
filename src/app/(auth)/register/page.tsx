'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSession, signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { getPostAuthPath } from '@/lib/session-redirect';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const { register: registerUser, isLoading: isAuthStoreLoading } = useAuthStore();
  const [isSigningIn, setIsSigningIn] = useState(false); // 💡 অটো লগইন ট্র্যাকিং স্টেট
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    getSession().then((session) => {
      const path = getPostAuthPath(session);
      if (path) router.replace(path);
    });
  }, [router]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      // ─── 💡 ১. অবজেক্ট আকারে ডাটা পাঠানো হচ্ছে (api.ts এর সাথে সামঞ্জস্য রেখে) ───
      await registerUser(data.name, data.email, data.password);
      
      toast({ title: 'Account created!', description: 'Logging you in automatically...' });
      setIsSigningIn(true);

      // ─── 💡 ২. একাউন্ট ক্রিয়েশন শেষে সরাসরি NextAuth দিয়ে লগইন ───
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false, // ইউআরএল নষ্ট হওয়া আটকাতে
      });

      if (result?.error) {
        toast({ title: 'Sign-in failed', description: 'Account created, please login manually.', variant: 'destructive' });
        router.push('/login');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      setIsSigningIn(false);
    }
  };

  // যেকোনো একটি লোডিং সত্য হলেই বাটন ডিসেবল হবে
  const isLoading = isAuthStoreLoading || isSigningIn;

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
          <Link href="/" className="flex items-center gap-3 mb-10" aria-label="Go to homepage">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center overflow-hidden">
              <Image src="/logo.png" alt="WriteFlow AI logo" width={48} height={48} className="h-12 w-12 object-contain" priority />
            </div>
            <span className="font-display text-3xl font-bold text-white">WriteFlow AI</span>
          </Link>

          <span className="w-fit px-4 py-2 rounded-full text-sm bg-brand-500/10 text-brand-500 border border-brand-500/20">
            AI Writing Workspace
          </span>

          <h1 className="font-display text-5xl font-bold mt-6 leading-tight text-white">
            Start your
            <span className="block gradient-text">creator journey</span>
          </h1>

          <p className="text-white/70 mt-6 text-lg max-w-md">
            Launch your workspace, publish faster, and keep every brand voice consistent across teams.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-10 max-w-md">
            {[
              'Instant onboarding',
              'AI-safe drafts',
              'Team roles',
              'Template library',
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
                <h1 className="font-display text-3xl font-bold mb-2">Create your account</h1>
                <p className="text-muted-foreground">Start writing with AI for free. No credit card required.</p>
              </div>

              

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs text-muted-foreground">
                  <span className="bg-background px-3">create account with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Full name</label>
                  <input
                    {...register('name')}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                  {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Email address</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                  {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPass ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Confirm password</label>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    placeholder="Repeat your password"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                  {errors.confirmPassword && (
                    <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Preparing workspace...
                    </>
                  ) : (
                    'Create Free Account'
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-4">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-brand-500 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-brand-500 hover:underline">
                  Privacy Policy
                </Link>.
              </p>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{' '}
                <Link href="/login" className="text-brand-500 font-semibold hover:text-brand-600">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
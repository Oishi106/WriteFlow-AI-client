'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Zap, Loader2, Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const { register: registerUser, isLoading } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const user = await registerUser(data.name, data.email, data.password);
      toast({ title: 'Account created!', description: 'Welcome to WriteFlow AI.' });
      router.push(user?.role === 'ADMIN' ? '/admin/analytics' : '/dashboard');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">WriteFlow AI</span>
          </Link>
          <h1 className="font-display text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-muted-foreground">Start writing with AI for free. No credit card required.</p>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium mb-2">
            <Check className="w-4 h-4" /> Free plan includes:
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
            <span>• 5 documents/month</span>
            <span>• 10,000 words/month</span>
            <span>• 1 AI agent</span>
            <span>• Basic templates</span>
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
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
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
            {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Free Account'}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-brand-500 hover:underline">Terms of Service</Link> and{' '}
          <Link href="/privacy" className="text-brand-500 hover:underline">Privacy Policy</Link>.
        </p>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-500 font-semibold hover:text-brand-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

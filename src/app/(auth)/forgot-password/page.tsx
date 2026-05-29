'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setStatus('error');
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    await new Promise(r => setTimeout(r, 1500));
    setStatus('sent');
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
          <h1 className="font-display text-3xl font-bold mb-2">Reset your password</h1>
          <p className="text-muted-foreground">Enter your email and we&apos;ll send you a reset link.</p>
        </div>

        {status === 'sent' ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h2 className="font-bold text-xl mb-2">Check your inbox</h2>
              <p className="text-muted-foreground text-sm mb-6">
              We&apos;ve sent a password reset link to <span className="font-medium text-foreground">{email}</span>. It expires in 15 minutes.
            </p>
            <p className="text-xs text-muted-foreground mb-6">Didn&apos;t get it? Check your spam folder or try again.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setStatus('idle')} className="w-full py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                Try a different email
              </button>
              <Link href="/login" className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors text-sm text-center block">
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setStatus('idle'); }}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
                {status === 'error' && <p className="text-destructive text-xs mt-1">{errorMsg}</p>}
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</> : 'Send Reset Link'}
              </button>
            </form>
            <div className="mt-6 pt-6 border-t border-border text-center">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

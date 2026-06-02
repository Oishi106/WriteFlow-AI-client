'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Chrome, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  OAuthCallback: 'Google sign-in was cancelled or interrupted. Please try again.',
  OAuthSignin: 'Could not start Google sign-in. Check OAuth credentials and NEXTAUTH_URL.',
  OAuthAccountNotLinked: 'This Google account cannot be linked. Try email sign-in instead.',
  Configuration: 'Auth misconfiguration. Ensure NEXTAUTH_URL matches your app URL and Google redirect URI is registered.',
  AccessDenied: 'Google access was denied.',
  EmailRegisteredUsePassword:
    'This email already has a password account. Sign in with email and password instead.',
  AdminUseEmailPassword: 'Admin accounts must sign in with email and password (not Google).',
  GoogleSignInFailed: 'Google sign-in failed. Please try again or use email sign-in.',
};

export function getGoogleOAuthErrorMessage(errorCode: string | null): string | null {
  if (!errorCode) return null;
  return GOOGLE_ERROR_MESSAGES[errorCode] || 'Google sign-in failed. Please try again.';
}

type GoogleSignInButtonProps = {
  callbackUrl?: string;
  className?: string;
  externalError?: string | null;
};

export function GoogleSignInButton({
  callbackUrl = '/dashboard',
  className,
  externalError,
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = externalError || localError;

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setLoading(true);

    try {
      const result = await signIn('google', {
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setLocalError(
          getGoogleOAuthErrorMessage(result.error) || 'Google sign-in failed. Please try again.'
        );
        setLoading(false);
        return;
      }

      if (result?.url) {
        window.location.href = result.url;
        return;
      }

      setLocalError('Google sign-in did not start. Check NEXTAUTH_URL and Google OAuth settings.');
      setLoading(false);
    } catch {
      setLocalError('Could not connect to Google. Check your network and try again.');
      setLoading(false);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <button
        type="button"
        onClick={() => void handleGoogleSignIn()}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting to Google...
          </>
        ) : (
          <>
            <Chrome className="h-4 w-4" />
            Continue with Google
          </>
        )}
      </button>
      {displayError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {displayError}
        </p>
      )}
    </div>
  );
}

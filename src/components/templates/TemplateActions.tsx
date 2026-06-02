'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { usageApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const PRO_PLANS = new Set(['PRO', 'TEAM']);

type UsageResponse = {
  success: boolean;
  limitReached?: boolean;
  remainingUses?: number;
  totalUses?: number;
  message?: string;
};

type TemplateActionsProps = {
  itemId: string;
};

export default function TemplateActions({ itemId }: TemplateActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUseTemplate = async () => {
    if (!isAuthenticated) {
      toast({ title: 'Please sign in', description: 'Login to use templates.' });
      router.push('/login');
      return;
    }

    if (user?.plan && PRO_PLANS.has(user.plan)) {
      router.push(`/editor?itemId=${itemId}`);
      return;
    }

    try {
      setIsLoading(true);
      const response = (await usageApi.trackTemplateUsage(itemId)) as UsageResponse;

      if (response.limitReached) {
        setIsDialogOpen(true);
        return;
      }

      router.push(`/editor?itemId=${itemId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start template.';
      toast({ title: 'Usage check failed', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleUseTemplate}
          disabled={isLoading}
          className="px-6 py-3 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors disabled:opacity-60"
        >
          {isLoading ? 'Checking...' : 'Use This Template'}
        </button>
        <Link
          href={`/checkout?itemId=${itemId}`}
          className="px-6 py-3 rounded-xl border border-brand-500 text-brand-500 font-semibold text-sm hover:bg-brand-500/10 transition-colors"
        >
          Buy This Template
        </Link>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Free tier limit reached</AlertDialogTitle>
            <AlertDialogDescription>
              You have used all 5 free templates. Upgrade to keep creating without limits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Maybe later</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href="/checkout">Go to checkout</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

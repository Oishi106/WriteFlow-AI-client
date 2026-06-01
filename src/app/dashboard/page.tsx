'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Zap,
  TrendingUp,
  Clock,
  ArrowRight,
  PenLine,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { dashboardApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatNumber } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface MyStats {
  totalDocuments: number;
  documentsThisMonth: number;
  totalTokensUsed: number;
  totalAICalls: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: session } = useSession();
  const [stats, setStats] = useState<MyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = session?.user?.token;

    if (!token) {
      setLoading(false);
      return;
    }

    dashboardApi
      .getMyStats(token)
      .then((r: unknown) => {
        const res = r as { data?: MyStats } & Partial<MyStats>;
        if (res?.data) {
          setStats(res.data);
        } else if (res?.totalDocuments !== undefined) {
          setStats(res as MyStats);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session?.user?.token]);

  const statCards = [
    {
      label: 'Total Documents',
      value: stats?.totalDocuments ?? 0,
      icon: FileText,
      iconClass: 'wf-pro-icon-circle-blue',
    },
    {
      label: 'This Month',
      value: stats?.documentsThisMonth ?? 0,
      icon: TrendingUp,
      iconClass: 'wf-pro-icon-circle-green',
    },
    {
      label: 'AI Calls Made',
      value: stats?.totalAICalls ?? 0,
      icon: Zap,
      iconClass: 'wf-pro-icon-circle-purple',
    },
    {
      label: 'Words Generated',
      value: stats?.totalTokensUsed ? Math.floor(stats.totalTokensUsed * 0.75) : 0,
      icon: Clock,
      iconClass: 'wf-pro-icon-circle-pink',
    },
  ];

  const quickActions = [
    {
      title: 'Draft a Blog Post',
      desc: 'Use the Content Draft Agent',
      href: '/editor?type=blog',
      icon: PenLine,
      cardClass: 'wf-pro-action-card-blue',
      iconClass: 'wf-pro-icon-square-blue',
    },
    {
      title: 'Rewrite Content',
      desc: 'Change tone, shorten, or expand',
      href: '/editor?type=rewrite',
      icon: RefreshCw,
      cardClass: 'wf-pro-action-card-purple',
      iconClass: 'wf-pro-icon-square-purple',
    },
    {
      title: 'Browse Templates',
      desc: 'Find the perfect starting point',
      href: '/explore',
      icon: BookOpen,
      cardClass: 'wf-pro-action-card-amber',
      iconClass: 'wf-pro-icon-square-amber',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Here&apos;s what&apos;s happening with your content workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <div key={i} className="wf-pro-stat-card">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-400">{card.label}</p>
              <div className={card.iconClass}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded-lg bg-white/5" />
            ) : (
              <p className="text-3xl font-bold text-white">{formatNumber(card.value)}</p>
            )}
          </div>
        ))}
      </div>

      <div className="wf-pro-upgrade-wrap">
        <div className="wf-pro-upgrade-inner">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="wf-pro-plan-badge">{user?.plan || 'FREE'} Plan</span>
              </div>
              <h3 className="font-semibold text-white">
                {user?.plan === 'FREE'
                  ? 'Upgrade to unlock more AI power'
                  : 'You have full access to all features'}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                {user?.plan === 'FREE'
                  ? 'Get 100 documents/month, 3 AI agents, and team collaboration.'
                  : 'Enjoy unlimited content generation with all AI agents.'}
              </p>
            </div>
            {user?.plan === 'FREE' && (
              <Link href="/#pricing" className="wf-pro-cta shrink-0 whitespace-nowrap">
                Upgrade Plan
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Quick actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className={cn('wf-pro-action-card group', action.cardClass)}
            >
              <div className={action.iconClass}>
                <action.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">{action.title}</h3>
              <p className="mt-1 text-xs text-slate-400">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

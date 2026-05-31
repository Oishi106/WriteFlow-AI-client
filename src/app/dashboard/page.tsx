'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Zap, TrendingUp, Clock, ArrowRight, Plus } from 'lucide-react';
import { dashboardApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatNumber } from '@/lib/utils';
import { useSession } from 'next-auth/react';

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

    dashboardApi.getMyStats(token)
      .then((r: any) => {
        // ব্যাকএন্ডের রেসপন্স স্ট্রাকচার অনুযায়ী ডাটা সেট করা হচ্ছে
        if (r && r.data) {
          setStats(r.data);
        } else if (r && r.totalDocuments !== undefined) {
          setStats(r as MyStats);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session?.user?.token]);

  const statCards = [
    { label: 'Total Documents', value: stats?.totalDocuments ?? 0, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'This Month', value: stats?.documentsThisMonth ?? 0, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'AI Calls Made', value: stats?.totalAICalls ?? 0, icon: Zap, color: 'text-brand-500', bg: 'bg-brand-500/10' },
    { label: 'Words Generated', value: stats?.totalTokensUsed ? Math.floor(stats.totalTokensUsed * 0.75) : 0, icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">Here&apos;s what&apos;s happening with your content workspace.</p>
        </div>
        <Link
          href="/editor"
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> New Document
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-muted-foreground text-sm">{card.label}</p>
              <div className={`w-9 h-9 ${card.bg} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            {loading ? (
              <div className="skeleton h-8 w-20" />
            ) : (
              <p className="font-display text-3xl font-bold">{formatNumber(card.value)}</p>
            )}
          </div>
        ))}
      </div>

      {/* Plan Status */}
      <div className="bg-gradient-to-br from-brand-500/10 to-brand-600/5 border border-brand-500/20 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 bg-brand-500/20 text-brand-500 rounded-full uppercase">{user?.plan} Plan</span>
            </div>
            <h3 className="font-semibold">
              {user?.plan === 'FREE' ? 'Upgrade to unlock more AI power' : 'You have full access to all features'}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              {user?.plan === 'FREE' ? 'Get 100 documents/month, 3 AI agents, and team collaboration.' : 'Enjoy unlimited content generation with all AI agents.'}
            </p>
          </div>
          {user?.plan === 'FREE' && (
            <Link href="/#pricing" className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition-colors whitespace-nowrap">
              Upgrade Plan <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-semibold text-lg mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Draft a Blog Post', desc: 'Use the Content Draft Agent', href: '/editor?type=blog', emoji: '✍️' },
            { title: 'Rewrite Content', desc: 'Change tone, shorten, or expand', href: '/editor?type=rewrite', emoji: '🔄' },
            { title: 'Browse Templates', desc: 'Find the perfect starting point', href: '/explore', emoji: '📚' },
          ].map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="group p-5 bg-card border border-border rounded-2xl hover:border-brand-500/30 transition-all card-hover"
            >
              <div className="text-3xl mb-3">{action.emoji}</div>
              <h3 className="font-semibold text-sm">{action.title}</h3>
              <p className="text-muted-foreground text-xs mt-1">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
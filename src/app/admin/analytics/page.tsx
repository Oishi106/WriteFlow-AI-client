'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, FileText, Zap, DollarSign, TrendingUp } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import { useSession } from 'next-auth/react';

interface Stats {
  totalUsers: number;
  totalItems: number;
  totalBookings: number;
  totalRevenue: number;
  aiCallsToday: number;
  newUsersThisMonth: number;
}

interface ChartData {
  dailyAIUsage: Array<{ _id: string; count: number; tokens: number }>;
  userSignups: Array<{ _id: string; count: number }>;
  contentBreakdown: Array<{ _id: string; count: number }>;
}

const PIE_COLORS = ['#4d6ef7', '#8b5cf6', '#10b981', '#f97316'];
const CATEGORY_LABELS: Record<string, string> = {
  blog: 'Blog Posts',
  social: 'Social Media',
  email: 'Email',
  'ad-copy': 'Ad Copy',
};

export default function AdminAnalyticsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = (session?.user as any)?.token;
    if (!token) {
      setLoading(false);
      return;
    }

    Promise.all([adminApi.getStats(token), adminApi.getChartData(token)])
      .then(([statsRes, chartsRes]: any[]) => {
        const statsPayload = statsRes?.data ?? statsRes;
        const chartsPayload = chartsRes?.data ?? chartsRes;
        setStats(statsPayload);
        setCharts(chartsPayload);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [(session?.user as any)?.token]);

  const overviewCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: `+${stats?.newUsersThisMonth ?? 0} this month` },
    { label: 'Total Templates', value: stats?.totalItems ?? 0, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'AI Calls Today', value: stats?.aiCallsToday ?? 0, icon: Zap, color: 'text-brand-500', bg: 'bg-brand-500/10' },
    { label: 'Total Revenue', value: stats?.totalRevenue ?? 0, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10', prefix: '$' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Analytics Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform statistics and performance metrics.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((card, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-muted-foreground text-sm">{card.label}</p>
              <div className={`w-9 h-9 ${card.bg} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            {loading ? (
              <div className="skeleton h-8 w-24" />
            ) : (
              <>
                <p className="font-display text-3xl font-bold">
                  {card.prefix}{formatNumber(card.value)}
                </p>
                {card.trend && (
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {card.trend}
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily AI Usage Bar Chart */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Daily AI Usage</h3>
          {loading ? (
            <div className="skeleton h-52 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts?.dailyAIUsage?.map(d => ({ date: d._id.slice(5), calls: d.count })) ?? []}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="calls" fill="#4d6ef7" radius={[4, 4, 0, 0]} name="AI Calls" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* User Signups Line Chart */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">User Signups (30 days)</h3>
          {loading ? (
            <div className="skeleton h-52 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={charts?.userSignups?.map(d => ({ date: d._id.slice(5), users: d.count })) ?? []}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="users" stroke="#4d6ef7" strokeWidth={2} dot={false} name="New Users" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-card border border-border rounded-2xl p-6 max-w-lg">
        <h3 className="font-semibold mb-4">Content Type Breakdown</h3>
        {loading ? (
          <div className="skeleton h-52 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={charts?.contentBreakdown?.map(d => ({ name: CATEGORY_LABELS[d._id] || d._id, value: d.count })) ?? []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {(charts?.contentBreakdown ?? []).map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

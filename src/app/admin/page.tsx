'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Users, Layers, ShoppingCart, DollarSign } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface Stats {
  totalUsers: number;
  totalItems: number;
  totalOrders?: number;
  totalBookings?: number;
  totalRevenue: number;
}

interface ChartDataItem {
  date?: string;
  _id?: string;
  aiCalls?: number;
  count?: number;
  signups?: number;
  name?: string;
  value?: number;
}

interface ChartDataResponse {
  barChart?: ChartDataItem[];
  lineChart?: ChartDataItem[];
  pieChart?: ChartDataItem[];
  dailyAIUsage?: ChartDataItem[];
  userSignups?: ChartDataItem[];
  contentBreakdown?: ChartDataItem[];
}

const PIE_COLORS = ['#2d4ee8', '#4d6ef7', '#10b981', '#f97316', '#a855f7', '#ec4899', '#06b6d4'];

export default function AdminAnalyticsOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<{
    barChart: Array<{ date: string; aiCalls: number }>;
    lineChart: Array<{ date: string; signups: number }>;
    pieChart: Array<{ name: string; value: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([adminApi.getStats(), adminApi.getChartData()])
      .then(([statsRes, chartRes]: any[]) => {
        const statsPayload = statsRes?.data ?? statsRes;
        const chartsPayload = chartRes?.data ?? chartRes;

        setStats(statsPayload);

        // Normalize bar chart data
        let normBar: Array<{ date: string; aiCalls: number }> = [];
        const rawBar = chartsPayload?.barChart ?? chartsPayload?.dailyAIUsage;
        if (Array.isArray(rawBar)) {
          normBar = rawBar.map((item: any) => ({
            date: String(item.date ?? item._id ?? '').slice(5) || String(item.date ?? item._id ?? ''),
            aiCalls: Number(item.aiCalls ?? item.count ?? 0),
          }));
        }

        // Normalize line chart data
        let normLine: Array<{ date: string; signups: number }> = [];
        const rawLine = chartsPayload?.lineChart ?? chartsPayload?.userSignups;
        if (Array.isArray(rawLine)) {
          normLine = rawLine.map((item: any) => ({
            date: String(item.date ?? item._id ?? '').slice(5) || String(item.date ?? item._id ?? ''),
            signups: Number(item.signups ?? item.count ?? 0),
          }));
        }

        // Normalize pie chart data
        let normPie: Array<{ name: string; value: number }> = [];
        const rawPie = chartsPayload?.pieChart ?? chartsPayload?.contentBreakdown;
        if (Array.isArray(rawPie)) {
          normPie = rawPie.map((item: any) => ({
            name: String(item.name ?? item._id ?? 'Unknown'),
            value: Number(item.value ?? item.count ?? 0),
          }));
        }

        setChartData({
          barChart: normBar,
          lineChart: normLine,
          pieChart: normPie,
        });
      })
      .catch((err) => {
        console.error('Failed to load admin dashboard statistics:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatNumberValue = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold">Analytics Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform statistics and performance metrics.</p>
        </div>

        {/* Skeleton Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-9 rounded-xl" />
              </div>
              <Skeleton className="h-8 w-28 animate-pulse-slow" />
            </div>
          ))}
        </div>

        {/* Skeleton Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-[220px] w-full" />
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-[220px] w-full" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 max-w-lg space-y-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-[220px] w-full" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: formatNumberValue(stats?.totalUsers ?? 0),
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Total Items',
      value: formatNumberValue(stats?.totalItems ?? 0),
      icon: Layers,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Total Orders',
      value: formatNumberValue(stats?.totalOrders ?? stats?.totalBookings ?? 0),
      icon: ShoppingCart,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue ?? 0),
      icon: DollarSign,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Analytics Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform statistics and performance metrics.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 hover:border-brand-500/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <p className="text-muted-foreground text-sm font-medium">{card.label}</p>
              <div className={`w-9 h-9 ${card.bg} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className="font-display text-3xl font-bold tracking-tight text-foreground">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Daily AI Usage */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-4">Daily AI Usage (Last 7 Days)</h3>
            {(!chartData?.barChart || chartData.barChart.length === 0) ? (
              <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground font-medium border border-dashed border-border rounded-xl">
                No AI data yet
              </div>
            ) : (
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.barChart} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 12,
                        fontSize: 12,
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Bar dataKey="aiCalls" fill="#2d4ee8" radius={[4, 4, 0, 0]} name="AI Calls" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Line Chart: User Signups */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-4">Monthly User Signups</h3>
            {(!chartData?.lineChart || chartData.lineChart.length === 0) ? (
              <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground font-medium border border-dashed border-border rounded-xl">
                No signup data yet
              </div>
            ) : (
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.lineChart} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 12,
                        fontSize: 12,
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="signups"
                      stroke="#2d4ee8"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#2d4ee8', strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                      name="Signups"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pie Chart: Items by Category */}
      <div className="bg-card border border-border rounded-2xl p-6 max-w-lg">
        <h3 className="font-semibold text-sm text-foreground mb-4">Items by Category</h3>
        {(!chartData?.pieChart || chartData.pieChart.length === 0) ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground font-medium border border-dashed border-border rounded-xl">
            No category data yet
          </div>
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.pieChart}
                  cx="50%"
                  cy="40%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.pieChart.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                    fontSize: 12,
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: 12, color: 'var(--foreground)', paddingTop: 10 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

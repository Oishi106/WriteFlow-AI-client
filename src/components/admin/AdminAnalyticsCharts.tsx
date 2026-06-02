'use client';

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

type ChartData = {
  dailyAIUsage: Array<{ _id: string; count: number; tokens: number }>;
  userSignups: Array<{ _id: string; count: number }>;
  contentBreakdown: Array<{ _id: string; count: number }>;
};

type AdminAnalyticsChartsProps = {
  charts: ChartData | null;
  loading: boolean;
};

const PIE_COLORS = ['#4d6ef7', '#8b5cf6', '#10b981', '#f97316'];
const CATEGORY_LABELS: Record<string, string> = {
  blog: 'Blog Posts',
  social: 'Social Media',
  email: 'Email',
  'ad-copy': 'Ad Copy',
};

export default function AdminAnalyticsCharts({ charts, loading }: AdminAnalyticsChartsProps) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </>
  );
}

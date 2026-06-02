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

const PIE_COLORS = ['#2d4ee8', '#4d6ef7', '#10b981', '#f97316', '#a855f7', '#ec4899', '#06b6d4'];

type ChartData = {
  barChart: Array<{ date: string; aiCalls: number }>;
  lineChart: Array<{ date: string; signups: number }>;
  pieChart: Array<{ name: string; value: number }>;
} | null;

type AdminOverviewChartsProps = {
  chartData: ChartData;
};

export default function AdminOverviewCharts({ chartData }: AdminOverviewChartsProps) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </>
  );
}

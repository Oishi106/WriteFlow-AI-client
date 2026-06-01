'use client';

import { useState, useEffect, useCallback } from 'react';
import { History, Zap, Filter } from 'lucide-react';
import { aiApi } from '@/lib/api';
import { formatDate, formatRelativeTime } from '@/lib/utils';

interface AILog {
  _id: string;
  agentUsed: string;
  promptSnippet: string;
  tokensUsed: number;
  createdAt: string;
}

const AGENTS = ['All Agents', 'Content Draft', 'Rewrite & Tone', 'Chat Assistant', 'Review Summariser'];

const agentColors: Record<string, string> = {
  'Content Draft': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'Rewrite & Tone': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  'Chat Assistant': 'bg-green-500/10 text-green-600 dark:text-green-400',
  'Review Summariser': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
};

export default function UsageHistoryPage() {
  const [logs, setLogs] = useState<AILog[]>([]);
  const [meta, setMeta] = useState<{ total: number; totalPages: number; page: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [agentFilter, setAgentFilter] = useState('All Agents');
  const [totalTokens, setTotalTokens] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (agentFilter !== 'All Agents') params.agentUsed = agentFilter;
      const res: any = await aiApi.getHistory(params);
      const list = Array.isArray(res?.data) ? res.data : [];
      setLogs(list);
      setMeta(res?.meta ?? { total: list.length, totalPages: 1, page: 1 });
      if (page === 1) {
        const total = (list as AILog[]).reduce((sum: number, l: AILog) => sum + l.tokensUsed, 0);
        setTotalTokens(total);
      }
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, agentFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">AI Usage History</h1>
        <p className="text-muted-foreground text-sm mt-1">A log of all your AI agent interactions.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total AI Calls', value: meta?.total ?? 0, icon: Zap, color: 'text-brand-500', bg: 'bg-brand-500/10' },
          { label: 'Tokens This Page', value: totalTokens, icon: History, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Estimated Words', value: Math.floor(totalTokens * 0.75), icon: Filter, color: 'text-green-500', bg: 'bg-green-500/10' },
        ].map((card, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div>
              <p className="font-display text-2xl font-bold">{card.value.toLocaleString()}</p>
              <p className="text-muted-foreground text-xs">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {AGENTS.map(agent => (
          <button
            key={agent}
            onClick={() => { setAgentFilter(agent); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${agentFilter === agent ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            {agent}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Date', 'Agent', 'Prompt', 'Tokens'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="skeleton h-4 w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-muted-foreground">
                    <Zap className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No AI usage logs yet.</p>
                    <p className="text-sm mt-1">Start using the AI editor to see your history here.</p>
                  </td>
                </tr>
              ) : logs.map(log => (
                <tr key={log._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium">{formatRelativeTime(log.createdAt)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${agentColors[log.agentUsed] ?? 'bg-muted text-muted-foreground'}`}>
                      {log.agentUsed}
                    </span>
                  </td>
                  <td className="px-5 py-4 max-w-xs">
                    <p className="text-sm text-muted-foreground truncate">{log.promptSnippet}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium tabular-nums">{log.tokensUsed.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * 15) + 1}–{Math.min(page * 15, meta.total)} of {meta.total} entries
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors">
                Previous
              </button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Plus, FileText, Clock, Filter } from 'lucide-react';
import { aiApi } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AILog {
  _id: string;
  agentUsed: string;
  promptSnippet: string;
  tokensUsed: number;
  createdAt: string;
}

const STATUS_TABS = ['All', 'Draft', 'Published', 'Archived'];

export default function DocumentsPage() {
  const [logs, setLogs] = useState<AILog[]>([]);
  const [meta, setMeta] = useState<{ total: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeStatus, setActiveStatus] = useState('All');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await aiApi.getHistory({ page, limit: 10 });
      setLogs(data.data);
      setMeta(data.meta);
    } catch { setLogs([]); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = logs.filter(l =>
    search === '' || l.promptSnippet.toLowerCase().includes(search.toLowerCase()) || l.agentUsed.toLowerCase().includes(search.toLowerCase())
  );

  const agentColors: Record<string, string> = {
    'Content Draft': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    'Rewrite & Tone': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    'Chat Assistant': 'bg-green-500/10 text-green-600 dark:text-green-400',
    'Review Summariser': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">My Documents</h1>
          <p className="text-muted-foreground text-sm mt-1">Your AI generation history and drafts.</p>
        </div>
        <Link href="/editor" className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors w-fit">
          <Plus className="w-4 h-4" /> New Document
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveStatus(tab)} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', activeStatus === tab ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by document title or agent..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-muted rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No documents yet</h3>
          <p className="text-muted-foreground mb-4">Start writing to see your content history here.</p>
          <Link href="/editor" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition-colors">
            <Plus className="w-4 h-4" /> Create your first document
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(log => (
            <div key={log._id} className="bg-card border border-border rounded-xl p-5 hover:border-brand-500/30 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-sm line-clamp-1">{log.promptSnippet}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${agentColors[log.agentUsed] ?? 'bg-muted text-muted-foreground'}`}>
                      {log.agentUsed}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatRelativeTime(log.createdAt)}</span>
                    <span>~{log.tokensUsed} tokens</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted disabled:opacity-40">Previous</button>
          <span className="text-sm text-muted-foreground">Page {page} of {meta.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}

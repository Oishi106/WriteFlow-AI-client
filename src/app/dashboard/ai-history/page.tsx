'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { ailogsApi } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type AILogItem = {
  _id: string;
  agentUsed: string;
  promptSnippet: string;
  tokensUsed: number;
  createdAt: string;
};

type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const AGENT_TABS = [
  { value: 'all', label: 'All' },
  { value: 'Content Draft', label: 'Content Draft' },
  { value: 'Rewrite & Tone', label: 'Rewrite & Tone' },
  { value: 'Chat Assistant', label: 'Chat Assistant' },
];

const agentColors: Record<string, string> = {
  'Content Draft': 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  'Rewrite & Tone': 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  'Chat Assistant': 'bg-green-500/10 text-green-700 dark:text-green-400',
  'Review Summariser': 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
};

const truncate = (text: string | null | undefined, max = 60) => {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, max)}…`;
};

export default function AIHistoryPage() {
  const [logs, setLogs] = useState<AILogItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [agent, setAgent] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    setError(false);
    const params: Record<string, string | number> = { page, limit: 10 };
    if (agent !== 'all') params.agentUsed = agent;

    try {
      const res: any = await ailogsApi.getLogs(params);
      const payload = res ?? {};
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.data?.data)
          ? payload.data.data
          : [];
      const metaPayload = payload?.meta ?? payload?.data?.meta ?? { page, limit: 10, total: list.length };
      const totalPages = Math.max(1, Math.ceil(metaPayload.total / metaPayload.limit));
      setLogs(list);
      setMeta({ ...metaPayload, totalPages });
    } catch {
      setError(true);
      setLogs([]);
      setMeta({ page: 1, limit: 10, total: 0, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, agent]);

  const showingRange = useMemo(() => {
    if (!meta || meta.total === 0) return { start: 0, end: 0 };
    const start = (meta.page - 1) * meta.limit + 1;
    const end = Math.min(meta.page * meta.limit, meta.total);
    return { start, end };
  }, [meta]);

  const isEmpty = !loading && !error && meta?.total === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">AI History</h1>
        <p className="text-muted-foreground text-sm mt-1">A log of your AI agent interactions and token usage.</p>
      </div>

      <Tabs
        value={agent}
        onValueChange={(value) => {
          setAgent(value);
          setPage(1);
        }}
      >
        <TabsList className="flex-wrap h-auto gap-1">
          {AGENT_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4" />
            Failed to load AI history. Please try again.
          </div>
          <Button variant="destructive" onClick={fetchLogs}>Retry</Button>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Agent Used</TableHead>
                <TableHead>Prompt Snippet</TableHead>
                <TableHead>Tokens Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="space-y-3 md:hidden">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="rounded-xl border border-border p-4 space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      )}

      {isEmpty && (
        <div className="text-center py-16">
          <Sparkles className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">
            No AI usage yet. Generate some content in the Editor to see your history here.
          </h3>
          <Button asChild className="mt-4">
            <Link href="/editor">Go to Editor</Link>
          </Button>
        </div>
      )}

      {!loading && !error && logs.length > 0 && (
        <>
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Agent Used</TableHead>
                <TableHead>Prompt Snippet</TableHead>
                <TableHead>Tokens Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell className="whitespace-nowrap">{formatDateTime(log.createdAt)}</TableCell>
                  <TableCell>
                    <Badge className={agentColors[log.agentUsed] || ''} variant="secondary">
                      {log.agentUsed}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="max-w-xs text-muted-foreground"
                    title={log.promptSnippet}
                  >
                    {truncate(log.promptSnippet)}
                  </TableCell>
                  <TableCell>{Number(log.tokensUsed ?? 0).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="space-y-4 md:hidden">
            {logs.map((log) => (
              <div key={log._id} className="rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">{formatDateTime(log.createdAt)}</p>
                  <Badge className={agentColors[log.agentUsed] || ''} variant="secondary">
                    {log.agentUsed}
                  </Badge>
                </div>
                <p className="text-sm" title={log.promptSnippet}>
                  {truncate(log.promptSnippet)}
                </p>
                <p className="text-sm font-medium">{Number(log.tokensUsed ?? 0).toLocaleString()} tokens</p>
              </div>
            ))}
          </div>
        </>
      )}

      {meta && meta.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {showingRange.start}-{showingRange.end} of {meta.total} results
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

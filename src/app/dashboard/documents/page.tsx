'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Pencil, Search, Trash2, X, FileText, AlertTriangle } from 'lucide-react';
import { documentsApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

type DocumentItem = {
  _id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  wordCount?: number;
  updatedAt: string;
};

type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const statusColors: Record<string, string> = {
  DRAFT: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  PUBLISHED: 'bg-green-500/10 text-green-700 dark:text-green-400',
  ARCHIVED: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
};

export default function DocumentsPage() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(false);
    const params: Record<string, string | number> = { page, limit: 10 };
    const normalizedStatus = status.trim();
    if (normalizedStatus && normalizedStatus.toLowerCase() !== 'all') {
      params.status = normalizedStatus.toUpperCase();
    }
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

    try {
      const res: any = await documentsApi.getDocuments(params);
      const payload = res ?? {};
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.data?.data)
          ? payload.data.data
          : [];
      const metaPayload = payload?.meta ?? payload?.data?.meta ?? { page, limit: 10, total: list.length };
      const totalPages = Math.max(1, Math.ceil(metaPayload.total / metaPayload.limit));
      setDocuments(list);
      setMeta({ ...metaPayload, totalPages });
    } catch {
      setError(true);
      setDocuments([]);
      setMeta({ page: 1, limit: 10, total: 0, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [page, status, debouncedSearch]);

  const showingRange = useMemo(() => {
    if (!meta || meta.total === 0) return { start: 0, end: 0 };
    const start = (meta.page - 1) * meta.limit + 1;
    const end = Math.min(meta.page * meta.limit, meta.total);
    return { start, end };
  }, [meta]);

  const handleDelete = async (id: string) => {
    try {
      await documentsApi.deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
      setMeta((prev) => prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev);
    } catch {
      toast({ title: 'Failed to delete document', variant: 'destructive' });
    }
  };

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('all');
    setPage(1);
  };

  const noDocumentsExist = !loading && !error && meta?.total === 0 && status === 'all' && !debouncedSearch;
  const noFilteredResults = !loading && !error && documents.length === 0 && !noDocumentsExist;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">My Documents</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your saved drafts and published pieces.</p>
        </div>
        <Button asChild>
          <Link href="/editor">New Document</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <Tabs
          value={status}
          onValueChange={(value) => {
            const nextStatus = value.trim();
            setStatus(nextStatus.toLowerCase() === 'all' ? 'all' : nextStatus);
            setPage(1);
          }}
        >
          <TabsList>
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search documents..."
            className="pl-10 pr-10"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4" />
            Failed to load documents. Please try again.
          </div>
          <Button variant="destructive" onClick={fetchDocuments}>Retry</Button>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Word Count</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="space-y-3 md:hidden">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="rounded-xl border border-border p-4 space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {noDocumentsExist && (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No documents yet. Start your first piece.</h3>
          <Button asChild className="mt-4">
            <Link href="/editor">Start Writing</Link>
          </Button>
        </div>
      )}

      {noFilteredResults && (
        <div className="text-center py-16">
          <h3 className="font-semibold text-lg mb-2">No documents match your filters.</h3>
          <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
        </div>
      )}

      {!loading && !error && documents.length > 0 && (
        <>
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Word Count</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc._id}>
                  <TableCell>
                    <Link href={`/editor?docId=${doc._id}`} className="font-medium hover:underline">
                      {doc.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[doc.status] || ''} variant="secondary">
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{doc.wordCount ?? 0} words</TableCell>
                  <TableCell>{formatDate(doc.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/editor?docId=${doc._id}`} aria-label="Edit document">
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(doc._id)}
                            className="text-destructive hover:text-destructive"
                            aria-label="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="space-y-4 md:hidden">
            {documents.map((doc) => (
              <div key={doc._id} className="rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Link href={`/editor?docId=${doc._id}`} className="font-medium">
                    {doc.title}
                  </Link>
                  <Badge className={statusColors[doc.status] || ''} variant="secondary">
                    {doc.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {doc.wordCount ?? 0} words · {formatDate(doc.updatedAt)}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/editor?docId=${doc._id}`} aria-label="Edit document">
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(doc._id)}
                        className="text-destructive hover:text-destructive"
                        aria-label="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
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
            <Button variant="outline" onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, Check, X, Sparkles, Loader2, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { reviewsApi, aiApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { formatRelativeTime } from '@/lib/utils';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
  userId: { name: string; email: string; avatar?: string };
  itemId: { title: string; category: string };
}

interface Summary {
  summary: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  averageRating: number;
  keyThemes: string[];
  recommendationRate: number;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meta, setMeta] = useState<{ total: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [summarising, setSummarising] = useState(false);
  const { toast } = useToast();

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (filter === 'pending') params.approved = 'false';
      if (filter === 'approved') params.approved = 'true';
      const { data } = await reviewsApi.getAll(params);
      setReviews(data.data);
      setMeta(data.meta);
    } catch { setReviews([]); }
    finally { setLoading(false); }
  }, [page, filter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      await reviewsApi.approve(id, approved);
      toast({ title: approved ? 'Review approved!' : 'Review rejected.' });
      fetchReviews();
    } catch { toast({ title: 'Action failed', variant: 'destructive' }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      await reviewsApi.delete(id);
      toast({ title: 'Review deleted.' });
      fetchReviews();
    } catch { toast({ title: 'Delete failed', variant: 'destructive' }); }
  };

  const handleSummarise = async () => {
    setSummarising(true);
    try {
      const { data } = await aiApi.summariseReviews();
      setSummary(data.data);
      toast({ title: 'Reviews summarised by AI!' });
    } catch { toast({ title: 'Summarisation failed', variant: 'destructive' }); }
    finally { setSummarising(false); }
  };

  const sentimentIcon = (s: string) => {
    if (s === 'positive') return <ThumbsUp className="w-4 h-4 text-green-500" />;
    if (s === 'negative') return <ThumbsDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-yellow-500" />;
  };

  const sentimentColor = (s: string) => {
    if (s === 'positive') return 'text-green-600 dark:text-green-400 bg-green-500/10';
    if (s === 'negative') return 'text-red-600 dark:text-red-400 bg-red-500/10';
    return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Manage Reviews</h1>
          <p className="text-muted-foreground text-sm mt-1">{meta?.total ?? 0} total reviews across all templates.</p>
        </div>
        <button
          onClick={handleSummarise}
          disabled={summarising}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 w-fit"
        >
          {summarising ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          AI Summarise Reviews
        </button>
      </div>

      {/* AI Summary Panel */}
      {summary && (
        <div className="bg-card border border-brand-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" /> AI Review Summary
            </h3>
            <div className="flex items-center gap-2">
              {sentimentIcon(summary.sentiment)}
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${sentimentColor(summary.sentiment)}`}>
                {summary.sentiment} ({summary.sentimentScore}%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="font-display text-2xl font-bold text-brand-500">{summary.averageRating?.toFixed(1) ?? '—'}</p>
              <p className="text-xs text-muted-foreground mt-1">Avg Rating</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="font-display text-2xl font-bold text-green-500">{summary.recommendationRate ?? 0}%</p>
              <p className="text-xs text-muted-foreground mt-1">Would Recommend</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="font-display text-2xl font-bold text-purple-500">{summary.keyThemes?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Key Themes</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Summary:</p>
            <ul className="space-y-1.5">
              {summary.summary.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-brand-500 font-bold mt-0.5">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {summary.keyThemes?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {summary.keyThemes.map(theme => (
                <span key={theme} className="px-2.5 py-1 bg-brand-500/10 text-brand-500 text-xs font-medium rounded-full">{theme}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {(['all', 'pending', 'approved'] as const).map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filter === f ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-muted rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-medium text-muted-foreground">No reviews found for this filter.</p>
          </div>
        ) : reviews.map(review => (
          <div key={review._id} className="bg-card border border-border rounded-2xl p-5 hover:border-brand-500/20 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-brand-500/10 text-brand-500 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0">
                {review.userId?.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{review.userId?.name ?? 'Unknown'}</p>
                      <span className="text-xs text-muted-foreground">{review.userId?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">on</span>
                      <span className="text-xs font-medium text-brand-500">{review.itemId?.title ?? 'Unknown template'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${review.approved ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'}`}>
                      {review.approved ? 'Approved' : 'Pending'}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(review.createdAt)}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{review.comment}</p>

                <div className="flex items-center gap-2 mt-3">
                  {!review.approved && (
                    <button
                      onClick={() => handleApprove(review._id, true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium rounded-lg transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                  {review.approved && (
                    <button
                      onClick={() => handleApprove(review._id, false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs font-medium rounded-lg transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors">Previous</button>
          <span className="text-sm text-muted-foreground">Page {page} of {meta.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors">Next</button>
        </div>
      )}
    </div>
  );
}

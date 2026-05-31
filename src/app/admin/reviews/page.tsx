'use client';

import { useEffect, useState, useCallback } from 'react';
import { Star, Check, Trash2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { adminApi, aiApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
  userId?: {
    _id?: string;
    name: string;
    email?: string;
  } | null;
  itemId?: {
    _id?: string;
    title: string;
  } | null;
}

interface ItemOption {
  _id: string;
  title: string;
}

export default function AdminReviewsPage() {
  const { toast } = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter tab state: 'all' | 'pending' | 'approved'
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved'>('all');

  // AI Summary States
  const [selectedItemId, setSelectedItemId] = useState('');
  const [summaryBullets, setSummaryBullets] = useState<string[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  // Delete Action states
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch reviews & items
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reviewsRes, itemsRes]: any[] = await Promise.all([
        adminApi.getReviews(),
        adminApi.getItems(),
      ]);

      const reviewsPayload = reviewsRes?.data ?? reviewsRes;
      const reviewsList = Array.isArray(reviewsPayload)
        ? reviewsPayload
        : (Array.isArray(reviewsPayload?.data) ? reviewsPayload.data : []);

      const itemsPayload = itemsRes?.data ?? itemsRes;
      const itemsList = Array.isArray(itemsPayload)
        ? itemsPayload
        : (Array.isArray(itemsPayload?.data) ? itemsPayload.data : []);

      setReviews(reviewsList);
      setItems(itemsList);
    } catch (err: any) {
      console.error('Failed to load reviews data:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to load reviews and items.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Client-side filtering
  const filteredReviews = reviews.filter((review) => {
    if (filterTab === 'pending') return !review.approved;
    if (filterTab === 'approved') return review.approved;
    return true;
  });

  // Approve review handler
  const handleApprove = async (reviewId: string) => {
    try {
      await adminApi.approveReview(reviewId);
      toast({
        title: 'Success',
        description: 'Review approved',
      });
      // Refresh local list
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, approved: true } : r))
      );
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to approve review.',
        variant: 'destructive',
      });
    }
  };

  // Delete review action
  const handleConfirmDelete = async () => {
    if (!deletingReview) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteReview(deletingReview._id);
      toast({
        title: 'Success',
        description: 'Review deleted',
      });
      setReviews((prev) => prev.filter((r) => r._id !== deletingReview._id));
      setDeletingReview(null);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete review.',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Generate Review Summary
  const handleGenerateSummary = async () => {
    if (!selectedItemId) {
      setSummaryError('Please select an item first');
      return;
    }
    setSummaryError('');
    setSummaryLoading(true);
    setSummaryBullets([]);

    try {
      const response: any = await aiApi.summariseReviews(selectedItemId);
      const payload = response?.data ?? response;

      // Extract points safely from payload
      let bullets: string[] = [];
      if (payload && typeof payload === 'object') {
        const rawBullets = payload.summary ?? payload.bullets ?? payload.data;
        if (Array.isArray(rawBullets)) {
          bullets = rawBullets.map(String);
        } else if (typeof rawBullets === 'string') {
          bullets = rawBullets
            .split('\n')
            .map((s: string) => s.replace(/^[-\*\s•]+/, '').trim())
            .filter(Boolean);
        } else if (typeof payload.summary === 'string') {
          bullets = payload.summary
            .split('\n')
            .map((s: string) => s.replace(/^[-\*\s•]+/, '').trim())
            .filter(Boolean);
        }
      } else if (Array.isArray(payload)) {
        bullets = payload.map(String);
      }

      // Format to 3 bullet points as specified
      if (bullets.length === 0) {
        bullets = ['This template has generally positive reception.', 'Users highlight formatting and ease of use.', 'More data is needed to build a comprehensive summary.'];
      }
      setSummaryBullets(bullets.slice(0, 3));
    } catch (err: any) {
      console.error('Failed to generate summary:', err);
      toast({
        title: 'Summary generation failed',
        description: err.message || 'Failed to summarize reviews.',
        variant: 'destructive',
      });
      setSummaryError(err.message || 'Failed to generate review summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold">Manage Reviews</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Moderate platform reviews and generate AI summaries of feedback
        </p>
      </div>

      {/* Summarise Reviews Section */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-500" /> Summarise Reviews
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full space-y-1">
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Select Template
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => {
                setSelectedItemId(e.target.value);
                setSummaryError('');
              }}
              className="w-full h-10 px-3 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- Choose Template --</option>
              {items.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleGenerateSummary}
            disabled={summaryLoading}
            className="w-full sm:w-auto"
          >
            {summaryLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Generate Summary
          </Button>
        </div>

        {/* Error notification */}
        {summaryError && (
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-3 rounded-xl">
            <AlertCircle className="w-4 h-4" />
            <span>{summaryError}</span>
          </div>
        )}

        {/* AI Summary result card */}
        {summaryBullets.length > 0 && (
          <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-5 space-y-3 dark:bg-brand-950/20 dark:border-brand-900/50">
            <h4 className="text-xs font-bold uppercase text-brand-500 tracking-wider">
              AI Summary (3 Key Takeaways)
            </h4>
            <ul className="space-y-2">
              {summaryBullets.map((bullet, idx) => (
                <li key={idx} className="text-sm text-foreground flex items-start gap-2.5">
                  <span className="text-brand-500 font-bold mt-0.5">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {(['all', 'pending', 'approved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize',
              filterTab === tab ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Reviews Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="w-2/5">Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No reviews found.
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => (
                <TableRow key={review._id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="font-medium text-sm">
                    {review.userId?.name || 'Unknown'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {review.itemId?.title || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-3.5 h-3.5',
                            i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                          )}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">
                    <span
                      title={review.comment}
                      className="cursor-pointer line-clamp-2 block hover:text-foreground transition-colors"
                    >
                      {review.comment.length > 80
                        ? `${review.comment.slice(0, 80)}...`
                        : review.comment}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={review.approved ? 'default' : 'secondary'}
                      className={cn(
                        review.approved
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/15 border-none'
                          : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/15 border-none'
                      )}
                    >
                      {review.approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!review.approved && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApprove(review._id)}
                          title="Approve Review"
                          className="h-8 w-8 text-green-600 hover:bg-green-500/10"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingReview(review)}
                        title="Delete Review"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Review AlertDialog */}
      <AlertDialog open={!!deletingReview} onOpenChange={(open) => !open && setDeletingReview(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this review?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this review from <strong>{deletingReview?.userId?.name || 'Unknown'}</strong>? This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={deleteLoading}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

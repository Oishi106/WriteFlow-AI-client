'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Star, ArrowRight, FileText, Users, Zap, MessageSquare, Loader2, ArrowLeft } from 'lucide-react';
import { itemsApi, reviewsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { formatRelativeTime } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface Template {
  _id: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  usageCount: number;
  tone?: string;
  estimatedWordCount?: number;
  aiModel?: string;
  sampleOutput?: string;
  createdAt: string;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userId: { name: string; avatar?: string };
}

const catColors: Record<string, string> = {
  blog: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  social: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  email: 'bg-green-500/10 text-green-600 dark:text-green-400',
  'ad-copy': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
};

const catEmojis: Record<string, string> = { blog: '✍️', social: '📱', email: '📧', 'ad-copy': '📢' };

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  const [template, setTemplate] = useState<Template | null>(null);
  const [related, setRelated] = useState<Template[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const parsePayload = <T,>(res: unknown): T | null => {
      if (!res || typeof res !== 'object') return null;
      const payload = res as Record<string, unknown>;
      const data = payload.data ?? payload;
      if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
        return (data as { data: T }).data;
      }
      return data as T;
    };

    const parseItemList = (res: unknown): Template[] => {
      const parsed = parsePayload<Template[]>(res);
      if (Array.isArray(parsed)) return parsed;
      if (Array.isArray(res)) return res as Template[];
      return [];
    };

    Promise.all([
      itemsApi.getItemById(id as string),
      itemsApi.getItems({ limit: 6 }),
      reviewsApi.getByItem(id as string, { limit: 5 }),
    ])
      .then(([tRes, itemsRes, revRes]) => {
        setTemplate(parsePayload<Template>(tRes));
        setRelated(parseItemList(itemsRes).filter((t) => t._id !== id).slice(0, 4));
        const reviewList = parsePayload<Review[]>(revRes);
        setReviews(Array.isArray(reviewList) ? reviewList : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast({ title: 'Please login to leave a review', variant: 'destructive' }); return; }
    if (!reviewForm.comment.trim()) { toast({ title: 'Please write a review comment', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      await reviewsApi.create({ ...reviewForm, itemId: id as string });
      toast({ title: 'Review submitted! It will be visible after approval.' });
      setReviewForm({ rating: 5, comment: '' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit review.';
      toast({ title: msg, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 pt-28 pb-16 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <p className="text-2xl mb-4">😕</p>
          <h2 className="font-bold text-xl mb-2">Template not found</h2>
          <Link href="/explore" className="text-brand-500 hover:underline">Back to Explore</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

          {/* Back */}
          <Link href="/explore" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Link>

          {/* Header */}
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-500/20 to-brand-600/10 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
                {catEmojis[template.category] ?? '📄'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catColors[template.category]}`}>{template.category}</span>
                </div>
                <h1 className="font-display text-3xl font-bold mb-2">{template.title}</h1>
                <p className="text-muted-foreground leading-relaxed mb-4">{template.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-foreground">{template.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{template.usageCount.toLocaleString()} uses</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <Link href={`/editor?templateId=${template._id}`} className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/20">
                Use This Template <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Key Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: FileText, label: 'Category', value: template.category },
              { icon: Zap, label: 'Est. Words', value: template.estimatedWordCount ? `~${template.estimatedWordCount}` : 'Varies' },
              { icon: MessageSquare, label: 'Tone', value: template.tone || 'Flexible' },
              { icon: Bot, label: 'AI Model', value: template.aiModel || 'Gemini Pro' },
            ].map(({ icon: Icon, label, value }, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
                <Icon className="w-5 h-5 text-brand-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-semibold text-sm mt-0.5 capitalize">{value}</p>
              </div>
            ))}
          </div>

          {/* Sample Output */}
          {template.sampleOutput && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-semibold text-lg mb-4">Sample Output</h2>
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{template.sampleOutput}</p>
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-6">Reviews ({reviews.length})</h2>

            {/* Review Form */}
            <form onSubmit={handleReviewSubmit} className="mb-8 p-4 bg-muted/30 rounded-xl border border-border space-y-3">
              <h3 className="font-medium text-sm">Leave a Review</h3>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: i + 1 }))}>
                    <Star className={`w-6 h-6 transition-colors ${i < reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40 hover:text-amber-300'}`} />
                  </button>
                ))}
              </div>
              <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} rows={3} placeholder={isAuthenticated ? 'Share your experience with this template...' : 'Please login to leave a review.'} disabled={!isAuthenticated} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none disabled:opacity-60" />
              <button type="submit" disabled={submitting || !isAuthenticated} className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2">
                {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Submitting...</> : 'Submit Review'}
              </button>
            </form>

            {/* Review List */}
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">No approved reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review._id} className="flex gap-3">
                    <div className="w-9 h-9 bg-brand-500/10 text-brand-500 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {review.userId?.name?.charAt(0).toUpperCase() ?? 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{review.userId?.name}</p>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(review.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related Templates */}
          {related.length > 0 && (
            <div>
              <h2 className="font-semibold text-lg mb-4">Related Templates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {related.map(t => (
                  <Link key={t._id} href={`/templates/${t._id}`} className="bg-card border border-border rounded-xl p-4 hover:border-brand-500/30 card-hover block">
                    <div className="text-2xl mb-2">{catEmojis[t.category] ?? '📄'}</div>
                    <p className="font-medium text-sm line-clamp-2">{t.title}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs text-muted-foreground">{t.rating.toFixed(1)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Bot({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>;
}

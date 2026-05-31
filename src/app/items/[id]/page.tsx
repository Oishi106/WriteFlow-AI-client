import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Star } from 'lucide-react';
import { itemsApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const TEMPLATE_CATEGORIES = ['blog', 'social', 'email', 'ad-copy'];
const BOOKING_CATEGORIES = ['travel', 'restaurant', 'product', 'event', 'property'];

const categoryColors: Record<string, string> = {
  blog: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  social: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  email: 'bg-green-500/10 text-green-600 dark:text-green-400',
  'ad-copy': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  travel: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  restaurant: 'bg-red-500/10 text-red-600 dark:text-red-400',
  product: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  event: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  property: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
};

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

type Item = {
  _id: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  reviewCount?: number;
  price?: number;
  sampleOutput?: string;
  image?: string;
};

type Review = {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  approved?: boolean;
  userId?: { name?: string };
};

const parsePayload = (res: any) => res?.data ?? res;

async function fetchItem(id: string): Promise<Item | null> {
  try {
    const res = await itemsApi.getItemById(id);
    const payload = parsePayload(res);
    return (payload?.data ?? payload) as Item;
  } catch {
    return null;
  }
}

async function fetchRelated(category: string, id: string): Promise<Item[]> {
  try {
    const res = await itemsApi.getItems({ category, limit: 5 });
    const payload = parsePayload(res);
    const items = (payload?.data ?? []) as Item[];
    return items.filter((item) => item._id !== id).slice(0, 4);
  } catch {
    return [];
  }
}

async function fetchReviews(id: string): Promise<Review[]> {
  if (!API_BASE_URL) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/api/reviews/item/${id}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    const payload = parsePayload(json);
    const list = (payload?.data ?? payload) as Review[];
    return list.filter((review) => review.approved !== false);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const item = await fetchItem(params.id);
  if (!item) {
    return { title: 'Template Not Found', description: 'Template not found.' };
  }
  return {
    title: item.title,
    description: item.description,
  };
}

export default async function TemplateDetailsPage({ params }: { params: { id: string } }) {
  const item = await fetchItem(params.id);
  if (!item) {
    notFound();
  }

  const [reviews, related] = await Promise.all([
    fetchReviews(params.id),
    fetchRelated(item.category, item._id),
  ]);

  const filledStars = Math.round(item.rating || 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <nav className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/explore" className="hover:text-foreground">Explore</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">{item.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="relative h-72 w-full rounded-2xl overflow-hidden border border-border bg-muted">
            <Image
              src={item.image || '/placeholder.jpg'}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="space-y-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[item.category] || 'bg-muted text-muted-foreground'}`}>
              {item.category}
            </span>
            <h1 className="font-display text-3xl font-bold">{item.title}</h1>
            <p className="text-muted-foreground leading-relaxed">{item.description}</p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`w-4 h-4 ${idx < filledStars ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                  />
                ))}
                <span className="ml-1 text-foreground font-medium">{item.rating?.toFixed(1) ?? '0.0'}</span>
              </div>
              <span>{item.reviewCount ?? reviews.length} reviews</span>
            </div>

            <div className="text-lg font-semibold">
              {item.price && item.price > 0 ? `$${item.price}` : 'Free'}
            </div>

            <div className="flex flex-wrap gap-3">
              {TEMPLATE_CATEGORIES.includes(item.category) && (
                <Link
                  href={`/editor?itemId=${item._id}`}
                  className="px-6 py-3 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
                >
                  Use This Template
                </Link>
              )}
              {BOOKING_CATEGORIES.includes(item.category) && (
                <Link
                  href={`/bookings/new?itemId=${item._id}`}
                  className="px-6 py-3 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
                >
                  Book This
                </Link>
              )}
            </div>
          </div>
        </div>

        {item.sampleOutput && (
          <section className="bg-muted/30 border border-border rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4">Sample Output</h2>
            <div className="bg-background border border-border rounded-xl p-4 text-sm whitespace-pre-wrap">
              {item.sampleOutput}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="font-semibold text-lg">Approved Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border border-border rounded-xl p-4 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{review.userId?.name || 'Anonymous'}</p>
                    <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-3.5 h-3.5 ${idx < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {related.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-semibold text-lg">Related Templates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((relatedItem) => (
                <Link
                  key={relatedItem._id}
                  href={`/items/${relatedItem._id}`}
                  className="border border-border rounded-xl p-4 bg-card hover:border-brand-500/40 transition-colors"
                >
                  <div className="relative h-28 w-full rounded-lg overflow-hidden bg-muted mb-3">
                    <Image
                      src={relatedItem.image || '/placeholder.jpg'}
                      alt={relatedItem.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 25vw"
                    />
                  </div>
                  <p className="text-sm font-medium line-clamp-2">{relatedItem.title}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{relatedItem.rating?.toFixed(1) ?? '0.0'}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

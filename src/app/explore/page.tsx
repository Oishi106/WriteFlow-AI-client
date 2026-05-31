'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Star, XCircle } from 'lucide-react';
import { itemsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface Template {
  _id: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  usageCount: number;
  image?: string;
  reviewCount?: number;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const CATEGORY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'blog', label: 'Blog' },
  { value: 'social', label: 'Social' },
  { value: 'email', label: 'Email' },
  { value: 'ad-copy', label: 'Ad Copy' },
  { value: 'travel', label: 'Travel' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'product', label: 'Product' },
  { value: 'event', label: 'Event' },
  { value: 'property', label: 'Property' },
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'highest-rated', label: 'Highest Rated' },
];

const RATING_FILTERS = [
  { value: 'all', label: 'All' },
  { value: '4', label: '4 Stars and above' },
  { value: '3', label: '3 Stars and above' },
];

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

export default function ExplorePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [rating, setRating] = useState('all');
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let isActive = true;
    setLoading(true);

    const params: Record<string, string | number> = {
      page,
      limit: 12,
      sort,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (category !== 'all') params.category = category;
    if (rating !== 'all') params.rating = rating;

    itemsApi
      .getItems(params)
      .then((res: any) => {
        if (!isActive) return;
        const payload = res ?? {};
        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.data?.data)
            ? payload.data.data
            : [];
        const metaPayload = payload?.meta ?? payload?.data?.meta ?? { page, limit: 12, total: list.length };
        const totalPages = Math.max(1, Math.ceil(metaPayload.total / metaPayload.limit));

        setTemplates(list);
        setMeta({ ...metaPayload, totalPages });
      })
      .catch(() => {
        if (isActive) {
          setTemplates([]);
          setMeta({ page: 1, limit: 12, total: 0, totalPages: 1 });
        }
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [page, debouncedSearch, category, rating, sort]);

  const showEmptyState = !loading && templates.length === 0;
  const totalPages = meta?.totalPages ?? 1;

  const showingRange = useMemo(() => {
    if (!meta || meta.total === 0) return { start: 0, end: 0 };
    const start = (meta.page - 1) * meta.limit + 1;
    const end = Math.min(meta.page * meta.limit, meta.total);
    return { start, end };
  }, [meta]);

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setCategory('all');
    setRating('all');
    setSort('popular');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="bg-muted/30 border-b border-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3">
              Explore <span className="gradient-text">Templates</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              {meta?.total ?? 0} templates to supercharge your content creation.
            </p>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search templates by name or keyword..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={rating}
                  onChange={(e) => {
                    setRating(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {RATING_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {CATEGORY_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => {
                    setCategory(filter.value);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                    category === filter.value
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-brand-500/40'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {showEmptyState ? (
            <div className="text-center py-20">
              <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No templates found matching your filters.</h3>
              <button
                onClick={clearFilters}
                className="mt-4 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {loading
                ? Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
                      <Skeleton className="h-40 w-full" />
                      <div className="p-5 space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-4/5" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                    </div>
                  ))
                : templates.map((template) => (
                    <div
                      key={template._id}
                      className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-brand-500/30 card-hover flex flex-col"
                    >
                      <div className="relative h-40 w-full bg-muted">
                        <Image
                          src={template.image || '/placeholder.jpg'}
                          alt={template.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit mb-2 ${categoryColors[template.category] || 'bg-muted text-muted-foreground'}`}>
                          {template.category}
                        </span>
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{template.title}</h3>
                        <p className="text-muted-foreground text-xs leading-relaxed mb-4 flex-1 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{template.rating.toFixed(1)}</span>
                          </div>
                          <span>{template.usageCount.toLocaleString()} uses</span>
                        </div>
                        <Link
                          href={`/items/${template._id}`}
                          className="w-full py-2 text-center text-xs font-semibold bg-brand-500/10 hover:bg-brand-500 text-brand-600 dark:text-brand-400 hover:text-white dark:hover:text-white rounded-lg transition-all"
                        >
                          Use Template
                        </Link>
                      </div>
                    </div>
                  ))}
            </div>
          )}

          {meta && totalPages > 1 && (
            <div className="mt-10 space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Showing {showingRange.start}-{showingRange.end} of {meta.total} results
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const current = idx + 1;
                  return (
                    <button
                      key={current}
                      onClick={() => setPage(current)}
                      className={`w-9 h-9 text-sm rounded-lg border transition-colors ${
                        page === current
                          ? 'bg-brand-500 text-white border-brand-500'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      {current}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Filter, Star, SlidersHorizontal } from 'lucide-react';
import { itemsApi } from '@/lib/api';
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
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'social', label: 'Social Media' },
  { value: 'email', label: 'Email' },
  { value: 'ad-copy', label: 'Ad Copy' },
];

const RATINGS = [
  { value: '', label: 'Any Rating' },
  { value: '4', label: '4★ & above' },
  { value: '3', label: '3★ & above' },
];

const SORTS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Highest Rated' },
];

const categoryColors: Record<string, string> = {
  blog: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  social: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  email: 'bg-green-500/10 text-green-600 dark:text-green-400',
  'ad-copy': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
};

const categoryEmojis: Record<string, string> = {
  blog: '✍️', social: '📱', email: '📧', 'ad-copy': '📢',
};

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="h-36 bg-muted" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-5 bg-muted rounded w-4/5" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="h-9 bg-muted rounded-lg mt-4" />
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState('');
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 12, sort };
      if (search) params.search = search;
      if (category) params.category = category;
      if (rating) params.rating = rating;

      const { data } = await itemsApi.getAll(params);
      setTemplates(data.data);
      setMeta(data.meta);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, rating, sort]);

  useEffect(() => {
    const timeout = setTimeout(fetchTemplates, 300);
    return () => clearTimeout(timeout);
  }, [fetchTemplates]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        {/* Header */}
        <div className="bg-muted/30 border-b border-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3">
              Explore <span className="gradient-text">Templates</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              {meta?.total ?? 0} templates to supercharge your content creation.
            </p>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search templates by name or keyword..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-5 py-3 border border-border rounded-xl bg-card hover:bg-muted transition-colors text-sm font-medium"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters {(category || rating) && <span className="w-2 h-2 bg-brand-500 rounded-full" />}
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-card border border-border rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Category</label>
                  <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Minimum Rating</label>
                  <select value={rating} onChange={e => { setRating(e.target.value); setPage(1); }} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    {RATINGS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Sort By</label>
                  <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {!loading && templates.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-semibold text-lg mb-2">No templates found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {loading
                ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
                : templates.map((t) => (
                    <div key={t._id} className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-brand-500/30 card-hover flex flex-col">
                      <div className="h-36 bg-gradient-to-br from-brand-500/10 to-brand-600/5 flex items-center justify-center">
                        <span className="text-4xl">{categoryEmojis[t.category] ?? '📄'}</span>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit mb-2 ${categoryColors[t.category]}`}>
                          {t.category}
                        </span>
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{t.title}</h3>
                        <p className="text-muted-foreground text-xs leading-relaxed mb-4 flex-1 line-clamp-3">{t.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{t.rating.toFixed(1)}</span>
                          </div>
                          <span>{t.usageCount.toLocaleString()} uses</span>
                        </div>
                        <Link href={`/templates/${t._id}`} className="w-full py-2 text-center text-xs font-semibold bg-brand-500/10 hover:bg-brand-500 text-brand-600 dark:text-brand-400 hover:text-white dark:hover:text-white rounded-lg transition-all">
                          Use Template
                        </Link>
                      </div>
                    </div>
                  ))}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, meta.totalPages - 4)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 text-sm rounded-lg border transition-colors ${page === p ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:bg-muted'}`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

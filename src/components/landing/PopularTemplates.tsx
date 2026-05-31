import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';
import { itemsApi } from '@/lib/api';

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

const categoryEmoji: Record<string, string> = {
  blog: '✍️',
  social: '📱',
  email: '📧',
  'ad-copy': '📢',
  travel: '✈️',
  restaurant: '🍽️',
  product: '📦',
  event: '🎟️',
  property: '🏠',
};

type Template = {
  _id: string;
  title: string;
  category: string;
  rating: number;
  usageCount: number;
  description: string;
};

export default async function PopularTemplates() {
  let templates: Template[] = [];

  try {
    const res: any = await itemsApi.getItems({ sort: 'popular', limit: 4 });
    const payload = res ?? {};
    templates = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.data?.data)
        ? payload.data.data
        : [];
  } catch {
    templates = [];
  }

  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div>
            <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-2">Templates</p>
            <h2 className="font-display text-4xl font-bold">Popular <span className="gradient-text">templates</span></h2>
          </div>
          <Link href="/explore" className="flex items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors">
            View all templates <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {templates.map((t) => (
            <div key={t._id} className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-brand-500/30 card-hover flex flex-col">
              <div className="h-36 bg-gradient-to-br from-brand-500/10 to-brand-600/5 flex items-center justify-center">
                <span className="text-4xl">{categoryEmoji[t.category] ?? '📄'}</span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[t.category] || 'bg-muted text-muted-foreground'}`}>
                    {t.category}
                  </span>
                </div>
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{t.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed mb-4 flex-1 line-clamp-2">{t.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{t.rating.toFixed(1)}</span>
                  </div>
                  <span>{t.usageCount.toLocaleString()} uses</span>
                </div>
                <Link
                  href={`/items/${t._id}`}
                  className="w-full py-2 text-center text-xs font-semibold bg-brand-500/10 hover:bg-brand-500 text-brand-600 hover:text-white dark:text-brand-400 dark:hover:text-white rounded-lg transition-all"
                >
                  Use Template
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

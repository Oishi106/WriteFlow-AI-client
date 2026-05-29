'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, ArrowRight, Mail } from 'lucide-react';

// ─── Newsletter Section ────────────────────────────────────────────────────────

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    await new Promise(r => setTimeout(r, 1000));
    setStatus('success');
    setEmail('');
  };

  return (
    <section className="py-24 bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-br from-brand-500/10 via-brand-600/5 to-transparent border border-brand-500/20">
          <Mail className="w-10 h-10 text-brand-500 mx-auto mb-4" />
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
            Get writing tips <span className="gradient-text">in your inbox</span>
          </h2>
          <p className="text-muted-foreground mb-8">Join 5,000+ writers getting weekly AI writing strategies and template drops.</p>

          {status === 'success' ? (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400 font-medium">
              You&apos;re in! Check your inbox for a welcome email.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 text-sm"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="text-red-500 text-sm mt-2">Please enter a valid email address.</p>
          )}
          <p className="text-muted-foreground text-xs mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}

// ─── Popular Templates ─────────────────────────────────────────────────────────

const mockTemplates = [
  { id: '1', title: 'SEO Blog Post Generator', category: 'blog', rating: 4.8, usageCount: 1250, description: 'Generate comprehensive, SEO-optimized blog posts that rank on Google.' },
  { id: '2', title: 'Instagram Caption Wizard', category: 'social', rating: 4.6, usageCount: 3200, description: 'Create scroll-stopping captions with perfect hashtags for maximum reach.' },
  { id: '3', title: 'Email Newsletter Writer', category: 'email', rating: 4.7, usageCount: 890, description: 'Craft engaging newsletters that drive opens, clicks, and conversions.' },
  { id: '4', title: 'Facebook Ad Copy Master', category: 'ad-copy', rating: 4.5, usageCount: 2100, description: 'Write high-converting ad copy that turns visitors into customers.' },
];

const categoryColors: Record<string, string> = {
  blog: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  social: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  email: 'bg-green-500/10 text-green-600 dark:text-green-400',
  'ad-copy': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
};

export default function PopularTemplates() {
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
          {mockTemplates.map((t) => (
            <div key={t.id} className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-brand-500/30 card-hover flex flex-col">
              <div className="h-36 bg-gradient-to-br from-brand-500/10 to-brand-600/5 flex items-center justify-center">
                <span className="text-4xl">
                  {t.category === 'blog' ? '✍️' : t.category === 'social' ? '📱' : t.category === 'email' ? '📧' : '📢'}
                </span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[t.category]}`}>
                    {t.category}
                  </span>
                </div>
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{t.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed mb-4 flex-1 line-clamp-2">{t.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{t.rating}</span>
                  </div>
                  <span>{t.usageCount.toLocaleString()} uses</span>
                </div>
                <Link
                  href={`/templates/${t.id}`}
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

'use client';

import { Star } from 'lucide-react';

const testimonials = [
  { name: 'Sarah Chen', role: 'Content Strategist at HubSpot', review: 'WriteFlow AI cut our content production time by 70%. The tone rewriting agent alone is worth the subscription.', rating: 5, avatar: 'SC' },
  { name: 'Marcus Webb', role: 'Freelance Copywriter', review: 'I used to spend 4 hours on a blog post. Now it takes 30 minutes. The AI understands nuance in a way other tools don\'t.', rating: 5, avatar: 'MW' },
  { name: 'Priya Nair', role: 'Marketing Director at Shopify', review: 'The team collaboration features and admin analytics dashboard are exactly what we needed to scale our content ops.', rating: 5, avatar: 'PN' },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">Loved by <span className="gradient-text">10,000+ writers</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border border-border hover:border-brand-500/30 transition-all card-hover">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">“{t.review}”</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-muted-foreground text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

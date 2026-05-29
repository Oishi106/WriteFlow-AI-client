'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  { q: 'What AI model does WriteFlow use?', a: 'WriteFlow AI uses Google Gemini Pro for all content generation — one of the most capable language models available, optimized for creative and professional writing.' },
  { q: 'Is my content private and secure?', a: 'Absolutely. Your documents are private by default and only accessible to you. We use JWT authentication and encrypted storage. We never train on your content.' },
  { q: 'Can I cancel my subscription anytime?', a: 'Yes. You can upgrade, downgrade, or cancel your subscription at any time from your dashboard. No lock-in periods or cancellation fees.' },
  { q: 'What content types does WriteFlow support?', a: 'WriteFlow supports blog posts, social media captions (Instagram, Twitter, LinkedIn), email campaigns, and ad copy for Google Ads and Facebook/Instagram.' },
  { q: 'Do you offer a free trial for Pro?', a: 'Yes! Pro and Team plans include a 7-day free trial with no credit card required. You get full access to all features during the trial.' },
  { q: 'How does the AI Chat Assistant work?', a: 'The Chat Assistant lives inside your editor and understands your current document context. You can ask it questions, request outlines, get feedback, or brainstorm ideas — all without leaving the editor.' },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">Frequently asked <span className="gradient-text">questions</span></h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-border bg-card rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium pr-4">{faq.q}</span>
                <ChevronDown className={cn('w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform', open === i && 'rotate-180')} />
              </button>
              {open === i && (
                <div className="px-6 pb-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { Check, X } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out WriteFlow AI.',
    features: [
      { text: '5 documents/month', included: true },
      { text: '10,000 words/month', included: true },
      { text: '1 AI agent', included: true },
      { text: 'Basic templates', included: true },
      { text: 'Team collaboration', included: false },
      { text: 'Priority support', included: false },
      { text: 'Advanced analytics', included: false },
    ],
    cta: 'Get Started Free',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: 'per month',
    description: 'For solo creators and freelancers.',
    features: [
      { text: '100 documents/month', included: true },
      { text: '500,000 words/month', included: true },
      { text: '3 AI agents', included: true },
      { text: 'All templates', included: true },
      { text: 'Export to PDF/DOCX', included: true },
      { text: 'Priority support', included: true },
      { text: 'Advanced analytics', included: false },
    ],
    cta: 'Start Pro Trial',
    href: '/register?plan=pro',
    highlighted: true,
  },
  {
    name: 'Team',
    price: '$49',
    period: 'per month',
    description: 'For content teams at scale.',
    features: [
      { text: 'Unlimited documents', included: true },
      { text: 'Unlimited words', included: true },
      { text: 'All 4 AI agents', included: true },
      { text: 'All templates', included: true },
      { text: 'Team collaboration', included: true },
      { text: 'Priority support', included: true },
      { text: 'Advanced analytics', included: true },
    ],
    cta: 'Start Team Trial',
    href: '/register?plan=team',
    highlighted: false,
  },
];

export default function PricingSection() {
  return (
    <section className="py-24 bg-muted/30" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Simple, <span className="gradient-text">transparent</span> pricing
          </h2>
          <p className="text-muted-foreground text-lg">No hidden fees. Upgrade or downgrade anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative p-8 rounded-2xl border flex flex-col transition-all duration-300 ${
                plan.highlighted
                  ? 'border-brand-500 bg-brand-500/5 shadow-2xl shadow-brand-500/20 scale-105'
                  : 'border-border bg-card hover:border-brand-500/30'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-brand-500 text-white text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-2">
                  <span className="font-display text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm mb-1">/{plan.period}</span>
                </div>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm">
                    {feat.included ? (
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                    )}
                    <span className={feat.included ? 'text-foreground' : 'text-muted-foreground/50'}>
                      {feat.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-sm text-center transition-all duration-200 ${
                  plan.highlighted
                    ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                    : 'bg-secondary hover:bg-muted text-foreground border border-border'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

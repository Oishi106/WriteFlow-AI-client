'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, FileText, TrendingUp } from 'lucide-react';

const typingTexts = [
  'Blog Posts That Rank',
  'Social Captions That Convert',
  'Emails That Get Opened',
  'Ad Copy That Sells',
];

const floatingCards = [
  { icon: '✍️', label: 'Blog Post', sub: 'SEO-optimized', color: 'from-blue-500/20 to-blue-600/10', delay: '0s' },
  { icon: '📱', label: 'Social Caption', sub: '3x more reach', color: 'from-purple-500/20 to-purple-600/10', delay: '1.5s' },
  { icon: '📧', label: 'Email Campaign', sub: '48% open rate', color: 'from-green-500/20 to-green-600/10', delay: '3s' },
];

export default function HeroSection() {
  const [currentText, setCurrentText] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const text = typingTexts[currentText];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayed.length < text.length) {
      timeout = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), 80);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
    } else if (!isDeleting && displayed.length === text.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setCurrentText((c) => (c + 1) % typingTexts.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, currentText]);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden animated-gradient pt-16">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(77, 110, 247, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(77, 110, 247, 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-300 text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Powered by Google Gemini AI
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-slide-up">
            Write{' '}
            <span className="gradient-text">
              {displayed}
              <span className="border-r-2 border-brand-400 ml-0.5 animate-pulse" />
            </span>
            <br />
            <span className="text-white/90">in Seconds</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            WriteFlow AI is your agentic content workspace — draft blog posts, social captions, emails, and
            ad copy with AI that actually understands your brand.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            <Link
              href="/register"
              className="group flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/30 hover:-translate-y-0.5"
            >
              Start Writing Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/explore"
              className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              <FileText className="w-4 h-4" />
              Explore Templates
            </Link>
          </div>

          {/* Social proof */}
          <div
            className="flex items-center justify-center gap-6 mt-10 text-white/50 text-sm animate-fade-in"
            style={{ animationDelay: '0.6s' }}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span>10,000+ writers</span>
            </div>
            <div className="w-1 h-1 bg-white/30 rounded-full" />
            <span>500K+ words generated</span>
            <div className="w-1 h-1 bg-white/30 rounded-full" />
            <span>No credit card required</span>
          </div>
        </div>

        {/* Floating Cards */}
        <div className="relative mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {floatingCards.map((card, i) => (
            <div
              key={i}
              className={`glass-card p-4 rounded-2xl bg-gradient-to-br ${card.color} animate-float`}
              style={{ animationDelay: card.delay, animationDuration: `${6 + i}s` }}
            >
              <div className="text-2xl mb-2">{card.icon}</div>
              <p className="text-white font-medium text-sm">{card.label}</p>
              <p className="text-white/60 text-xs">{card.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';

const posts = [
  { slug: 'ai-content-strategy-2025', title: 'The Complete AI Content Strategy for 2025', excerpt: 'How to integrate AI writing tools into your content workflow without losing your brand voice or authentic creativity.', category: 'Strategy', readTime: '8 min', date: 'Jan 15, 2025', emoji: '🎯' },
  { slug: 'seo-blog-posts-with-ai', title: 'Writing SEO Blog Posts with AI: A Step-by-Step Guide', excerpt: 'Learn how to use WriteFlow AI to create blog posts that rank on Google and genuinely engage your target readers.', category: 'Tutorial', readTime: '12 min', date: 'Jan 10, 2025', emoji: '📈' },
  { slug: 'email-campaigns-that-convert', title: '5 Email Campaign Formulas That Convert (AI-Powered)', excerpt: 'Proven email structures combined with AI generation for campaigns that get opened, read, and acted upon.', category: 'Email', readTime: '6 min', date: 'Jan 5, 2025', emoji: '📧' },
  { slug: 'social-media-content-at-scale', title: 'How to Create a Month of Social Content in One Day', excerpt: 'A practical workflow for using AI to batch-create social media captions, posts, and creative hooks in bulk.', category: 'Social', readTime: '10 min', date: 'Dec 28, 2024', emoji: '📱' },
  { slug: 'tone-of-voice-ai-writing', title: 'Maintaining Your Brand Voice When Using AI Writing Tools', excerpt: 'The most common mistake teams make with AI writing — and how the Rewrite Agent solves it completely.', category: 'Tips', readTime: '7 min', date: 'Dec 20, 2024', emoji: '🎨' },
  { slug: 'ad-copy-secrets', title: 'Ad Copy Secrets: What Makes People Click (and Buy)', excerpt: 'Breaking down the psychology behind high-converting ad copy, and how to prompt AI to replicate these patterns.', category: 'Ads', readTime: '9 min', date: 'Dec 15, 2024', emoji: '💡' },
];

const catColors: Record<string, string> = {
  Strategy: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
  Tutorial: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Email: 'bg-green-500/10 text-green-600 dark:text-green-400',
  Social: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  Tips: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  Ads: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
};

export default function BlogPage() {
  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        {/* Header */}
        <section className="py-16 bg-muted/30 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-display text-5xl font-bold mb-4">WriteFlow <span className="gradient-text">Blog</span></h1>
            <p className="text-muted-foreground text-lg">AI writing strategies, tutorials, and tips for modern content creators.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Featured Post */}
            <div className="mb-12">
              <h2 className="font-semibold text-lg mb-5">Featured Post</h2>
              <Link href={`/blog/${featured.slug}`} className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-brand-500/30 transition-all card-hover">
                <div className="grid grid-cols-1 sm:grid-cols-5">
                  <div className="sm:col-span-2 h-48 sm:h-auto bg-gradient-to-br from-brand-500/20 to-brand-600/10 flex items-center justify-center">
                    <span className="text-7xl">{featured.emoji}</span>
                  </div>
                  <div className="sm:col-span-3 p-8 flex flex-col justify-center">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit mb-3 ${catColors[featured.category]}`}>{featured.category}</span>
                    <h3 className="font-display text-2xl font-bold mb-3 group-hover:text-brand-500 transition-colors">{featured.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{featured.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{featured.readTime} read</div>
                      <span>{featured.date}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-brand-500 text-sm font-medium">
                      Read article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Post Grid */}
            <h2 className="font-semibold text-lg mb-5">Latest Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-brand-500/30 transition-all card-hover flex flex-col">
                  <div className="h-36 bg-gradient-to-br from-brand-500/10 to-brand-600/5 flex items-center justify-center">
                    <span className="text-5xl">{post.emoji}</span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit mb-2 ${catColors[post.category]}`}>{post.category}</span>
                    <h3 className="font-semibold leading-snug mb-2 group-hover:text-brand-500 transition-colors flex-1">{post.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</div>
                      <span>{post.date}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

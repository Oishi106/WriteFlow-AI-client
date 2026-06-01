import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { blogPosts, formatBlogDate } from '@/lib/blog-posts';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: { absolute: 'Blog — WriteFlow AI' },
  description:
    'AI writing strategies, tutorials, and tips for modern content creators from the WriteFlow team.',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <section className="py-16 bg-muted/30 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-display text-5xl font-bold mb-4">WriteFlow Blog</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Insights on AI writing, content strategy, and building a modern publishing workflow.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-card border border-border rounded-2xl p-6 flex flex-col hover:border-brand-500/30 transition-all card-hover"
                >
                  <h2 className="font-display text-xl font-bold mb-2 leading-snug">{post.title}</h2>
                  <p className="text-sm text-muted-foreground mb-1">
                    <span className="font-medium text-foreground">{post.author}</span>
                    <span className="mx-2">·</span>
                    <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1 mt-3 mb-5">
                    {post.excerpt}
                  </p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-brand-500 text-sm font-medium hover:text-brand-600 transition-colors"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

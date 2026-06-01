import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { blogPosts, formatBlogDate, getPostBySlug } from '@/lib/blog-posts';
import { ChevronRight } from 'lucide-react';

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) {
    return { title: 'Post Not Found' };
  }
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getPostBySlug(params.slug);
  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-brand-500 transition-colors mb-8"
          >
            ← Back to Blog
          </Link>

          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground mb-6"
          >
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <Link href="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className="text-foreground font-medium line-clamp-1">{post.title}</span>
          </nav>

          <header className="mb-10 border-b border-border pb-8">
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">{post.author}</span>
              <span className="mx-2">·</span>
              <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
            </p>
          </header>

          <div className="space-y-6 text-muted-foreground leading-relaxed">
            {post.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>
      </div>
      <Footer />
    </div>
  );
}

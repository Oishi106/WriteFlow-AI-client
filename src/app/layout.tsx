import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import AppProviders from '@/components/layout/AppProviders';
import HomePageLoader from '@/components/layout/HomePageLoader';
import { Toaster } from '@/components/ui/toaster';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'WriteFlow AI — AI-Powered Content Workspace',
    template: '%s | WriteFlow AI',
  },
  description:
    'WriteFlow AI is the all-in-one agentic content workspace. Draft blog posts, social captions, emails, and ad copy with the power of AI — faster than ever.',
  keywords: ['AI writing', 'content generation', 'blog writer', 'AI copywriting', 'WriteFlow'],
  authors: [{ name: 'WriteFlow AI' }],
  creator: 'WriteFlow AI',
  openGraph: {
    title: 'WriteFlow AI — AI-Powered Content Workspace',
    description: 'Draft, rewrite, and publish content 10× faster with agentic AI.',
    url: 'https://writeflow.ai',
    siteName: 'WriteFlow AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WriteFlow AI',
    description: 'AI-Powered Content Workspace',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <AppProviders>
          <HomePageLoader>{children}</HomePageLoader>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}

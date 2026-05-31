import { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import PopularTemplates from '@/components/landing/PopularTemplates';
import PricingSection from '@/components/landing/PricingSection';
import StatsSection from '@/components/landing/StatsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FAQSection from '@/components/landing/FAQSection';
import NewsletterSection from '@/components/landing/NewsletterSection';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <Suspense
        fallback={(
          <section className="py-24 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="h-6 w-40 bg-muted rounded mb-4" />
              <div className="h-8 w-64 bg-muted rounded" />
            </div>
          </section>
        )}
      >
        <PopularTemplates />
      </Suspense>
      <StatsSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <NewsletterSection />
      <Footer />
    </main>
  );
}

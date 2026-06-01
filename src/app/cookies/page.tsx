import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How WriteFlow AI uses cookies and how you can control them.',
};

const sections = [
  {
    title: '1. What Are Cookies?',
    content:
      'Cookies are small text files stored on your device when you visit a website. They help sites remember your preferences, keep you signed in, and understand how the product is used. WriteFlow AI uses cookies only where they are needed to operate the service or improve it responsibly—we do not sell cookie data to advertisers.',
  },
  {
    title: '2. Session Cookies',
    content:
      'Session cookies are temporary and expire when you close your browser. We use them to maintain your active session while you navigate the app, preserve form state during multi-step flows, and protect against certain cross-site request issues. Without session cookies, you would need to sign in again on every page load.',
  },
  {
    title: '3. Authentication Cookies',
    content:
      'When you sign in with email and password or Google OAuth, we set secure, HTTP-only authentication cookies managed through NextAuth. These cookies identify your logged-in session so you can access your dashboard, documents, and AI features. They are essential to the service and are not used for marketing purposes.',
  },
  {
    title: '4. Analytics Cookies',
    content:
      'We may use first-party or privacy-focused analytics tools to understand feature usage, page performance, and error rates. Analytics cookies collect aggregated, non-identifying information such as pages visited, session duration, and device type. We use this data to improve WriteFlow AI, not to build advertising profiles. If we enable third-party analytics, we will update this policy and provide opt-out options where required by law.',
  },
  {
    title: '5. Third-Party Cookies',
    content:
      'Some integrated services may set their own cookies when you use related features. For example, Google OAuth may set cookies during the sign-in flow subject to Google’s policies. Embedded media or support widgets, if added in the future, may also use cookies. We recommend reviewing the privacy policies of any third-party service you connect to your account.',
  },
  {
    title: '6. How to Disable or Control Cookies',
    content:
      'You can block or delete cookies through your browser settings. Note that disabling essential or authentication cookies will prevent you from staying signed in and may limit core functionality. Most browsers let you clear cookies for a single site, block third-party cookies, or use private browsing modes. For Chrome, Firefox, Safari, and Edge, look under Privacy or Security in settings.',
  },
  {
    title: '7. Updates to This Policy',
    content:
      'We may update this Cookie Policy when our practices change or when regulations require it. The “Last updated” date at the top of this page will reflect the latest revision. Continued use of WriteFlow AI after changes constitutes acceptance of the updated policy.',
  },
  {
    title: '8. Contact Us',
    content: null,
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="font-display text-4xl font-bold mb-2">Cookie Policy</h1>
          <p className="text-muted-foreground mb-10">Last updated: January 1, 2025</p>
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            {sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-foreground font-semibold text-lg mb-2">{section.title}</h2>
                {section.content ? (
                  <p>{section.content}</p>
                ) : (
                  <p>
                    Questions about cookies or tracking? Email{' '}
                    <a
                      href="mailto:privacy@writeflow.ai"
                      className="text-brand-500 hover:text-brand-600 transition-colors"
                    >
                      privacy@writeflow.ai
                    </a>{' '}
                    or visit our{' '}
                    <Link href="/contact" className="text-brand-500 hover:text-brand-600 transition-colors">
                      Contact page
                    </Link>
                    .
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using WriteFlow AI.',
};

const sections = [
  {
    title: '1. Acceptance of Terms',
    content:
      'By accessing or using WriteFlow AI, you agree to these Terms of Service and our Privacy Policy. If you are using the service on behalf of an organization, you represent that you have authority to bind that organization. If you do not agree, do not use the platform.',
  },
  {
    title: '2. Description of Service',
    content:
      'WriteFlow AI provides an AI-powered content workspace including drafting, rewriting, templates, document storage, and related tools. Features may change over time; we may add, modify, or discontinue functionality with reasonable notice when practicable.',
  },
  {
    title: '3. Account Registration',
    content:
      'You must provide accurate registration information and keep your credentials secure. You are responsible for all activity under your account. Notify us immediately at legal@writeflow.ai if you suspect unauthorized access.',
  },
  {
    title: '4. Acceptable Use',
    content:
      'You agree not to use WriteFlow AI to generate or distribute spam, malware, hate speech, harassment, illegal content, or material that infringes others’ intellectual property or privacy rights. You may not attempt to reverse engineer, scrape, or overload our systems; circumvent usage limits; resell access without authorization; or use the service to mislead others (including deepfakes or impersonation). We may suspend or terminate accounts that violate these rules.',
  },
  {
    title: '5. AI-Generated Content and Ownership',
    content:
      'You retain ownership of content you create using WriteFlow AI, including AI-assisted drafts and final output, subject to applicable law and any rights in underlying third-party materials you provide. You grant us a limited, non-exclusive license to host, process, and display your content solely to operate and improve the service. We do not claim ownership of your creative work. You are responsible for reviewing AI output for accuracy and ensuring your use complies with laws and platform policies where you publish.',
  },
  {
    title: '6. Subscription and Billing',
    content:
      'Paid plans are billed according to the pricing shown at checkout. Fees are non-refundable except where required by law or stated in a separate agreement. You may cancel renewal at any time; access continues through the current billing period. Downgrades take effect at the next cycle.',
  },
  {
    title: '7. Account Termination',
    content:
      'You may delete your account at any time from settings. We may suspend or terminate your account if you breach these Terms, pose a security risk, or if required by law. Upon termination, your right to use the service ends; we may delete your data after a retention period described in our Privacy Policy.',
  },
  {
    title: '8. Disclaimer of Warranties',
    content:
      'WriteFlow AI is provided "as is" and "as available" without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. AI-generated content may contain errors; you should verify important information before relying on it.',
  },
  {
    title: '9. Limitation of Liability',
    content:
      'To the maximum extent permitted by law, WriteFlow AI and its affiliates, officers, and employees will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or goodwill, arising from your use of the service. Our total liability for any claim related to the service is limited to the amount you paid us in the twelve months before the claim, or one hundred U.S. dollars if you have not paid fees.',
  },
  {
    title: '10. Indemnification',
    content:
      'You agree to indemnify and hold harmless WriteFlow AI from claims arising from your content, your use of the service, or your violation of these Terms or applicable law.',
  },
  {
    title: '11. Changes to Terms',
    content:
      'We may update these Terms from time to time. We will post the updated version on this page and update the "Last updated" date. Continued use after changes become effective constitutes acceptance. For material changes, we may provide additional notice by email or in the app.',
  },
  {
    title: '12. Governing Law',
    content:
      'These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict-of-law principles, except where mandatory consumer protections in your country apply.',
  },
  {
    title: '13. Contact',
    content: null,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="font-display text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-10">Last updated: January 1, 2025</p>
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            {sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-foreground font-semibold text-lg mb-2">{section.title}</h2>
                {section.content ? (
                  <p>{section.content}</p>
                ) : (
                  <p>
                    Questions about these Terms? Email{' '}
                    <a
                      href="mailto:legal@writeflow.ai"
                      className="text-brand-500 hover:text-brand-600 transition-colors"
                    >
                      legal@writeflow.ai
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

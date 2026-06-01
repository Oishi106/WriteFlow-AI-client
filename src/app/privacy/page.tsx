import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How WriteFlow AI collects, uses, and protects your personal data.',
};

const sections = [
  {
    title: '1. Introduction',
    content:
      'WriteFlow AI ("we," "us," or "our") respects your privacy. This Privacy Policy explains what information we collect when you use our website and application, how we use it, which third parties may process it, and what rights you have. By using WriteFlow AI, you agree to the practices described here.',
  },
  {
    title: '2. Information We Collect',
    content:
      'We collect information you provide directly: your name, email address, profile photo (if you sign in with Google), password hash (for email accounts), and any content you create in the workspace—including documents, prompts, and AI-generated output. We also collect usage data: pages visited, features used, AI agent interactions, token usage, device type, browser, IP address, and timestamps. Payment information, if you subscribe to a paid plan, is processed by our payment provider; we do not store full card numbers on our servers.',
  },
  {
    title: '3. How We Use Your Information',
    content:
      'We use your data to create and manage your account, authenticate sessions, deliver AI content generation and rewriting features, store your documents and usage history, send service-related emails (welcome messages, password resets, billing receipts), improve product performance and reliability, detect abuse, and comply with legal obligations. We do not sell your personal information to third parties for advertising.',
  },
  {
    title: '4. AI Processing',
    content:
      'When you use AI features, your prompts and selected content may be sent to AI providers (such as Google Gemini) to generate responses. We process this data solely to provide the service you requested. We do not use your private documents to train public AI models. Generated output is stored in your account so you can access history and analytics.',
  },
  {
    title: '5. Third-Party Services',
    content:
      'We rely on trusted providers to operate WriteFlow AI: MongoDB Atlas for database hosting and storage of account and content data; Cloudinary for image and media uploads; Google OAuth for optional social sign-in; Google Gemini (or similar) for AI generation; and email delivery services for transactional messages. Each provider processes data under their own privacy policies and our data processing agreements where applicable.',
  },
  {
    title: '6. Data Retention and Security',
    content:
      'We retain your account data while your account is active and for a reasonable period afterward if you delete your account, unless a longer retention period is required by law. We use industry-standard measures including HTTPS encryption in transit, hashed passwords (bcrypt), JWT-based authentication, access controls, and rate limiting. No method of transmission over the internet is 100% secure; we continuously work to protect your information.',
  },
  {
    title: '7. Your Rights',
    content:
      'Depending on your location, you may have the right to access, correct, or delete your personal data; export your data in a portable format; object to or restrict certain processing; and withdraw consent where processing is consent-based. You can delete your account and associated data from your profile settings in the dashboard. To request a full data export or deletion assistance, contact us at privacy@writeflow.ai. We will respond within the timeframe required by applicable law.',
  },
  {
    title: '8. Cookies',
    content:
      'We use cookies for authentication, session management, and limited analytics. For details, see our Cookie Policy.',
  },
  {
    title: '9. Children',
    content:
      'WriteFlow AI is not directed at children under 16. We do not knowingly collect personal information from children. If you believe a child has provided us data, contact us and we will delete it promptly.',
  },
  {
    title: '10. Changes to This Policy',
    content:
      'We may update this Privacy Policy from time to time. We will post the revised version on this page and update the "Last updated" date. Material changes may be communicated by email or in-app notice.',
  },
  {
    title: '11. Contact Us',
    content: null,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="font-display text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-10">Last updated: January 1, 2025</p>
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            {sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-foreground font-semibold text-lg mb-2">{section.title}</h2>
                {section.title === '8. Cookies' ? (
                  <p>
                    We use cookies for authentication, session management, and limited analytics. For
                    details, see our{' '}
                    <Link href="/cookies" className="text-brand-500 hover:text-brand-600 transition-colors">
                      Cookie Policy
                    </Link>
                    .
                  </p>
                ) : section.content ? (
                  <p>{section.content}</p>
                ) : (
                  <p>
                    For privacy questions, data requests, or concerns, email{' '}
                    <a
                      href="mailto:privacy@writeflow.ai"
                      className="text-brand-500 hover:text-brand-600 transition-colors"
                    >
                      privacy@writeflow.ai
                    </a>{' '}
                    or use our{' '}
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

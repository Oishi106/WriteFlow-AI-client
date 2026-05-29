import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="font-display text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-10">Last updated: January 1, 2025</p>
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            {[
              { title: '1. Acceptance of Terms', content: 'By accessing or using WriteFlow AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.' },
              { title: '2. Description of Service', content: 'WriteFlow AI provides an AI-powered content creation platform including blog post generation, social media caption creation, email drafting, and content rewriting tools powered by Google Gemini AI.' },
              { title: '3. User Accounts', content: 'You are responsible for maintaining the confidentiality of your account credentials. You may not share your account or use another person\'s account. You must provide accurate information when creating your account.' },
              { title: '4. Content Ownership', content: 'You retain ownership of all content you create using WriteFlow AI. By using our service, you grant us a limited license to process your content solely for the purpose of providing our services.' },
              { title: '5. Acceptable Use', content: 'You agree not to use WriteFlow AI to generate spam, misinformation, harmful content, or content that violates any laws. We reserve the right to suspend accounts that violate these terms.' },
              { title: '6. Subscription & Billing', content: 'Paid plans are billed monthly or annually. You may cancel at any time. Refunds are provided on a case-by-case basis. Plan downgrades take effect at the next billing cycle.' },
              { title: '7. Limitation of Liability', content: 'WriteFlow AI is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of our service.' },
              { title: '8. Contact', content: 'For questions about these Terms, contact us at legal@writeflow.ai.' },
            ].map((section, i) => (
              <div key={i}>
                <h2 className="text-foreground font-semibold text-lg mb-2">{section.title}</h2>
                <p>{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

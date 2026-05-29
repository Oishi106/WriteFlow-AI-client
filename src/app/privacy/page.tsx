import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="font-display text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-10">Last updated: January 1, 2025</p>
          <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">
            {[
              { title: '1. Information We Collect', content: 'We collect information you provide directly to us, such as your name, email address, and content you create using our platform. We also collect usage data including AI agent interactions, documents created, and platform activity to improve our services.' },
              { title: '2. How We Use Your Information', content: 'We use your information to provide and improve WriteFlow AI, process AI content generation requests, send you service-related communications, and analyze platform usage to enhance features. We never sell your personal data to third parties.' },
              { title: '3. Data Security', content: 'We implement industry-standard security measures including JWT authentication, bcrypt password hashing, HTTPS encryption, and rate limiting. Your content is stored securely in our encrypted MongoDB database.' },
              { title: '4. AI Content & Data', content: 'Content you generate using our AI agents is stored to provide usage history and analytics. We do not use your content to train AI models. Your data is processed via Google Gemini API, subject to Google\'s privacy policy.' },
              { title: '5. Your Rights', content: 'You may access, update, or delete your account and associated data at any time from your profile settings. You may also request a full data export by contacting us at privacy@writeflow.ai.' },
              { title: '6. Cookies', content: 'We use essential cookies for authentication and session management. We do not use advertising or tracking cookies. You can control cookies through your browser settings.' },
              { title: '7. Contact Us', content: 'If you have questions about this Privacy Policy, please contact us at privacy@writeflow.ai or through our Contact page.' },
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

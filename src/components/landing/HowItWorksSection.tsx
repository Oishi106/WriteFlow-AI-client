'use client';

const steps = [
  { step: '01', title: 'Pick a Template', desc: 'Browse 50+ templates for blogs, social, email, and ads. Filter by category, rating, or tone.' },
  { step: '02', title: 'Enter Your Topic', desc: 'Tell the AI what you want to write about, the tone you need, and your target audience.' },
  { step: '03', title: 'AI Generates', desc: 'Our Gemini-powered agent drafts your content with a title, meta description, and tags included.' },
  { step: '04', title: 'Edit & Publish', desc: 'Refine with the built-in editor, rewrite sections, then export or publish directly.' },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">From idea to publish in <span className="gradient-text">4 steps</span></h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="p-6 rounded-2xl bg-card border border-border h-full hover:border-brand-500/30 transition-all">
                <span className="text-5xl font-display font-bold text-brand-500/20 block mb-3">{step.step}</span>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/3 -right-3 w-6 text-muted-foreground">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

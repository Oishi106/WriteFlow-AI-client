import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Zap, Target, Users, Award } from 'lucide-react';

const team = [
  { name: 'Alex Rivera', role: 'CEO & Co-founder', bio: 'Former ML engineer at Google. Obsessed with making AI accessible to every writer.', initials: 'AR' },
  { name: 'Priya Sharma', role: 'CTO & Co-founder', bio: 'Built large-scale NLP systems. Passionate about responsible AI for content creation.', initials: 'PS' },
  { name: 'Marcus Kim', role: 'Head of Design', bio: 'Ex-Figma. Believes great design and great writing share the same DNA.', initials: 'MK' },
  { name: 'Sarah Okafor', role: 'Head of Growth', bio: 'Grew three B2B SaaS companies to $10M ARR. Writer at heart.', initials: 'SO' },
];

const values = [
  { icon: Target, title: 'Writer-First', desc: "Every feature is designed around the writer's workflow — not the other way around." },
  { icon: Zap, title: 'Speed Without Sacrifice', desc: 'Fast AI generation that never compromises on quality or authenticity.' },
  { icon: Users, title: 'Built for Teams', desc: 'Whether you\'re solo or leading a 50-person content team, WriteFlow scales with you.' },
  { icon: Award, title: 'Responsible AI', desc: 'We build AI tools that augment human creativity, not replace it.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        {/* Hero */}
        <section className="py-20 bg-muted/30 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-500 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" /> Our Story
            </div>
            <h1 className="font-display text-5xl font-bold mb-6">
              We&apos;re on a mission to make <span className="gradient-text">great writing</span> effortless
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
              WriteFlow AI was founded in 2024 by a team of ML engineers and content creators who were frustrated with generic AI writing tools. We built what we actually wanted to use.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="font-display text-4xl font-bold">What we believe in</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <div key={i} className="p-6 bg-card border border-border rounded-2xl hover:border-brand-500/30 transition-all card-hover">
                  <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center mb-4">
                    <v.icon className="w-6 h-6 text-brand-500" />
                  </div>
                  <h3 className="font-semibold mb-2">{v.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-muted/30 border-y border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: '2024', label: 'Founded' },
              { value: '10K+', label: 'Active Writers' },
              { value: '500K+', label: 'Words Generated' },
              { value: '98%', label: 'Customer Satisfaction' },
            ].map((s, i) => (
              <div key={i}>
                <p className="font-display text-4xl font-bold gradient-text">{s.value}</p>
                <p className="text-muted-foreground text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="font-display text-4xl font-bold mb-3">Meet the team</h2>
              <p className="text-muted-foreground">The humans behind the AI.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center hover:border-brand-500/30 transition-all card-hover">
                  <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                    {member.initials}
                  </div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-brand-500 text-xs font-medium mt-0.5 mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

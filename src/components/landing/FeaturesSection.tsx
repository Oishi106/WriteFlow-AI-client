'use client';

import { Bot, RefreshCw, Users, Zap, BarChart3, Shield } from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'AI Content Drafting',
    description: 'Generate full blog posts, emails, and social captions with one click. Our AI understands context and produces publish-ready content.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: RefreshCw,
    title: 'Tone Rewriting',
    description: 'Paste any text and instantly rewrite it as formal, casual, persuasive, or friendly. Also shorten, expand, or fix grammar automatically.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Invite teammates, assign roles, and co-edit documents in real time. Built for content teams that move fast.',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    icon: Zap,
    title: 'Agentic Workflows',
    description: 'Set a topic and let the AI plan, draft, and format your entire content piece autonomously — you just review and publish.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: BarChart3,
    title: 'Usage Analytics',
    description: 'Track words generated, documents created, and AI calls made. Admins get full platform analytics with beautiful charts.',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description: 'Granular USER and ADMIN roles with JWT-secured endpoints. Keep your content workspace secure and organized.',
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-3">Features</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Everything you need to{' '}
            <span className="gradient-text">write faster</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            WriteFlow AI packs a full agentic content suite — from first draft to final publish.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl border border-border bg-card hover:border-brand-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5"
            >
              <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

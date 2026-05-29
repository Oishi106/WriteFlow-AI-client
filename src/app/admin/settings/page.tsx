'use client';

import { useState } from 'react';
import { Save, Loader2, Globe, Bot, AlertTriangle, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  maintenanceMode: boolean;
  enableDraftAgent: boolean;
  enableRewriteAgent: boolean;
  enableChatAgent: boolean;
  enableReviewSummariser: boolean;
  maxFreeDocuments: number;
  maxFreeWords: number;
}

const defaultSettings: SiteSettings = {
  siteName: 'WriteFlow AI',
  siteDescription: 'The all-in-one agentic content workspace.',
  logoUrl: '',
  maintenanceMode: false,
  enableDraftAgent: true,
  enableRewriteAgent: true,
  enableChatAgent: true,
  enableReviewSummariser: true,
  maxFreeDocuments: 5,
  maxFreeWords: 10000,
};

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-brand-500' : 'bg-muted-foreground/30'}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    toast({ title: 'Settings saved successfully!' });
  };

  const update = (key: keyof SiteSettings, value: SiteSettings[keyof SiteSettings]) =>
    setSettings(s => ({ ...s, [key]: value }));

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure global platform settings and feature flags.</p>
      </div>

      {/* Maintenance Mode Warning */}
      {settings.maintenanceMode && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">Maintenance Mode is ON</p>
            <p className="text-xs text-red-500/80 mt-0.5">Users will see a maintenance page. Only admins can access the platform.</p>
          </div>
        </div>
      )}

      {/* General Settings */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-brand-500" /> General Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Site Name</label>
            <input
              value={settings.siteName}
              onChange={e => update('siteName', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Site Description</label>
            <input
              value={settings.siteDescription}
              onChange={e => update('siteDescription', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Logo URL</label>
            <input
              value={settings.logoUrl}
              onChange={e => update('logoUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          <div className="border-t border-border pt-3">
            <Toggle
              checked={settings.maintenanceMode}
              onChange={v => update('maintenanceMode', v)}
              label="Maintenance Mode"
              description="Temporarily disable the platform for all non-admin users."
            />
          </div>
        </div>
      </div>

      {/* AI Agents */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Bot className="w-4 h-4 text-brand-500" /> AI Agents
        </h2>
        <div className="divide-y divide-border">
          <Toggle checked={settings.enableDraftAgent} onChange={v => update('enableDraftAgent', v)} label="Content Draft Agent" description="Allows users to generate blog posts, social captions, and emails." />
          <Toggle checked={settings.enableRewriteAgent} onChange={v => update('enableRewriteAgent', v)} label="Rewrite & Tone Agent" description="Allows users to rewrite, shorten, expand, and fix grammar." />
          <Toggle checked={settings.enableChatAgent} onChange={v => update('enableChatAgent', v)} label="Chat Assistant Agent" description="Enables the in-editor AI chat sidebar." />
          <Toggle checked={settings.enableReviewSummariser} onChange={v => update('enableReviewSummariser', v)} label="Review Summariser Agent" description="Admin-only tool to summarise platform reviews with AI." />
        </div>
      </div>

      {/* Free Plan Limits */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-500" /> Free Plan Limits
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Max Documents / Month</label>
            <input
              type="number"
              value={settings.maxFreeDocuments}
              onChange={e => update('maxFreeDocuments', Number(e.target.value))}
              min={1}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Max Words / Month</label>
            <input
              type="number"
              value={settings.maxFreeWords}
              onChange={e => update('maxFreeWords', Number(e.target.value))}
              min={1000}
              step={1000}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
      >
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Settings</>}
      </button>
    </div>
  );
}

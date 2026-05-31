'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, Globe, Bot, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminSettingsPage() {
  const { toast } = useToast();

  const [siteName, setSiteName] = useState('WriteFlow AI');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [enableAIAgents, setEnableAIAgents] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response: any = await adminApi.getSettings();
        const data = response?.data ?? response;
        if (data) {
          setSiteName(data.siteName ?? 'WriteFlow AI');
          setMaintenanceMode(!!data.maintenanceMode);
          setEnableAIAgents(data.enableAIAgents !== false);
        }
      } catch (err: any) {
        console.warn('Failed to load settings from endpoint:', err);
        // Fallback to default values and show yellow notice
        setSiteName('WriteFlow AI');
        setMaintenanceMode(false);
        setEnableAIAgents(true);
        setShowNotice(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.saveSettings({
        siteName,
        maintenanceMode,
        enableAIAgents,
      });
      toast({
        title: 'Success',
        description: 'Settings saved',
      });
    } catch (err: any) {
      console.warn('Failed to save settings to backend server:', err);
      // Yellow toast notice
      toast({
        title: 'Settings saved locally — not persisted to server',
        description: 'The server endpoint is currently unavailable. Changes are stored in active state.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted rounded" />
          <div className="h-4 w-72 bg-muted rounded" />
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 h-52" />
        <div className="bg-card border border-border rounded-2xl p-6 h-40" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure global platform settings, maintenance modes, and AI feature switches
        </p>
      </div>

      {/* Yellow Warning Notice if endpoint failed */}
      {showNotice && (
        <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Notice</p>
            <p className="text-xs mt-0.5">Could not load saved settings. Showing defaults.</p>
          </div>
        </div>
      )}

      {/* Maintenance Mode Alert Banner */}
      {maintenanceMode && (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Maintenance Mode is Active</p>
            <p className="text-xs mt-0.5">
              Only platform administrators will have access to services. Regular users will see a maintenance page.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-500" /> General Settings
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Site Name
            </label>
            <Input
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="WriteFlow AI"
              required
            />
          </div>
        </div>

        {/* Feature toggles */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Bot className="w-4 h-4 text-brand-500" /> Platform Toggles
          </h2>

          <div className="divide-y divide-border">
            {/* Maintenance Switch */}
            <div className="flex items-center justify-between py-4">
              <div className="space-y-0.5 pr-4">
                <p className="text-sm font-semibold">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">
                  Lock site access for regular users when performing database or layout updates.
                </p>
              </div>
              <Switch
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
            </div>

            {/* AI Switch */}
            <div className="flex items-center justify-between py-4">
              <div className="space-y-0.5 pr-4">
                <p className="text-sm font-semibold">Enable AI Agents</p>
                <p className="text-xs text-muted-foreground">
                  Global switch to permit description generations and template assistance services.
                </p>
              </div>
              <Switch
                checked={enableAIAgents}
                onCheckedChange={setEnableAIAgents}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving Settings...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, Bell, Shield, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This will permanently delete your account and all data. This cannot be undone.')) return;
    setDeleting(true);
    await new Promise(r => setTimeout(r, 1000));
    setDeleting(false);
    toast({ title: 'Account deletion requested. You will be logged out.', variant: 'destructive' });
    setTimeout(logout, 2000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account preferences.</p>
      </div>

      {/* Theme */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold mb-1">Appearance</h2>
        <p className="text-muted-foreground text-sm mb-4">Choose how WriteFlow AI looks for you.</p>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(t => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                mounted && (resolvedTheme === t.value || (t.value === 'system'))
                  ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                  : 'border-border hover:bg-muted text-muted-foreground'
              )}
            >
              <t.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold mb-1 flex items-center gap-2"><Bell className="w-4 h-4 text-brand-500" />Notifications</h2>
        <p className="text-muted-foreground text-sm mb-4">Control what emails you receive from us.</p>
        <div className="space-y-3">
          {[
            { label: 'Product updates & new features', defaultChecked: true },
            { label: 'Weekly writing tips newsletter', defaultChecked: true },
            { label: 'AI usage alerts (quota warnings)', defaultChecked: true },
            { label: 'Marketing & promotional emails', defaultChecked: false },
          ].map((item, i) => (
            <label key={i} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm">{item.label}</span>
              <input type="checkbox" defaultChecked={item.defaultChecked} className="w-4 h-4 accent-brand-500" />
            </label>
          ))}
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold mb-1 flex items-center gap-2"><Shield className="w-4 h-4 text-brand-500" />Account</h2>
        <p className="text-muted-foreground text-sm mb-4">Your account details and security options.</p>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium">{user?.plan}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card border border-red-500/30 rounded-2xl p-6">
        <h2 className="font-semibold text-red-500 mb-1">Danger Zone</h2>
        <p className="text-muted-foreground text-sm mb-4">These actions are irreversible. Please be careful.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={logout} className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
            Sign out of all devices
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

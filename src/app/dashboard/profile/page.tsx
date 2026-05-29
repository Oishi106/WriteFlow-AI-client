'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Camera, Loader2, Shield, Zap } from 'lucide-react';
import { usersApi, dashboardApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  avatar: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface MyStats {
  totalDocuments: number;
  documentsThisMonth: number;
  totalTokensUsed: number;
  totalAICalls: number;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<MyStats | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name || '', bio: user?.bio || '', avatar: user?.avatar || '' },
  });

  useEffect(() => {
    if (user) reset({ name: user.name, bio: user.bio || '', avatar: user.avatar || '' });
    dashboardApi.getMyStats().then(r => setStats(r.data.data)).catch(() => {});
  }, [user, reset]);

  const avatarUrl = watch('avatar');

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const { data: res } = await usersApi.updateMyProfile({ name: data.name, bio: data.bio, avatar: data.avatar });
      updateUser(res.data);
      toast({ title: 'Profile updated successfully!' });
    } catch {
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const planConfig = {
    FREE: { color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400', label: 'Free' },
    PRO: { color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', label: 'Pro' },
    TEAM: { color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', label: 'Team' },
  };

  const plan = planConfig[user?.plan || 'FREE'];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account information and preferences.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-6">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6 pb-6 border-b border-border">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user?.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-border" onError={e => (e.currentTarget.style.display = 'none')} />
            ) : (
              <div className="w-20 h-20 bg-brand-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center border-2 border-background">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div>
            <h2 className="font-bold text-xl">{user?.name}</h2>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${plan.color}`}>
                {plan.label} Plan
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user?.role === 'ADMIN' ? 'bg-brand-500/10 text-brand-500' : 'bg-muted text-muted-foreground'}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input
                {...register('name')}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Avatar URL</label>
              <input
                {...register('avatar')}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
              {errors.avatar && <p className="text-destructive text-xs mt-1">{errors.avatar.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Bio</label>
            <textarea
              {...register('bio')}
              rows={3}
              placeholder="Tell us a bit about yourself..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
            />
            {errors.bio && <p className="text-destructive text-xs mt-1">{errors.bio.message}</p>}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : 'Save Changes'}
            </button>
            {isDirty && (
              <button type="button" onClick={() => reset()} className="px-5 py-2.5 border border-border text-sm font-medium rounded-xl hover:bg-muted transition-colors">
                Discard
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Stats */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-brand-500" /> Usage Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total AI Calls', value: stats?.totalAICalls ?? 0 },
            { label: 'Documents This Month', value: stats?.documentsThisMonth ?? 0 },
            { label: 'All Documents', value: stats?.totalDocuments ?? 0 },
            { label: 'Tokens Used', value: stats?.totalTokensUsed ?? 0 },
          ].map((s, i) => (
            <div key={i} className="text-center p-3 bg-muted/50 rounded-xl">
              <p className="font-display text-2xl font-bold text-brand-500">{s.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-brand-500" /> Account Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Email address</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Account role</span>
            <span className="font-medium">{user?.role}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Subscription plan</span>
            <span className="font-medium">{user?.plan}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium">{user?.createdAt ? formatDate(user.createdAt) : '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

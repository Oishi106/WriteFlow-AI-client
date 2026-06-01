'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FileText, Loader2, Sparkles, Calendar, Camera } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ApiError, ailogsApi, dashboardApi, documentsApi, usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { cn, formatMemberSince } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

type ProfileUser = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  plan?: string;
  createdAt?: string;
};

const isProfileUser = (value: unknown): value is ProfileUser =>
  Boolean(value && typeof value === 'object' && 'email' in value && (value as ProfileUser).email);

const parseUser = (res: unknown): ProfileUser | null => {
  if (!res || typeof res !== 'object') return null;
  const payload = res as Record<string, unknown>;
  const candidates: unknown[] = [
    payload.user,
    payload.data,
    payload,
  ];
  const nested = payload.data;
  if (nested && typeof nested === 'object') {
    candidates.unshift((nested as Record<string, unknown>).user);
  }

  for (const candidate of candidates) {
    if (isProfileUser(candidate)) return candidate;
  }
  return null;
};

const parseMetaTotal = (res: unknown): number => {
  if (!res || typeof res !== 'object') return 0;
  const payload = res as Record<string, unknown>;
  const data = payload.data;
  const meta =
    payload.meta ??
    (data && typeof data === 'object' ? (data as Record<string, unknown>).meta : undefined);
  if (meta && typeof meta === 'object' && 'total' in meta) {
    return Number((meta as { total: number }).total) || 0;
  }
  return 0;
};

const parseDashboardStats = (res: unknown) => {
  if (!res || typeof res !== 'object') return { documents: 0, aiCalls: 0 };
  const payload = res as Record<string, unknown>;
  const stats = (payload.data ?? payload) as Record<string, unknown>;
  return {
    documents: Number(stats.totalDocuments) || 0,
    aiCalls: Number(stats.totalAICalls) || 0,
  };
};

const planLabel = (plan?: string) => {
  if (!plan || plan.toUpperCase() === 'FREE') return 'Free Plan';
  const normalized = plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
  return `${normalized} Plan`;
};

const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;
  if (!cloud || !preset) {
    throw new Error('Cloudinary is not configured');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Failed to upload image');
  }

  return data.secure_url as string;
};

export default function ProfilePage() {
  const { user: storeUser, updateUser, hasHydrated, isAuthenticated } = useAuthStore();
  const { data: session, update: updateSession } = useSession();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [documentCount, setDocumentCount] = useState(0);
  const [aiCallCount, setAiCallCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const applyStoreUser = useCallback((user: NonNullable<typeof storeUser>) => {
    const seeded: ProfileUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      plan: user.plan,
      createdAt: user.createdAt,
    };
    setProfile((prev) => prev ?? seeded);
    setName((prev) => (prev ? prev : user.name));
    setBio((prev) => (prev ? prev : user.bio || ''));
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);

    const cachedUser = useAuthStore.getState().user;
    if (cachedUser) applyStoreUser(cachedUser);

    try {
      const [userResult, docsResult, logsResult] = await Promise.allSettled([
        usersApi.getMe(),
        documentsApi.getDocuments({ limit: 1 }),
        ailogsApi.getLogs({ limit: 1 }),
      ]);

      if (userResult.status === 'fulfilled') {
        const user = parseUser(userResult.value);
        if (user) {
          setProfile(user);
          setName(user.name || '');
          setBio(user.bio || '');
          updateUser({
            name: user.name,
            bio: user.bio,
            avatar: user.avatar,
            plan: user.plan as 'FREE' | 'PRO' | 'TEAM' | undefined,
            createdAt: user.createdAt,
          });
        }
      }

      let docs = docsResult.status === 'fulfilled' ? parseMetaTotal(docsResult.value) : 0;
      let aiCalls = logsResult.status === 'fulfilled' ? parseMetaTotal(logsResult.value) : 0;

      if (docs === 0 && aiCalls === 0) {
        try {
          const statsRes = await dashboardApi.getMyStats();
          const stats = parseDashboardStats(statsRes);
          docs = stats.documents;
          aiCalls = stats.aiCalls;
        } catch {
          // optional fallback
        }
      }

      setDocumentCount(docs);
      setAiCallCount(aiCalls);
    } finally {
      setLoading(false);
    }
  }, [applyStoreUser, updateUser]);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;
    loadProfile();
    // Load once per mount — avoid re-fetch overwriting form after save
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, isAuthenticated]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const displayAvatar = previewUrl || profile?.avatar;
  const headerName = profile?.name || storeUser?.name || name;
  const headerEmail = profile?.email || storeUser?.email || '';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    try {
      let avatarUrl: string | undefined;

      const cloudConfigured = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD);
      if (selectedFile && cloudConfigured) {
        avatarUrl = await uploadToCloudinary(selectedFile);
      }

      const body: Record<string, string> = {
        name: name.trim(),
        bio: bio.trim(),
      };
      if (avatarUrl) body.avatar = avatarUrl;

      const sessionToken = (session?.user as { token?: string } | undefined)?.token;
      const apiToken =
        (typeof window !== 'undefined'
          ? localStorage.getItem('writeflow_token') || localStorage.getItem('accessToken')
          : null) || sessionToken;

      if (!apiToken) {
        throw new ApiError('Your session expired. Please sign out and sign in again.', 401);
      }

      await usersApi.updateMe(body, apiToken);

      const freshRes = await usersApi.getMe(apiToken);
      const confirmed = parseUser(freshRes);

      if (!confirmed || confirmed.name !== body.name) {
        throw new ApiError(
          'The server did not save your profile. Please try again.',
          400
        );
      }

      setProfile(confirmed);
      setName(confirmed.name);
      setBio(confirmed.bio ?? body.bio);
      updateUser({
        name: confirmed.name,
        bio: confirmed.bio ?? body.bio,
        avatar: confirmed.avatar ?? avatarUrl,
        updatedAt: new Date().toISOString(),
      });

      try {
        await updateSession({
          name: confirmed.name,
          bio: confirmed.bio ?? body.bio,
          avatar: confirmed.avatar ?? avatarUrl,
        });
      } catch {
        // Profile is saved on the server; session refresh is best-effort
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      toast({ title: 'Profile updated successfully' });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update profile';
      toast({ title: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!hasHydrated || loading) {
    return (
      <div className="max-w-3xl space-y-6">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-5">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
          <div className="space-y-4 pt-4 border-t border-border">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account information and preferences.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-border">
          <div className="relative flex-shrink-0">
            {displayAvatar ? (
              <Image
                src={displayAvatar}
                alt={headerName || 'Avatar'}
                width={80}
                height={80}
                className="rounded-full object-cover border-2 border-border"
                unoptimized={displayAvatar.startsWith('blob:')}
              />
            ) : (
              <div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {headerName?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-xl truncate">{headerName}</h2>
            <p className="text-muted-foreground text-sm truncate">{headerEmail}</p>
            <Badge variant="secondary" className="mt-2">
              {planLabel(profile?.plan || storeUser?.plan)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <FileText className="w-4 h-4" />
              Documents
            </div>
            <p className="font-display text-2xl font-bold">{documentCount.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Sparkles className="w-4 h-4" />
              AI Calls Made
            </div>
            <p className="font-display text-2xl font-bold">{aiCallCount.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Calendar className="w-4 h-4" />
              Member Since
            </div>
            <p className="font-display text-2xl font-bold">
              {(profile?.createdAt || storeUser?.createdAt)
                ? formatMemberSince(profile?.createdAt || storeUser?.createdAt || '')
                : '—'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-2 border-t border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              {displayAvatar ? (
                <Image
                  src={displayAvatar}
                  alt="Avatar preview"
                  width={64}
                  height={64}
                  className="rounded-full object-cover border border-border"
                  unoptimized={displayAvatar.startsWith('blob:')}
                />
              ) : (
                <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center text-brand-500 text-xl font-bold">
                  {name.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-4 h-4 mr-2" />
                Change Photo
              </Button>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1.5">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell us about yourself..."
              className={cn(
                'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'ring-offset-background placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'resize-none'
              )}
            />
          </div>

          <Button type="submit" disabled={saving || !name.trim()}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

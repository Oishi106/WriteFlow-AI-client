'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'BANNED';
  createdAt: string;
}

interface UserDetail extends User {
  bio?: string;
  avatar?: string;
}

type RawUser = Partial<User> & {
  id?: string;
  banned?: boolean;
};

const normalizeUser = (user: RawUser): User => {
  const status = user.status
    ? user.status
    : user.banned
      ? 'BANNED'
      : 'ACTIVE';

  return {
    _id: user._id || user.id || '',
    name: user.name || 'Unknown',
    email: user.email || 'unknown@example.com',
    role: user.role || 'USER',
    status,
    createdAt: user.createdAt || new Date(0).toISOString(),
  };
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<{ total: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BANNED'>('ALL');

  // Dialog & Alert State
  const [roleUser, setRoleUser] = useState<User | null>(null);
  const [roleSelection, setRoleSelection] = useState<'USER' | 'ADMIN'>('USER');
  const [roleLoading, setRoleLoading] = useState(false);

  const [statusUser, setStatusUser] = useState<User | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [detailUser, setDetailUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, statusFilter]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      if (roleFilter !== 'ALL') {
        params.role = roleFilter;
      }
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      const response: any = await adminApi.getUsers(params);
      const root =
        response && typeof response === 'object' && ('success' in response || 'meta' in response)
          ? response
          : response?.data ?? response;
      const list = root?.data?.users ?? root?.data ?? root?.users ?? root ?? [];
      const pagination = root?.data?.pagination ?? root?.pagination ?? root?.meta ?? null;
      const normalizedUsers = Array.isArray(list)
        ? list.map(normalizeUser)
        : list && typeof list === 'object' && ('_id' in list || 'id' in list)
          ? [normalizeUser(list)]
          : [];
      setUsers(normalizedUsers);
      if (pagination) {
        setMeta({
          total: Number(pagination.total ?? pagination.totalUsers ?? normalizedUsers.length),
          totalPages: Number(pagination.totalPages ?? pagination.pages ?? 1),
        });
      } else {
        setMeta({ total: normalizedUsers.length, totalPages: 1 });
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!detailUserId) {
      setDetailUser(null);
      return;
    }

    let mounted = true;
    setDetailLoading(true);
    adminApi
      .getUser(detailUserId)
      .then((response: any) => {
        if (!mounted) return;
        const payload = response?.data ?? response;
        const rawUser = payload?.data ?? payload ?? null;
        setDetailUser(rawUser ? ({ ...normalizeUser(rawUser), ...rawUser } as UserDetail) : null);
      })
      .catch(() => {
        if (!mounted) return;
        setDetailUser(null);
      })
      .finally(() => {
        if (mounted) setDetailLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [detailUserId]);

  // Role Action
  const handleOpenRoleDialog = (user: User) => {
    setRoleUser(user);
    setRoleSelection(user.role);
  };

  const handleConfirmRole = async () => {
    if (!roleUser) return;
    setRoleLoading(true);
    try {
      await adminApi.updateUserRole(roleUser._id, roleSelection);
      toast({
        title: 'Success',
        description: `Successfully updated ${roleUser.name}'s role to ${roleSelection}.`,
      });
      setRoleUser(null);
      fetchUsers();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update user role.',
        variant: 'destructive',
      });
    } finally {
      setRoleLoading(false);
    }
  };

  const handleOpenDetail = (userId: string) => {
    setDetailUserId(userId);
  };

  // Status Toggle Action
  const handleOpenStatusAlert = (user: User) => {
    setStatusUser(user);
  };

  const handleConfirmStatus = async () => {
    if (!statusUser) return;
    setStatusLoading(true);
    const nextAction = statusUser.status === 'BANNED' ? 'activate' : 'deactivate';
    try {
      await adminApi.toggleUserStatus(statusUser._id);
      toast({
        title: 'Success',
        description: `Successfully ${nextAction}d ${statusUser.name}.`,
      });
      setStatusUser(null);
      fetchUsers();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || `Failed to ${nextAction} user.`,
        variant: 'destructive',
      });
    } finally {
      setStatusLoading(false);
    }
  };

  // Delete Action
  const handleOpenDeleteAlert = (user: User) => {
    setDeleteUser(user);
  };

  const handleConfirmDelete = async () => {
    if (!deleteUser) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteUser(deleteUser._id);
      toast({
        title: 'Success',
        description: `Deleted ${deleteUser.name}.`,
      });
      setDeleteUser(null);
      fetchUsers();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete user.',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Manage Users</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {meta?.total ? `${meta.total} users found` : 'List and manage user permissions'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'USER' | 'ADMIN')}
            className="w-full sm:w-40 px-3 py-2 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Filter by role"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'BANNED')}
            className="w-full sm:w-40 px-3 py-2 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Filter by status"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="BANNED">Banned</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isSelf = user.email === session?.user?.email;
                return (
                  <TableRow key={user._id} className="hover:bg-muted/10 transition-colors">
                    <TableCell className="font-medium text-sm">{user.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.status === 'BANNED' ? (
                        <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 text-white border-none">
                          BANNED
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white border-none">
                          ACTIVE
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(user._id)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenRoleDialog(user)}
                        >
                          Change Role
                        </Button>
                        {!isSelf && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={
                                user.status === 'BANNED'
                                  ? 'text-green-600 hover:text-green-700 hover:bg-green-500/10'
                                  : 'text-destructive hover:bg-destructive/10'
                              }
                              onClick={() => handleOpenStatusAlert(user)}
                            >
                              {user.status === 'BANNED' ? 'Activate' : 'Deactivate'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleOpenDeleteAlert(user)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing page {page} of {meta.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Dialog */}
      <Dialog open={!!detailUserId} onOpenChange={(open) => !open && setDetailUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Account profile and access overview.</DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : detailUser ? (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                {detailUser.avatar ? (
                  <img
                    src={detailUser.avatar}
                    alt={detailUser.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                    {(detailUser.name || 'U')
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold">{detailUser.name}</p>
                  <p className="text-sm text-muted-foreground">{detailUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Role</p>
                  <Badge variant={detailUser.role === 'ADMIN' ? 'destructive' : 'secondary'}>{detailUser.role}</Badge>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Status</p>
                  {detailUser.status === 'BANNED' ? (
                    <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 text-white border-none">
                      BANNED
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white border-none">ACTIVE</Badge>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Joined</p>
                  <p className="text-sm">{formatDate(detailUser.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Bio</p>
                  <p className="text-sm text-muted-foreground">
                    {detailUser.bio ? detailUser.bio : 'No bio provided.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-6">Unable to load user details.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={!!roleUser} onOpenChange={(open) => !open && setRoleUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Assign a new role to <strong>{roleUser?.name}</strong>. Admins have access to the administrative control panel.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Selected Role
            </label>
            <select
              value={roleSelection}
              onChange={(e) => setRoleSelection(e.target.value as 'USER' | 'ADMIN')}
              className="w-full px-3 py-2 border border-border bg-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleUser(null)} disabled={roleLoading}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRole} disabled={roleLoading} className="min-w-[80px]">
              {roleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Toggle Alert Dialog */}
      <AlertDialog open={!!statusUser} onOpenChange={(open) => !open && setStatusUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusUser?.status === 'BANNED' ? 'Activate this user?' : 'Deactivate this user?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusUser?.status === 'BANNED'
                ? `This will restore platform access for ${statusUser?.name}. They will be able to log in and generate content.`
                : `Are you sure you want to deactivate ${statusUser?.name}? They will be blocked from logging in and using the platform.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmStatus();
              }}
              disabled={statusLoading}
              className={
                statusUser?.status === 'BANNED'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-destructive hover:bg-destructive/90'
              }
            >
              {statusLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Alert Dialog */}
      <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. {deleteUser?.name} will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={deleteLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

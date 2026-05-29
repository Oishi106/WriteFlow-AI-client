'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, MoreVertical, Shield, Ban, Trash2, UserCheck } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  plan: 'FREE' | 'PRO' | 'TEAM';
  status: 'ACTIVE' | 'BANNED';
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<{ total: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search) params.search = search;
      const { data } = await usersApi.getAllUsers(params);
      setUsers(data.data);
      setMeta(data.meta);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleToggleStatus = async (id: string, name: string) => {
    try {
      await usersApi.toggleStatus(id);
      toast({ title: `Status updated for ${name}` });
      fetchUsers();
    } catch { toast({ title: 'Failed to update status', variant: 'destructive' }); }
    setMenuOpen(null);
  };

  const handleChangeRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await usersApi.changeRole(id, newRole);
      toast({ title: `Role changed to ${newRole}` });
      fetchUsers();
    } catch { toast({ title: 'Failed to change role', variant: 'destructive' }); }
    setMenuOpen(null);
  };

  const planColors: Record<string, string> = {
    FREE: 'bg-muted text-muted-foreground',
    PRO: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    TEAM: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Manage Users</h1>
          <p className="text-muted-foreground text-sm mt-1">{meta?.total ?? 0} total users</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-64"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['User', 'Role', 'Plan', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="skeleton h-4 w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : users.map(user => (
                <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-500/20 text-brand-500 rounded-full flex items-center justify-center text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${user.role === 'ADMIN' ? 'bg-brand-500/10 text-brand-500' : 'bg-muted text-muted-foreground'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${planColors[user.plan]}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-4 relative">
                    <button onClick={() => setMenuOpen(menuOpen === user._id ? null : user._id)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuOpen === user._id && (
                      <div className="absolute right-4 top-10 w-44 bg-card border border-border rounded-xl shadow-lg py-1 z-20">
                        <button onClick={() => handleChangeRole(user._id, user.role)} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                          <Shield className="w-4 h-4" /> {user.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        <button onClick={() => handleToggleStatus(user._id, user.name)} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                          {user.status === 'ACTIVE' ? <><Ban className="w-4 h-4 text-red-500" /> Ban User</> : <><UserCheck className="w-4 h-4 text-green-500" /> Unban User</>}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">Page {page} of {meta.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted disabled:opacity-40">Previous</button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

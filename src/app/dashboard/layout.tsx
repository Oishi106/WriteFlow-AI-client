'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, FileText, User, Sparkles, Settings,
  LogOut, ChevronLeft, ChevronRight, Zap, Menu, Plus,
  BarChart2, Users, BookTemplate, Star, SlidersHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const userNavItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/documents', label: 'My Documents', icon: FileText },
  { href: '/dashboard/profile', label: 'My Profile', icon: User },
  { href: '/dashboard/ai-history', label: 'AI History', icon: Sparkles },
];

const adminNavItems = [
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/users', label: 'Manage Users', icon: Users },
  { href: '/admin/templates', label: 'Manage Templates', icon: BookTemplate },
  { href: '/admin/reviews', label: 'Manage Reviews', icon: Star },
  { href: '/admin/settings', label: 'Site Settings', icon: SlidersHorizontal },
];

function DashboardBackground() {
  return (
    <div className="wf-pro-bg" aria-hidden>
      <div className="wf-pro-bg-blob left-[-5%] top-[10%] h-[400px] w-[400px] bg-blue-500/20" />
      <div
        className="wf-pro-bg-blob right-[-8%] top-[30%] h-[360px] w-[360px] bg-purple-500/20"
        style={{ animationDelay: '-6s' }}
      />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout, hasHydrated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.replace('/login');
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="wf-pro wf-pro-shell items-center justify-center">
        <DashboardBackground />
        <div className="relative z-10 text-center space-y-3">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';
  const navItems = isAdmin ? [...userNavItems, ...adminNavItems] : userNavItems;
  const pageTitle = navItems.find((n) => n.href === pathname)?.label || 'Dashboard';

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={cn(
        'wf-pro-sidebar',
        mobile ? 'w-72' : collapsed ? 'w-[4.5rem]' : 'w-64'
      )}
    >
      <Link
        href="/"
        className={cn(
          'flex h-16 items-center border-b border-white/8 px-4',
          collapsed && !mobile ? 'justify-center' : 'gap-3'
        )}
      >
        <div className="wf-pro-logo-icon">
          <Zap className="h-4 w-4 text-white" />
        </div>
        {(!collapsed || mobile) && <span className="wf-pro-logo-text">WriteFlow AI</span>}
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {isAdmin && (
          <div
            className={cn(
              'mb-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500',
              collapsed && !mobile && 'text-center'
            )}
          >
            {(!collapsed || mobile) ? 'User' : '—'}
          </div>
        )}
        {userNavItems.map((item) => (
          <NavItem key={item.href} item={item} collapsed={collapsed && !mobile} pathname={pathname} />
        ))}

        {isAdmin && (
          <>
            <div
              className={cn(
                'mb-2 mt-4 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500',
                collapsed && !mobile && 'text-center'
              )}
            >
              {(!collapsed || mobile) ? 'Admin' : '—'}
            </div>
            {adminNavItems.map((item) => (
              <NavItem key={item.href} item={item} collapsed={collapsed && !mobile} pathname={pathname} />
            ))}
          </>
        )}
      </nav>

      <div className="space-y-1 border-t border-white/8 p-3">
        <NavItem
          item={{ href: '/dashboard/settings', label: 'Settings', icon: Settings }}
          collapsed={collapsed && !mobile}
          pathname={pathname}
        />
        <button type="button" onClick={logout} className={cn('wf-pro-nav-logout', collapsed && !mobile && 'justify-center px-2')}>
          <LogOut className="h-5 w-5 shrink-0" />
          {(!collapsed || mobile) && 'Logout'}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="wf-pro wf-pro-shell">
      <DashboardBackground />

      <div className="relative z-10 hidden md:flex flex-col">
        <Sidebar />
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#121a2e] text-slate-300 shadow-lg transition-colors hover:border-blue-500/40 hover:text-white"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <Sidebar mobile />
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden />
        </div>
      )}

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="wf-pro-header">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden md:block">
            <h1 className="text-sm font-semibold capitalize text-white">{pageTitle}</h1>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <Link href="/editor" className="wf-pro-cta">
              <Plus className="h-4 w-4" />
              New Document
            </Link>
            <div className="flex items-center gap-3">
              <div className="wf-pro-avatar-ring">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold leading-none text-white">{user?.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">{user?.plan}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="wf-pro-main">{children}</main>
      </div>
    </div>
  );
}

function NavItem({
  item,
  collapsed,
  pathname,
}: {
  item: { href: string; label: string; icon: React.ElementType };
  collapsed: boolean;
  pathname: string;
}) {
  const isActive = pathname === item.href;
  return (
    <Link
      href={item.href}
      className={cn(
        'wf-pro-nav-item',
        isActive && 'wf-pro-nav-item-active',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? item.label : undefined}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {!collapsed && item.label}
    </Link>
  );
}

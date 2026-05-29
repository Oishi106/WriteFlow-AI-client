'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, FileText, User, History, Settings,
  LogOut, ChevronLeft, ChevronRight, Zap, Menu, X,
  BarChart2, Users, BookTemplate, Star, SlidersHorizontal
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const userNavItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/documents', label: 'My Documents', icon: FileText },
  { href: '/dashboard/profile', label: 'My Profile', icon: User },
  { href: '/dashboard/usage-history', label: 'AI Usage History', icon: History },
];

const adminNavItems = [
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/users', label: 'Manage Users', icon: Users },
  { href: '/admin/templates', label: 'Manage Templates', icon: BookTemplate },
  { href: '/admin/reviews', label: 'Manage Reviews', icon: Star },
  { href: '/admin/settings', label: 'Site Settings', icon: SlidersHorizontal },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const isDarkTheme = mounted && resolvedTheme === 'dark';

  if (!isAuthenticated) return null;

  const isAdmin = user?.role === 'ADMIN';
  const navItems = isAdmin ? [...userNavItems, ...adminNavItems] : userNavItems;

  const Sidebar = ({ mobile = false }) => (
    <aside className={cn(
      'flex flex-col h-full bg-card border-r border-border transition-all duration-300',
      mobile ? 'w-72' : collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center h-16 px-4 border-b border-border', collapsed && !mobile ? 'justify-center' : 'gap-3')}>
        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {(!collapsed || mobile) && <span className="font-display font-bold gradient-text">WriteFlow AI</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {isAdmin && (
          <div className={cn('px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2', collapsed && !mobile && 'text-center text-[8px]')}>
            {(!collapsed || mobile) ? 'User' : '—'}
          </div>
        )}
        {userNavItems.map((item) => (
          <NavItem key={item.href} item={item} collapsed={collapsed && !mobile} pathname={pathname} />
        ))}

        {isAdmin && (
          <>
            <div className={cn('px-2 py-1 pt-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2', collapsed && !mobile && 'text-center text-[8px]')}>
              {(!collapsed || mobile) ? 'Admin' : '—'}
            </div>
            {adminNavItems.map((item) => (
              <NavItem key={item.href} item={item} collapsed={collapsed && !mobile} pathname={pathname} />
            ))}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border space-y-1">
        <NavItem item={{ href: '/dashboard/settings', label: 'Settings', icon: Settings }} collapsed={collapsed && !mobile} pathname={pathname} />
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {(!collapsed || mobile) && 'Logout'}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col relative">
        <Sidebar />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-sm hover:border-brand-500/50 transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="flex">
            <Sidebar mobile />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card">
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-muted">
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:block">
            <h1 className="font-semibold text-sm capitalize">
              {navItems.find(n => n.href === pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {isDarkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold leading-none">{user?.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{user?.plan}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

function NavItem({ item, collapsed, pathname }: { item: { href: string; label: string; icon: React.ElementType }; collapsed: boolean; pathname: string }) {
  const isActive = pathname === item.href;
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
        isActive ? 'bg-brand-500/10 text-brand-500' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? item.label : undefined}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && item.label}
    </Link>
  );
}

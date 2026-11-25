import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import RoleSwitcher from '@/components/admin/RoleSwitcher';
import { adminNavigation, findNavigationItem } from '@/lib/adminNavigation';
import { ChevronDown, ChevronRight, Home, LogOut, Menu, ShieldCheck } from 'lucide-react';

export default function AdminLayout() {
  const { user, logout, hasRole, hasPermission } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(adminNavigation.map((group) => [group.code, true])),
  );
  const [mobile, setMobile] = useState(false);

  const breadcrumb = useMemo(() => findNavigationItem(location.pathname), [location.pathname]);
  const roleLabel = user?.roles?.includes('SYSTEM_ADMIN')
    ? 'System Administrator'
    : user?.roles?.includes('FINANCE_ADMIN')
      ? 'Finance Administration'
      : user?.roles?.includes('CHURCH_SECRETARY')
        ? 'Church Secretary'
        : user?.roles?.includes('WEBSITE_ADMIN')
          ? 'Website Administration'
          : 'Administration';

  useEffect(() => {
    setMobile(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!breadcrumb) return;
    setOpen((current) => (current[breadcrumb.group.code] ? current : { ...current, [breadcrumb.group.code]: true }));
  }, [location.pathname, breadcrumb]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
      isActive
        ? 'bg-[#7A1F2B]/10 text-[#7A1F2B]'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
    );

  const groupVisible = (group: (typeof adminNavigation)[number]) =>
    !group.roles?.length || hasRole(...group.roles);
  const itemVisible = (item: (typeof adminNavigation)[number]['items'][number]) =>
    (!item.roles?.length || hasRole(...item.roles)) && (!item.permission || hasPermission(item.permission));

  const sidebar = (
    <div className="flex h-full flex-col border-r border-gray-100 bg-white">
      <Link to="/" className="flex items-center gap-3 border-b border-gray-100 px-5 py-5">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-gray-100">
          <img src="/logos/logo.png" alt="TAG Forest church logo" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <div className="truncate font-serif text-base font-bold leading-tight text-gray-800">TAG Forest</div>
          <div className="truncate text-[11px] tracking-wide text-gray-500">Church Management Portal</div>
        </div>
      </Link>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="mb-4 rounded-xl bg-gray-50 px-3 py-3">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            <ShieldCheck className="h-3 w-3" /> Administration
          </div>
          <p className="mt-1 truncate text-xs font-medium text-gray-700">{roleLabel}</p>
        </div>

        {adminNavigation.map((group) => {
          if (!groupVisible(group)) return null;
          const visibleItems = group.items.filter(itemVisible);
          if (!visibleItems.length) return null;
          const isOpen = open[group.code] ?? true;
          return (
            <div key={group.code} className="mb-2">
              <button
                type="button"
                onClick={() => setOpen((current) => ({ ...current, [group.code]: !isOpen }))}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 transition hover:text-gray-600"
                aria-expanded={isOpen}
              >
                <span>{group.title}</span>
                {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>
              {isOpen ? (
                <div className="mt-1 space-y-0.5">
                  {visibleItems.map((item) => (
                    <NavLink
                      key={`${group.code}-${item.to}-${item.label}`}
                      to={item.to}
                      end
                      className={linkClass}
                      onClick={() => setMobile(false)}
                      title={item.label}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </ScrollArea>

      <div className="space-y-2 border-t border-gray-100 p-3">
        <NavLink to="/" className={linkClass} end>
          <Home className="h-4 w-4" /> Public Site
        </NavLink>
        <div className="rounded-xl bg-gray-50 px-3 py-3">
          <p className="truncate text-xs font-medium text-gray-800">{user?.email}</p>
          <p className="mt-0.5 truncate text-[10px] uppercase tracking-wide text-gray-500">{user?.roles?.join(' · ')}</p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 lg:block">{sidebar}</aside>

        {mobile ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobile(false)} aria-hidden="true" />
            <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] shadow-xl">{sidebar}</div>
          </div>
        ) : null}

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden text-gray-600" onClick={() => setMobile(true)} aria-label="Open administration menu">
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                    {breadcrumb ? breadcrumb.group.title : 'Administration'}
                  </p>
                  <p className="truncate font-serif text-lg font-semibold text-gray-800 sm:text-xl">
                    {breadcrumb?.item.label || roleLabel}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="hidden md:block">
                  <input
                    type="search"
                    placeholder="Search..."
                    className="h-10 w-64 rounded-full border border-gray-200 bg-gray-50 px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#7A1F2B]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]/10"
                    aria-label="Search"
                  />
                </div>
                <span className="hidden text-right text-xs leading-tight text-gray-500 lg:block">
                  <span className="block font-medium text-gray-700">{new Date().toLocaleDateString(undefined, { weekday: 'long' })}</span>
                  <span>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}</span>
                </span>
                <div className="hidden items-center gap-2.5 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-3 sm:flex">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7A1F2B] text-xs font-semibold uppercase text-white">
                    {(user?.email || 'U').slice(0, 2)}
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block max-w-[140px] truncate text-xs font-medium text-gray-800">{user?.email?.split('@')[0]}</span>
                    <span className="block text-[10px] uppercase tracking-wide text-gray-400">{user?.roles?.[0]?.replace(/_/g, ' ')}</span>
                  </span>
                </div>
                <RoleSwitcher />
              </div>
            </div>
          </header>
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

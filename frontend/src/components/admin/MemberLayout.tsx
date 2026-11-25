import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import RoleSwitcher from '@/components/admin/RoleSwitcher';
import { LayoutDashboard, Banknote, LogOut, Home, User, ReceiptText, HeartHandshake, Inbox } from 'lucide-react';

export default function MemberLayout() {
  const { user, logout } = useAuth();
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
      isActive ? 'bg-[#7A1F2B]/10 text-[#7A1F2B]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;
  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-100 bg-white p-4 md:flex">
          <Link to="/" className="mb-8 flex items-center gap-3 px-2">
            <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-gray-100"><img src="/logos/logo.png" alt="logo" className="h-full w-full object-cover" /></div>
            <div><div className="font-serif font-bold leading-tight text-gray-800">TAG Forest</div><div className="text-xs text-gray-500">Member Portal</div></div>
          </Link>
          <nav className="flex-1 space-y-1">
            <NavLink to="/member/dashboard" className={linkCls}><LayoutDashboard className="h-4 w-4" />Dashboard</NavLink>
            <NavLink to="/member/profile" className={linkCls}><User className="h-4 w-4" />My Profile</NavLink>
            <NavLink to="/member/contributions" className={linkCls}><Banknote className="h-4 w-4" />My Contributions</NavLink>
            <NavLink to="/member/receipts" className={linkCls}><ReceiptText className="h-4 w-4" />My Receipts</NavLink>
            <NavLink to="/member/pledges" className={linkCls}><HeartHandshake className="h-4 w-4" />My Pledges</NavLink>
            <NavLink to="/member/requests" className={linkCls}><Inbox className="h-4 w-4" />My Requests</NavLink>
            <NavLink to="/" className={linkCls}><Home className="h-4 w-4" />Public Site</NavLink>
          </nav>
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="mb-3"><RoleSwitcher /></div>
            <div className="mb-1 truncate px-1 text-xs text-gray-500">{user?.email}</div>
            <div className="mb-3 px-1 text-xs text-gray-500">{user?.member?.memberNo || 'Member'}</div>
            <Button variant="outline" className="w-full justify-start border-gray-200 text-gray-700 hover:bg-gray-50" onClick={logout}><LogOut className="mr-2 h-4 w-4" />Logout</Button>
          </div>
        </aside>
        <main className="flex-1">
          <div className="flex items-center justify-between border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-sm md:hidden">
            <span className="font-serif font-semibold text-gray-800">Member Portal</span>
            <div className="flex items-center gap-2"><RoleSwitcher /><Button variant="ghost" size="sm" onClick={logout}>Logout</Button></div>
          </div>
          <div className="p-4 md:p-8"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}

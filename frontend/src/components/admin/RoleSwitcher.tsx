import { useNavigate } from 'react-router-dom';
import { Check, ChevronsUpDown, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function RoleSwitcher() {
  const { dashboards, activeRole, activeDashboard, switchRole } = useAuth();
  const navigate = useNavigate();

  if (!dashboards.length) return null;

  if (dashboards.length === 1) {
    return (
      <div className="hidden items-center gap-2 rounded-full border border-gray-200/70 bg-white/70 px-3 py-1.5 text-xs text-[#7A5A10] sm:flex">
        <ShieldCheck className="h-3.5 w-3.5" />
        {activeDashboard?.label || activeRole}
      </div>
    );
  }

  const onSelect = async (role: string) => {
    const path = await switchRole(role);
    if (!path) {
      toast.error('Your access to that workspace is no longer available');
      return;
    }
    navigate(path);
    toast.success(`Switched to ${dashboards.find((d) => d.role === role)?.label || role}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="border-gray-200 bg-white/70 text-[#7A5A10]">
          <ShieldCheck className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">{activeDashboard?.label || 'Workspace'}</span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {dashboards.map((d) => (
          <DropdownMenuItem key={d.role} onClick={() => onSelect(d.role)} className="flex items-start gap-2">
            <Check className={`mt-0.5 h-4 w-4 ${activeRole === d.role ? 'opacity-100' : 'opacity-0'}`} />
            <span>
              <span className="block text-sm font-medium">{d.label}</span>
              <span className="block text-xs text-gray-500">{d.description}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

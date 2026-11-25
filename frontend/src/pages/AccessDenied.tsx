import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function AccessDenied({ required }: { required?: string[] }) {
  const { user, activeDashboard } = useAuth();
  const home = activeDashboard?.path || '/';
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full rounded-2xl border border-black/15/70 bg-white/80 backdrop-blur p-8 shadow-xl text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFD600]/20 text-amber-900">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800/70">403 · Access denied</p>
        <h1 className="mt-2 font-serif text-2xl text-black">You do not have permission for this area</h1>
        <p className="mt-2 text-sm text-black/60">
          {user ? `Signed in as ${user.email}.` : 'Please sign in.'} This page requires an authorization your account has not been granted.
          Contact the System Administrator if you believe you should have access.
        </p>
        {required?.length ? (
          <p className="mt-3 text-xs text-amber-900/80">
            Required: <span className="font-mono">{required.join(', ')}</span>
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline">
            <Link to={home}><LayoutDashboard className="mr-2 h-4 w-4" />Go to my dashboard</Link>
          </Button>
          <Button asChild>
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Public website</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

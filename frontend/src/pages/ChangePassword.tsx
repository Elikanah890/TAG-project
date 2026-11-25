import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export default function ChangePassword() {
  const { user, loading, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <Layout><div className="container-church py-20 text-center text-black/60">Loading…</div></Layout>;
  if (!user) return <Navigate to="/login" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }
    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Password updated. Please sign in again.');
      navigate('/login', { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="section-padding bg-gradient-warm min-h-[70vh] flex items-center">
        <div className="container-church max-w-lg w-full">
          <Card className="card-church border-black/15/60 shadow-elevated">
            <CardHeader className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FFD600]/20 text-black ring-1 ring-amber-200">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle className="font-serif text-2xl text-primary">Secure your account</CardTitle>
              <CardDescription>
                {user.mustChangePassword
                  ? 'A temporary password was issued for this account. Set a new password before continuing.'
                  : 'Update your password. You will be signed out of all sessions after changing it.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Current password</Label>
                  <Input id="current" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new">New password</Label>
                  <Input id="new" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} required />
                  <p className="text-xs text-black/60">At least 8 characters with upper case, lower case and a number.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm new password</Label>
                  <Input id="confirm" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} required />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="submit" className="flex-1 bg-[#FFD600] text-black hover:bg-[#E6C000]" disabled={submitting}>
                    {submitting ? 'Updating password…' : 'Update password'}
                  </Button>
                  {!user.mustChangePassword && (
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                  )}
                </div>
                {user.mustChangePassword && (
                  <Button type="button" variant="ghost" className="w-full text-black/60" onClick={logout}>
                    Sign out instead
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}

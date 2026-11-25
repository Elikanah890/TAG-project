import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const session = await login(email, password);
      if (session.user?.mustChangePassword) {
        toast.info('Please set a new password to continue');
        navigate('/change-password', { replace: true });
      } else {
        toast.success('Logged in successfully');
        if (session.defaultDashboard) navigate(session.defaultDashboard);
        else {
          toast.error('No dashboard is assigned to this account. Contact the System Administrator.');
          navigate('/access-denied');
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="section-padding bg-gradient-warm min-h-[70vh] flex items-center">
        <div className="container-church max-w-md w-full">
          <Card className="card-church border-border/60 shadow-elevated">
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-2xl text-primary">Member & Staff Login</CardTitle>
              <CardDescription>Sign in to access the church portal</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2"><Label>Email</Label><Input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Password</Label><Input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-[#E6C000]" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
              </form>
              <p className="text-sm text-black/60 mt-4 text-center">New member? <Link to="/register" className="text-primary font-medium hover:underline">Apply for membership</Link></p>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}

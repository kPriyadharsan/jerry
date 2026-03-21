import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AuthLayout from '../components/AuthLayout';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Access your Jerry's personal AI brain"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-600 text-sm animate-shake">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-text-muted text-xs uppercase tracking-widest pl-2">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-green-deep transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-bg-secondary rounded-md px-4 py-2.5 pl-12 border border-transparent focus:border-green-core focus:ring-2 focus:ring-green-glow outline-none transition-all duration-200 text-text-primary placeholder:text-text-muted"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between pl-2">
              <label className="text-text-muted text-xs uppercase tracking-widest">Master Password</label>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-green-deep transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-bg-secondary rounded-md px-4 py-2.5 pl-12 border border-transparent focus:border-green-core focus:ring-2 focus:ring-green-glow outline-none transition-all duration-200 text-text-primary placeholder:text-text-muted"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-core text-black-spore font-semibold rounded-pill px-6 py-3.5 shadow-glow hover:bg-green-deep hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <p className="text-center text-text-muted font-medium text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-deep hover:text-green-core font-bold transition-all underline underline-offset-4 decoration-green-core/30">
            Sign up now
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

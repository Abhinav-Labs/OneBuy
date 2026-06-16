import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import useAuthStore from '../store/useAuthStore';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginWithEmail } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-16 min-h-screen bg-premium-light flex items-center justify-center px-4">
      <div
        
        
        
        className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-premium-neutral">
        <div className="text-center mb-10">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-premium-dark mb-4 block">OneBuy</Link>
          <h1 className="text-3xl font-bold text-premium-dark mb-2">Welcome Back</h1>
          <p className="text-premium-dark/50">Sign in to your OneBuy account</p>
        </div>

        {/* Social Buttons at top */}
        <SocialAuthButtons onError={setError} disabled={loading} />

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-premium-neutral" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-premium-dark/50">Or sign in with email</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            
            
            className="flex items-start gap-3 bg-premium-accent/10 border border-premium-accent/30 text-premium-accent rounded-lg p-4 mb-5 text-sm">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Email form */}
        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-premium-dark mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full bg-premium-light border border-premium-neutral rounded-xl px-4 py-3 focus:outline-none focus:border-premium-dark focus:ring-1 focus:ring-premium-dark transition-colors"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-premium-dark">Password</label>
              <button type="button" className="text-sm text-premium-accent hover:text-premium-dark transition-colors">
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full bg-premium-light border border-premium-neutral rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-premium-dark focus:ring-1 focus:ring-premium-dark transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-premium-dark/40 hover:text-premium-dark/70">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full py-3.5 text-lg" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin" /> Signing in…
              </span>
            ) : 'Sign In with Email'}
          </Button>
        </form>

        <p className="text-center text-sm text-premium-dark/50 mt-8">
          Don't have an account?{' '}
          <Link to="/signup" className="text-premium-dark font-semibold hover:underline">Create one free</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

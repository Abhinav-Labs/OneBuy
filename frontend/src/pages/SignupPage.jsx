import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import useAuthStore from '../store/useAuthStore';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';

const SignupPage = () => {
  const navigate = useNavigate();
  const { registerWithEmail } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return { label: 'Weak', color: 'bg-premium-accent', width: 'w-1/4' };
    if (password.length < 8 || !/[0-9]/.test(password)) return { label: 'Fair', color: 'bg-premium-accent/50', width: 'w-1/2' };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { label: 'Strong', color: 'bg-premium-dark', width: 'w-full' };
    return { label: 'Good', color: 'bg-premium-dark/60', width: 'w-3/4' };
  };

  const strength = passwordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
          <h1 className="text-3xl font-bold text-premium-dark mb-2">Create Account</h1>
          <p className="text-premium-dark/50">Join OneBuy for a premium shopping experience</p>
        </div>

        {/* Social Buttons */}
        <SocialAuthButtons onError={setError} disabled={loading} />

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-premium-neutral" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-premium-dark/50">Or sign up with email</span>
          </div>
        </div>

        {error && (
          <div
            
            
            className="flex items-start gap-3 bg-premium-accent/10 border border-premium-accent/30 text-premium-accent rounded-lg p-4 mb-6 text-sm">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-premium-dark mb-2">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              className="w-full bg-premium-light border border-premium-neutral rounded-lg px-4 py-3 focus:outline-none focus:border-premium-dark focus:ring-1 focus:ring-premium-dark transition-colors"
              placeholder="Jane Doe"
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-premium-dark mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full bg-premium-light border border-premium-neutral rounded-lg px-4 py-3 focus:outline-none focus:border-premium-dark focus:ring-1 focus:ring-premium-dark transition-colors"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-premium-dark mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full bg-premium-light border border-premium-neutral rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-premium-dark focus:ring-1 focus:ring-premium-dark transition-colors"
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-premium-dark/40 hover:text-premium-dark/70">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Password strength bar */}
            {strength && (
              <div className="mt-2">
                <div className="h-1.5 w-full bg-premium-neutral rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                </div>
                <p className={`text-xs mt-1 font-medium ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-premium-dark mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                className={`w-full bg-gray-50 border rounded-lg px-4 py-3 pr-12 focus:outline-none transition-colors ${
                  confirmPassword && password !== confirmPassword
                    ? 'border-premium-accent focus:border-premium-accent focus:ring-premium-accent/20'
                    : 'border-premium-neutral focus:border-premium-dark focus:ring-1 focus:ring-premium-dark'
                }`}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-premium-dark/40 hover:text-premium-dark/70">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {confirmPassword && password === confirmPassword && (
                <CheckCircle2 size={18} className="absolute right-10 top-1/2 -translate-y-1/2 text-premium-dark" />
              )}
            </div>
          </div>

          <Button type="submit" className="w-full py-3.5 text-lg" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin" /> Creating account...
              </span>
            ) : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-premium-dark/50 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-premium-dark font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;

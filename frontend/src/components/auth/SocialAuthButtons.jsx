import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, X, ExternalLink } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import useAuthStore from '../../store/useAuthStore';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const IS_CONFIGURED = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'your_google_client_id_here';

// ── Setup Guide Modal ──────────────────────────────────────────────────────────
const SetupGuideModal = ({ isOpen, onClose }) => (
  <>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
            
          className="fixed inset-0 bg-premium-dark/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <div
          
          
          
          className="relative bg-premium-light rounded-2xl shadow-2xl w-full max-w-md p-8 z-10">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-premium-neutral text-premium-dark/50">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-premium-neutral flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-premium-dark">Google Sign-In Setup</h2>
              <p className="text-sm text-premium-dark/50">One-time configuration needed</p>
            </div>
          </div>

          <ol className="space-y-4 text-sm text-premium-dark/70 mb-6">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-premium-accent text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-premium-accent underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink size={12}/></a> and create or select a project.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-premium-accent text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>Go to <strong>APIs &amp; Services → Credentials → Create OAuth 2.0 Client ID</strong>.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-premium-accent text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>Set <strong>Authorised JavaScript origins</strong> to <code className="bg-premium-neutral px-1 rounded">http://localhost:5173</code>.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-premium-accent text-white text-xs flex items-center justify-center font-bold">4</span>
              <span>Copy the Client ID and paste it in <code className="bg-premium-neutral px-1 rounded">frontend/.env.local</code>:
                <pre className="mt-2 bg-premium-neutral border border-premium-neutral rounded-lg p-3 text-xs overflow-x-auto">VITE_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com</pre>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-premium-accent text-white text-xs flex items-center justify-center font-bold">5</span>
              <span>Restart the dev server (<code className="bg-premium-neutral px-1 rounded">npm run dev</code>) and Google Sign-In will work instantly.</span>
            </li>
          </ol>

          <button onClick={onClose} className="w-full py-3 rounded-xl border border-premium-neutral text-premium-dark font-medium hover:bg-premium-neutral transition-colors text-sm">
            Got it — I'll set it up
          </button>
        </div>
      </div>
    )}
  </>
);

// ── Shared Social Buttons Component ───────────────────────────────────────────
const SocialAuthButtons = ({ onError, disabled }) => {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuthStore();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const handleGoogleSuccess = async (tokenResponse) => {
    setGoogleLoading(true);
    try {
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      if (!userInfoRes.ok) throw new Error('Could not fetch Google profile.');
      const googleUser = await userInfoRes.json();
      await loginWithGoogle(tokenResponse.access_token, googleUser);
      navigate('/');
    } catch (err) {
      onError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => onError('Google sign-in was cancelled or failed. Please try again.'),
  });

  const handleGoogleClick = () => {
    if (!IS_CONFIGURED) {
      setShowSetupGuide(true);
      return;
    }
    onError('');
    googleLogin();
  };

  const handleAppleClick = () => {
    onError('Apple Sign-In requires Apple Developer credentials. Please use email login for now.');
  };

  return (
    <>
      <SetupGuideModal isOpen={showSetupGuide} onClose={() => setShowSetupGuide(false)} />

      <div className="space-y-3">
        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={disabled || googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-premium-neutral rounded-xl px-4 py-3 text-premium-dark font-medium hover:bg-premium-light active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
          {googleLoading ? (
            <Loader2 size={20} className="animate-spin text-premium-dark/50" />
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          <span>{googleLoading ? 'Connecting to Google…' : 'Continue with Google'}</span>
          {!IS_CONFIGURED && (
            <span className="ml-auto text-xs text-premium-dark/40 font-normal">Setup required</span>
          )}
        </button>

        {/* Apple */}
        <button
          type="button"
          onClick={handleAppleClick}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-3 bg-premium-dark text-white rounded-xl px-4 py-3 font-medium hover:bg-premium-dark/80 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.79 3.59-.79 1.54 0 2.85.74 3.58 1.84-3.11 1.84-2.64 5.92.35 7.15-.65 1.6-1.54 3.04-2.6 4.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.29-1.9 4.19-3.74 4.25z"/>
          </svg>
          <span>Continue with Apple</span>
        </button>
      </div>
    </>
  );
};

export default SocialAuthButtons;

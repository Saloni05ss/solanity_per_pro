import { FormEvent, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { signup, googleLogin } from '../features/auth/authSlice';

export default function Signup() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((s) => s.auth);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showMockOAuthModal, setShowMockOAuthModal] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isRealGoogleConfigured = googleClientId && googleClientId !== 'your-google-client-id.apps.googleusercontent.com';

  useEffect(() => {
    if (!isRealGoogleConfigured) return;

    // Load Google Identity Services Script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            const result = await dispatch(googleLogin(response.credential));
            if (googleLogin.fulfilled.match(result)) {
              navigate('/');
            }
          },
        });
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignUpBtn'),
          { theme: 'outline', size: 'large', width: '100%' }
        );
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isRealGoogleConfigured, googleClientId, dispatch, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = await dispatch(signup({ email, password, username }));
    if (signup.fulfilled.match(result)) navigate('/');
  }

  async function handleMockLogin(mockEmail: string, mockName: string) {
    const mockToken = `mock_google_token_12345_${mockEmail}_${mockName}`;
    const result = await dispatch(googleLogin(mockToken));
    if (googleLogin.fulfilled.match(result)) {
      setShowMockOAuthModal(false);
      navigate('/');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0b0f19] px-4 transition-colors duration-300">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800/80 dark:bg-[#111827]">
        <h1 className="mb-1 text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Create account</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Join the Solanity community</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Username</label>
            <input
              required
              minLength={2}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 pl-4 pr-10 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-355 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50 shadow-md transition-all duration-200"
          >
            {status === 'loading' ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <div className="my-6 flex items-center justify-between">
          <span className="w-1/5 border-b border-gray-200 dark:border-gray-800"></span>
          <span className="text-xs uppercase text-gray-400 dark:text-gray-500 font-bold">Or continue with</span>
          <span className="w-1/5 border-b border-gray-200 dark:border-gray-800"></span>
        </div>

        {isRealGoogleConfigured ? (
          <div id="googleSignUpBtn" className="w-full flex justify-center"></div>
        ) : (
          <button
            type="button"
            onClick={() => setShowMockOAuthModal(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-250 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 shadow-sm transition-all duration-200"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.13-5.136 4.13A5.85 5.85 0 0 1 8.1 12.7a5.85 5.85 0 0 1 5.89-5.83c1.558 0 2.973.57 4.07 1.516l3.07-3.07C19.265 3.525 16.745 2.5 13.99 2.5C8.75 2.5 4.5 6.75 4.5 12s4.25 9.5 9.49 9.5c5.36 0 9.51-3.666 9.51-9.5c0-.62-.06-1.217-.18-1.715H12.24Z"
              />
            </svg>
            Google OAuth
          </button>
        )}

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>

      {/* Simulated OAuth Modal */}
      {showMockOAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-850 dark:bg-[#111827] transform transition-all scale-100">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Select Google Account</h2>
              <button
                onClick={() => setShowMockOAuthModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => handleMockLogin('jane.eco@gmail.com', 'Jane Eco')}
                className="w-full flex items-center gap-3 rounded-xl border border-gray-100 hover:border-brand-500 bg-gray-50/50 hover:bg-brand-50/10 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:bg-brand-950/20 px-4 py-3 text-left transition-all duration-200"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-bold dark:bg-brand-950 dark:text-brand-400">
                  JE
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Jane Eco</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">jane.eco@gmail.com</p>
                </div>
              </button>

              <button
                onClick={() => handleMockLogin('alex.green@gmail.com', 'Alex Green')}
                className="w-full flex items-center gap-3 rounded-xl border border-gray-100 hover:border-brand-500 bg-gray-50/50 hover:bg-brand-50/10 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:bg-brand-950/20 px-4 py-3 text-left transition-all duration-200"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold dark:bg-emerald-950 dark:text-emerald-400">
                  AG
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Alex Green</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">alex.green@gmail.com</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { LoadingSpinner } from '../components/states/LoadingState';
import { validateLoginForm } from '../utils/validationUtils';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading: authLoading, error: authError } = useAuth();

  const [formData, setFormData] = useState({ emailOrMobile: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [accountLockedMessage, setAccountLockedMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    setAccountLockedMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAccountLockedMessage('');
    setErrors({});

    const newErrors = validateLoginForm(formData.emailOrMobile, formData.password);
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    try {
      const result = await login(formData.emailOrMobile, formData.password);
      if (result.success) {
        // Navigate immediately — no setTimeout needed.
        // PublicRoute will redirect away from /login as soon as isAuthenticated becomes true.
        // We explicitly navigate here for direct control.
        const dest = result.user?.role === 'admin' ? '/admin/dashboard' : '/';
        navigate(dest, { replace: true });
      } else {
        if (result.error.includes('locked')) setAccountLockedMessage(result.error);
        else if (result.error.includes('verify')) setErrors({ submit: 'Please verify your email before logging in' });
        else setErrors({ submit: result.error });
      }
    } catch {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--color-cream-100)' }}
    >
      {/* ── Left panel — decorative (desktop only) ─────────── */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-[50%] relative flex-col items-center justify-center p-12"
        style={{ background: 'linear-gradient(150deg, var(--color-brand-900) 0%, var(--color-brand-700) 55%, var(--color-brand-500) 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'var(--color-gold-400)', transform: 'translate(35%, -35%)' }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'var(--color-brand-300)', transform: 'translate(-35%, 35%)' }} />

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div
              className="flex items-center justify-center rounded-2xl overflow-hidden"
              style={{ width: '96px', height: '84px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <img
                src="/LOGO%20(2).jpg"
                alt="Adaah Jewels"
                style={{ width: '88px', height: '77px', objectFit: 'contain' }}
              />
            </div>
          </div>
          <h1 className="font-display font-black text-3xl xl:text-4xl leading-tight mb-4" style={{ color: 'white' }}>
            Timeless Craft.<br />Modern Grace.
          </h1>
          <p className="text-base leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.72)' }}>
            Sign in to explore our exclusive jewellery collections and manage your orders.
          </p>

          {/* Feature list */}
          <div className="space-y-3 text-left">
            {[
              { icon: '🔒', title: 'Secure Login',     sub: 'Your data is always encrypted' },
              { icon: '✨', title: 'Exclusive Offers',  sub: 'Member-only deals and discounts' },
              { icon: '📦', title: 'Track Orders',      sub: 'Real-time order status updates' },
            ].map(({ icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'white' }}>{title}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.60)' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ──────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 sm:px-10">
        {/* Mobile logo */}
        <div className="flex lg:hidden flex-col items-center mb-8">
          <div
            className="flex items-center justify-center rounded-2xl overflow-hidden mb-3"
            style={{ width: '64px', height: '56px', background: 'var(--color-brand-50)', border: '1px solid var(--color-brand-100)' }}
          >
            <img src="/LOGO%20(2).jpg" alt="Adaah Jewels" style={{ width: '58px', height: '50px', objectFit: 'contain' }} />
          </div>
          <p className="font-display font-bold text-xl" style={{ color: 'var(--color-brand-700)' }}>Adaah Jewels</p>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="font-display font-bold text-2xl sm:text-3xl mb-1" style={{ color: 'var(--color-ink)' }}>
              Welcome back
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
              Sign in to your Adaah Jewels account
            </p>
          </div>

          {/* Errors */}
          {(authError || errors.submit) && (
            <div className="flex gap-2.5 p-3.5 rounded-xl mb-5 text-sm" style={{ background: '#FBE9E4', border: '1px solid #F5C4B8', color: '#B71C1C' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{authError || errors.submit}</p>
            </div>
          )}

          {accountLockedMessage && (
            <div className="flex gap-2.5 p-3.5 rounded-xl mb-5 text-sm" style={{ background: '#FFF8E1', border: '1px solid #F5E199', color: '#7A5800' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Account Locked</p>
                <p className="mt-0.5">{accountLockedMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Mobile */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-ink-secondary)' }}>
                Email or Mobile <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-brand-400)' }} />
                <input
                  type="text"
                  name="emailOrMobile"
                  value={formData.emailOrMobile}
                  onChange={handleInputChange}
                  placeholder="email@example.com or 9876543210"
                  className="input-premium pl-10"
                  disabled={authLoading}
                  style={errors.emailOrMobile ? { borderColor: 'var(--color-error)' } : {}}
                />
              </div>
              {errors.emailOrMobile && <p className="mt-1.5 text-xs" style={{ color: 'var(--color-error)' }}>{errors.emailOrMobile}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-ink-secondary)' }}>
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-brand-400)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="input-premium pl-10 pr-11"
                  disabled={authLoading}
                  style={errors.password ? { borderColor: 'var(--color-error)' } : {}}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-ink-muted)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs" style={{ color: 'var(--color-error)' }}>{errors.password}</p>}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold transition-colors hover:opacity-80"
                style={{ color: 'var(--color-brand-600)' }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={authLoading}
              className="btn-primary w-full py-3.5 justify-center text-sm mt-2"
            >
              {authLoading ? (
                <><LoadingSpinner size="sm" inline /><span>Signing in…</span></>
              ) : (
                <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider-premium my-6" />

          <p className="text-center text-sm" style={{ color: 'var(--color-ink-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold transition-colors hover:opacity-80" style={{ color: 'var(--color-brand-600)' }}>
              Create one here
            </Link>
          </p>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-xs font-medium transition-colors hover:opacity-70"
              style={{ color: 'var(--color-ink-muted)' }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

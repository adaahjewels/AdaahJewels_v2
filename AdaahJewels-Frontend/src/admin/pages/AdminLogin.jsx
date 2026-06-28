import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorAlert } from '../components/ui/ErrorAlert';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginAdminAccount, isLoading, error } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }

    const result = await loginAdminAccount(email, password);
    if (result.success) {
      setSuccessMessage('Login successful! Redirecting…');
      setTimeout(() => navigate('/admin/dashboard'), 600);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(150deg, var(--color-brand-900) 0%, var(--color-brand-700) 55%, var(--color-brand-500) 100%)' }}
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'var(--color-gold-400)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'var(--color-brand-300)', transform: 'translate(-30%, 30%)' }} />

      <div
        className="w-full max-w-md rounded-3xl p-8 relative z-10"
        style={{ background: 'white', boxShadow: '0 24px 80px rgba(32,43,28,0.35)' }}
      >
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))' }}
          >
            <span className="text-white font-display font-black text-2xl">✦</span>
          </div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-ink)' }}>
            Admin Panel
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-ink-muted)' }}>
            Adaah Jewels Administration
          </p>
        </div>

        {error && <ErrorAlert message={error} />}

        {successMessage && (
          <div
            className="flex items-center gap-2.5 p-3.5 rounded-xl mb-5 text-sm font-medium"
            style={{ background: '#E8F5EE', border: '1px solid #B2DFCA', color: '#2E7D32' }}
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            {successMessage}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-ink-secondary)' }}>
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-brand-400)' }} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                placeholder="admin@adaahjewels.com"
                className="input-premium pl-10"
                disabled={isLoading}
                style={emailError ? { borderColor: 'var(--color-error)' } : {}}
              />
            </div>
            {emailError && (
              <div className="flex items-center gap-1.5 mt-2 text-sm" style={{ color: 'var(--color-error)' }}>
                <AlertCircle className="w-3.5 h-3.5" />
                {emailError}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-ink-secondary)' }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-brand-400)' }} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                placeholder="Enter password"
                className="input-premium pl-10"
                disabled={isLoading}
                style={passwordError ? { borderColor: 'var(--color-error)' } : {}}
              />
            </div>
            {passwordError && (
              <div className="flex items-center gap-1.5 mt-2 text-sm" style={{ color: 'var(--color-error)' }}>
                <AlertCircle className="w-3.5 h-3.5" />
                {passwordError}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 justify-center"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" inline />
                <span>Signing in…</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--color-ink-muted)' }}>
          Use your admin email and password to access the dashboard.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;

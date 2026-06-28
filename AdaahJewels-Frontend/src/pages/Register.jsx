import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, AlertTriangle, CheckCircle, Eye, EyeOff, Smartphone } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';
import { LoadingSpinner } from '../components/states/LoadingState';
import { validatePassword } from '../utils/validationUtils';
import { formatMobileNumber } from '../utils/formatterUtils';

const Register = () => {
  const navigate = useNavigate();
  const { registerNewUser, isLoading, error: authError } = useAuth();

  const [formData, setFormData] = useState({
    email: '', firstName: '', lastName: '', phoneNumber: '', password: '',
  });
  const [errors, setErrors]             = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const clearError = (field) =>
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError(name);
    setSuccessMessage('');
  };

  const handleMobileChange = (e) => {
    // strip non-digits, cap at 10
    const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, phoneNumber: clean }));
    clearError('phoneNumber');
  };

  // Inline validation (no confirm password)
  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = 'Valid email is required';
    if (formData.phoneNumber && !/^[6-9]\d{9}$/.test(formData.phoneNumber))
      errs.phoneNumber = 'Enter a valid 10-digit Indian mobile number';
    if (!formData.password) errs.password = 'Password is required';
    else if (!validatePassword(formData.password)) errs.password = 'Password is too weak';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const result = await registerNewUser(
      formData.email, formData.password, formData.phoneNumber,
      formData.firstName, formData.lastName
    );

    if (result.success) {
      setSuccessMessage('Account created! Redirecting…');
      setTimeout(() => navigate('/'), 1500);
    } else if (result.error) {
      setErrors({ submit: result.error });
    }
  };

  const passwordIsStrong = validatePassword(formData.password);
  const displayPhone     = formatMobileNumber(formData.phoneNumber);

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-cream-100)' }}>

      {/* ── Left decorative panel (desktop) ──────────────────── */}
      <div
        className="hidden lg:flex lg:w-[44%] relative flex-col items-center justify-center p-12"
        style={{ background: 'linear-gradient(150deg, var(--color-brand-900) 0%, var(--color-brand-700) 55%, var(--color-brand-500) 100%)' }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'var(--color-gold-400)', transform: 'translate(35%,-35%)' }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'var(--color-brand-300)', transform: 'translate(-35%,35%)' }} />

        <div className="relative z-10 text-center max-w-sm">
          <div className="flex justify-center mb-8">
            <img
              src="/LOGO%20(2).jpg"
              alt="Adaah Jewels"
              style={{ height: '80px', width: 'auto', objectFit: 'contain', borderRadius: '16px' }}
            />
          </div>
          <h1 className="font-display font-black text-3xl xl:text-4xl leading-tight mb-4" style={{ color: 'white' }}>
            Join Adaah Jewels
          </h1>
          <p className="text-base leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.72)' }}>
            Create your account and discover timeless jewellery crafted with love in India.
          </p>
          <div className="space-y-3 text-left">
            {[
              { icon: '✨', title: 'Exclusive Member Offers',  sub: 'Early access to new collections' },
              { icon: '📦', title: 'Easy Order Tracking',      sub: 'Know where your jewellery is' },
              { icon: '❤️', title: 'Personalised Wishlist',    sub: 'Save your favourite pieces' },
            ].map(({ icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
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

      {/* ── Right panel — form ───────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 sm:px-10 overflow-y-auto">

        {/* Mobile logo */}
        <div className="flex lg:hidden flex-col items-center mb-7">
          <img
            src="/LOGO%20(2).jpg"
            alt="Adaah Jewels"
            style={{ height: '48px', width: 'auto', objectFit: 'contain', marginBottom: '8px' }}
          />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="font-display font-bold text-2xl sm:text-3xl mb-1" style={{ color: 'var(--color-ink)' }}>
              Create Account
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
              Join us for exclusive offers and early access
            </p>
          </div>

          {/* Error */}
          {(authError || errors.submit) && (
            <div className="flex gap-2.5 p-3.5 rounded-xl mb-4 text-sm"
              style={{ background: '#FBE9E4', border: '1px solid #F5C4B8', color: '#B71C1C' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{authError || errors.submit}</p>
            </div>
          )}

          {/* Success */}
          {successMessage && (
            <div className="flex gap-2.5 p-3.5 rounded-xl mb-4 text-sm"
              style={{ background: '#E8F5EE', border: '1px solid #B2DFCA', color: '#2E7D32' }}>
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Row: First + Last name */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name" required error={errors.firstName}>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'var(--color-brand-400)' }} />
                  <input type="text" name="firstName" value={formData.firstName}
                    onChange={handleInputChange} placeholder="Priya" disabled={isLoading}
                    className="input-premium pl-10"
                    style={errors.firstName ? { borderColor: 'var(--color-error)' } : {}} />
                </div>
              </Field>
              <Field label="Last Name" error={errors.lastName}>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'var(--color-brand-400)' }} />
                  <input type="text" name="lastName" value={formData.lastName}
                    onChange={handleInputChange} placeholder="Sharma" disabled={isLoading}
                    className="input-premium pl-10" />
                </div>
              </Field>
            </div>

            {/* Email */}
            <Field label="Email Address" required error={errors.email}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--color-brand-400)' }} />
                <input type="email" name="email" value={formData.email}
                  onChange={handleInputChange} placeholder="priya@example.com" disabled={isLoading}
                  className="input-premium pl-10"
                  style={errors.email ? { borderColor: 'var(--color-error)' } : {}} />
              </div>
            </Field>

            {/* Mobile — single label, single field */}
            <Field label="Mobile Number" error={errors.phoneNumber}>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--color-brand-400)' }} />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={displayPhone}
                  onChange={handleMobileChange}
                  placeholder="9876 543 210"
                  maxLength={12}
                  disabled={isLoading}
                  className="input-premium pl-10"
                  style={errors.phoneNumber ? { borderColor: 'var(--color-error)' } : {}}
                />
              </div>
            </Field>

            {/* Password — single field, no confirm */}
            <Field label="Password" required error={errors.password}>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--color-brand-400)' }} />
                <input type={showPassword ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleInputChange}
                  placeholder="••••••••" disabled={isLoading}
                  className="input-premium pl-10 pr-11"
                  style={errors.password ? { borderColor: 'var(--color-error)' } : {}} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-ink-muted)' }} aria-label="Toggle password">
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye    className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            {/* Password strength */}
            {formData.password && (
              <PasswordStrengthMeter password={formData.password} showRequirements />
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !passwordIsStrong}
              className="btn-primary w-full py-3.5 justify-center text-sm mt-2"
            >
              {isLoading
                ? <><LoadingSpinner size="sm" inline /><span>Creating Account…</span></>
                : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="divider-premium my-5" />

          <p className="text-center text-sm" style={{ color: 'var(--color-ink-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:opacity-80"
              style={{ color: 'var(--color-brand-600)' }}>
              Sign in here
            </Link>
          </p>

          <div className="mt-4 text-center">
            <Link to="/" className="text-xs font-medium hover:opacity-70"
              style={{ color: 'var(--color-ink-muted)' }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
      style={{ color: 'var(--color-ink-secondary)' }}>
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>}
  </div>
);

export default Register;

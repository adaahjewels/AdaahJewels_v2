import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorAlert } from '../components/ui/ErrorAlert';

export const AdminVerifyOTP = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { verifyOTPCode, isLoading, error, sendOTPEmail } = useAdminAuth();

  const email = location.state?.email;
  const [otp, setOtp]           = useState('');
  const [otpError, setOtpError] = useState('');
  const [canResend, setCanResend]   = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => { if (!email) navigate('/admin/login'); }, [email, navigate]);

  useEffect(() => {
    if (resendTimer === 0) { setCanResend(true); return; }
    if (canResend) return;
    const id = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer, canResend]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { setOtpError('Please enter a 6-digit OTP'); return; }
    const result = await verifyOTPCode(email, otp);
    if (result.success) navigate('/admin/dashboard');
  };

  const handleResend = async () => {
    setCanResend(false);
    setResendTimer(60);
    await sendOTPEmail(email);
  };

  if (!email) return null;

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
        {/* Back */}
        <button
          onClick={() => navigate('/admin/login')}
          className="flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors hover:opacity-80"
          style={{ color: 'var(--color-brand-600)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))' }}
          >
            <span className="text-white font-display font-black text-2xl">✦</span>
          </div>
        </div>

        <div className="text-center mb-7">
          <h1 className="font-display font-bold text-2xl mb-1.5" style={{ color: 'var(--color-ink)' }}>
            Verify OTP
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
            We sent a 6-digit code to<br />
            <span className="font-semibold" style={{ color: 'var(--color-ink)' }}>{email}</span>
          </p>
        </div>

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-ink-secondary)' }}>
              Enter 6-digit OTP
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(v);
                setOtpError('');
              }}
              placeholder="000000"
              maxLength="6"
              className="input-premium text-center text-2xl font-mono tracking-[0.5em]"
              disabled={isLoading}
              style={otpError ? { borderColor: 'var(--color-error)' } : {}}
            />
            {otpError && (
              <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: 'var(--color-error)' }}>
                <AlertCircle className="w-3.5 h-3.5" />
                {otpError}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="btn-primary w-full py-3 justify-center"
          >
            {isLoading ? (
              <><LoadingSpinner size="sm" inline /><span>Verifying…</span></>
            ) : (
              'Verify OTP'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-sm font-semibold transition-colors hover:opacity-80"
              style={{ color: 'var(--color-brand-600)' }}
            >
              Resend OTP
            </button>
          ) : (
            <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
              Resend OTP in{' '}
              <span className="font-semibold" style={{ color: 'var(--color-brand-600)' }}>{resendTimer}s</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVerifyOTP;

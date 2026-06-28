import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle, AlertTriangle } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { LoadingSpinner } from '../components/states/LoadingState';
import { ErrorAlert } from '../components/states/ErrorState';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTPCode, isLoading, error, sendOTPEmail, setUser } = useAuth();

  const email = location.state?.email;
  const demoMode = location.state?.demoMode || false;
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  // Redirect to login if no email
  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  // Resend timer
  useEffect(() => {
    let interval;
    if (!canResend && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer, canResend]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setOtpError('');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setOtpError('');
    setSuccessMessage('');

    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a 6-digit OTP');
      return;
    }

    if (demoMode) {
      // Demo mode: accept any 6-digit OTP
      setSuccessMessage('Demo mode: OTP verified successfully! Redirecting...');
      // Create a demo user
      const demoUser = {
        email: email,
        name: location.state?.name || email.split('@')[0],
        createdAt: new Date().toISOString(),
      };
      setUser(demoUser);
      // Demo mode: store user in sessionStorage only — no token in localStorage
      try { sessionStorage.setItem('user', JSON.stringify(demoUser)); } catch (_) {}
      import('../api/authApi').then(({ setAccessToken }) => {
        setAccessToken('demo-token-' + Date.now());
      });
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
      return;
    }

    const result = await verifyOTPCode(email, otp);
    if (result.success) {
      setSuccessMessage('OTP verified successfully! Redirecting...');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setResendTimer(60);
    
    if (demoMode) {
      setSuccessMessage('Demo mode: OTP resent!');
      return;
    }
    
    const result = await sendOTPEmail(email);
    if (result.success) {
      setSuccessMessage('OTP sent again! Check your email.');
    }
  };

  const handleBack = () => {
    navigate('/login');
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-offwhite to-blush/10 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-teal hover:text-teal/80 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</h1>
            <p className="text-gray-600">
              We've sent an OTP to<br />
              <strong className="text-teal">{email}</strong>
            </p>
          </div>

          {/* Error Alert */}
          {error && !demoMode && (
            <ErrorAlert message={error} dismissible={false} />
          )}

          {/* Demo Mode Alert */}
          {demoMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-900 font-semibold">Demo Mode Active</p>
                <p className="text-blue-800 text-sm mt-1">Backend not running. Enter any 6-digit code to verify.</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit OTP
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={handleOtpChange}
                placeholder="000000"
                maxLength="6"
                className={`w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-teal ${
                  otpError ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {otpError && (
                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {otpError}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-teal text-white py-3 px-4 rounded-lg hover:bg-teal/90 active:bg-teal/95 transition-all duration-200 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" inline />
                  <span>Verifying...</span>
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="text-center mt-6">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-teal hover:text-teal/80 font-semibold"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-sm text-gray-600">
                Resend OTP in <span className="font-semibold text-teal">{resendTimer}s</span>
              </p>
            )}
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
            <p className="font-semibold mb-2">Demo Instructions:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Use any 6-digit code as OTP (e.g., 123456)</li>
              {!demoMode && <li>Check backend logs for generated OTP in production</li>}
              {demoMode && <li>Backend is offline - using demo mode for testing</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;

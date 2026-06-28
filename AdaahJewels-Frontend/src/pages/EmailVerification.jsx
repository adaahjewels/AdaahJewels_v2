import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowRight, AlertTriangle } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import AuthLayout from '../components/layouts/AuthLayout';
import OTPInput from '../components/auth/OTPInput';
import { LoadingSpinner } from '../components/states/LoadingState';
import { validateOTP } from '../utils/validationUtils';

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const {
    verifyEmailOTPCode,
    resendEmailOTP,
    isLoading,
    error: authError,
  } = useAuth();

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  // Handle cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOTPSubmit = async () => {
    setOtpError('');
    setSuccessMessage('');

    // Validate OTP
    if (!validateOTP(otp)) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    // Verify OTP
    const result = await verifyEmailOTPCode(email, otp);

    if (result.success) {
      setSuccessMessage('Email verified successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else if (result.error) {
      setOtpError(result.error);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setOtpError('');
    setSuccessMessage('');

    const result = await resendEmailOTP(email);

    if (result.success) {
      setSuccessMessage('OTP resent successfully! Check your email.');
      setResendCooldown(30); // 30 second cooldown
      setOtp(''); // Clear OTP input
    } else if (result.error) {
      setOtpError(result.error);
    }

    setResendLoading(false);
  };

  if (!email) {
    return null;
  }

  return (
    <AuthLayout
      title="Verify Email"
      subtitle="Enter the OTP sent to your email"
    >
      {/* Error Messages */}
      {authError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{authError}</p>
        </div>
      )}

      {otpError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{otpError}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {/* Email Display */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm text-blue-900">
              OTP sent to: <span className="font-semibold">{email}</span>
            </p>
            <p className="text-xs text-blue-800 mt-1">
              Check your email for the 6-digit code
            </p>
          </div>
        </div>
      </div>

      {/* OTP Input */}
      <div className="mb-6">
        <OTPInput
          value={otp}
          onChange={setOtp}
          onSubmit={handleOTPSubmit}
          error={otpError}
          disabled={isLoading}
          length={6}
        />
      </div>

      {/* Verify Button */}
      <button
        onClick={handleOTPSubmit}
        disabled={isLoading || otp.length !== 6}
        className="w-full bg-teal text-white py-3 px-4 rounded-lg hover:bg-teal/90 active:bg-teal/95 transition-all duration-200 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" inline />
            <span>Verifying OTP...</span>
          </>
        ) : (
          <>
            Verify Email
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      {/* Resend OTP */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600 mb-3">
          Didn't receive the OTP?
        </p>
        <button
          onClick={handleResendOTP}
          disabled={resendLoading || resendCooldown > 0}
          className="text-teal hover:underline font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendCooldown > 0
            ? `Resend OTP in ${resendCooldown}s`
            : resendLoading
            ? 'Sending...'
            : 'Resend OTP'}
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
        <p className="font-semibold mb-2">Verification Tips:</p>
        <ul className="text-xs space-y-1 ml-2">
          <li>✓ Check your spam folder if you don't see the email</li>
          <li>✓ OTP expires in 10 minutes</li>
          <li>✓ You can request a new OTP up to 3 times per 5 minutes</li>
        </ul>
      </div>
    </AuthLayout>
  );
};

export default EmailVerification;

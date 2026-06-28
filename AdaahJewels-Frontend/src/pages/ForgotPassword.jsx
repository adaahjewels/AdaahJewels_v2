import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, AlertTriangle, ChevronLeft, ArrowRight } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import AuthLayout from '../components/layouts/AuthLayout';
import OTPInput from '../components/auth/OTPInput';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';
import { LoadingSpinner } from '../components/states/LoadingState';
import {
  validateEmail,
  validateOTP,
  validatePasswordResetForm,
} from '../utils/validationUtils';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const {
    sendResetOTP,
    verifyResetOTPCode,
    resetPasswordFunc,
    isLoading,
    error: authError,
  } = useAuth();

  // Step 1: Email input
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Step 2: OTP input
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // Step 3: Password reset
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');

  // Step 1: Send reset OTP
  const handleSendReset = async (e) => {
    e.preventDefault();
    setEmailError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    const result = await sendResetOTP(email);

    if (result.success) {
      setSuccessMessage('OTP sent successfully! Check your email.');
      setTimeout(() => {
        setSuccessMessage('');
        setStep(2);
      }, 1500);
    } else if (result.error) {
      setEmailError(result.error);
    }
  };

  // Step 2: Verify reset OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setOtpError('');
    setSuccessMessage('');

    if (!validateOTP(otp)) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    const result = await verifyResetOTPCode(email, otp);

    if (result.success) {
      setSuccessMessage('OTP verified successfully! Enter your new password.');
      setTimeout(() => {
        setSuccessMessage('');
        setStep(3);
      }, 1500);
    } else if (result.error) {
      setOtpError(result.error);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setPasswordErrors({});
    setSuccessMessage('');

    // Validate
    const errors = validatePasswordResetForm(password, confirmPassword);

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    // Reset password
    const result = await resetPasswordFunc(email, password);

    if (result.success) {
      setSuccessMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else if (result.error) {
      setPasswordErrors({ submit: result.error });
    }
  };

  const backButton = step > 1 && (
    <button
      onClick={() => {
        setStep(step - 1);
        setOtpError('');
        setPasswordErrors({});
        setSuccessMessage('');
      }}
      className="flex items-center gap-2 text-teal hover:text-teal/80 font-medium text-sm"
    >
      <ChevronLeft className="w-4 h-4" />
      Back
    </button>
  );

  return (
    <AuthLayout
      title="Reset Password"
      subtitle={
        step === 1
          ? 'Enter your email to reset password'
          : step === 2
          ? 'Verify with the OTP sent to your email'
          : 'Create a new password'
      }
      backButton={backButton}
    >
      {/* Error Messages */}
      {authError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{authError}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {/* Step Indicator */}
      <div className="mb-6 flex items-center justify-between">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= stepNum
                  ? 'bg-teal text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {stepNum}
            </div>
            {stepNum < 3 && (
              <div
                className={`w-12 h-1 mx-2 ${
                  step > stepNum ? 'bg-teal' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Email */}
      {step === 1 && (
        <form onSubmit={handleSendReset} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                placeholder="your@email.com"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal transition-colors ${
                  emailError
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-white'
                }`}
                disabled={isLoading}
              />
            </div>
            {emailError && (
              <p className="mt-2 text-sm text-red-600">{emailError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal text-white py-3 px-4 rounded-lg hover:bg-teal/90 active:bg-teal/95 transition-all duration-200 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" inline />
                <span>Sending OTP...</span>
              </>
            ) : (
              <>
                Send Reset OTP
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Step 2: OTP */}
      {step === 2 && (
        <form onSubmit={handleVerifyOTP} className="space-y-5">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-900">
                  OTP sent to: <span className="font-semibold">{email}</span>
                </p>
              </div>
            </div>
          </div>

          <OTPInput
            value={otp}
            onChange={setOtp}
            onSubmit={handleVerifyOTP}
            error={otpError}
            disabled={isLoading}
            length={6}
          />

          <button
            onClick={handleVerifyOTP}
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
                Verify OTP
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Step 3: New Password */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-5">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordErrors.password) {
                    setPasswordErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.password;
                      return newErrors;
                    });
                  }
                }}
                placeholder="••••••••"
                className={`w-full pl-4 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal transition-colors ${
                  passwordErrors.password
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-white'
                }`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? '👁' : '👁‍🗨'}
              </button>
            </div>
            {passwordErrors.password && (
              <p className="mt-2 text-sm text-red-600">{passwordErrors.password}</p>
            )}
          </div>

          {/* Password Strength Meter */}
          {password && (
            <PasswordStrengthMeter
              password={password}
              showRequirements={true}
            />
          )}

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (passwordErrors.confirmPassword) {
                    setPasswordErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.confirmPassword;
                      return newErrors;
                    });
                  }
                }}
                placeholder="••••••••"
                className={`w-full pl-4 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal transition-colors ${
                  passwordErrors.confirmPassword
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-white'
                }`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? '👁' : '👁‍🗨'}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">
                {passwordErrors.confirmPassword}
              </p>
            )}
          </div>

          {passwordErrors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{passwordErrors.submit}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className="w-full bg-teal text-white py-3 px-4 rounded-lg hover:bg-teal/90 active:bg-teal/95 transition-all duration-200 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" inline />
                <span>Resetting Password...</span>
              </>
            ) : (
              <>
                Reset Password
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
        <p className="font-semibold mb-2">Password Reset Tips:</p>
        <ul className="text-xs space-y-1 ml-2">
          <li>✓ OTP expires in 10 minutes</li>
          <li>✓ Make your password strong and unique</li>
          <li>✓ You'll be redirected to login after reset</li>
        </ul>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;

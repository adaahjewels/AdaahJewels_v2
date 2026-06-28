import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import AuthLayout from '../components/layouts/AuthLayout';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';
import { LoadingSpinner } from '../components/states/LoadingState';
import { validateChangePasswordForm } from '../utils/validationUtils';

const ChangePassword = () => {
  const { changePasswordFunc, isLoading, error: authError, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isAuthenticated) {
    return (
      <AuthLayout title="Unauthorized" subtitle="Please login to continue">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-cream-200 bg-cream-50 p-6 text-center"
        >
          <p className="mb-4 text-charcoal-600">You need to be logged in to change your password.</p>
          <a href="/login" className="btn-primary inline-flex">
            Go to Login
          </a>
        </motion.div>
      </AuthLayout>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    const newErrors = validateChangePasswordForm(
      formData.oldPassword,
      formData.newPassword,
      formData.confirmPassword
    );

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await changePasswordFunc(formData.oldPassword, formData.newPassword);

    if (result.success) {
      setSuccessMessage('Password changed successfully!');
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } else if (result.error) {
      setErrors({ submit: result.error });
    }
  };

  return (
    <AuthLayout
      title="Change Password"
      subtitle="Update your account password"
      footer={
        <p className="text-center text-sm text-charcoal-600">
          Need help? <a href="/support" className="text-gold-600 hover:underline">Contact support</a>
        </p>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[1.75rem] border border-cream-200 bg-white p-6 shadow-xl"
      >
        {authError && (
          <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{authError}</p>
          </div>
        )}

        {errors.submit && (
          <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-success-200 bg-success-50 p-4">
            <p className="text-sm font-medium text-success-700">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-charcoal-900">
              Current Password <span className="text-error-600">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-charcoal-400" />
              <input
                type={showOldPassword ? 'text' : 'password'}
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`input-premium w-full pl-10 pr-12 ${errors.oldPassword ? 'border-error-500' : ''}`}
                disabled={isLoading}
              />
              <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-3 top-3 text-charcoal-400 hover:text-charcoal-700">
                {showOldPassword ? '👁' : '👁‍🗨'}
              </button>
            </div>
            {errors.oldPassword && <p className="mt-2 text-sm text-error-600">{errors.oldPassword}</p>}
          </div>

          <div className="border-t border-cream-200 pt-5" />

          <div>
            <label className="mb-2 block text-sm font-semibold text-charcoal-900">
              New Password <span className="text-error-600">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-charcoal-400" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`input-premium w-full pl-10 pr-12 ${errors.newPassword ? 'border-error-500' : ''}`}
                disabled={isLoading}
              />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-3 text-charcoal-400 hover:text-charcoal-700">
                {showNewPassword ? '👁' : '👁‍🗨'}
              </button>
            </div>
            {errors.newPassword && <p className="mt-2 text-sm text-error-600">{errors.newPassword}</p>}
          </div>

          {formData.newPassword && <PasswordStrengthMeter password={formData.newPassword} showRequirements={true} />}

          <div>
            <label className="mb-2 block text-sm font-semibold text-charcoal-900">
              Confirm New Password <span className="text-error-600">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-charcoal-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`input-premium w-full pl-10 pr-12 ${errors.confirmPassword ? 'border-error-500' : ''}`}
                disabled={isLoading}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-charcoal-400 hover:text-charcoal-700">
                {showConfirmPassword ? '👁' : '👁‍🗨'}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-2 text-sm text-error-600">{errors.confirmPassword}</p>}
          </div>

          <motion.button
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-gold-500 to-gold-600 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" inline />
                <span>Changing Password...</span>
              </>
            ) : (
              <>
                Change Password
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 rounded-2xl border border-gold-200 bg-gold-50 p-4 text-sm text-gold-800">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-4 w-4" />
            Security Tips
          </div>
          <ul className="ml-2 space-y-1 text-xs">
            <li>✓ Choose a strong, unique password</li>
            <li>✓ Don’t reuse old passwords</li>
            <li>✓ Don’t share your password with anyone</li>
            <li>✓ Change password regularly for security</li>
          </ul>
        </div>
      </motion.div>
    </AuthLayout>
  );
};

export default ChangePassword;

import { Check, X } from 'lucide-react';
import {
  getPasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthTextColor,
} from '../../utils/validationUtils';

/**
 * Password Strength Meter Component
 * Shows password strength level and requirement checklist
 */
const PasswordStrengthMeter = ({ password = '', showRequirements = true }) => {
  const strength = getPasswordStrength(password);
  const strengthColor = getPasswordStrengthColor(strength);
  const strengthTextColor = getPasswordStrengthTextColor(strength);

  // Check requirements
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  const allMet = Object.values(requirements).every(Boolean);

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Password Strength
          </label>
          <span className={`text-sm font-semibold ${strengthTextColor}`}>
            {strength.charAt(0).toUpperCase() + strength.slice(1)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${strengthColor} transition-all duration-300`}
            style={{
              width: password.length === 0 ? '0%' : 
                     strength === 'weak' ? '25%' : 
                     strength === 'fair' ? '50%' : 
                     strength === 'good' ? '75%' : 
                     '100%'
            }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Requirements
          </p>

          <div className="space-y-2">
            {/* Length requirement */}
            <div className="flex items-center gap-2">
              {requirements.length ? (
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
              <span
                className={`text-sm ${
                  requirements.length ? 'text-green-700' : 'text-gray-600'
                }`}
              >
                At least 8 characters
              </span>
            </div>

            {/* Uppercase requirement */}
            <div className="flex items-center gap-2">
              {requirements.uppercase ? (
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
              <span
                className={`text-sm ${
                  requirements.uppercase ? 'text-green-700' : 'text-gray-600'
                }`}
              >
                One uppercase letter (A-Z)
              </span>
            </div>

            {/* Lowercase requirement */}
            <div className="flex items-center gap-2">
              {requirements.lowercase ? (
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
              <span
                className={`text-sm ${
                  requirements.lowercase ? 'text-green-700' : 'text-gray-600'
                }`}
              >
                One lowercase letter (a-z)
              </span>
            </div>

            {/* Number requirement */}
            <div className="flex items-center gap-2">
              {requirements.number ? (
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
              <span
                className={`text-sm ${
                  requirements.number ? 'text-green-700' : 'text-gray-600'
                }`}
              >
                One number (0-9)
              </span>
            </div>

            {/* Special character requirement */}
            <div className="flex items-center gap-2">
              {requirements.special ? (
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
              <span
                className={`text-sm ${
                  requirements.special ? 'text-green-700' : 'text-gray-600'
                }`}
              >
                One special character (!@#$%^&*)
              </span>
            </div>
          </div>

          {/* All met indicator */}
          {password.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              {allMet ? (
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <Check className="w-4 h-4" />
                  <span className="font-semibold">Perfect! Ready to proceed.</span>
                </div>
              ) : (
                <div className="text-gray-600 text-sm">
                  Complete all requirements to continue.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;

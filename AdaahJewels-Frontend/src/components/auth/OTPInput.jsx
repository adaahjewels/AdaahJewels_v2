import { useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * OTP Input Component
 * 6 individual digit input boxes with auto-advance
 */
const OTPInput = ({
  value = '',
  onChange = () => {},
  onSubmit = () => {},
  error = '',
  disabled = false,
  length = 6,
}) => {
  const inputRefs = useRef(Array(length).fill(null));

  // Split value into individual digits
  const digits = value.split('');

  // Focus first empty input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Focus next empty or last input
  const focusNextInput = (index) => {
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (index === length - 1 && digits.length === length) {
      // All filled, call onSubmit
      onSubmit();
    }
  };

  const handleChange = (e, index) => {
    let input = e.target.value;

    // Only allow digits
    input = input.replace(/\D/g, '');

    // Only take first digit if multiple pasted
    if (input.length > 1) {
      input = input[0];
    }

    // Update digits array
    const newDigits = [...digits];
    newDigits[index] = input;
    const newValue = newDigits.join('');

    // Call onChange with new value
    onChange(newValue);

    // Auto-focus next input if digit entered
    if (input) {
      focusNextInput(index);
    }
  };

  const handleKeyDown = (e, index) => {
    const key = e.key;

    // Handle backspace
    if (key === 'Backspace') {
      e.preventDefault();

      // Clear current
      const newDigits = [...digits];
      newDigits[index] = '';
      const newValue = newDigits.join('');
      onChange(newValue);

      // Focus previous if current is empty
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Handle arrow keys
    if (key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Handle enter
    if (key === 'Enter' && digits.length === length && digits.join('')) {
      onSubmit();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    // Get pasted text
    const pasted = e.clipboardData.getData('text');

    // Extract only digits
    const pastedDigits = pasted.replace(/\D/g, '').slice(0, length);

    // Update value
    onChange(pastedDigits);

    // Focus last input or submit if complete
    if (pastedDigits.length === length) {
      setTimeout(() => onSubmit(), 0);
    } else {
      inputRefs.current[pastedDigits.length]?.focus();
    }
  };

  return (
    <div className="space-y-4">
      {/* OTP Inputs */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Enter OTP
        </label>

        <div className="flex gap-3 justify-center">
          {Array.from({ length }).map((_, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              value={digits[index] || ''}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              maxLength="1"
              disabled={disabled}
              className={`w-12 h-12 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none transition-colors ${
                error
                  ? 'border-red-500 bg-red-50 focus:border-red-500'
                  : 'border-gray-300 focus:border-teal focus:bg-white'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            />
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Helper Text */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Enter the 6-digit OTP sent to your email
        </p>
      </div>

      {/* Full OTP Display (for debugging/copy) */}
      {value.length === length && (
        <div className="text-center">
          <p className="text-xs text-gray-600">
            OTP: <span className="font-mono font-semibold">{value}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default OTPInput;

import { AlertCircle, Smartphone } from 'lucide-react';
import { formatMobileNumber } from '../../utils/formatterUtils';

/**
 * Mobile Number Input Component
 * Indian mobile format validation and formatting
 */
const MobileNumberInput = ({
  value = '',
  onChange = () => {},
  error = '',
  placeholder = '9876 543 210',
  disabled = false,
  label = 'Mobile Number',
  required = true,
}) => {
  const handleChange = (e) => {
    let inputValue = e.target.value;

    // Only allow digits
    inputValue = inputValue.replace(/\D/g, '');

    // Limit to 10 digits
    inputValue = inputValue.slice(0, 10);

    // Format for display
    const formatted = formatMobileNumber(inputValue);

    onChange(e, inputValue, formatted); // Pass both clean and formatted
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <Smartphone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength="14" // "9876 543 210" = 14 characters with spaces
          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal transition-colors ${
            error
              ? 'border-red-500 bg-red-50 focus:ring-red-500'
              : 'border-gray-300 bg-white focus:ring-teal'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
      </div>

      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        Enter a 10-digit Indian mobile number starting with 6, 7, 8, or 9
      </p>
    </div>
  );
};

export default MobileNumberInput;

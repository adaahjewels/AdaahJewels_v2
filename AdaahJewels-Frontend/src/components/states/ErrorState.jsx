import { AlertCircle } from 'lucide-react';

export const ErrorState = ({
  message = 'Something went wrong',
  onRetry = null,
  fullScreen = false,
}) => {
  const baseClass = fullScreen
    ? 'min-h-screen flex items-center justify-center'
    : 'py-12 flex items-center justify-center';

  return (
    <div className={`${baseClass} bg-offwhite`}>
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <AlertCircle className="w-16 h-16 text-maroon" />
        </div>
        <h3 className="text-xl font-semibold text-maroon mb-2">Error</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export const ErrorAlert = ({ message, onClose = null, dismissible = true }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-red-800">{message}</p>
        </div>
        {dismissible && onClose && (
          <button
            onClick={onClose}
            className="text-red-600 hover:text-red-800 ml-4"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;

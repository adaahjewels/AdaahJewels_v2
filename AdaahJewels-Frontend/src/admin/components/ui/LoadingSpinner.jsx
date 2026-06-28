export const LoadingSpinner = ({ fullScreen = false, message = 'Loading...' }) => {
  const container = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50'
    : 'flex items-center justify-center py-8';

  return (
    <div className={container}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;

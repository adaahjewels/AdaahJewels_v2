export const LoadingState = ({ message = 'Loading...', fullScreen = false }) => {
  const baseClass = fullScreen
    ? 'min-h-screen flex items-center justify-center'
    : 'py-12 flex items-center justify-center';

  return (
    <div className={`${baseClass} bg-offwhite`}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
};

export const LoadingSpinner = ({ size = 'md', inline = false }) => {
  const sizeClass = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  }[size];

  const spinnerEl = (
    <div className={`${sizeClass} border-teal border-t-transparent rounded-full animate-spin`}></div>
  );

  if (inline) {
    return spinnerEl;
  }

  return (
    <div className="flex items-center justify-center py-8">
      {spinnerEl}
    </div>
  );
};

export default LoadingState;

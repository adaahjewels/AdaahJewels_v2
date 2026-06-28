/**
 * Auth Layout Component
 * Reusable centered card layout for authentication pages
 */
const AuthLayout = ({
  title = '',
  subtitle = '',
  children,
  backButton = null,
  footer = null,
  info = null,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-offwhite to-blush/10 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back Button (if provided) */}
        {backButton && <div className="mb-6">{backButton}</div>}

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          {(title || subtitle) && (
            <div className="text-center mb-8">
              {title && (
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {title}
                </h1>
              )}
              {subtitle && <p className="text-gray-600">{subtitle}</p>}
            </div>
          )}

          {/* Main Content */}
          <div className="mb-6">{children}</div>

          {/* Info Box (if provided) */}
          {info && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              {info}
            </div>
          )}

          {/* Footer (if provided) */}
          {footer && <div className="mt-8 pt-6 border-t border-gray-200">{footer}</div>}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

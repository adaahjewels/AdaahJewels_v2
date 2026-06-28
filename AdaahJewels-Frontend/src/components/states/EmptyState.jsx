import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = ShoppingBag,
  title = 'No items found',
  message = 'There are no items to display right now.',
  actionText = 'Continue Shopping',
  actionLink = '/products',
  fullScreen = false,
}) => {
  const baseClass = fullScreen
    ? 'min-h-screen flex items-center justify-center'
    : 'py-12 flex items-center justify-center';

  return (
    <div className={`${baseClass} bg-offwhite`}>
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <Icon className="w-16 h-16 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        {actionLink && (
          <Link to={actionLink} className="btn-primary">
            {actionText}
          </Link>
        )}
      </div>
    </div>
  );
};

export default EmptyState;

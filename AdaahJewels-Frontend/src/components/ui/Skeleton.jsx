/**
 * Skeleton Loading Component
 * 
 * Displays a shimmer animation while content is loading.
 * Used to improve perceived performance and UX.
 */

/**
 * Generic Skeleton Loader
 * @param {number} width - Width in Tailwind units or CSS
 * @param {number} height - Height in Tailwind units or CSS
 * @param {string} className - Additional Tailwind classes
 * @returns {JSX.Element} Shimmer skeleton element
 */
export const Skeleton = ({ width = 'w-full', height = 'h-4', className = '' }) => (
  <div
    className={`skeleton rounded-md bg-gradient-to-r from-cream-200 via-cream-100 to-cream-200 ${width} ${height} ${className}`}
    style={{ backgroundSize: '200% 100%' }}
  />
);

/**
 * Product Card Skeleton
 * Displays skeleton for product card while loading
 * @returns {JSX.Element} Complete product card skeleton
 */
export const ProductCardSkeleton = () => (
  <div className="product-card bg-white">
    {/* Image Skeleton */}
    <Skeleton height="h-64" className="w-full rounded-none" />

    {/* Content Skeleton */}
    <div className="p-4 space-y-3">
      {/* Category */}
      <Skeleton width="w-20" height="h-3" />

      {/* Title */}
      <Skeleton width="w-3/4" height="h-5" />

      {/* Price */}
      <Skeleton width="w-1/3" height="h-6" className="mt-2" />

      {/* Button */}
      <Skeleton width="w-full" height="h-10" className="mt-3" />
    </div>
  </div>
);

/**
 * Admin Dashboard Card Skeleton
 * @returns {JSX.Element} Dashboard stat card skeleton
 */
export const DashboardCardSkeleton = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <Skeleton width="w-24" height="h-3" className="mb-2" />
        <Skeleton width="w-1/2" height="h-8" className="mt-2" />
      </div>
      <Skeleton width="w-12" height="h-12" className="rounded-lg" />
    </div>
  </div>
);

/**
 * Table Row Skeleton
 * @param {number} columns - Number of columns in table
 * @returns {JSX.Element} Table row skeleton
 */
export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr className="border-b border-cream-300">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <Skeleton width="w-20" height="h-4" />
      </td>
    ))}
  </tr>
);

/**
 * Checkout Form Skeleton
 * @returns {JSX.Element} Form skeleton for checkout
 */
export const CheckoutFormSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="space-y-2">
        <Skeleton width="w-24" height="h-3" />
        <Skeleton width="w-full" height="h-10" className="rounded-lg" />
      </div>
    ))}
  </div>
);

/**
 * Text Skeleton (for paragraphs/descriptions)
 * @param {number} lines - Number of lines to show
 * @returns {JSX.Element} Multiple skeleton lines
 */
export const TextSkeleton = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        width={i === lines - 1 ? 'w-2/3' : 'w-full'}
        height="h-4"
      />
    ))}
  </div>
);

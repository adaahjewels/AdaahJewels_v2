/**
 * Enhanced Premium Admin Dashboard Components
 * 
 * Premium styling for:
 * - Dashboard stat cards
 * - Data tables
 * - Charts (ready for integration)
 * - Admin layout
 */

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Premium Dashboard Stat Card
 * Displays KPI with icon, value, and trend
 */
export const AdminStatCard = ({
  icon: Icon,
  label,
  value,
  trend,
  trendValue,
  color = 'bg-gold-500',
  onClick,
}) => {
  const trendIsPositive = trend === 'up';

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(26, 26, 26, 0.12)' }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="bg-white rounded-xl p-6 shadow-md border border-cream-200 cursor-pointer transition-all hover:border-gold-300"
    >
      {/* Header with icon */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-text-muted uppercase tracking-wider">
            {label}
          </p>
          <p className="text-3xl font-bold text-charcoal-900 mt-2">{value}</p>
        </div>
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          className={`p-3 rounded-lg ${color} text-white`}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
      </div>

      {/* Trend indicator */}
      {trend && (
        <div className="flex items-center gap-2 pt-4 border-t border-cream-200">
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
              trendIsPositive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {trendIsPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trendValue}
          </div>
          <span className="text-xs text-text-muted">vs last month</span>
        </div>
      )}
    </motion.div>
  );
};

/**
 * Premium Data Table Component
 * Responsive table with premium styling
 */
export const AdminTable = ({
  columns,
  data,
  actions,
  loading = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-cream-200"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-cream-50 border-b-2 border-cream-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              {actions && <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Actions</th>}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-cream-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" />
                    <span className="text-text-muted">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-8 text-center text-text-muted"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-cream-50 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 text-sm text-charcoal-900"
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {actions.map((action) => (
                          <motion.button
                            key={action.label}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => action.onClick(row)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                              action.variant === 'danger'
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : action.variant === 'success'
                                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                : 'bg-gold-50 text-gold-600 hover:bg-gold-100'
                            }`}
                          >
                            {action.label}
                          </motion.button>
                        ))}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

/**
 * Premium Section Header
 * Used at top of dashboard sections
 */
export const AdminSectionHeader = ({ title, subtitle, action }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-charcoal-900">{title}</h2>
        {subtitle && <p className="text-text-muted text-sm mt-1">{subtitle}</p>}
      </div>
      {action && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary"
        >
          {action.label}
        </motion.button>
      )}
    </div>
  );
};

/**
 * Premium Status Badge
 * Shows status with color coding
 */
export const AdminStatusBadge = ({ status, variant = 'default' }) => {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    warning: 'bg-orange-100 text-orange-800',
  };

  return (
    <motion.span
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
        statusStyles[status] || statusStyles.default
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-2" />
      {status}
    </motion.span>
  );
};

/**
 * Premium Empty State
 * Displayed when no data available
 */
export const AdminEmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border-2 border-dashed border-cream-300 p-12 text-center"
    >
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-cream-100 rounded-full">
          <Icon className="w-8 h-8 text-text-muted" />
        </div>
      </div>
      <h3 className="font-bold text-charcoal-900 mb-2">{title}</h3>
      <p className="text-text-muted text-sm mb-4">{description}</p>
      {action && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
};

/**
 * Premium Loading Skeleton for Admin
 */
export const AdminLoadingSkeleton = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="h-16 bg-gradient-to-r from-cream-200 via-cream-100 to-cream-200 rounded-lg animate-shimmer"
        style={{ backgroundSize: '200% 100%' }}
      />
    ))}
  </div>
);

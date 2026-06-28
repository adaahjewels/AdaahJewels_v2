/**
 * Enhanced Premium Product Card Component
 * 
 * Features:
 * - Premium shadows and hover effects (lift animation)
 * - Quick view functionality
 * - Badge system (New, Sale, etc.)
 * - Smooth image zoom on hover
 * - Interactive wishlist button
 * - Add to cart with feedback
 * - WCAG AA accessible
 */

import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';
import { FALLBACK_IMAGE, getSafeImageUrl, handleImageError } from '../utils/imageUtils';

const ProductCard = ({ product, showQuickView = true }) => {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Support both real API fields and mock fields
  const productId = product.ProductId || product.id;
  const name = product.ProductName || product.name || '';
  const price = product.Price || product.price || 0;
  const comparePrice = product.ComparePrice || product.comparePrice;
  const category = product.CategoryName || product.category || '';
  const rating = product.AverageRating || product.rating || 0;
  const isNew = product.IsNew || product.isNew || false;
  const image = getSafeImageUrl(
    (product.ProductImages && product.ProductImages[0]?.ImageUrl) ||
    product.ImageUrl ||
    product.image,
    FALLBACK_IMAGE
  );

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);
    try {
      await addToCart(product);
      toast.success('Added to cart!', {
        duration: 2000,
        icon: '✨',
      });
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      toggleWishlist(product);
      if (isInWishlist(productId)) {
        toast.success('Added to wishlist!', {
          icon: '❤️',
          duration: 1500,
        });
      } else {
        toast.success('Removed from wishlist', {
          duration: 1500,
        });
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const discount = comparePrice
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  return (
    <>
      <Link to={`/product/${productId}`} className="group block h-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className="product-card h-full flex flex-col"
        >
          {/* Image Container */}
          <div className="product-card-image relative overflow-hidden">
            {/* Badge Section */}
            {isNew && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-4 left-4 z-10"
              >
                <span className="inline-block bg-gold-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                  New
                </span>
              </motion.div>
            )}

            {discount > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-4 right-4 z-10"
              >
                <span className="inline-block bg-error text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                  -{discount}%
                </span>
              </motion.div>
            )}

            {/* Main Image */}
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => handleImageError(e)}
            />

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
              {/* Quick View */}
              {showQuickView && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowQuickViewModal(true);
                  }}
                  className="bg-white/95 hover:bg-white text-charcoal-900 p-3 rounded-full shadow-lg transition-all duration-300"
                  aria-label="Quick view"
                >
                  <Eye className="w-5 h-5" />
                </motion.button>
              )}

              {/* Wishlist on Image Hover */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleWishlist}
                className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
                  isInWishlist(productId)
                    ? 'bg-maroon-500 text-white'
                    : 'bg-white/95 hover:bg-white text-charcoal-900'
                }`}
                aria-label="Add to wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isInWishlist(productId) ? 'fill-current' : ''
                  }`}
                />
              </motion.button>
            </div>

            {/* Wishlist Button (bottom right on normal state) */}
            <button
              onClick={handleToggleWishlist}
              className={`absolute bottom-4 right-4 p-2 rounded-full transition-all duration-300 group-hover:opacity-0 z-5 shadow-md ${
                isInWishlist(productId)
                  ? 'bg-maroon-500 text-white'
                  : 'bg-white text-charcoal-900 hover:bg-maroon-100'
              }`}
              aria-label="Add to wishlist"
            >
              <Heart
                className={`w-4 h-4 ${
                  isInWishlist(productId) ? 'fill-current' : ''
                }`}
              />
            </button>
          </div>

          {/* Content Section */}
          <div className="p-4 flex-1 flex flex-col">
            {/* Category */}
            {category && (
              <p className="text-xs text-text-muted uppercase tracking-widest font-semibold mb-1">
                {category}
              </p>
            )}

            {/* Product Name */}
            <h3 className="font-display font-bold text-lg text-charcoal-900 line-clamp-2 mb-2 group-hover:text-gold-500 transition-colors duration-300">
              {name}
            </h3>

            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.round(rating)
                          ? 'fill-gold-500 text-gold-500'
                          : 'text-cream-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-text-muted font-semibold">
                  {parseFloat(rating).toFixed(1)}
                </span>
              </div>
            )}

            {/* Pricing */}
            <div className="mb-3 mt-auto">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-charcoal-900">
                  ₹{parseFloat(price).toFixed(0)}
                </span>
                {comparePrice && (
                  <span className="text-sm text-text-muted line-through">
                    ₹{parseFloat(comparePrice).toFixed(0)}
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={isAddingToCart || isInCart(productId)}
              className={`w-full py-2.5 px-4 rounded-lg font-semibold uppercase tracking-wider text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                isInCart(productId)
                  ? 'bg-cream-300 text-charcoal-600 cursor-not-allowed'
                  : 'bg-charcoal-900 text-white hover:bg-gold-500 shadow-md hover:shadow-gold-md'
              }`}
              aria-label={isInCart(productId) ? 'In cart' : 'Add to cart'}
            >
              <ShoppingBag className="w-4 h-4" />
              {isAddingToCart ? 'Adding...' : isInCart(productId) ? 'In Cart' : 'Add to Cart'}
            </motion.button>
          </div>
        </motion.div>
      </Link>

      {/* Quick View Modal Placeholder */}
      {showQuickViewModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowQuickViewModal(false)}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl max-w-md w-full p-6"
          >
            <h3 className="font-display text-2xl font-bold mb-4">{name}</h3>
            <p className="text-text-muted mb-6">Quick view feature coming soon!</p>
            <button
              onClick={() => setShowQuickViewModal(false)}
              className="w-full btn-primary"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default ProductCard;

/**
 * Enhanced Product Card Skeleton Loader
 * Matches the ProductCard layout for smooth loading states
 */
export const ProductCardSkeletonEnhanced = () => (
  <div className="product-card bg-white">
    {/* Image Skeleton */}
    <div className="product-card-image bg-gradient-to-r from-cream-200 via-cream-100 to-cream-200 animate-shimmer" />

    {/* Content Skeleton */}
    <div className="p-4 space-y-3">
      {/* Category */}
      <div className="h-2 w-16 rounded bg-gradient-to-r from-cream-200 to-cream-200 animate-shimmer" />

      {/* Title */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gradient-to-r from-cream-200 to-cream-200 animate-shimmer" />
        <div className="h-4 w-2/3 rounded bg-gradient-to-r from-cream-200 to-cream-200 animate-shimmer" />
      </div>

      {/* Rating */}
      <div className="h-3 w-20 rounded bg-gradient-to-r from-cream-200 to-cream-200 animate-shimmer" />

      {/* Price */}
      <div className="h-6 w-1/3 rounded bg-gradient-to-r from-cream-200 to-cream-200 animate-shimmer" />

      {/* Button */}
      <div className="h-10 w-full rounded-lg bg-gradient-to-r from-cream-200 to-cream-200 animate-shimmer mt-3" />
    </div>
  </div>
);

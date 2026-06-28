import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';
import { FALLBACK_IMAGE, getSafeImageUrl, handleImageError } from '../utils/imageUtils';

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const productId = product.ProductId || product.id;
  const name      = product.ProductName || product.name || '';
  const price     = product.Price || product.price || 0;
  const category  = product.CategoryName || product.category || '';
  const rating    = product.AverageRating || product.rating || 0;
  const image     = getSafeImageUrl(
    (product.ProductImages && product.ProductImages[0]?.ImageUrl) ||
    product.ImageUrl ||
    product.image,
    FALLBACK_IMAGE
  );

  const inCart      = isInCart(productId);
  const inWishlist  = isInWishlist(productId);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCart) return;
    setIsAddingToCart(true);
    try {
      await addToCart(product);
      toast.success('Added to cart!', { duration: 2000, icon: '✨' });
    } catch {
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
      if (!inWishlist) {
        toast.success('Added to wishlist!', { icon: '❤️', duration: 1500 });
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <Link to={`/product/${productId}`} className="group block h-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="product-card h-full flex flex-col"
      >
        {/* Image */}
        <div className="product-card-image relative">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => handleImageError(e)}
          />

          {/* Hover overlay with Quick View hint */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            <span
              className="text-white text-xs font-semibold px-4 py-2 rounded-full backdrop-blur-sm"
              style={{ background: 'rgba(88,99,72,0.75)' }}
            >
              View Details
            </span>
          </div>

          {/* Wishlist toggle */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200"
            style={{
              background: inWishlist ? 'var(--color-brand-500)' : 'rgba(255,255,255,0.92)',
              color: inWishlist ? 'white' : 'var(--color-neutral-600)',
            }}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col gap-1">
          {category && (
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-brand-400)' }}>
              {category}
            </p>
          )}

          <h3
            className="font-display font-bold text-base leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-brand-600"
            style={{ color: 'var(--color-ink)' }}
          >
            {name}
          </h3>

          {rating > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5"
                  style={{
                    fill: i < Math.round(rating) ? 'var(--color-gold-500)' : 'none',
                    color: i < Math.round(rating) ? 'var(--color-gold-500)' : 'var(--color-neutral-300)',
                  }}
                />
              ))}
              <span className="text-[11px] font-semibold ml-0.5" style={{ color: 'var(--color-ink-muted)' }}>
                {parseFloat(rating).toFixed(1)}
              </span>
            </div>
          )}

          <div className="mt-auto pt-2">
            <span className="text-lg font-bold" style={{ color: 'var(--color-brand-700)' }}>
              ₹{parseFloat(price).toFixed(0)}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: inCart ? 1 : 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAddToCart}
            disabled={isAddingToCart || inCart}
            className="w-full mt-2 py-2.5 px-4 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2"
            style={
              inCart
                ? { background: 'var(--color-brand-50)', color: 'var(--color-brand-400)', cursor: 'not-allowed' }
                : { background: 'var(--color-brand-500)', color: 'white', boxShadow: '0 4px 12px rgba(88,99,72,0.25)' }
            }
            onMouseEnter={(e) => {
              if (!inCart) e.currentTarget.style.background = 'var(--color-brand-600)';
            }}
            onMouseLeave={(e) => {
              if (!inCart) e.currentTarget.style.background = 'var(--color-brand-500)';
            }}
          >
            <ShoppingBag className="w-4 h-4" />
            {isAddingToCart ? 'Adding…' : inCart ? 'In Cart' : 'Add to Cart'}
          </motion.button>
        </div>
      </motion.div>
    </Link>
  );
};

export const ProductCardSkeleton = () => (
  <div className="product-card bg-white">
    <div className="product-card-image skeleton" />
    <div className="p-4 space-y-3">
      <div className="h-2 w-16 rounded skeleton" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded skeleton" />
        <div className="h-4 w-2/3 rounded skeleton" />
      </div>
      <div className="h-3 w-20 rounded skeleton" />
      <div className="h-6 w-1/3 rounded skeleton" />
      <div className="h-10 w-full rounded-xl skeleton" />
    </div>
  </div>
);

export default ProductCard;

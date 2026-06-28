import { motion } from 'framer-motion';
import { Heart, Sparkles, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';

const Wishlist = () => {
  const { wishlistItems, clearWishlist } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-lg rounded-4xl border border-cream-200 bg-white p-10 text-center shadow-xl"
          >
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-gold-50 p-5 text-gold-600">
                <Heart className="h-16 w-16" />
              </div>
            </div>
            <h2 className="mb-4 font-display text-3xl font-bold text-charcoal-900">Your Wishlist is Empty</h2>
            <p className="mb-8 text-charcoal-600">Save your favorite items here to purchase them later.</p>
            <Link to="/products" className="btn-primary inline-flex">
              Start Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 rounded-4xl border border-cream-200 bg-white p-6 shadow-xl sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="mb-2 flex items-center gap-2 text-gold-600">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">Saved for later</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-charcoal-900">My Wishlist</h1>
            <p className="mt-1 text-charcoal-600">{wishlistItems.length} items saved</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={clearWishlist}
            className="rounded-xl border border-maroon-600 px-4 py-2 font-semibold text-maroon-600 transition-colors hover:bg-maroon-600 hover:text-white"
          >
            Clear All
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((product, index) => (
            <motion.div
              key={product.ProductId || product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;

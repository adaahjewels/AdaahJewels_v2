import { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cartService } from '../api/backendServices';
import { useAuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FALLBACK_IMAGE, getSafeImageUrl, handleImageError } from '../utils/imageUtils';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (!user?.userId) {
      navigate('/login');
      return;
    }
    loadCart();
  }, [user, navigate]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const items = await cartService.get();
      // normalize field names from backend
      setCartItems(items.map(i => ({
        ...i,
        ProductId:    i.productId   || i.ProductId,
        ProductName:  i.name        || i.ProductName || '',
        ProductImage: i.image       || i.ImageUrl    || '',
        Price:        i.price       ?? i.Price       ?? 0,
        Quantity:     i.quantity    ?? i.Quantity     ?? 1,
        CartItemId:   i.productId   || i.CartItemId,   // backend uses productId as key
      })));
    } catch (error) {
      toast.error('Failed to load cart');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdating(productId);
    try {
      await cartService.update(productId, newQuantity);
      setCartItems(prev =>
        prev.map(item =>
          item.ProductId === productId ? { ...item, Quantity: newQuantity } : item
        )
      );
    } catch (error) {
      toast.error('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!window.confirm('Remove this item from cart?')) return;
    try {
      await cartService.remove(productId);
      setCartItems(prev => prev.filter(item => item.ProductId !== productId));
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Clear your entire cart?')) return;
    try {
      await cartService.clear();
      setCartItems([]);
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
  const shippingFree = subtotal >= 999;
  const shipping = shippingFree ? 0 : 99;
  const gst = Math.round((subtotal + shipping) * 0.18 * 100) / 100;
  const total = subtotal + shipping + gst;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="rounded-full h-12 w-12 border-4 border-cream-200 border-t-gold-500"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-charcoal-900 mb-2">Shopping Cart</h1>
          <p className="text-charcoal-600 font-medium">{cartItems.length} item(s) in cart</p>
        </motion.div>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-md p-8 md:p-12 text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ShoppingCart className="w-20 h-20 mx-auto text-gold-500 mb-6" />
            </motion.div>
            <h2 className="text-3xl font-display font-bold text-charcoal-900 mb-3">Your cart is empty</h2>
            <p className="text-charcoal-600 mb-8 text-lg">Add some beautiful jewelry to get started!</p>
            <Link
              to="/products"
              className="inline-block btn-primary"
            >
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                {cartItems.map((item, idx) => (
                  <motion.div
                    key={item.ProductId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="flex gap-4 p-6 border-b border-cream-200 hover:bg-cream-50 transition-colors"
                  >
                    {/* Product Image */}
                    <div className="shrink-0">
                      <img
                        src={getSafeImageUrl(item.ProductImage, FALLBACK_IMAGE)}
                        alt={item.ProductName}
                        className="w-28 h-28 object-cover rounded-xl shadow-md"
                        onError={(e) => handleImageError(e)}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="grow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <Link
                            to={`/product/${item.ProductId}`}
                            className="text-lg font-display font-bold text-charcoal-900 hover:text-gold-500 transition-colors"
                          >
                            {item.ProductName}
                          </Link>
                          {item.SKU && (
                            <p className="text-xs text-charcoal-500 font-mono mt-1">SKU: {item.SKU}</p>
                          )}
                        </div>
                        <p className="text-xl font-bold text-charcoal-900">₹{item.Price.toFixed(0)}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border-2 border-charcoal-200 rounded-lg bg-cream-50">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateQuantity(item.ProductId, item.Quantity - 1)}
                            disabled={updating === item.ProductId || item.Quantity <= 1}
                            className="p-2 text-charcoal-600 hover:bg-cream-100 disabled:opacity-50"
                          >
                            <Minus className="w-4 h-4" />
                          </motion.button>
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={item.Quantity}
                            onChange={(e) => handleUpdateQuantity(item.ProductId, parseInt(e.target.value))}
                            className="w-12 text-center border-0 bg-transparent text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-gold-500 rounded"
                          />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateQuantity(item.ProductId, item.Quantity + 1)}
                            disabled={updating === item.ProductId}
                            className="p-2 text-charcoal-600 hover:bg-cream-100 disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                          </motion.button>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveItem(item.ProductId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Remove from cart"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-2 font-semibold">Subtotal</p>
                      <p className="text-xl font-bold text-charcoal-900">
                        ₹{(item.Price * item.Quantity).toFixed(0)}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {/* Clear Cart Button */}
                <div className="p-6 border-t border-cream-200 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearCart}
                    className="px-6 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition"
                  >
                    Clear Cart
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl shadow-md p-6 sticky top-20"
              >
                <h2 className="text-2xl font-display font-bold text-charcoal-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-charcoal-700">
                    <span className="font-medium">Subtotal</span>
                    <span>₹{subtotal.toFixed(0)}</span>
                  </div>

                  <div className="flex justify-between text-charcoal-700">
                    <span className="font-medium">Shipping</span>
                    <div className="text-right">
                      <span className={shippingFree ? 'text-success-600 font-bold' : 'text-charcoal-700'}>
                        ₹{shipping.toFixed(0)}
                      </span>
                      {shippingFree && <p className="text-xs text-success-600 font-bold mt-1">✓ FREE SHIPPING</p>}
                      {!shippingFree && (
                        <p className="text-xs text-charcoal-500 mt-1">
                          Free on orders ≥ ₹999
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between text-charcoal-700">
                    <span className="font-medium">GST (18%)</span>
                    <span>₹{gst.toFixed(0)}</span>
                  </div>

                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5 }}
                    className="border-t-2 border-cream-200 pt-4 flex justify-between items-center origin-left"
                  >
                    <span className="text-lg font-display font-bold text-charcoal-900">Total</span>
                    <span className="text-3xl font-display font-bold text-gold-500">₹{total.toFixed(0)}</span>
                  </motion.div>
                </div>

                {/* Checkout Button */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/checkout')}
                  className="w-full btn-primary flex items-center justify-center gap-2 mb-4"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                {/* Continue Shopping */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/products')}
                  className="w-full px-6 py-3 border-2 border-charcoal-900 text-charcoal-900 rounded-lg font-semibold text-center hover:bg-charcoal-900 hover:text-white transition-colors"
                >
                  Continue Shopping
                </motion.button>

                {/* Promo Code Section */}
                <div className="mt-6 border-t border-cream-200 pt-6">
                  <p className="text-sm font-medium text-charcoal-700 mb-2">Have a promo code?</p>
                  <p className="text-xs text-charcoal-500">
                    Apply promo codes at checkout
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;

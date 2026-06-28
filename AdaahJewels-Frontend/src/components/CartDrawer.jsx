import { X, Plus, Minus, Trash2, ShoppingBag, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuthContext } from '../context/AuthContext';
import { FALLBACK_IMAGE, getSafeImageUrl, handleImageError } from '../utils/imageUtils';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const shipping = subtotal >= 1299 ? 0 : 99;
  const tax      = Math.round(subtotal * 0.05);
  const total    = subtotal + shipping + tax;

  if (!isOpen) return null;

  const handleLoginClick = () => { onClose(); navigate('/login'); };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 transition-opacity"
        style={{ background: 'rgba(32,43,28,0.55)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full md:w-96 z-50 shadow-2xl flex flex-col animate-slide-in"
        style={{ background: 'var(--color-cream-50)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-brand-100)' }}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" style={{ color: 'var(--color-brand-500)' }} />
            <h2 className="font-display font-bold text-lg" style={{ color: 'var(--color-ink)' }}>
              Your Cart
            </h2>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--color-brand-500)', color: 'white' }}
            >
              {getCartCount()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:bg-brand-50"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" style={{ color: 'var(--color-ink-secondary)' }} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!user ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--color-brand-50)' }}
              >
                <LogIn className="w-8 h-8" style={{ color: 'var(--color-brand-500)' }} />
              </div>
              <p className="font-semibold text-base" style={{ color: 'var(--color-ink)' }}>Sign in to your cart</p>
              <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
                Please log in to view and manage your shopping cart
              </p>
              <button onClick={handleLoginClick} className="btn-primary mt-2 py-2.5 px-8 text-sm">
                Sign In
              </button>
              <Link to="/register" onClick={onClose} className="text-sm font-medium" style={{ color: 'var(--color-brand-500)' }}>
                Create an account
              </Link>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--color-neutral-100)' }}
              >
                <ShoppingBag className="w-8 h-8" style={{ color: 'var(--color-neutral-400)' }} />
              </div>
              <p className="font-semibold" style={{ color: 'var(--color-ink)' }}>Your cart is empty</p>
              <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>Discover our beautiful jewellery collection</p>
              <Link to="/products" onClick={onClose} className="btn-primary text-sm py-2.5 px-6 mt-1">
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-2xl"
                  style={{ background: 'white', border: '1px solid var(--color-brand-100)' }}
                >
                  <img
                    src={getSafeImageUrl(item.image, FALLBACK_IMAGE)}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                    onError={(e) => handleImageError(e)}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-1 mb-0.5" style={{ color: 'var(--color-ink)' }}>
                      {item.name}
                    </h3>
                    <p className="font-bold text-sm" style={{ color: 'var(--color-brand-600)' }}>
                      ₹{item.price}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: 'var(--color-brand-50)', color: 'var(--color-brand-600)' }}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold" style={{ color: 'var(--color-ink)' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: 'var(--color-brand-50)', color: 'var(--color-brand-600)' }}
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="self-start w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-red-50 text-red-400 hover:text-red-600"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer summary */}
        {user && cartItems.length > 0 && (
          <div className="px-5 py-4" style={{ borderTop: '1px solid var(--color-brand-100)' }}>
            <div className="space-y-1.5 text-sm mb-4">
              {[
                { label: 'Subtotal', value: `₹${subtotal}`, accent: false },
                { label: 'Shipping', value: shipping === 0 ? 'FREE' : `₹${shipping}`, accent: shipping === 0 },
                { label: 'Tax (5%)', value: `₹${tax}`, accent: false },
              ].map(({ label, value, accent }) => (
                <div key={label} className="flex justify-between">
                  <span style={{ color: 'var(--color-ink-secondary)' }}>{label}</span>
                  <span className="font-semibold" style={{ color: accent ? '#2E7D32' : 'var(--color-ink)' }}>
                    {value}
                  </span>
                </div>
              ))}
              <div
                className="flex justify-between pt-2 text-base font-bold"
                style={{ borderTop: '1px solid var(--color-brand-100)' }}
              >
                <span style={{ color: 'var(--color-ink)' }}>Total</span>
                <span style={{ color: 'var(--color-brand-700)' }}>₹{total}</span>
              </div>
            </div>

            {subtotal < 1299 && (
              <div
                className="text-xs text-center p-2.5 rounded-xl mb-3 font-medium"
                style={{ background: 'var(--color-brand-50)', color: 'var(--color-brand-700)' }}
              >
                Add ₹{1299 - subtotal} more for <strong>FREE shipping</strong> 🚀
              </div>
            )}

            <div className="space-y-2">
              <Link
                to="/cart"
                onClick={onClose}
                className="btn-secondary block w-full text-center py-2.5 text-xs"
              >
                View Full Cart
              </Link>
              <Link to="/checkout" onClick={onClose} className="btn-primary block w-full text-center py-2.5 text-xs">
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;

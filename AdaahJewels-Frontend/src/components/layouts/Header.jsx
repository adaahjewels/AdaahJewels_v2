import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, User, Menu, X, LogOut, ChevronDown, ShoppingBag, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuthContext } from '../../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const { wishlistItems } = useWishlist();
  const { getCartCount } = useCart();
  const { user, logoutUser } = useAuthContext();
  const cartCount = getCartCount();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  return (
    <motion.header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-effect shadow-md' : 'bg-cream-100 border-b border-brand-100'
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2.5">

          {/* ── Logo ───────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src="/LOGO%20(2).jpg"
              alt="Adaah Jewels"
              style={{ height: '48px', width: 'auto', objectFit: 'contain', display: 'block', borderRadius: '6px' }}
            />
            <div className="hidden sm:block leading-tight">
              <p className="font-display font-black text-sm" style={{ color: 'var(--color-brand-800)' }}>
                Adaah Jewels
              </p>
              <p className="text-[10px] tracking-wide" style={{ color: 'var(--color-brand-500)' }}>
                Elegance in Every Thread
              </p>
            </div>
          </Link>

          {/* ── Search — Desktop ───────────────────────────── */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for jewellery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-premium pr-11 text-sm"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
                style={{ color: 'var(--color-brand-400)' }}
                aria-label="Search"
              >
                <Search className="w-4.5 h-4.5" />
              </button>
            </div>
          </form>

          {/* ── Icons — Desktop ────────────────────────────── */}
          <div className="hidden md:flex items-center gap-4">

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 rounded-xl transition-all duration-200 hover:bg-brand-50"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 transition-colors duration-200 hover:text-brand-500" style={{ color: 'var(--color-ink-secondary)' }} />
              {wishlistItems.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  style={{ background: 'var(--color-brand-500)', minWidth: '1.1rem', height: '1.1rem', padding: '0 3px' }}
                >
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl transition-all duration-200 hover:bg-brand-50"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" style={{ color: 'var(--color-ink-secondary)' }} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  style={{ background: 'var(--color-gold-500)', minWidth: '1.1rem', height: '1.1rem', padding: '0 3px' }}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-2 rounded-xl transition-all duration-200 hover:bg-brand-50"
                aria-expanded={isUserMenuOpen}
              >
                <User className="w-5 h-5" style={{ color: 'var(--color-ink-secondary)' }} />
                {user && (
                  <span className="text-sm hidden lg:inline font-medium" style={{ color: 'var(--color-ink)' }}>
                    {user.name || user.email?.split('@')[0]}
                  </span>
                )}
                <ChevronDown
                  className="w-3.5 h-3.5 transition-transform duration-200"
                  style={{
                    color: 'var(--color-ink-muted)',
                    transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl overflow-hidden z-50"
                    style={{ border: '1px solid var(--color-brand-100)' }}
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-3" style={{ background: 'var(--color-brand-50)', borderBottom: '1px solid var(--color-brand-100)' }}>
                          <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{user.name || 'User'}</p>
                          <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>{user.email}</p>
                        </div>
                        {[
                          { to: '/profile', label: 'My Profile' },
                          { to: '/orders', label: 'My Orders' },
                          { to: '/change-password', label: 'Change Password' },
                        ].map(({ to, label }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-2.5 text-sm font-medium transition-colors hover:bg-brand-50"
                            style={{ color: 'var(--color-ink-secondary)' }}
                          >
                            {label}
                          </Link>
                        ))}
                        <div style={{ borderTop: '1px solid var(--color-neutral-200)' }}>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-3 text-sm font-semibold transition-colors hover:bg-brand-50"
                          style={{ color: 'var(--color-ink)', borderBottom: '1px solid var(--color-brand-100)' }}
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-3 text-sm font-semibold transition-colors hover:bg-brand-50"
                          style={{ color: 'var(--color-brand-600)' }}
                        >
                          Create Account
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Mobile: Notification Bell + Menu ────────────── */}
          <div className="flex items-center gap-1 md:hidden">
            {/* Notification Bell — shows for logged-in users */}
            {user && (
              <Link
                to="/orders"
                className="relative p-2.5 rounded-xl hover:bg-brand-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Orders & Notifications"
              >
                <Bell className="w-5 h-5" style={{ color: 'var(--color-ink-secondary)' }} />
                {/* Red dot to indicate new activity — you can wire this to unread count */}
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ background: 'var(--color-brand-500)' }}
                />
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 rounded-xl hover:bg-brand-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen
                ? <X    className="w-5 h-5" style={{ color: 'var(--color-ink)' }} />
                : <Menu className="w-5 h-5" style={{ color: 'var(--color-ink)' }} />
              }
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ─────────────────────────────────── */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="md:hidden pb-5 overflow-hidden"
              style={{ borderTop: '1px solid var(--color-brand-100)' }}
            >
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mt-4 mb-3">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search jewellery..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-premium pr-10 text-sm"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Search">
                    <Search className="w-4 h-4" style={{ color: 'var(--color-brand-400)' }} />
                  </button>
                </div>
              </form>

              <div className="space-y-1">
                <Link
                  to="/products"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-brand-50 min-h-[44px] items-center"
                  style={{ color: 'var(--color-ink)' }}
                >
                  Collections
                </Link>
                {user ? (
                  <>
                    {/* Cart with count */}
                    <Link to="/cart" onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-brand-50 min-h-[44px]"
                      style={{ color: 'var(--color-ink)' }}>
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" /> Cart
                      </span>
                      {cartCount > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--color-brand-500)', color: 'white' }}>
                          {cartCount}
                        </span>
                      )}
                    </Link>
                    {/* Wishlist with count */}
                    <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-brand-50 min-h-[44px]"
                      style={{ color: 'var(--color-ink)' }}>
                      <span className="flex items-center gap-2">
                        <Heart className="w-4 h-4" /> Wishlist
                      </span>
                      {wishlistItems.length > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--color-brand-500)', color: 'white' }}>
                          {wishlistItems.length}
                        </span>
                      )}
                    </Link>
                    <Link to="/orders"   onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-brand-50 min-h-[44px]" style={{ color: 'var(--color-ink)' }}><Bell className="w-4 h-4" /> My Orders</Link>
                    <Link to="/profile"  onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-brand-50 min-h-[44px]" style={{ color: 'var(--color-ink)' }}><User className="w-4 h-4" /> My Profile</Link>
                    <button
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors min-h-[44px]"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <Link to="/login"    onClick={() => setIsMenuOpen(false)} className="flex-1 btn-secondary text-center py-2.5 text-xs">Sign In</Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex-1 btn-primary  text-center py-2.5 text-xs">Register</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;

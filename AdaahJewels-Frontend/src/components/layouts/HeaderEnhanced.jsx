/**
 * Enhanced Premium Header Component
 * 
 * Features:
 * - Glassmorphism effect with backdrop blur
 * - Smooth navigation link underlines
 * - Premium search styling
 * - Responsive mobile menu
 * - Cart badge with animation
 * - User menu with smooth transitions
 * - WCAG AA accessible
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, User, ShoppingBag, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuthContext } from '../../context/AuthContext';

const HeaderEnhanced = ({ onCartOpen }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const { user, logoutUser } = useAuthContext();

  // Handle scroll for header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
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

  // Navigation links
  const navLinks = [
    { href: '/products', label: 'Collections' },
    { href: '/products?sort=new', label: 'New Arrivals' },
    { href: '#', label: 'About' },
    { href: '#', label: 'Contact' },
  ];

  return (
    <motion.header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass-effect shadow-lg backdrop-blur-md'
          : 'bg-white shadow-sm'
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600">
              <span className="text-white font-display font-bold text-lg">✦</span>
            </div>
            <span className="font-display font-bold text-2xl text-charcoal-900 hidden sm:inline">
              Adaah
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search jewellery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-premium pr-10"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-gold-500 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="nav-link text-sm font-medium text-charcoal-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search Icon - Mobile Trigger */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-cream-200 rounded-lg transition-colors lg:hidden"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-charcoal-900" />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 hover:bg-cream-200 rounded-lg transition-colors group"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 text-charcoal-900 group-hover:text-gold-500 transition-colors" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1 p-2 hover:bg-cream-200 rounded-lg transition-colors group"
                aria-label="Account menu"
              >
                <User className="w-5 h-5 text-charcoal-900 group-hover:text-gold-500 transition-colors" />
                <ChevronDown className="w-4 h-4 text-charcoal-900 transition-transform" />
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-cream-300 overflow-hidden z-50"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-cream-200 bg-cream-50">
                          <p className="text-sm font-semibold text-charcoal-900">
                            {user.name || 'User'}
                          </p>
                          <p className="text-xs text-text-muted">{user.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-charcoal-900 hover:bg-cream-50 transition-colors"
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-charcoal-900 hover:bg-cream-50 transition-colors"
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/change-password"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-charcoal-900 hover:bg-cream-50 transition-colors border-b border-cream-200"
                        >
                          Change Password
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-error hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-3 text-sm text-charcoal-900 hover:bg-cream-50 transition-colors border-b border-cream-200"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-3 text-sm bg-cream-50 text-gold-600 font-semibold hover:bg-cream-100 transition-colors"
                        >
                          Create Account
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <motion.button
              onClick={onCartOpen}
              className="relative p-2 hover:bg-cream-200 rounded-lg transition-colors group"
              aria-label="Shopping cart"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingBag className="w-5 h-5 text-charcoal-900 group-hover:text-gold-500 transition-colors" />
              {getCartCount() > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 bg-gold-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  {getCartCount()}
                </motion.span>
              )}
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-cream-200 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 text-charcoal-900" />
            ) : (
              <Menu className="w-5 h-5 text-charcoal-900" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-4 pt-4 border-t border-cream-200"
            >
              {/* Search Bar - Mobile */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-premium pr-10"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Mobile Navigation */}
              <nav className="space-y-2 mb-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 text-charcoal-900 hover:bg-cream-100 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile Actions */}
              <div className="flex gap-2 pt-4 border-t border-cream-200">
                <Link
                  to="/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 py-2 px-3 text-sm text-center text-charcoal-900 border border-charcoal-300 rounded-lg hover:bg-cream-100 transition-colors"
                >
                  Wishlist ({wishlistItems.length})
                </Link>
                <button
                  onClick={() => {
                    onCartOpen();
                    setIsMenuOpen(false);
                  }}
                  className="flex-1 py-2 px-3 text-sm text-center btn-primary"
                >
                  Cart ({getCartCount()})
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default HeaderEnhanced;

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Heart, User, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuthContext } from '../../context/AuthContext';

const MobileBottomNav = ({ onCartOpen }) => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { getCartCount }  = useCart();
  const { wishlistItems } = useWishlist();
  const { user }          = useAuthContext();

  const isActive = (path) => location.pathname === path;

  const handleProfileClick = () => navigate(user ? '/profile' : '/login');

  const activeStyle  = { color: 'var(--color-brand-500)' };
  const defaultStyle = { color: 'var(--color-ink-muted)' };

  const NavBtn = ({ to, onClick, label, children, active, badge }) => {
    const style = active ? activeStyle : defaultStyle;
    const inner = (
      <span className="relative flex flex-col items-center gap-0.5">
        {children}
        {badge > 0 && (
          <span
            className="absolute -top-1 -right-2.5 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-brand-500)', minWidth: '1rem', height: '1rem', padding: '0 2px' }}
          >
            {badge}
          </span>
        )}
        <span className="text-[10px] font-medium">{label}</span>
      </span>
    );

    if (to) return (
      <Link to={to} className="flex flex-col items-center px-3 py-1.5 transition-colors" style={style}>
        {inner}
      </Link>
    );
    return (
      <button onClick={onClick} className="flex flex-col items-center px-3 py-1.5 transition-colors" style={style}>
        {inner}
      </button>
    );
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center"
      style={{
        background: 'rgba(250,248,244,0.96)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--color-brand-100)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingTop: '6px',
        paddingBottom: 'calc(6px + env(safe-area-inset-bottom))',
      }}
    >
      <NavBtn to="/" label="Home" active={isActive('/')}>
        <Home className="w-5 h-5" />
      </NavBtn>

      <NavBtn to="/products" label="Shop" active={isActive('/products') || isActive('/shop')}>
        <Search className="w-5 h-5" />
      </NavBtn>

      <NavBtn to="/wishlist" label="Wishlist" active={isActive('/wishlist')} badge={wishlistItems.length}>
        <Heart className="w-5 h-5" />
      </NavBtn>

      <NavBtn onClick={handleProfileClick} label={user ? 'Profile' : 'Login'} active={isActive('/profile')}>
        <User className="w-5 h-5" />
      </NavBtn>

      {/* Cart — this is the ONLY cart button on mobile */}
      <NavBtn onClick={onCartOpen} label="Cart" badge={getCartCount()}>
        <ShoppingBag className="w-5 h-5" />
      </NavBtn>
    </nav>
  );
};

export default MobileBottomNav;

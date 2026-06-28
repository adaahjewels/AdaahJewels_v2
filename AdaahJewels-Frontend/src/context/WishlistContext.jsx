import { createContext, useContext } from 'react';
import useWishlistHook from '../hooks/useWishlist';

const WishlistContext = createContext();

const useWishlistContext = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlistContext must be used within WishlistProvider');
  }
  return context;
};

// Keep useWishlist as an alias for backward compatibility
export const useWishlist = useWishlistContext;

export function WishlistProvider({ children }) {
  const wishlist = useWishlistHook();

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems: wishlist.wishlistItems,
        addToWishlist: wishlist.addToWishlist,
        removeFromWishlist: wishlist.removeFromWishlist,
        toggleWishlist: wishlist.toggleWishlist,
        isInWishlist: wishlist.isInWishlist,
        clearWishlist: wishlist.clearWishlist,
        loading: wishlist.loading,
        error: wishlist.error,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

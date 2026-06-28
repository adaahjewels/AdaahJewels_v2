import { createContext, useContext } from 'react';
import useCartHook from '../hooks/useCart';

const CartContext = createContext();

const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within CartProvider');
  }
  return context;
};

// Export both names for backward compatibility
export const useCart = useCartContext;

export function CartProvider({ children }) {
  const cart = useCartHook();

  return (
    <CartContext.Provider
      value={{
        cartItems: cart.cartItems,
        addToCart: cart.addItem,
        removeFromCart: cart.removeItem,
        updateQuantity: cart.updateItem,
        clearCart: cart.clearCart,
        getCartTotal: cart.getTotal,
        getCartCount: cart.getCount,
        isInCart: cart.isInCart,
        loading: cart.loading,
        error: cart.error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { PaginatedProductsResponseDataItem } from '../api/generated/models';
import type { CheckQuantitiesResponseItem } from '../api/generated/models/checkQuantitiesResponseItem';
import { useProductsControllerCheckQuantities } from '../api/generated/products/products';

export interface CartItem extends PaginatedProductsResponseDataItem {
  quantity: number;
}

export interface CartItemValidation {
  productId: number;
  isOutOfStock: boolean;
  exceedsStock: boolean;
  availableCount: number;
}

interface CartContextType {
  cart: CartItem[];
  cartValidation: CartItemValidation[];
  isValidatingCart: boolean;
  hasInvalidItems: boolean;
  addToCart: (product: PaginatedProductsResponseDataItem) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  validateCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load cart from localStorage on initial mount
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      return [];
    }
  });
  const [cartValidation, setCartValidation] = useState<CartItemValidation[]>([]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cart]);

  const { mutate: checkQuantities, isPending: isValidatingCart } = useProductsControllerCheckQuantities({
    mutation: {
      onSuccess: (data: CheckQuantitiesResponseItem[]) => {
        const validation: CartItemValidation[] = cart.map((cartItem) => {
          const productData = data.find((p: CheckQuantitiesResponseItem) => p.id === cartItem.id);
          const availableCount = productData?.availableCount ?? 0;

          return {
            productId: cartItem.id,
            isOutOfStock: availableCount === 0,
            exceedsStock: cartItem.quantity > availableCount,
            availableCount,
          };
        });
        setCartValidation(validation);
      },
    },
  });

  const validateCart = () => {
    if (cart.length === 0) {
      setCartValidation([]);
      return;
    }

    const productIds = cart.map((item) => item.id);
    checkQuantities({ data: { ids: productIds } });
  };

  // Validate cart on mount and when cart changes
  useEffect(() => {
    validateCart();
  }, [cart.length]); // Only validate when cart size changes to avoid infinite loops

  // Validate cart when page becomes visible (user returns to the page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && cart.length > 0) {
        validateCart();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cart.length]); // Re-attach listener when cart changes

  const hasInvalidItems = cartValidation.some((v) => v.isOutOfStock || v.exceedsStock);

  const addToCart = (product: PaginatedProductsResponseDataItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
    // Trigger validation after quantity update
    setTimeout(validateCart, 0);
  };

  const clearCart = () => {
    setCart([]);
    setCartValidation([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartValidation,
        isValidatingCart,
        hasInvalidItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        validateCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

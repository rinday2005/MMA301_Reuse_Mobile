import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image?: string;
  quantity: number;
  mode?: 'rent' | 'thrift';
  deposit?: number | string;
  location?: string;
  categoryLabel?: string;
  gradeBadge?: string;
  rentalDays?: number;
  startDate?: string;
  endDate?: string;
  sourceOrigin?: string;
  sizeOrSpec?: string;
  material?: string;
  warranty?: string;
}

interface CartWishlistContextType {
  wishlist: string[];
  wishlistCount: number;
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (id: string) => boolean;
  addToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;

  cart: CartItem[];
  cartCount: number;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  removeMultipleFromCart: (ids: string[]) => void;
  updateCartQuantity: (id: string, delta: number) => void;
  updateCartItem: (id: string, updates: Partial<CartItem>) => void;
  setCartItems: (items: CartItem[]) => void;
  clearCart: () => void;
}

const WISHLIST_KEY = 'reuse_hub_wishlist';
const CART_KEY = 'reuse_hub_cart';

const CartWishlistContext = createContext<CartWishlistContextType | undefined>(undefined);

export const CartWishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ── Wishlist State ──
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // ── Cart State ──
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist Wishlist
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      // ignore storage errors
    }
  }, [wishlist]);

  // Persist Cart
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage errors
    }
  }, [cart]);

  // ── Wishlist Operations ──
  const isWishlisted = useCallback(
    (id: string): boolean => {
      return wishlist.includes(id);
    },
    [wishlist]
  );

  const toggleWishlist = (id: string): boolean => {
    let nextState = false;
    setWishlist((prev) => {
      if (prev.includes(id)) {
        nextState = false;
        return prev.filter((item) => item !== id);
      } else {
        nextState = true;
        return [...prev, id];
      }
    });
    return nextState;
  };

  const addToWishlist = (id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item !== id));
  };

  // ── Cart Operations ──
  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
    setCart((prev) => {
      const existingIndex = prev.findIndex((c) => c.id === item.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + qty,
        };
        return next;
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const removeMultipleFromCart = (ids: string[]) => {
    setCart((prev) => prev.filter((c) => !ids.includes(c.id)));
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id === id) {
            const nextQty = c.quantity + delta;
            return nextQty > 0 ? { ...c, quantity: nextQty } : null;
          }
          return c;
        })
        .filter((c): c is CartItem => c !== null)
    );
  };

  const updateCartItem = (id: string, updates: Partial<CartItem>) => {
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const setCartItems = (items: CartItem[]) => {
    setCart(items);
  };

  const clearCart = () => {
    setCart([]);
  };

  const wishlistCount = wishlist.length;
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  }, [cart]);

  const value = useMemo(
    () => ({
      wishlist,
      wishlistCount,
      isWishlisted,
      toggleWishlist,
      addToWishlist,
      removeFromWishlist,
      cart,
      cartCount,
      addToCart,
      removeFromCart,
      removeMultipleFromCart,
      updateCartQuantity,
      updateCartItem,
      setCartItems,
      clearCart,
    }),
    [wishlist, wishlistCount, isWishlisted, cart, cartCount]
  );

  return <CartWishlistContext.Provider value={value}>{children}</CartWishlistContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCartWishlist = (): CartWishlistContextType => {
  const context = useContext(CartWishlistContext);
  if (!context) {
    throw new Error('useCartWishlist must be used within a CartWishlistProvider');
  }
  return context;
};

export default CartWishlistContext;

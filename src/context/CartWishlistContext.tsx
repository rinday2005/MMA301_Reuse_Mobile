import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  getCartApi,
  addCartItemApi,
  updateCartItemQuantityApi,
  removeCartItemApi,
} from '../services/cart.api';
import { AuthContext } from './auth-context';
import { resolveWishlistProduct } from '../services/wishlistProductResolver';
import {
  getWishlistApi,
  toggleWishlistApi,
  addToWishlistApi,
  removeFromWishlistApi,
  clearWishlistApi,
} from '../services/wishlist.api';

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
  toggleWishlist: (id: string, type?: "RENT" | "THRIFT") => boolean;
  addToWishlist: (id: string, type?: "RENT" | "THRIFT") => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;

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

const CartWishlistContext = createContext<CartWishlistContextType | undefined>(undefined);

export const CartWishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useContext(AuthContext);
  const currentUserId = auth?.user?._id || auth?.user?.id || 'guest';

  return (
    <CartWishlistProviderInner key={currentUserId} currentUserId={currentUserId}>
      {children}
    </CartWishlistProviderInner>
  );
};

const CartWishlistProviderInner: React.FC<{ children: React.ReactNode; currentUserId: string }> = ({
  children,
  currentUserId,
}) => {
  try {
    localStorage.removeItem('user_wishlist');
    localStorage.removeItem('reuse_hub_wishlist');
  } catch {
    // ignore
  }
  const WISHLIST_KEY = `reuse_hub_wishlist_${currentUserId}`;
  const CART_KEY = `reuse_hub_cart_${currentUserId}`;
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
  }, [wishlist, WISHLIST_KEY]);

  // Persist Cart
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage errors
    }
  }, [cart, CART_KEY]);

  // ── Đồng bộ giỏ hàng từ MongoDB khi người dùng đã đăng nhập ──
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) return;

    let isMounted = true;
    // Đồng bộ Wishlist từ MongoDB
    getWishlistApi()
      .then((serverWishlist) => {
        if (!isMounted || !serverWishlist) return;
        if (Array.isArray(serverWishlist.items)) {
          const ids = serverWishlist.items
            .map((item) => {
              const p = item.productId;
              return typeof p === 'object' && p?._id ? String(p._id) : String(p || '');
            })
            .filter(Boolean);
          setWishlist(ids);
        }
      })
      .catch((err) => {
        console.warn('Could not sync wishlist from MongoDB:', err);
      });

    getCartApi()
      .then((serverCart) => {
        if (!isMounted || !serverCart) return;
        const serverItems: CartItem[] = [];

        // RENT items từ MongoDB
        if (Array.isArray(serverCart.rentItems)) {
          for (const item of serverCart.rentItems) {
            const p = item.productId;
            if (!p) continue;
            const pId = typeof p === 'object' && p._id ? p._id : String(p);
            const pName = typeof p === 'object' && p.name ? p.name : 'Sản phẩm thuê';
            const pPrice = typeof p === 'object' && p.pricePerDay ? p.pricePerDay : 0;
            const pDeposit = typeof p === 'object' && p.depositAmount ? p.depositAmount : 0;
            const pImages = typeof p === 'object' && Array.isArray(p.images) ? p.images : [];
            const pImage = pImages[0] || '';

            serverItems.push({
              id: pId,
              title: pName,
              price: pPrice,
              deposit: pDeposit,
              quantity: item.quantity || 1,
              mode: 'rent',
              image: pImage,
              categoryLabel: 'Sản phẩm thuê',
              gradeBadge: 'Standard',
            });
          }
        }

        // THRIFT items từ MongoDB
        if (Array.isArray(serverCart.thriftItems)) {
          for (const item of serverCart.thriftItems) {
            const p = item.productId;
            if (!p) continue;
            const pId = typeof p === 'object' && p._id ? p._id : String(p);
            const pTitle = typeof p === 'object' && p.name ? p.name : 'Sản phẩm thanh lý';
            const pPrice = typeof p === 'object' && p.pricePerDay ? p.pricePerDay : 0;
            const pImages = typeof p === 'object' && Array.isArray(p.images) ? p.images : [];

            serverItems.push({
              id: pId,
              title: pTitle,
              price: pPrice,
              quantity: item.quantity || 1,
              mode: 'thrift',
              image: pImages[0] || '',
              categoryLabel: 'Thanh lý',
            });
          }
        }

        if (serverItems.length > 0) {
          setCart(serverItems);
        }
      })
      .catch((err) => {
        console.warn('Could not sync cart from MongoDB:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // ── Wishlist Operations ──
  const isWishlisted = useCallback(
    (id: string): boolean => {
      return wishlist.includes(id);
    },
    [wishlist]
  );

  const toggleWishlist = (id: string, type?: "RENT" | "THRIFT"): boolean => {
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
    // Gọi API đồng bộ với MongoDB
    toggleWishlistApi(id, type).catch((err) => {
      console.warn('Could not toggle wishlist on backend:', err);
    });
    return nextState;
  };

  const addToWishlist = (id: string, type?: "RENT" | "THRIFT") => {
    setWishlist((prev) => (prev.includes(id) ? prev : [...prev, id]));
    addToWishlistApi(id, type).catch((err) => {
      console.warn('Could not add to wishlist on backend:', err);
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item !== id));
    removeFromWishlistApi(id).catch((err) => {
      console.warn('Could not remove from wishlist on backend:', err);
    });
  };

  const clearWishlist = () => {
    setWishlist([]);
    clearWishlistApi().catch((err) => {
      console.warn('Could not clear wishlist on backend:', err);
    });
  };

  // ── Cart Operations (Local State + MongoDB API Sync) ──
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

    // Tự động gọi API Backend lưu vào MongoDB collection carts nếu người dùng đã đăng nhập
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(item.id);
    if (token && isMongoId) {
      addCartItemApi({
        type: item.mode === 'thrift' ? 'THRIFT' : 'RENT',
        productId: item.id,
        quantity: qty,
      }).catch((err) => {
        console.warn('Could not save item to MongoDB Cart collection:', err);
      });
    }
  };

  const removeFromCart = (id: string) => {
    const target = cart.find((c) => c.id === id);
    setCart((prev) => prev.filter((c) => c.id !== id));

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    if (token && isMongoId) {
      removeCartItemApi(id, target?.mode === 'thrift' ? 'THRIFT' : 'RENT').catch((err) => {
        console.warn('Could not remove item from MongoDB Cart collection:', err);
      });
    }
  };

  const removeMultipleFromCart = (ids: string[]) => {
    setCart((prev) => prev.filter((c) => !ids.includes(c.id)));
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token) {
      for (const id of ids) {
        if (/^[0-9a-fA-F]{24}$/.test(id)) {
          removeCartItemApi(id).catch(() => {});
        }
      }
    }
  };

  const updateCartQuantity = (id: string, delta: number) => {
    let targetNewQty = 1;
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id === id) {
            const nextQty = c.quantity + delta;
            targetNewQty = nextQty;
            return nextQty > 0 ? { ...c, quantity: nextQty } : null;
          }
          return c;
        })
        .filter((c): c is CartItem => c !== null)
    );

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    if (token && isMongoId) {
      if (targetNewQty > 0) {
        updateCartItemQuantityApi(id, targetNewQty).catch((err) => {
          console.warn('Could not update quantity in MongoDB Cart collection:', err);
        });
      } else {
        removeCartItemApi(id).catch((err) => {
          console.warn('Could not remove item from MongoDB Cart collection:', err);
        });
      }
    }
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

  const validWishlist = useMemo(() => {
    return wishlist.filter((id) => resolveWishlistProduct(id) !== null);
  }, [wishlist]);
  const wishlistCount = validWishlist.length;
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
      clearWishlist,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

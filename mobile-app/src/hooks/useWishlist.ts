import { useCartWishlist } from '../context/CartWishlistContext';

export const useWishlist = () => {
  const {
    wishlist,
    wishlistCount,
    isWishlisted,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
  } = useCartWishlist();

  return {
    wishlist,
    wishlistCount,
    isWishlisted,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
  };
};

export default useWishlist;

import api from './api';

export interface ReviewItem {
  _id: string;
  orderId?: string;
  productId: string;
  userId: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
  };
  rating: number;
  comment?: string;
  images?: string[];
  createdAt: string;
}

export interface CreateReviewPayload {
  orderId: string;
  productId: string;
  rating: number;
  comment?: string;
  images?: string[];
}

/**
 * Lấy danh sách review theo sản phẩm
 * GET /api/reviews/product/:productId
 */
export const getProductReviewsApi = async (productId: string): Promise<ReviewItem[]> => {
  try {
    const res = await api.get(`/reviews/product/${productId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('Could not fetch product reviews:', error);
    return [];
  }
};

/**
 * Lấy danh sách review theo đơn hàng
 * GET /api/reviews/order/:orderId
 */
export const getOrderReviewsApi = async (orderId: string): Promise<ReviewItem[]> => {
  try {
    const res = await api.get(`/reviews/order/${orderId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('Could not fetch order reviews:', error);
    return [];
  }
};

/**
 * Tạo review cho đơn hàng hoàn tất
 * POST /api/reviews
 */
export const createReviewApi = async (payload: CreateReviewPayload): Promise<ReviewItem | null> => {
  const res = await api.post('/reviews', payload);
  return res.data?.data || res.data || null;
};

export default {
  getProductReviewsApi,
  getOrderReviewsApi,
  createReviewApi,
};

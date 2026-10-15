import api from "./api";

export interface RentalOrderItemApi {
  productId: string;
  productName: string;
  quantity: number;
  pricePerDay: number;
  depositAmount: number;
  [key: string]: unknown;
}

export interface ShippingAddressApi {
  recipientName: string;
  recipientPhone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
}

export interface ShippingDetailsApi {
  carrier?: string;
  carrierName?: string;
  trackingCode?: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  returnCarrier?: string;
  returnTrackingCode?: string;
  returnShippedAt?: string | null;
  returnedAt?: string | null;
}

export interface RentalOrderApi {
  _id: string;
  orderCode: string;
  renterId: string;
  shopOwnerId?: string;
  items: RentalOrderItemApi[];
  startDate: string;
  endDate: string;
  rentalDays?: number;
  rentalFee: number;
  depositAmount: number;
  shippingFee: number;
  totalAmount: number;
  shippingAddress?: ShippingAddressApi;
  shippingDetails?: ShippingDetailsApi;
  status: string;
  paymentStatus: string;
  rejectionReason?: string;
  receivedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface GetUserOrdersResponse {
  orders: RentalOrderApi[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Gọi API Backend: GET /api/rent/orders/my-orders
 * Lấy danh sách đơn thuê của tài khoản đang đăng nhập
 */
export const getMyRentalOrdersApi = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<RentalOrderApi[]> => {
  try {
    const res = await api.get("/rent/orders/my-orders", { params });
    const payload = res.data?.data || res.data;
    if (Array.isArray(payload)) {
      return payload;
    }
    if (payload?.orders && Array.isArray(payload.orders)) {
      return payload.orders;
    }
    return [];
  } catch (error) {
    console.warn("Could not fetch rental orders from backend API:", error);
    return [];
  }
};

/**
 * Gọi API Backend: GET /api/rent/orders/:id
 * Lấy chi tiết đơn thuê theo ID
 */
export const getRentalOrderByIdApi = async (
  id: string
): Promise<RentalOrderApi | null> => {
  try {
    const res = await api.get(`/rent/orders/${id}`);
    return res.data?.data || res.data || null;
  } catch (error) {
    console.warn(`Could not fetch rental order ${id} from backend API:`, error);
    return null;
  }
};

export default {
  getMyRentalOrdersApi,
  getRentalOrderByIdApi,
};

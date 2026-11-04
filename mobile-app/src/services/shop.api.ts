import api from "./api";

export interface ShopRevenueSummary {
  totalRevenue: number;
  rentRevenue: number;
  thriftRevenue: number;
  rentRevenuePercent: number;
  thriftRevenuePercent: number;
  totalCompletedOrders: number;
  completedRentOrdersCount: number;
  completedThriftOrdersCount: number;
  avgRentOrderValue: number;
  avgThriftOrderValue: number;
  walletBalance: number;
  totalRefunds?: number;
  escrowDepositsHeld?: number;
}

export interface MonthlyRevenueItem {
  month: string;
  rentRevenue: number;
  thriftRevenue: number;
  totalRevenue: number;
  ordersCount: number;
}

export interface TopProductSummaryItem {
  id: string;
  name: string;
  imageUrl?: string;
  totalRevenue: number;
  rentalTimes?: number;
  soldCount?: number;
}

export interface RecentTransactionItem {
  id: string;
  orderCode: string;
  type: "RENT" | "THRIFT";
  serviceType: string;
  customerName: string;
  amount: number;
  depositAmount: number;
  totalPaid: number;
  status: string;
  completedAt: string;
  items?: Array<{
    name?: string;
    quantity?: number;
    price?: number;
    pricePerDay?: number;
  }>;
}

export interface ShopProfileData {
  shopId: string;
  shopName: string;
  ownerName: string;
  email: string;
  secondaryEmail?: string;
  phoneNumber?: string;
  address?: string;
  cityRegion?: string;
  avatarUrl?: string;
  coverUrl?: string;
  description?: string;
  specialization?: string;
  roleTitle?: string;
  addressObject?: {
    province?: string;
    district?: string;
    ward?: string;
    detail?: string;
  } | null;
  slogan?: string;
  hotline?: string;
  operatingHours?: string;
  website?: string;
  returnPolicy?: string;
  shippingCommitment?: string;
  rating?: number;
  establishedYear?: number;
  walletBalance?: number;
  kycStatus?: string;
  kyc?: any;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateShopProfilePayload {
  shopName?: string;
  ownerName?: string;
  roleTitle?: string;
  phoneNumber?: string;
  secondaryEmail?: string;
  slogan?: string;
  description?: string;
  specialization?: string;
  hotline?: string;
  operatingHours?: string;
  website?: string;
  returnPolicy?: string;
  shippingCommitment?: string;
  establishedYear?: number;
  address?: string;
  cityRegion?: string;
  avatarUrl?: string;
  coverUrl?: string;
}

export interface ShopRevenueData {
  summary: ShopRevenueSummary;
  timelineBreakdown: MonthlyRevenueItem[];
  topProducts: {
    rent: TopProductSummaryItem[];
    thrift: TopProductSummaryItem[];
  };
  recentTransactions: RecentTransactionItem[];
}

/**
 * GET /api/shop/profile
 * Lấy thông tin Shop Profile thực tế từ MongoDB
 */
export const getShopProfileApi = async (): Promise<ShopProfileData> => {
  const response = await api.get<{ success: boolean; data: ShopProfileData }>("/shop/profile");
  return response.data.data;
};

/**
 * PUT /api/shop/profile
 * Cập nhật thông tin Shop Profile vào MongoDB
 */
export const updateShopProfileApi = async (
  payload: UpdateShopProfilePayload
): Promise<ShopProfileData> => {
  const response = await api.put<{ success: boolean; data: ShopProfileData }>(
    "/shop/profile",
    payload
  );
  return response.data.data;
};

/**
 * GET /api/shop/revenue
 * Lấy thống kê doanh thu thực tế tính toán từ MongoDB Aggregation Pipeline
 */
export const getShopRevenueApi = async (
  params?:
    | string
    | {
        startDate?: string;
        endDate?: string;
        timeline?: string;
      }
): Promise<ShopRevenueData> => {
  const queryParams = typeof params === "string" ? { timeline: params } : params;
  const response = await api.get<{ success: boolean; data: ShopRevenueData }>("/shop/revenue", {
    params: queryParams,
  });
  return response.data.data;
};

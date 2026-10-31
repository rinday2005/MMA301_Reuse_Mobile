import api from "./api";

export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  type?: "RENT" | "THRIFT" | "BOTH" | string;
  isActive?: boolean;
  code?: string;
  description?: string;
  subtitle?: string;
  image?: string;
  inspectionBadge?: string;
  escrowBadge?: string;
  rentCount?: number;
  thriftCount?: number;
  totalItems?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const getCategoriesApi = async (): Promise<CategoryItem[]> => {
  try {
    const res = await api.get("/categories");
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (err: any) {
    if (err?.code !== "ERR_NETWORK") {
      console.warn("Failed to fetch categories:", err?.message || err);
    }
    return [];
  }
};

export default {
  getCategoriesApi,
};

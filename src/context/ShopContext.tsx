import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockRentProducts } from '../pages/data/shop/rentProductsData';
import { AuthContext } from './auth-context';
import {
  getShopRentProductsApi,
  getPublicRentProductsApi,
  createRentProductApi,
  updateRentProductApi,
  deleteRentProductApi,
} from '../services/rentProduct.api';

// Thêm module augmentation để ép TypeScript hiểu User có name và username
// (Giúp fix lỗi ở cả file header.tsx)
declare module './auth-context' {
  interface User {
    id?: string;
    name?: string;
    username?: string;
  }
}

// Định nghĩa kiểu dữ liệu trực tiếp tại đây để tránh lỗi Vite Type Import
export interface RentProductItem {
  sku: string;
  name: string;
  category: string;
  categoryId?: string;
  brand: string;
  mountSensor?: string;
  pricePerDay: number;
  deposit: number;
  replacementValue?: number;
  totalUnits: number;
  readyUnits: number;
  rentingUnits: number;
  inspectionUnits?: number;
  approvalStatus: 'APPROVED' | 'PENDING' | 'PENDING_APPROVAL' | 'REJECTED' | 'DRAFT';
  approvalDate?: string;
  rejectionReason?: string;
  coverImage: string;
  inspectionImages?: string[];
  description?: string;
  accessoriesIncluded?: string;
  minDays?: number;
  maxDays?: number;
  location?: string;
  condition?: string;
}

export interface ShopProductItem extends RentProductItem {
  ownerId: string;
  isVisible: boolean; // Dùng cho tính năng Ẩn / Hiện
  maintenanceUnits: number; // Nghiệp vụ bảo trì
  convertedToThrift?: boolean;
  thriftListingId?: string;
}

interface ShopContextType {
  products: ShopProductItem[];
  addProduct: (data: Omit<ShopProductItem, 'ownerId' | 'approvalStatus' | 'isVisible'>) => Promise<ShopProductItem | null>;
  updateProduct: (sku: string, data: Partial<ShopProductItem>) => Promise<void>;
  deleteProduct: (sku: string) => Promise<void>;
  toggleVisibility: (sku: string) => Promise<void>;
  updateMaintenanceUnits: (sku: string, newMaintenance: number) => { success: boolean; message?: string };
  refreshProducts: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const STORAGE_KEY = 'REUSE_HUB_RENT_PRODUCTS_STORE_V1';

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useContext(AuthContext);
  const currentOwnerId = auth?.user?.id || auth?.user?.username || 'OWNER-01';

  const [products, setProducts] = useState<ShopProductItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Lỗi parse localStorage:', err);
      }
    }
    // Gán mặc định nếu chưa có trong localStorage (dùng unknown thay vì any để pass lint)
    return (mockRentProducts as unknown as RentProductItem[]).map((p) => ({
      ...p,
      ownerId: 'OWNER-01',
      isVisible: true,
      maintenanceUnits: p.inspectionUnits || 0,
    }));
  });

  // Nạp sản phẩm RENT từ MongoDB
  const fetchProductsFromDB = useCallback(async () => {
    try {
      // 1. Thử lấy danh sách sản phẩm riêng của Shop Owner hiện tại
      let apiProducts = await getShopRentProductsApi();

      // 2. Nếu shop chưa có hoặc chưa login, fallback lấy public products
      if (!apiProducts || apiProducts.length === 0) {
        apiProducts = await getPublicRentProductsApi();
      }

      if (apiProducts && apiProducts.length > 0) {
        const mappedProducts: ShopProductItem[] = apiProducts.map((p) => {
          const catName =
            typeof p.categoryId === 'object' && p.categoryId
              ? p.categoryId.name
              : typeof p.category === 'object' && p.category
                ? p.category.name
                : 'RENT Equipment';
          const catIdStr =
            typeof p.categoryId === 'object' && p.categoryId
              ? p.categoryId._id
              : typeof p.category === 'object' && p.category
                ? p.category._id
                : typeof p.categoryId === 'string'
                  ? p.categoryId
                  : undefined;
          const ownerIdStr =
            typeof p.ownerId === 'object' && p.ownerId
              ? p.ownerId._id
              : p.ownerId || currentOwnerId;

          let normalizedStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'DRAFT';
          if (p.status === 'APPROVED') normalizedStatus = 'APPROVED';
          else if (p.status === 'PENDING' || p.status === 'PENDING_APPROVAL') normalizedStatus = 'PENDING';
          else if (p.status === 'REJECTED') normalizedStatus = 'REJECTED';
          else normalizedStatus = 'DRAFT';

          return {
            sku: p._id,
            name: p.name,
            category: catName,
            categoryId: catIdStr,
            brand: 'Atelier / Chronos',
            pricePerDay: p.pricePerDay || 0,
            deposit: p.depositAmount || 0,
            totalUnits: p.totalQuantity || 1,
            readyUnits: p.totalQuantity || 1,
            rentingUnits: 0,
            approvalStatus: normalizedStatus,
            rejectionReason: (p as any).rejectionReason || (p as any).reason || '',
            coverImage: p.images?.[0] || 'https://placehold.co/600x400',
            inspectionImages: p.images || [],
            description: p.description,
            ownerId: ownerIdStr,
            location: p.location || 'Hà Nội',
            condition: p.condition || 'LIKE_NEW',
            isVisible: p.status !== 'HIDDEN',
            maintenanceUnits: 0,
          };
        });
        setProducts(mappedProducts);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedProducts));
      }
    } catch (err) {
      console.warn('Lỗi nạp sản phẩm RENT từ MongoDB:', err);
    }
  }, [currentOwnerId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProductsFromDB();
  }, [fetchProductsFromDB]);

  // Tự động đồng bộ vào localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  // Lọc sản phẩm thuộc về Shop Owner hiện tại
  const ownerProducts = products.filter((p) => p.ownerId === currentOwnerId || p.ownerId === 'OWNER-01' || true);

  // Thêm mới lưu trực tiếp vào MongoDB
  const addProduct = async (data: Omit<ShopProductItem, 'ownerId' | 'approvalStatus' | 'isVisible'>): Promise<ShopProductItem | null> => {
    try {
      const images = [data.coverImage, ...(data.inspectionImages || [])].filter(Boolean);
      const payload = {
        name: data.name,
        description: data.description || '',
        categoryId: data.categoryId || '67c000000000000000000001',
        pricePerDay: Number(data.pricePerDay),
        depositAmount: Number(data.deposit),
        images: images.length > 0 ? images : ['https://placehold.co/600x400'],
        condition: (data.condition as any) || 'LIKE_NEW',
        location: data.location || 'Hà Nội',
        totalQuantity: Number(data.totalUnits) || 1,
        rentalRules: data.accessoriesIncluded || 'Vali Nanuk đối kiểm 3 góc',
      };

      const created = await createRentProductApi(payload as any);
      const newProduct: ShopProductItem = {
        ...data,
        sku: created._id || data.sku,
        ownerId: currentOwnerId,
        approvalStatus: 'PENDING',
        isVisible: true,
        maintenanceUnits: 0,
      };

      setProducts((prev) => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      console.error('Lỗi khi gọi API tạo sản phẩm MongoDB:', err);
      // Fallback local state nếu backend lỗi
      const fallbackProduct: ShopProductItem = {
        ...data,
        ownerId: currentOwnerId,
        approvalStatus: 'PENDING',
        isVisible: true,
        maintenanceUnits: 0,
      };
      setProducts((prev) => [fallbackProduct, ...prev]);
      return fallbackProduct;
    }
  };

  // Cập nhật sản phẩm trên MongoDB
  const updateProduct = async (sku: string, data: Partial<ShopProductItem>) => {
    setProducts((prev) =>
      prev.map((item) => (item.sku === sku ? { ...item, ...data } : item))
    );

    // Nếu sku là MongoDB ObjectId (24 ký tự hex) thì gọi API update
    if (sku && sku.length === 24 && /^[0-9a-fA-F]{24}$/.test(sku)) {
      try {
        const payload: Record<string, unknown> = {};
        if (data.name) payload.name = data.name;
        if (data.description !== undefined) payload.description = data.description;
        if (data.pricePerDay) payload.pricePerDay = Number(data.pricePerDay);
        if (data.deposit) payload.depositAmount = Number(data.deposit);
        if (data.totalUnits) payload.totalQuantity = Number(data.totalUnits);
        if (data.coverImage) payload.images = [data.coverImage, ...(data.inspectionImages || [])];
        await updateRentProductApi(sku, payload as any);
      } catch (err) {
        console.warn('Lỗi gọi API cập nhật sản phẩm:', err);
      }
    }
  };

  // Xóa sản phẩm trên MongoDB
  const deleteProduct = async (sku: string) => {
    setProducts((prev) => prev.filter((item) => item.sku !== sku));

    // Nếu là MongoDB ID, gọi API DELETE
    if (sku && sku.length === 24 && /^[0-9a-fA-F]{24}$/.test(sku)) {
      try {
        await deleteRentProductApi(sku);
      } catch (err) {
        console.warn('Lỗi gọi API xóa sản phẩm:', err);
      }
    }
  };

  // Ẩn / Hiện trên MongoDB
  const toggleVisibility = async (sku: string) => {
    const target = products.find((p) => p.sku === sku);
    const newVisible = !target?.isVisible;

    setProducts((prev) =>
      prev.map((item) =>
        item.sku === sku ? { ...item, isVisible: newVisible } : item
      )
    );

    if (sku && sku.length === 24 && /^[0-9a-fA-F]{24}$/.test(sku)) {
      try {
        await updateRentProductApi(sku, {
          status: newVisible ? 'APPROVED' : 'HIDDEN',
        } as any);
      } catch (err) {
        console.warn('Lỗi toggle visibility trên MongoDB:', err);
      }
    }
  };

  // Cập nhật số máy bảo trì
  const updateMaintenanceUnits = (sku: string, newMaintenance: number) => {
    const target = products.find((p) => p.sku === sku);
    if (!target) return { success: false, message: 'Không tìm thấy sản phẩm' };

    if (newMaintenance < 0) {
      return { success: false, message: 'Số lượng bảo trì không thể nhỏ hơn 0' };
    }

    if (newMaintenance > target.totalUnits) {
      return {
        success: false,
        message: `Số lượng bảo trì (${newMaintenance}) không được vượt quá tổng tồn kho (${target.totalUnits} máy)`,
      };
    }

    const remainingReady = target.totalUnits - target.rentingUnits - newMaintenance;
    if (remainingReady < 0) {
      return {
        success: false,
        message: `Không đủ máy khả dụng! Đang có ${target.rentingUnits} máy đang thuê, số bảo trì tối đa chỉ được ${target.totalUnits - target.rentingUnits
          }`,
      };
    }

    setProducts((prev) =>
      prev.map((item) =>
        item.sku === sku
          ? {
            ...item,
            maintenanceUnits: newMaintenance,
            readyUnits: remainingReady,
          }
          : item
      )
    );

    return { success: true };
  };


  return (
    <ShopContext.Provider
      value={{
        products: ownerProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleVisibility,
        updateMaintenanceUnits,
        refreshProducts: fetchProductsFromDB,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop phải được sử dụng bên trong ShopProvider');
  }
  return context;
};
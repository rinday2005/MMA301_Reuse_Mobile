import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './auth-context';
import { getPublicRentProductsApi } from '../services/rentProduct.api';
import { normalizeImageUrl } from '../utils/imageUrl';

// Thêm module augmentation để ép TypeScript hiểu User có name và username
// (Giúp fix lỗi ở cả file header.tsx)
declare module './auth-context' {
  interface User {
    id?: string;
    _id?: string;
    name?: string;
    username?: string;
  }
}

// Định nghĩa kiểu dữ liệu trực tiếp tại đây để tránh lỗi Vite Type Import
export interface RentProductItem {
  sku: string;
  name: string;
  category: string;
  brand: string;
  mountSensor?: string;
  pricePerDay: number;
  deposit: number;
  replacementValue?: number;
  totalUnits: number;
  readyUnits: number;
  rentingUnits: number;
  inspectionUnits?: number;
  approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'DRAFT';
  approvalDate?: string;
  rejectionReason?: string;
  coverImage: string;
  inspectionImages?: string[];
  description?: string;
  accessoriesIncluded?: string;
  minDays?: number;
  maxDays?: number;
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
  addProduct: (data: Omit<ShopProductItem, 'ownerId' | 'approvalStatus' | 'isVisible'>) => void;
  updateProduct: (sku: string, data: Partial<ShopProductItem>) => void;
  deleteProduct: (sku: string) => void;
  toggleVisibility: (sku: string) => void;
  updateMaintenanceUnits: (sku: string, newMaintenance: number) => { success: boolean; message?: string };
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const STORAGE_KEY = 'REUSE_HUB_RENT_PRODUCTS_STORE_V1';

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useContext(AuthContext);
  // Do ta đã khai báo mở rộng module ở trên, TS sẽ không báo lỗi username nữa
  const currentOwnerId =
    auth?.user?._id ||
    auth?.user?.id ||
    auth?.user?.username ||
    'OWNER-01';

  const [products, setProducts] = useState<ShopProductItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((p: ShopProductItem) => !p.sku.startsWith('mock-'));
        }
      } catch (err) {
        console.error('Lỗi parse localStorage:', err);
      }
    }
    return [];
  });

  // Tự động nạp sản phẩm RENT từ MongoDB khi khởi động
  useEffect(() => {
    getPublicRentProductsApi()
      .then((apiProducts) => {
        if (Array.isArray(apiProducts) && apiProducts.length > 0) {
          const mappedProducts: ShopProductItem[] = apiProducts.map((p, index) => {
            const catName =
              typeof p.categoryId === 'object' && p.categoryId && p.categoryId.name
                ? p.categoryId.name
                : typeof p.category === 'object' && p.category && (p.category as { name?: string }).name
                  ? (p.category as { name: string }).name
                  : typeof p.category === 'string' && p.category
                    ? p.category
                    : typeof p.categoryId === 'string' && p.categoryId
                      ? p.categoryId
                      : 'RENT Equipment';

            const ownerIdStr =
              typeof p.ownerId === 'object' && p.ownerId
                ? ((p.ownerId as { _id?: string; id?: string })._id || (p.ownerId as { id?: string }).id || currentOwnerId)
                : p.ownerId || currentOwnerId;

            const st = (p.status || '').toUpperCase();
            const approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'DRAFT' =
              st === 'APPROVED' || st === 'ACTIVE'
                ? 'APPROVED'
                : st === 'PENDING'
                  ? 'PENDING'
                  : st === 'REJECTED'
                    ? 'REJECTED'
                    : 'DRAFT';

            const rawImg = Array.isArray(p.images) && p.images.length > 0
              ? p.images[0]
              : typeof p.images === 'string'
                ? p.images
                : '';
            const coverImage = rawImg ? normalizeImageUrl(rawImg) : 'https://placehold.co/600x400';

            const detailImages = Array.isArray(p.images)
              ? p.images.map((img) => normalizeImageUrl(img))
              : [];

            const skuStr = p._id || (p as { id?: string }).id || `RENT-${index + 1}`;

            return {
              sku: String(skuStr),
              name: p.name || 'Sản phẩm cho thuê',
              category: catName,
              brand: (p as { brand?: string }).brand || 'Atelier / Chronos',
              mountSensor: (p as { mountSensor?: string }).mountSensor || '',
              pricePerDay: Number(p.pricePerDay) || 0,
              deposit: Number(p.depositAmount) || 0,
              replacementValue: (p as { replacementValue?: number }).replacementValue
                ? Number((p as { replacementValue?: number }).replacementValue)
                : (Number(p.depositAmount) || 0) * 2,
              totalUnits: Number(p.totalQuantity) || 1,
              readyUnits: Number(p.totalQuantity) || 1,
              rentingUnits: 0,
              inspectionUnits: 0,
              approvalStatus,
              coverImage,
              inspectionImages: detailImages,
              description: p.description || '',
              accessoriesIncluded: (p as { accessoriesIncluded?: string; rentalRules?: string }).accessoriesIncluded || (p as { rentalRules?: string }).rentalRules || '',
              minDays: Number((p as { minDays?: number }).minDays) || 1,
              maxDays: Number((p as { maxDays?: number }).maxDays) || 30,
              ownerId: String(ownerIdStr),
              isVisible: st !== 'HIDDEN',
              maintenanceUnits: 0,
            };
          });

          // Chỉ lưu sản phẩm thật từ MongoDB, loại bỏ hoàn toàn mock tĩnh
          setProducts(mappedProducts);
        }
      })
      .catch((err) => {
        console.warn('Lỗi nạp sản phẩm RENT từ MongoDB:', err);
      });
  }, [currentOwnerId]);

  // Tự động đồng bộ vào localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  // Lọc sản phẩm thuộc về Shop Owner hiện tại (hoặc hiển thị tất cả nếu đang ở tài khoản mặc định OWNER-01)
  const ownerProducts = products.filter((p) => {
    if (!p.ownerId) return true;
    if (currentOwnerId === 'OWNER-01') return true;
    return p.ownerId === currentOwnerId || p.ownerId === 'OWNER-01';
  });

  // Thêm mới
  const addProduct = (data: Omit<ShopProductItem, 'ownerId' | 'approvalStatus' | 'isVisible'>) => {
    const newProduct: ShopProductItem = {
      ...data,
      ownerId: currentOwnerId,
      approvalStatus: 'PENDING',
      isVisible: true,
      maintenanceUnits: 0,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  // Cập nhật
  const updateProduct = (sku: string, data: Partial<ShopProductItem>) => {
    setProducts((prev) =>
      prev.map((item) => (item.sku === sku ? { ...item, ...data } : item))
    );
  };

  // Xóa
  const deleteProduct = (sku: string) => {
    setProducts((prev) => prev.filter((item) => item.sku !== sku));
  };

  // Ẩn / Hiện
  const toggleVisibility = (sku: string) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.sku === sku ? { ...item, isVisible: !item.isVisible } : item
      )
    );
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
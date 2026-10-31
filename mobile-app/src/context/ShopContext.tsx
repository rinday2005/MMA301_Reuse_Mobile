import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from './auth-context';
import {
  getShopRentProductsApi,
  getPublicRentProductsApi,
  createRentProductApi,
  updateRentProductApi,
  deleteRentProductApi,
  type RentalProductApi,
} from '../services/rentProduct.api';
import { getShopRentalOrdersApi, type RentalOrderApi } from '../services/order.api';
import { normalizeImageUrl } from '../utils/imageUrl';
import { normalizeShopBranch } from '../utils/address';
import { storage } from '../utils/storage';

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
  isVisible: boolean;
  maintenanceUnits: number;
  convertedToThrift?: boolean;
  thriftListingId?: string;
}

export interface ShopContextType {
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

const safeSaveProductsToStorage = (items: ShopProductItem[]) => {
  try {
    const compactItems = items.map((item) => ({
      ...item,
      coverImage:
        item.coverImage && item.coverImage.startsWith('data:') && item.coverImage.length > 2048
          ? 'https://placehold.co/600x400'
          : item.coverImage,
      inspectionImages: Array.isArray(item.inspectionImages)
        ? item.inspectionImages.filter((img) => !img.startsWith('data:') || img.length <= 2048)
        : [],
    }));
    storage.setItem(STORAGE_KEY, JSON.stringify(compactItems)).catch(() => {});
  } catch {
    storage.removeItem(STORAGE_KEY).catch(() => {});
  }
};

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useContext(AuthContext);
  const currentOwnerId =
    auth?.user?._id ||
    auth?.user?.id ||
    (auth?.user as any)?.username ||
    'OWNER-01';

  const [products, setProducts] = useState<ShopProductItem[]>([]);

  useEffect(() => {
    const loadCached = async () => {
      try {
        const saved = await storage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setProducts(parsed.filter((p: ShopProductItem) => !p.sku.startsWith('mock-')));
          }
        }
      } catch (err) {
        console.warn('Lỗi parse storage:', err);
      }
    };
    loadCached();
  }, []);

  const fetchProductsFromDB = useCallback(async () => {
    try {
      let apiProducts = await getShopRentProductsApi();

      if (!apiProducts || apiProducts.length === 0) {
        apiProducts = await getPublicRentProductsApi();
      }

      let shopOrders: RentalOrderApi[] = [];
      try {
        const orderRes = await getShopRentalOrdersApi();
        if (Array.isArray(orderRes)) {
          shopOrders = orderRes;
        }
      } catch {
        // Fallback
      }

      const rentedCountMap: Record<string, number> = {};
      const activeRentalStatuses = [
        'RENTING', 'DELIVERED', 'ACTIVE', 'IN_RENTAL',
        'RETURN_REQUESTED', 'INSPECTING', 'APPROVED', 'SHIPPED',
      ];

      shopOrders.forEach((order) => {
        const st = (order.status || '').toUpperCase();
        if (activeRentalStatuses.includes(st) && Array.isArray(order.items)) {
          order.items.forEach((it) => {
            const pId = it.productId ? String(it.productId) : '';
            if (pId) {
              const qty = Number(it.quantity) || 1;
              rentedCountMap[pId] = (rentedCountMap[pId] || 0) + qty;
            }
          });
        }
      });

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
          const catIdStr =
            typeof p.categoryId === 'object' && p.categoryId
              ? p.categoryId._id
              : typeof p.category === 'object' && p.category
                ? (p.category as { _id?: string })._id
                : typeof p.categoryId === 'string'
                  ? p.categoryId
                  : undefined;
          const ownerIdStr =
            typeof p.ownerId === 'object' && p.ownerId
              ? ((p.ownerId as { _id?: string; id?: string })._id || (p.ownerId as { id?: string }).id || currentOwnerId)
              : p.ownerId || currentOwnerId;

          const st = (p.status || '').toUpperCase();
          const approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'DRAFT' =
            st === 'APPROVED' || st === 'ACTIVE'
              ? 'APPROVED'
              : st === 'PENDING' || st === 'PENDING_APPROVAL'
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
          const totalUnits = Number(p.totalQuantity) || 1;
          const rentedUnits = rentedCountMap[String(p._id)] || rentedCountMap[String(skuStr)] || 0;
          const readyUnits = Math.max(0, totalUnits - rentedUnits);

          return {
            sku: String(skuStr),
            name: p.name || 'Sản phẩm cho thuê',
            category: catName,
            categoryId: catIdStr,
            brand: (p as { brand?: string }).brand || 'Atelier / Chronos',
            mountSensor: (p as { mountSensor?: string }).mountSensor || '',
            pricePerDay: Number(p.pricePerDay) || 0,
            deposit: Number(p.depositAmount) || 0,
            replacementValue: (p as { replacementValue?: number }).replacementValue
              ? Number((p as { replacementValue?: number }).replacementValue)
              : (Number(p.depositAmount) || 0) * 2,
            totalUnits,
            readyUnits,
            rentingUnits: rentedUnits,
            inspectionUnits: 0,
            approvalStatus,
            rejectionReason: (p as { rejectionReason?: string; reason?: string }).rejectionReason || (p as { reason?: string }).reason || '',
            coverImage,
            inspectionImages: detailImages,
            description: p.description || '',
            accessoriesIncluded: (p as { accessoriesIncluded?: string; rentalRules?: string }).accessoriesIncluded || (p as { rentalRules?: string }).rentalRules || '',
            minDays: Number((p as { minDays?: number }).minDays) || 1,
            maxDays: Number((p as { maxDays?: number }).maxDays) || 30,
            ownerId: String(ownerIdStr),
            location: normalizeShopBranch(p.location || 'Đà Nẵng'),
            condition: p.condition || 'LIKE_NEW',
            isVisible: st !== 'HIDDEN',
            maintenanceUnits: 0,
          };
        });

        setProducts(mappedProducts);
        safeSaveProductsToStorage(mappedProducts);
      }
    } catch (err) {
      console.warn('Lỗi nạp sản phẩm RENT từ MongoDB:', err);
    }
  }, [currentOwnerId]);

  useEffect(() => {
    fetchProductsFromDB();
  }, [fetchProductsFromDB]);

  useEffect(() => {
    safeSaveProductsToStorage(products);
  }, [products]);

  const ownerProducts = products.filter((p) => {
    if (!p.ownerId) return true;
    if (currentOwnerId === 'OWNER-01') return true;
    return p.ownerId === currentOwnerId || p.ownerId === 'OWNER-01';
  });

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
        condition: (data.condition as string) || 'LIKE_NEW',
        location: normalizeShopBranch(data.location || 'Đà Nẵng'),
        totalQuantity: Number(data.totalUnits) || 1,
        rentalRules: data.accessoriesIncluded || 'Vali Nanuk đối kiểm 3 góc',
      };

      const created = await createRentProductApi(payload as Partial<RentalProductApi>);
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

  const updateProduct = async (sku: string, data: Partial<ShopProductItem>) => {
    setProducts((prev) =>
      prev.map((item) => (item.sku === sku ? { ...item, ...data } : item))
    );

    if (sku && sku.length === 24 && /^[0-9a-fA-F]{24}$/.test(sku)) {
      try {
        const payload: Record<string, unknown> = {};
        if (data.name) payload.name = data.name;
        if (data.description !== undefined) payload.description = data.description;
        if (data.pricePerDay) payload.pricePerDay = Number(data.pricePerDay);
        if (data.deposit) payload.depositAmount = Number(data.deposit);
        if (data.totalUnits) payload.totalQuantity = Number(data.totalUnits);
        if (data.location) payload.location = normalizeShopBranch(data.location);
        if (data.coverImage) payload.images = [data.coverImage, ...(data.inspectionImages || [])];
        await updateRentProductApi(sku, payload as Partial<RentalProductApi>);
      } catch (err) {
        console.warn('Lỗi gọi API cập nhật sản phẩm:', err);
      }
    }
  };

  const deleteProduct = async (sku: string) => {
    setProducts((prev) => prev.filter((item) => item.sku !== sku));

    if (sku && sku.length === 24 && /^[0-9a-fA-F]{24}$/.test(sku)) {
      try {
        await deleteRentProductApi(sku);
      } catch (err) {
        console.warn('Lỗi gọi API xóa sản phẩm:', err);
      }
    }
  };

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
        } as Partial<RentalProductApi>);
      } catch (err) {
        console.warn('Lỗi toggle visibility trên MongoDB:', err);
      }
    }
  };

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
        message: `Không đủ máy khả dụng! Đang có ${target.rentingUnits} máy đang thuê, số bảo trì tối đa chỉ được ${
          target.totalUnits - target.rentingUnits
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

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop phải được sử dụng bên trong ShopProvider');
  }
  return context;
};

export default ShopContext;

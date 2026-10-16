import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { UserSidebar } from '../../../components/layout/UserSidebar';
import { getRentalOrderByIdApi, type RentalOrderApi, type RentalOrderItemApi } from '../../../services/order.api';
import { getRentProductDetail } from '../../data/rent/rentOrderDetailData';
import { type StoredRentalOrderRecord, type StoredRentalOrderItem } from '../../data/rent/myRentOrdersData';

interface OrderItemDetail {
  id: string;
  productId: string;
  title: string;
  category: string;
  warehouse: string;
  shopName: string;
  serialNumber: string;
  sealId: string;
  grade: string;
  dailyRate: number;
  deposit: number;
  quantity: number;
  itemTotal: number;
  image: string;
  accessoriesText: string;
  benchReportText?: string;
}

interface OrderFullData {
  id: string;
  code: string;
  status: string;
  statusLabel: string;
  dayProgress: string;
  escrowDeposit: number;
  totalRentalFee: number;
  shippingFee: number;
  grandTotal: number;
  startDate: string;
  endDate: string;
  rentalDays: number;
  elapsedDays: number;
  remainingHours: string;
  items: OrderItemDetail[];
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  transactionId: string;
  paymentTime: string;
  paymentMethod: string;
  paymentStatus: string;
  carrierName: string;
  trackingCode: string;
  outboundDate: string;
  returnTimeWindow: string;
  claSignDate: string;
  claNote: string;
}

export const RentOrderDetail: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const targetProductId = searchParams.get('productId') || searchParams.get('item');

  const { user } = useAuth();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Copy state
  const [copiedCode, setCopiedCode] = useState(false);
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code.replace('#', ''));
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Track sidebar collapsed state to display inline restore chip when collapsed
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('reuse_user_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setIsSidebarCollapsed(customEvent.detail);
      }
    };
    window.addEventListener('reuse_user_sidebar_toggle', handleSync);
    return () => window.removeEventListener('reuse_user_sidebar_toggle', handleSync);
  }, []);

  // State Simulation (A, B, C, D) as demonstrated in the prompt
  const [simulationState, setSimulationState] = useState<'A' | 'B' | 'C' | 'D'>('A');

  // Modals
  const [activeModal, setActiveModal] = useState<'bench' | 'complaint' | 'invoice' | null>(null);
  const [selectedItemForModal, setSelectedItemForModal] = useState<OrderItemDetail | null>(null);

  // Dynamic Interactive CLA Proof State (Minh chứng bàn giao đối kiểm 3 góc)
  interface ClaProofData {
    isSigned: boolean;
    signDate: string;
    signerName: string;
    signerPhone: string;
    note: string;
    photos: {
      slot1: string;
      slot2: string;
      slot3: string;
    };
  }

  const [claProof, setClaProof] = useState<ClaProofData>({
    isSigned: false,
    signDate: '',
    signerName: '',
    signerPhone: '',
    note: '',
    photos: { slot1: '', slot2: '', slot3: '' },
  });
  const [claAgreed, setClaAgreed] = useState(false);
  const [isEditingCla, setIsEditingCla] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  const handlePhotoUpload = (slot: 'slot1' | 'slot2' | 'slot3', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setClaProof((prev) => {
        const updated = {
          ...prev,
          photos: {
            ...prev.photos,
            [slot]: base64,
          },
        };
        if (orderData) {
          const key = `cla_proof_${orderData.code.replace('#', '').trim()}`;
          localStorage.setItem(key, JSON.stringify(updated));
        }
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (slot: 'slot1' | 'slot2' | 'slot3') => {
    setClaProof((prev) => {
      const updated = {
        ...prev,
        photos: {
          ...prev.photos,
          [slot]: '',
        },
      };
      if (orderData) {
        const key = `cla_proof_${orderData.code.replace('#', '').trim()}`;
        localStorage.setItem(key, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleSignCla = () => {
    if (!orderData) return;
    const nowStr = new Date().toLocaleString('vi-VN');
    const updated: ClaProofData = {
      isSigned: true,
      signDate: nowStr,
      signerName: claProof.signerName || orderData.recipientName || displayName,
      signerPhone: claProof.signerPhone || orderData.recipientPhone,
      note:
        claProof.note ||
        `Khách hàng ${orderData.recipientName || displayName} đã mở hộp, kiểm tra đối soát 3 góc và ký nhận bàn giao CLA bảo chứng Smart Escrow.`,
      photos: claProof.photos,
    };
    setClaProof(updated);
    setIsEditingCla(false);
    const key = `cla_proof_${orderData.code.replace('#', '').trim()}`;
    localStorage.setItem(key, JSON.stringify(updated));
    alert('Ký nhận biên bản bàn giao CLA thành công! Hồ sơ bảo chứng Smart Escrow đã được cập nhật.');
  };

  // Dynamic user profile info for sidebar
  const userProfileKey = (user?._id || user?.id) ? `user_profile_${user?._id || user?.id}` : '';
  const savedProfile = useMemo(() => {
    if (!userProfileKey) return null;
    try {
      const raw = localStorage.getItem(userProfileKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [userProfileKey]);

  const displayName = savedProfile?.fullName || user?.fullName || 'Khách hàng';
  const displayEmail = savedProfile?.email || user?.email || '';
  const displayAvatar =
    savedProfile?.avatarUrl ||
    user?.avatarUrl ||
    user?.avatar ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCMwbU44ZM0dZePaAOyFv49mOAhbEw3pqfZA1_2FS-7VfcegFWv61TXx3DWJIZc8UB0MsGkPHwOa97niyCrHzEC25U-maDnSnRUqud1GouXT_0YJYIqKRwjN3kZk0T5DIHXCgA8hXoz_-CU_xbOdbngGDygOaOHOBKy0qRmDr3A-8mVbyTAF5sJb5PBdNrjI_ZwYlugupcwk1mJWpjSd3dcT4W7AIaVlBFmmLq1akOA';

  // Currency helper
  const formatVnd = (amount: number) => {
    return amount.toLocaleString('vi-VN') + '₫';
  };

  // Build default product accessories & metadata helper
  const getProductMetadata = useCallback((nameOrTitle: string, pId?: string) => {
    const lower = (nameOrTitle || '').toLowerCase();
    if (lower.includes('canon') || lower.includes('r6') || lower.includes('camera') || lower.includes('sony') || lower.includes('máy ảnh')) {
      return {
        category: 'Camera & Quang học',
        warehouse: 'Mã kho: Đà Nẵng Central',
        shopName: 'RedRiver Film Gear Hub (Đà Nẵng Archive)',
        serialNumber: `SN #74209930-${(pId || 'A').slice(-1).toUpperCase()}`,
        sealId: `Seal #TS-8841-${(pId || 'A').slice(-1).toUpperCase()}`,
        grade: 'Grade A+',
        accessoriesText:
          'Body Canon R6 II, ống kính RF 24-70mm f/2.8L (hood + nắp trước sau), 02x Pin chính hãng LP-E6NH, dock sạc đôi LC-E6, thẻ CFexpress Type B 128GB + đầu đọc USB-C, dây đeo Peak Design Slide v3, vali chống va đập Nanuk 935 màu graphite.',
        benchReportText: 'Độ sạch bề mặt 99.8%, 0 dead pixel, ngàm ống kính không trầy xước, cơ cấu chống rung IBIS 5 trục kiểm định đạt chuẩn A+.',
      };
    }
    if (lower.includes('lều') || lower.includes('tent') || lower.includes('snow peak') || lower.includes('cắm trại') || lower.includes('camping')) {
      return {
        category: 'Dã ngoại & Thám hiểm',
        warehouse: 'Mã kho: Sài Gòn Hub',
        shopName: 'Alpine Camp Vault (TP. Hồ Chí Minh)',
        serialNumber: `SN #SP-4P-${Math.floor(1000 + Math.random() * 9000)}`,
        sealId: `Seal #TS-8841-B`,
        grade: 'Grade A',
        accessoriesText:
          'Khung hợp kim nhôm Duralumin 4 mảnh nguyên bản, bạt phủ chống bão 150D Polyester Oxford (PU 1.800mm), thảm lót chống thấm nền lều Snow Peak chính hãng, 16 cọc neo nhôm Duralumin + búa dã ngoại cắm cọc, túi dù đựng nén dập nhiệt.',
        benchReportText: 'Đã khử trùng Ozone công nghiệp & kiểm tra áp lực nước 2000mm không rò rỉ trước khi bàn giao.',
      };
    }
    if (lower.includes('váy') || lower.includes('dress') || lower.includes('áo') || lower.includes('jacket') || lower.includes('fashion')) {
      return {
        category: 'Thời trang & Sự kiện',
        warehouse: 'Mã kho: Hà Nội Atelier',
        shopName: 'Maison Archive Suite (Hà Nội)',
        serialNumber: `SN #MS-FSH-${Math.floor(1000 + Math.random() * 9000)}`,
        sealId: `Seal #TS-8841-C`,
        grade: 'Grade A+',
        accessoriesText: 'Hộp cứng đựng bảo quản chuyên dụng, móc treo cao cấp gỗ tuyết tùng, túi bảo quản vải không dệt kháng ẩm, kèm hướng dẫn giặt khô sinh học.',
        benchReportText: 'Kiểm định sớ vải 100% nguyên vẹn, giặt khô khử khuẩn công nghệ CO2 lỏng, không tì vết.',
      };
    }
    return {
      category: 'Thiết bị chuyên dụng',
      warehouse: 'Kho Trung tâm ReUse Hub',
      shopName: 'ReUse Partner Vault',
      serialNumber: `SN #RH-${Math.floor(100000 + Math.random() * 900000)}`,
      sealId: `Seal #TS-8841-X`,
      grade: 'Grade A+',
      accessoriesText: 'Trọn bộ phụ kiện nguyên bản, tem kiểm định bảo chứng ReUse Standard, túi bảo vệ chống va đập chuyên dụng.',
      benchReportText: 'Kiểm định chất lượng 8 bước ReUse Standard đạt 100% tiêu chuẩn xuất kho.',
    };
  }, []);

  // Master order resolution
  const [orderData, setOrderData] = useState<OrderFullData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const resolveOrder = async () => {
      setLoading(true);
      const cleanParamId = (id || '').replace('#', '').trim();
      const uId = user?._id || user?.id || '';

      // 1. Try fetching from Backend API
      let backendOrder: RentalOrderApi | null = null;
      if (cleanParamId) {
        try {
          backendOrder = await getRentalOrderByIdApi(cleanParamId);
        } catch {
          // ignore
        }
      }

      // If backendOrder exists, ensure it belongs to the logged-in user or authorized roles
      if (backendOrder && uId && user?.role !== 'ADMIN' && user?.role !== 'SHOP_OWNER') {
        const orderRenterId = String(
          (backendOrder.renterId as unknown as { _id?: string })?._id || backendOrder.renterId || ''
        );
        if (orderRenterId && orderRenterId !== String(uId)) {
          backendOrder = null;
        }
      }

      // 2. Read stored orders from localStorage STRICTLY for the current logged-in user only
      let localOrder: StoredRentalOrderRecord | null = null;
      if (uId) {
        try {
          const userKey = `user_rental_orders_${uId}`;
          const raw = localStorage.getItem(userKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            const userOrders: StoredRentalOrderRecord[] = Array.isArray(parsed) ? parsed : [parsed];
            const cleanLower = cleanParamId.toLowerCase();
            localOrder =
              userOrders.find((o) => {
                const oCode = (o.orderCode || '').replace('#', '').toLowerCase();
                const oId = String(o._id || (o as unknown as { id?: string }).id || '').toLowerCase();
                return (
                  (oCode.length > 0 && oCode === cleanLower) ||
                  (oId.length > 0 && oId === cleanLower) ||
                  (oCode.length > 0 && cleanLower.includes(oCode)) ||
                  (oCode.length > 0 && oCode.includes(cleanLower))
                );
              }) || null;
          }
        } catch {
          // ignore
        }
      }

      // Enrich backendOrder with rich items from localOrder if backend items are generic
      if (backendOrder && localOrder) {
        const hasRichLocalItems =
          localOrder.items &&
          Array.isArray(localOrder.items) &&
          localOrder.items.length > 0 &&
          !localOrder.items.some((it) => (it.productName || it.title || '').includes('Đơn hàng Thuê'));

        if (hasRichLocalItems) {
          backendOrder = {
            ...backendOrder,
            items: localOrder.items as unknown as RentalOrderItemApi[],
            depositAmount: localOrder.totalDeposit || localOrder.depositAmount || backendOrder.depositAmount || 0,
            totalAmount: localOrder.totalPayment || localOrder.totalAmount || backendOrder.totalAmount || 0,
            startDate: localOrder.startDate || backendOrder.startDate,
            endDate: localOrder.endDate || backendOrder.endDate,
            rentalDays: localOrder.rentalDays || backendOrder.rentalDays,
          };
        }
      }

      // If order is not found or not owned by user, abort resolution
      if (!backendOrder && !localOrder) {
        if (isMounted) {
          setOrderData(null);
          setLoading(false);
        }
        return;
      }

      // 4. Transform raw source into OrderFullData
      const hasLocalItems = localOrder?.items && Array.isArray(localOrder.items) && localOrder.items.length > 0;
      const hasBackendItems = backendOrder?.items && Array.isArray(backendOrder.items) && backendOrder.items.length > 0;
      const source = (hasLocalItems && !hasBackendItems)
        ? localOrder
        : (backendOrder || localOrder);

      const orderCode =
        source?.orderCode || (cleanParamId.startsWith('RH-') ? `#${cleanParamId}` : '#RH-RNT-2026-8845');
      const displayCode = orderCode.startsWith('#') ? orderCode : `#${orderCode}`;

      const rawStatus = String(source?.status || (source as Record<string, unknown>)?.paymentStatus || 'RENTING').toUpperCase();

      // Dates
      const startDateStr = source?.startDate
        ? new Date(source.startDate).toLocaleDateString('vi-VN')
        : new Date().toLocaleDateString('vi-VN');
      const endDateStr = source?.endDate
        ? new Date(source.endDate).toLocaleDateString('vi-VN')
        : new Date(Date.now() + 5 * 86400000).toLocaleDateString('vi-VN');

      let rentalDays = source?.rentalDays || 5;
      if (source?.startDate && source?.endDate) {
        const diffMs = new Date(source.endDate).getTime() - new Date(source.startDate).getTime();
        const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
        if (diffDays > 0) rentalDays = diffDays;
      }

      const now = new Date();
      const startD = source?.startDate ? new Date(source.startDate) : new Date();
      const endD = source?.endDate ? new Date(source.endDate) : new Date(Date.now() + rentalDays * 86400000);
      const elapsedMs = Math.max(0, now.getTime() - startD.getTime());
      const elapsedDays = Math.min(rentalDays, Math.max(1, Math.ceil(elapsedMs / (1000 * 60 * 60 * 24))));
      const remainingMs = Math.max(0, endD.getTime() - now.getTime());
      const remainingHoursCount = Math.floor(remainingMs / (1000 * 60 * 60));
      const remainingMinutesCount = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const remainingHours = remainingMs > 0 ? `${remainingHoursCount} giờ ${remainingMinutesCount} phút` : 'Đã đến hạn hoàn trả';

      let statusLabel = 'ĐANG THUÊ (RENTING)';
      let dayProgress = '60%';
      let initSimState: 'A' | 'B' | 'C' | 'D' = 'A';

      if (rawStatus === 'PENDING_PAYMENT') {
        statusLabel = 'CHỜ THANH TOÁN (PENDING PAYMENT)';
        dayProgress = '15%';
        initSimState = 'A';
      } else if (rawStatus === 'PAID') {
        statusLabel = 'ĐÃ THANH TOÁN · CHỜ BÀN GIAO';
        dayProgress = '25%';
        initSimState = 'A';
      } else if (rawStatus === 'READY_FOR_HANDOVER') {
        statusLabel = 'SẴN SÀNG BÀN GIAO';
        dayProgress = '35%';
        initSimState = 'A';
      } else if (rawStatus === 'SHIPPING' || rawStatus === 'HANDED_OVER') {
        statusLabel = 'ĐANG VẬN CHUYỂN BẢO CHỨNG NANUK';
        dayProgress = '50%';
        initSimState = 'A';
      } else if (rawStatus === 'DELIVERED') {
        statusLabel = 'ĐÃ GIAO HÀNG · BẮT ĐẦU TÍNH GIỜ';
        dayProgress = '60%';
        initSimState = 'A';
      } else if (rawStatus === 'RENTING') {
        const pct = Math.min(100, Math.max(10, Math.round((elapsedDays / rentalDays) * 100)));
        statusLabel = `ĐANG THUÊ (RENTING) · NGÀY ${elapsedDays}/${rentalDays}`;
        dayProgress = `${pct}%`;
        initSimState = pct >= 90 ? 'B' : 'A';
      } else if (rawStatus === 'RETURNED') {
        statusLabel = 'BENCH LAB ĐỐI KIỂM · 2 GIỜ';
        dayProgress = '82%';
        initSimState = 'C';
      } else if (rawStatus === 'COMPLETED') {
        statusLabel = 'HOÀN TẤT · ĐÃ HOÀN CỌC 100%';
        dayProgress = '100%';
        initSimState = 'D';
      } else if (rawStatus === 'CANCELLED') {
        statusLabel = 'ĐÃ HỦY ĐƠN THUÊ';
        dayProgress = '0%';
        initSimState = 'A';
      }

      // Build Items List
      const mappedItems: OrderItemDetail[] = [];

      if (source?.items && Array.isArray(source.items) && source.items.length > 0) {
        source.items.forEach((it: StoredRentalOrderItem, idx: number) => {
          const itId = String(it.productId || it.id || `item-${idx + 1}`);
          let itTitle = it.productName || it.title || `Sản phẩm thuê #${idx + 1}`;
          let price = Number(it.pricePerDay || it.dailyPrice || (it as { price?: number }).price || 0);
          let deposit = Number(
            it.depositAmount ||
            (it as { itemDeposit?: number }).itemDeposit ||
            (it as { deposit?: number }).deposit ||
            0
          );
          let image = it.imageUrl || it.image || '';

          // If item is generic mock (e.g. from seeded 4.4M order or generic title)
          let resolvedProd = null;
          const isGenericMock =
            !itTitle ||
            itTitle.includes('Đơn hàng Thuê') ||
            itTitle.includes('RH-RNT-') ||
            price === 4400000;

          if (isGenericMock || !image || image.includes('unsplash.com/photo-1516035069371') || deposit === 0) {
            // 1. Try resolving by it.productId or targetProductId
            const pId = String(targetProductId || it.productId || (it as { id?: string }).id || '');
            if (pId && pId !== 'undefined' && !pId.startsWith('item-')) {
              const found = getRentProductDetail(pId);
              if (found && found.title && !found.title.includes('Thuê')) {
                resolvedProd = found;
              }
            }

            // 2. Try resolving from reuse_shared_booked_dates
            if (!resolvedProd) {
              try {
                const sharedRaw = localStorage.getItem('reuse_shared_booked_dates');
                if (sharedRaw) {
                  const list = JSON.parse(sharedRaw);
                  if (Array.isArray(list) && list.length > 0) {
                    const cId = cleanParamId.toLowerCase();
                    const sStart = (source?.startDate || '').slice(0, 10);
                    const sEnd = (source?.endDate || '').slice(0, 10);

                    const matchedBooking = list.find((b: { orderCode?: string; note?: string; title?: string; startDate?: string; endDate?: string }) => {
                      const bCode = (b.orderCode || '').replace('#', '').toLowerCase();
                      const bNote = (b.note || '').toLowerCase();
                      const codeMatch = Boolean(cId && (bCode === cId || bNote.includes(cId)));
                      const bStart = (b.startDate || '').slice(0, 10);
                      const bEnd = (b.endDate || '').slice(0, 10);
                      const dateMatch = Boolean(sStart && bStart && sStart === bStart) || Boolean(sEnd && bEnd && sEnd === bEnd);
                      return codeMatch || dateMatch;
                    }) || list[list.length - 1];

                    if (matchedBooking?.productId || matchedBooking?.title) {
                      resolvedProd = getRentProductDetail(matchedBooking.productId || matchedBooking.title);
                    }
                  }
                }
              } catch {
                // ignore
              }
            }

            // 3. Fallback to high-tier product
            if (!resolvedProd) {
              resolvedProd = getRentProductDetail('7');
            }

            if (resolvedProd) {
              if (isGenericMock) {
                itTitle = resolvedProd.title;
              }
              if (!price || price === 4400000 || price === 0) {
                price = resolvedProd.pricePerDay || 350000;
              }
              if (!deposit || deposit === 0 || deposit === 22000000) {
                deposit = resolvedProd.deposit || (resolvedProd.pricePerDay * 4) || 1500000;
              }
              if (!image || image.includes('unsplash.com/photo-1516035069371')) {
                image = resolvedProd.images?.[0]?.src || image;
              }
            }
          }

          if (!price) price = 350000;
          if (!deposit) deposit = price * 4 || 1500000;

          if (!image) {
            image = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmFHFDSIg4hOhOPqA36mT1kkDCl3WPEhUJRK08XZrwDTHzuiTwpPS19S9rp72RfWd75ovkeghRObBnjMEjwjM4C-han-LYxuwvvmbNoQxfmQdJ0b32KcCw-X0Jnqe_U23o9wu4QRqi1jvm0k2QIjvQX3uucHyHqIp2-wcXnh_PJzwTUThv7mBwqwtAjiXdUPGAdc-I8uwnLjfVeTg2aWPw2sXhSqhHAp-MSwbmguRZ';
          }

          const qty = it.quantity || (it as { qty?: number }).qty || 1;
          const itemTotal = it.itemRentTotal || (price * rentalDays * qty);
          const meta = getProductMetadata(itTitle, itId);

          const finalCategory =
            (it as { category?: string }).category ||
            resolvedProd?.category ||
            meta.category;
          const finalWarehouse =
            (it as { warehouse?: string }).warehouse ||
            (resolvedProd?.location ? `Kho lưu ký: ${resolvedProd.location}` : meta.warehouse);
          const finalGrade = it.grade || resolvedProd?.grade || meta.grade;
          const finalAccessories =
            (it as { accessoriesText?: string }).accessoriesText ||
            (resolvedProd?.accessories?.length ? resolvedProd.accessories.join(', ') : meta.accessoriesText);
          const finalBenchReport =
            (it as { benchReportText?: string }).benchReportText ||
            (resolvedProd?.auditItems?.length
              ? resolvedProd.auditItems.map((a: { label: string; value: string }) => `${a.label}: ${a.value}`).join(' · ')
              : (resolvedProd?.overview?.length ? resolvedProd.overview.join(' ') : meta.benchReportText));

          mappedItems.push({
            id: itId,
            productId: itId,
            title: itTitle,
            category: finalCategory,
            warehouse: finalWarehouse,
            shopName: it.shopName || (it as { shop?: string }).shop || meta.shopName,
            serialNumber: (it as { serialNumber?: string }).serialNumber || meta.serialNumber,
            sealId: (it as { sealId?: string }).sealId || meta.sealId,
            grade: finalGrade,
            dailyRate: price,
            deposit,
            quantity: qty,
            itemTotal,
            image,
            accessoriesText: finalAccessories,
            benchReportText: finalBenchReport,
          });
        });
      }

      // If items empty, check if targeted product was specified or fallback dynamically
      if (mappedItems.length === 0) {
        const searchId = targetProductId || cleanParamId;
        let resolvedFallback = null;

        if (searchId) {
          const fromDetail = getRentProductDetail(searchId);
          if (fromDetail && fromDetail.title && !fromDetail.title.includes('Thuê')) {
            resolvedFallback = fromDetail;
          }
        }

        if (!resolvedFallback) {
          try {
            const sharedRaw = localStorage.getItem('reuse_shared_booked_dates');
            if (sharedRaw) {
              const list = JSON.parse(sharedRaw);
              if (Array.isArray(list) && list.length > 0) {
                const cId = cleanParamId.toLowerCase();
                const sStart = (source?.startDate || '').slice(0, 10);
                const sEnd = (source?.endDate || '').slice(0, 10);

                const matchedBooking = list.find((b: { orderCode?: string; note?: string; title?: string; startDate?: string; endDate?: string }) => {
                  const bCode = (b.orderCode || '').replace('#', '').toLowerCase();
                  const bNote = (b.note || '').toLowerCase();
                  const codeMatch = Boolean(cId && (bCode === cId || bNote.includes(cId)));
                  const bStart = (b.startDate || '').slice(0, 10);
                  const bEnd = (b.endDate || '').slice(0, 10);
                  const dateMatch = Boolean(sStart && bStart && sStart === bStart) || Boolean(sEnd && bEnd && sEnd === bEnd);
                  return codeMatch || dateMatch;
                }) || list[list.length - 1];

                if (matchedBooking?.productId || matchedBooking?.title) {
                  resolvedFallback = getRentProductDetail(matchedBooking.productId || matchedBooking.title);
                }
              }
            }
          } catch {
            // ignore
          }
        }

        if (!resolvedFallback) {
          resolvedFallback = getRentProductDetail('7');
        }

        const fallbackTitle = resolvedFallback.title;
        const meta = getProductMetadata(fallbackTitle, resolvedFallback.id);
        const price = resolvedFallback.pricePerDay || 350000;
        const deposit = resolvedFallback.deposit || 1500000;
        const image = resolvedFallback.images?.[0]?.src || '';

        mappedItems.push({
          id: resolvedFallback.id || cleanParamId || 'item-1',
          productId: resolvedFallback.id || cleanParamId || 'item-1',
          title: fallbackTitle,
          category: resolvedFallback.category || meta.category,
          warehouse: resolvedFallback.location ? `Kho lưu ký: ${resolvedFallback.location}` : meta.warehouse,
          shopName: meta.shopName,
          serialNumber: meta.serialNumber,
          sealId: meta.sealId,
          grade: resolvedFallback.grade || 'Grade A+',
          dailyRate: price,
          deposit,
          quantity: 1,
          itemTotal: price * rentalDays,
          image,
          accessoriesText: resolvedFallback.accessories?.length ? resolvedFallback.accessories.join(', ') : meta.accessoriesText,
          benchReportText: resolvedFallback.auditItems?.length ? resolvedFallback.auditItems.map((a: { label: string; value: string }) => `${a.label}: ${a.value}`).join(' · ') : meta.benchReportText,
        });
      }

      // Calculations strictly calculated from actual order items
      const itemsRentalSum = mappedItems.reduce((acc, it) => acc + it.itemTotal, 0);
      const itemsDepositSum = mappedItems.reduce((acc, it) => acc + it.deposit, 0);

      const recordSource = source as StoredRentalOrderRecord | undefined;
      const recordRentFee = recordSource?.totalRentFee;
      const recordDeposit = recordSource?.totalDeposit;

      const totalRentalFee =
        source?.rentalFee && source.rentalFee !== 4400000 && source.rentalFee > 0
          ? source.rentalFee
          : typeof recordRentFee === 'number' && recordRentFee !== 4400000 && recordRentFee > 0
            ? recordRentFee
            : itemsRentalSum;

      const totalDeposit =
        source?.depositAmount && source.depositAmount !== 22000000 && source.depositAmount > 0
          ? source.depositAmount
          : typeof recordDeposit === 'number' && recordDeposit !== 22000000 && recordDeposit > 0
            ? recordDeposit
            : (itemsDepositSum > 0 ? itemsDepositSum : 1500000);

      const shippingFee = typeof source?.shippingFee === 'number' && source.shippingFee >= 0 ? source.shippingFee : 150000;
      const grandTotal = totalRentalFee + totalDeposit + shippingFee;

      // Shipping address without any type errors
      let fullAddress = 'Địa chỉ mặc định, Bến Nghé, Quận 1, Hồ Chí Minh';
      const rawAddr = (source as unknown as Record<string, unknown>)?.shippingAddress;
      if (typeof rawAddr === 'string' && rawAddr.trim()) {
        fullAddress = rawAddr;
      } else if (typeof rawAddr === 'object' && rawAddr !== null) {
        const addrObj = rawAddr as { detail?: string; ward?: string; district?: string; province?: string };
        const joined = [addrObj.detail, addrObj.ward, addrObj.district, addrObj.province].filter(Boolean).join(', ');
        if (joined) fullAddress = joined;
      }

      const recipientName =
        ((source as unknown as Record<string, unknown>)?.recipientName as string) ||
        ((rawAddr as { recipientName?: string })?.recipientName) ||
        ((source as unknown as Record<string, unknown>)?.custodyHolder as string) ||
        displayName;

      const recipientPhone =
        ((source as unknown as Record<string, unknown>)?.recipientPhone as string) ||
        ((rawAddr as { recipientPhone?: string })?.recipientPhone) ||
        ((source as unknown as Record<string, unknown>)?.phone as string) ||
        user?.phoneNumber ||
        user?.phone ||
        '0708091060';

      const itemTitles = mappedItems.map((i) => i.title).join(' và ');
      const claNote = `Bưu kiện nguyên vẹn, bưu tá hỗ trợ kiểm tra niêm phong Nanuk và nghiệm thu ngoại quan đối với: ${itemTitles}. Khách hàng ${recipientName} đã ký nhận điện tử bảo chứng Smart Escrow.`;

      // Load CLA proof from localStorage
      const cleanCode = (orderCode || '').replace('#', '').trim();
      const claStorageKey = `cla_proof_${cleanCode}`;
      try {
        const savedClaRaw = localStorage.getItem(claStorageKey);
        if (savedClaRaw) {
          const parsedCla = JSON.parse(savedClaRaw);
          setClaProof(parsedCla);
        } else {
          setClaProof({
            isSigned: false,
            signDate: '',
            signerName: recipientName,
            signerPhone: recipientPhone,
            note: '',
            photos: { slot1: '', slot2: '', slot3: '' },
          });
        }
      } catch {
        // ignore
      }

      if (isMounted) {
        setOrderData({
          id: cleanParamId || 'RH-RNT-2026-8845',
          code: displayCode,
          status: rawStatus,
          statusLabel,
          dayProgress,
          escrowDeposit: totalDeposit,
          totalRentalFee,
          shippingFee,
          grandTotal,
          startDate: startDateStr,
          endDate: endDateStr,
          rentalDays,
          elapsedDays,
          remainingHours,
          items: mappedItems,
          recipientName,
          recipientPhone,
          shippingAddress: fullAddress,
          transactionId:
            ((source as unknown as Record<string, unknown>)?.transactionNo as string) ||
            `VNP-${cleanCode.replace(/\D/g, '').padEnd(8, '8')}`,
          paymentTime: source?.createdAt
            ? new Date(source.createdAt).toLocaleString('vi-VN')
            : `${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} · ${startDateStr}`,
          paymentMethod:
            ((source as unknown as Record<string, unknown>)?.paymentMethod as string) ||
            'VNPay QR / NAPAS 256-bit HSM',
          paymentStatus: rawStatus === 'PENDING_PAYMENT' ? 'WAITING FOR PAYMENT' : 'PAID - ESCROW LOCKED',
          carrierName: 'Bưu tá Viettel Armored White-Glove',
          trackingCode:
            ((source as unknown as Record<string, unknown>)?.nanukSealId as string) || `NNK-${cleanCode.slice(-4).toUpperCase()}`,
          outboundDate: `10:15 ngày ${startDateStr}`,
          returnTimeWindow: `14:00 - 17:00 ngày ${endDateStr}`,
          claSignDate: startDateStr,
          claNote,
        });
        setSimulationState(initSimState);
        setLoading(false);
      }
    };

    resolveOrder();

    return () => {
      isMounted = false;
    };
  }, [id, targetProductId, getProductMetadata, displayName, user]);

  // Dynamic Stepper Configuration matching exact order status or user simulation
  const stepperConfig = useMemo(() => {
    const st = orderData?.status || 'RENTING';

    switch (simulationState) {
      case 'A': {
        if (st === 'PENDING_PAYMENT') {
          return {
            progressWidth: '15%',
            badgeText: 'CHỜ THANH TOÁN (PENDING)',
            badgeColor: 'bg-amber-100 text-amber-800',
            dotColor: 'bg-amber-600 animate-ping',
            activeStep: 1,
            timeCountdownText: 'Vui lòng hoàn tất thanh toán VNPay',
          };
        }
        if (st === 'PAID') {
          return {
            progressWidth: '25%',
            badgeText: 'ĐÃ THANH TOÁN · KHO ĐÓNG GÓI',
            badgeColor: 'bg-emerald-100 text-emerald-800',
            dotColor: 'bg-emerald-600',
            activeStep: 3,
            timeCountdownText: 'Shop đang chuẩn bị niêm phong thiết bị',
          };
        }
        if (st === 'READY_FOR_HANDOVER') {
          return {
            progressWidth: '35%',
            badgeText: 'SẴN SÀNG BÀN GIAO',
            badgeColor: 'bg-sky-100 text-sky-800',
            dotColor: 'bg-sky-600',
            activeStep: 4,
            timeCountdownText: 'Chờ đơn vị vận chuyển Nanuk tiếp nhận',
          };
        }
        if (st === 'SHIPPING' || st === 'HANDED_OVER') {
          return {
            progressWidth: '50%',
            badgeText: 'ĐANG VẬN CHUYỂN',
            badgeColor: 'bg-sky-100 text-sky-800',
            dotColor: 'bg-sky-600 animate-pulse',
            activeStep: 5,
            timeCountdownText: 'Bưu tá đang chuyển phát tới địa chỉ của bạn',
          };
        }
        if (st === 'DELIVERED') {
          return {
            progressWidth: '60%',
            badgeText: 'ĐÃ GIAO HÀNG',
            badgeColor: 'bg-emerald-100 text-emerald-800',
            dotColor: 'bg-emerald-600',
            activeStep: 6,
            timeCountdownText: 'Đã nhận hàng thành công',
          };
        }
        // Default RENTING
        return {
          progressWidth: orderData?.dayProgress || '60%',
          badgeText: orderData?.statusLabel || 'ĐANG THUÊ (RENTING)',
          badgeColor: 'bg-emerald-100 text-emerald-800',
          dotColor: 'bg-emerald-600 animate-pulse',
          activeStep: 7,
          timeCountdownText: `Còn ${orderData?.remainingHours || '46 giờ 22 phút'}`,
        };
      }
      case 'B':
        return {
          progressWidth: '70%',
          badgeText: 'SẴN SÀNG TRẢ ĐỒ · HẾT HẠN THUÊ',
          badgeColor: 'bg-sky-100 text-sky-800',
          dotColor: 'bg-sky-600 animate-pulse',
          activeStep: 8,
          timeCountdownText: 'Hôm nay là hạn trả đồ',
        };
      case 'C':
        return {
          progressWidth: '82%',
          badgeText: 'BENCH LAB ĐỐI KIỂM · 2 GIỜ',
          badgeColor: 'bg-amber-100 text-amber-800',
          dotColor: 'bg-amber-600 animate-pulse',
          activeStep: 9,
          timeCountdownText: 'Trạm lưu ký đang kiểm tra hoàn cọc',
        };
      case 'D':
        return {
          progressWidth: '100%',
          badgeText: 'HOÀN TẤT · ĐÃ HOÀN CỌC 100%',
          badgeColor: 'bg-stone-100 text-stone-800',
          dotColor: 'bg-stone-600',
          activeStep: 11,
          timeCountdownText: 'Giao dịch hoàn tất',
        };
    }
  }, [simulationState, orderData]);

    if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-stone-300 border-t-stone-900 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-stone-600">Đang tải hồ sơ lưu ký &amp; biên bản đơn thuê...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] text-brand-charcoal flex flex-col justify-between">
        <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-500">
            <span className="material-symbols-outlined text-3xl">inventory_2</span>
          </div>
          <h2 className="text-xl font-bold font-serif text-[#22201D]">Không tìm thấy thông tin đơn thuê</h2>
          <p className="text-xs text-stone-600">Đơn thuê không tồn tại hoặc bạn không có quyền truy cập vào đơn hàng này.</p>
          <Link
            to="/rent/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#22201D] text-white text-xs font-semibold hover:bg-black transition-colors"
          >
            Quay lại danh sách đơn thuê của tôi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-brand-charcoal antialiased selection:bg-[#E8E2D5]">


      {/* ── MAIN WORKSPACE CONTAINER WITH PERSISTENT SIDEBAR ── */}
      <div className="max-w-[1520px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex gap-8">
        {/* User Navigation Sidebar (Fixed on left) */}
        <UserSidebar
          activeKey="rent-orders"
          avatarUrl={displayAvatar}
          displayName={displayName}
          displayEmail={displayEmail}
        />

        {/* ── MAIN CONTENT AREA ── */}
        <main className="flex-1 min-w-0 space-y-8">
          <div className="flex flex-col w-full space-y-8">
            {/* Quick inline restore chip if user clicked 3-bar button to hide sidebar */}
            {isSidebarCollapsed && (
              <div className="flex items-center gap-2 -mb-4 animate-fade-in">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('reuse_user_sidebar_toggle', { detail: false }))}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#E8E4DC] text-xs font-semibold text-[#1C1A18] hover:bg-[#F6F3EE] hover:border-[#1C1A18]/40 transition-all shadow-2xs cursor-pointer group"
                  title="Mở lại menu điều hướng (Dấu 3 gạch)"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#5E6D5B] group-hover:scale-110 transition-transform">
                    menu
                  </span>
                  <span>Hiện menu điều hướng</span>
                </button>
              </div>
            )}

            {/* 1. BREADCRUMBS & TOP NAV CONTEXT */}
            <div className="flex flex-col gap-4">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                <Link to="/" className="hover:text-stone-900 transition-colors">Trang chủ</Link>
                <span className="text-stone-400">/</span>
                <Link to="/profile" className="hover:text-stone-900 transition-colors">Tài khoản</Link>
                <span className="text-stone-400">/</span>
                <Link to="/rent/orders" className="hover:text-stone-900 transition-colors">Đơn thuê RENT</Link>
                <span className="text-stone-400">/</span>
                <span className="text-stone-900 font-semibold">Chi tiết đơn thuê {orderData.code}</span>
              </nav>

              {/* HEADER TITLE & CONTROLS (Border None) */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border-none">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 border-none ${stepperConfig.badgeColor}`}>
                      <span className={`w-2 h-2 rounded-full ${stepperConfig.dotColor}`}></span>
                      {stepperConfig.badgeText}
                    </span>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-semibold border-none">
                      <span>Mã đơn: {orderData.code}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(orderData.code)}
                        className="text-[10px] text-stone-500 hover:text-stone-900 font-normal underline ml-1 cursor-pointer border-none bg-transparent"
                        id="copy-btn"
                        title="Sao chép mã đơn"
                      >
                        {copiedCode ? 'Đã sao chép!' : 'Sao chép'}
                      </button>
                    </div>

                    <span className="text-xs text-stone-500 font-medium">
                      Bảo chứng ký quỹ Smart Escrow: <strong className="text-stone-800">{formatVnd(orderData.escrowDeposit)}</strong>
                    </span>
                  </div>

                  <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 tracking-tight">
                    Hồ sơ lưu ký &amp; Quản trị đơn thuê
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-500 max-w-2xl leading-relaxed">
                    Đơn lưu giữ đa thiết bị chuyên dụng gồm {orderData.items.map((i) => i.title).join(' và ')}.
                    Tiền cọc được khóa độc lập qua hợp đồng giám sát thông minh Smart Escrow ReUse Hub.
                  </p>
                </div>

                {/* Action Buttons Row (Border None) */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                  <Link
                    to={`/chat?orderId=${orderData.code.replace('#', '')}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-all shadow-sm border-none"
                  >
                    <span className="material-symbols-outlined text-[17px]">chat</span>
                    <span>Nhắn tin Shop Owner</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-stone-100 text-stone-800 text-xs font-semibold hover:bg-stone-200 transition-colors cursor-pointer border-none"
                    title="In bản sao lưu trữ hoặc xuất file PDF"
                  >
                    <span className="material-symbols-outlined text-[17px]">print</span>
                    <span>In biên bản CLA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModal('complaint')}
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-stone-100 text-rose-700 text-xs font-semibold hover:bg-rose-50 transition-colors cursor-pointer border-none"
                  >
                    <span className="material-symbols-outlined text-[17px]">report_problem</span>
                    <span>Khiếu nại</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. STATE SIMULATION SWITCHER PILL BAR (Border None) */}
            <div className="bg-stone-100/80 p-2 sm:p-2.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs border-none">
              <div className="flex items-center gap-2 text-stone-600 font-semibold px-2">
                <span className="material-symbols-outlined text-base text-stone-700">tune</span>
                <span>Mô phỏng vòng đời (Simulation State):</span>
              </div>
              <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setSimulationState('A')}
                  className={`flex-1 md:flex-none px-3 py-1.5 rounded-xl text-[11px] transition-all cursor-pointer border-none ${simulationState === 'A'
                      ? 'font-semibold bg-stone-900 text-white shadow-sm'
                      : 'font-medium bg-white text-stone-700 hover:bg-stone-200'
                    }`}
                >
                  Trạng thái A: Đang thuê (Hiện tại)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulationState('B')}
                  className={`flex-1 md:flex-none px-3 py-1.5 rounded-xl text-[11px] transition-all cursor-pointer border-none ${simulationState === 'B'
                      ? 'font-semibold bg-stone-900 text-white shadow-sm'
                      : 'font-medium bg-white text-stone-700 hover:bg-stone-200'
                    }`}
                >
                  Trạng thái B: Sẵn sàng trả đồ
                </button>
                <button
                  type="button"
                  onClick={() => setSimulationState('C')}
                  className={`flex-1 md:flex-none px-3 py-1.5 rounded-xl text-[11px] transition-all cursor-pointer border-none ${simulationState === 'C'
                      ? 'font-semibold bg-stone-900 text-white shadow-sm'
                      : 'font-medium bg-white text-stone-700 hover:bg-stone-200'
                    }`}
                >
                  Trạng thái C: Bench Lab đối kiểm
                </button>
                <button
                  type="button"
                  onClick={() => setSimulationState('D')}
                  className={`flex-1 md:flex-none px-3 py-1.5 rounded-xl text-[11px] transition-all cursor-pointer border-none ${simulationState === 'D'
                      ? 'font-semibold bg-stone-900 text-white shadow-sm'
                      : 'font-medium bg-white text-stone-700 hover:bg-stone-200'
                    }`}
                >
                  Trạng thái D: Hoàn tất cọc 100%
                </button>
              </div>
            </div>

            {/* 3. ORDER LIFECYCLE 11-STEP HORIZONTAL STEPPER (Border None) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border-none space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Tiến trình tuần hoàn</span>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Vòng đời lưu ký 11 bước (Circular Rental Lifecycle)
                  </h2>
                </div>
                <div className="text-xs text-stone-600 font-medium bg-stone-100 px-3 py-1 rounded-full self-start sm:self-auto border-none">
                  Giai đoạn hiệu lực: <strong className="text-stone-900">{orderData.startDate} - {orderData.endDate}</strong>
                </div>
              </div>

              {/* Stepper Scrollable Track */}
              <div className="overflow-x-auto pb-4 pt-1 thin-scrollbar">
                <div className="min-w-[1080px] relative flex items-start justify-between">
                  {/* Connecting Line Background */}
                  <div className="absolute top-4 left-6 right-6 h-0.5 bg-stone-200 -z-0"></div>
                  <div
                    className="absolute top-4 left-6 h-0.5 bg-stone-900 -z-0 transition-all duration-500"
                    style={{ width: stepperConfig.progressWidth }}
                  ></div>

                  {/* Step 1: Đã đặt */}
                  <div className="flex flex-col items-center text-center w-24 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold shadow-sm border-none">
                      <span className="material-symbols-outlined text-[15px]">check</span>
                    </div>
                    <span className="text-[11px] font-bold text-stone-900 mt-2">1. Đã đặt</span>
                    <span className="text-[9px] text-stone-500">12/11 · 10:20</span>
                  </div>

                  {/* Step 2: Shop duyệt */}
                  <div className="flex flex-col items-center text-center w-24 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold shadow-sm border-none">
                      <span className="material-symbols-outlined text-[15px]">check</span>
                    </div>
                    <span className="text-[11px] font-bold text-stone-900 mt-2">2. Shop duyệt</span>
                    <span className="text-[9px] text-stone-500">12/11 · 10:45</span>
                  </div>

                  {/* Step 3: Chờ TT */}
                  <div className="flex flex-col items-center text-center w-24 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold shadow-sm border-none">
                      <span className="material-symbols-outlined text-[15px]">check</span>
                    </div>
                    <span className="text-[11px] font-bold text-stone-900 mt-2">3. Chờ thanh toán</span>
                    <span className="text-[9px] text-stone-500">Khóa Escrow</span>
                  </div>

                  {/* Step 4: Đã TT VNPay */}
                  <div className="flex flex-col items-center text-center w-24 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold shadow-sm border-none">
                      <span className="material-symbols-outlined text-[15px]">check</span>
                    </div>
                    <span className="text-[11px] font-bold text-stone-900 mt-2">4. Đã TT VNPay</span>
                    <span className="text-[9px] text-stone-500">12/11 · 14:32</span>
                  </div>

                  {/* Step 5: Đóng gói Nanuk */}
                  <div className="flex flex-col items-center text-center w-24 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold shadow-sm border-none">
                      <span className="material-symbols-outlined text-[15px]">check</span>
                    </div>
                    <span className="text-[11px] font-bold text-stone-900 mt-2">5. Đóng gói Nanuk</span>
                    <span className="text-[9px] text-stone-500">13/11 · Niêm seal</span>
                  </div>

                  {/* Step 6: Nhận & Test 3 góc */}
                  <div className="flex flex-col items-center text-center w-24 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold shadow-sm border-none">
                      <span className="material-symbols-outlined text-[15px]">check</span>
                    </div>
                    <span className="text-[11px] font-bold text-stone-900 mt-2">6. Bàn giao test</span>
                    <span className="text-[9px] text-stone-500">14/11 · Khớp CLA</span>
                  </div>

                  {/* Step 7: ĐANG THUÊ */}
                  <div className="flex flex-col items-center text-center w-28 relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all border-none ${stepperConfig.activeStep === 7
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-105'
                          : stepperConfig.activeStep > 7
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-400'
                        }`}
                    >
                      {stepperConfig.activeStep > 7 ? (
                        <span className="material-symbols-outlined text-[15px]">check</span>
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-2 ${stepperConfig.activeStep === 7 ? 'text-emerald-800' : 'text-stone-900'
                        }`}
                    >
                      7. ĐANG THUÊ
                    </span>
                    <span className="text-[9px] text-emerald-600 font-semibold">Còn 2 ngày hiệu lực</span>
                  </div>

                  {/* Step 8: Yêu cầu trả đồ */}
                  <div className="flex flex-col items-center text-center w-24 relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs transition-all border-none ${stepperConfig.activeStep === 8
                          ? 'bg-sky-600 text-white ring-4 ring-sky-100 scale-105'
                          : stepperConfig.activeStep > 8
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-400'
                        }`}
                    >
                      {stepperConfig.activeStep > 8 ? (
                        <span className="material-symbols-outlined text-[15px]">check</span>
                      ) : (
                        <span>8</span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-semibold mt-2 ${stepperConfig.activeStep >= 8 ? 'text-stone-900 font-bold' : 'text-stone-400'
                        }`}
                    >
                      8. Yêu cầu trả
                    </span>
                    <span className="text-[9px] text-stone-400">19/11 · Hạn 17h</span>
                  </div>

                  {/* Step 9: Bench Lab test */}
                  <div className="flex flex-col items-center text-center w-24 relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs transition-all border-none ${stepperConfig.activeStep === 9
                          ? 'bg-amber-600 text-white ring-4 ring-amber-100 scale-105'
                          : stepperConfig.activeStep > 9
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-400'
                        }`}
                    >
                      {stepperConfig.activeStep > 9 ? (
                        <span className="material-symbols-outlined text-[15px]">check</span>
                      ) : (
                        <span>9</span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-semibold mt-2 ${stepperConfig.activeStep >= 9 ? 'text-stone-900 font-bold' : 'text-stone-400'
                        }`}
                    >
                      9. Bench Lab
                    </span>
                    <span className="text-[9px] text-stone-400">Soi kính &amp; cảm biến</span>
                  </div>

                  {/* Step 10: Hoàn cọc Escrow */}
                  <div className="flex flex-col items-center text-center w-24 relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs transition-all border-none ${stepperConfig.activeStep === 10
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-105'
                          : stepperConfig.activeStep > 10
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-400'
                        }`}
                    >
                      {stepperConfig.activeStep > 10 ? (
                        <span className="material-symbols-outlined text-[15px]">check</span>
                      ) : (
                        <span>10</span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-semibold mt-2 ${stepperConfig.activeStep >= 10 ? 'text-stone-900 font-bold' : 'text-stone-400'
                        }`}
                    >
                      10. Hoàn cọc
                    </span>
                    <span className="text-[9px] text-stone-400">{formatVnd(orderData.escrowDeposit)} tự động</span>
                  </div>

                  {/* Step 11: Hoàn tất */}
                  <div className="flex flex-col items-center text-center w-24 relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs transition-all border-none ${stepperConfig.activeStep === 11
                          ? 'bg-stone-900 text-white ring-4 ring-stone-200 scale-105'
                          : 'bg-stone-100 text-stone-400'
                        }`}
                    >
                      <span>11</span>
                    </div>
                    <span
                      className={`text-[11px] font-semibold mt-2 ${stepperConfig.activeStep === 11 ? 'text-stone-900 font-bold' : 'text-stone-400'
                        }`}
                    >
                      11. Hoàn tất
                    </span>
                    <span className="text-[9px] text-stone-400">+250 Điểm xanh</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. TWO-COLUMN WORKSPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: MAIN ORDER DOSSIER (7 COLS) */}
              <div className="lg:col-span-7 space-y-8">
                {/* CUSTODY WINDOW & COUNTDOWN (Border None) */}
                <div className="bg-stone-900 text-stone-100 p-6 sm:p-8 rounded-3xl space-y-6 shadow-md relative overflow-hidden border-none">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-stone-400">
                        Cửa sổ lưu ký khách hàng
                      </div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mt-0.5">
                        Thời hạn bàn giao &amp; Thuê thực tế
                      </h3>
                    </div>
                    <span className="px-3 py-1 bg-stone-800 text-emerald-400 text-xs font-semibold rounded-full self-start sm:self-auto flex items-center gap-1.5 border-none">
                      <span className="material-symbols-outlined text-[15px]">timer</span>
                      <span>{stepperConfig.timeCountdownText}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                    <div className="bg-stone-800/80 p-4 rounded-2xl border-none">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                        Bắt đầu tính phí
                      </span>
                      <span className="text-base font-bold text-white mt-1 block">{orderData.startDate}</span>
                      <span className="text-[10px] text-stone-400">10:15 ICT (Ký nhận)</span>
                    </div>
                    <div className="bg-stone-800/80 p-4 rounded-2xl border-none">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                        Hạn chót trả đồ
                      </span>
                      <span className="text-base font-bold text-emerald-400 mt-1 block">{orderData.endDate}</span>
                      <span className="text-[10px] text-stone-400">Trước 17:00 ICT</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 bg-stone-800/80 p-4 rounded-2xl border-none">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                        Tổng thời lượng
                      </span>
                      <span className="text-base font-bold text-white mt-1 block">
                        {orderData.rentalDays} Ngày ({orderData.rentalDays * 24} Giờ)
                      </span>
                      <span className="text-[10px] text-stone-400">Đã trôi qua {orderData.elapsedDays} ngày</span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-stone-300">
                      <span>Tiến độ sử dụng</span>
                      <span className="font-bold">
                        {orderData.dayProgress} hoàn tất (Ngày {orderData.elapsedDays} / {orderData.rentalDays})
                      </span>
                    </div>
                    <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden border-none">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: orderData.dayProgress }}
                      ></div>
                    </div>
                  </div>

                  {/* Custody Action Buttons (Border None) */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <Link
                      to={`/rent/orders/${orderData.code.replace('#', '')}/return`}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-white text-stone-900 font-bold text-xs hover:bg-stone-200 transition-colors shadow-sm text-center border-none"
                    >
                      <span className="material-symbols-outlined text-[18px]">assignment_return</span>
                      <span>Yêu cầu trả đồ ngay (Initiate Return)</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          'Đã gửi yêu cầu gia hạn thêm 2 ngày tới Shop Owner. Bạn sẽ nhận được thông báo phản hồi qua SMS & Chat trong 15 phút.'
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-stone-800 text-stone-200 font-semibold text-xs hover:bg-stone-700 transition-colors cursor-pointer border-none"
                    >
                      <span className="material-symbols-outlined text-[18px]">update</span>
                      <span>Gia hạn thuê (+2 ngày)</span>
                    </button>
                  </div>
                </div>

                {/* ALL RENTED ITEMS IN THIS ORDER (Border None) */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
                        Chi tiết sản phẩm
                      </span>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                        Danh mục thiết bị đang lưu giữ ({orderData.items.length} Món)
                      </h3>
                    </div>
                    <span className="text-xs bg-stone-100 text-stone-700 px-3 py-1 rounded-full font-semibold border-none">
                      Đồng đơn {orderData.code}
                    </span>
                  </div>

                  {/* Product Cards Loop */}
                  {orderData.items.map((item, index) => {
                    const isTargeted =
                      targetProductId &&
                      (item.productId === targetProductId || item.id === targetProductId);

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-3xl p-6 sm:p-7 shadow-sm border-none transition-all space-y-6 ${isTargeted ? 'ring-2 ring-stone-900/10' : ''
                          }`}
                      >
                        <div className="flex flex-col sm:flex-row gap-5 items-start">
                          <div className="w-full sm:w-44 h-44 rounded-2xl overflow-hidden bg-stone-100 shrink-0 relative group border-none">
                            <img
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              src={item.image}
                              alt={item.title}
                            />
                            <span className="absolute bottom-2 left-2 bg-stone-900/80 backdrop-blur-xs text-white text-[9px] uppercase px-2 py-0.5 rounded font-bold border-none">
                              {item.grade}
                            </span>
                            {isTargeted && (
                              <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[8px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full shadow-xs border-none">
                                Đang chọn
                              </span>
                            )}
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border-none">
                                {item.category}
                              </span>
                              <span className="text-[10px] text-stone-500">{item.warehouse}</span>
                            </div>

                            <h4 className="font-serif text-lg font-bold text-stone-900 leading-snug">
                              {item.title}
                            </h4>
                            <p className="text-xs text-stone-500">
                              Nhà cung cấp: <strong className="text-stone-800">{item.shopName}</strong>
                            </p>

                            {/* Identifiers Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                              <div className="bg-stone-50 p-2.5 rounded-xl border-none">
                                <span className="text-[10px] text-stone-500 block">Số định danh / Serial:</span>
                                <span className="font-mono font-bold text-stone-800">{item.serialNumber}</span>
                              </div>
                              <div className="bg-stone-50 p-2.5 rounded-xl border-none">
                                <span className="text-[10px] text-stone-500 block">Khóa niêm phong Nanuk:</span>
                                <span className="font-mono font-bold text-stone-800">{item.sealId}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Included Accessories Box */}
                        <div className="bg-stone-50 p-4 rounded-2xl space-y-2 text-xs border-none">
                          <span className="font-bold text-stone-800 block text-[11px] uppercase tracking-wide">
                            Trọn bộ phụ kiện đi kèm theo biên bản:
                          </span>
                          <p className="text-stone-600 leading-relaxed">{item.accessoriesText}</p>
                        </div>

                        {/* Pricing & Escrow Subtotal */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-none">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-stone-400 block">
                              Chi phí thuê thiết bị
                            </span>
                            <div className="text-base font-bold text-stone-900">
                              {formatVnd(item.dailyRate)}{' '}
                              <span className="text-xs font-normal text-stone-500">
                                / ngày × {orderData.rentalDays} ngày =
                              </span>{' '}
                              {formatVnd(item.itemTotal)}
                            </div>
                            <span className="text-[11px] text-stone-500">
                              Ký quỹ Smart Escrow: <strong>{formatVnd(item.deposit)}</strong> (Hoàn lại 100%)
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItemForModal(item);
                                setActiveModal('bench');
                              }}
                              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border-none"
                            >
                              <span className="material-symbols-outlined text-[16px] text-emerald-700">verified</span>
                              <span>{index === 0 ? 'Hồ sơ Bench Grade' : 'Chứng thư Ozone Lab'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CUSTODY HANDOFF AUDIT TRAIL (CLA MINH CHỨNG BÀN GIAO ĐỐI KIỂM 3 GÓC) */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-none space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
                        Minh chứng bàn giao (CLA)
                      </span>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                        Nhật ký mở hộp &amp; Đối kiểm 3 góc
                      </h3>
                    </div>
                    {claProof.isSigned ? (
                      <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full self-start sm:self-auto border-none flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        Khách hàng đã ký xác nhận {claProof.signDate}
                      </span>
                    ) : (
                      <span className="px-3.5 py-1.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full self-start sm:self-auto border-none flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                        Chờ khách nhận bưu kiện &amp; ký nhận CLA
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {claProof.isSigned
                      ? `Ảnh chụp thực tế do khách hàng ${claProof.signerName} tải lên lúc ${claProof.signDate}. Hồ sơ bàn giao CLA đã được ký điện tử và lưu ký vào Smart Escrow ReUse Hub.`
                      : `Khi nhận bưu kiện từ bưu tá, quý khách vui lòng kiểm tra tình trạng hàng hóa, chụp ảnh thực tế 3 góc của sản phẩm (${orderData.items.map((i) => i.title).join(', ')}) và ký xác nhận để kích hoạt bảo hộ Smart Escrow.`}
                  </p>

                  {/* 3-Photo Inspection Grid (Upload & Preview) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Slot 1: Ngoại quan mặt trước */}
                    <div className="space-y-2">
                      <div className="h-40 rounded-2xl overflow-hidden bg-stone-50 relative group border border-stone-200/80">
                        {claProof.photos.slot1 ? (
                          <>
                            <img
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                              src={claProof.photos.slot1}
                              alt="Góc 1: Mặt trước & Tổng thể"
                              onClick={() => setPreviewImageModal(claProof.photos.slot1)}
                            />
                            <span className="absolute top-2 left-2 bg-stone-900/85 text-white text-[9px] px-2 py-0.5 rounded font-bold backdrop-blur-xs">
                              Góc 1: Mặt trước &amp; Tổng thể
                            </span>
                            {(!claProof.isSigned || isEditingCla) && (
                              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <label className="p-1.5 bg-stone-900/80 hover:bg-stone-900 text-white rounded-lg cursor-pointer text-[10px]" title="Đổi ảnh">
                                  <span className="material-symbols-outlined text-[14px]">edit</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handlePhotoUpload('slot1', e)}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto('slot1')}
                                  className="p-1.5 bg-rose-700/90 hover:bg-rose-800 text-white rounded-lg cursor-pointer text-[10px]"
                                  title="Xóa ảnh"
                                >
                                  <span className="material-symbols-outlined text-[14px]">delete</span>
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-4 text-center cursor-pointer hover:bg-stone-100 transition-colors">
                            <span className="material-symbols-outlined text-stone-400 text-2xl">add_a_photo</span>
                            <span className="text-[11px] font-semibold text-stone-700">Tải ảnh Góc 1</span>
                            <span className="text-[10px] text-stone-400">Mặt trước &amp; Tổng thể</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload('slot1', e)}
                            />
                          </label>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500 block text-center">
                        {claProof.photos.slot1 ? 'Đã tải ảnh mặt trước' : 'Chưa có ảnh minh chứng'}
                      </span>
                    </div>

                    {/* Slot 2: Chi tiết góc cạnh & phụ kiện */}
                    <div className="space-y-2">
                      <div className="h-40 rounded-2xl overflow-hidden bg-stone-50 relative group border border-stone-200/80">
                        {claProof.photos.slot2 ? (
                          <>
                            <img
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                              src={claProof.photos.slot2}
                              alt="Góc 2: Chi tiết & Phụ kiện"
                              onClick={() => setPreviewImageModal(claProof.photos.slot2)}
                            />
                            <span className="absolute top-2 left-2 bg-stone-900/85 text-white text-[9px] px-2 py-0.5 rounded font-bold backdrop-blur-xs">
                              Góc 2: Chi tiết &amp; Phụ kiện
                            </span>
                            {(!claProof.isSigned || isEditingCla) && (
                              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <label className="p-1.5 bg-stone-900/80 hover:bg-stone-900 text-white rounded-lg cursor-pointer text-[10px]" title="Đổi ảnh">
                                  <span className="material-symbols-outlined text-[14px]">edit</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handlePhotoUpload('slot2', e)}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto('slot2')}
                                  className="p-1.5 bg-rose-700/90 hover:bg-rose-800 text-white rounded-lg cursor-pointer text-[10px]"
                                  title="Xóa ảnh"
                                >
                                  <span className="material-symbols-outlined text-[14px]">delete</span>
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-4 text-center cursor-pointer hover:bg-stone-100 transition-colors">
                            <span className="material-symbols-outlined text-stone-400 text-2xl">add_a_photo</span>
                            <span className="text-[11px] font-semibold text-stone-700">Tải ảnh Góc 2</span>
                            <span className="text-[10px] text-stone-400">Góc cạnh &amp; Phụ kiện</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload('slot2', e)}
                            />
                          </label>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500 block text-center">
                        {claProof.photos.slot2 ? 'Đã tải ảnh phụ kiện & chi tiết' : 'Chưa có ảnh minh chứng'}
                      </span>
                    </div>

                    {/* Slot 3: Tem niêm phong & Khóa Nanuk */}
                    <div className="space-y-2">
                      <div className="h-40 rounded-2xl overflow-hidden bg-stone-50 relative group border border-stone-200/80">
                        {claProof.photos.slot3 ? (
                          <>
                            <img
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                              src={claProof.photos.slot3}
                              alt="Góc 3: Tem niêm phong Nanuk"
                              onClick={() => setPreviewImageModal(claProof.photos.slot3)}
                            />
                            <span className="absolute top-2 left-2 bg-stone-900/85 text-white text-[9px] px-2 py-0.5 rounded font-bold backdrop-blur-xs">
                              Góc 3: Tem chì niêm phong
                            </span>
                            {(!claProof.isSigned || isEditingCla) && (
                              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <label className="p-1.5 bg-stone-900/80 hover:bg-stone-900 text-white rounded-lg cursor-pointer text-[10px]" title="Đổi ảnh">
                                  <span className="material-symbols-outlined text-[14px]">edit</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handlePhotoUpload('slot3', e)}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto('slot3')}
                                  className="p-1.5 bg-rose-700/90 hover:bg-rose-800 text-white rounded-lg cursor-pointer text-[10px]"
                                  title="Xóa ảnh"
                                >
                                  <span className="material-symbols-outlined text-[14px]">delete</span>
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-4 text-center cursor-pointer hover:bg-stone-100 transition-colors">
                            <span className="material-symbols-outlined text-stone-400 text-2xl">add_a_photo</span>
                            <span className="text-[11px] font-semibold text-stone-700">Tải ảnh Góc 3</span>
                            <span className="text-[10px] text-stone-400">Tem niêm phong Nanuk</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload('slot3', e)}
                            />
                          </label>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500 block text-center">
                        {claProof.photos.slot3 ? 'Đã tải ảnh tem niêm phong' : 'Chưa có ảnh minh chứng'}
                      </span>
                    </div>
                  </div>

                  {/* Signed State: Stamp & Note Display */}
                  {claProof.isSigned && !isEditingCla ? (
                    <div className="p-4 sm:p-5 bg-stone-50 rounded-2xl text-xs text-stone-600 space-y-3 border-none">
                      <div className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-emerald-700 text-xl shrink-0">verified_user</span>
                        <div className="space-y-1.5 flex-1">
                          <div className="font-bold text-stone-900 flex flex-wrap items-center gap-2">
                            <span>Biên bản CLA đã ký điện tử:</span>
                            <span className="font-mono text-emerald-800 font-normal bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              Mã xác thực: CLA-{orderData.code.replace('#', '')}
                            </span>
                          </div>
                          <p className="text-stone-700">
                            Người ký: <strong className="text-stone-900">{claProof.signerName}</strong>
                            {claProof.signerPhone && <> · SĐT: <span className="font-mono">{claProof.signerPhone}</span></>}
                            {claProof.signDate && <> · Thời gian: <span>{claProof.signDate}</span></>}
                          </p>
                          {claProof.note && (
                            <div className="text-stone-700 italic pt-1 border-t border-stone-200/50">
                              &ldquo;{claProof.note}&rdquo;
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-stone-200/60">
                        <button
                          type="button"
                          onClick={() => setIsEditingCla(true)}
                          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer border border-stone-200"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                          <span>Cập nhật lại ảnh / Bổ sung ghi chú</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Unsigned / Editing State: Note input, Checkbox & Sign Button */
                    <div className="p-5 bg-stone-50 rounded-2xl space-y-4 border border-stone-200/70">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-stone-700">edit_note</span>
                          <span>Ghi chú hiện trường khi nhận đồ:</span>
                        </label>
                        <textarea
                          rows={2}
                          value={claProof.note}
                          onChange={(e) => setClaProof((prev) => ({ ...prev, note: e.target.value }))}
                          placeholder="Ví dụ: Bưu kiện nguyên vẹn, niêm phong Nanuk chưa bóc, đầy đủ phụ kiện theo danh mục..."
                          className="w-full p-3 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900"
                        />
                      </div>

                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="cla-confirm-check"
                          checked={claAgreed}
                          onChange={(e) => setClaAgreed(e.target.checked)}
                          className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
                        />
                        <label htmlFor="cla-confirm-check" className="text-xs text-stone-700 cursor-pointer select-none leading-relaxed">
                          Tôi cam kết đã trực tiếp nhận hàng, mở kiện kiểm tra ngoại quan thiết bị và đồng ý ký xác nhận biên bản bàn giao CLA điện tử bảo chứng Smart Escrow.
                        </label>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <span className="text-[11px] text-stone-500">
                          Người nhận: <strong className="text-stone-800">{orderData.recipientName || displayName}</strong> ({orderData.recipientPhone})
                        </span>
                        <div className="flex items-center gap-2">
                          {isEditingCla && (
                            <button
                              type="button"
                              onClick={() => setIsEditingCla(false)}
                              className="px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Hủy bỏ
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleSignCla}
                            disabled={!claAgreed}
                            className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-xs cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">draw</span>
                            <span>{claProof.isSigned ? 'Lưu cập nhật biên bản CLA' : 'Ký nhận & Xác nhận bàn giao CLA'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: FINANCIAL LEDGER & TRANSIT PROTOCOL (5 COLS) */}
              <div className="lg:col-span-5 space-y-8">
                {/* FINANCIAL LEDGER & ESCROW TRANSPARENCY (Border None) */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-none space-y-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
                      Bóc tách tài chính
                    </span>
                    <h3 className="font-serif text-xl font-bold text-stone-900">Sổ cái thanh toán &amp; Ký quỹ</h3>
                  </div>

                  {/* Ledger Line Items */}
                  <div className="space-y-3.5 text-xs">
                    {orderData.items.map((it) => (
                      <div key={it.id} className="flex justify-between items-center text-stone-700">
                        <span className="truncate max-w-[240px]">
                          Tiền thuê: {it.title} ({orderData.rentalDays} ngày)
                        </span>
                        <span className="font-semibold text-stone-900 shrink-0">{formatVnd(it.itemTotal)}</span>
                      </div>
                    ))}

                    <div className="flex justify-between items-center text-stone-500 pl-3">
                      <span>Tạm tính phí thuê thiết bị</span>
                      <span className="font-medium text-stone-700">{formatVnd(orderData.totalRentalFee)}</span>
                    </div>

                    <div className="h-px bg-stone-100 my-2"></div>

                    {orderData.items.map((it) => (
                      <div key={it.id} className="flex justify-between items-center text-stone-700">
                        <span className="flex items-center gap-1.5 truncate max-w-[240px]">
                          <span>Cọc Smart Escrow: {it.title}</span>
                          <span className="material-symbols-outlined text-emerald-600 text-[14px]" title="Hoàn 100%">
                            lock
                          </span>
                        </span>
                        <span className="font-semibold text-stone-900 shrink-0">{formatVnd(it.deposit)}</span>
                      </div>
                    ))}

                    <div className="flex justify-between items-center text-stone-500 pl-3">
                      <span>Tổng tiền ký quỹ bảo hộ (Đang khóa)</span>
                      <span className="font-bold text-emerald-700">{formatVnd(orderData.escrowDeposit)}</span>
                    </div>

                    <div className="h-px bg-stone-100 my-2"></div>

                    <div className="flex justify-between items-center text-stone-700">
                      <span>Phí bưu tá chuyên dụng Nanuk White-Glove (2 chiều)</span>
                      <span className="font-semibold text-stone-900">{formatVnd(orderData.shippingFee)}</span>
                    </div>

                    <div className="flex justify-between items-center text-emerald-800 font-medium">
                      <span>Mã ưu đãi tuần hoàn CIRCULAR2024</span>
                      <span>- 0₫ (Đã cấn trừ bảo hiểm)</span>
                    </div>

                    {/* Total Settled */}
                    <div className="pt-4 bg-stone-50 p-4 rounded-2xl space-y-1 border-none">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-stone-900 text-sm">Tổng quyết toán đã trả:</span>
                        <span className="font-bold text-xl text-stone-900">{formatVnd(orderData.grandTotal)}</span>
                      </div>
                      <div className="text-[11px] text-stone-500 flex justify-between">
                        <span>Trạng thái giao dịch:</span>
                        <span className="font-semibold text-emerald-700">Đã thanh toán 100% qua VNPay</span>
                      </div>
                    </div>
                  </div>

                  {/* Escrow Guarantee Callout (Border None) */}
                  <div className="bg-emerald-50 text-emerald-900 p-4 rounded-2xl text-xs space-y-2 border-none">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="material-symbols-outlined text-base text-emerald-700">shield_with_heart</span>
                      <span>Cam kết hoàn tiền cọc Smart Escrow</span>
                    </div>
                    <p className="text-emerald-800 leading-relaxed text-[11px]">
                      Toàn bộ <strong>{formatVnd(orderData.escrowDeposit)} tiền cọc</strong> đang được bảo lưu độc lập
                      trong tài khoản ký quỹ trung gian. Hệ thống tự động hoàn trả 100% về tài khoản VNPay / ngân hàng
                      nguồn của bạn trong 4 - 24 giờ sau khi thiết bị qua vòng kiểm tra Bench Lab.
                    </p>
                  </div>
                </div>

                {/* PAYMENT & INVOICE METADATA (Border None) */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-none space-y-5">
                  <h4 className="font-serif text-lg font-bold text-stone-900">Thông tin Cổng thanh toán</h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span className="text-stone-500">Cổng giao dịch</span>
                      <span className="font-semibold text-stone-800">{orderData.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span className="text-stone-500">Mã giao dịch (Trans ID)</span>
                      <span className="font-mono font-semibold text-stone-800">{orderData.transactionId}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span className="text-stone-500">Thời gian giao dịch</span>
                      <span className="font-semibold text-stone-800">{orderData.paymentTime}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-stone-500">Tình trạng quỹ</span>
                      <span className="font-semibold text-stone-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        {orderData.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveModal('invoice')}
                    className="w-full py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    <span className="material-symbols-outlined text-[17px]">download</span>
                    <span>Tải hóa đơn VAT &amp; Chứng thư ký quỹ</span>
                  </button>
                </div>

                {/* SHIPPING & WHITE-GLOVE TRACKING (Border None) */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-none space-y-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
                      Vận chuyển chuyên dụng
                    </span>
                    <h4 className="font-serif text-lg font-bold text-stone-900">Lộ trình giao nhận 2 chiều (Nanuk)</h4>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Outbound Delivery */}
                    <div className="p-3.5 rounded-2xl bg-stone-50 space-y-1.5 border-none">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-emerald-600">local_shipping</span>
                          <span>Chiều 1: Giao hàng đến bạn</span>
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border-none">
                          ĐÃ GIAO XONG
                        </span>
                      </div>
                      <p className="text-stone-500 text-[11px]">
                        Bưu tá Viettel Armored · Mã kiện #{orderData.trackingCode} · Giao lúc {orderData.outboundDate}
                      </p>
                    </div>

                    {/* Return Delivery */}
                    <div className="p-3.5 rounded-2xl bg-stone-50 space-y-1.5 border-none">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-stone-600">undo</span>
                          <span>Chiều 2: Thu hồi hoàn trả</span>
                        </span>
                        <span className="text-[10px] bg-stone-200 text-stone-800 font-bold px-2 py-0.5 rounded-full border-none">
                          ĐÃ ĐẶT LỊCH
                        </span>
                      </div>
                      <p className="text-stone-500 text-[11px]">
                        Khung giờ hẹn lấy: <strong>{orderData.returnTimeWindow}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Customer Destination Details */}
                  <div className="pt-2 space-y-2 text-xs border-none">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Địa chỉ lưu ký người thuê:</span>
                    <p className="font-semibold text-stone-800">
                      {orderData.recipientName} — {orderData.recipientPhone}
                    </p>
                    <p className="text-stone-600 leading-relaxed">{orderData.shippingAddress}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        'Mở bản đồ bưu tá thời gian thực Viettel Post Handoff: Chuyến xe sẵn sàng kích hoạt vào ngày 19/11.'
                      )
                    }
                    className="w-full py-2.5 rounded-xl border-none text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">map</span>
                    <span>Tra cứu vận đơn 2 chiều</span>
                  </button>
                </div>

                {/* SHOP OWNER CONCIERGE & SUPPORT (Border None) */}
                <div className="bg-stone-50 rounded-3xl p-6 sm:p-7 space-y-4 border-none">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-stone-900 text-white flex items-center justify-center font-serif text-lg font-bold border-none">
                      RH
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-stone-900">RedRiver &amp; Alpine Camp Concierge</h5>
                      <p className="text-[10px] text-stone-500">Đội ngũ kỹ thuật trực ban · Phản hồi trong 5 phút</p>
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Cần hướng dẫn căn chỉnh profile màu Canon C-Log3 hoặc cách dựng lều trong thời tiết gió cấp 5? Kỹ
                    thuật viên luôn túc trực hỗ trợ bạn.
                  </p>
                  <Link
                    to={`/chat?orderId=${orderData.code.replace('#', '')}`}
                    className="w-full py-3 rounded-2xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 border-none"
                  >
                    <span className="material-symbols-outlined text-[17px]">send</span>
                    <span>Mở cuộc trò chuyện kỹ thuật</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── MODALS (Border None) ── */}
      {/* 1. Bench Grade Modal */}
      {activeModal === 'bench' && selectedItemForModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 border-none relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border-none">
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </span>
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  Chứng thư Kiểm định Kỹ thuật (Bench Report)
                </h3>
                <p className="text-xs text-stone-500">{selectedItemForModal.title}</p>
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl space-y-2 text-xs border-none">
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Mã định danh Serial:</span>
                <span className="font-mono font-bold text-stone-800">{selectedItemForModal.serialNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Niêm chì Smart Seal:</span>
                <span className="font-mono font-bold text-stone-800">{selectedItemForModal.sealId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Phân hạng chất lượng:</span>
                <span className="font-bold text-emerald-700">{selectedItemForModal.grade}</span>
              </div>
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Kết quả đối soát phòng Lab:</span>
                <p className="text-stone-700 leading-relaxed mt-1 font-medium">
                  {selectedItemForModal.benchReportText}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 cursor-pointer border-none"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Complaint Modal */}
      {activeModal === 'complaint' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border-none relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center border-none">
                <span className="material-symbols-outlined text-[22px]">report_problem</span>
              </span>
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">Khiếu nại &amp; Trọng tài Escrow</h3>
                <p className="text-xs text-stone-500">Đơn lưu ký {orderData.code}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-stone-600">
              <p className="leading-relaxed">
                Đội ngũ Trust &amp; Safety ReUse Hub sẽ tạm đóng băng khoản cọc Smart Escrow và liên hệ đối soát hiện trường trong 30 phút.
              </p>
              <textarea
                rows={3}
                className="w-full p-3 rounded-xl border border-stone-300 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900"
                placeholder="Mô tả sự cố hoặc khác biệt so với biên bản bàn giao CLA ban đầu..."
              ></textarea>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 cursor-pointer border-none"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Đã tiếp nhận yêu cầu khiếu nại. Mã ticket kiểm định đã gửi về SMS của bạn.');
                  setActiveModal(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-700 text-white text-xs font-semibold hover:bg-rose-800 cursor-pointer border-none"
              >
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Invoice Modal */}
      {activeModal === 'invoice' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border-none text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border-none">
              <span className="material-symbols-outlined text-[24px]">task_alt</span>
            </div>

            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-stone-900">Đã khởi tạo Hóa đơn điện tử VAT</h3>
              <p className="text-xs text-stone-500">
                Liên kết tải Chứng thư ký quỹ Escrow và Hóa đơn điện tử hợp lệ đã được gửi tự động tới hòm thư:{' '}
                <strong className="text-stone-800">{displayEmail}</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 cursor-pointer border-none"
            >
              Đồng ý
            </button>
          </div>
        </div>
      )}

      {/* 4. Full Photo Preview Modal */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
          onClick={() => setPreviewImageModal(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] p-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewImageModal(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
            <img
              src={previewImageModal}
              alt="Chi tiết ảnh minh chứng"
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RentOrderDetail;

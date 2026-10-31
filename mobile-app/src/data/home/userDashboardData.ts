export interface ActiveRentalOrder {
  id: string;
  statusLabel: string;
  title: string;
  rentalPeriod: string;
  returnDeadline: string;
  escrowDeposit: number;
  progressPercent: number;
  progressNote: string;
  image: string;
  detailUrl: string;
  returnUrl: string;
}

export interface RecentThriftOrder {
  id: string;
  title: string;
  condition: string;
  price: number;
  badge?: string;
  status: string;
  warrantyNote: string;
  image: string;
  detailUrl: string;
}

export interface WishlistDashboardItem {
  id: string;
  mode: 'rent' | 'thrift';
  title: string;
  subtitle: string;
  price: number;
  priceUnit?: string;
  badge?: string;
  availabilityBadge?: string;
  image: string;
  href: string;
}

export interface CircularStep {
  step: number;
  title: string;
  desc: string;
  isHighlight?: boolean;
}

export interface RecommendedDashboardItem {
  id: string;
  mode: 'rent' | 'thrift';
  title: string;
  subtitle: string;
  categoryLabel: string;
  price: number;
  priceUnit?: string;
  meta: string;
  badge: string;
  badgeType: 'top' | 'bottom';
  image: string;
  href: string;
}

// ── Active Rental (Mock data) ──────────────────────────────────
export const MOCK_ACTIVE_RENTAL: ActiveRentalOrder = {
  id: '#RH-RNT-2024-8841',
  statusLabel: 'Đang lưu giữ ngày 6/10',
  title: 'Canon EOS R6 Mark II + Ống kính RF 24-70mm f/2.8L IS USM',
  rentalPeriod: '24/10/2024 – 03/11/2024',
  returnDeadline: '03/11/2024 (còn 4 ngày)',
  escrowDeposit: 12500000,
  progressPercent: 60,
  progressNote: 'Hạn chuẩn bị đóng hộp Nanuk',
  image: 'https://lh3.googleusercontent.com/aida/AEtjO1XwSFiAsbdIeTYS_K8ltZSjhavbAuHMuD2MWptDxAK8mmoo8xtjnBizyT9TJuQZJ9ZESoFv09YMKuy5aFN68t3I7XNClVZ62txJg3YrWyzrnaEjOuEkNb8FrtSw4TmSUupN5dnZep0fZgkChCv3SeTVSbB47N5EbF7kF620fI2gBdwsIToprYPtGPu95aXleqFVAZnCdbuxlhFirnyw1WPTHKmxtyfawsf7stJSbWTX',
  detailUrl: '/rent/orders/RH-RNT-2024-8841',
  returnUrl: '/rent/orders/RH-RNT-2024-8841/return',
};

// ── Recent THRIFT Orders (Mock data) ───────────────────────────
export const MOCK_RECENT_THRIFT_ORDERS: RecentThriftOrder[] = [
  {
    id: '#RH-THF-2024-1102',
    title: 'Máy ảnh Rangefinder Leica M6 Classic 0.72x',
    condition: 'Tình trạng: Grade Mint 98% · Nguồn ex-Rental',
    price: 68000000,
    badge: '1-OF-1',
    status: 'ĐÃ GIAO HÀNG',
    warrantyNote: 'Có chứng thư giám định',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    detailUrl: '/thrift/orders/RH-THF-2024-1102',
  },
  {
    id: '#RH-THF-2024-0985',
    title: 'Synthesizer Teenage Engineering OP-1 Field',
    condition: 'Tình trạng: Like New 99% · Đầy đủ phụ kiện',
    price: 32500000,
    status: 'ĐÃ GIAO HÀNG',
    warrantyNote: 'Bảo hành 72h hoàn tất',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80',
    detailUrl: '/thrift/orders/RH-THF-2024-0985',
  },
  {
    id: '#RH-THF-2024-0741',
    title: 'Ghế Lounge Vitra Eames LCM Gỗ Tự Nhiên',
    condition: 'Tình trạng: Archival Grade A · 1984 Edition',
    price: 28500000,
    status: 'ĐÃ GIAO HÀNG',
    warrantyNote: 'Chủ sở hữu vĩnh viễn',
    image: 'https://images.unsplash.com/photo-1580481077195-c3f990f1d158?auto=format&fit=crop&w=600&q=80',
    detailUrl: '/thrift/orders/RH-THF-2024-0741',
  },
];

// ── Default Curated Wishlist Catalog (Fallback if wishlist empty) ──
export const CURATED_WISHLIST_FALLBACK: WishlistDashboardItem[] = [
  {
    id: 'hasselblad-503cw',
    mode: 'rent',
    title: 'Hasselblad 503CW Medium Format',
    subtitle: 'Ống kính Carl Zeiss 80mm f/2.8',
    price: 450000,
    priceUnit: '/ ngày',
    badge: 'RENT',
    availabilityBadge: 'Sẵn sàng từ 08/11',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
    href: '/rent/products/hasselblad-503cw',
  },
  {
    id: 'snow-peak-alpha-breeze',
    mode: 'rent',
    title: 'Snow Peak Alpha Breeze 4P',
    subtitle: 'Lều dã ngoại cao cấp 4 mùa',
    price: 180000,
    priceUnit: '/ ngày',
    badge: 'RENT',
    availabilityBadge: 'Có sẵn ngay',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80',
    href: '/rent/products/snow-peak-alpha-breeze',
  },
  {
    id: 'yohji-yamamoto-wool-jacket',
    mode: 'thrift',
    title: 'Áo khoác Yohji Yamamoto Wool',
    subtitle: 'Archive 1998 · Size 3 (L)',
    price: 14850000,
    badge: 'THRIFT',
    availabilityBadge: '1-OF-1',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1XgAnbFVZbz3ZTTrM_CeQICGYKbo0TgfGm3fqQnK8eAJYLrVx7CsstxiDVMgL2PZPiTegkt14RtztySXkvbUqLYECr8pFFpunI0q49SWoyJRUnPhzMkvgyFAjFf2CjDlbmh3ZIBnpypDpmROlOmGCziV480rCFtB2XykP5E8MMSYtkb9_Q0WoOevVPLAki9lSwDgzu1AOm-74Mj120fWpu-xVD1MWrfM_jG7Z4K5W92',
    href: '/thrift/yohji-yamamoto-wool-jacket',
  },
  {
    id: 'fellow-stagg-ekg-pro',
    mode: 'thrift',
    title: 'Ấm điện rót Fellow Stagg EKG Pro',
    subtitle: 'Màu đen nhám · Dung tích 0.9L',
    price: 3450000,
    badge: 'THRIFT',
    availabilityBadge: 'Ex-Rental Grade A+',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?auto=format&fit=crop&w=600&q=80',
    href: '/thrift/fellow-stagg-ekg-pro',
  },
];

// ── Circular Lifecycle Steps ───────────────────────────────────
export const CIRCULAR_LIFECYCLE_STEPS: CircularStep[] = [
  { step: 1, title: 'RENT', desc: 'Khách thuê theo ngày linh hoạt' },
  { step: 2, title: 'USE', desc: 'Trải nghiệm dự án & sự kiện' },
  { step: 3, title: 'RETURN', desc: 'Đóng hộp Nanuk gửi hoàn trả' },
  { step: 4, title: 'INSPECT', desc: 'Shop Owner đối kiểm 14 bước' },
  { step: 5, title: 'REUSE', desc: 'Tiếp tục cho lượt khách kế tiếp' },
  { step: 6, title: 'THRIFT', desc: 'Chuyển giao quyền sở hữu vĩnh viễn', isHighlight: true },
];

// ── Recommended Products (Curated RENT & THRIFT) ───────────────
export const RECOMMENDED_DASHBOARD_ITEMS: RecommendedDashboardItem[] = [
  {
    id: 'rec-1',
    mode: 'rent',
    title: 'Loa di động Bose S1 Pro+ Wireless',
    subtitle: 'Kèm micro không dây Shure',
    categoryLabel: 'Âm thanh & Biểu diễn',
    price: 220000,
    priceUnit: '/ ngày',
    meta: 'Cọc 4.000.000₫',
    badge: 'GRADE A+',
    badgeType: 'top',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
    href: '/rent/products/bose-s1-pro-plus',
  },
  {
    id: 'rec-2',
    mode: 'thrift',
    title: 'Sony WH-1000XM5 Noise-Canceling',
    subtitle: 'Độ mới 97% · Hộp đựng nguyên bản',
    categoryLabel: 'Tai nghe cao cấp',
    price: 5850000,
    meta: 'Sở hữu vĩnh viễn',
    badge: 'Màu Bạc Platinum',
    badgeType: 'bottom',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    href: '/thrift/sony-wh-1000xm5',
  },
  {
    id: 'rec-3',
    mode: 'rent',
    title: 'Contax T2 Titanium 38mm f/2.8',
    subtitle: 'Ống kính Carl Zeiss Sonnar T*',
    categoryLabel: 'Máy ảnh phim Compact',
    price: 320000,
    priceUnit: '/ ngày',
    meta: 'Cọc 8.500.000₫',
    badge: 'ANALOG',
    badgeType: 'top',
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=600&q=80',
    href: '/rent/products/contax-t2-titanium',
  },
  {
    id: 'rec-4',
    mode: 'thrift',
    title: 'Bộ ấm tách Hasami Porcelain Japan',
    subtitle: 'Màu đen khói · Độ mới hoàn hảo 100%',
    categoryLabel: 'Đồ gia dụng thủ công',
    price: 2150000,
    meta: 'Sở hữu vĩnh viễn',
    badge: 'Craft Nhập Khẩu',
    badgeType: 'bottom',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
    href: '/thrift/hasami-porcelain-set',
  },
];

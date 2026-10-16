import { RENT_PRODUCTS, type Product as RentMarketProduct } from '../pages/data/rent/marketplaceData';
import { THRIFT_PRODUCTS, type ThriftProduct } from '../pages/data/thrift/thriftMarketplaceData';
import { RENT_PRODUCT_DETAILS_MAP } from '../pages/data/rent/rentOrderDetailData';
import {
  CAMERA_CATEGORY_CONFIG,
  FASHION_CATEGORY_CONFIG,
  SHOES_CATEGORY_CONFIG,
  CAMPING_CATEGORY_CONFIG,
  ELECTRONICS_CATEGORY_CONFIG,
  BOOKS_CATEGORY_CONFIG,
  LIFESTYLE_CATEGORY_CONFIG,
  type CategoryDetailProduct,
} from '../pages/data/categories/categoryDetailData';

export interface ResolvedWishlistProduct {
  id: string;
  mode: 'rent' | 'thrift';
  title: string;
  description: string;
  image: string;
  category: string;
  categoryLabel: string;
  gradeBadge: string;
  price: number;
  priceUnit: string;
  deposit: number;
  available: boolean;
  availabilityLabel: string;
  location: string;
  origin: string;
  certLabel: string;
  href: string;
}

// Known MongoDB products fallback dictionary
const MONGO_RENTAL_PRODUCTS: Record<string, Partial<ResolvedWishlistProduct>> = {
  '6acee0804c6e5d97a2389e53': {
    title: 'Canon EOS R6 Mark II Mirrorless Kit',
    description: 'Hiệu năng quay 4K 60p không crop, chống rung IBIS 8 stop hoàn hảo.',
    category: 'Camera & Quang học',
    categoryLabel: 'Camera',
    gradeBadge: 'Grade A+ (98%)',
    price: 500000,
    deposit: 2500000,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDm9RHp_nAFGyZAGYxDLuSj2aEJ1h1N-U9WI7PAFWW7ZyfVfl1i_9SppV5JiKn77I8cJ_bsDk1yKDbhK7ua6iE0__0FrQpGra28G6Yt_gWfXn44AauvwE85glJuv7mhovOe_fQm_64353WGhh-yXyasdXNywXSTsgjbqL6GWjRg7xe-alf5PYk6YJEQ4Ew9ZErc7V38NU-BCrvgK7m2VReo2j_s_PneV8IEQBWJ0hmx',
    location: 'TP. Hồ Chí Minh',
    mode: 'rent',
    href: '/rent/products/canon-r6m2',
  },
  '6acee0804c6e5d97a2389e52': {
    title: 'Snow Peak Alpha Breeze Camping Tent 4P',
    description: 'Lều dã ngoại 4 người cấu trúc vòm thông gió kép, vải chống thấm 150D Oxford.',
    category: 'Outdoor & Cắm trại',
    categoryLabel: 'Cắm trại',
    gradeBadge: 'Grade A (Sanitized)',
    price: 250000,
    deposit: 1000000,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB1UpAkWSNWMQ1I3uDPXGKoJ-9POEmgeq7YpIuQ79QNfhv4wiFY--5DWEuQmRz157eN8zUtLw0-UevOSecwGvpA0ZrRN9VGHK-2-C5pFiUfYSHUx2MqqlZVsl629nHldrxwTBy5kgIb-ZIWJuDAl_Qky-i9C9MXMvUbdPsXpBqf_6hXLn00pNo_aYsD8vvfLcMsOpvOBXd4efa0KQnDAZ_YWGvL09INihtDBxqszHib',
    location: 'Đà Nẵng',
    mode: 'rent',
    href: '/rent/products/snow-peak-alpha',
  },
  '6acee0804c6e5d97a2389e55': {
    title: 'Teenage Engineering OP-1 Field Synthesizer',
    description: 'Máy làm nhạc đa năng 32-bit stereo, vỏ nhôm anodized siêu nhẹ.',
    category: 'Âm thanh & Thiết bị số',
    categoryLabel: 'Thiết bị số',
    gradeBadge: 'Grade A+ (Full Box)',
    price: 320000,
    deposit: 1500000,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD9te3aJVYpGneDteUKFIdq6xEbIuYlTZXQ6bppTxwXer5UXL315L_slY8JybSWI0sElJdsxst5JeOU8COAV8d_9Id7BShJa1ubVjLBUxiuArZt_Us8GrKWyoDdUBpTh8Vu7ZJjF_FE_lY1wpNp-QphW1iJOowGOrHjdZJ0AhC0rxCOupCG6SMWnR7Fsnn3F6GWjyzYTa1UdOhqfDBBUNRlYARbhpYkepNnwYwEO5jd',
    location: 'Hà Nội',
    mode: 'rent',
    href: '/rent/products/teenage-op1',
  },
  '6acee0804c6e5d97a2389e56': {
    title: 'Loa Di Động Bose S1 Pro+ System',
    description: 'Hệ thống loa biểu diễn đa năng pin 11h, tích hợp mixer 3 kênh không dây.',
    category: 'Âm thanh & Thiết bị số',
    categoryLabel: 'Âm thanh',
    gradeBadge: 'Grade Mint 99%',
    price: 280000,
    deposit: 1200000,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDAMWq7Usi-8ij0sf0N2-H4NCl1ScKH5274kxXc8AYWyPFy16zT_Kmq3tNSf8LN7ozbRrV99cjXr3HGqO3GJ6PI3P7C3MRDNDCyXlrDzFp3bl8Vy8MCY_G5ZyYkN8df8vo1U6wxOmaDZyNehhN4Oh56uVjgr3kV6uo7bpxr_YUl2Mvvextk0D-dRSVdxpZ5pQYNkX9Qt4yECCk-T8LqKmHDOzynNhWqS_X5lmFv5_qy',
    location: 'TP. Hồ Chí Minh',
    mode: 'rent',
    href: '/rent/products/bose-s1-pro',
  },
  '6acee0804c6e5d97a2389e50': {
    title: 'Party Dress Thiết Kế Tối Giản',
    description: 'Đầm dạ tiệc lụa tơ tằm thiết kế tối giản, phom dáng chuẩn may đo cao cấp.',
    category: 'Thời trang dạ tiệc',
    categoryLabel: 'Thời trang',
    gradeBadge: 'Grade A+ (Như mới 99%)',
    price: 180000,
    deposit: 800000,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAtmXKLrFBh-ULvSwIfPH1-6Wt20ZZ6MVkUuMWLCglFjw1kWB6QFMzh2-V6BXtow5H6r3Mbt8RSgMy-DL2iSfu901WIFIU_yZfWuObWTRd4NoP9Nh1jctTIF7wGjHkgI4D5oxH6_dDBVra7zeHdkwYMXvpTTvPzpsf0XKcML75jinBrzziZBMszcYr5tYuRg6PC9_OCoBVNoPUb4MfpHrUPrGF2yzFQQLz7iIk6cPu5',
    location: 'Đà Nẵng',
    mode: 'rent',
    href: '/rent/products/party-dress',
  },
  '6acee0804c6e5d97a2389e51': {
    title: 'Classic Sneakers Da Thật Archive',
    description: 'Giày thể thao da thật xử lý patina cổ điển, đế khâu tay Goodyear Welted bền bỉ.',
    category: 'Giày & Phụ kiện da',
    categoryLabel: 'Giày',
    gradeBadge: 'Grade A (Rất tốt 95%)',
    price: 150000,
    deposit: 600000,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCBGX9MLaXkDPpkpvRKdy2axzNTQbnNx_zdNdPhaZIyGar7jQumeRDAiXCgdqV-vo2remereT9vKy1u0lXTPcTjUwHWw2BUN5nVjtbW3A7Kck2D8oSAuMlA4YWikHGVx2wLPa4O73p6BniZAEsLW2gaF64ui2yqlzuI6QxQw-FAJ6EEbSwiKl9WQGZVRuhW0izycAPRBT0Wp20b8b6yIXFPDTRtD61j3kfI03X6CBtE',
    location: 'Hà Nội',
    mode: 'rent',
    href: '/rent/products/classic-sneakers',
  },
  '6acee0804c6e5d97a2389e54': {
    title: 'Áo Khoác Dạ Wool Dáng Dài Cao Cấp',
    description: 'Chất liệu dạ len cừu tự nhiên 100%, lót lụa tơ tằm giữ ấm thanh lịch.',
    category: 'Thời trang lưu trữ',
    categoryLabel: 'Thời trang',
    gradeBadge: 'Grade Mint 98%',
    price: 220000,
    deposit: 900000,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBmFHFDSIg4hOhOPqA36mT1kkDCl3WPEhUJRK08XZrwDTHzuiTwpPS19S9rp72RfWd75ovkeghRObBnjMEjwjM4C-han-LYxuwvvmbNoQxfmQdJ0b32KcCw-X0Jnqe_U23o9wu4QRqi1jvm0k2QIjvQX3uucHyHqIp2-wcXnh_PJzwTUThv7mBwqwtAjiXdUPGAdc-I8uwnLjfVeTg2aWPw2sXhSqhHAp-MSwbmguRZ',
    location: 'Hà Nội',
    mode: 'rent',
    href: '/rent/products/wool-coat',
  },
};

const ALL_CATEGORY_CONFIGS = [
  CAMERA_CATEGORY_CONFIG,
  FASHION_CATEGORY_CONFIG,
  SHOES_CATEGORY_CONFIG,
  CAMPING_CATEGORY_CONFIG,
  ELECTRONICS_CATEGORY_CONFIG,
  BOOKS_CATEGORY_CONFIG,
  LIFESTYLE_CATEGORY_CONFIG,
];

/**
 * Tra cứu thông tin sản phẩm đầy đủ từ bất kỳ ID hoặc Slug nào
 */
export function resolveWishlistProduct(rawId: string): ResolvedWishlistProduct | null {
  if (!rawId) return null;
  const targetId = String(rawId).trim();
  const lower = targetId.toLowerCase();

  // 1. Kiểm tra MongoDB ID mapping
  if (MONGO_RENTAL_PRODUCTS[targetId]) {
    const m = MONGO_RENTAL_PRODUCTS[targetId];
    return {
      id: targetId,
      mode: m.mode || 'rent',
      title: m.title || 'Thiết bị lưu ký ReUse',
      description: m.description || 'Sản phẩm đạt chuẩn kiểm định ReUse Standard.',
      image: m.image || '',
      category: m.category || 'Thiết bị lưu ký',
      categoryLabel: m.categoryLabel || 'Lưu ký',
      gradeBadge: m.gradeBadge || 'Grade A+ (Bench Checked)',
      price: m.price || 200000,
      priceUnit: '/ ngày',
      deposit: m.deposit || 1000000,
      available: true,
      availabilityLabel: 'Có sẵn ngay',
      location: m.location || 'TP. Hồ Chí Minh',
      origin: 'Nanuk White-Glove',
      certLabel: 'Smart Escrow',
      href: m.href || `/rent/products/${targetId}`,
    };
  }

  // 2. Tra cứu trong RENT_PRODUCTS (Marketplace RENT)
  const rentMarket = RENT_PRODUCTS.find(
    (p: RentMarketProduct) =>
      p.id === targetId ||
      p.id.toLowerCase() === lower ||
      p.href.toLowerCase().endsWith(`/${lower}`) ||
      p.title.toLowerCase().includes(lower)
  );
  if (rentMarket) {
    const depNum = parseInt(rentMarket.deposit.replace(/\D/g, ''), 10) || rentMarket.price * 5;
    return {
      id: rentMarket.id,
      mode: 'rent',
      title: rentMarket.title,
      description: `Thiết bị lưu giữ tại kho ${rentMarket.location}, chuẩn kiểm định ${rentMarket.conditionLabel}.`,
      image: rentMarket.image,
      category: rentMarket.categoryLabel || 'Camera & Thiết bị',
      categoryLabel: rentMarket.categoryLabel || 'Thuê',
      gradeBadge: rentMarket.conditionLabel || 'Grade A+ (Bench Checked)',
      price: rentMarket.price,
      priceUnit: '/ ngày',
      deposit: depNum,
      available: rentMarket.available,
      availabilityLabel: rentMarket.available ? 'Có sẵn ngay' : 'Đang thuê',
      location: rentMarket.location,
      origin: 'Smart Escrow ReUse',
      certLabel: 'Smart Escrow',
      href: rentMarket.href,
    };
  }

  // 3. Tra cứu trong THRIFT_PRODUCTS (Marketplace THRIFT)
  const thriftMarket = THRIFT_PRODUCTS.find(
    (p: ThriftProduct) =>
      p.id === targetId ||
      p.slug === targetId ||
      p.id.toLowerCase() === lower ||
      p.slug.toLowerCase() === lower ||
      p.href.toLowerCase().endsWith(`/${lower}`)
  );
  if (thriftMarket) {
    return {
      id: thriftMarket.id,
      mode: 'thrift',
      title: thriftMarket.title,
      description: `Đồ sưu tầm độc bản tuyển chọn từ Atelier, nguồn gốc: ${thriftMarket.sourceLabel}.`,
      image: thriftMarket.image,
      category: thriftMarket.categoryLabel || 'Đồ sưu tầm THRIFT',
      categoryLabel: thriftMarket.categoryLabel || 'Thrift',
      gradeBadge: thriftMarket.condition || 'Grade A Mint',
      price: thriftMarket.price,
      priceUnit: '',
      deposit: 0,
      available: true,
      availabilityLabel: '1-OF-1 ARCHIVE',
      location: thriftMarket.location,
      origin: thriftMarket.verifiedBy || 'Tokyo Vault',
      certLabel: 'Silvergrain Certified',
      href: thriftMarket.href,
    };
  }

  // 4. Tra cứu trong RENT_PRODUCT_DETAILS_MAP
  if (RENT_PRODUCT_DETAILS_MAP[targetId]) {
    const detail = RENT_PRODUCT_DETAILS_MAP[targetId];
    return {
      id: detail.id,
      mode: 'rent',
      title: detail.title,
      description: detail.overview?.[0] || detail.subtitle,
      image: detail.images?.[0]?.src || '',
      category: detail.category || 'Camera & Quang học',
      categoryLabel: detail.category,
      gradeBadge: detail.grade || 'Grade A+ (Bench Checked)',
      price: detail.pricePerDay,
      priceUnit: '/ ngày',
      deposit: detail.deposit,
      available: true,
      availabilityLabel: 'Có sẵn ngay',
      location: detail.location || 'Đà Nẵng',
      origin: 'Nanuk 920 Box',
      certLabel: 'Smart Escrow',
      href: `/rent/products/${detail.slug || detail.id}`,
    };
  }

  // 5. Tra cứu trong tất cả các Category configs (rentItems & thriftItems)
  for (const cat of ALL_CATEGORY_CONFIGS) {
    // Check rentItems
    const rItem = cat.rentItems.find(
      (it: CategoryDetailProduct) =>
        it.id === targetId ||
        it.id.toLowerCase() === lower ||
        it.href.toLowerCase().endsWith(`/${lower}`)
    );
    if (rItem) {
      return {
        id: rItem.id,
        mode: 'rent',
        title: rItem.title,
        description: rItem.description,
        image: rItem.image,
        category: cat.title,
        categoryLabel: cat.title,
        gradeBadge: rItem.gradeBadge || 'Grade A+ (Bench Checked)',
        price: rItem.price,
        priceUnit: '/ ngày',
        deposit: rItem.deposit || rItem.price * 5,
        available: true,
        availabilityLabel: 'Có sẵn ngay',
        location: rItem.locationBadge || 'Toàn quốc',
        origin: 'ReUse Hub Escrow',
        certLabel: 'Smart Escrow',
        href: rItem.href,
      };
    }

    // Check thriftItems
    const tItem = cat.thriftItems.find(
      (it: CategoryDetailProduct) =>
        it.id === targetId ||
        it.id.toLowerCase() === lower ||
        it.href.toLowerCase().endsWith(`/${lower}`)
    );
    if (tItem) {
      return {
        id: tItem.id,
        mode: 'thrift',
        title: tItem.title,
        description: tItem.description,
        image: tItem.image,
        category: cat.title,
        categoryLabel: cat.title,
        gradeBadge: tItem.gradeBadge || 'Grade A Mint',
        price: tItem.price,
        priceUnit: '',
        deposit: 0,
        available: true,
        availabilityLabel: '1-OF-1 ARCHIVE',
        location: tItem.locationBadge || 'Toàn quốc',
        origin: 'Atelier Vault',
        certLabel: 'Silvergrain Certified',
        href: tItem.href,
      };
    }
  }

  return null;
}

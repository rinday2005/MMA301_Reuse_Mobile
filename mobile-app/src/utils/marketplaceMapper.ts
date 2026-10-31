import { formatCurrency } from './formatCurrency';
import { normalizeImageUrl } from './imageUrl';

export interface MarketItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  depositAmount?: number;
  deposit?: string;
  image: string;
  images: string[];
  condition: string;
  category: string;
  categoryId: string;
  categorySlug: string;
  location: string;
  description: string;
  rentalRules?: string;
  quantity?: number;
  status?: string;
  sourceType?: string;
  mode: 'rent' | 'thrift';
  badge: string;
}

const readCategory = (raw: any) => {
  const c = raw?.categoryId && typeof raw.categoryId === 'object' ? raw.categoryId : raw?.category;
  if (c && typeof c === 'object') {
    return {
      id: String(c._id || c.id || ''),
      name: String(c.name || ''),
      slug: String(c.slug || ''),
    };
  }
  return {
    id: typeof raw?.categoryId === 'string' ? raw.categoryId : '',
    name: typeof raw?.category === 'string' ? raw.category : '',
    slug: '',
  };
};

const readImages = (raw: any): string[] => {
  const list = Array.isArray(raw?.images) ? raw.images : raw?.image ? [raw.image] : [];
  const mapped = list.filter(Boolean).map((u: string) => normalizeImageUrl(u));
  return mapped.length > 0 ? mapped : [normalizeImageUrl('')];
};

/** Trạng thái "LIKE_NEW" -> nhãn tiếng Việt dễ đọc */
export const prettyCondition = (c?: string): string => {
  if (!c) return 'Như mới';
  const map: Record<string, string> = {
    NEW: 'Mới 100%',
    LIKE_NEW: 'Như mới (99%)',
    GOOD: 'Tốt (90%)',
    FAIR: 'Khá (80%)',
    USED: 'Đã qua sử dụng',
  };
  return map[c] || c;
};

export const mapRentItem = (raw: any, index = 0): MarketItem => {
  const cat = readCategory(raw);
  const images = readImages(raw);
  const price = Number(raw?.pricePerDay ?? raw?.price ?? 0);
  const depositAmount = Number(raw?.depositAmount ?? 0);
  return {
    id: String(raw?._id || raw?.id || `rent_${index}`),
    title: raw?.name || raw?.title || 'Sản phẩm cho thuê',
    price,
    depositAmount,
    deposit: depositAmount > 0 ? formatCurrency(depositAmount) : undefined,
    image: images[0],
    images,
    condition: prettyCondition(raw?.condition),
    category: cat.name || 'Sản phẩm',
    categoryId: cat.id,
    categorySlug: cat.slug,
    location: raw?.location || 'Toàn quốc',
    description: raw?.description || '',
    rentalRules: raw?.rentalRules,
    quantity: raw?.totalQuantity,
    status: raw?.status,
    mode: 'rent',
    badge: 'RENT',
  };
};

export const mapThriftItem = (raw: any, index = 0): MarketItem => {
  const cat = readCategory(raw);
  const images = readImages(raw);
  const price = Number(raw?.price ?? 0);
  const condition = prettyCondition(raw?.condition);
  const pct = condition.match(/\d+%/)?.[0];
  const sold = raw?.status === 'SOLD' || (raw?.quantity !== undefined && raw.quantity <= 0);
  return {
    id: String(raw?._id || raw?.id || `thrift_${index}`),
    title: raw?.name || raw?.title || 'Sản phẩm thanh lý',
    price,
    originalPrice: raw?.originalPrice ? Number(raw.originalPrice) : Math.round(price * 1.35),
    image: images[0],
    images,
    condition,
    category: cat.name || 'Sản phẩm',
    categoryId: cat.id,
    categorySlug: cat.slug,
    location: raw?.location || 'Toàn quốc',
    description: raw?.description || '',
    quantity: raw?.quantity,
    status: raw?.status,
    sourceType: raw?.sourceType,
    mode: 'thrift',
    badge: sold ? 'ĐÃ BÁN' : pct ? `${pct} MỚI` : 'THRIFT',
  };
};


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

export const slugFromName = (name: string): string => {
  const n = (name || '').toLowerCase().trim();
  if (n.includes('camera') || n.includes('máy ảnh') || n.includes('quang học')) return 'camera';
  if (n.includes('giày') || n.includes('shoe') || n.includes('sneaker') || n.includes('sandal') || n.includes('boot')) return 'shoes';
  if (n.includes('đầm') || n.includes('dam') || n.includes('dạ hội') || n.includes('tiệc')) return 'dam-du-tiec';
  if (n.includes('quần') || n.includes('áo') || n.includes('clothing') || n.includes('thời trang') || n.includes('fashion') || n.includes('blazer') || n.includes('trench')) return 'clothing';
  if (n.includes('phụ kiện') || n.includes('phu-kien') || n.includes('accessory') || n.includes('trang sức')) return 'phu-kien';
  if (n.includes('điện tử') || n.includes('electronic') || n.includes('âm thanh') || n.includes('loa') || n.includes('tai nghe')) return 'electronics';
  if (n.includes('cắm trại') || n.includes('dã ngoại') || n.includes('camping')) return 'camping';
  if (n.includes('phong cách') || n.includes('lifestyle')) return 'lifestyle';
  return n
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export const nameFromSlug = (slug: string): string => {
  const s = (slug || '').toLowerCase().trim();
  switch (s) {
    case 'camera':
      return 'Camera';
    case 'shoes':
    case 'giay-dep':
      return 'Giày dép';
    case 'clothing':
    case 'quan-ao':
    case 'fashion':
      return 'Quần áo';
    case 'dam-du-tiec':
    case 'dress':
      return 'Đầm dự tiệc';
    case 'phu-kien':
    case 'accessories':
      return 'Phụ kiện';
    case 'electronics':
    case 'dien-tu':
      return 'Thiết bị điện tử';
    case 'camping':
    case 'da-ngoai':
      return 'Dã ngoại & Cắm trại';
    case 'lifestyle':
      return 'Đồ phong cách sống';
    default:
      return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Sản phẩm';
  }
};

export const inferCategory = (title: string, desc = ''): { name: string; slug: string } => {
  const text = `${title} ${desc}`.toLowerCase();

  if (
    text.includes('camera') ||
    text.includes('máy ảnh') ||
    text.includes('leica') ||
    text.includes('fujifilm') ||
    text.includes('canon') ||
    text.includes('sony a') ||
    text.includes('nikon') ||
    text.includes('lens') ||
    text.includes('ống kính') ||
    text.includes('gimbal')
  ) {
    return { name: 'Camera', slug: 'camera' };
  }

  if (
    text.includes('giày') ||
    text.includes('sneaker') ||
    text.includes('sandal') ||
    text.includes('loafer') ||
    text.includes('derby') ||
    text.includes('boot') ||
    text.includes('guốc') ||
    text.includes('cao gót')
  ) {
    return { name: 'Giày dép', slug: 'shoes' };
  }

  if (
    text.includes('đầm') ||
    text.includes('dạ hội') ||
    text.includes('sequin') ||
    text.includes('maxi') ||
    text.includes('dự tiệc') ||
    text.includes('váy tiệc') ||
    text.includes('party dress')
  ) {
    return { name: 'Đầm dự tiệc', slug: 'dam-du-tiec' };
  }

  if (
    text.includes('quần') ||
    text.includes('áo') ||
    text.includes('blazer') ||
    text.includes('trench coat') ||
    text.includes('jacket') ||
    text.includes('chân váy') ||
    text.includes('tweed') ||
    text.includes('vest') ||
    text.includes('suit') ||
    text.includes('cardigan') ||
    text.includes('sơ mi') ||
    text.includes('thời trang') ||
    text.includes('váy')
  ) {
    return { name: 'Quần áo', slug: 'clothing' };
  }

  if (
    text.includes('túi') ||
    text.includes('balo') ||
    text.includes('backpack') ||
    text.includes('vòng') ||
    text.includes('lắc tay') ||
    text.includes('dây chuyền') ||
    text.includes('kính') ||
    text.includes('thắt lưng') ||
    text.includes('bông tai') ||
    text.includes('khuyên tai') ||
    text.includes('trâm') ||
    text.includes('quạt') ||
    text.includes('phụ kiện')
  ) {
    return { name: 'Phụ kiện', slug: 'phu-kien' };
  }

  if (
    text.includes('loa') ||
    text.includes('tai nghe') ||
    text.includes('sound') ||
    text.includes('bose') ||
    text.includes('synthesizer') ||
    text.includes('op-1') ||
    text.includes('ipad') ||
    text.includes('apple') ||
    text.includes('điện tử') ||
    text.includes('electronics')
  ) {
    return { name: 'Thiết bị điện tử', slug: 'electronics' };
  }

  if (
    text.includes('lều') ||
    text.includes('camping') ||
    text.includes('dã ngoại') ||
    text.includes('bếp cắm trại')
  ) {
    return { name: 'Dã ngoại & Cắm trại', slug: 'camping' };
  }

  return { name: 'Đồ phong cách sống', slug: 'lifestyle' };
};

const readCategory = (raw: any) => {
  const c = raw?.categoryId && typeof raw.categoryId === 'object' ? raw.categoryId : raw?.category;
  let id = '';
  let name = '';
  let slug = '';

  if (c && typeof c === 'object') {
    id = String(c._id || c.id || '');
    name = String(c.name || '');
    slug = String(c.slug || '');
  } else {
    id = typeof raw?.categoryId === 'string' ? raw.categoryId : '';
    name = typeof raw?.categoryLabel === 'string' ? raw.categoryLabel : typeof raw?.category === 'string' ? raw.category : '';
    slug = typeof raw?.categorySlug === 'string' ? raw.categorySlug : '';
  }

  if (name && !slug) {
    slug = slugFromName(name);
  } else if (slug && !name) {
    name = nameFromSlug(slug);
  }

  return { id, name, slug };
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
  const title = raw?.name || raw?.title || 'Sản phẩm cho thuê';

  let catName = cat.name;
  let catSlug = cat.slug;

  if (!catName || catName === 'Sản phẩm' || !catSlug || catSlug === 'lifestyle') {
    const inferred = inferCategory(title, raw?.description);
    if (!catName || catName === 'Sản phẩm') catName = inferred.name;
    if (!catSlug || catSlug === 'lifestyle') {
      catSlug = inferred.slug;
      if (inferred.slug !== 'lifestyle') catName = inferred.name;
    }
  }

  if (!catSlug && catName) catSlug = slugFromName(catName);
  if (!catName && catSlug) catName = nameFromSlug(catSlug);

  return {
    id: String(raw?._id || raw?.id || `rent_${index}`),
    title,
    price,
    depositAmount,
    deposit: depositAmount > 0 ? formatCurrency(depositAmount) : undefined,
    image: images[0],
    images,
    condition: prettyCondition(raw?.condition),
    category: catName || 'Sản phẩm',
    categoryId: cat.id,
    categorySlug: catSlug || 'all',
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
  const title = raw?.name || raw?.title || 'Sản phẩm thanh lý';

  let catName = cat.name;
  let catSlug = cat.slug;

  if (
    !catName ||
    catName === 'Sản phẩm' ||
    catName === 'Sản phẩm thanh lý' ||
    !catSlug ||
    catSlug === 'lifestyle' ||
    catName === 'Đồ phong cách sống'
  ) {
    const inferred = inferCategory(title, raw?.description);
    if (!catName || catName === 'Sản phẩm' || catName === 'Sản phẩm thanh lý') {
      catName = inferred.name;
    }
    if (!catSlug || catSlug === 'lifestyle') {
      catSlug = inferred.slug;
      if (inferred.slug !== 'lifestyle') {
        catName = inferred.name;
      }
    }
  }

  if (!catSlug && catName) catSlug = slugFromName(catName);
  if (!catName && catSlug) catName = nameFromSlug(catSlug);

  return {
    id: String(raw?._id || raw?.id || `thrift_${index}`),
    title,
    price,
    originalPrice: raw?.originalPrice ? Number(raw.originalPrice) : Math.round(price * 1.35),
    image: images[0],
    images,
    condition,
    category: catName || 'Sản phẩm',
    categoryId: cat.id,
    categorySlug: catSlug || 'all',
    location: raw?.location || 'Toàn quốc',
    description: raw?.description || '',
    quantity: raw?.quantity,
    status: raw?.status,
    sourceType: raw?.sourceType,
    mode: 'thrift',
    badge: sold ? 'ĐÃ BÁN' : pct ? `${pct} MỚI` : 'THRIFT',
  };
};


// ─── Types ───────────────────────────────────────────────────────────────────

export type CategoryFilterKey = 'all' | 'rent' | 'thrift' | 'optical' | 'fashion' | 'camping';

export interface CategoryFilterOption {
  key: CategoryFilterKey;
  label: string;
}

export interface CategoryItem {
  id: string;
  code: string;
  slug: string;
  title: string;
  description: string;
  subtitle: string;
  tags: ('rent' | 'thrift' | 'optical' | 'fashion' | 'camping')[];
  spanClass: string;
  image: string;
  alt: string;
  rentCount: number;
  thriftCount: number;
  href: string;
  categoryQuery: string;
  isThriftOnly?: boolean;
  thriftCustomBadge?: string;
}

export interface CategoryMetric {
  value: string;
  label: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

export const CATEGORY_FILTER_OPTIONS: CategoryFilterOption[] = [
  { key: 'all', label: 'Tất cả danh mục' },
  { key: 'rent', label: 'Có thể RENT' },
  { key: 'thrift', label: 'Có hàng THRIFT' },
  { key: 'optical', label: 'Thiết bị quang học' },
  { key: 'fashion', label: 'Thời trang bền vững' },
  { key: 'camping', label: 'Outdoor & Camping' },
];

export const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: 'cameras',
    code: 'CAT.01',
    slug: 'cameras',
    title: 'Camera & Thiết bị Quang học',
    description:
      'Máy ảnh và thiết bị chụp hình cho những chuyến đi và khoảnh khắc đáng nhớ. Đầy đủ dòng máy film vintage lẫn mirrorless hiện đại.',
    subtitle: 'Bao gồm body, lens prime & gimbal',
    tags: ['rent', 'thrift', 'optical'],
    spanClass: 'lg:col-span-7',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBCiuIvnSlvlPHfRYWN3kvVrSBf-X-NXh3IOKA2bmcfyxUoiAJ9MmzsZz0zqHz8KE7Nso8XF2rgckdUaH1_Uqw-6kX36GVw8hLbF0mnWg1dfrfs9E32RYGdz53gzL5M4BdI0ijpd9hm_I9ZB5LQFR2taIbJqQnaIPLuxsqAXRjgaT2DeTavUVuTZX4oTIxtj0aft9Zcf0o_EjFwLUWLlIez1PBTsvg6s_yE3xZITw4V',
    alt: 'Vintage Leica rangefinder và máy ảnh Sony mirrorless trên bàn vải tự nhiên',
    rentCount: 86,
    thriftCount: 56,
    href: '/categories/cameras',
    categoryQuery: 'Camera',
  },
  {
    id: 'fashion',
    code: 'CAT.02',
    slug: 'fashion',
    title: 'Quần áo & Thời trang',
    description:
      'Trang phục, outfit sự kiện và những món đồ thời trang được chọn lọc từ các thương hiệu thiết kế cao cấp và phong cách minimalism.',
    subtitle: 'Archive · Vintage Designer',
    tags: ['rent', 'thrift', 'fashion'],
    spanClass: 'lg:col-span-5',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDr11lugRFs6zsTZmVNcSME1kz5ux0hrbhG-XXQIm-4f_Il3Ph0g2dfju2PRWd9mMYXMfmHERjkL-hVp0ST8G57HyLKQMKwch2lGXi8VO5inPOi-UheEjaLYAw9obCpHmmVoMwXTB-eKiEKc91qiIRL2ZvfIqwHo9c_zlo5Cy9awI7f7Bj6wlaCbBpKvRFujIRBV6BYZpAdrJKvBz3El5u-XzeepTcLdF3MoxY-WLH6',
    alt: 'Trang phục thiết kế tự nhiên, áo trench coat len và sơ mi linen tối giản',
    rentCount: 42,
    thriftCount: 98,
    href: '/categories/fashion',
    categoryQuery: 'Fashion',
  },
  {
    id: 'shoes',
    code: 'CAT.03',
    slug: 'shoes',
    title: 'Giày dép & Sneakers',
    description:
      'Giày sneaker và những đôi giày da đã sẵn sàng cho vòng đời tiếp theo. Đã vệ sinh và khử trùng theo tiêu chuẩn chuyên sâu.',
    subtitle: 'Khử khuẩn UV 100%',
    tags: ['rent', 'thrift', 'fashion'],
    spanClass: 'lg:col-span-4',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuACMscvmXGwh7zyGaJb19IGg6jPGmEHKJYQLEwi3bCyZrwcBMcZ6uRSSWJDetS72ao2M3ENr_Pq2AQYDF98dZf4mJR2Xe9TQ3llFPVdaj5wm-71MNeZE_pMSl0jUTPzv-jluamlcKRAc_fra-DM9oKdekcwzNdTAu66YfNE5ED2hbfZ2iwYnoBuj1lRqK-MSEioVaZ_ox_3eaiTrU8VdcefZDS_mteTeek9wggXh9aa',
    alt: 'Giày da derby cổ điển và sneaker retro tối giản trên bục đá tự nhiên',
    rentCount: 18,
    thriftCount: 45,
    href: '/categories/shoes',
    categoryQuery: 'Shoes',
  },
  {
    id: 'camping',
    code: 'CAT.04',
    slug: 'camping',
    title: 'Đồ Cắm trại & Dã ngoại',
    description:
      'Lều trại, bàn ghế dã ngoại và phụ kiện outdoor chuyên dụng từ Snow Peak, Helinox cho trải nghiệm thiên nhiên trọn vẹn.',
    subtitle: 'Snow Peak · Helinox',
    tags: ['rent', 'thrift', 'camping'],
    spanClass: 'lg:col-span-4',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAd_D53_38Ev-1TokH4F_TfqbdUtHiK48ilZ-EYWj9REd6xWak2t_AhiA2oglxD03sKZS1kevOX0_S9CWRLHBIRKLoW8JDXUQgWyAbYQilWUvmbZJrPMWsH5oiTDv4HrrSEcbIEiM9cqKSTcbI2E09YHOUog4PrvSPaNd3TzAElrTLw31Dx-MoYos7OyZPSeVZRBRsRuHmoGPSxvJcc1FKUL3y7UDSrhdmUPE6r0pWI',
    alt: 'Lều vải canvas giữa rừng thông buổi hoàng hôn kèm bộ ghế dã ngoại cao cấp',
    rentCount: 34,
    thriftCount: 12,
    href: '/categories/camping',
    categoryQuery: 'Camping',
  },
  {
    id: 'electronics',
    code: 'CAT.05',
    slug: 'electronics',
    title: 'Điện tử & Thiết bị Sáng tạo',
    description:
      'Bộ tổng hợp âm thanh synth, bàn phím cơ, loa hi-fi và thiết bị âm thanh studio được kiểm định mạch điện tử chuẩn xác.',
    subtitle: 'Teenage Engineering · Synth',
    tags: ['rent', 'thrift'],
    spanClass: 'lg:col-span-4',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAw3qkuVrSWLbHbAlmxZIPTjsM3I7fh1adJwmR5btI9-hIj7YJV5LuYM90FKLVeSsjru0R37_hJMN1ORhzYjvT2xyrmvOQeiXz2yuqdSY8q6COFVq00acZqkoKi8nvWymlzMwqrf8FPassQibzuwuGnm1hLrvsOJJOydnps6szVHuInPMVvwgn2yFGkyNpaDw990PTnh4jykFC_INDwR4rZ1g8-oO7mk1tmfXQUcoZB',
    alt: 'Thiết bị tổng hợp âm thanh Thụy Điển, bàn phím cơ và loa kiểm âm gỗ trên bàn làm việc',
    rentCount: 28,
    thriftCount: 19,
    href: '/categories/electronics',
    categoryQuery: 'Audio',
  },
  {
    id: 'books',
    code: 'CAT.06',
    slug: 'books',
    title: 'Sách & Ấn phẩm Nghệ thuật',
    description:
      'Sách ảnh nghệ thuật, tạp chí kiến trúc và ấn bản hiếm đã qua sưu tập, bảo tồn nguyên vẹn giá trị thẩm mỹ và tri thức.',
    subtitle: 'Architecture · Fine Art · Photobook',
    tags: ['thrift'],
    spanClass: 'lg:col-span-6',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB_kMKm_m5K0m17mrXgQIUGByVBruHE0zi_oC4o77bIzNSIisPN_tKzDNKqEhmEorCRNznRk0iJAD0XOJMsDi3JAtNP_2AFJP2YT5px-GbBPL1MmEmSfoUe5XfoKyHXE39H5LKWGsLx0NU0RrYj7cwqiSNbRACTLOJdGPMdecIZBZlo6qCi8t1SKw0ShsZYnNckNAfAvItfJA3YBswNZTg7rcOTYj0GHTLKcdn-9o-W',
    alt: 'Bộ sưu tập sách chuyên khảo nghệ thuật, tạp chí typography và kiến trúc Nhật Bản',
    rentCount: 0,
    thriftCount: 36,
    href: '/categories/books',
    categoryQuery: 'Books',
    isThriftOnly: true,
    thriftCustomBadge: '36 Ấn bản',
  },
  {
    id: 'lifestyle',
    code: 'CAT.07',
    slug: 'lifestyle',
    title: 'Lifestyle & Đồ gia dụng',
    description:
      'Bình gốm thủ công, ấm đun pour-over, nội thất mid-century và phụ kiện đời sống mang hơi thở kiến trúc tối giản.',
    subtitle: 'Ceramic · Furniture · Coffee Gear',
    tags: ['rent', 'thrift'],
    spanClass: 'lg:col-span-6',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCaAcYdGx1cyVAhwelkIJqHl03ssXKej0AAalG0_vh1Bb5rGApuWwaVbV8VJ2xPOMGB2nKynkviMvuJlANvvk6g0Tt44C4b58-OrKhPLhBlCG3gV4MXPaq8mo_l-X9vHsjhddcSl-Dhv1nYQcgGojz00BMV34c6Vwgpm_4-wKVNiDkGW-44O1Vw24zgig2z0mJP3u8ux1vqFFsSvzFVlEbuVPeF8eYmDbvHbrVE5aJc',
    alt: 'Ấm trà gốm thủ công, phễu pha cà phê đồng và ghế gỗ sồi phong cách Scandinavian',
    rentCount: 15,
    thriftCount: 48,
    href: '/categories/lifestyle',
    categoryQuery: 'Decor',
  },
];

export const CATEGORY_METRICS: CategoryMetric[] = [
  { value: '100%', label: 'Khử trùng y tế' },
  { value: '72h', label: 'Bảo hành đổi trả' },
  { value: '5,200+', label: 'Vòng đời đã tái tạo' },
];

export function getCategoryBySlug(slug?: string): CategoryItem | undefined {
  if (!slug) return undefined;
  return CATEGORIES_DATA.find((c) => c.slug === slug || c.id === slug);
}

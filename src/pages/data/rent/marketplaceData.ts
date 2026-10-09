export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  condition: string;
  conditionLabel: string;
  location: string;
  deposit: string;
  available: boolean;
  href: string;
  categoryLabel: string;
  image: string;
}

export type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

export interface SortOption {
  key: SortKey;
  label: string;
}

export interface RentProcessStep {
  step: string;
  title: string;
  desc: string;
}

export const RENT_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Sony Alpha A7 IV Kit',
    category: 'Camera',
    categoryLabel: 'Camera',
    price: 450000,
    rating: 4.9,
    reviewCount: 128,
    condition: 'Rất tốt',
    conditionLabel: 'Rất tốt 95%',
    location: 'Đà Nẵng',
    deposit: '2.000.000đ',
    available: true,
    href: '/rent/products/sony-alpha',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVnSQ6kvsJ6DxJIvv2pi3AAWJYbGWlRw8oTuyWmVCDILWkQsLSfvD01kMlL9OXDn9YM1K6JYsZivR7ONBnoowg5ng5rnDV6Jr5Z8wD-KrpaLR4fpcu5NCf6i6HQwrd8WI3xqykuYx3ol5LZ9QO3agKknyMUT-2QZmrKNoCBRBjK8nq72d4HvE_ZagqStc9b8LcNnrAbk5HuLJpMBFOWJJhqF6a3k7eHnMQH2cqG3Zg',
  },
  {
    id: '2',
    title: 'Party Dress Thiết Kế Tối Giản',
    category: 'Fashion',
    categoryLabel: 'Thời trang',
    price: 180000,
    rating: 4.8,
    reviewCount: 84,
    condition: 'Như mới',
    conditionLabel: 'Như mới 99%',
    location: 'Đà Nẵng',
    deposit: '800.000đ',
    available: true,
    href: '/rent/products/party-dress',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtmXKLrFBh-ULvSwIfPH1-6Wt20ZZ6MVkUuMWLCglFjw1kWB6QFMzh2-V6BXtow5H6r3Mbt8RSgMy-DL2iSfu901WIFIU_yZfWuObWTRd4NoP9Nh1jctTIF7wGjHkgI4D5oxH6_dDBVra7zeHdkwYMXvpTTvPzpsf0XKcML75jinBrzziZBMszcYr5tYuRg6PC9_OCoBVNoPUb4MfpHrUPrGF2yzFQQLz7iIk6cPu5',
  },
  {
    id: '3',
    title: 'Classic Sneakers Da Thật Archive',
    category: 'Fashion',
    categoryLabel: 'Giày dép',
    price: 150000,
    rating: 4.7,
    reviewCount: 52,
    condition: 'Rất tốt',
    conditionLabel: 'Rất tốt 95%',
    location: 'Đà Nẵng',
    deposit: '600.000đ',
    available: true,
    href: '/rent/products/classic-sneakers',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBGX9MLaXkDPpkpvRKdy2axzNTQbnNx_zdNdPhaZIyGar7jQumeRDAiXCgdqV-vo2remereT9vKy1u0lXTPcTjUwHWw2BUN5nVjtbW3A7Kck2D8oSAuMlA4YWikHGVx2wLPa4O73p6BniZAEsLW2gaF64ui2yqlzuI6QxQw-FAJ6EEbSwiKl9WQGZVRuhW0izycAPRBT0Wp20b8b6yIXFPDTRtD61j3kfI03X6CBtE',
  },
  {
    id: '4',
    title: 'Snow Peak Alpha Breeze Camping Tent 4P',
    category: 'Camping',
    categoryLabel: 'Cắm trại',
    price: 250000,
    rating: 4.7,
    reviewCount: 39,
    condition: 'Rất tốt',
    conditionLabel: 'Rất tốt 95%',
    location: 'Đà Nẵng',
    deposit: '1.000.000đ',
    available: true,
    href: '/rent/products/camping-tent',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1UpAkWSNWMQ1I3uDPXGKoJ-9POEmgeq7YpIuQ79QNfhv4wiFY--5DWEuQmRz157eN8zUtLw0-UevOSecwGvpA0ZrRN9VGHK-2-C5pFiUfYSHUx2MqqlZVsl629nHldrxwTBy5kgIb-ZIWJuDAl_Qky-i9C9MXMvUbdPsXpBqf_6hXLn00pNo_aYsD8vvfLcMsOpvOBXd4efa0KQnDAZ_YWGvL09INihtDBxqszHib',
  },
  {
    id: '5',
    title: 'Canon EOS R6 Mark II Mirrorless',
    category: 'Camera',
    categoryLabel: 'Camera',
    price: 500000,
    rating: 4.9,
    reviewCount: 210,
    condition: 'Như mới',
    conditionLabel: 'Như mới 99%',
    location: 'TP. Hồ Chí Minh',
    deposit: '2.500.000đ',
    available: true,
    href: '/rent/products/canon-eos-r6',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDm9RHp_nAFGyZAGYxDLuSj2aEJ1h1N-U9WI7PAFWW7ZyfVfl1i_9SppV5JiKn77I8cJ_bsDk1yKDbhK7ua6iE0__0FrQpGra28G6Yt_gWfXn44AauvwE85glJuv7mhovOe_fQm_64353WGhh-yXyasdXNywXSTsgjbqL6GWjRg7xe-alf5PYk6YJEQ4Ew9ZErc7V38NU-BCrvgK7m2VReo2j_s_PneV8IEQBWJ0hmx',
  },
  {
    id: '6',
    title: 'Áo Khoác Dạ Wool Dáng Dài Cao Cấp',
    category: 'Fashion',
    categoryLabel: 'Thời trang',
    price: 220000,
    rating: 4.8,
    reviewCount: 45,
    condition: 'Như mới',
    conditionLabel: 'Như mới 99%',
    location: 'Hà Nội',
    deposit: '900.000đ',
    available: true,
    href: '/rent/products/wool-coat',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmFHFDSIg4hOhOPqA36mT1kkDCl3WPEhUJRK08XZrwDTHzuiTwpPS19S9rp72RfWd75ovkeghRObBnjMEjwjM4C-han-LYxuwvvmbNoQxfmQdJ0b32KcCw-X0Jnqe_U23o9wu4QRqi1jvm0k2QIjvQX3uucHyHqIp2-wcXnh_PJzwTUThv7mBwqwtAjiXdUPGAdc-I8uwnLjfVeTg2aWPw2sXhSqhHAp-MSwbmguRZ',
  },
  {
    id: '7',
    title: 'Teenage Engineering OP-1 Field Synthesizer',
    category: 'Electronics',
    categoryLabel: 'Điện tử',
    price: 320000,
    rating: 5.0,
    reviewCount: 18,
    condition: 'Rất tốt',
    conditionLabel: 'Rất tốt 95%',
    location: 'Đà Nẵng',
    deposit: '1.500.000đ',
    available: true,
    href: '/rent/products/op1-synth',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9te3aJVYpGneDteUKFIdq6xEbIuYlTZXQ6bppTxwXer5UXL315L_slY8JybSWI0sElJdsxst5JeOU8COAV8d_9Id7BShJa1ubVjLBUxiuArZt_Us8GrKWyoDdUBpTh8Vu7ZJjF_FE_lY1wpNp-QphW1iJOowGOrHjdZJ0AhC0rxCOupCG6SMWnR7Fsnn3F6GWjyzYTa1UdOhqfDBBUNRlYARbhpYkepNnwYwEO5jd',
  },
  {
    id: '8',
    title: 'Loa Di Động Bose S1 Pro+ System',
    category: 'Electronics',
    categoryLabel: 'Âm thanh',
    price: 280000,
    rating: 4.8,
    reviewCount: 67,
    condition: 'Rất tốt',
    conditionLabel: 'Rất tốt 95%',
    location: 'TP. Hồ Chí Minh',
    deposit: '1.200.000đ',
    available: false,
    href: '/rent/products/bose-s1',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAMWq7Usi-8ij0sf0N2-H4NCl1ScKH5274kxXc8AYWyPFy16zT_Kmq3tNSf8LN7ozbRrV99cjXr3HGqO3GJ6PI3P7C3MRDNDCyXlrDzFp3bl8Vy8MCY_G5ZyYkN8df8vo1U6wxOmaDZyNehhN4Oh56uVjgr3kV6uo7bpxr_YUl2Mvvextk0D-dRSVdxpZ5pQYNkX9Qt4yECCk-T8LqKmHDOzynNhWqS_X5lmFv5_qy',
  },
];

export const RENT_SORT_OPTIONS: SortOption[] = [
  { key: 'recommended', label: 'Đề xuất' },
  { key: 'price-asc', label: 'Giá thấp' },
  { key: 'price-desc', label: 'Giá cao' },
  { key: 'rating', label: 'Đánh giá cao' },
  { key: 'newest', label: 'Mới nhất' },
];

export const RENT_HOW_IT_WORKS_STEPS: RentProcessStep[] = [
  {
    step: '01',
    title: 'Chọn đồ & Đặt lịch',
    desc: 'Chọn chính xác ngày bạn cần dùng. Hệ thống tự động tính chi phí cọc và phí thuê minh bạch theo từng ngày.',
  },
  {
    step: '02',
    title: 'Nhận hàng tiệt trùng',
    desc: 'Đóng gói chuyên dụng chống sốc. Sản phẩm được khử trùng sinh học và kèm biên bản bàn giao điện tử.',
  },
  {
    step: '03',
    title: 'Tận hưởng trải nghiệm',
    desc: 'Sử dụng cho sự kiện, dự án hoặc chuyến đi dã ngoại mà không phải chịu chi phí khấu hao khổng lồ.',
  },
  {
    step: '04',
    title: 'Trả đồ & Hoàn cọc',
    desc: 'Đơn vị vận chuyển đến lấy tại nhà. Tiền cọc được hoàn lại tự động vào tài khoản sau khi thẩm định nhanh.',
  },
];

export interface RentalOrderItem {
  id: string;
  title: string;
  grade: string;
  codeBadge: string;
  shop: string;
  notes: string;
  dailyRate: string;
  itemTotal: string;
  img: string;
}

export interface RentalOrderRecord {
  id: string;
  code: string;
  date: string;
  shipping: string;
  status: string;
  statusText: string;
  statusBg: string;
  dotBg: string;
  custodyDates: string;
  daysLeft: string;
  items: RentalOrderItem[];
  rentTotal: string;
  deposit: string;
  shippingFee: string;
  grandTotal: string;
  canReturn: boolean;
  canPay: boolean;
}

export interface StoredRentalOrderItem {
  id?: string;
  title?: string;
  grade?: string;
  shopName?: string;
  dailyPrice?: number;
  itemRentTotal?: number;
  price?: number;
  imageUrl?: string;
  image?: string;
}

export interface StoredRentalOrderRecord {
  orderCode?: string;
  createdAt?: string;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  rentalDays?: number;
  items?: StoredRentalOrderItem[];
  totalRentFee?: number;
  totalDeposit?: number;
  shippingFee?: number;
  totalPayment?: number;
  grandTotal?: number;
  [key: string]: unknown;
}

export interface MetricCardData {
  title: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  mainVal: string;
  unit: string;
  unitColor: string;
  badge?: string;
  subText: string;
  bottomBorderColor: string;
}

export const RENTAL_SUMMARY_METRICS: MetricCardData[] = [
  {
    title: 'Đang trực tiếp thuê',
    icon: 'key',
    iconBg: 'bg-[#EEF2EC]',
    iconColor: 'text-[#4A6B53]',
    mainVal: '01',
    unit: 'Đơn hoạt động',
    unitColor: 'text-[#4A6B53]',
    subText: '2 thiết bị cao cấp đang lưu ký',
    bottomBorderColor: 'bg-[#4A6B53]',
  },
  {
    title: 'Ký quỹ Smart Escrow',
    icon: 'lock',
    iconBg: 'bg-[#F2EFE8]',
    iconColor: 'text-brand-charcoal',
    mainVal: '16.000.000',
    unit: '₫',
    unitColor: 'text-brand-muted',
    subText: 'Bảo chứng cô lập, hoàn 100% khi trả',
    bottomBorderColor: 'bg-brand-charcoal',
  },
  {
    title: 'Lịch sử hoàn cọc',
    icon: 'history',
    iconBg: 'bg-[#EEF2EC]',
    iconColor: 'text-[#4A6B53]',
    mainVal: '06',
    unit: '/ 06 Đợt thuê',
    unitColor: 'text-[#4A6B53]',
    subText: '100% trả đúng hạn & bảo toàn cọc',
    bottomBorderColor: 'bg-[#4A6B53]/60',
  },
  {
    title: 'Điểm tín nhiệm KYC',
    icon: 'verified',
    iconBg: 'bg-[#F8F2EA]',
    iconColor: 'text-[#8E6334]',
    mainVal: '99.8',
    unit: '/100',
    unitColor: 'text-brand-muted',
    badge: 'Tier 2',
    subText: 'Miễn giảm 15% tiền cọc định mức',
    bottomBorderColor: 'bg-[#8E6334]',
  },
];

export const LIFECYCLE_STATUS_TABS = [
  { key: 'ALL', label: 'Tất cả (05)' },
  { key: 'PENDING', label: 'Chờ duyệt (0)' },
  { key: 'APPROVED', label: 'Đã duyệt (0)' },
  { key: 'WAITING_PAYMENT', label: 'Chờ thanh toán', dot: 'bg-[#C87A1E]' },
  { key: 'PAID', label: 'Đã thanh toán (0)' },
  { key: 'READY_FOR_HANDOVER', label: 'Sẵn sàng bàn giao (0)' },
  { key: 'HANDED_OVER', label: 'Đã bàn giao (0)' },
  { key: 'RENTING', label: 'Đang thuê', dot: 'bg-[#4A6B53]' },
  { key: 'RETURN_REQUESTED', label: 'Yêu cầu trả (0)' },
  { key: 'RETURNED', label: 'Đã nhận trả (0)' },
  { key: 'INSPECTING', label: 'Đang kiểm định', dot: 'bg-[#3B6E8C]' },
  { key: 'COMPLETED', label: 'Hoàn tất (01)' },
  { key: 'CANCELLED', label: 'Đã hủy (01)' },
  { key: 'REJECTED', label: 'Bị từ chối (0)' },
];

export const DEFAULT_RENTAL_ORDERS: RentalOrderRecord[] = [
  {
    id: 'RH-RNT-2024-8845',
    code: '#RH-RNT-2024-8845',
    date: '16/11/2026',
    shipping: 'Nanuk White-Glove (2 chiều)',
    status: 'RENTING',
    statusText: 'ĐANG THUÊ (RENTING)',
    statusBg: 'bg-[#EEF2EC] text-[#37533E] border-[#D5E0D4]',
    dotBg: 'bg-[#4A6B53]',
    custodyDates: '18/11/2026 → 23/11/2026 (5 ngày)',
    daysLeft: 'Còn lại 2 ngày trong kỳ hạn thuê',
    items: [
      {
        id: 'item-1',
        title: 'Canon EOS R6 Mark II + RF 24-70mm f/2.8L IS USM Kit',
        grade: 'Grade A+',
        codeBadge: 'Lưu ký #CR6-881',
        shop: 'RedRiver Film Gear Hub',
        notes: 'Đầy đủ 2 pin zin, sạc đôi, thẻ CFexpress 128GB',
        dailyRate: '450.000₫ / ngày',
        itemTotal: '2.250.000₫ (5 ngày)',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrM-ToZvlMPx4yO6NCxYD4rQn19JA4qVPMY1mRfONY28uZ_QMnAAtaS_Br0LpHqM_Mhn78lvXeTXVJt4LLvbNPDh0X4MUtf-g9moxKlL7zMw4u2EI6CQFNuHFYGsvm2cWxSgKiUs0Y5Xdim6-On74fSPcL4PmrjqCdBxButhorh7dItxyTYXEnezHwDrsnIfyFik6alFSpmma6dPswPbRqx1FnImAgW02gXz_yP3Er',
      },
      {
        id: 'item-2',
        title: 'Lều dã ngoại Snow Peak Alpha Breeze 4P Expedition Tent',
        grade: 'Grade A',
        codeBadge: 'Lưu ký #SP-AL4-09',
        shop: 'Alpine Camp Vault',
        notes: 'Kèm thảm lót bạt chống nước và bộ cọc rèn hợp kim',
        dailyRate: '180.000₫ / ngày',
        itemTotal: '900.000₫ (5 ngày)',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeZlFgfLHI_J0mpqfEbmUmEnZ8tWNq_hjhJ3oRlW2kvPlELXdUcZFHtbECiX6ApFriMwa3hmkc58I6IX6yf2r4ZQCzEF0cZC-OC2wUBZp3LQlSVO5e1nSDZ-44lPCpjDt1dPahGSyG9HAaNrdQgLADjP_yM9CLbWWwFjml_5jVVbdN-nSxRWJPozhPKhZMh15rlc_mHYspYHoJ7qw2ZCqrccWYYTX_yCMXZ3DWwfI3',
      },
    ],
    rentTotal: '3.150.000₫',
    deposit: '16.000.000₫',
    shippingFee: '150.000₫',
    grandTotal: '19.300.000₫',
    canReturn: true,
    canPay: false,
  },
  {
    id: 'RH-RNT-2024-8852',
    code: '#RH-RNT-2024-8852',
    date: 'Hôm nay, 14:22',
    shipping: 'Cổng thanh toán VNPay Escrow',
    status: 'WAITING_PAYMENT',
    statusText: 'CHỜ THANH TOÁN (WAITING_PAYMENT)',
    statusBg: 'bg-[#FCF5EB] text-[#A6620C] border-[#F2DEBF]',
    dotBg: 'bg-[#C87A1E] animate-ping',
    custodyDates: '25/11/2026 → 28/11/2026 (3 ngày)',
    daysLeft: 'Còn 38 phút trước khi giải phóng slot đặt trước',
    items: [
      {
        id: 'item-3',
        title: 'Ống kính Leica Summicron-M 35mm f/2 ASPH (Black Paint Edition)',
        grade: 'Collector Grade',
        codeBadge: 'Mã #LCA-35M-77',
        shop: 'Hanoi Rangefinder Atelier',
        notes: 'Kèm hood kim loại zin và filter B+W MRC',
        dailyRate: '550.000₫ / ngày',
        itemTotal: '1.650.000₫ (3 ngày)',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ22eQXuc8ds3xJZpI3Gdvw6crjUxaSTpreItLHZdeynp2C7DrrI7uyVfr0Ki0a6Hgm76fb091aWo8HFn5tx3XWdB2ha8B316bz2Wgcga7D2XK9tWGpbMVFbceOCsweeKKSbtTMVRiL6EwWodvqxxTD7V6So0ElfSfOFlTNoMldQhpJIF-cV007QQGRLS8_p9Hzh1p-95ddDYWLE9MlGWpnNOpiJN5RWrHgHMwx6bp',
      },
      {
        id: 'item-4',
        title: 'Đèn Studio Cinema Aputure Light Storm 600d Pro',
        grade: 'Studio Ready',
        codeBadge: 'Mã #AP-600D-03',
        shop: 'Saigon Cine Lighting',
        notes: 'Kèm chân đèn C-Stand và chóa phản xạ Hyper Reflector',
        dailyRate: '266.000₫ / ngày',
        itemTotal: '800.000₫ (3 ngày)',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSMCvRthwDpE2-5yddnRcfMtFmn43TnwMzWOAoHBfKI-a9loU7QLpdxo1BicMnLt4Wj2JDMNIJUIkBVW_QkLOYjfMn6AG24hNqMq0jEEh7UuI85TJNEgeYIORgLUbj-6S34cdgGr_YuPzxHkSX4c8QxpQ8RrjQv_RM7cxEGwstuAJmsVw0RENvrkPyRU3gKxu_cxoxyl-aSlqRGAt4jFApuV9jRFYQeE1ClmvgQjhm',
      },
    ],
    rentTotal: '2.450.000₫',
    deposit: '22.000.000₫',
    shippingFee: '150.000₫',
    grandTotal: '24.600.000₫',
    canReturn: false,
    canPay: true,
  },
  {
    id: 'RH-RNT-2024-8798',
    code: '#RH-RNT-2024-8798',
    date: '09/11/2026',
    shipping: 'Trung tâm kiểm định: ReUse Bench Lab Đà Nẵng',
    status: 'INSPECTING',
    statusText: 'ĐANG KIỂM ĐỊNH (INSPECTING)',
    statusBg: 'bg-[#EBF3F8] text-[#245D7E] border-[#CDE1EE]',
    dotBg: 'bg-[#3B6E8C] animate-pulse',
    custodyDates: '04/11/2026 → 09/11/2026 (5 ngày)',
    daysLeft: 'Kỹ thuật viên đang đối kiểm thấu kính Carl Zeiss',
    items: [
      {
        id: 'item-5',
        title: 'Hasselblad 503CW Medium Format Film Kit w/ Carl Zeiss 80mm f/2.8',
        grade: 'Collector Grade A',
        codeBadge: 'Mã #HBL-503-44',
        shop: 'Đà Nẵng Film Archive Hub',
        notes: 'Đầy đủ back phim A12, thước ngắm ngực waist-level',
        dailyRate: '450.000₫ / ngày',
        itemTotal: '2.250.000₫ (5 ngày)',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArEQbeUflkeq4RntQriTMcDrIV5B5QhAV0HWvObyAvLGaR8xZz4XlbQNGe7UrxDA71HJ6-7XSEspFHAtCd5fX3EaJ39oWYNUlrHfDx7pXQ_T3xfVaE8jIKeZlXY2JhGOR0xUgkCYpy7D3UXFJJ3tS3C-QRq7rjhD3XUQBjVbRIDS3oO5gWFj3Yg4p5Co4OhOhs0fE07yOVdslv6pCODb0zDAHxdSWC93XTKsk_mQsJ',
      },
    ],
    rentTotal: '2.250.000₫',
    deposit: '15.000.000₫',
    shippingFee: '150.000₫',
    grandTotal: '17.400.000₫',
    canReturn: false,
    canPay: false,
  },
  {
    id: 'RH-RNT-2024-8620',
    code: '#RH-RNT-2024-8620',
    date: '26/10/2026',
    shipping: 'Đã giải ngân cọc về Ngân hàng Techcombank',
    status: 'COMPLETED',
    statusText: 'HOÀN TẤT (COMPLETED)',
    statusBg: 'bg-stone-100 text-[#1E1E1E] border-stone-300',
    dotBg: 'bg-[#4A6B53]',
    custodyDates: '20/10 → 25/10/2026 (5 ngày)',
    daysLeft: 'Hoàn trả 10.500.000₫ tiền cọc thành công 100%',
    items: [
      {
        id: 'item-6',
        title: 'Teenage Engineering OP-1 Field Portable Synthesizer',
        grade: 'Mint 99%',
        codeBadge: '#TE-OP1-12',
        shop: 'Klang Acoustic Studio',
        notes: 'Kỳ thuê đã kết thúc nguyên vẹn',
        dailyRate: '300.000₫ / ngày',
        itemTotal: '1.500.000₫ (5 ngày)',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm4UdEbLOB38uFp9wp4RufdwSnsLhHK9KemgrSOhV9d8eNQzzE2eWlzeMSKEBxricQTd1b7GivCYZHSMNlnn_hFrKQP3YsO5JWwkqxF7KlPHqjE8ZcbzqgZYML0Te5zs1M5fn8VzanaUS5BRxNj8eM3YTcXZQx5OuG5Rorcqn1au2DBjzOjVoqt4WeLMMWD9lH_Kr935NKLiB9CawEZJSkGquPPIgnIoBnZTE2vuPu',
      },
      {
        id: 'item-7',
        title: 'Tai nghe kiểm âm mở Sennheiser HD 660S2',
        grade: 'Audiophile Grade',
        codeBadge: '#SNN-660-88',
        shop: 'Klang Acoustic Studio',
        notes: 'Kèm dây balance 4.4mm và jack 6.35mm',
        dailyRate: '120.000₫ / ngày',
        itemTotal: '600.000₫ (5 ngày)',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNW3lUrJnrfYNsMg8P9IqIoJyPHt7Wes5a6tl0Z_dhA5Bf6Ofxmgn5pnRmyYfHAWo2-LMGbrEEMdgirChfUGYI9FgVuoeOmk-MjlaYRPe1DDKRMQ9IeofBctEzH_dadHwCSAmw250mHHuBi730xQEHPGMviG3hEkv59kTywwLoSag4RVTdNf79oE7KwsJO2vrq52BHukWj1Gse-1SXFKl7b87JN0Mr1KVnARkrdNN7',
      },
    ],
    rentTotal: '2.100.000₫',
    deposit: '10.500.000₫',
    shippingFee: '150.000₫',
    grandTotal: '2.250.000₫',
    canReturn: false,
    canPay: false,
  },
  {
    id: 'RH-RNT-2024-8511',
    code: '#RH-RNT-2024-8511',
    date: '12/10/2026',
    shipping: 'Lý do hủy: Khách hàng thay đổi lịch trình cá nhân',
    status: 'CANCELLED',
    statusText: 'ĐÃ HỦY (CANCELLED)',
    statusBg: 'bg-[#FDF2F2] text-[#9E362C] border-[#F8D2D0]',
    dotBg: 'bg-[#C84337]',
    custodyDates: '15/10 - 18/10/2026 (3 ngày)',
    daysLeft: 'Đã hủy trước giờ thanh toán · Không phạt',
    items: [
      {
        id: 'item-8',
        title: 'Sony FX3 Cinema Line Camera Cage Rig + GM 16-35mm T2.9',
        grade: 'Cinema Grade',
        codeBadge: '#SFX3-09',
        shop: 'CineEquipment Studio',
        notes: 'Đã hủy giữ chỗ tự động',
        dailyRate: '600.000₫ / ngày',
        itemTotal: '1.800.000₫ (3 ngày)',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfODpYPiPSbbJthrSFjBYvzEWVQCPoYnd4OJ-JQU4irpSmuX6LdXj48uQWUuN7rUj2k6FM5nOj-aHSynFcQTWPU1XrAz-UewwKoNGJ6RgP1yQgXOwBrTa5blVFHdqwaNWDXRPi2j1vM-_6C_WtsffWOErQ7Ffb6fGDwAGOEC4vpb4ExBw7rhwpzk3rixYqR8AW4zIfBjwJs1f-UmGidsM0pAeFIai2eYD4P29qj1O7',
      },
    ],
    rentTotal: '1.800.000₫',
    deposit: '14.000.000₫',
    shippingFee: '150.000₫',
    grandTotal: '15.950.000₫',
    canReturn: false,
    canPay: false,
  },
];

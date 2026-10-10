import type { CartItem } from '../../../context/CartWishlistContext';

export const DEFAULT_DEMO_CART_ITEMS: CartItem[] = [
  {
    id: 'rent-item-1',
    title: 'Canon EOS R6 Mark II + RF 24-70mm f/2.8L IS USM',
    price: 450000,
    deposit: 12500000,
    quantity: 1,
    rentalDays: 5,
    startDate: '18/11/2024',
    endDate: '23/11/2024',
    mode: 'rent',
    categoryLabel: 'Camera & Quang học',
    gradeBadge: 'Grade A+ (Bench Checked)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDCqzVxJbsUJpowxtdKtKCA_k51C4iGhgca2XX1HrZvTv3aMx3lvq3SeCApO6hhIMVLuHNYvv8cbR9R7et8bdPH9cR5P59fG5egr9yxJJS4gu1-xIbtArLSyw3hzFje2mUlS59sWayq4vPXSCKkJObgk6IlsPA0Q0WxMiki9YqQiAxGwQ6Bx7j0M-IwwBzpXHRt9cnq1twj5Lm7JzuYyCf4R2eEckB6Gq2A_gDpYbml',
    location: 'Hà Nội',
  },
  {
    id: 'rent-item-2',
    title: 'Snow Peak Alpha Breeze 4P Expedition Tent',
    price: 180000,
    deposit: 3500000,
    quantity: 1,
    rentalDays: 3,
    startDate: '20/11/2024',
    endDate: '23/11/2024',
    mode: 'rent',
    categoryLabel: 'Dã ngoại & Cắm trại',
    gradeBadge: 'Grade A (Khử khuẩn Ozone)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBiBdHKfXO3YsrRY5FJb1zjv1wNnRtAFLHNLaoHO56viCgPOFpbQqaOu2N-sUH9a1hfpucQfk-SEJ0pE0fzB_GQB5mtcCou9iA-g3BgTnCzaE8ZKY2285paO2gOMNAvJWoNW3_HJ6RX0CwrhodCSHHijWc9TYvKyL2Gpn9Yf6Qj2Yi3cEMhGWAZ7rpBj4Vf0Am4WZN6LuBF4v38zjdCe7k9M9ACGtOUojBX8gNvht7W',
    location: 'Hồ Chí Minh',
  },
  {
    id: 'thrift-item-1',
    title: 'Leica M6 Classic 0.72x Rangefinder Body',
    price: 68000000,
    quantity: 1,
    mode: 'thrift',
    categoryLabel: 'Camera & Vintage',
    gradeBadge: 'Grade Mint- (98% Factory)',
    sourceOrigin: 'Solms/Wetzlar (Đức)',
    warranty: 'Bảo hành cơ khí 12 tháng',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDXHvslyPLO5_iS9ZNZoVPF7k32AbEReEJBD50Ank5yhJYYHtYmg9xw5a-Y2jBP25CZXnOwhQj4sjSzxWUEivyVxnLRbYcUgQ4nVyq6gqsMFKMhQi_o20CAK5Mv5WkENId3HSjTVuCZPSPaxFB6k8-qr2AOxa8ApwVtjjFBY1oeuwNkjwhbyty49FTrV3zpUZhjQUp0SwpKsWckYYPgWPM6q9yZRVuZ4ppOiIgPTwdo',
    location: 'Hà Nội',
  },
  {
    id: 'thrift-item-2',
    title: 'Áo khoác Yohji Yamamoto Wool Jacket (FW 1998)',
    price: 14850000,
    quantity: 1,
    mode: 'thrift',
    categoryLabel: 'Thời trang lưu trữ',
    gradeBadge: 'Grade A Mint (Archival Tokyo)',
    sizeOrSpec: 'M (Dáng Oversized)',
    material: '100% Gabardine Wool',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAoReZwtKVSEVM-RX-wAHQ0FBtE55RDh_Fivd1F-VKLc6E3gI3BRc3sf9zPFqrQUcD1O5GTbCo3eLm6AGDrN_zqVifzE4n88nbBIBYLt57ERpmE3L6o1imV0mvhlGAFXBfFtVst03-uYnPrupwlGNaC40sujZso5aKVvbeWO7ToCOCezGWWz8nQ8f9jYkmvq7dNCJS2HsAOYK7vLqkJUybJg_sYw6yGy6cTq-PCT14P',
    location: 'Tokyo / Ship Express',
  },
];

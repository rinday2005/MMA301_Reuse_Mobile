export interface CheckoutRentItem {
  id: string;
  code: string;
  title: string;
  category: string;
  grade: string;
  image: string;
  price: number;
  deposit: number;
  quantity: number;
  accessories: string;
  packagingNote: string;
  vaultOrigin: string;
}

export const DEFAULT_CHECKOUT_RENT_ITEMS: CheckoutRentItem[] = [
  {
    id: 'rent-canon-r6-mk2',
    code: '#CR6-881',
    title: 'Canon EOS R6 Mark II + RF 24-70mm f/2.8L IS USM Kit',
    category: 'CAMERA & QUANG HỌC',
    grade: 'Grade A+ (Bench Checked)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDRWMrRtL8-mNQhg-NEFuc1t6Lxph30fcWgAoG-nYey9JeG9ntMx-O1ydW7ZnCf3kAMNJ3vQdpZveQXU-fzaqtb5IcktGX4Mp7H5LcNbry7itvnio0Qk4RwU45-Ap3BeQV_woJ3Rw9oCnbBG2BIOO-4gkhOtTsYHfWtPZ89Yt6BbB3MtF7FSi7gqNj3q_IfPWJkZ96sVkl1EehwdKSWdUdtgtZoGItGkIhfvJczLJto',
    price: 450000,
    deposit: 12500000,
    quantity: 1,
    accessories: '1 bộ đầy đủ cáp sạc & 2 pin LPE6NH',
    packagingNote: 'Sẵn sàng bàn giao trong vali Nanuk 935 chống nước chống sốc',
    vaultOrigin: 'Da Nang Optical Vault',
  },
  {
    id: 'rent-snow-peak-tent',
    code: '#SP-AL4-09',
    title: 'Lều dã ngoại Snow Peak Alpha Breeze 4P Expedition Tent',
    category: 'DÃ NGOẠI & CẮM TRẠI',
    grade: 'Grade A (Khử khuẩn Ozone)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAu7n6iJYY-Wh_GDnyo5HjxNjJHugpgRvcl1fPKfzokIxRvxJv3VbbQxktm6hG0oE03f8jO-GbSB4p-ms2Rhcs32iZsM0uC_p78l2sJO1e9nW04F_tIyPuBTUu2BAiXqoxKn5XFMjCW1BDO0tQoBRAaogDrRYHCUZ0oczYwD7gccaMD2Aggu3H3tZA-qugr1iuurezZb4zYFfHaO8laYgtWqNIdum-V_lMKTU8098Cs',
    price: 180000,
    deposit: 3500000,
    quantity: 1,
    accessories: '1 bộ đầy đủ cọc nhôm Duralumin + bạt lót chống thấm',
    packagingNote: 'Đã qua tiệt trùng Ozone và kiểm tra chống thấm 150D Oxford',
    vaultOrigin: 'Central Outdoor Archive',
  },
];

export const NANUK_SHIPPING_FEE = 150000;

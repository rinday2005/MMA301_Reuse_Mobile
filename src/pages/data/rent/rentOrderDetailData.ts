export interface AuditLogItem {
  label: string;
  value: string;
}

export interface AccessoryItem {
  id: string;
  name: string;
}

export interface BookedDateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  note?: string;
  customerName?: string;
}

export interface RentProductDetailData {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  condition: string;
  grade: string;
  shutterOrUsage: string;
  pricePerDay: number;
  deposit: number;
  depositFormatted: string;
  maxQuantity: number;
  auditCode: string;
  images: {
    src: string;
    alt: string;
    caption: string;
  }[];
  overview: string[];
  accessories: string[];
  auditItems: AuditLogItem[];
  allowedConditions: string;
  prohibitedActions: string;
  bookedDates?: BookedDateRange[];
}

export interface RentLifecycleStep {
  step: string;
  title: string;
  desc: string;
  icon: string;
  highlight?: boolean;
}

export interface RelatedRentProduct {
  id: string;
  href: string;
  title: string;
  categoryTag: string;
  grade: string;
  price: number;
  deposit: string;
  image: string;
}

export interface ShopOwnerInfo {
  name: string;
  avatarText: string;
  badge: string;
  successOrders: string;
  responseTime: string;
  isKycVerified: boolean;
}

export const SHOP_OWNER_DATA: ShopOwnerInfo = {
  name: 'Da Nang Optical Vault',
  avatarText: 'OV',
  badge: 'HẠNG 1',
  successOrders: '184 đơn thuê thành công',
  responseTime: 'Phản hồi trong 5 phút',
  isKycVerified: true,
};

export const QUALITY_COMMITMENTS = [
  {
    title: 'Khử trùng y tế',
    desc: 'Tia UV-C sâu & dung dịch cồn quang học chuyên dụng.',
    icon: 'sanitizer',
  },
  {
    title: 'Kiểm định Sensor 100%',
    desc: 'Zero bụi, zero trầy xước, đo biểu đồ Dead Pixel chuẩn xác.',
    icon: 'biotech',
  },
  {
    title: 'Hoàn cọc trong 2h',
    desc: 'Tự động hoàn cọc sau nghiệm thu tại trạm kiểm định.',
    icon: 'history_toggle_off',
  },
];

export const RENT_8_STEPS_LIFECYCLE: RentLifecycleStep[] = [
  {
    step: 'BƯỚC 01',
    title: 'Đặt thuê',
    desc: 'Chọn ngày nhận máy và số lượng phù hợp.',
    icon: 'touch_app',
  },
  {
    step: 'BƯỚC 02',
    title: 'Chủ shop duyệt',
    desc: 'Shop Owner xác nhận lịch máy còn trống.',
    icon: 'rule',
  },
  {
    step: 'BƯỚC 03',
    title: 'Thanh toán',
    desc: 'Tiền cọc giữ an toàn tại Smart Escrow.',
    icon: 'account_balance_wallet',
  },
  {
    step: 'BƯỚC 04',
    title: 'Nhận hàng',
    desc: 'Đồng kiểm tem niêm phong và ngoại quan.',
    icon: 'local_shipping',
  },
  {
    step: 'BƯỚC 05',
    title: 'Sử dụng',
    desc: 'Thoải mái sáng tạo, có hỗ trợ kỹ thuật 24/7.',
    icon: 'photo_camera',
  },
  {
    step: 'BƯỚC 06',
    title: 'Trả hàng',
    desc: 'Bàn giao shipper tận nhà theo lịch hẹn.',
    icon: 'assignment_return',
  },
  {
    step: 'BƯỚC 07',
    title: 'Kiểm tra',
    desc: 'Trạm kỹ thuật kiểm định cảm biến trong 2h.',
    icon: 'fact_check',
  },
  {
    step: 'BƯỚC 08',
    title: 'Hoàn cọc',
    desc: 'Tự động hoàn 100% tiền cọc tức thì.',
    icon: 'payments',
    highlight: true,
  },
];

export const RELATED_RENT_PRODUCTS: RelatedRentProduct[] = [
  {
    id: 'canon-r6',
    href: '/rent/products/canon-eos-r6',
    title: 'Canon EOS R6 Mark II Body',
    categoryTag: 'CAMERA · HÀ NỘI',
    grade: 'Grade A',
    price: 420000,
    deposit: '1.800.000₫',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCo4yLitvdCJXxyR1Bg4OrMHGb9vH2__DAIMGVYGampyhJst54gPWZnGaTmjGMelV8naLpXDpzmRWhJyv2--9dkSRWuyw1LtXGBEV0pfBGaxLdnyTo_jw8uiblGfE97ptJ4lwUzkiJpZ9ClYvErB9xSxYT2qQlEb1ABfyg7SOAnyKhgtDLH0Tt3IWXiuJ_Id5BwKeuleCRxy6mhX6Oo5XVB82OCyKEAjq-oXoGTuWyE',
  },
  {
    id: 'hasselblad',
    href: '/rent/products/hasselblad-503cw',
    title: 'Hasselblad 503CW Film Kit',
    categoryTag: 'MEDIUM FORMAT · TP. HCM',
    grade: 'Grade A+',
    price: 650000,
    deposit: '3.500.000₫',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCSJaApDllB4BjPc7Buem6BFQLceFzeORNlwx9uyLd5mIrudIx6c9kBGUUyOMSXQOUTj5WFa7PkzuGMPbr7dxvHo6CHfDU0GTlI6zGruw2v8JgspNHGgM-_Hz_zJG1I61fc5GwYkQxPs8D1aTnfbpbSB3J5P1iJ-4LuTw8_4fWOWL_r5hFffaVU1qdaQ1LYu_czr7BsMhkHj6g0mCcMXivVvFhv9pYE4JF64SIqlsF_',
  },
  {
    id: 'leica-summicron',
    href: '/rent/products/leica-summicron-m-35mm',
    title: 'Leica Summicron-M 35mm f/2',
    categoryTag: 'LENS QUANG HỌC · ĐÀ NẴNG',
    grade: 'Grade Mint',
    price: 380000,
    deposit: '2.500.000₫',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC4RylAlksXQZJsyDt4jxBfUPcvF6694ZBglOCqZK3tQO0UPMXqQPjZciQ8-bm3OyUf4nlfLJQmEI02M0aKhLBYAg5BWv2M76vl4axovUx_So5KYVW7o9PB09nxsd-2e5JMMAQhInAR0P5oj79HseTCE4XNOLu5-3m53j0BqX01v28AFfknwvjJp14Yz0Gbz4Dgd4-hb1cVlu1BqZ8zVrgXPkUmhsnWc_XIGnnVGNU3',
  },
  {
    id: 'op1-synth',
    href: '/rent/products/op1-synth',
    title: 'Teenage Engineering OP-1',
    categoryTag: 'ÂM THANH · HÀ NỘI',
    grade: 'Grade A',
    price: 290000,
    deposit: '1.500.000₫',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDK8UKCxOVtk4ZLHxeVkD0AWu7G1eP2NkRBBoj0JpD3ZtQJirPC1MmGM3eVtRsZt--4AH0GgZ9Fwu3QwLmztIYhHP-FSedWGakG8JTK8siweCY3wsUktcObMBexf3WH7Tdh1m9JXuXgiTl1wsnjiViZG-mVrwVjHpWPee_4n9qTtHRX5gcY-0mBiQ3BNcEIEiSa-2A-T8PEikrKDcYBORCFDV3axLsDw_SEnb2Hn6jh',
  },
];

export const RENT_PRODUCT_DETAILS_MAP: Record<string, RentProductDetailData> = {
  '1': {
    id: '1',
    slug: 'sony-alpha',
    title: 'Sony Alpha A7 IV Mirrorless Kit',
    subtitle: 'Kèm ống kính Sony FE 24-70mm f/2.8 GM thế hệ mới · Cảm biến Full-frame 33MP',
    category: 'CAMERA',
    location: 'Đà Nẵng',
    rating: 4.9,
    reviewCount: 128,
    condition: 'Rất tốt (Grade A+)',
    grade: 'Grade A+',
    shutterOrUsage: 'Shutter: ~2.400 lần chụp',
    pricePerDay: 450000,
    deposit: 2000000,
    depositFormatted: '2.000.000₫',
    maxQuantity: 2,
    auditCode: '#DA-A7IV-0924',
    images: [
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMX4WfCULn5TrzUodIY6mQbCY-Ui_sWiwgdxVQMOqbQ7wbeNEgsTTqtQGrcAwwgcbXF40RTHcd7I98f4raKbo-XMnJZl0VKcaz7D538tsXkfvR8iDFQ9Vkaksx4KhNmu1G4O6xvRTHayutgVl3LPrTtKuygLWGJZqeXQOOiRIvl3Tb6Lj9gJdrXktKFllscpDGvDH3r3wY6KmP2TilJ4GqIs-qaJdVxSYL1vpJ0ZWo',
        alt: 'Sony Alpha A7 IV mirrorless camera',
        caption: 'Ảnh tổng thể thiết bị kèm ống kính 24-70mm',
      },
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtLBKWDA0tXgV8VBrvKuIjZm2olYiNwGGYDrEcjfIbXUED07kCZzBfpbqWho-OyrMauazefr1McjwWbRaWXBfmcy4mUt7XGqUi7GED-jkF0gNU__-TuNueGQA5Gv0r68dh_Rg9DRzB-5sgVbVZIJ5tvC1U21SWmAxV9N6cLcwsRhDm8lJbS0sFEMfYwJDJVTOXfrbTX6CxfK3rKCtH_BqXhrrhQHJSxBlNowbB549Z',
        alt: 'Cảm biến sạch không bụi',
        caption: 'Cảm biến sạch',
      },
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7m8rWDcU7nKkrql_V79a_4dxLlfhNaET4o82k0UC0a4LTgBgI0K7ocr54-hmvABuSEuoAp9SC0jLELgc-hKaTCciYwh-1n7AgLREidQmLFjYpgPY3e7i1Ae2pQQpdBnHrSHrRAvCv7vyGaJkahthxZuA5kOv-mzIOAaW3v_qelMIcivRkqyaHZu72GZhWn6pWwEzv2AqeMrmz2TN-9vc5TOf2ZjfRMNRZEmavwkeY',
        alt: 'Màn hình và phím bấm nguyên vẹn',
        caption: 'Màn hình & phím',
      },
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfGp1Skq5FN4Qh1DwImFeDq833mj_uIxdDtm7JXCeUomBARj2Bj0kt_vSU5zSxxY1FS-Dc4C0xj1SG8qXe6jAKulJSqh3dJCKemmvkQHfmDy1dzdNwjFaw6x-19pwV_LYeauSr1EW8MSDaiPkhToal_6WFFrrMzcRcgirGwcx1xWmt2YHqb_CY3Abra398L5-6zqbHn7mvBYCjIEtlb0sT6yK_FNwcUDqStD2NbENM',
        alt: 'Phụ kiện kèm theo đầy đủ',
        caption: 'Đầy đủ phụ kiện',
      },
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYVzYd37xL8Cgn_x3LwDDEG00wx0ow7EczaVpyvEBcZk_cNdB7JE4my-f8UwojKGjTcnCE96qe0dNTEcAJGE66yUQgGhM9rOym7nqhBux5i_FfpkdYOdB6buwRxY1vIU2b9nTkh8Cb7A2EJ26uLzPqKtc-nNBUmadqn9-u4Qc3yjspGz6Uq3RxCOLWgt6nSa3UfMyOhCTY44Pd1PbQvl14d1KVrBAbr5XtZsoVJd-4',
        alt: 'Hộp chống sốc Nanuk Canada',
        caption: 'Hộp Nanuk',
      },
    ],
    overview: [
      'Sony Alpha A7 IV trang bị cảm biến BSI Exmor R™ CMOS full-frame 33 megapixel cùng bộ xử lý hình ảnh BIONZ XR™ mạnh mẽ. Máy sở hữu dải nhạy sáng 15 stop, hệ thống lấy nét tự động thời gian thực Real-time Eye AF thông minh cho con người, động vật và chim chóc.',
      'Toàn bộ linh kiện đều trải qua quy trình vệ sinh phòng sạch ISO Class 7 và khử trùng UV-C trước khi bàn giao cho khách thuê.',
    ],
    accessories: [
      '01 Thân máy Sony A7 IV (Cap body gốc)',
      '01 Ống kính Sony FE 24-70mm f/2.8 GM (Hood + Cap)',
      '02 Pin Sony NP-FZ100 chính hãng (Tình trạng pin 100%)',
      '01 Bộ sạc đôi nhanh USB-C PD thông minh',
      '01 Thẻ nhớ ProGrade Digital SDXC 128GB V90',
      '01 Hộp chống va đập tiêu chuẩn Nanuk Canada',
    ],
    auditItems: [
      { label: 'Cảm biến (Sensor)', value: '0 Bụi · 0 Dead Pixel' },
      { label: 'Shutter Count', value: '2.412 lần chụp' },
      { label: 'Ngàm E-Mount', value: 'Khít 100% · Không rơ' },
      { label: 'Kính ống kính', value: 'Trong suốt · Không mốc' },
    ],
    allowedConditions:
      'Sử dụng trong nhà, studio, cảnh quan đô thị và thiên nhiên khô ráo. Trong trường hợp tác nghiệp gần bờ biển, tuyệt đối không đặt máy trực tiếp lên cát hoặc thay lens trong gió mạnh.',
    prohibitedActions:
      'Không quay chụp dưới mưa mà không có áo mưa chuyên dụng; không tự ý can thiệp phần mềm / tháo lắp bu lông cơ khí; không sử dụng sạc lô không rõ nguồn gốc dẫn đến cháy nổ mạch.',
  },
  '2': {
    id: '2',
    slug: 'party-dress',
    title: 'Party Dress Thiết Kế Tối Giản',
    subtitle: 'Chất liệu lụa satin cao cấp · Thiết kế dáng suông thanh lịch cho sự kiện & tiệc tối',
    category: 'THỜI TRANG',
    location: 'Đà Nẵng',
    rating: 4.8,
    reviewCount: 84,
    condition: 'Như mới (Grade Mint 99%)',
    grade: 'Grade Mint',
    shutterOrUsage: 'Số lần cho thuê: 03 lần',
    pricePerDay: 180000,
    deposit: 800000,
    depositFormatted: '800.000₫',
    maxQuantity: 1,
    auditCode: '#DA-PDRESS-0811',
    images: [
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtmXKLrFBh-ULvSwIfPH1-6Wt20ZZ6MVkUuMWLCglFjw1kWB6QFMzh2-V6BXtow5H6r3Mbt8RSgMy-DL2iSfu901WIFIU_yZfWuObWTRd4NoP9Nh1jctTIF7wGjHkgI4D5oxH6_dDBVra7zeHdkwYMXvpTTvPzpsf0XKcML75jinBrzziZBMszcYr5tYuRg6PC9_OCoBVNoPUb4MfpHrUPrGF2yzFQQLz7iIk6cPu5',
        alt: 'Party dress thiết kế tối giản',
        caption: 'Trang phục dạ hội lụa satin',
      },
    ],
    overview: [
      'Trang phục dạ tiệc cao cấp với form dáng tôn đường nét tinh tế, chất liệu lụa cao cấp mềm mại thoáng mát.',
      'Sản phẩm được giặt khô sinh học khử khuẩn nhiệt độ cao và bảo quản túi chống bụi chuyên dụng.',
    ],
    accessories: [
      '01 Đầm tiệc dạ hội nguyên tag niêm phong',
      '01 Móc treo gỗ sồi cao cấp ReUse',
      '01 Túi trùm bảo quản chống ẩm chuyên dụng',
    ],
    auditItems: [
      { label: 'Tình trạng vải', value: '100% Nguyên vẹn · Không sờn' },
      { label: 'Đường may & Khóa', value: 'Chắc chắn · Khóa YKK êm' },
      { label: 'Độ sạch vi sinh', value: 'Khử khuẩn 100% chuẩn y tế' },
      { label: 'Mùi hương', value: 'Hương gỗ tự nhiên dịu nhẹ' },
    ],
    allowedConditions:
      'Thích hợp cho tiệc cưới, sự kiện dạ hội, chụp ảnh studio hoặc dạ tiệc trang trọng.',
    prohibitedActions:
      'Không tự ý tẩy rửa bằng hóa chất mạnh, không ủi trực tiếp ở nhiệt độ cao khi chưa qua vải lót bảo vệ.',
  },
  '3': {
    id: '3',
    slug: 'classic-sneakers',
    title: 'Classic Sneakers Da Thật Archive',
    subtitle: 'Da bê nguyên tấm chế tác thủ công · Size 41-42 vừa vặn êm ái',
    category: 'GIÀY DÉP',
    location: 'Đà Nẵng',
    rating: 4.7,
    reviewCount: 52,
    condition: 'Rất tốt (Grade A 95%)',
    grade: 'Grade A',
    shutterOrUsage: 'Số lần sử dụng: 04 lần',
    pricePerDay: 150000,
    deposit: 600000,
    depositFormatted: '600.000₫',
    maxQuantity: 1,
    auditCode: '#DA-SNEAK-1102',
    images: [
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBGX9MLaXkDPpkpvRKdy2axzNTQbnNx_zdNdPhaZIyGar7jQumeRDAiXCgdqV-vo2remereT9vKy1u0lXTPcTjUwHWw2BUN5nVjtbW3A7Kck2D8oSAuMlA4YWikHGVx2wLPa4O73p6BniZAEsLW2gaF64ui2yqlzuI6QxQw-FAJ6EEbSwiKl9WQGZVRuhW0izycAPRBT0Wp20b8b6yIXFPDTRtD61j3kfI03X6CBtE',
        alt: 'Sneakers da thật archive',
        caption: 'Đôi sneakers da thật archive',
      },
    ],
    overview: [
      'Đôi sneaker da thật vintage archive với độ hoàn thiện thủ công tỉ mỉ, đế đúc chống trơn trượt.',
      'Đã được vệ sinh chuyên sâu, dưỡng chất bảo dưỡng da chuyên dụng và khử mùi ozone trước khi giao.',
    ],
    accessories: [
      '01 Đôi sneakers da thật chính hãng',
      '01 Cây giữ form giày gỗ tuyết tùng (Shoe tree)',
      '01 Túi vải rút canvas bảo vệ',
    ],
    auditItems: [
      { label: 'Chất liệu da', value: 'Mềm mại · Không nứt gãy' },
      { label: 'Đế giày', value: 'Độ mòn < 5% · Bám tốt' },
      { label: 'Khử khuẩn', value: 'Xử lý buồng Ozone 30 phút' },
      { label: 'Lót trong', value: 'Lót da êm ái nguyên bản' },
    ],
    allowedConditions: 'Phù hợp đi lại thường nhật, dự sự kiện thời trang, chụp ảnh lookbook.',
    prohibitedActions: 'Không ngâm nước bùn, không phơi trực tiếp dưới nắng gắt trưa hè.',
  },
  '4': {
    id: '4',
    slug: 'camping-tent',
    title: 'Snow Peak Alpha Breeze Camping Tent 4P',
    subtitle: 'Lều cắm trại 4 người chịu mưa bão PU 1800mm · Khung nhôm Duralumin hàng không',
    category: 'CẮM TRẠI',
    location: 'Đà Nẵng',
    rating: 4.7,
    reviewCount: 39,
    condition: 'Rất tốt (Grade A 95%)',
    grade: 'Grade A',
    shutterOrUsage: 'Số chuyến đi: 06 chuyến',
    pricePerDay: 250000,
    deposit: 1000000,
    depositFormatted: '1.000.000₫',
    maxQuantity: 2,
    auditCode: '#DA-TENT-4P-0331',
    images: [
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1UpAkWSNWMQ1I3uDPXGKoJ-9POEmgeq7YpIuQ79QNfhv4wiFY--5DWEuQmRz157eN8zUtLw0-UevOSecwGvpA0ZrRN9VGHK-2-C5pFiUfYSHUx2MqqlZVsl629nHldrxwTBy5kgIb-ZIWJuDAl_Qky-i9C9MXMvUbdPsXpBqf_6hXLn00pNo_aYsD8vvfLcMsOpvOBXd4efa0KQnDAZ_YWGvL09INihtDBxqszHib',
        alt: 'Lều cắm trại Snow Peak Alpha Breeze',
        caption: 'Lều cắm trại 4 người Snow Peak',
      },
    ],
    overview: [
      'Dòng lều dã ngoại gia đình cao cấp từ thương hiệu Snow Peak với khả năng thông gió đa chiều và chống thấm nước tối đa.',
      'Sản phẩm được phơi sấy khô ráo, phủ lớp chống thấm định kỳ và kiểm tra toàn bộ cọc chốt an toàn.',
    ],
    accessories: [
      '01 Thân lều + Mái che chống mưa 75D Polyester',
      '01 Bộ khung cọc nhôm Duralumin kèm bao đựng',
      '14 Cọc ghim đất chống bão + 6 Dây chằng phản quang',
      '01 Túi xách chứa đồ chịu lực có khóa kéo',
    ],
    auditItems: [
      { label: 'Độ kín nước', value: 'Đạt chuẩn 1800mm PU' },
      { label: 'Khung nhôm', value: 'Thẳng 100% · Khớp nối êm' },
      { label: 'Màng lưới chống muỗi', value: 'Không rách · Khóa trơn' },
      { label: 'Vệ sinh', value: 'Khô ráo sạch cát bụi 100%' },
    ],
    allowedConditions: 'Phù hợp dã ngoại bãi biển, cắm trại thảo nguyên, đồi núi trong điều kiện thời tiết thông thường.',
    prohibitedActions: 'Không nhóm lửa hay dùng bếp ga trong lều; không gấp cất khi vải lều còn đang ướt sũng.',
  },
};

// Helper để lấy danh sách ngày thiết bị đã được thuê (bao gồm từ API / DB và các lịch tương lai)
export function getProductBookedDates(product: RentProductDetailData): BookedDateRange[] {
  const customList = product.bookedDates || [];

  // Tạo thêm các khoảng ngày đã thuê minh họa thực tế ở tương lai gần để giao diện luôn hiển thị trực quan
  const today = new Date();
  const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const addDays = (base: Date, days: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
  };

  // Khoảng 1: Sau hôm nay 4 ngày (kéo dài 3 ngày)
  const range1Start = addDays(today, 4);
  const range1End = addDays(today, 6);

  // Khoảng 2: Sau hôm nay 12 ngày (kéo dài 4 ngày)
  const range2Start = addDays(today, 12);
  const range2End = addDays(today, 15);

  const upcomingMockRanges: BookedDateRange[] = [
    {
      startDate: formatYMD(range1Start),
      endDate: formatYMD(range1End),
      note: 'Khách hàng #KH-4491 đã đặt thuê (Hà Nội)',
      customerName: 'Hoàng Minh',
    },
    {
      startDate: formatYMD(range2Start),
      endDate: formatYMD(range2End),
      note: 'Khách thuê sự kiện âm nhạc (Đã cọc Smart Escrow)',
      customerName: 'Studio Phố Cổ',
    },
    // Giữ thêm mốc tháng 11/2026 mẫu theo hình ảnh minh họa của bạn
    {
      startDate: '2026-11-20',
      endDate: '2026-11-24',
      note: 'Đơn thuê #ORD-2026-11 đã được xác nhận',
      customerName: 'Anh Tuấn',
    },
  ];

  return [...customList, ...upcomingMockRanges];
}

// Helper để lấy chi tiết sản phẩm theo id hoặc slug
export function getRentProductDetail(idOrSlug?: string): RentProductDetailData {
  if (!idOrSlug) return RENT_PRODUCT_DETAILS_MAP['1'];

  // Tìm theo key map trực tiếp
  if (RENT_PRODUCT_DETAILS_MAP[idOrSlug]) {
    return RENT_PRODUCT_DETAILS_MAP[idOrSlug];
  }

  // Tìm theo slug hoặc id trong values
  const found = Object.values(RENT_PRODUCT_DETAILS_MAP).find(
    (item) => item.slug === idOrSlug || item.id === idOrSlug
  );

  return found || RENT_PRODUCT_DETAILS_MAP['1'];
}

export interface RentProductItem {
  sku: string;
  name: string;
  category: string;
  brand: string;
  mountSensor?: string;
  pricePerDay: number;
  deposit: number;
  replacementValue?: number;
  totalUnits: number;
  readyUnits: number;
  rentingUnits: number;
  inspectionUnits?: number;
  approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'DRAFT';
  approvalDate?: string;
  rejectionReason?: string;
  coverImage: string;
  inspectionImages?: string[];
  description?: string;
  accessoriesIncluded?: string;
  minDays?: number;
  maxDays?: number;
}

export const mockRentProducts: RentProductItem[] = [
  {
    sku: 'HBL-907X-50C',
    name: 'Hasselblad 907X 50C + Lens XCD 45mm f/4 P Kit',
    category: 'Máy ảnh Medium Format Digital',
    brand: 'Hasselblad',
    mountSensor: 'Hasselblad XCD Mount • 50MP 43.8×32.9mm CMOS',
    pricePerDay: 450000,
    deposit: 16000000,
    replacementValue: 145000000,
    totalUnits: 2,
    readyUnits: 1,
    rentingUnits: 1,
    inspectionUnits: 0,
    approvalStatus: 'APPROVED',
    approvalDate: '12/03/2026',
    coverImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDKAx_H3xkU8r7DGb1bsKEC-myuZDJK7LKMh4TzsEgnVLvSmJcrRu7MGe2cAgkQ6lghdxCG82usy3D835J02laqRki1OV4XhR5a5u5Qc280QJ-d90WFKF-u-zbKlNYFIM7cOz2aV1JMPeiOXukyJRPq6M91OnDJJdEpo-78RWvT-w9GDTBTXfFnbjn3pIEeBuQhlMZ1hl1-xtQA7xadCBqZCm_i2njsZSVM8njZRlHN',
    inspectionImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCT-OQ367RurILCr0jpdGdNGfpHFT-WqdCF6Oq35n4oaSaBpANBBXeAs4ktLCvxqk0koCY36igHYPWdSQrz9Pb7nCNo1TvbiKRKIAtOL5gUxc02M00a1pbYHhl21_ZrBiDepTYB1JxrPmDKbdjRCXiAPYb7OHaPR9nzQFCcxm0d4I19Xl0XpUglbILawc4TSuN7MB6a2WeX7u-picVp1m93K0Nd7KPkzannCN3w92vo',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAQ9AFXrozgzjAjZS06ET7kj4_p_AHlmdARrZhSO4zoBDTkKvSEocbrbxbY19GU40IhXxxUBydeKobXsidYauNtblWcV572MaBP1nVzlYLVXvEvWblq2o87dvMtSM8LzFRiJR3pk4HqfO42ovSmJFJjJrLZ4TZ8A1YOnuAD6MwTLupK0JSqDn4_ETghWwOxL3n0xP8_0Rpp2cgWc8z3VZkIkM-NIRXZz5AOvC4ipoS7',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCg-wK086gI3TlRyzKSKjwyOQYqjrGDMEvdr90lwqo7PUr6KbBaK3bVQfHrYQt5aWi-FI6dr_VErQHtfzflWiBhG0qLLJJerOcxHkboPMqwOIfX7k2zwLaOIgQXdAsSKPypn0civfMCdPukEVFgth7WuRZbRmXwMgL9h1ihco5JkQeY96JKpAWJjE2iU2slgtywZEhhgUG0csMsHY_YM-PbfFyeunfLfx7j89XS2csw',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCc4d2QUXo8yOcHDdH49bc-lMHGd3u9MouQnr9yyIgByNEYoZZp8M66liUqxHB7Yx-O4Gh-0k5aV3HAzOxsnSUH9EH1JaINxfS5DoNobRls-Lo3AOlR35NWV2Np2k72soitd2F8LaX8ItacTfVed8Hhr4aV7fs2Hf3bIhNycPfn-Kkz3Pye8qGjN46iNj1sM6EbVSM8OS1-f5e9tNVWxVBrM9oJ34xi93Pha5ACneSf',
    ],
    description:
      'Thiết bị Hasselblad 907X 50C đại diện cho sự giao thoa hoàn hảo giữa di sản thiết kế máy ảnh vuông truyền thống của Thụy Điển và công nghệ số đỉnh cao 16-bit màu. Bộ sản phẩm được tuyển chọn và bảo dưỡng trực tiếp tại buồng khử ẩm áp suất âm của Atelier Chronos & Optics. Thân máy đi kèm ống kính XCD 45mm f/4 P gọn nhẹ siêu sắc nét, lá khẩu cơ học tốc độ đồng bộ đèn flash lên tới 1/2000s.',
    accessoriesIncluded: '2 pin zin 3400mAh, sạc kép dual, nắp che cáp, dây da Atelier, vali Nanuk 910',
    minDays: 2,
    maxDays: 30,
  },
  {
    sku: 'LCA-M6-TITAN',
    name: 'Leica M6 Classic Titanium Finish (1994)',
    category: 'Máy ảnh Phim Analog 35mm',
    brand: 'Leica',
    mountSensor: 'Leica M Mount Cơ khí',
    pricePerDay: 380000,
    deposit: 20000000,
    replacementValue: 95000000,
    totalUnits: 1,
    readyUnits: 0,
    rentingUnits: 1,
    inspectionUnits: 0,
    approvalStatus: 'APPROVED',
    approvalDate: '01/02/2026',
    coverImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCmYdkWVRHHB9Xxm1mQhTzNT9Xt1x3TNJOxHqrHlSpsLP_iZle-nGzIIVxf4RIBPGf5eZ4ZP98H0CxD0lNmbkzzPkI7Ow6AE9fbAimD9cu9Oe4AT_l62Fyf-KlsvRKaSUQEv_aod7MoRX-Hqzl57xvMvo_q5tNsH0LJzegWuVpl2aAB8-OzZZk1AIB0gYfWSEwcBs92HBanEw8QlQWEPkSmVx6S5dbVSx7Fn_k1bbiB',
    inspectionImages: [],
    description:
      'Phiên bản Leica M6 Classic Titanium cực hiếm xuất xưởng năm 1994. Toàn bộ vỏ máy bọc titan chống trầy xước và bám vân tay, kính ngắm rangefinder 0.72x chuẩn sáng cho trải nghiệm đo sáng điểm cơ học thuần khiết.',
    accessoriesIncluded: 'Bao da nguyên bản Leica, dây đeo da đanh, 2 nắp body cap titan',
    minDays: 2,
    maxDays: 14,
  },
  {
    sku: 'CAN-R6M2-KIT',
    name: 'Canon EOS R6 Mark II + RF 24-70mm f/2.8L IS USM',
    category: 'Máy ảnh Hybrid Mirrorless',
    brand: 'Canon',
    mountSensor: 'Canon RF Mount • Full-Frame 24.2MP',
    pricePerDay: 450000,
    deposit: 12500000,
    replacementValue: 82000000,
    totalUnits: 4,
    readyUnits: 2,
    rentingUnits: 1,
    inspectionUnits: 1,
    approvalStatus: 'APPROVED',
    approvalDate: '15/01/2026',
    coverImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAcz7i5p0kttyztDmTjqopvDuQzlQ__8TshtjzlhBrOrBWQWZWtf3sDI8Px-NAKKKXLyuyOy_64mQsSQ6KkINBYktz63WIuFbBTeut568IxmfVTHTaH-vuYH8rgJ8WhPk7J6fVxAnJSzLWpyw0yYR40gFsPzBFadJdVYJkDgI1k_bgRvbHoHZU0U7kooQK03WachQcyN4hhlyO57nMH01DGyoTzXS9AhF7I_YnyIBwC',
    inspectionImages: [],
    description:
      'Chiến binh hybrid tối tân cho quay phim 4K60p và chụp ảnh thương mại tốc độ cao 40fps điện tử. Bộ kit đi kèm ống kính zoom khẩu lớn đa dụng RF 24-70mm f/2.8L.',
    accessoriesIncluded: '2 pin LP-E6NH, sạc đôi Canon, lens hood, filter B+W nano, vali Nanuk',
    minDays: 1,
    maxDays: 30,
  },
  {
    sku: 'SNY-FX3-CINE',
    name: 'Sony FX3 Cinema Line Kit + XLR Top Handle',
    category: 'Ống kính Điện ảnh (Cinema Lenses)',
    brand: 'Sony',
    mountSensor: 'Sony E-Mount Full Frame Cinema',
    pricePerDay: 650000,
    deposit: 25000000,
    replacementValue: 105000000,
    totalUnits: 2,
    readyUnits: 0,
    rentingUnits: 1,
    inspectionUnits: 1,
    approvalStatus: 'PENDING',
    coverImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBDPrE_XRvsqnkAlL-XkqaE7_mrceyuz0-zpIF-TvZhiUyHotYwT3mOKLn4M4LAN_6NFRBFmTjYxlVGIRWgbOr-GsyQm7RBrhCkv86LbZNhPskUe1kWvIN7Ws50vyIrTcUO8I8yL4y1WFpO7MyONFtu01LIp4NO22XGNLzzsn6XCoZlnKM7ZMQeAIG5n6eLfmdX_pLWniJd7bXsO3kAxSNmu2rOjxurF3662L8I8C9n',
    inspectionImages: [],
    description:
      'Máy quay điện ảnh nhỏ gọn thuộc hệ Cinema Line của Sony với tay cầm âm thanh XLR kép, tản nhiệt chủ động không giới hạn thời gian ghi hình 4K 120p 10-bit 4:2:2.',
    accessoriesIncluded: 'Top Handle XLR, cage SmallRig, 3 pin NP-FZ100, sạc đôi, thẻ CFexpress Type A 160GB',
    minDays: 1,
    maxDays: 30,
  },
  {
    sku: 'ANG-OPT-2876',
    name: 'Angénieux Optimo 28-76mm T2.6 Cine Zoom PL Mount',
    category: 'Ống kính Điện ảnh (Cinema Lenses)',
    brand: 'Angénieux',
    mountSensor: 'PL Mount Cinema Cine-Lens',
    pricePerDay: 850000,
    deposit: 35000000,
    replacementValue: 320000000,
    totalUnits: 1,
    readyUnits: 0,
    rentingUnits: 0,
    inspectionUnits: 1,
    approvalStatus: 'REJECTED',
    rejectionReason:
      'Ban quản trị yêu cầu bổ sung chứng chỉ kiểm định sai số thấu kính quang học Collimator định kỳ quý 1/2026 và ảnh chụp lớp phủ tráng gương (Coating inspection). Cần bổ sung lại ảnh macro buồng gương.',
    coverImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC1NU_DL2l5bwC0OLiSITkmxV0CwM1fxBZ9iZSOP8-N4o2xZKDLnSn51hbwWfDB3njxDXzYaLJgwk6tcYXHm9OfAV128YFnd42gi9_ZtNGddBYRpW2nJVzihPhTLcyDSKTgzYACdGSesEBcCNlO9CJzZpMyOt9HJUc9afCmYHJjK_2spJKKqklU8RzM_q0d5r-5lxttaVmY2RJBwfqVNFbw8Ty31TMbtLkaZ_GWMSlP',
    inspectionImages: [],
    description:
      'Ống kính zoom cinema đỉnh cao nước Pháp với chất màu hữu cơ ấm áp, khẩu độ T2.6 xuyên suốt toàn dải tiêu cự.',
    accessoriesIncluded: 'Hộp chống sốc bayonet PL, support rod 15mm, zoom lever',
    minDays: 3,
    maxDays: 15,
  },
  {
    sku: 'VG-R3A-GRY',
    name: 'Voigtländer Bessa R3A Grey + Nokton 40mm f/1.4',
    category: 'Máy ảnh Phim Analog 35mm',
    brand: 'Voigtländer',
    mountSensor: 'Leica M Mount (VM Mount)',
    pricePerDay: 220000,
    deposit: 8000000,
    replacementValue: 28000000,
    totalUnits: 2,
    readyUnits: 2,
    rentingUnits: 0,
    inspectionUnits: 0,
    approvalStatus: 'PENDING',
    coverImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB9FFl24L3L10Oq9IFKXBTQIzLc1IpHpuzcrOVZthhyrTKZrfuWhWulSCFfIm3-btt60HRx8UgdPqq9uGRb-iDOwIpDGJ33kiQywsEtLYpm3FaqCXexRkdYEijezZLwtJPD-3LyTYtSV9jewGdu7RhmW3K7Y5XAIL3kjd6vso-tfrwa0Tm328YQd6wixMF_vhJtlUYOwN4TWgWUqkm9Kum5J_uc0LhPjs4YNo5uq9Xh',
    inspectionImages: [],
    description:
      'Máy ảnh phim rangefinder 35mm sở hữu khung ngắm 1:1 siêu lớn độc nhất, cho phép mở cả hai mắt khi lấy nét.',
    accessoriesIncluded: 'Ống kính Nokton 40mm f/1.4 Classic, kính lọc UV, pin đo sáng LR44 mới',
    minDays: 2,
    maxDays: 20,
  },
  {
    sku: 'TE-OP1-FIELD',
    name: 'Teenage Engineering OP-1 Field Synthesizer',
    category: 'Thiết bị Ghi âm Chuyên nghiệp',
    brand: 'Teenage Engineering',
    mountSensor: '32-bit Stereo Field Synth Engine',
    pricePerDay: 320000,
    deposit: 8000000,
    replacementValue: 48000000,
    totalUnits: 3,
    readyUnits: 2,
    rentingUnits: 1,
    inspectionUnits: 0,
    approvalStatus: 'APPROVED',
    approvalDate: '20/02/2026',
    coverImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAo_A6vbG5C7yNxdiIrh41aprAuG_3gtVc5WjNqkufRKQ1vO43ruqD81hlLwlKqk7M712zksb8Arlz9D9iEgXaPhS0ftv_w_CIGMRE06KIDWp0uhvNa4lc6y-Mj8mlvo_W2f4bUAavczWjtgbyB3im5B3nwB9fP35tLfSfjTVyTRK32fZQVgPXCHzaBxClsjyF-l-3iI_3WNWdOnI-RK_Q9AErfr9JorVI2PmK5GAAm',
    inspectionImages: [],
    description:
      'Trạm làm nhạc di động di sản Thụy Điển với thân nhôm nguyên khối, radio FM tích hợp và pin 24 giờ liên tục.',
    accessoriesIncluded: 'Túi da Field Case, cáp âm thanh USB-C 3.5mm, ăng ten bắt sóng FM',
    minDays: 2,
    maxDays: 30,
  },
  {
    sku: 'SNP-AB4P-TENT',
    name: 'Snow Peak Alpha Breeze 4P Expedition Tent',
    category: 'Ngoại trang & Lều Dã ngoại cao cấp',
    brand: 'Snow Peak',
    mountSensor: 'Khung nhôm Duralumin A7001',
    pricePerDay: 180000,
    deposit: 3500000,
    replacementValue: 16500000,
    totalUnits: 3,
    readyUnits: 2,
    rentingUnits: 0,
    inspectionUnits: 1,
    approvalStatus: 'DRAFT',
    coverImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB9rytAAjSKkVfNqAqBB6gRhIDRvhHMWZXVg7VWpUEviPPMfrVE4D9Tn5Ce1Zh1k0znOb9zEg_-9_qvIA_xhXKhqSZSxqzLDLuupGHkmUBs1UzZe1fdvWkl6nMaD9f1_giN-Sfg29F1j-f3ZqxNVsOj6xY2GWwhcoeAmWZhzrSUfutquQ_Dbm94qCZnIgiFeemYOH3p226qMkObEDjlnxchnfWkYllqRW-dEFrlJz7Y',
    inspectionImages: [],
    description:
      'Dòng lều dã ngoại phong cách Nhật Bản với độ thoáng khí 4 chiều, chất vải chống thấm nước phủ tráng Teflon cao cấp.',
    accessoriesIncluded: 'Túi đựng canvas, bộ cọc neo hợp kim, dây dù dạ quang phản quang',
    minDays: 2,
    maxDays: 14,
  },
];
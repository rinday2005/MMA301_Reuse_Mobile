export interface StatItem {
  val: string;
  sub: string;
}

export interface CircularStepItem {
  num: string;
  icon: string;
  title: string;
  desc: string;
  variant: 'dark' | 'light' | 'emerald' | 'amber';
}

export interface BenefitItem {
  title: string;
  desc: string;
}

export const ABOUT_STATS: StatItem[] = [
  { val: '01 Đối tác',  sub: 'Shop Owner độc quyền thẩm định' },
  { val: '100% Cọc',   sub: 'Smart Escrow hoàn trả tự động' },
  { val: '2 Phân hệ',  sub: 'RENT ngắn hạn & THRIFT vĩnh viễn' },
  { val: '0 Rác thải', sub: 'Tối đa hóa giá trị vật dụng tồn trữ' },
];

export const ABOUT_CIRCULAR_STEPS: CircularStepItem[] = [
  { num: '01', icon: 'sync_alt',        title: 'RENT',    desc: 'Khách đặt thuê món đồ theo ngày',            variant: 'dark' },
  { num: '02', icon: 'sentiment_satisfied', title: 'USE', desc: 'Sử dụng trong chuyến đi / sự kiện',         variant: 'light' },
  { num: '03', icon: 'keyboard_return', title: 'RETURN',  desc: 'Bàn giao shipper trả về đúng hạn',          variant: 'light' },
  { num: '04', icon: 'biotech',         title: 'INSPECT', desc: 'Shop Owner kiểm định & hoàn cọc',           variant: 'light' },
  { num: '05', icon: 'autorenew',       title: 'REUSE',   desc: 'Tiếp tục cho khách hàng sau thuê',          variant: 'emerald' },
  { num: '06', icon: 'local_mall',      title: 'THRIFT',  desc: 'Chuyển sang bán dứt điểm lưu trữ',         variant: 'amber' },
];

export const ABOUT_CUSTOMER_BENEFITS: BenefitItem[] = [
  { title: 'Thuê thay vì mua', desc: 'khi chỉ cần dùng tạm thời cho các chuyến đi ngắn hoặc dự án cụ thể.' },
  { title: 'Trải nghiệm đa dạng', desc: 'từ máy ảnh quang học, trang phục sự kiện, giày dép đến đồ cắm trại cao cấp.' },
  { title: 'Mua đồ đã qua sử dụng (THRIFT)', desc: 'được kiểm định hồ sơ rõ ràng, giá hợp lý, chất lượng đảm bảo.' },
  { title: 'Giảm nhu cầu sở hữu không cần thiết', desc: ', chung tay sống xanh và hạn chế rác thải công nghiệp.' },
];

export const ABOUT_SHOP_BENEFITS: BenefitItem[] = [
  { title: 'Tạo sản phẩm RENT', desc: 'với bảng thông số, giá thuê theo ngày và mức tiền cọc tiêu chuẩn.' },
  { title: 'Quản lý tồn kho', desc: 'và lịch trình sẵn sàng của từng serial thiết bị trên hệ thống.' },
  { title: 'Duyệt đơn thuê', desc: 'nhanh chóng, kết nối đơn vị vận chuyển có bảo hiểm giao tận tay khách.' },
  { title: 'Kiểm tra sản phẩm trả về', desc: ', đối chiếu tình trạng thực tế để giải phóng tiền cọc cho khách.' },
  { title: 'Chuyển sản phẩm đủ điều kiện sang THRIFT', desc: ', tạo nguồn thu bền vững cho các thiết bị hoàn thành chu kỳ thuê.' },
  { title: 'Quản lý đơn THRIFT', desc: ' và bảo hành tiêu chuẩn 72 giờ cho người mua mới.' },
];

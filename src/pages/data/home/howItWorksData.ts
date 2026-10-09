export interface RentStepData {
  num: string;
  icon: string;
  title: string;
  desc: string;
  tag: string;
  dark: boolean;
}

export interface ThriftStepData {
  num: number;
  title: string;
  desc: string;
}

export const RENT_STEPS: RentStepData[] = [
  { num: '01', icon: 'search',          title: 'Tìm sản phẩm',        desc: 'Khám phá danh mục camera, cắm trại, thời trang chuẩn kiểm định.',                       tag: 'Khám phá',       dark: false },
  { num: '02', icon: 'calendar_today',  title: 'Chọn ngày thuê',      desc: 'Chọn ngày nhận và trả hàng linh hoạt theo lịch trình chính xác của bạn.',               tag: 'Đặt lịch',       dark: false },
  { num: '03', icon: 'shopping_bag',    title: 'Thêm vào giỏ',        desc: 'Sản phẩm RENT tự động gom vào luồng đơn thuê phân tách chuyên biệt.',                   tag: 'Hệ thống hóa',   dark: false },
  { num: '04', icon: 'verified_user',   title: 'Shop Owner duyệt',    desc: 'Shop Owner kiểm tra lịch sẵn sàng và phản hồi xác nhận trong 15-30 phút.',              tag: 'Phê duyệt nhanh',dark: false },
  { num: '05', icon: 'payments',        title: 'Thanh toán trọn gói', desc: 'Phí thuê + tiền cọc + vận chuyển qua VNPay, tiền cọc cách ly an toàn.',                 tag: 'Smart Escrow',   dark: false },
  { num: '06', icon: 'local_shipping',  title: 'Nhận sản phẩm',       desc: 'Đóng gói thùng cứng Nanuk/Pelican, kèm tem niêm phong và biên bản giao.',               tag: 'Chuẩn bảo vệ',   dark: false },
  { num: '07', icon: 'photo_camera',    title: 'Trải nghiệm thiết bị',desc: 'Sử dụng với sự an tâm tối đa nhờ chính sách bảo hiểm rủi ro toàn diện.',               tag: 'Bảo hiểm 100%',  dark: false },
  { num: '08', icon: 'replay',          title: 'Trả lại thiết bị',    desc: 'Đóng gói nguyên trạng và bàn giao cho đơn vị chuyển phát có bảo hiểm.',                 tag: 'Lấy hàng tận nơi',dark: false },
  { num: '09', icon: 'fact_check',      title: 'Kiểm tra đồng bộ',    desc: 'Shop Owner đồng kiểm tình trạng cảm biến, cơ học và vệ sinh trong 4-12h.',              tag: 'Audit Bench',    dark: false },
  { num: '10', icon: 'credit_score',    title: 'Hoàn cọc tự động',    desc: 'Giải phóng 100% tiền cọc tự động về tài khoản khách hàng khi thiết bị nguyên vẹn.',     tag: 'Minh bạch 100%', dark: true  },
];

export const THRIFT_STEPS: ThriftStepData[] = [
  { num: 1, title: 'Tìm sản phẩm tuyển chọn',       desc: 'Khám phá kho lưu trữ đồ cũ tuyển chọn và đồ chuyển đổi Second-Life từ hệ sinh thái.' },
  { num: 2, title: 'Kiểm tra thông số Audit Bench', desc: 'Xem chi tiết bảng chấm điểm Audit Bench, độ mới %, ảnh chụp cận cảnh thực tế 100%.' },
  { num: 3, title: 'Thêm vào giỏ đơn mua',          desc: 'Tự động gom vào danh mục thanh toán mua sắm dứt điểm, không kèm ràng buộc tiền cọc.' },
  { num: 4, title: 'Thanh toán VNPay an toàn',       desc: 'Thanh toán trọn gói giá niêm yết và phí vận chuyển qua cổng bảo mật một lần duy nhất.' },
  { num: 5, title: 'Nhận hàng có hồ sơ chứng nhận', desc: 'Giao hàng hỏa tốc kèm hồ sơ chứng nhận thẩm định và tem bảo đảm 72 giờ đổi trả nếu sai lệch.' },
  { num: 6, title: 'Tiếp tục sử dụng lâu dài',      desc: 'Tận hưởng món đồ yêu thích với quyền sở hữu vĩnh viễn, kéo dài thêm nhiều năm tuổi thọ.' },
];

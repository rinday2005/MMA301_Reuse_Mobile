export interface FaqItemData {
  id: string;
  question: string;
  answer: string;
}

export interface FaqSectionData {
  id: string;
  number: string;
  category: string;
  title: string;
  description: string;
  items: FaqItemData[];
}

export const FAQ_SECTIONS: FaqSectionData[] = [
  {
    id: 'rent',
    number: '01',
    category: 'rent',
    title: 'RENT — Dịch vụ Thuê thiết bị',
    description: 'Mô hình trải nghiệm linh hoạt theo lịch trình với hệ thống ký quỹ Smart Escrow',
    items: [
      {
        id: 'rent-1',
        question: 'RENT hoạt động như thế nào?',
        answer: 'Bạn chọn thiết bị cần dùng, chọn ngày nhận và trả hàng trên lịch khả dụng, gửi đơn đặt. Shop Owner duyệt trong 15–30 phút. Sau khi thanh toán cọc và phí thuê qua VNPay, sản phẩm được giao tận nơi trong thùng chuyên dụng Nanuk/Pelican niêm phong.'
      },
      {
        id: 'rent-2',
        question: 'Giá thuê được tính như thế nào?',
        answer: 'Giá thuê tính theo công thức: (Đơn giá thuê / ngày) × (Số ngày thuê thực tế). Giá niêm yết đã bao gồm bảo hiểm rủi ro cơ bản và chi phí thẩm định kỹ thuật trước khi giao.'
      },
      {
        id: 'rent-3',
        question: 'Tiền cọc là gì?',
        answer: 'Tiền cọc (Escrow Deposit) là khoản tiền bảo chứng tài sản được giữ an toàn trong tài khoản bảo chứng Smart Escrow của ReUse Hub. Khoản này không bị tiêu trừ vĩnh viễn và được hoàn trả 100% sau khi hoàn tất trả hàng và kiểm tra nguyên trạng.'
      },
      {
        id: 'rent-4',
        question: 'Khi nào tôi nhận lại tiền cọc?',
        answer: 'Ngay khi sản phẩm được trả về kho và Shop Owner hoàn tất quy trình đối soát kỹ thuật tại Audit Bench (thường trong vòng 4–12 giờ), hệ thống sẽ giải phóng và tự động hoàn trả 100% tiền cọc về tài khoản của bạn.'
      },
      {
        id: 'rent-5',
        question: 'Nếu tôi làm hỏng hoặc mất sản phẩm thì sao?',
        answer: 'ReUse Hub áp dụng chính sách Fair Wear & Tear đối với các hao mòn tự nhiên trong quá trình tác nghiệp thông thường. Trong trường hợp có hư hỏng do va đập hoặc mất mát, Shop Owner sẽ đối chiếu biên bản bàn giao niêm phong ban đầu để giám định và khấu trừ chi phí sửa chữa từ tiền cọc theo biểu phí minh bạch.'
      },
      {
        id: 'rent-6',
        question: 'Tôi có thể gia hạn thời gian thuê không?',
        answer: 'Có. Bạn có thể gửi yêu cầu gia hạn trực tiếp trên chi tiết đơn thuê trước thời điểm hết hạn 24 giờ, với điều kiện sản phẩm chưa có lịch hẹn đặt trước từ khách hàng tiếp theo.'
      },
      {
        id: 'rent-7',
        question: 'Làm sao biết sản phẩm còn khả dụng?',
        answer: 'Lịch sẵn sàng của sản phẩm được cập nhật theo thời gian thực trên trang chi tiết sản phẩm. Bạn có thể chọn ngày nhận và trả hàng trực tiếp trên bộ lịch thông minh.'
      },
      {
        id: 'rent-8',
        question: 'Điều gì xảy ra sau khi tôi trả sản phẩm?',
        answer: 'Sản phẩm trải qua quy trình kiểm định 14 bước tại Audit Bench của Shop Owner (kiểm tra cảm biến, cơ học quang học, khử trùng UV-C). Thiết bị đạt chuẩn sẽ quay lại vòng đời cho thuê RENT tiếp theo hoặc đủ điều kiện chuyển giao sang THRIFT.'
      }
    ]
  },
  {
    id: 'thrift',
    number: '02',
    category: 'thrift',
    title: 'THRIFT — Mua sắm Tuần hoàn Bền vững',
    description: 'Sở hữu vĩnh viễn đồ lưu trữ tuyển chọn kèm hồ sơ kiểm định Audit Bench 100%',
    items: [
      {
        id: 'thrift-1',
        question: 'THRIFT là gì?',
        answer: 'THRIFT là mô hình mua bán dứt điểm các sản phẩm đã qua sử dụng tuyển chọn, được kiểm định độc lập, có hồ sơ chứng nhận nguồn gốc minh bạch và bảo đảm chất lượng.'
      },
      {
        id: 'thrift-2',
        question: 'Sản phẩm THRIFT có tình trạng như thế nào?',
        answer: 'Từng sản phẩm đều được đánh giá và phân loại minh bạch (Grade Mint 98-99%, Grade A+ 95%, Grade A 90%) kèm ảnh chụp thực tế 100% độ phân giải cao và hồ sơ kiểm định Shutter/Cảm biến chi tiết.'
      },
      {
        id: 'thrift-3',
        question: 'Returned Rental Product là gì?',
        answer: 'Đây là các sản phẩm từng phục vụ trong chu kỳ cho thuê RENT, sau khi kết thúc định mức sử dụng được Shop Owner bảo dưỡng, căn chỉnh toàn diện và chuyển đổi sang phân hệ THRIFT với mức giá tối ưu (chương trình Second-Life).'
      },
      {
        id: 'thrift-4',
        question: 'Tôi có thể trả lại sản phẩm THRIFT không?',
        answer: 'Có. Khách hàng được hưởng đặc quyền kiểm tra độc lập trong vòng 72 giờ (3 ngày) sau khi nhận hàng. Nếu sản phẩm phát sinh lỗi hoặc sai khác so với hồ sơ thẩm định, bạn có quyền yêu cầu hoàn tiền 100%.'
      },
      {
        id: 'thrift-5',
        question: 'THRIFT khác RENT như thế nào?',
        answer: 'RENT là hình thức thuê trải nghiệm ngắn hạn theo ngày và yêu cầu tiền cọc hoàn lại. THRIFT là quyền sở hữu vĩnh viễn với mức giá trọn gói một lần, không phát sinh chi phí duy trì hay tiền cọc.'
      }
    ]
  },
  {
    id: 'payment',
    number: '03',
    category: 'payment',
    title: 'THANH TOÁN — Payment & Escrow',
    description: 'Cơ chế thanh toán bảo mật đa kênh qua VNPay và quỹ tiền cọc cách ly Smart Escrow',
    items: [
      {
        id: 'pay-1',
        question: 'ReUse Hub hỗ trợ thanh toán bằng phương thức nào?',
        answer: 'Hệ thống hỗ trợ thanh toán trực tuyến qua cổng VNPay (VNPay-QR, thẻ ATM nội địa Napas, thẻ quốc tế Visa, Mastercard, JCB).'
      },
      {
        id: 'pay-2',
        question: 'Một đơn RENT bao gồm những khoản nào?',
        answer: 'Đơn RENT gồm 3 khoản minh bạch: (1) Phí thuê theo số ngày, (2) Tiền cọc bảo chứng hoàn lại 100% (Smart Escrow), và (3) Phí vận chuyển hai chiều có bảo hiểm.'
      },
      {
        id: 'pay-3',
        question: 'Một đơn THRIFT bao gồm những khoản nào?',
        answer: 'Đơn THRIFT bao gồm: (1) Giá sản phẩm niêm yết trọn gói và (2) Phí vận chuyển tiêu chuẩn có niêm phong bảo đảm.'
      },
      {
        id: 'pay-4',
        question: 'VNPay hoạt động như thế nào?',
        answer: 'Khi bạn thanh toán qua VNPay, tiền cọc được giữ cách ly an toàn trong tài khoản ủy thác Escrow. Tiền cọc chỉ được giải phóng cho Shop Owner sau khi bạn hoàn trả thiết bị và xác nhận kiểm định hoàn tất.'
      }
    ]
  },
  {
    id: 'logistics',
    number: '04',
    category: 'logistics',
    title: 'VẬN CHUYỂN — Logistics & Giao nhận',
    description: 'Quy cách đóng thùng chống sốc Nanuk/Pelican và biểu phí cấp độ đơn hàng',
    items: [
      {
        id: 'log-1',
        question: 'Phí vận chuyển được tính như thế nào?',
        answer: 'Phí vận chuyển được tính ở cấp độ đơn hàng, không tính riêng cho từng sản phẩm. Đơn hàng được vận chuyển bằng phương thức bảo đảm với thùng chống sốc Nanuk/Pelican và niêm phong bảo mật chuyên dụng.'
      },
      {
        id: 'log-2',
        question: 'Phí vận chuyển tính theo sản phẩm hay theo đơn?',
        answer: 'Phí vận chuyển được tính ở cấp độ đơn hàng, không tính riêng cho từng sản phẩm. Vì ReUse Hub chỉ có một Shop Owner và hỗ trợ nhiều sản phẩm trong cùng một đơn, các sản phẩm có thể được xử lý và đóng gói chung trong đơn hàng giúp tối ưu chi phí cho người dùng.'
      }
    ]
  },
  {
    id: 'cart',
    number: '05',
    category: 'cart',
    title: 'GIỎ HÀNG & ĐƠN HÀNG — Cart & Multi-Order',
    description: 'Trải nghiệm Universal Cart kết hợp tự động định tuyến đơn hàng thông minh',
    items: [
      {
        id: 'cart-1',
        question: 'Giỏ hàng có thể chứa nhiều sản phẩm không?',
        answer: 'Có. Bạn có thể thêm nhiều sản phẩm vào giỏ hàng trong cùng một phiên trải nghiệm.'
      },
      {
        id: 'cart-2',
        question: 'Nếu giỏ có cả RENT và THRIFT thì sao?',
        answer: 'Các sản phẩm RENT và THRIFT sẽ được hệ thống tự động tách thành các đơn hàng tương ứng khi checkout (Đơn RENT có lịch hẹn và tiền cọc; Đơn THRIFT thanh toán dứt điểm sở hữu).'
      }
    ]
  },
  {
    id: 'account',
    number: '06',
    category: 'account',
    title: 'TÀI KHOẢN & KYC — Account & Trust Tier',
    description: 'Phân quyền tài khoản khách, quản lý hồ sơ và nâng cấp tín nhiệm công dân số',
    items: [
      {
        id: 'acc-1',
        question: 'Tôi có cần tài khoản để xem sản phẩm không?',
        answer: 'Không. Bạn có thể tự do khám phá toàn bộ danh mục sản phẩm RENT và THRIFT dưới dạng Khách vãng lai (Guest).'
      },
      {
        id: 'acc-2',
        question: 'Tôi có cần tài khoản để thuê không?',
        answer: 'Có. Để thiết lập hợp đồng thuê điện tử và quản lý tiền cọc an toàn, bạn cần tạo tài khoản hoặc đăng nhập trước khi tiến hành thuê.'
      },
      {
        id: 'acc-3',
        question: 'Tôi có cần tài khoản để mua THRIFT không?',
        answer: 'Có. Tài khoản thành viên giúp bạn lưu giữ chứng thư xuất xứ số, kích hoạt đặc quyền bảo hành 72 giờ và theo dõi hành trình đơn hàng.'
      },
      {
        id: 'acc-4',
        question: 'KYC là gì?',
        answer: 'KYC (Định danh khách hàng) là quy trình xác minh danh tính và bằng chứng cư trú giúp nâng hạng tín nhiệm (Trust Tier). Khi đạt KYC cấp độ cao, bạn được hưởng đặc quyền miễn giảm tiền cọc hoặc mở khóa thuê các thiết bị quang học cao cấp.'
      }
    ]
  },
  {
    id: 'shopowner',
    number: '07',
    category: 'shopowner',
    title: 'SHOP OWNER — Cửa hàng ủy quyền duy nhất',
    description: 'Nguyên tắc độc quyền nguồn cung nhằm đảm bảo tính nguyên bản và độ tin cậy',
    items: [
      {
        id: 'shop-1',
        question: 'Ai có thể tạo sản phẩm RENT?',
        answer: 'Chỉ Shop Owner mới có quyền tạo và quản lý sản phẩm RENT trên hệ thống sau khi đã qua thẩm định năng lực kỹ thuật và cam kết kho bãi.'
      },
      {
        id: 'shop-2',
        question: 'Ai có thể tạo sản phẩm THRIFT?',
        answer: 'Chỉ Shop Owner mới có quyền tạo và niêm yết sản phẩm THRIFT.'
      },
      {
        id: 'shop-3',
        question: 'USER thông thường có thể đăng sản phẩm không?',
        answer: 'Chỉ Shop Owner mới có quyền tạo và quản lý sản phẩm RENT và THRIFT. Tài khoản USER thông thường không thể tạo listing trên marketplace nhằm duy trì chuẩn mực kiểm định và cam kết bảo hành tuyệt đối.'
      },
      {
        id: 'shop-4',
        question: 'What happens to returned rental products?',
        answer: 'Sản phẩm RENT sau khi hoàn tất số chu kỳ cho thuê hoặc khấu hao theo kế hoạch sẽ được Shop Owner kiểm định kỹ thuật 14 bước. Nếu còn hoàn hảo, thiết bị tiếp tục phục vụ cho thuê hoặc được chuyển đổi sang phân hệ THRIFT Second-Life để bàn giao cho chủ nhân mới.'
      }
    ]
  },
  {
    id: 'circular',
    number: '08',
    category: 'circular',
    title: 'MÔ HÌNH TUẦN HOÀN — Circular Reuse Model',
    description: 'Chiến lược tối ưu hóa vòng đời thiết bị, không rác thải và thân thiện môi trường',
    items: [
      {
        id: 'circ-1',
        question: 'ReUse Hub hỗ trợ tái sử dụng như thế nào?',
        answer: 'ReUse Hub vận hành theo chu trình khép kín: RENT → USE → RETURN → INSPECT → tiếp tục RENT hoặc chuyển thành THRIFT → người dùng mới tiếp tục REUSE. Mô hình này giúp kéo dài tối đa tuổi thọ sản phẩm và triệt tiêu lãng phí tài nguyên.'
      }
    ]
  }
];

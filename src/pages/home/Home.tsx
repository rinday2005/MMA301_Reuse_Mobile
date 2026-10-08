import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const wishlistTarget = user ? '/saved-items' : '/login';

  return (
    <div className="flex flex-col w-full bg-surface-container-low font-body-md text-body-md text-on-surface antialiased">
      {/* 1. HERO SECTION */}
      <section className="relative w-full max-w-[1440px] mx-auto px-gutter md:px-margin pt-space-xl pb-24 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
          {/* Cột trái: Tiêu đề & Giới thiệu */}
          <div className="lg:col-span-6 flex flex-col gap-space-lg z-10">
            {/* Huy hiệu cam kết */}
            <div className="inline-flex items-center gap-space-sm px-space-md py-space-xs rounded-full bg-surface-container-high w-fit shadow-xs">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                0% Lãng Phí Trang Phục • 100% Giặt Hấp Diệt Khuẩn • Ký Quỹ Minh Bạch
              </span>
            </div>

            {/* Tiêu đề chính */}
            <div className="flex flex-col gap-space-sm">
              <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg tracking-tight text-primary leading-[1.08]">
                Mặc Nhiều Hơn.<br />
                <span className="italic font-normal">Sở Hữu Ít Hơn.</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl pt-space-xs leading-relaxed">
                Trải nghiệm tủ đồ không giới hạn: thuê trang phục dự tiệc, áo dài và đồ thiết kế cao cấp cho từng khoảnh khắc đặc biệt. Săn đồ si, vintage tuyển chọn chính hãng. Trao cho trang phục một vòng đời mới rực rỡ.
              </p>
            </div>

            {/* Nút hành động chính */}
            <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
              <Link
                to="/rent"
                className="inline-flex items-center justify-center px-space-xl py-3.5 bg-primary-container text-surface-container-low font-label-md text-label-md uppercase tracking-wider rounded-lg shadow-sm hover:bg-on-surface transition-all duration-200 font-semibold"
              >
                Khám Phá Thuê Đồ
              </Link>
              <Link
                to="/thrift"
                className="inline-flex items-center justify-center gap-space-xs px-space-lg py-3.5 bg-surface-container-lowest text-primary font-label-md text-label-md uppercase tracking-wider rounded-lg shadow-sm hover:bg-surface-container-high transition-all duration-200 font-semibold"
              >
                <span>Săn Đồ Thanh Lý</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            {/* Thống kê nhanh */}
            <div className="pt-space-md flex items-center gap-space-xl border-t border-outline-variant/30">
              <div>
                <div className="font-headline-sm text-headline-sm text-primary font-semibold">14,200+</div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Trang Phục Tuần Hoàn</div>
              </div>
              <div>
                <div className="font-headline-sm text-headline-sm text-primary font-semibold">99.4%</div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Tỉ Lệ Đạt Chuẩn Vải Sạch</div>
              </div>
              <div>
                <div className="font-headline-sm text-headline-sm text-primary font-semibold">Đà Nẵng • HN • TP.HCM</div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Hub Giao Nhận Toàn Quốc</div>
              </div>
            </div>
          </div>

          {/* Cột phải: Hình ảnh thời trang Hero */}
          <div className="lg:col-span-6 relative mt-space-lg lg:mt-0">
            <div className="relative w-full aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5] rounded-xl overflow-hidden shadow-xl bg-surface-container">
              <img
                className="w-full h-full object-cover"
                alt="Tủ đồ thời trang tuần hoàn thanh lịch với trang phục thiết kế cao cấp"
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/10 to-transparent"></div>

              {/* Thẻ chú thích nổi bật phía dưới ảnh */}
              <div className="absolute bottom-6 left-6 right-6 p-space-md rounded-lg bg-surface-bright/95 backdrop-blur shadow-md flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Bộ Sưu Tập Tiệc &amp; Sự Kiện</span>
                  <span className="font-title-md text-title-md text-primary font-semibold">Tủ Đồ Dạ Hội &amp; Áo Dài Tinh Tuyển</span>
                </div>
                <Link
                  to="/rent"
                  className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  Xem Bộ Sưu Tập <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Huy hiệu góc trái trên ảnh */}
            <div className="hidden sm:flex absolute -top-4 -left-6 px-space-md py-space-sm bg-surface-container-lowest rounded-full shadow-md items-center gap-space-sm z-20">
              <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface font-semibold">
                Giặt Khô &amp; Khử Khuẩn 100%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY GRID (DANH MỤC THỜI TRANG) */}
      <section className="w-full bg-surface-container py-space-xl">
        <div className="max-w-[1440px] mx-auto px-gutter md:px-margin flex flex-col gap-space-xl">
          {/* Tiêu đề mục */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">Phân Loại Tủ Đồ</span>
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Khám Phá Theo Danh Mục</h2>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              Trang phục được tuyển chọn kỹ lưỡng từ váy dạ hội, áo dài truyền thống đến suit công sở, thời trang thiết kế và phụ kiện độc đáo.
            </p>
          </div>

          {/* Lưới 6 danh mục thời trang */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-gutter">
            {/* 1. Váy Dạ Hội */}
            <Link
              to="/categories/dresses"
              className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-surface-container">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  alt="Váy dạ hội và đầm tiệc cao cấp"
                  src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=600&auto=format&fit=crop"
                />
                <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-surface-bright/80 flex items-center justify-center text-primary group-hover:translate-x-0.5 transition-transform">
                  <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                </span>
              </div>
              <div className="p-space-sm flex items-center justify-between">
                <span className="font-title-md text-title-md text-primary group-hover:text-secondary transition-colors font-medium">Váy Dạ Hội</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">84 mẫu</span>
              </div>
            </Link>

            {/* 2. Áo Dài & Cổ Phục */}
            <Link
              to="/categories/ao-dai"
              className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-surface-container">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  alt="Áo dài truyền thống và cổ phục Việt Nam"
                  src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop"
                />
                <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-surface-bright/80 flex items-center justify-center text-primary group-hover:translate-x-0.5 transition-transform">
                  <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                </span>
              </div>
              <div className="p-space-sm flex items-center justify-between">
                <span className="font-title-md text-title-md text-primary group-hover:text-secondary transition-colors font-medium">Áo Dài</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">142 mẫu</span>
              </div>
            </Link>

            {/* 3. Blazer & Suit */}
            <Link
              to="/categories/suits"
              className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-surface-container">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  alt="Áo blazer và suit công sở thời thượng"
                  src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop"
                />
                <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-surface-bright/80 flex items-center justify-center text-primary group-hover:translate-x-0.5 transition-transform">
                  <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                </span>
              </div>
              <div className="p-space-sm flex items-center justify-between">
                <span className="font-title-md text-title-md text-primary group-hover:text-secondary transition-colors font-medium">Blazer &amp; Suit</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">95 mẫu</span>
              </div>
            </Link>

            {/* 4. Đồ Thiết Kế Designer */}
            <Link
              to="/categories/designer"
              className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-surface-container">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  alt="Thời trang thiết kế và hàng hiệu cao cấp"
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop"
                />
                <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-surface-bright/80 flex items-center justify-center text-primary group-hover:translate-x-0.5 transition-transform">
                  <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                </span>
              </div>
              <div className="p-space-sm flex items-center justify-between">
                <span className="font-title-md text-title-md text-primary group-hover:text-secondary transition-colors font-medium">Đồ Thiết Kế</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">118 mẫu</span>
              </div>
            </Link>

            {/* 5. Vintage & Retro */}
            <Link
              to="/categories/vintage"
              className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-surface-container">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  alt="Thời trang phong cách cổ điển vintage"
                  src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop"
                />
                <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-surface-bright/80 flex items-center justify-center text-primary group-hover:translate-x-0.5 transition-transform">
                  <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                </span>
              </div>
              <div className="p-space-sm flex items-center justify-between">
                <span className="font-title-md text-title-md text-primary group-hover:text-secondary transition-colors font-medium">Vintage &amp; Retro</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">67 mẫu</span>
              </div>
            </Link>

            {/* 6. Túi & Phụ Kiện */}
            <Link
              to="/categories/accessories"
              className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-surface-container">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  alt="Túi xách và phụ kiện thời trang"
                  src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop"
                />
                <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-surface-bright/80 flex items-center justify-center text-primary group-hover:translate-x-0.5 transition-transform">
                  <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                </span>
              </div>
              <div className="p-space-sm flex items-center justify-between">
                <span className="font-title-md text-title-md text-primary group-hover:text-secondary transition-colors font-medium">Túi &amp; Phụ Kiện</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">53 mẫu</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. RENT FEATURE SECTION (DỊCH VỤ THUÊ TRANG PHỤC) */}
      <section className="w-full max-w-[1440px] mx-auto px-gutter md:px-margin py-20 flex flex-col gap-space-xl">
        {/* Tiêu đề & Nút Xem tất cả */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <div className="inline-flex items-center gap-2 mb-space-xs">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">Tủ Đồ Chia Sẻ</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Thuê Trang Phục Đúng Ý</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Váy dạ hội, áo dài và suit thiết kế được giặt khô khử khuẩn tiêu chuẩn kèm tiền cọc ký quỹ an toàn.
            </p>
          </div>
          <Link
            to="/rent"
            className="inline-flex items-center gap-1 font-label-md text-label-md uppercase tracking-wider text-primary font-semibold hover:text-secondary transition-colors"
          >
            <span>Xem Tất Cả Đồ Thuê</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {/* Lưới sản phẩm cho thuê */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {/* Sản phẩm thuê 1 */}
          <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="relative aspect-[4/5] bg-surface-container overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                alt="Đầm dạ hội lụa satin ngọc lục bảo"
                src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                <span className="px-2 py-0.5 rounded bg-primary text-surface-container-low font-label-sm text-[10px] uppercase tracking-wider font-semibold">
                  THUÊ
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-bright/90 backdrop-blur font-label-sm text-[10px] text-on-surface-variant font-medium">
                  Độ Mới 99%
                </span>
              </div>
              <Link
                to={wishlistTarget}
                aria-label="Thêm vào danh sách yêu thích"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-bright/85 backdrop-blur flex items-center justify-center text-on-surface hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
              </Link>
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-primary/80 backdrop-blur text-surface-container-low font-label-sm text-[10px]">
                Hub Đà Nẵng
              </div>
            </div>
            <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Đầm Dạ Tiệc</span>
                  <div className="flex items-center gap-1 font-label-sm text-label-sm text-primary">
                    <span className="material-symbols-outlined text-[14px] text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span>4.9</span>
                    <span className="text-on-surface-variant">(38)</span>
                  </div>
                </div>
                <Link to="/rent" className="font-title-lg text-title-lg text-primary hover:underline line-clamp-1 font-semibold">
                  Đầm Satin Xanh Lục Bảo Xẻ Tà
                </Link>
              </div>
              <div className="pt-space-sm border-t border-outline-variant/30 flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    150,000đ<span className="font-body-sm text-body-sm font-normal text-on-surface-variant"> / ngày</span>
                  </span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant">Tiền Cọc Ký Quỹ: 800,000đ</span>
                </div>
                <Link to="/rent" className="p-2 rounded bg-surface-container hover:bg-primary hover:text-surface-container-low transition-colors" title="Đặt ngày thuê">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Sản phẩm thuê 2 */}
          <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="relative aspect-[4/5] bg-surface-container overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                alt="Áo dài tơ tằm thêu hoa sen thủ công"
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                <span className="px-2 py-0.5 rounded bg-primary text-surface-container-low font-label-sm text-[10px] uppercase tracking-wider font-semibold">
                  THUÊ
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-bright/90 backdrop-blur font-label-sm text-[10px] text-on-surface-variant font-medium">
                  Chuẩn Tơ Tằm Thật
                </span>
              </div>
              <Link
                to={wishlistTarget}
                aria-label="Thêm vào danh sách yêu thích"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-bright/85 backdrop-blur flex items-center justify-center text-on-surface hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
              </Link>
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-primary/80 backdrop-blur text-surface-container-low font-label-sm text-[10px]">
                Hub Hà Nội
              </div>
            </div>
            <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Áo Dài Truyền Thống</span>
                  <div className="flex items-center gap-1 font-label-sm text-label-sm text-primary">
                    <span className="material-symbols-outlined text-[14px] text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span>4.98</span>
                    <span className="text-on-surface-variant">(52)</span>
                  </div>
                </div>
                <Link to="/rent" className="font-title-lg text-title-lg text-primary hover:underline line-clamp-1 font-semibold">
                  Áo Dài Tơ Tằm Thêu Hoa Sen
                </Link>
              </div>
              <div className="pt-space-sm border-t border-outline-variant/30 flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    180,000đ<span className="font-body-sm text-body-sm font-normal text-on-surface-variant"> / ngày</span>
                  </span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant">Tiền Cọc Ký Quỹ: 1,200,000đ</span>
                </div>
                <Link to="/rent" className="p-2 rounded bg-surface-container hover:bg-primary hover:text-surface-container-low transition-colors" title="Đặt ngày thuê">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Sản phẩm thuê 3 */}
          <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="relative aspect-[4/5] bg-surface-container overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                alt="Bộ Suit may đo len lông cừu Charcoal chuẩn dáng Ý"
                src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                <span className="px-2 py-0.5 rounded bg-primary text-surface-container-low font-label-sm text-[10px] uppercase tracking-wider font-semibold">
                  THUÊ
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-bright/90 backdrop-blur font-label-sm text-[10px] text-on-surface-variant font-medium">
                  Form Dáng Hoàn Hảo
                </span>
              </div>
              <Link
                to={wishlistTarget}
                aria-label="Thêm vào danh sách yêu thích"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-bright/85 backdrop-blur flex items-center justify-center text-on-surface hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
              </Link>
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-primary/80 backdrop-blur text-surface-container-low font-label-sm text-[10px]">
                Hub TP.HCM
              </div>
            </div>
            <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Suit &amp; Tuxedo</span>
                  <div className="flex items-center gap-1 font-label-sm text-label-sm text-primary">
                    <span className="material-symbols-outlined text-[14px] text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span>5.0</span>
                    <span className="text-on-surface-variant">(29)</span>
                  </div>
                </div>
                <Link to="/rent" className="font-title-lg text-title-lg text-primary hover:underline line-clamp-1 font-semibold">
                  Bộ Suit May Đo Wool Charcoal
                </Link>
              </div>
              <div className="pt-space-sm border-t border-outline-variant/30 flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    190,000đ<span className="font-body-sm text-body-sm font-normal text-on-surface-variant"> / ngày</span>
                  </span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant">Tiền Cọc Ký Quỹ: 1,500,000đ</span>
                </div>
                <Link to="/rent" className="p-2 rounded bg-surface-container hover:bg-primary hover:text-surface-container-low transition-colors" title="Đặt ngày thuê">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Sản phẩm thuê 4 */}
          <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="relative aspect-[4/5] bg-surface-container overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                alt="Áo khoác dạ dáng dài thiết kế ấm áp thanh lịch"
                src="https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                <span className="px-2 py-0.5 rounded bg-primary text-surface-container-low font-label-sm text-[10px] uppercase tracking-wider font-semibold">
                  THUÊ
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-bright/90 backdrop-blur font-label-sm text-[10px] text-on-surface-variant font-medium">
                  Hấp Sấy Khử Khuẩn
                </span>
              </div>
              <Link
                to={wishlistTarget}
                aria-label="Thêm vào danh sách yêu thích"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-bright/85 backdrop-blur flex items-center justify-center text-on-surface hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
              </Link>
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-primary/80 backdrop-blur text-surface-container-low font-label-sm text-[10px]">
                Hub Đà Nẵng
              </div>
            </div>
            <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Áo Khoác Thu Đông</span>
                  <div className="flex items-center gap-1 font-label-sm text-label-sm text-primary">
                    <span className="material-symbols-outlined text-[14px] text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span>4.92</span>
                    <span className="text-on-surface-variant">(26)</span>
                  </div>
                </div>
                <Link to="/rent" className="font-title-lg text-title-lg text-primary hover:underline line-clamp-1 font-semibold">
                  Áo Khoác Dạ Dáng Dài Camel Cao Cấp
                </Link>
              </div>
              <div className="pt-space-sm border-t border-outline-variant/30 flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    120,000đ<span className="font-body-sm text-body-sm font-normal text-on-surface-variant"> / ngày</span>
                  </span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant">Tiền Cọc Ký Quỹ: 700,000đ</span>
                </div>
                <Link to="/rent" className="p-2 rounded bg-surface-container hover:bg-primary hover:text-surface-container-low transition-colors" title="Đặt ngày thuê">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CIRCULAR FASHION PROTOCOL (GIAO THỨC THỜI TRANG TUẦN HOÀN) */}
      <section className="w-full bg-[#EDE8DE] py-24 my-6">
        <div className="max-w-[1440px] mx-auto px-gutter md:px-margin flex flex-col gap-space-xl">
          {/* Thông điệp tuần hoàn */}
          <div className="max-w-2xl flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">Giao Thức Tủ Đồ Tuần Hoàn</span>
            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Mỗi Bộ Trang Phục Đều Có Hơn Một Vòng Đời.</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Nhờ quy trình giặt hấp chuyên nghiệp và kiểm định cẩn trọng, trang phục không hề bị bỏ quên trong góc tủ. Sau các chu kỳ cho thuê, quần áo được phục hồi form dáng và chuyển tiếp mượt mà sang sàn thanh lý trao tay bền vững.
            </p>
          </div>

          {/* Sơ đồ 6 bước vòng đời trang phục */}
          <div className="w-full bg-surface-bright/70 rounded-xl p-space-lg md:p-space-xl shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-gutter relative">
              {/* Bước 1 */}
              <div className="flex flex-col gap-2">
                <span className="font-label-sm text-label-sm text-secondary font-bold">01 / TUYỂN CHỌN</span>
                <span className="font-title-lg text-title-lg text-primary font-semibold">NHẬP KHO</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Kiểm định chất lượng vải, đường may và đưa vào tủ đồ cho thuê.</p>
              </div>
              {/* Bước 2 */}
              <div className="flex flex-col gap-2">
                <span className="font-label-sm text-label-sm text-secondary font-bold">02 / TRẢI NGHIỆM</span>
                <span className="font-title-lg text-title-lg text-primary font-semibold">TỎA SÁNG</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Đồng hành cùng khách hàng trong sự kiện, tiệc cưới hay buổi chụp ảnh.</p>
              </div>
              {/* Bước 3 */}
              <div className="flex flex-col gap-2">
                <span className="font-label-sm text-label-sm text-secondary font-bold">03 / THU HỒI</span>
                <span className="font-title-lg text-title-lg text-primary font-semibold">GỬI LẠI</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Trả đồ tiện lợi qua shipper thu hồi tận nhà hoặc tại các Hub liên kết.</p>
              </div>
              {/* Bước 4 */}
              <div className="flex flex-col gap-2">
                <span className="font-label-sm text-label-sm text-secondary font-bold">04 / CHĂM SÓC</span>
                <span className="font-title-lg text-title-lg text-primary font-semibold">GIẶT HẤP</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Giặt khô sinh học, khử khuẩn tia UV và ủi form chuẩn dáng chuyên nghiệp.</p>
              </div>
              {/* Bước 5 */}
              <div className="flex flex-col gap-2">
                <span className="font-label-sm text-label-sm text-secondary font-bold">05 / XOAY VÒNG</span>
                <span className="font-title-lg text-title-lg text-primary font-semibold">TÁI SỬ DỤNG</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Tiếp tục phục vụ các lượt thuê tiếp theo với chất lượng nguyên vẹn.</p>
              </div>
              {/* Bước 6 */}
              <div className="flex flex-col gap-2">
                <span className="font-label-sm text-label-sm text-secondary font-bold">06 / CHUYỂN GIAO</span>
                <span className="font-title-lg text-title-lg text-primary font-semibold">THANH LÝ</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Chuyển sang gian hàng thanh lý (Thrift) trao lại cho người dùng mới gắn bó dài lâu.</p>
              </div>
            </div>
          </div>

          {/* Các chỉ số bảo vệ môi trường */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="p-space-lg bg-surface-bright/70 rounded-xl flex flex-col gap-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-display-lg text-headline-lg font-normal text-primary">99.4%</span>
                <span className="material-symbols-outlined text-secondary text-[28px]">eco</span>
              </div>
              <span className="font-title-md text-title-md text-primary font-semibold">Giảm Thiểu Lãng Phí Trang Phục</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Quần áo chất lượng được kéo dài tuổi thọ sử dụng gấp 6 lần thay vì vứt bỏ sau vài lần mặc.
              </p>
            </div>
            <div className="p-space-lg bg-surface-bright/70 rounded-xl flex flex-col gap-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-display-lg text-headline-lg font-normal text-primary">18.5 Tấn</span>
                <span className="material-symbols-outlined text-secondary text-[28px]">energy_savings_leaf</span>
              </div>
              <span className="font-title-md text-title-md text-primary font-semibold">Cắt Giảm Khí Thải Dệt May</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Tiết kiệm hàng triệu lít nước và năng lượng so với sản xuất trang phục may mặc mới.
              </p>
            </div>
            <div className="p-space-lg bg-surface-bright/70 rounded-xl flex flex-col gap-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-display-lg text-headline-lg font-normal text-primary">100%</span>
                <span className="material-symbols-outlined text-secondary text-[28px]">verified_user</span>
              </div>
              <span className="font-title-md text-title-md text-primary font-semibold">Khử Khuẩn Chuẩn Tiệm Giặt</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Mọi bộ trang phục đều được kiểm nghiệm vệ sinh, thơm tho và sạch sẽ tuyệt đối trước khi giao.
              </p>
            </div>
          </div>

          <div>
            <Link
              to="/about"
              className="inline-flex items-center gap-space-xs font-label-md text-label-md uppercase tracking-wider text-primary font-semibold hover:underline"
            >
              <span>Tìm Hiểu Mô Hình Thời Trang Tuần Hoàn</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. THRIFT FEATURE SECTION (SÀN QUẦN ÁO THANH LÝ) */}
      <section className="w-full max-w-[1440px] mx-auto px-gutter md:px-margin py-20 flex flex-col gap-space-xl">
        {/* Tiêu đề & Nút Xem tất cả */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <div className="inline-flex items-center gap-2 mb-space-xs">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">Tủ Đồ Tuyển Chọn</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Trao Cơ Hội Thứ Hai Cho Trang Phục</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Khám phá đồ si, vintage và đồ hiệu thanh lý được tuyển chọn kỹ càng từ các tín đồ thời trang và boutique uy tín.
            </p>
          </div>
          <Link
            to="/thrift"
            className="inline-flex items-center gap-1 font-label-md text-label-md uppercase tracking-wider text-primary font-semibold hover:text-secondary transition-colors"
          >
            <span>Xem Tất Cả Quần Áo Thanh Lý</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {/* Lưới sản phẩm thanh lý */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {/* Sản phẩm thanh lý 1 */}
          <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="relative aspect-[4/5] bg-surface-container overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                alt="Áo khoác Tweed cổ tròn thanh lịch nữ"
                src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=800&auto=format&fit=crop"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                <span className="px-2 py-0.5 rounded bg-secondary text-surface-container-lowest font-label-sm text-[10px] uppercase tracking-wider font-semibold">
                  THANH LÝ
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-bright/90 backdrop-blur font-label-sm text-[10px] text-on-surface-variant font-medium">
                  Độ Mới 95%
                </span>
              </div>
              <Link
                to={wishlistTarget}
                aria-label="Thêm vào danh sách yêu thích"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-bright/85 backdrop-blur flex items-center justify-center text-on-surface hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
              </Link>
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-surface-container-highest/90 backdrop-blur text-primary font-label-sm text-[10px]">
                Shop: Vintage Chic Closet
              </div>
            </div>
            <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Áo Khoác Nữ</span>
                <Link to="/thrift" className="font-title-lg text-title-lg text-primary hover:underline line-clamp-1 font-semibold">
                  Áo Tweed Cổ Tròn Dáng Ngắn Cúc Mạ Vàng
                </Link>
              </div>
              <div className="pt-space-sm border-t border-outline-variant/30 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">320,000đ</span>
                  <span className="font-label-sm text-[10px] text-secondary font-medium">Đã Giặt Khô Sạch Sẽ</span>
                </div>
                <Link to="/thrift" className="p-2 rounded bg-surface-container hover:bg-primary hover:text-surface-container-low transition-colors" title="Mua ngay">
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Sản phẩm thanh lý 2 */}
          <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="relative aspect-[4/5] bg-surface-container overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                alt="Đầm suông linen tự nhiên mềm mát"
                src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                <span className="px-2 py-0.5 rounded bg-secondary text-surface-container-lowest font-label-sm text-[10px] uppercase tracking-wider font-semibold">
                  THANH LÝ
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-bright/90 backdrop-blur font-label-sm text-[10px] text-on-surface-variant font-medium">
                  Tình Trạng Xuất Sắc
                </span>
              </div>
              <Link
                to={wishlistTarget}
                aria-label="Thêm vào danh sách yêu thích"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-bright/85 backdrop-blur flex items-center justify-center text-on-surface hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
              </Link>
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-surface-container-highest/90 backdrop-blur text-primary font-label-sm text-[10px]">
                Shop: Tiệm Đồ Xưa Hà Nội
              </div>
            </div>
            <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Đầm Thiết Kế</span>
                <Link to="/thrift" className="font-title-lg text-title-lg text-primary hover:underline line-clamp-1 font-semibold">
                  Đầm Suông Linen Thêu Hoa Thủ Công
                </Link>
              </div>
              <div className="pt-space-sm border-t border-outline-variant/30 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">280,000đ</span>
                  <span className="font-label-sm text-[10px] text-secondary font-medium">Chất Vải Mềm Mát Tự Nhiên</span>
                </div>
                <Link to="/thrift" className="p-2 rounded bg-surface-container hover:bg-primary hover:text-surface-container-low transition-colors" title="Mua ngay">
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Sản phẩm thanh lý 3 */}
          <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="relative aspect-[4/5] bg-surface-container overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                alt="Áo sơ mi lụa cổ điển phong cách thập niên 90"
                src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                <span className="px-2 py-0.5 rounded bg-secondary text-surface-container-lowest font-label-sm text-[10px] uppercase tracking-wider font-semibold">
                  THANH LÝ
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-bright/90 backdrop-blur font-label-sm text-[10px] text-on-surface-variant font-medium">
                  Hàng Độc Bản Tuyển Chọn
                </span>
              </div>
              <Link
                to={wishlistTarget}
                aria-label="Thêm vào danh sách yêu thích"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-bright/85 backdrop-blur flex items-center justify-center text-on-surface hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
              </Link>
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-surface-container-highest/90 backdrop-blur text-primary font-label-sm text-[10px]">
                Shop: Sài Gòn Archive
              </div>
            </div>
            <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Áo Vintage Nam/Nữ</span>
                <Link to="/thrift" className="font-title-lg text-title-lg text-primary hover:underline line-clamp-1 font-semibold">
                  Áo Sơ Mi Lụa Họa Tiết Retro 1990s
                </Link>
              </div>
              <div className="pt-space-sm border-t border-outline-variant/30 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">220,000đ</span>
                  <span className="font-label-sm text-[10px] text-secondary font-medium">Chất Lụa Nguyên Bản Mịn Đẹp</span>
                </div>
                <Link to="/thrift" className="p-2 rounded bg-surface-container hover:bg-primary hover:text-surface-container-low transition-colors" title="Mua ngay">
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Sản phẩm thanh lý 4 */}
          <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="relative aspect-[4/5] bg-surface-container overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                alt="Quần jean denim dáng ống suông cạp cao"
                src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                <span className="px-2 py-0.5 rounded bg-secondary text-surface-container-lowest font-label-sm text-[10px] uppercase tracking-wider font-semibold">
                  THANH LÝ
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-bright/90 backdrop-blur font-label-sm text-[10px] text-on-surface-variant font-medium">
                  Form Chuẩn Đẹp
                </span>
              </div>
              <Link
                to={wishlistTarget}
                aria-label="Thêm vào danh sách yêu thích"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-bright/85 backdrop-blur flex items-center justify-center text-on-surface hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
              </Link>
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-surface-container-highest/90 backdrop-blur text-primary font-label-sm text-[10px]">
                Shop: Denim House Studio
              </div>
            </div>
            <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Quần Jeans &amp; Denim</span>
                <Link to="/thrift" className="font-title-lg text-title-lg text-primary hover:underline line-clamp-1 font-semibold">
                  Quần Denim Ống Suông Cạp Cao Classic
                </Link>
              </div>
              <div className="pt-space-sm border-t border-outline-variant/30 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">350,000đ</span>
                  <span className="font-label-sm text-[10px] text-secondary font-medium">Chất Vải Dày Dặn Bền Đẹp</span>
                </div>
                <Link to="/thrift" className="p-2 rounded bg-surface-container hover:bg-primary hover:text-surface-container-low transition-colors" title="Mua ngay">
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW REUSE HUB WORKS (QUY TRÌNH THUÊ & MUA THỜI TRANG) */}
      <section className="w-full bg-surface-container py-24">
        <div className="max-w-[1440px] mx-auto px-gutter md:px-margin flex flex-col gap-space-xl">
          <div className="flex flex-col items-center text-center max-w-xl mx-auto gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">Trải Nghiệm Tiện Lợi</span>
            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Quy Trình 4 Bước Đơn Giản</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Giao dịch ký quỹ minh bạch, an toàn tối đa cho cả người thuê đồ và chủ sở hữu trang phục.
            </p>
          </div>

          {/* 4 Thẻ bước quy trình */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {/* Bước 1 */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl flex flex-col gap-space-md shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">explore</span>
              </div>
              <div className="flex flex-col gap-space-xs">
                <span className="font-label-sm text-label-sm text-secondary font-bold">01 / CHỌN ĐỒ</span>
                <span className="font-title-lg text-title-lg text-primary font-semibold">Tủ Đồ Đa Dạng</span>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Dễ dàng tìm kiếm váy đầm, áo dài, suit hoặc phụ kiện phù hợp đúng kích cỡ và phong cách bạn cần.
                </p>
              </div>
            </div>

            {/* Bước 2 */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl flex flex-col gap-space-md shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">swap_horiz</span>
              </div>
              <div className="flex flex-col gap-space-xs">
                <span className="font-label-sm text-label-sm text-secondary font-bold">02 / ĐẶT THUÊ HOẶC MUA</span>
                <span className="font-title-lg text-title-lg text-primary font-semibold">Ký Quỹ An Toàn</span>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Thuê linh hoạt theo ngày với khoản cọc bảo hiểm hoàn trả 100%, hoặc mua sở hữu vĩnh viễn đồ thanh lý.
                </p>
              </div>
            </div>

            {/* Bước 3 */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl flex flex-col gap-space-md shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">interests</span>
              </div>
              <div className="flex flex-col gap-space-xs">
                <span className="font-label-sm text-label-sm text-secondary font-bold">03 / TRẢI NGHIỆM</span>
                <span className="font-title-lg text-title-lg text-primary font-semibold">Tự Tin Tỏa Sáng</span>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Diện trang phục chỉn chu cho các sự kiện, chụp ảnh mà không lo tủ đồ chật chội hay tốn kém chi phí mua mới.
                </p>
              </div>
            </div>

            {/* Bước 4 */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl flex flex-col gap-space-md shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">sync</span>
              </div>
              <div className="flex flex-col gap-space-xs">
                <span className="font-label-sm text-label-sm text-secondary font-bold">04 / HOÀN TRẢ</span>
                <span className="font-title-lg text-title-lg text-primary font-semibold">Trả Đồ &amp; Nhận Lại Cọc</span>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Gửi trả đồ nhanh chóng mà không cần giặt trước. Tiền ký quỹ được hoàn trả tự động sau bước kiểm tra nhanh.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Link
              to="/about"
              className="inline-flex items-center gap-space-xs px-space-lg py-3 rounded-lg bg-primary-container text-surface-container-low font-label-md text-label-md uppercase tracking-wider hover:bg-on-surface transition-colors shadow-sm font-semibold"
            >
              <span>Xem Chi Tiết Quy Trình Thuê &amp; Mua</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FEATURED PAIRINGS (GỢI Ý PHỐI ĐỒ & SẢN PHẨM NỔI BẬT) */}
      <section className="w-full max-w-[1440px] mx-auto px-gutter md:px-margin py-20 flex flex-col gap-space-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">Gợi Ý Phối Đồ</span>
            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Bộ Sưu Tập Nổi Bật</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Sự kết hợp tinh tế giữa thuê đồ sự kiện lộng lẫy và sở hữu phụ kiện vintage bền vững.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
              Tuyển Chọn Đặc Biệt
            </span>
          </div>
        </div>

        {/* Lưới sản phẩm phối hợp Thuê & Thanh lý */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {/* Item 1: THUÊ Váy Dạ Hội Lộng Lẫy */}
          <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="relative aspect-[4/5] bg-surface-container overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                alt="Đầm dạ hội đính đá cao cấp"
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2 py-0.5 rounded bg-primary text-surface-container-low font-label-sm text-[10px] uppercase tracking-wider font-semibold">
                  THUÊ
                </span>
              </div>
              <Link
                to={wishlistTarget}
                aria-label="Thêm vào danh sách yêu thích"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-bright/85 backdrop-blur flex items-center justify-center text-on-surface hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
              </Link>
            </div>
            <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Đầm Sự Kiện</span>
                <Link to="/rent" className="font-title-lg text-title-lg text-primary hover:underline line-clamp-1 font-semibold">
                  Đầm Lụa Dạ Hội Cúp Ngực Đính Pha Lê
                </Link>
              </div>
              <div className="pt-space-sm border-t border-outline-variant/30 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    220,000đ<span className="font-body-sm text-body-sm font-normal text-on-surface-variant"> / ngày</span>
                  </span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant">Tiền Cọc: 1,200,000đ</span>
                </div>
                <Link to="/rent" className="p-2 rounded bg-surface-container hover:bg-primary hover:text-surface-container-low transition-colors" title="Đặt thuê">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Item 2: THANH LÝ Túi Xách Da Vintage */}
          <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="relative aspect-[4/5] bg-surface-container overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                alt="Túi xách da bò cổ điển cao cấp"
                src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2 py-0.5 rounded bg-secondary text-surface-container-lowest font-label-sm text-[10px] uppercase tracking-wider font-semibold">
                  THANH LÝ
                </span>
              </div>
              <Link
                to={wishlistTarget}
                aria-label="Thêm vào danh sách yêu thích"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-bright/85 backdrop-blur flex items-center justify-center text-on-surface hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
              </Link>
            </div>
            <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Túi Xách Da Thật</span>
                <Link to="/thrift" className="font-title-lg text-title-lg text-primary hover:underline line-clamp-1 font-semibold">
                  Túi Xách Da Đeo Chéo Cổ Điển Pháp
                </Link>
              </div>
              <div className="pt-space-sm border-t border-outline-variant/30 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">450,000đ</span>
                  <span className="font-label-sm text-[10px] text-secondary font-medium">Chất Da Bò Thật 100%</span>
                </div>
                <Link to="/thrift" className="p-2 rounded bg-surface-container hover:bg-primary hover:text-surface-container-low transition-colors" title="Mua ngay">
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Item 3: THUÊ Áo Dài Nhung Đỏ */}
          <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="relative aspect-[4/5] bg-surface-container overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                alt="Áo dài nhung đỏ đô thêu tay sang trọng"
                src="https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=800&auto=format&fit=crop"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2 py-0.5 rounded bg-primary text-surface-container-low font-label-sm text-[10px] uppercase tracking-wider font-semibold">
                  THUÊ
                </span>
              </div>
              <Link
                to={wishlistTarget}
                aria-label="Thêm vào danh sách yêu thích"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-bright/85 backdrop-blur flex items-center justify-center text-on-surface hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
              </Link>
            </div>
            <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Áo Dài Cưới &amp; Tết</span>
                <Link to="/rent" className="font-title-lg text-title-lg text-primary hover:underline line-clamp-1 font-semibold">
                  Áo Dài Nhung Đỏ Đô Đính Kết Thủ Công
                </Link>
              </div>
              <div className="pt-space-sm border-t border-outline-variant/30 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    250,000đ<span className="font-body-sm text-body-sm font-normal text-on-surface-variant"> / ngày</span>
                  </span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant">Tiền Cọc: 1,500,000đ</span>
                </div>
                <Link to="/rent" className="p-2 rounded bg-surface-container hover:bg-primary hover:text-surface-container-low transition-colors" title="Đặt thuê">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Item 4: THANH LÝ Khăn Lụa & Áo Len Vintage */}
          <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="relative aspect-[4/5] bg-surface-container overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                alt="Áo khoác len dệt kim vintage nhẹ nhàng"
                src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2 py-0.5 rounded bg-secondary text-surface-container-lowest font-label-sm text-[10px] uppercase tracking-wider font-semibold">
                  THANH LÝ
                </span>
              </div>
              <Link
                to={wishlistTarget}
                aria-label="Thêm vào danh sách yêu thích"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-bright/85 backdrop-blur flex items-center justify-center text-on-surface hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
              </Link>
            </div>
            <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Len &amp; Dệt Kim</span>
                <Link to="/thrift" className="font-title-lg text-title-lg text-primary hover:underline line-clamp-1 font-semibold">
                  Áo Khoác Cardigan Len Mỏng Vintage
                </Link>
              </div>
              <div className="pt-space-sm border-t border-outline-variant/30 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">190,000đ</span>
                  <span className="font-label-sm text-[10px] text-secondary font-medium">Chất Len Mềm Không Xù</span>
                </div>
                <Link to="/thrift" className="p-2 rounded bg-surface-container hover:bg-primary hover:text-surface-container-low transition-colors" title="Mua ngay">
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TRUST & PEACE OF MIND SECTION (CAM KẾT AN TÂM) */}
      <section className="w-full bg-surface-container-high py-20">
        <div className="max-w-[1440px] mx-auto px-gutter md:px-margin flex flex-col gap-space-xl">
          <div className="flex flex-col max-w-lg gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">Hệ Thống Uy Tín</span>
            <h2 className="font-headline-md text-headline-md text-primary tracking-tight">Trải Nghiệm Thời Trang Không Lo Âu</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Được thiết kế để bạn an tâm tuyệt đối khi thuê hay mua đồ cũ với quy trình kiểm định chất lượng và ký quỹ minh bạch.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {/* 1. Ký quỹ an toàn */}
            <div className="p-space-lg bg-surface-bright rounded-xl flex flex-col gap-space-sm shadow-sm">
              <span className="material-symbols-outlined text-primary text-[28px]">lock</span>
              <span className="font-title-md text-title-md text-primary font-semibold">Ký Quỹ Trung Gian An Toàn</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Tiền cọc và thanh toán được hệ thống giữ an toàn cho đến khi bạn nhận đồ và xác nhận đúng mô tả kích thước.
              </p>
            </div>

            {/* 2. Thẩm định kỹ lưỡng */}
            <div className="p-space-lg bg-surface-bright rounded-xl flex flex-col gap-space-sm shadow-sm">
              <span className="material-symbols-outlined text-primary text-[28px]">verified</span>
              <span className="font-title-md text-title-md text-primary font-semibold">Kiểm Định &amp; Giặt Sấy Chuẩn</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Trang phục được kiểm tra từng đường may, khóa kéo và xử lý giặt hấp khử khuẩn trước khi gửi tới tay người thuê.
              </p>
            </div>

            {/* 3. Hoàn cọc tức thì */}
            <div className="p-space-lg bg-surface-bright rounded-xl flex flex-col gap-space-sm shadow-sm">
              <span className="material-symbols-outlined text-primary text-[28px]">published_with_changes</span>
              <span className="font-title-md text-title-md text-primary font-semibold">Hoàn Tiền Cọc Nhanh Chóng</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Tiền ký quỹ trang phục được hoàn trả tự động vào tài khoản ngay sau khi đơn hàng được trả lại và đối soát xong.
              </p>
            </div>

            {/* 4. Minh bạch thông số */}
            <div className="p-space-lg bg-surface-bright rounded-xl flex flex-col gap-space-sm shadow-sm">
              <span className="material-symbols-outlined text-primary text-[28px]">visibility</span>
              <span className="font-title-md text-title-md text-primary font-semibold">Bảng Số Đo &amp; Ảnh Thật 100%</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Cung cấp chi tiết số đo (ngực, eo, mông, chiều dài) cùng ảnh chụp thực tế giúp bạn dễ dàng chọn đúng size đồ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. EDITORIAL CLOSING HERO CALLOUT (KÊU GỌI HÀNH ĐỘNG) */}
      <section className="w-full max-w-[1440px] mx-auto px-gutter md:px-margin py-24">
        <div className="relative w-full rounded-2xl bg-primary-container text-surface-container-low p-space-xl md:p-24 overflow-hidden shadow-xl">
          {/* Lớp nền mờ chuyển màu tinh tế */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-bright via-transparent to-transparent"></div>
          <div className="relative z-10 max-w-2xl flex flex-col gap-space-md">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary-fixed">Gia Nhập Cộng Đồng Thời Trang Tuần Hoàn</span>
            <h2 className="font-headline-lg text-headline-lg font-normal tracking-tight text-surface-bright leading-tight">
              Sẵn sàng làm mới phong cách cùng tủ đồ vô tận?
            </h2>
            <p className="font-body-lg text-body-lg text-inverse-on-surface/80 leading-relaxed">
              Đăng ký tài khoản ngay hôm nay để thuê những bộ cánh lộng lẫy, thử nghiệm phong cách mới mà không lo tốn kém, hoặc kiếm thêm thu nhập từ việc chia sẻ tủ đồ của chính bạn.
            </p>
            <div className="flex flex-wrap items-center gap-space-md pt-space-sm">
              <Link
                to="/register"
                className="px-space-xl py-3.5 bg-surface-bright text-primary font-label-md text-label-md uppercase tracking-wider rounded-lg shadow hover:bg-surface-container-high transition-colors font-semibold"
              >
                Tạo Tài Khoản Miễn Phí
              </Link>
              <Link
                to="/about"
                className="px-space-lg py-3.5 bg-transparent border border-outline-variant text-surface-bright font-label-md text-label-md uppercase tracking-wider rounded-lg hover:bg-surface-bright/10 transition-colors font-semibold"
              >
                Tìm Hiểu Về ReUse Hub
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { UserSidebar } from '../../components/layout/UserSidebar';
import { resolveWishlistProduct, type ResolvedWishlistProduct } from '../../services/wishlistProductResolver';

export const Wishlist: React.FC = () => {
  const { wishlist, toggleWishlist, addToCart } = useCartWishlist();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Track sidebar collapsed state to display inline restore chip when collapsed
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('reuse_user_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setIsSidebarCollapsed(customEvent.detail);
      }
    };
    window.addEventListener('reuse_user_sidebar_toggle', handleSync);
    return () => window.removeEventListener('reuse_user_sidebar_toggle', handleSync);
  }, []);

  // Tabs: 'ALL' | 'RENT' | 'THRIFT'
  const [activeTab, setActiveTab] = useState<'ALL' | 'RENT' | 'THRIFT'>('ALL');
  // Sort: 'latest' | 'available' | 'price-asc' | 'price-desc'
  const [sortOption, setSortOption] = useState<string>('latest');
  // Temporary toast feedback when added to cart
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ── Resolve genuine products from wishlist IDs (NO mock fake data) ──
  const resolvedItems = useMemo(() => {
    if (!wishlist || wishlist.length === 0) return [];
    const list: ResolvedWishlistProduct[] = [];
    const seen = new Set<string>();

    wishlist.forEach((id) => {
      if (!id || seen.has(id)) return;
      seen.add(id);
      const prod = resolveWishlistProduct(id);
      if (prod) {
        list.push(prod);
      }
    });

    return list;
  }, [wishlist]);

  const rentCount = useMemo(() => resolvedItems.filter((i) => i.mode === 'rent').length, [resolvedItems]);
  const thriftCount = useMemo(() => resolvedItems.filter((i) => i.mode === 'thrift').length, [resolvedItems]);

  // ── Filter & Sort items ──
  const displayedItems = useMemo(() => {
    let items = [...resolvedItems];

    if (activeTab === 'RENT') {
      items = items.filter((i) => i.mode === 'rent');
    } else if (activeTab === 'THRIFT') {
      items = items.filter((i) => i.mode === 'thrift');
    }

    if (sortOption === 'price-asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      items.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'available') {
      items.sort((a, b) => (b.available ? 1 : 0) - (a.available ? 1 : 0));
    }

    return items;
  }, [resolvedItems, activeTab, sortOption]);

  const formatVND = (num: number) => num.toLocaleString('vi-VN') + '₫';

  const handleAddToCart = (item: ResolvedWishlistProduct) => {
    addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      mode: item.mode,
      deposit: item.deposit,
      categoryLabel: item.category,
      gradeBadge: item.gradeBadge,
      quantity: 1,
    });
    setToastMessage(`Đã thêm "${item.title}" vào giỏ hàng tuần hoàn!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="w-full min-h-screen bg-[#FBF9F5] text-[#1C1A18] antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1A18] text-white px-5 py-3 rounded-xl shadow-lg border border-white/20 flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <span className="material-symbols-outlined text-[#3A6843] text-[20px]">check_circle</span>
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-stone-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── MAIN WORKSPACE CONTAINER WITH PERSISTENT SIDEBAR ── */}
      <div className="max-w-[1520px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex gap-8 items-start">
        {/* User Navigation Sidebar */}
        <UserSidebar activeKey="wishlist" />

        {/* ── MAIN CONTENT AREA ── */}
        <main className="flex-1 min-w-0 space-y-8">
          <div className="flex flex-col w-full">
            {/* Quick inline restore chip if user clicked 3-bar button to hide sidebar */}
            {isSidebarCollapsed && (
              <div className="flex items-center gap-2 mb-4 animate-fade-in">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('reuse_user_sidebar_toggle', { detail: false }))}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#E8E4DC] text-xs font-semibold text-[#1C1A18] hover:bg-[#F6F3EE] hover:border-[#1C1A18]/40 transition-all shadow-2xs cursor-pointer group"
                  title="Mở lại menu điều hướng (Dấu 3 gạch)"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#3A6843] group-hover:scale-110 transition-transform">
                    menu
                  </span>
                  <span>Hiện menu điều hướng</span>
                </button>
              </div>
            )}

            {/* 1. TOP BREADCRUMB & EDITORIAL HEADER */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Link
                  to="/"
                  className="font-mono text-[11px] uppercase tracking-wider text-[#76726B] hover:text-[#1C1A18] transition-colors"
                >
                  Trang chủ
                </Link>
                <span className="text-[#CCC5BC] text-xs">/</span>
                <Link
                  to="/user/dashboard"
                  className="font-mono text-[11px] uppercase tracking-wider text-[#76726B] hover:text-[#1C1A18] transition-colors"
                >
                  Tài khoản
                </Link>
                <span className="text-[#CCC5BC] text-xs">/</span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#3A6843] font-semibold">
                  Danh sách yêu thích
                </span>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#E8E4DC]">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#E8E4DC] rounded-full mb-3 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#3A6843]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726B]">
                      BỘ SƯU TẬP QUAN TÂM · LƯU TRỮ TUẦN HOÀN
                    </span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#1C1A18] mb-3 tracking-tight">
                    Danh sách yêu thích
                  </h1>
                  <p className="text-sm text-[#76726B] leading-relaxed">
                    Lưu giữ và theo dõi lịch còn hàng của thiết bị thuê cao cấp hoặc các món đồ archival THRIFT độc bản trước khi quyết định đồng hành cùng vòng đời sản phẩm.
                  </p>
                </div>

                {/* Quick Metrics Pill */}
                <div className="flex items-center gap-3 bg-[#F5F3F0] p-2 rounded-2xl border border-[#E8E4DC]/60 shrink-0">
                  <div className="px-3.5 py-2 rounded-xl bg-white shadow-2xs border border-[#E8E4DC]/60 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#B9ECBD]/40 text-[#3A6843] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#76726B]">Kiểm định chuẩn</p>
                      <p className="text-xs text-[#1C1A18] font-bold">100% Bench-checked</p>
                    </div>
                  </div>

                  <div className="px-3.5 py-2 rounded-xl bg-white shadow-2xs border border-[#E8E4DC]/60 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EFEEEB] text-[#1C1A18] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">lock_clock</span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#76726B]">Ký quỹ an tâm</p>
                      <p className="text-xs text-[#1C1A18] font-bold">Smart Escrow 24/7</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. INTERACTIVE CONTROLS: TABS & SORT */}
            <section className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Tabs Switcher */}
                <div className="inline-flex p-1 bg-[#F5F3F0] border border-[#E8E4DC]/80 rounded-xl" role="tablist">
                  <button
                    type="button"
                    onClick={() => setActiveTab('ALL')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      activeTab === 'ALL'
                        ? 'bg-white text-[#1C1A18] shadow-xs'
                        : 'text-[#76726B] hover:text-[#1C1A18]'
                    }`}
                  >
                    <span>Tất cả lưu trữ</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        activeTab === 'ALL' ? 'bg-[#3A6843]/10 text-[#3A6843]' : 'bg-[#E8E4DC]/60 text-[#76726B]'
                      }`}
                    >
                      {resolvedItems.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('RENT')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      activeTab === 'RENT'
                        ? 'bg-white text-[#1C1A18] shadow-xs'
                        : 'text-[#76726B] hover:text-[#1C1A18]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#3A6843]">autorenew</span>
                    <span>Thiết bị Thuê (RENT)</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        activeTab === 'RENT' ? 'bg-[#3A6843]/10 text-[#3A6843]' : 'bg-[#E8E4DC]/60 text-[#76726B]'
                      }`}
                    >
                      {rentCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('THRIFT')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      activeTab === 'THRIFT'
                        ? 'bg-white text-[#1C1A18] shadow-xs'
                        : 'text-[#76726B] hover:text-[#1C1A18]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">archive</span>
                    <span>Đồ sưu tầm (THRIFT)</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        activeTab === 'THRIFT' ? 'bg-[#3A6843]/10 text-[#3A6843]' : 'bg-[#E8E4DC]/60 text-[#76726B]'
                      }`}
                    >
                      {thriftCount}
                    </span>
                  </button>
                </div>

                {/* Secondary Filter / Quick Sort */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[#76726B] hidden md:inline">
                    Sắp xếp:
                  </span>
                  <div className="relative">
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="appearance-none bg-white text-[#1C1A18] text-xs font-medium pl-3.5 pr-9 py-2 rounded-xl border border-[#E8E4DC] cursor-pointer focus:outline-none focus:border-[#1C1A18] transition-all shadow-2xs"
                    >
                      <option value="latest">Mới lưu gần đây</option>
                      <option value="available">Có sẵn ngay trước</option>
                      <option value="price-asc">Giá: Thấp đến cao</option>
                      <option value="price-desc">Giá: Cao đến thấp</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#76726B] text-[18px] pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. PRODUCT CARDS GRID OR EMPTY STATE */}
            {displayedItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedItems.map((item) => {
                  const isRent = item.mode === 'rent';

                  return (
                    <article
                      key={item.id}
                      className="group bg-white rounded-2xl p-4 flex flex-col shadow-2xs hover:shadow-md border border-[#E8E4DC]/80 hover:border-[#1C1A18]/40 transition-all duration-300"
                    >
                      {/* Visual & Top Badges */}
                      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#F5F3F0] mb-4 border border-[#E8E4DC]/60">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                        {/* Top-Left Pill */}
                        {isRent ? (
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#1C1A18] text-[10px] font-bold uppercase tracking-wider shadow-xs">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.available ? 'bg-[#3A6843] animate-pulse' : 'bg-amber-500'
                              }`}
                            />
                            <span>{item.availabilityLabel}</span>
                          </div>
                        ) : (
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1C1A18] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                            <span className="material-symbols-outlined text-[13px] text-[#BBEFC0]">auto_awesome</span>
                            <span>1-OF-1 ARCHIVE · ĐỘC BẢN</span>
                          </div>
                        )}

                        {/* Top-Right Remove Wishlist Button */}
                        <button
                          type="button"
                          onClick={() => toggleWishlist(item.id)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-[#BA1A1A] flex items-center justify-center hover:bg-white hover:scale-110 shadow-xs transition-all cursor-pointer"
                          title="Bỏ khỏi danh sách yêu thích"
                          aria-label="Bỏ khỏi danh sách yêu thích"
                        >
                          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            favorite
                          </span>
                        </button>

                        {/* Bottom Overlay Info Tag */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[10px] font-medium">
                          <span className="bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded">
                            {item.location} · {item.origin}
                          </span>
                          <span className="bg-[#3A6843]/90 px-2 py-0.5 rounded font-semibold">
                            {item.certLabel}
                          </span>
                        </div>
                      </div>

                      {/* Meta Category & Grade */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A6843]">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#EFEEEB] text-[#4A463F] rounded-md">
                          {item.gradeBadge}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-serif text-lg font-bold text-[#1C1A18] mb-2 leading-snug group-hover:text-[#3A6843] transition-colors line-clamp-1">
                        <Link to={item.href}>{item.title}</Link>
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-[#76726B] mb-4 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Pricing Box */}
                      {isRent ? (
                        <div className="p-3 bg-[#F5F3F0] rounded-xl mb-4 space-y-2 border border-[#E8E4DC]/60">
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs text-[#76726B]">Giá thuê lưu hành:</span>
                            <div className="text-right">
                              <span className="font-serif text-base font-bold text-[#1C1A18]">
                                {formatVND(item.price)}
                              </span>
                              <span className="text-[10px] uppercase text-[#76726B] font-medium"> / ngày</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#E8E4DC]/80">
                            <span className="flex items-center gap-1 text-[#76726B]">
                              <span className="material-symbols-outlined text-[15px] text-[#3A6843]">verified_user</span>
                              Cọc bảo chứng Smart Escrow
                            </span>
                            <span className="text-xs font-bold text-[#1C1A18]">{formatVND(item.deposit)}</span>
                          </div>
                          <p className="text-[10px] text-[#3A6843] italic">
                            Hoàn lại 100% qua Smart Contract sau khi bàn giao
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-[#F5F3F0] rounded-xl mb-4 space-y-1.5 border border-[#E8E4DC]/60">
                          <div className="flex items-center justify-between text-[11px] text-[#76726B]">
                            <span>Nguồn gốc lưu trữ:</span>
                            <span className="text-[#1C1A18] font-semibold">{item.origin}</span>
                          </div>
                          <div className="flex items-baseline justify-between pt-1 border-t border-[#E8E4DC]/80">
                            <span className="text-xs text-[#76726B]">Giá chuyển giao:</span>
                            <span className="font-serif text-base font-bold text-[#1C1A18]">
                              {formatVND(item.price)}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#3A6843] italic">
                            Đã gồm phí kiểm định độc lập &amp; thùng đóng gói chân không
                          </p>
                        </div>
                      )}

                      {/* Action Row */}
                      <div className="mt-auto pt-2 flex items-center gap-2">
                        <Link
                          to={item.href}
                          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-center transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer ${
                            isRent
                              ? 'bg-[#1C1A18] text-white hover:bg-black'
                              : 'bg-[#3A6843] text-white hover:bg-[#2F5436]'
                          }`}
                        >
                          <span>{isRent ? 'Thuê ngay' : 'Mua đứt độc bản'}</span>
                          <span className="material-symbols-outlined text-[17px]">
                            {isRent ? 'calendar_month' : 'verified'}
                          </span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          className="p-2.5 bg-[#F5F3F0] hover:bg-[#EAE8E5] text-[#1C1A18] rounded-xl transition-colors flex items-center justify-center border border-[#E8E4DC]/80 cursor-pointer"
                          title="Thêm vào giỏ hàng tuần hoàn"
                          aria-label="Thêm vào giỏ hàng tuần hoàn"
                        >
                          <span className="material-symbols-outlined text-[19px]">shopping_bag</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* 4. ELEGANT EMPTY STATE PREVIEW (NO FAKE DATA) */
              <section className="my-6">
                <div className="bg-white rounded-3xl p-10 sm:p-14 text-center max-w-2xl mx-auto shadow-2xs border border-[#E8E4DC]">
                  {/* Minimalist Editorial SVG Illustration */}
                  <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#F5F3F0] flex items-center justify-center text-[#76726B]/50">
                    <svg className="w-10 h-10 stroke-current fill-none" strokeWidth="1.5" viewBox="0 0 48 48">
                      <path
                        d="M24 39.5l-2.18-1.98C14.08 30.5 9 25.88 9 20.12 9 15.42 12.7 11.72 17.4 11.72c2.66 0 5.21 1.24 6.6 3.19 1.39-1.95 3.94-3.19 6.6-3.19C35.3 11.72 39 15.42 39 20.12c0 5.76-5.08 10.38-12.82 17.42L24 39.5z"
                        strokeDasharray="2 3"
                      />
                      <circle cx="24" cy="24" fill="currentColor" opacity="0.4" r="3" />
                    </svg>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F3F0] rounded-full mb-3 border border-[#E8E4DC]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726B]">
                      LƯU TRỮ ĐANG CHỜ
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl font-bold text-[#1C1A18] mb-2 tracking-tight">
                    {activeTab === 'RENT'
                      ? 'Chưa có thiết bị RENT nào trong yêu thích'
                      : activeTab === 'THRIFT'
                      ? 'Chưa có món đồ THRIFT nào trong yêu thích'
                      : 'Danh sách yêu thích của bạn đang trống'}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#76726B] max-w-md mx-auto mb-7 leading-relaxed">
                    Bạn chưa lưu sản phẩm nào vào danh mục theo dõi. Hãy khám phá kho thiết bị công nghệ cao để thuê theo dịp, hoặc săn tìm các món đồ thời trang archival độc bản 1-of-1 trường tồn cùng thời gian.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      to="/rent"
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#1C1A18] text-white text-xs font-semibold rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[17px]">autorenew</span>
                      <span>Khám phá đồ RENT</span>
                    </Link>

                    <Link
                      to="/thrift"
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#F5F3F0] text-[#1C1A18] text-xs font-semibold rounded-xl hover:bg-[#EAE8E5] border border-[#E8E4DC] transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[17px]">archive</span>
                      <span>Săn đồ độc bản THRIFT</span>
                    </Link>
                  </div>

                  {/* Recommendation Micro-bar */}
                  <div className="mt-10 pt-6 border-t border-[#E8E4DC]/70 flex flex-wrap items-center justify-center gap-4 text-[#76726B] text-[10px] uppercase font-bold tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#3A6843] text-[15px]">verified</span>
                      Kiểm định 100% trước xuất kho
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#CCC5BC]" />
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#3A6843] text-[15px]">shield</span>
                      Bảo chứng ký quỹ minh bạch
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#CCC5BC]" />
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#3A6843] text-[15px]">eco</span>
                      Giảm thiểu 100% rác thải điện tử
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* 5. EDITORIAL CIRCULARITY FOOTER BANNER */}
            <section className="mt-12 bg-white border border-[#E8E4DC] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xs">
              <div className="max-w-xl space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3A6843]" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#3A6843]">
                    Quyền lợi thành viên Tuần Hoàn
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1A18] tracking-tight">
                  Cần giữ lịch thiết bị cho dự án sáng tạo sắp tới?
                </h3>
                <p className="text-xs text-[#76726B] leading-relaxed">
                  Các sản phẩm trong Wishlist sẽ gửi thông báo ưu tiên 24 giờ trước khi có sẵn lịch trống hoặc trước khi mở bán các đợt Ex-Rental với mức giá tuần hoàn ưu đãi.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                <Link
                  to="/rent"
                  className="w-full md:w-auto px-5 py-2.5 bg-[#3A6843] text-white text-xs font-semibold rounded-xl text-center hover:bg-[#2F5436] transition-all whitespace-nowrap shadow-2xs"
                >
                  Khám phá thêm thiết bị
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Wishlist;

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { UserSidebar } from '../../../components/layout/UserSidebar';
import {
  DEFAULT_RENTAL_ORDERS,
  RENTAL_SUMMARY_METRICS,
  LIFECYCLE_STATUS_TABS,
  type RentalOrderRecord,
  type StoredRentalOrderRecord,
  type StoredRentalOrderItem,
} from '../../data/rent/myRentOrdersData';

export const MyRentOrders: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Parse payment success query params if redirected from VNPay / Backend
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const paymentSuccessParam = queryParams.get('orderCode') || queryParams.get('vnp_TxnRef');
  const paymentAmountParam = queryParams.get('amount') || queryParams.get('vnp_Amount');
  const paymentTxnNo = queryParams.get('transactionNo') || queryParams.get('vnp_TransactionNo');

  // Dynamic user profile details
  const [profileData] = useState<{ fullName?: string; email?: string; avatarUrl?: string }>(() => {
    try {
      const raw = localStorage.getItem('user_profile_data');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const displayName = profileData.fullName || user?.fullName || 'Elena Rostova';
  const displayEmail = profileData.email || user?.email || 'elena.rostova@circular.vn';
  const displayAvatar =
    profileData.avatarUrl ||
    user?.avatarUrl ||
    user?.avatar ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCMwbU44ZM0dZePaAOyFv49mOAhbEw3pqfZA1_2FS-7VfcegFWv61TXx3DWJIZc8UB0MsGkPHwOa97niyCrHzEC25U-maDnSnRUqud1GouXT_0YJYIqKRwjN3kZk0T5DIHXCgA8hXoz_-CU_xbOdbngGDygOaOHOBKy0qRmDr3A-8mVbyTAF5sJb5PBdNrjI_ZwYlugupcwk1mJWpjSd3dcT4W7AIaVlBFmmLq1akOA';

  // Filters & State
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Mới nhất trước');
  const [periodOption, setPeriodOption] = useState('Năm 2026');
  const [showPaymentBanner, setShowPaymentBanner] = useState(Boolean(paymentSuccessParam));

  // Currency helper
  const formatVnd = (val: number | string) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    const finalNum = num > 100000000 ? num / 100 : num;
    return finalNum.toLocaleString('vi-VN') + '₫';
  };

  // Base orders merged with real localStorage orders if present
  const baseOrders = useMemo(() => {
    try {
      const stored: StoredRentalOrderRecord[] = JSON.parse(localStorage.getItem('user_rental_orders') || '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        const mappedStored: RentalOrderRecord[] = stored.map((o: StoredRentalOrderRecord, idx: number) => {
          const isPaid = o.status === 'PAID' || o.paymentStatus === 'PAID';
          return {
            id: o.orderCode?.replace('#', '') || `RH-RNT-NEW-${idx}`,
            code: o.orderCode?.startsWith('#') ? o.orderCode : `#${o.orderCode || 'RH-RNT-NEW'}`,
            date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay',
            shipping: 'Nanuk White-Glove (2 chiều)',
            status: isPaid ? 'RENTING' : (o.status || 'WAITING_PAYMENT'),
            statusText: isPaid ? 'ĐANG THUÊ (RENTING)' : 'CHỜ THANH TOÁN (WAITING_PAYMENT)',
            statusBg: isPaid ? 'bg-[#EEF2EC] text-[#37533E] border-[#D5E0D4]' : 'bg-[#FCF5EB] text-[#A6620C] border-[#F2DEBF]',
            dotBg: isPaid ? 'bg-[#4A6B53]' : 'bg-[#C87A1E] animate-ping',
            custodyDates: o.startDate && o.endDate ? `${o.startDate} → ${o.endDate} (${o.rentalDays || 3} ngày)` : 'Kỳ thuê 3 ngày',
            daysLeft: isPaid ? 'Đã kích hoạt bảo chứng Smart Escrow' : 'Chờ hoàn tất thanh toán VNPay',
            items: (o.items || []).map((it: StoredRentalOrderItem, iIdx: number) => ({
              id: it.id || `item-stored-${iIdx}`,
              title: it.title || 'Thiết bị thuê tuần hoàn',
              grade: it.grade || 'Grade A+',
              codeBadge: `Lưu ký #${(o.orderCode || 'RH').slice(-4)}-${iIdx + 1}`,
              shop: it.shopName || 'ReUse Partner Vault',
              notes: 'Kiểm định chất lượng 8 bước ReUse Standard',
              dailyRate: `${(it.dailyPrice || 450000).toLocaleString('vi-VN')}₫ / ngày`,
              itemTotal: `${(it.itemRentTotal || it.price || 900000).toLocaleString('vi-VN')}₫`,
              img: it.imageUrl || it.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
            })),
            rentTotal: `${(o.totalRentFee || 1500000).toLocaleString('vi-VN')}₫`,
            deposit: `${(o.totalDeposit || 16000000).toLocaleString('vi-VN')}₫`,
            shippingFee: `${(o.shippingFee || 150000).toLocaleString('vi-VN')}₫`,
            grandTotal: `${(o.totalPayment || o.grandTotal || 17650000).toLocaleString('vi-VN')}₫`,
            canReturn: isPaid,
            canPay: !isPaid,
          };
        });
        return [...mappedStored, ...DEFAULT_RENTAL_ORDERS];
      }
    } catch {
      // ignore
    }
    return DEFAULT_RENTAL_ORDERS;
  }, []);

  // Filter and search
  const filteredOrders = useMemo(() => {
    return baseOrders.filter((order) => {
      if (activeTab !== 'ALL' && order.status !== activeTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = order.code.toLowerCase().includes(q);
        const matchesItem = order.items.some((i) => i.title.toLowerCase().includes(q));
        if (!matchesCode && !matchesItem) return false;
      }
      return true;
    });
  }, [baseOrders, activeTab, searchQuery]);

  return (
    <div className="w-full min-h-screen bg-[#FBF9F5] text-[#22201D] font-sans antialiased selection:bg-[#E8E2D5]">
      {/* ── CELEBRATORY SUCCESS BANNER IF PAYMENT RETURNED ── */}
      {showPaymentBanner && (
        <div className="bg-[#EEF2EC] border-b border-[#D5E0D4] text-[#37533E] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 animate-fade-in shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#4A6B53] text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#243D2A]">
                THANH TOÁN QUA CỔNG VNPAY SANDBOX THÀNH CÔNG!
              </p>
              <p className="text-[11px] text-[#425F46] mt-0.5">
                Đơn hàng <strong className="font-mono text-[#243D2A]">{paymentSuccessParam}</strong> đã được xác nhận thanh toán {paymentAmountParam ? formatVnd(paymentAmountParam) : ''} {paymentTxnNo ? `· Mã GD: ${paymentTxnNo}` : ''}. Trạng thái đã được cập nhật vào Sổ lệnh thuê đồ.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPaymentBanner(false)}
            className="text-[#4A6B53] hover:text-[#243D2A] p-1 rounded-full cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      )}

      {/* ── MAIN APP CONTAINER (Sidebar + Dashboard Content) ── */}
      <div className="max-w-[1520px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex gap-8">
        {/* User Sidebar */}
        <UserSidebar
          activeKey="rent-orders"
          avatarUrl={displayAvatar}
          displayName={displayName}
          displayEmail={displayEmail}
          className="hidden lg:block shrink-0"
        />

        {/* ── MAIN DASHBOARD CONTENT AREA ── */}
        <main className="flex-1 min-w-0 space-y-8">
          <div className="flex flex-col w-full">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 mb-3">
              <Link
                to="/"
                className="font-mono text-xs uppercase tracking-wider text-[#7B766F] hover:text-[#141310] transition-colors"
              >
                Trang chủ
              </Link>
              <span className="text-[#CCC5BC] text-xs">/</span>
              <Link
                to="/user/dashboard"
                className="font-mono text-xs uppercase tracking-wider text-[#7B766F] hover:text-[#141310] transition-colors"
              >
                Tài khoản
              </Link>
              <span className="text-[#CCC5BC] text-xs">/</span>
              <span className="font-mono text-xs uppercase tracking-wider text-[#141310] font-semibold">
                Sổ lệnh thuê đồ (My Rentals)
              </span>
            </div>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAE6DD] text-[#22201D] text-[11px] font-semibold tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4A6B53]" />
                    Lưu ký &amp; Thuê tuần hoàn
                  </span>
                  <span className="text-xs text-[#76726B]">Mã khách: RH-CST-88902</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#22201D] tracking-tight">
                  Sổ lệnh thuê đồ RENT
                </h1>
                <p className="text-xs sm:text-sm text-[#76726B] mt-1 max-w-xl">
                  Theo dõi chi tiết các gói đơn thuê đa thiết bị, giám sát bảo chứng Smart Escrow và trạng thái bàn giao theo thời gian thực.
                </p>
              </div>

              {/* Action Links */}
              <div className="flex items-center gap-2.5 shrink-0">
                <Link to="/rent" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E8E4DC] hover:bg-[#F6F3EE] text-[#22201D] text-xs font-semibold shadow-2xs transition-all">
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  <span>Thuê thêm thiết bị</span>
                </Link>
                <Link to="/how-it-works" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[#76726B] hover:text-[#22201D] transition-colors">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span className="hidden sm:inline">Quy chế hoàn cọc</span>
                </Link>
              </div>
            </div>

            {/* HEADER SUMMARY METRICS (Bento Grid using separated RENTAL_SUMMARY_METRICS) */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mt-6">
              {RENTAL_SUMMARY_METRICS.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E4DC]/80 shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-[#4A6B53]/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#76726B]">{m.title}</span>
                    <span className={`p-1.5 rounded-lg ${m.iconBg} ${m.iconColor}`}>
                      <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-serif text-2xl sm:text-3xl font-bold text-[#22201D]">{m.mainVal}</span>
                      <span className={`text-xs font-semibold ${m.unitColor}`}>{m.unit}</span>
                      {m.badge && (
                        <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 bg-[#F4EDE2] text-[#8E6334] rounded">
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#76726B] mt-1">{m.subText}</p>
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${m.bottomBorderColor}`} />
                </div>
              ))}
            </section>

            {/* LIFECYCLE TABS (using separated LIFECYCLE_STATUS_TABS) */}
            <div className="mt-8 bg-white border border-[#E8E4DC]/80 rounded-2xl p-1.5 shadow-2xs">
              <div className="flex items-center gap-1 overflow-x-auto thin-scrollbar pb-1 text-xs whitespace-nowrap">
                {LIFECYCLE_STATUS_TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    className={`px-3 py-2 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === t.key
                        ? 'bg-[#22201D] text-white shadow-2xs font-semibold'
                        : 'text-[#76726B] hover:text-[#22201D] hover:bg-[#F6F3EE]'
                    }`}
                  >
                    <span>{t.label}</span>
                    {t.dot && <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />}
                  </button>
                ))}
              </div>
            </div>

            {/* SEARCH, FILTER & SORTING */}
            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo mã đơn (#RH-RNT...), tên máy ảnh, lều, lens..."
                  className="w-full bg-white border border-[#E8E4DC] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#22201D] placeholder-[#76726B]/70 focus:outline-none focus:ring-1 focus:ring-[#22201D] focus:bg-white shadow-2xs transition-all"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#76726B]">
                  search
                </span>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <div className="relative">
                  <select
                    value={periodOption}
                    onChange={(e) => setPeriodOption(e.target.value)}
                    className="appearance-none bg-white border border-[#E8E4DC] rounded-xl pl-3 pr-8 py-2.5 text-xs font-medium text-[#22201D] hover:bg-[#F6F3EE] focus:outline-none focus:ring-1 focus:ring-[#22201D] shadow-2xs transition-all cursor-pointer"
                  >
                    <option>Năm 2026</option>
                    <option>Quý 4 / 2026</option>
                    <option>Quý 3 / 2026</option>
                    <option>Tất cả thời gian</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#76726B] pointer-events-none">
                    expand_more
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none bg-white border border-[#E8E4DC] rounded-xl pl-3 pr-8 py-2.5 text-xs font-medium text-[#22201D] hover:bg-[#F6F3EE] focus:outline-none focus:ring-1 focus:ring-[#22201D] shadow-2xs transition-all cursor-pointer"
                  >
                    <option>Mới nhất trước</option>
                    <option>Cũ nhất trước</option>
                    <option>Giá trị cọc cao nhất</option>
                    <option>Sắp hết hạn thuê</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#76726B] pointer-events-none">
                    swap_vert
                  </span>
                </div>
              </div>
            </div>

            {/* ORDER LISTING SECTION */}
            <div className="mt-6 space-y-6">
              {filteredOrders.map((order) => (
                <article
                  key={order.id}
                  className="order-card bg-white border border-[#E8E4DC] rounded-3xl p-5 sm:p-7 shadow-xs hover:shadow-md transition-shadow relative"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#E8E4DC]/60">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-serif text-lg font-bold text-[#22201D] tracking-tight">{order.code}</span>
                      <span className="text-xs text-[#76726B]">· Ngày đặt: {order.date}</span>
                      <span className="text-xs text-[#76726B] hidden sm:inline">· Giao vận: {order.shipping}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold tracking-wide ${order.statusBg}`}>
                        <span className={`w-2 h-2 rounded-full ${order.dotBg}`} />
                        {order.statusText}
                      </span>
                    </div>
                  </div>

                  {/* Custody Info */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-[#F6F8F5] border border-[#DFE7DD] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2.5 text-[#37533E]">
                      <span className="material-symbols-outlined text-[18px]">timelapse</span>
                      <span className="font-medium">
                        Kỳ hạn thuê: <strong>{order.custodyDates}</strong>
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#DFE7DD] text-[#22201D] text-[11px] font-bold">
                      <span className="material-symbols-outlined text-[14px] text-[#4A6B53]">hourglass_top</span>
                      <span>{order.daysLeft}</span>
                    </div>
                  </div>

                  {/* Multi-Item Breakdown */}
                  <div className="mt-5 space-y-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#76726B]">
                      Danh mục thiết bị trong đơn ({order.items.length < 10 ? `0${order.items.length}` : order.items.length} món)
                    </div>

                    {order.items.map((it) => (
                      <div
                        key={it.id}
                        className="p-3.5 sm:p-4 rounded-2xl bg-[#F6F3EE]/70 border border-[#E8E4DC]/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                          <img
                            src={it.img}
                            alt={it.title}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#E8E4DC]/80 shrink-0 shadow-2xs"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#22201D] text-white uppercase tracking-wider">
                                {it.grade}
                              </span>
                              <span className="text-[11px] font-mono text-[#76726B]">{it.codeBadge}</span>
                            </div>
                            <h3 className="text-sm font-bold text-[#22201D] truncate mt-1">
                              {it.title}
                            </h3>
                            <p className="text-xs text-[#76726B] mt-0.5">
                              Cung cấp bởi: <span className="font-semibold text-[#22201D]">{it.shop}</span> · {it.notes}
                            </p>
                          </div>
                        </div>

                        <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E8E4DC]/40">
                          <span className="text-xs text-[#76726B]">Định mức: {it.dailyRate}</span>
                          <span className="text-xs font-bold text-[#22201D] mt-0.5">Tiền thuê: {it.itemTotal}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Financial Ledger & Actions */}
                  <div className="mt-6 pt-5 border-t border-[#E8E4DC]/60 grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                    <div className="md:col-span-7 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[#76726B]">
                        <span>Tổng tiền thuê ({order.items.length} món):</span>
                        <span className="font-medium text-[#22201D]">{order.rentTotal}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#76726B]">
                        <span className="flex items-center gap-1.5">
                          <span>Bảo chứng Smart Escrow (Hoàn lại 100%):</span>
                          <span className="material-symbols-outlined text-[14px] text-[#4A6B53]">verified</span>
                        </span>
                        <span className="font-semibold text-[#22201D]">{order.deposit}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#76726B]">
                        <span>Phí giao nhận Nanuk chuyên biệt 2 chiều:</span>
                        <span className="font-medium text-[#22201D]">{order.shippingFee}</span>
                      </div>
                      <div className="pt-2 border-t border-[#E8E4DC]/40 flex items-center justify-between font-bold text-sm text-[#22201D]">
                        <span>Tổng giá trị giao dịch:</span>
                        <span className="font-serif text-base font-bold text-[#22201D]">{order.grandTotal}</span>
                      </div>
                    </div>

                    <div className="md:col-span-5 flex flex-col sm:flex-row md:flex-col gap-2.5">
                      {order.canPay ? (
                        <>
                          <Link
                            to={`/rent/checkout?orderId=${order.id}`}
                            className="w-full text-center px-4 py-2.5 rounded-xl bg-[#C87A1E] hover:bg-[#B06813] text-white font-bold text-xs tracking-wide shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">credit_card</span>
                            <span>Thanh toán ngay qua VNPay Escrow</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => alert('Đã tiếp nhận yêu cầu hủy giữ chỗ đơn hàng.')}
                            className="w-full text-center px-4 py-2 rounded-xl bg-white hover:bg-[#FDF3F2] border border-[#E8E4DC] text-[#C84337] font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Hủy giữ chỗ đơn này
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            to={`/rent/orders/${order.id}`}
                            className="w-full text-center px-4 py-2.5 rounded-xl bg-[#22201D] hover:bg-black text-white font-semibold text-xs tracking-wide shadow-2xs transition-colors"
                          >
                            Xem chi tiết đơn thuê &amp; biên bản
                          </Link>
                          <div className="flex gap-2">
                            {order.canReturn && (
                              <Link
                                to={`/rent/orders/${order.id}/return`}
                                className="flex-1 text-center px-3 py-2.5 rounded-xl bg-[#EEF2EC] hover:bg-[#E3EAE0] text-[#37533E] border border-[#D5E0D4] font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[15px]">assignment_return</span>
                                <span>Yêu cầu trả đồ</span>
                              </Link>
                            )}
                            <Link
                              to={`/chat?orderId=${order.id}`}
                              className="px-3 py-2.5 rounded-xl bg-white hover:bg-[#F6F3EE] border border-[#E8E4DC] text-[#22201D] font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                              title="Nhắn tin với đơn vị cho thuê"
                            >
                              <span className="material-symbols-outlined text-[15px]">chat</span>
                              <span className="hidden sm:inline">Nhắn Shop</span>
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}

              {filteredOrders.length === 0 && (
                <div className="p-12 text-center bg-white rounded-3xl border border-[#E8E4DC] space-y-3">
                  <span className="material-symbols-outlined text-4xl text-[#76726B]">inventory_2</span>
                  <p className="text-sm font-bold text-[#22201D]">Không tìm thấy đơn thuê nào khớp bộ lọc</p>
                  <p className="text-xs text-[#76726B]">Vui lòng chọn trạng thái khác hoặc xóa từ khóa tìm kiếm.</p>
                </div>
              )}
            </div>

            {/* PAGINATION */}
            <div className="mt-10 pt-6 border-t border-[#E8E4DC]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#76726B]">
                Hiển thị <strong className="text-[#22201D]">{filteredOrders.length}</strong> trong tổng số <strong className="text-[#22201D]">{baseOrders.length}</strong> đơn thuê tuần hoàn
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC]/80 text-xs font-semibold text-[#76726B] opacity-50 cursor-not-allowed"
                >
                  Trang trước
                </button>
                <div className="flex items-center gap-1 text-xs">
                  <span className="w-8 h-8 rounded-xl bg-[#22201D] text-white font-bold flex items-center justify-center shadow-2xs">
                    1
                  </span>
                </div>
                <button
                  type="button"
                  disabled
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC]/80 text-xs font-semibold text-[#76726B] opacity-50 cursor-not-allowed"
                >
                  Trang kế tiếp
                </button>
              </div>
            </div>

            {/* CIRCULAR ESCROW TRUST COMMITMENT BANNER */}
            <div className="mt-8 p-5 sm:p-6 rounded-3xl bg-[#F4F1EA] border border-[#E8E4DC] flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8E4DC] flex items-center justify-center shrink-0 shadow-2xs">
                  <span className="material-symbols-outlined text-[24px] text-[#4A6B53]">security_update_good</span>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#22201D]">Cam kết hoàn cọc minh bạch Smart Escrow</h4>
                  <p className="text-xs text-[#76726B] mt-0.5 max-w-xl">
                    Toàn bộ tiền ký quỹ được bảo quản độc lập trong tài khoản Escrow. Trong mọi đơn hàng, nếu sản phẩm được kiểm tra không phát sinh lỗi va đập hay thất lạc, tiền ký quỹ sẽ tự động hoàn trả 100% trong tối đa 24 giờ.
                  </p>
                </div>
              </div>
              <Link
                to="/how-it-works"
                className="shrink-0 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F6F3EE] border border-[#E8E4DC] text-[#22201D] font-semibold text-xs transition-colors shadow-2xs"
              >
                Đọc điều khoản bảo hiểm
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyRentOrders;

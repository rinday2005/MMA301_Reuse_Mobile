import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCartWishlist } from '../../context/CartWishlistContext';

export interface UserSidebarProps {
  className?: string;
  activeKey?: string;
  mode?: 'static' | 'drawer';
}

const HEADER_H = 112;

export const UserSidebar: React.FC<UserSidebarProps> = ({
  className = '',
  activeKey,
  mode = 'static',
}) => {
  const { user } = useAuth();
  const { cartCount, wishlistCount } = useCartWishlist();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const currentPath = location.pathname;
  const isDashboard = currentPath.startsWith('/user/dashboard') || currentPath === '/dashboard';

  const isCurrent = (key: string, path: string) => {
    if (activeKey) return activeKey === key;
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const handleLinkClick = () => {
    if (mode === 'drawer') {
      setIsOpen(false);
    }
  };

  const displayName = user?.fullName || 'Khách hàng';
  const displayEmail = user?.email || 'customer@circular.vn';

  const sidebarContent = (
    <div className="space-y-6">
      {/* User Badge Card */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E4DC]/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <img
            alt={displayName}
            className="w-11 h-11 rounded-full object-cover border border-[#E8E4DC] shadow-2xs"
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-[#1C1A18] truncate">{displayName}</h4>
            <p className="text-[10px] text-[#76726B] truncate">{displayEmail}</p>
            <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full bg-[#EEF2EC] text-[#5E6D5B] text-[9px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5E6D5B]" />
              <span>Khách hàng uy tín</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Group 1: Quản lý tài khoản */}
      <div className="space-y-1">
        <div className="px-3 pb-1.5 text-[10px] uppercase font-bold tracking-wider text-[#76726B]">
          Quản lý tài khoản
        </div>

        {/* Dashboard */}
        <Link
          to="/user/dashboard"
          onClick={handleLinkClick}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors shadow-2xs ${
            isCurrent('dashboard', '/user/dashboard') || currentPath === '/dashboard'
              ? 'bg-[#1C1A18] text-white'
              : 'text-[#1C1A18] hover:bg-white border border-transparent hover:border-[#E8E4DC]/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span>Dashboard</span>
          </div>
          {(isCurrent('dashboard', '/user/dashboard') || currentPath === '/dashboard') && (
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          )}
        </Link>

        {/* RENT */}
        <Link
          to="/rent"
          onClick={handleLinkClick}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-colors group ${
            isCurrent('rent', '/rent')
              ? 'bg-[#1C1A18] text-white'
              : 'text-[#1C1A18] hover:bg-white border border-transparent hover:border-[#E8E4DC]/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-4 h-4 text-[#76726B] group-hover:text-[#1C1A18]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M13 10V3L4 14h7v7l9-11h-7z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
            <span>Khám phá RENT</span>
          </div>
          <span className="text-[10px] text-[#76726B] bg-[#EFECE6] px-1.5 py-0.5 rounded font-medium">
            HOT
          </span>
        </Link>

        {/* THRIFT */}
        <Link
          to="/thrift"
          onClick={handleLinkClick}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-colors group ${
            isCurrent('thrift', '/thrift')
              ? 'bg-[#1C1A18] text-white'
              : 'text-[#1C1A18] hover:bg-white border border-transparent hover:border-[#E8E4DC]/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-4 h-4 text-[#76726B] group-hover:text-[#1C1A18]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
            <span>Kho đồ THRIFT</span>
          </div>
          <span className="text-[10px] text-[#76726B] bg-[#EFECE6] px-1.5 py-0.5 rounded font-medium">
            340+
          </span>
        </Link>

        {/* Cart */}
        <Link
          to="/cart"
          onClick={handleLinkClick}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-colors group ${
            isCurrent('cart', '/cart')
              ? 'bg-[#1C1A18] text-white'
              : 'text-[#1C1A18] hover:bg-white border border-transparent hover:border-[#E8E4DC]/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-4 h-4 text-[#76726B] group-hover:text-[#1C1A18]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
            <span>Giỏ hàng tuần hoàn</span>
          </div>
          <span className="text-[10px] bg-[#1C1A18] text-white px-2 py-0.5 rounded-full font-bold">
            {cartCount}
          </span>
        </Link>
      </div>

      {/* Navigation Group 2: Đơn hàng & Tiện ích */}
      <div className="space-y-1">
        <div className="px-3 pb-1.5 text-[10px] uppercase font-bold tracking-wider text-[#76726B]">
          Đơn hàng &amp; Tiện ích
        </div>

        {/* My Rentals */}
        <Link
          to="/rent/orders"
          onClick={handleLinkClick}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-colors group ${
            isCurrent('rent-orders', '/rent/orders')
              ? 'bg-[#1C1A18] text-white'
              : 'text-[#1C1A18] hover:bg-white border border-transparent hover:border-[#E8E4DC]/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-4 h-4 text-[#76726B] group-hover:text-[#1C1A18]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
            <span>Đơn thuê (My Rentals)</span>
          </div>
          <span className="text-[10px] text-[#5E6D5B] font-bold">1 Đang giữ</span>
        </Link>

        {/* My Thrift Orders */}
        <Link
          to="/thrift/orders"
          onClick={handleLinkClick}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-colors group ${
            isCurrent('thrift-orders', '/thrift/orders')
              ? 'bg-[#1C1A18] text-white'
              : 'text-[#1C1A18] hover:bg-white border border-transparent hover:border-[#E8E4DC]/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-4 h-4 text-[#76726B] group-hover:text-[#1C1A18]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
            <span>Đơn mua THRIFT</span>
          </div>
          <span className="text-[10px] text-[#76726B] font-semibold">3 Đơn</span>
        </Link>

        {/* Wishlist */}
        <Link
          to="/wishlist"
          onClick={handleLinkClick}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-colors group ${
            isCurrent('wishlist', '/wishlist') || currentPath === '/saved-items'
              ? 'bg-[#1C1A18] text-white'
              : 'text-[#1C1A18] hover:bg-white border border-transparent hover:border-[#E8E4DC]/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-4 h-4 text-[#76726B] group-hover:text-[#1C1A18]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
            <span>Yêu thích (Wishlist)</span>
          </div>
          <span className="text-[10px] text-[#76726B] font-semibold">{wishlistCount}</span>
        </Link>

        {/* Messages / Chat */}
        <Link
          to="/chat"
          onClick={handleLinkClick}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-colors group ${
            isCurrent('chat', '/chat')
              ? 'bg-[#1C1A18] text-white'
              : 'text-[#1C1A18] hover:bg-white border border-transparent hover:border-[#E8E4DC]/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-4 h-4 text-[#76726B] group-hover:text-[#1C1A18]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
            <span>Tin nhắn &amp; Hỗ trợ</span>
          </div>
          <span className="text-[10px] text-[#76726B]">Mở</span>
        </Link>
      </div>

      {/* Navigation Group 3: Tín nhiệm & Bảo mật */}
      <div className="space-y-1">
        <div className="px-3 pb-1.5 text-[10px] uppercase font-bold tracking-wider text-[#76726B]">
          Tín nhiệm &amp; Bảo mật
        </div>

        {/* Profile */}
        <Link
          to="/profile"
          onClick={handleLinkClick}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-colors group ${
            isCurrent('profile', '/profile') || currentPath === '/account-settings'
              ? 'bg-[#1C1A18] text-white'
              : 'text-[#1C1A18] hover:bg-white border border-transparent hover:border-[#E8E4DC]/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-4 h-4 text-[#76726B] group-hover:text-[#1C1A18]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7 7z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
            <span>Hồ sơ cá nhân</span>
          </div>
        </Link>

        {/* Verification (KYC) */}
        <Link
          to="/kyc"
          onClick={handleLinkClick}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-colors group ${
            isCurrent('kyc', '/kyc')
              ? 'bg-[#1C1A18] text-white'
              : 'text-[#1C1A18] hover:bg-white border border-transparent hover:border-[#E8E4DC]/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-4 h-4 text-[#76726B] group-hover:text-[#1C1A18]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
            <span>Định danh KYC</span>
          </div>
          <span className="text-[9px] bg-[#5E6D5B] text-white px-1.5 py-0.5 rounded font-bold uppercase">
            ĐÃ DUYỆT
          </span>
        </Link>
      </div>

      {/* Escrow Guarantee Box */}
      <div className="p-3.5 rounded-2xl bg-[#EFECE6]/70 border border-[#E8E4DC] text-[11px] text-[#76726B] space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-[#1C1A18] text-xs">
          <svg className="w-3.5 h-3.5 text-[#5E6D5B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <span>Bảo chứng Smart Escrow</span>
        </div>
        <p className="leading-relaxed">
          Tiền cọc của bạn được cách ly an toàn và hoàn trả 100% trong 24h sau khi Shop Owner hoàn tất đối kiểm.
        </p>
      </div>
    </div>
  );

  // ── Mode: Drawer (overlay for browsing pages / MasterLayout) ──
  if (mode === 'drawer') {
    return (
      <>
        {/* Backdrop Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Toggle Button on left */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Đóng menu cá nhân' : 'Mở menu cá nhân'}
          style={{ top: `${HEADER_H - 80 + (80 - 36) / 2}px` }}
          className={`fixed left-3 z-50 w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#E7E2DA] shadow-sm hover:bg-[#F4F0EA] transition-colors cursor-pointer ${
            isDashboard ? 'lg:hidden' : ''
          } ${className}`}
          title={isOpen ? 'Đóng menu' : 'Menu khách hàng ReUse Hub'}
        >
          <span className="material-symbols-outlined text-[20px] text-[#1C1A18] block leading-none">
            {isOpen ? 'close' : 'menu'}
          </span>
          {/* Green dot indicating active customer session */}
          <span
            className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-white"
            title="Đang đăng nhập"
          />
        </button>

        {/* Slide-out Drawer Panel */}
        <aside
          style={{ top: `${HEADER_H}px`, height: `calc(100vh - ${HEADER_H}px)` }}
          className={`fixed left-0 z-50 w-72 sm:w-80 bg-[#FBF9F5] border-r border-[#E7E2DA] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header bar within drawer */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E4DC]/80 bg-white/80 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="text-[11px] font-bold text-[#1C1A18] uppercase tracking-wider">
                Tài khoản khách hàng
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#76726B] hover:text-[#1C1A18] hover:bg-[#F4F0EA] rounded-md transition-colors cursor-pointer"
              title="Đóng menu"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 thin-scrollbar">
            {sidebarContent}
          </div>
        </aside>
      </>
    );
  }

  // ── Mode: Static (embedded in-page for UserDashboard) ────────
  return (
    <aside className={`w-64 shrink-0 ${className}`}>
      <div className="sticky top-28">{sidebarContent}</div>
    </aside>
  );
};

export default UserSidebar;

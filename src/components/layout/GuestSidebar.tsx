import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface GuestSidebarProps {
  className?: string;
}

const navMain = [
  { to: '/', icon: 'home', label: 'Trang chủ', exact: true },
  { to: '/rent', icon: 'cached', label: 'Thuê đồ RENT', badge: 'HOT' },
  { to: '/thrift', icon: 'shopping_bag', label: 'Mua đồ THRIFT', badge: 'NEW' },
  { to: '/categories', icon: 'grid_view', label: 'Danh mục sản phẩm' },
  { to: '/cart', icon: 'local_mall', label: 'Giỏ hàng tuần hoàn' },
];

const navEcosystem = [
  { to: '/how-it-works', icon: 'sync_alt', label: 'Cách hoạt động' },
  { to: '/about', icon: 'info', label: 'Giới thiệu' },
  { to: '/faq', icon: 'help_outline', label: 'Câu hỏi FAQ' },
  { to: '/contact', icon: 'mail', label: 'Liên hệ hỗ trợ' },
];

// Header = announcement bar (~32px py-2) + nav h-20 (80px) = 112px total
const HEADER_H = 112;

export const GuestSidebar: React.FC<GuestSidebarProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const linkBase =
    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-[13px]';
  const linkActive = 'bg-[#1C1A18] text-white shadow-sm';
  const linkInactive = 'text-[#5E5A53] hover:text-[#1C1A18] hover:bg-[#F4F0EA]';

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Toggle button — ngang bằng header, căn giữa chiều dọc trong vùng nav (80px từ top announcement) */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
        style={{ top: `${HEADER_H - 80 + (80 - 36) / 2}px` }} /* top của nav + căn giữa 36px btn trong 80px nav */
        className={`fixed left-3 z-50 w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#E7E2DA] shadow-sm hover:bg-[#F4F0EA] transition-colors ${className}`}
      >
        <span className="material-symbols-outlined text-[20px] text-[#1C1A18] block leading-none">
          {isOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Sidebar panel — bắt đầu từ ngay dưới header */}
      <aside
        style={{ top: `${HEADER_H}px`, height: `calc(100vh - ${HEADER_H}px)` }}
        className={`fixed left-0 z-40 w-64 bg-white border-r border-[#E7E2DA] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
      >
        {/* Links — không có header bar thừa, bắt đầu ngay từ nav items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {navMain.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={`${linkBase} justify-between ${
                isActive(item.to, item.exact) ? linkActive : linkInactive
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#F4F0EA] border border-[#E7E2DA] rounded text-[#1C1A18] leading-none">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}

          <div className="pt-4 pb-1.5 px-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#78736A]">
              Hệ sinh thái
            </span>
          </div>

          {navEcosystem.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={`${linkBase} ${isActive(item.to) ? linkActive : linkInactive}`}
            >
              <span className="material-symbols-outlined text-[18px] leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Footer badge */}
        <div className="p-4 border-t border-[#E7E2DA] bg-[#F4F0EA]/30 shrink-0">
          <div className="p-3 rounded-lg bg-white border border-[#E7E2DA] space-y-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#1C1A18] leading-none">
                shield_with_heart
              </span>
              <span className="text-xs font-semibold text-[#1C1A18]">Tuần hoàn 100%</span>
            </div>
            <p className="text-[11px] text-[#78736A] leading-relaxed">
              Cam kết bảo hiểm và vệ sinh đạt chuẩn y tế cho mọi đơn thuê.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default GuestSidebar;

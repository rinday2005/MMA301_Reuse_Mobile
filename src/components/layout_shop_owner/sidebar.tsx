import React, { useContext } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";
import { defaultShopProfile } from "../../pages/data/shop/dashboardData";

interface ShopSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: string;
  badge?: string;
  matcher: (path: string) => boolean;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const ShopSidebar: React.FC<ShopSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const ownerName = user?.name || user?.username || defaultShopProfile.ownerName;
  const shopName = defaultShopProfile.shopName;

  const navGroups: NavGroup[] = [
    {
      groupTitle: "QUẢN TRỊ KÊNH",
      items: [
        {
          to: "/shop/dashboard",
          label: "Dashboard",
          icon: "grid_view",
          matcher: (path: string) => path === "/shop" || path === "/shop/dashboard",
        },
      ],
    },
    {
      groupTitle: "CHO THUÊ (RENT)",
      items: [
        {
          to: "/shop/rent/products",
          label: "Sản phẩm RENT",
          icon: "camera_alt",
          matcher: (path: string) =>
            path.startsWith("/shop/rent/products") ||
            path.startsWith("/shop/rent-products") ||
            path.startsWith("/shop/rent/create") ||
            path.startsWith("/shop/rent/edit"),
        },
        {
          to: "/shop/rent/orders",
          label: "Đơn thuê RENT",
          icon: "assignment",
          matcher: (path: string) =>
            path.startsWith("/shop/rent/orders") ||
            (path.startsWith("/shop/orders") && !path.startsWith("/shop/orders/thrift")),
        },
        {
          to: "/shop/rent/inventory",
          label: "Kho hiện vật",
          icon: "inventory_2",
          matcher: (path: string) =>
            path.startsWith("/shop/rent/inventory") || path === "/shop/inventory",
        },
      ],
    },
    {
      groupTitle: "BÁN ĐỒ (THRIFT)",
      items: [
        {
          to: "/shop/thrift/listings",
          label: "Mục đăng THRIFT",
          icon: "sell",
          matcher: (path: string) =>
            (path.startsWith("/shop/thrift") && !path.startsWith("/shop/thrift/orders")) ||
            path.startsWith("/shop/rent/convert"),
        },
        {
          to: "/shop/thrift/orders",
          label: "Đơn bán THRIFT",
          icon: "local_shipping",
          matcher: (path: string) =>
            path.startsWith("/shop/thrift/orders") || path.startsWith("/shop/orders/thrift"),
        },
      ],
    },
    {
      groupTitle: "TÀI CHÍNH & BÁO CÁO",
      items: [
        {
          to: "/shop/revenue",
          label: "Báo cáo doanh thu / Ví Escrow",
          icon: "account_balance_wallet",
          matcher: (path: string) =>
            path.startsWith("/shop/revenue") || path.startsWith("/shop/payouts"),
        },
      ],
    },
  ];

  return (
    <>
      {/* 1. Backdrop Overlay (Hiển thị khi sidebar mở trên mọi màn hình, click ra ngoài để đóng) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* 2. Khung Sidebar trượt từ bên trái ra (280px, z-50) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[280px] bg-[#f7f3ec] border-r border-[#dddad3] shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          } [scrollbar-width:thin]`}
      >
        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Header trên cùng của Sidebar: Logo + Nút Đóng (X) */}
          <div className="flex items-center justify-between pb-3 border-b border-[#dddad3]">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-[#141310]">ReUse Hub</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#141310] text-[#fdf9f2]">
                Shop Owner
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#78716c] hover:text-[#141310] hover:bg-[#ebe8e1] transition-colors cursor-pointer"
              title="Đóng sidebar"
              aria-label="Đóng thanh điều hướng"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Box thông tin tài khoản xưởng / chủ shop */}
          <Link
            to="/shop/profile"
            onClick={onClose}
            className="p-3 rounded-xl bg-[#ede8df] hover:bg-[#e7e1d6] border border-[#dddad3] transition-colors flex items-center gap-3 group"
            title="Quản lý hồ sơ xưởng"
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-lg bg-[#141310] text-[#fdf9f2] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[20px]">storefront</span>
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#ede8df]"
                title="Đang hoạt động"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-[#141310] truncate group-hover:text-black">
                {shopName}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-emerald-800 font-medium text-[10px]">Trực tuyến • Bàn mở</span>
              </div>
              <div className="text-[10px] text-[#78716c] font-mono truncate mt-0.5">
                {ownerName} • #OWNER-01
              </div>
            </div>
          </Link>

          {/* Danh mục menu theo từng nhóm */}
          <nav className="flex flex-col gap-5 mt-1" aria-label="Kênh quản trị Shop">
            {navGroups.map((group) => (
              <div key={group.groupTitle} className="space-y-1">
                <div className="text-[10px] font-bold text-[#78716c] uppercase tracking-wider px-3 mb-1.5">
                  {group.groupTitle}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = item.matcher(location.pathname);
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${isActive
                            ? "font-semibold bg-[#141310] text-white shadow-xs"
                            : "font-medium text-[#4a463f] hover:text-[#141310] hover:bg-[#ebe8e1]"
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="material-symbols-outlined text-[18px] shrink-0">
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFDAD6] text-[#93000A]">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer info & link nhanh ở đáy Sidebar */}
        <div className="p-4 border-t border-[#dddad3] space-y-3 shrink-0 bg-[#f7f3ec]">
          <div className="p-2.5 rounded-lg bg-[#ede8df]/80 border border-[#dddad3]/70 text-[11px] text-[#78716c] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[#141310]">
              <span className="material-symbols-outlined text-[15px] text-[#576151]">verified_user</span>
              <span>Bảo chứng Nanuk &amp; Escrow</span>
            </div>
            <div className="text-[10px] text-[#78716c] leading-relaxed">
              Quy chuẩn B-Corp V4.2 • Lưu ký tuần hoàn khép kín
            </div>
          </div>

          <div className="flex items-center justify-between text-xs px-1">
            <Link
              to="/rent"
              onClick={onClose}
              className="text-[#576151] hover:text-[#141310] font-medium flex items-center gap-1 transition-colors"
            >
              <span>Sàn RENT</span>
              <span className="material-symbols-outlined text-[13px]">open_in_new</span>
            </Link>
            <div className="h-3 w-px bg-[#dddad3]" />
            <Link
              to="/thrift"
              onClick={onClose}
              className="text-[#7b5227] hover:text-[#141310] font-medium flex items-center gap-1 transition-colors"
            >
              <span>Sàn THRIFT</span>
              <span className="material-symbols-outlined text-[13px]">open_in_new</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ShopSidebar;

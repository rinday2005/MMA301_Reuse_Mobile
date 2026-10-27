import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";
import { defaultShopProfile } from "../../pages/data/shop/dashboardData";

interface ShopHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen = false,
}) => {
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const ownerName = user?.name || user?.username || defaultShopProfile.ownerName;
  const shopName = defaultShopProfile.shopName;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#fdf9f2]/95 backdrop-blur-md border-b border-[#dddad3] shadow-[0_1px_6px_rgba(41,39,36,0.03)] h-16">
      <div className="h-full w-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* KHỐI TRÁI: Nút Bật/Tắt Sidebar (hiển thị trên mọi màn hình) + Logo + Badge */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Nút bấm để hiển thị/thu gọn Sidebar bên trái (Icon-only tối giản) */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-lg bg-[#ede8df] hover:bg-[#e2dcce] text-[#141310] border border-[#dddad3] transition-all flex items-center justify-center shadow-2xs group cursor-pointer"
            title={isSidebarOpen ? "Đóng sidebar menu" : "Mở sidebar menu"}
            aria-label={isSidebarOpen ? "Đóng sidebar menu" : "Mở sidebar menu"}
          >
            <span className="material-symbols-outlined text-[21px] block transition-transform group-hover:scale-110">
              {isSidebarOpen ? "close" : "menu"}
            </span>
          </button>

          {/* Logo ReUse Hub */}
          <Link to="/shop/dashboard" className="flex items-center gap-2 group">
            <span className="font-serif text-[20px] text-[#141310] tracking-tight font-semibold">
              ReUse Hub
            </span>
          </Link>

          {/* Badge phân loại role */}
          <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#141310] text-[#fdf9f2]">
            Kênh Quản Trị
          </span>
        </div>

        {/* KHỐI GIỮA: Ô tìm kiếm / Thông tin nhanh */}
        <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl mx-4">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#78716c]">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm mã đơn hàng, hiện vật Nanuk, sản phẩm..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#f4efe6] border border-[#dddad3] text-xs text-[#1c1c18] placeholder-[#78716c] focus:outline-none focus:border-[#141310] focus:bg-white transition-all"
            />
          </div>

          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-[#d8e3ce]/70 border border-[#c4d4b7] text-[11px] text-[#3f4a3a] shrink-0 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Escrow Active • Bàn kiểm định mở</span>
          </div>
        </div>

        {/* KHỐI PHẢI: Nút Xem sàn + Thông báo + Profile Shop */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Nút thoát về sàn mua sắm dành cho khách */}
          <Link
            to="/"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#57534e] hover:text-[#141310] hover:bg-[#ebe8e1] rounded-lg transition-colors border border-[#dddad3]"
            title="Quay lại giao diện người mua"
          >
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            <span className="hidden sm:inline">Xem sàn</span>
          </Link>

          {/* Nút thông báo */}
          <Link
            to="/shop/notifications"
            className="p-1.5 text-[#57534e] hover:text-[#1c1c18] hover:bg-[#ebe8e1] transition-colors rounded-lg relative"
            title="Thông báo Shop"
          >
            <span className="material-symbols-outlined text-[20px] block">notifications</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
          </Link>

          <div className="h-5 w-px bg-[#dddad3]" />

          {/* Profile Shop Owner */}
          <Link
            to="/shop/profile"
            className="flex items-center gap-2.5 py-1 px-2 hover:bg-[#f3efe8] transition-colors rounded-lg"
            title="Xem hồ sơ xưởng"
          >
            <div className="text-right hidden md:block">
              <div className="text-[13px] font-semibold text-[#141310] leading-tight truncate max-w-[150px]">
                {shopName}
              </div>
              <div className="text-[10px] tracking-wider text-[#78716c] flex items-center justify-end gap-1 font-medium mt-0.5">
                <span>{ownerName}</span>
                <span className="px-1 py-0.2 rounded bg-[#e7e5e4] text-[#44403c] font-mono text-[9px] font-bold">
                  #OWNER-01
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#141310] text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[17px]">store</span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default ShopHeader;
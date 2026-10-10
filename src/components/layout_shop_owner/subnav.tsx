import React from "react";
import { NavLink } from "react-router-dom";

const shopNavItems = [
  { to: "/shop/dashboard", label: "Shop Dashboard", icon: "dashboard" },
  { to: "/shop/rent/products", label: "RENT Products", icon: "camera" },
  { to: "/shop/rent/inventory", label: "RENT Inventory", icon: "inventory_2" },
  { to: "/shop/rent/orders", label: "RENT Orders", icon: "assignment" },
  { to: "/shop/thrift/listings", label: "THRIFT Listings", icon: "sell" },
  { to: "/shop/thrift/orders", label: "THRIFT Orders", icon: "local_shipping" },
  { to: "/shop/revenue", label: "Revenue", icon: "payments" },
];

export const ShopSubNav: React.FC = () => {
  return (
    <div className="w-full flex flex-col">
      {/* Real-time Status Top Bar */}
      <div className="w-full bg-[#292724] text-[#E7E1DD] px-4 md:px-12 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs tracking-wider">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex w-2 h-2 rounded-full bg-[#8FA77B] animate-pulse"></span>
          <span className="font-medium tracking-widest uppercase">VẬN HÀNH XƯỞNG LƯU KÝ TUẦN HOÀN</span>
          <span className="text-[#7B766F] hidden sm:inline">•</span>
          <span className="text-[#CBC6C1] hidden sm:inline">BẢO CHỨNG SMART ESCROW &amp; KIỂM ĐỊNH TỰ ĐỘNG</span>
        </div>
        <div className="flex items-center gap-4 text-[#CBC6C1]">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-[#D3C4B0]">verified_user</span>
            Mã vận hành: <strong className="text-white font-mono">#OWNER-01</strong>
          </span>
          <span className="h-3 w-px bg-[#494643] hidden sm:inline"></span>
          <span className="hidden md:flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-[#8FA77B]">sensors</span>
            Thời gian thực: 24 Thiết bị lưu hành
          </span>
        </div>
      </div>

      {/* Horizontal Management Sub-menu */}
      <nav className="w-full bg-[#f7f3ec] border-b border-[#dddad3] px-4 md:px-12 py-2 overflow-x-auto">
        <div className="max-w-[1440px] mx-auto flex items-center gap-2 sm:gap-6 text-xs whitespace-nowrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7B766F] pr-2 border-r border-[#dddad3] hidden sm:inline">
            Shop Management
          </span>
          {shopNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? "font-semibold bg-[#141310] text-white"
                    : "font-medium text-[#4a463f] hover:text-[#1c1c18] hover:bg-[#ebe8e1]"
                }`
              }
            >
              <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default ShopSubNav;
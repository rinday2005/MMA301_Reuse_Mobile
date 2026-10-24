import React from "react";
import { Outlet } from "react-router-dom";
import { ShopHeader } from "./header";
import { ShopSubNav } from "./subnav";

export const ShopOwnerLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="bg-[#fdf9f2] font-sans text-[#1c1c18] min-h-screen flex flex-col antialiased">
      {/* 1. Header cố định */}
      <ShopHeader />

      {/* 2. Main content đẩy lùi theo chiều cao header */}
      <main className="w-full pt-28 bg-[#fdf9f2] flex-1 flex flex-col">
        <ShopSubNav />

        {/* 3. Render các trang con (Outlets) */}
        <div className="w-full flex-1">
          {children ? children : <Outlet />}
        </div>
      </main>
    </div>
  );
};

// Xuất cả default lẫn named export để an toàn cho mọi kiểu import
export default ShopOwnerLayout;
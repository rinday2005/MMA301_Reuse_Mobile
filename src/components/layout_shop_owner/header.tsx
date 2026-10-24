import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";
import { shopHeaderNavLinks, defaultShopProfile } from "../../pages/data/shop/dashboardData";

export const ShopHeader: React.FC = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;

  // Lấy tên từ AuthContext nếu có, fallback về dữ liệu mặc định
  const ownerName = user?.name || user?.username || defaultShopProfile.ownerName;
  const shopName = defaultShopProfile.shopName;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#fdf9f2]/90 backdrop-blur-md shadow-[0_1px_8px_rgba(41,39,36,0.04)]">
      {/* Top Banner Thông báo */}
      <div className="bg-[#f1ede6] text-[#4a463f] text-[11px] py-1.5 px-4 text-center tracking-widest uppercase border-b border-[#dddad3]">
        ATELIER &amp; SHOP OWNER PORTAL — CIRCULAR INVENTORY &amp; CUSTODY DISPATCH. LISTINGS SUBJECT TO PLATFORM CURATION.
      </div>

      {/* Main Header Bar */}
      <div className="h-20 max-w-[1440px] mx-auto px-5 lg:px-12 flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              alt="ReUse Hub"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1V6JLsXxfjgXnwDSzd38TssfIIE3Cr0WWbet1lgb-U_beNjcoRCQA13LHGkk6oU0rhgkX7lNxD52-v1WA_FBWd1AvLs2xKheTD-tPI52hW9NwtiTFozM5zsBfg3najyF2yqectwBRDvPsQM4_KXX0pzT8HUVLHHP_5F3YSHNCIys59xTn0WGOZv-C_iECWd7LyjUpQ8hKlhxjO0Aoh7ZgyhLr3qWhFBHEwzA3mZ-fNzVtr8FDuRkelCn1s"
            />
            <span className="font-serif text-[22px] text-[#141310] tracking-tight font-medium">
              ReUse Hub
            </span>
          </Link>

          <span className="hidden lg:inline-block w-px h-6 bg-[#dddad3]"></span>

          {/* Navigation link lấy từ dashboardData */}
          <nav className="hidden md:flex items-center gap-6">
            {shopHeaderNavLinks.map((nav) => (
              <NavLink
                key={nav.to}
                to={nav.to}
                className={({ isActive }) =>
                  `text-[13px] uppercase tracking-wider transition-colors ${
                    isActive
                      ? "text-[#141310] border-b-2 border-[#141310] pb-0.5 font-semibold"
                      : "text-[#4a463f] hover:text-[#1c1c18]"
                  }`
                }
              >
                {nav.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User / Shop Actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/notifications"
            className="p-2 text-[#4a463f] hover:text-[#1c1c18] hover:bg-[#f1ede6] transition-colors rounded"
          >
            <span className="material-symbols-outlined text-[20px] block">notifications</span>
          </Link>
          <Link
            to="/chat"
            className="p-2 text-[#4a463f] hover:text-[#1c1c18] hover:bg-[#f1ede6] transition-colors rounded"
          >
            <span className="material-symbols-outlined text-[20px] block">chat</span>
          </Link>
          <Link
            to="/kyc"
            title="KYC Verification"
            className="p-2 text-[#4a463f] hover:text-[#1c1c18] hover:bg-[#f1ede6] transition-colors rounded"
          >
            <span className="material-symbols-outlined text-[20px] block">verified_user</span>
          </Link>

          <div className="h-6 w-px bg-[#dddad3] mx-1"></div>

          <Link
            to="/account-settings"
            className="flex items-center gap-3 py-1.5 px-2 hover:bg-[#f7f3ec] transition-colors rounded"
          >
            <div className="text-right hidden sm:block">
              <div className="text-[15px] font-semibold text-[#141310] leading-tight truncate max-w-[190px]">
                {shopName}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-[#576151] flex items-center justify-end gap-1 font-semibold">
                <span>{ownerName}</span>
                <span className="px-1.5 py-0.5 rounded bg-[#d8e3ce]/60 text-[10px] text-[#576151] font-bold">
                  {defaultShopProfile.roleBadge}
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#141310] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[18px]">person</span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default ShopHeader;
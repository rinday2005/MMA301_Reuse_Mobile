import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
    Search,
    Heart,
    Bell,
    ShoppingBag,
    User,
    Menu,
    X,
    LogOut,
    Package,
    SlidersHorizontal,
    LayoutDashboard,
    Store
} from 'lucide-react';

export type UserRole = 'GUEST' | 'USER' | 'SHOP' | 'ADMIN';

interface HeaderProps {
    userRole?: UserRole;
    wishlistCount?: number;
    notificationCount?: number;
    cartCount?: number;
    onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    userRole = 'GUEST',
    wishlistCount = 0,
    notificationCount = 2,
    cartCount = 0,
    onLogout
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsProfileDropdownOpen(false);
        setIsMobileMenuOpen(false);
        if (onLogout) {
            onLogout();
        }
        navigate('/login');
    };

    return (
        <header className="fixed top-0 w-full z-50">
            {/* Top Announcement Bar */}
            <div className="w-full bg-black text-white py-2 px-4 lg:px-12 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-200">
                    RENT WHAT YOU NEED. REUSE WHAT ALREADY EXISTS. COMPLIMENTARY INSURED SHIPPING ON VERIFIED RENTALS.
                </p>
            </div>

            {/* Main Header Navigation */}
            <div className="h-20 bg-white/95 backdrop-blur-md border-b border-gray-200 transition-colors">
                <div className="max-w-7xl mx-auto h-full px-4 lg:px-12 flex items-center justify-between gap-6">

                    {/* Logo Brand & Nav */}
                    <div className="flex items-center gap-8">
                        <Link className="flex items-center gap-2 text-xl font-bold text-emerald-600 font-serif" to="/">
                            <img
                                src="/src/assets/images/logo.jpg"
                                alt="ReUse Hub Logo"
                                className="h-10 w-auto object-contain"
                                onError={(e) => {
                                    // Fallback nếu chưa có file logo
                                    (e.target as HTMLElement).style.display = 'none';
                                }}
                            />
                            <span className="text-black font-bold">ReUse Hub</span>
                        </Link>

                        {/* Navigation chuyển giữa RENT & THRIFT */}
                        <nav className="hidden md:flex items-center gap-6">
                            <NavLink
                                to="/rent"
                                className={({ isActive }) =>
                                    `text-xs uppercase tracking-wider py-2 transition-colors ${isActive ? 'text-black font-bold border-b-2 border-black' : 'text-gray-600 hover:text-black font-medium'
                                    }`
                                }
                            >
                                RENT
                            </NavLink>
                            <NavLink
                                to="/thrift"
                                className={({ isActive }) =>
                                    `text-xs uppercase tracking-wider py-2 transition-colors ${isActive ? 'text-black font-bold border-b-2 border-black' : 'text-gray-600 hover:text-black font-medium'
                                    }`
                                }
                            >
                                THRIFT
                            </NavLink>
                            <NavLink
                                to="/categories"
                                className={({ isActive }) =>
                                    `text-xs uppercase tracking-wider py-2 transition-colors ${isActive ? 'text-black font-bold border-b-2 border-black' : 'text-gray-600 hover:text-black font-medium'
                                    }`
                                }
                            >
                                CATEGORIES
                            </NavLink>
                        </nav>
                    </div>

                    {/* Search & Actions Icons */}
                    <div className="flex items-center gap-4">
                        {/* Search Input Bar Desktop */}
                        <div className="hidden md:flex items-center relative w-64">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search curated archive..."
                                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-100 border border-gray-300 rounded-sm text-black placeholder-gray-500 focus:outline-none focus:bg-white transition-all"
                            />
                        </div>

                        {/* User Logged In Icons */}
                        {userRole !== 'GUEST' && (
                            <>
                                {/* Wishlist Icon */}
                                <Link aria-label="Wishlist" className="relative p-1 text-gray-600 hover:text-black transition-colors" to="/saved-items">
                                    <Heart className="w-5 h-5" />
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-200 border border-gray-300 text-[10px] leading-tight flex items-center justify-center text-gray-800 font-semibold">
                                        {wishlistCount}
                                    </span>
                                </Link>

                                {/* Notifications Icon (Cập nhật từ <button> sang <Link>) */}
                                <Link aria-label="Notifications" className="relative p-1 text-gray-600 hover:text-black transition-colors" to="/notifications">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black text-white text-[10px] leading-tight flex items-center justify-center font-semibold">
                                        {notificationCount}
                                    </span>
                                </Link>

                                {/* Shopping Bag Icon */}
                                <Link aria-label="Shopping Bag" className="relative p-1 text-gray-600 hover:text-black transition-colors" to="/cart">
                                    <ShoppingBag className="w-5 h-5" />
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-200 border border-gray-300 text-[10px] leading-tight flex items-center justify-center text-gray-800 font-semibold">
                                        {cartCount}
                                    </span>
                                </Link>
                            </>
                        )}

                        {/* Member Profile Avatar Dropdown HOẶC Nút Login cho GUEST */}
                        {userRole === 'GUEST' ? (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="text-xs font-semibold uppercase tracking-wider text-gray-700 hover:text-black px-3 py-2 transition-colors"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="text-xs font-semibold uppercase tracking-wider bg-black text-white px-3 py-2 rounded-sm hover:bg-gray-800 transition-colors"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        ) : (
                            <div className="relative ml-1" ref={dropdownRef}>
                                <button
                                    aria-label="Member Profile Menu"
                                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                    className="flex items-center focus:outline-none group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center transition-transform group-hover:scale-105">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                </button>

                                {/* Avatar Dropdown Menu */}
                                {isProfileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-xs font-semibold text-gray-900">Tài khoản của tôi</p>
                                            <p className="text-[11px] text-gray-500 uppercase font-medium mt-0.5">Role: {userRole}</p>
                                        </div>

                                        <Link
                                            to="/account-settings"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                                            Hồ sơ cá nhân
                                        </Link>

                                        <Link
                                            to="/my-orders"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Package className="w-4 h-4 text-gray-500" />
                                            Đơn hàng của tôi
                                        </Link>

                                        {/* Quick Link dành riêng cho Shop Owner / Admin trong Dropdown */}
                                        {userRole === 'SHOP' && (
                                            <Link
                                                to="/shop/inventory"
                                                onClick={() => setIsProfileDropdownOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-xs text-emerald-700 font-semibold hover:bg-emerald-50 transition-colors"
                                            >
                                                <Store className="w-4 h-4 text-emerald-600" />
                                                Trang quản lý Shop
                                            </Link>
                                        )}

                                        {userRole === 'ADMIN' && (
                                            <Link
                                                to="/admin/dashboard"
                                                onClick={() => setIsProfileDropdownOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-xs text-indigo-700 font-semibold hover:bg-indigo-50 transition-colors"
                                            >
                                                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                                                Trang Admin
                                            </Link>
                                        )}

                                        <div className="border-t border-gray-100 my-1"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left"
                                        >
                                            <LogOut className="w-4 h-4 text-red-500" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-1 text-gray-600 hover:text-black focus:outline-none"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-3">
                    <input
                        type="text"
                        placeholder="Search curated archive..."
                        className="w-full px-3 py-2 text-xs bg-gray-100 border border-gray-300 rounded-sm"
                    />
                    <div className="flex flex-col space-y-2 pt-2">
                        <Link to="/rent" onClick={() => setIsMobileMenuOpen(false)} className="text-xs uppercase font-bold text-gray-700 hover:text-black py-1">RENT</Link>
                        <Link to="/thrift" onClick={() => setIsMobileMenuOpen(false)} className="text-xs uppercase font-bold text-black py-1">THRIFT</Link>
                        <Link to="/categories" onClick={() => setIsMobileMenuOpen(false)} className="text-xs uppercase font-bold text-gray-700 hover:text-black py-1">CATEGORIES</Link>

                        {userRole !== 'GUEST' ? (
                            <div className="pt-2 border-t border-gray-100 flex flex-col space-y-2">
                                <Link to="/account-settings" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-medium text-gray-700 hover:text-black py-1">
                                    Hồ sơ cá nhân
                                </Link>
                                <Link to="/my-orders" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-medium text-gray-700 hover:text-black py-1">
                                    Đơn hàng của tôi
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700 py-1 text-left cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <div className="pt-2 border-t border-gray-100 flex items-center gap-3">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-xs font-bold text-gray-700 hover:text-black py-1"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 py-1"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
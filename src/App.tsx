import { useContext } from "react";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Unauthorized from "./pages/errors/Unauthorized";
import Home from "./pages/home/Home";
import HowItWorks from "./pages/home/HowItWorks";
import AboutPage from "./pages/home/About";
import FaqPage from "./pages/home/FAQ";
import ContactPage from "./pages/home/Contact";
import RentMarketplace from "./pages/rent/marketplace/RentMarketplace";
import RentOrderDetail from "./pages/rent/orders/RentOrderDetail";
import ThriftMarketplace from "./pages/thrift/marketplace/ThriftMarketplace";
import ThriftDetail from "./pages/thrift/detail/ThriftDetail";

import PublicRoutes from "./routes/PublicRoutes";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import { MasterLayout } from "./components/layout/MasterLayout";
import { AuthContext } from "./context/auth-context";
import { NavigationLoader } from "./components/common/NavigationLoader";
import { ScrollRevealManager } from "./components/common/ScrollRevealManager";

// Context & Layout của Shop Owner
import { ShopProvider } from "./context/ShopContext";
import { ShopOwnerLayout } from "./components/layout_shop_owner/ownerlayout";

// 7 Trang Shop Owner thực tế của D
import { ShopDashboard } from "./pages/rent/shop/ShopDashboard";
import { ManageRentProducts } from "./pages/rent/shop/ManageRentProducts";
import { CreateRentProduct } from "./pages/rent/shop/CreateRentProduct";
import { RentProductDetail } from "./pages/rent/shop/RentProductDetail";
import { EditRentProduct } from "./pages/rent/shop/EditRentProduct";
import { InventoryDashboard } from "./pages/rent/shop/InventoryDashboard";
import { RentInventoryDetail } from "./pages/rent/shop/RentInventoryDetail";

// Component Wrapper tự động nhận diện Role thực tế từ Auth Context
const AppLayout = ({ role }: { role?: 'GUEST' | 'USER' | 'SHOP' | 'ADMIN' }) => {
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const getMappedRole = (rawRole?: string) => {
    if (rawRole === 'SHOP_OWNER' || rawRole === 'SHOP') return 'SHOP';
    if (rawRole === 'CUSTOMER' || rawRole === 'USER') return 'USER';
    if (rawRole === 'ADMIN') return 'ADMIN';
    return undefined;
  };

  const activeRole = getMappedRole(user?.role) || role || 'GUEST';

  return (
    <MasterLayout userRole={activeRole} onLogout={auth?.logout}>
      <Outlet />
    </MasterLayout>
  );
};

// ── Placeholder Pages cho Sàn Chung ──
const CategoriesPage = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h1 className="text-2xl font-bold text-gray-800">Danh Mục Sản Phẩm</h1>
  </div>
);

const SavedItemsPage = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h1 className="text-2xl font-bold text-gray-800">Danh Sách Yêu Thích (Wishlist)</h1>
  </div>
);

const NotificationsPage = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h1 className="text-2xl font-bold text-gray-800">Thông Báo Của Tôi</h1>
  </div>
);

const CartPage = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h1 className="text-2xl font-bold text-gray-800">Giỏ Hàng (Cart)</h1>
  </div>
);

const AccountSettingsPage = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h1 className="text-2xl font-bold text-gray-800">Hồ Sơ Cá Nhân & Cài Đặt</h1>
  </div>
);

const MyOrdersPage = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h1 className="text-2xl font-bold text-gray-800">Đơn Hàng Của Tôi</h1>
  </div>
);

const CategoryDetailPage = ({ name }: { name: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h1 className="text-2xl font-bold text-gray-800">Danh Mục: {name}</h1>
    <p className="mt-4 text-gray-600">Khám phá sản phẩm trong danh mục {name}.</p>
  </div>
);

const UserDashboard = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
  </div>
);

const AdminDashboard = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
  </div>
);

const App = () => {
  return (
    <>
      <NavigationLoader />
      <ScrollRevealManager />
      <Routes>
        {/* 1. Public routes không có MasterLayout */}
        <Route element={<PublicRoutes />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* 2. Shop Owner Module - Được bọc riêng ShopProvider và ShopOwnerLayout (Không dùng MasterLayout) */}
        <Route
          element={
            <ShopProvider>
              <ShopOwnerLayout />
            </ShopProvider>
          }
        >
          <Route path="/shop" element={<ShopDashboard />} />
          <Route path="/shop/dashboard" element={<ShopDashboard />} />
          <Route path="/shop/rent/products" element={<ManageRentProducts />} />
          <Route path="/shop/rent-products" element={<ManageRentProducts />} />
          <Route path="/shop/rent/create" element={<CreateRentProduct />} />
          <Route path="/shop/rent/products/create" element={<CreateRentProduct />} />
          <Route path="/shop/rent/products/:id" element={<RentProductDetail />} />
          <Route path="/shop/rent/edit/:id" element={<EditRentProduct />} />
          <Route path="/shop/rent/inventory" element={<InventoryDashboard />} />
          <Route path="/shop/inventory" element={<InventoryDashboard />} />
          <Route path="/shop/rent/inventory/:itemId" element={<RentInventoryDetail />} />
        </Route>

        {/* 3. Browsing Routes dùng MasterLayout */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/rent" element={<RentMarketplace />} />
          <Route path="/rent/marketplace" element={<RentMarketplace />} />
          <Route path="/rent/products/:id" element={<RentOrderDetail />} />
          <Route path="/rent/orders/:id" element={<RentOrderDetail />} />
          <Route path="/rent/orders" element={<RentOrderDetail />} />
          <Route path="/rent/detail/:id" element={<RentOrderDetail />} />
          <Route path="/thrift" element={<ThriftMarketplace />} />
          <Route path="/thrift/marketplace" element={<ThriftMarketplace />} />
          <Route path="/thrift/:id" element={<ThriftDetail />} />
          <Route path="/thrift/products/:id" element={<ThriftDetail />} />
          <Route path="/thrift/detail/:id" element={<ThriftDetail />} />
          <Route path="/categories" element={<CategoriesPage />} />

          {/* Routes cho các Icon trên Header & Profile Dropdown */}
          <Route path="/saved-items" element={<SavedItemsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/account-settings" element={<AccountSettingsPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />

          {/* Routes Hệ sinh thái */}
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Routes Danh mục tuần hoàn */}
          <Route path="/categories/cameras" element={<CategoryDetailPage name="Camera & Lens" />} />
          <Route path="/categories/fashion" element={<CategoryDetailPage name="Trang phục sự kiện" />} />
          <Route path="/categories/camping" element={<CategoryDetailPage name="Đồ cắm trại" />} />
          <Route path="/categories/shoes" element={<CategoryDetailPage name="Giày dép & Da" />} />
          <Route path="/categories/electronics" element={<CategoryDetailPage name="Thiết bị âm thanh" />} />
          <Route path="/categories/lifestyle" element={<CategoryDetailPage name="Đồ trang trí & Setup" />} />
        </Route>

        {/* 4. User Protected Routes */}
        <Route element={<ProtectedRoutes allowedRoles={["USER"]} />}>
          <Route element={<AppLayout role="USER" />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
          </Route>
        </Route>

        {/* 5. Admin Protected Routes */}
        <Route element={<ProtectedRoutes allowedRoles={["ADMIN"]} />}>
          <Route element={<AppLayout role="ADMIN" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/listings" element={<AdminDashboard />} />
            <Route path="/admin/kyc" element={<AdminDashboard />} />
            <Route path="/admin/disputes" element={<AdminDashboard />} />
            <Route path="/admin/finance" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* 6. Error & Fallback Routes */}
        <Route path="/403" element={<Unauthorized />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

export default App;
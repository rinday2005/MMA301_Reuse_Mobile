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
import { AuthContext } from "./context/auth-context"; // [FE-S1-07-h] Kiểm tra đúng đường dẫn auth-context trong dự án của bạn
import { NavigationLoader } from "./components/common/NavigationLoader";
import { ScrollRevealManager } from "./components/common/ScrollRevealManager";

// Component Wrapper tự động nhận diện Role thực tế từ Auth Context
const AppLayout = ({ role }: { role?: 'GUEST' | 'USER' | 'SHOP' | 'ADMIN' }) => {
  const auth = useContext(AuthContext);
  const user = auth?.user;

  // [FE-S1-07-h] Mapping role từ Backend về định dạng Role của MasterLayout
  const getMappedRole = (rawRole?: string) => {
    if (rawRole === 'SHOP_OWNER' || rawRole === 'SHOP') return 'SHOP';
    if (rawRole === 'CUSTOMER' || rawRole === 'USER') return 'USER';
    if (rawRole === 'ADMIN') return 'ADMIN';
    return undefined;
  };

  // Ưu tiên Role thực tế người dùng đăng nhập > Role truyền từ Route > Mặc định 'GUEST'
  const activeRole = getMappedRole(user?.role) || role || 'GUEST';

  return (
    <MasterLayout userRole={activeRole} onLogout={auth?.logout}>
      <Outlet />
    </MasterLayout>
  );
};

// --- [FE-S1-07-h] Placeholder Pages phục vụ cho Header & Navigation Demo ---

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


// ── Danh mục Pages ──
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

const ShopDashboard = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h1 className="text-2xl font-bold text-gray-800">Shop Owner Dashboard</h1>
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

        {/* 2. [FE-S1-07-h] Browsing Routes dùng MasterLayout (Truy cập tự do, không bị ép quay về /login) */}
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

        {/* 3. User Protected Routes */}
        <Route element={<ProtectedRoutes allowedRoles={["USER"]} />}>
          <Route element={<AppLayout role="USER" />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
          </Route>
        </Route>

        {/* 4. Shop Owner Protected Routes (Có Sidebar Shop) */}
        <Route element={<ProtectedRoutes allowedRoles={["SHOP_OWNER"]} />}>
          <Route element={<AppLayout role="SHOP" />}>
            <Route path="/shop/dashboard" element={<ShopDashboard />} />
            <Route path="/shop/inventory" element={<ShopDashboard />} />
            <Route path="/shop/rent/create" element={<ShopDashboard />} />
            <Route path="/shop/orders" element={<ShopDashboard />} />
          </Route>
        </Route>

        {/* 5. Admin Protected Routes (Có Sidebar Admin) */}
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
import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Unauthorized from "./pages/errors/Unauthorized";

import PublicRoutes from "./routes/PublicRoutes";
import ProtectedRoutes from "./routes/ProtectedRoutes";

const Home = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-semibold">ReUse Hub</h1>
    </div>
  );
};

const UserDashboard = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-semibold">
        User Dashboard
      </h1>
    </div>
  );
};

const ShopDashboard = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-semibold">
        Shop Owner Dashboard
      </h1>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-semibold">
        Admin Dashboard
      </h1>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Common protected routes */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* User routes */}
      <Route
        element={
          <ProtectedRoutes allowedRoles={["USER"]} />
        }
      >
        <Route path="/user/dashboard" element={<UserDashboard />} />
      </Route>

      {/* Shop Owner routes */}
      <Route
        element={
          <ProtectedRoutes allowedRoles={["SHOP_OWNER"]} />
        }
      >
        <Route
          path="/shop/dashboard"
          element={<ShopDashboard />}
        />
      </Route>

      {/* Admin routes */}
      <Route
        element={
          <ProtectedRoutes allowedRoles={["ADMIN"]} />
        }
      >
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />
      </Route>

      {/* 403 */}
      <Route path="/403" element={<Unauthorized />} />

      {/* Not found */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default App;
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

type Role = "USER" | "SHOP_OWNER" | "ADMIN";

interface ProtectedRoutesProps {
  allowedRoles?: Role[];
}

const ProtectedRoutes = ({ allowedRoles }: ProtectedRoutesProps) => {
  const { token, user } = useAuth();
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
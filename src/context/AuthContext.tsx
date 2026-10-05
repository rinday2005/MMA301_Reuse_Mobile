import { useState } from "react";
import type { ReactNode } from "react";
import { loginApi } from "../services/auth.api";
import { AuthContext } from "./auth-context";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (data: Parameters<typeof loginApi>[0]) => {
    const result = await loginApi(data);

    localStorage.setItem("token", result.accessToken);
    localStorage.setItem("user", JSON.stringify(result.user));

    setToken(result.accessToken);
    setUser(result.user);

    return result.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
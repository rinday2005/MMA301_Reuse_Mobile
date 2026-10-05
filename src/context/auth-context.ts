import { createContext } from "react";
import type { LoginRequest, User } from "../services/auth.api";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: LoginRequest) => Promise<User>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
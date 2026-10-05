import api from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "USER" | "SHOP_OWNER" | "ADMIN";
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export const loginApi = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", data);

  return response.data.data;
};
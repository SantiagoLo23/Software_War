import { UserRole } from "@/types";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  username: string;
  sub: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export const authHelper = {
  saveToken: (token: string) => {
    localStorage.setItem("token", token);
  },

  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  removeToken: () => {
    localStorage.removeItem("token");
  },

  decodeToken: (token: string): JWTPayload | null => {
    try {
      return jwtDecode<JWTPayload>(token);
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    const token = authHelper.getToken();
    if (!token) return false;

    const decoded = authHelper.decodeToken(token);
    if (!decoded) return false;

    const now = Date.now() / 1000;
    return decoded.exp > now;
  },

  getUserRole: (): UserRole | null => {
    const token = authHelper.getToken();
    if (!token) return null;

    const decoded = authHelper.decodeToken(token);
    return decoded?.role || null;
  },

  getUserId: (): string | null => {
    const token = authHelper.getToken();
    if (!token) return null;

    const decoded = authHelper.decodeToken(token);
    return decoded?.sub || null;
  },

  getUsername: (): string | null => {
    const token = authHelper.getToken();
    if (!token) return null;

    const decoded = authHelper.decodeToken(token);
    return decoded?.username || null;
  },

  logout: () => {
    authHelper.removeToken();
  },
};

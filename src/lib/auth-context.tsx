"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
export interface UserSession {
  id: number;
  username: string;
  email: string;
  name: string;
  role: "admin" | "kasir" | "user";
  phone?: string | null;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message: string; user?: UserSession }>;
  register: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<{ success: boolean; message: string; user?: UserSession }>;
  quickLogin: (role: "admin" | "kasir" | "user") => Promise<{ success: boolean; message: string; user?: UserSession }>;
  loginWithKey: (uniqueKey: string) => Promise<{ success: boolean; message: string; user?: UserSession; role?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load session from /api/v1/auth/me or localStorage fallback
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/auth/me", { credentials: "include" });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("restosync_user", JSON.stringify(data.user));
      } else {
        // Fallback to localStorage if cookie was cleared or offline
        const local = localStorage.getItem("restosync_user");
        if (local) {
          try {
            setUser(JSON.parse(local));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    } catch {
      const local = localStorage.getItem("restosync_user");
      if (local) {
        try {
          setUser(JSON.parse(local));
        } catch {
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("restosync_user", JSON.stringify(data.user));
        return { success: true, message: data.message, user: data.user };
      } else {
        return { success: false, message: data.message || "Login gagal." };
      }
    } catch {
      return { success: false, message: "Terjadi kesalahan koneksi saat login." };
    }
  };

  const register = async (formData: {
    name: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("restosync_user", JSON.stringify(data.user));
        return { success: true, message: data.message, user: data.user };
      } else {
        return { success: false, message: data.message || "Registrasi gagal." };
      }
    } catch {
      return { success: false, message: "Terjadi kesalahan koneksi saat registrasi." };
    }
  };

  const quickLogin = async (role: "admin" | "kasir" | "user") => {
    try {
      const res = await fetch("/api/v1/auth/quick-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("restosync_user", JSON.stringify(data.user));
        return { success: true, message: data.message, user: data.user };
      } else {
        return { success: false, message: data.message || "Quick login gagal." };
      }
    } catch {
      return { success: false, message: "Terjadi kesalahan koneksi." };
    }
  };

  const loginWithKey = async (uniqueKey: string) => {
    try {
      const res = await fetch("/api/v1/auth/key-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ uniqueKey }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("restosync_user", JSON.stringify(data.user));
        return { success: true, message: data.message, user: data.user, role: data.role };
      } else {
        return { success: false, message: data.message || "Akses Unique Key ditolak." };
      }
    } catch {
      return { success: false, message: "Terjadi kesalahan koneksi saat verifikasi Unique Key." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    setUser(null);
    localStorage.removeItem("restosync_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        quickLogin,
        loginWithKey,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

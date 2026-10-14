import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, UserSession } from "@/lib/auth";

export type Role = "admin" | "kasir" | "user";

export interface AuthResult {
  authorized: boolean;
  user?: UserSession;
  response?: NextResponse;
}

/**
 * Enforces role-based authorization for Next.js Route Handlers.
 * @param request NextRequest instance
 * @param allowedRoles List of roles permitted to access this endpoint
 */
export async function requireAuth(
  request: NextRequest,
  allowedRoles: Role[] = ["admin", "kasir", "user"]
): Promise<AuthResult> {
  const user = await getCurrentUser(request);

  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          code: "UNAUTHORIZED",
          message: "Akses Ditolak: Anda belum terautentikasi. Silakan masuk (login) terlebih dahulu.",
        },
        { status: 401 }
      ),
    };
  }

  if (!allowedRoles.includes(user.role as Role)) {
    const roleLabels: Record<Role, string> = {
      admin: "Administrator",
      kasir: "Staff Kasir",
      user: "Pelanggan VIP",
    };

    const allowedLabels = allowedRoles.map((r) => roleLabels[r] || r).join(" atau ");

    return {
      authorized: false,
      user,
      response: NextResponse.json(
        {
          success: false,
          code: "FORBIDDEN",
          message: `Akses Ditolak: Peran akun Anda (${roleLabels[user.role as Role] || user.role}) tidak memiliki otorisasi untuk tindakan ini. Diperlukan peran: ${allowedLabels}.`,
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user,
  };
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uniqueKey } = body;
    const cleanKey = (uniqueKey || "").trim();

    if (!cleanKey) {
      return NextResponse.json(
        { success: false, message: "Harap masukkan Unique Key otorisasi Anda." },
        { status: 400 }
      );
    }

    // Find user by Unique Key (case-insensitive search)
    const user = await prisma.user.findFirst({
      where: {
        uniqueKey: {
          equals: cleanKey,
        },
      },
    });

    if (!user) {
      await prisma.auditLog.create({
        data: {
          user: "Unknown Client",
          action: "KEY_ACCESS_DENIED",
          details: `Percobaan akses ditolak: Unique Key "${cleanKey}" tidak valid.`,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Akses Ditolak: Unique Key tidak valid atau tidak memiliki otorisasi pada sistem L'Étoile Royale.",
        },
        { status: 401 }
      );
    }

    // User verified!
    const sessionPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role as "admin" | "kasir" | "user",
      phone: user.phone,
    };

    const token = createSessionToken(sessionPayload);

    await prisma.auditLog.create({
      data: {
        user: user.name,
        action: "KEY_ACCESS_GRANTED",
        details: `Otorisasi berhasil via Unique Key [${cleanKey}]. Peran: ${user.role.toUpperCase()}`,
      },
    });

    const roleName =
      user.role === "admin"
        ? "General Manager & Executive Chef"
        : user.role === "kasir"
        ? "Maître D' & Kasir Terminal"
        : "VIP Patron Tamu Kehormatan";

    const response = NextResponse.json({
      success: true,
      message: `Akses Diizinkan! Selamat datang, ${user.name} (${roleName})`,
      user: sessionPayload,
      role: user.role,
      token,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Key login error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memverifikasi Unique Key." },
      { status: 500 }
    );
  }
}

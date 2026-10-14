import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role } = body;

    if (!role || !["admin", "kasir", "user"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Role tidak valid. Pilihan: admin, kasir, user." },
        { status: 400 }
      );
    }

    let user = await prisma.user.findFirst({
      where: { role },
      orderBy: { id: "asc" },
    });

    if (!user) {
      // Auto-create default user for this role if not exists
      const defaults: Record<string, any> = {
        admin: {
          username: "admin",
          email: "admin@restosync.com",
          password: "admin123",
          name: "Administrator RestoSync",
          role: "admin",
          phone: "081234567890",
        },
        kasir: {
          username: "kasir",
          email: "kasir@restosync.com",
          password: "kasir123",
          name: "Budi Santoso (Kasir)",
          role: "kasir",
          phone: "081298765432",
        },
        user: {
          username: "user",
          email: "user@restosync.com",
          password: "user123",
          name: "Aditya Pratama (Pelanggan)",
          role: "user",
          phone: "081345678901",
        },
      };

      user = await prisma.user.create({
        data: defaults[role],
      });
    }

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
        action: "QUICK_LOGIN",
        details: `Quick login sebagai role [${user.role.toUpperCase()}]`,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: `Berhasil masuk sebagai ${user.name} (${user.role.toUpperCase()})`,
      user: sessionPayload,
      token,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Quick login error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal melakukan quick login." },
      { status: 500 }
    );
  }
}

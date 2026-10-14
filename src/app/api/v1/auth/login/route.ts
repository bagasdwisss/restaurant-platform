import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, username, email, password } = body;
    const loginId = (identifier || username || email || "").trim();

    if (!loginId || !password) {
      return NextResponse.json(
        { success: false, message: "Username/Email dan Password wajib diisi." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: loginId.toLowerCase() },
          { email: loginId.toLowerCase() },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Akun tidak ditemukan. Periksa kembali username/email Anda." },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Password yang Anda masukkan salah." },
        { status: 401 }
      );
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
        action: "USER_LOGIN",
        details: `Login berhasil sebagai role [${user.role.toUpperCase()}]`,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: `Selamat datang, ${user.name}!`,
      user: sessionPayload,
      token,
    });

    const isHttps = request.headers.get("x-forwarded-proto") === "https" || request.nextUrl.protocol === "https:";

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal melakukan login." },
      { status: 500 }
    );
  }
}

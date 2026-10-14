import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, username, email, password, phone } = body;

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Nama, username, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check existing
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: cleanEmail }],
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            existing.username === cleanUsername
              ? "Username sudah terdaftar. Silakan pilih username lain."
              : "Email sudah terdaftar. Silakan gunakan email lain.",
        },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        role: "user", // Registered accounts are customers/users
        phone: phone ? phone.trim() : null,
      },
    });

    const sessionPayload = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as "admin" | "kasir" | "user",
      phone: newUser.phone,
    };

    const token = createSessionToken(sessionPayload);

    await prisma.auditLog.create({
      data: {
        user: newUser.name,
        action: "USER_REGISTERED",
        details: `Pelanggan baru mendaftar: ${newUser.username} (${newUser.email})`,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: "Registrasi berhasil! Anda sudah masuk ke sistem.",
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
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal melakukan registrasi." },
      { status: 500 }
    );
  }
}

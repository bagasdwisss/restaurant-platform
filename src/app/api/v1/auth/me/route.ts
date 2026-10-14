import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hashPassword, verifyPassword, createSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        user: null,
      });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      user: null,
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid atau telah kedaluwarsa." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, oldPassword, newPassword } = body;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan di database." },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (name && typeof name === "string" && name.trim().length > 0) {
      updateData.name = name.trim();
    }

    if (phone !== undefined) {
      updateData.phone = typeof phone === "string" ? phone.trim() : null;
    }

    // Password change verification
    if (newPassword) {
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: "Password baru minimal terdiri dari 6 karakter." },
          { status: 400 }
        );
      }

      if (!oldPassword) {
        return NextResponse.json(
          { success: false, message: "Wajib memasukkan password lama untuk verifikasi keamanan." },
          { status: 400 }
        );
      }

      const isOldValid = verifyPassword(oldPassword, dbUser.password);
      if (!isOldValid) {
        return NextResponse.json(
          { success: false, message: "Password lama yang Anda masukkan salah." },
          { status: 400 }
        );
      }

      updateData.password = hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        phone: true,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        user: updatedUser.name,
        action: newPassword ? "USER_PASSWORD_CHANGED" : "USER_PROFILE_UPDATED",
        details: `Pengguna ${updatedUser.username} memperbarui profil akun (${Object.keys(updateData).join(", ")})`,
      },
    });

    // Refresh auth cookie
    const token = createSessionToken(updatedUser as any);
    const response = NextResponse.json({
      success: true,
      message: newPassword
        ? "Profil dan password baru berhasil disimpan dengan aman!"
        : "Profil berhasil diperbarui!",
      user: updatedUser,
    });

    response.cookies.set("restosync_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui profil pengguna." },
      { status: 500 }
    );
  }
}

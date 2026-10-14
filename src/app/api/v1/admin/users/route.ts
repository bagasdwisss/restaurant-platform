import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Hanya Admin yang dapat mengakses data user." },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            shifts: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat data pengguna." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Hanya Admin yang dapat menambahkan staff/user." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, username, email, password, role = "user", phone } = body;

    if (!name || !username || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "Semua data wajib diisi (Nama, Username, Email, Password, Role)." },
        { status: 400 }
      );
    }

    if (!["admin", "kasir", "user"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Role tidak valid. Pilihan: admin, kasir, user." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: cleanEmail }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Username atau email sudah digunakan." },
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
        role,
        phone: phone ? phone.trim() : null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        user: currentUser.name,
        action: "USER_CREATED_BY_ADMIN",
        details: `Admin menambahkan akun baru: ${newUser.name} [Role: ${newUser.role.toUpperCase()}]`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Akun ${newUser.name} dengan role ${role.toUpperCase()} berhasil dibuat.`,
      data: newUser,
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membuat pengguna." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID pengguna tidak valid." },
        { status: 400 }
      );
    }

    if (id === currentUser.id) {
      return NextResponse.json(
        { success: false, message: "Anda tidak dapat menghapus akun Anda sendiri saat sedang aktif." },
        { status: 400 }
      );
    }

    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (!userToDelete) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.user.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        user: currentUser.name,
        action: "USER_DELETED_BY_ADMIN",
        details: `Admin menghapus akun: ${userToDelete.name} (${userToDelete.username})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Pengguna ${userToDelete.name} berhasil dihapus.`,
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus pengguna." },
      { status: 500 }
    );
  }
}

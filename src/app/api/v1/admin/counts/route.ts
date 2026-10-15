import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["admin"]);
    if (!auth.authorized) return auth.response!;

    const [menus, tables, ingredients, vouchers, users] = await Promise.all([
      prisma.menu.count(),
      prisma.table.count(),
      prisma.ingredient.count(),
      prisma.voucher.count(),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        menus,
        tables,
        ingredients,
        vouchers,
        users,
      },
    });
  } catch (error: any) {
    console.error("Error fetching admin counts:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat ringkasan jumlah data." },
      { status: 500 }
    );
  }
}

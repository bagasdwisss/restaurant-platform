import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["admin"]);
    if (!auth.authorized) return auth.response!;

    const shifts = await prisma.cashierShift.findMany({
      orderBy: { openedAt: "desc" },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: {
        shifts,
        auditLogs,
      },
    });
  } catch (error: any) {
    console.error("Error fetching shift history:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat riwayat shift kasir." },
      { status: 500 }
    );
  }
}

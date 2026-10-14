import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    const whereClause: any = {};
    if (statusFilter) {
      whereClause.status = statusFilter;
    } else {
      whereClause.status = {
        in: ["pending", "confirmed", "preparing", "served"],
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        table: true,
        items: {
          include: {
            menu: true,
          },
        },
        payments: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error("Error fetching active orders:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil pesanan aktif." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qr_token: string }> }
) {
  try {
    const { qr_token } = await params;

    const table = await prisma.table.findUnique({
      where: { qrToken: qr_token },
      include: {
        orders: {
          where: {
            status: {
              in: ["pending", "confirmed", "preparing", "served"],
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            items: {
              include: {
                menu: true,
              },
            },
          },
        },
      },
    });

    if (!table) {
      return NextResponse.json(
        { success: false, message: "Meja tidak ditemukan atau QR Token tidak valid." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        table: {
          id: table.id,
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          status: table.status,
          area: table.area,
          qrToken: table.qrToken,
        },
        activeOrder: table.orders.length > 0 ? table.orders[0] : null,
      },
    });
  } catch (error: any) {
    console.error("Error fetching table:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memproses request meja." },
      { status: 500 }
    );
  }
}

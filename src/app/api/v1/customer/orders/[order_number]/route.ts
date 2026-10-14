import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ order_number: string }> }
) {
  try {
    const { order_number } = await params;

    const order = await prisma.order.findUnique({
      where: { orderNumber: order_number },
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

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Pesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error("Error fetching order status:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil status pesanan." },
      { status: 500 }
    );
  }
}

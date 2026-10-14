import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, tableNumber } = body;

    if (!tableId || !tableNumber) {
      return NextResponse.json(
        { success: false, message: "ID atau Nomor Meja tidak valid." },
        { status: 400 }
      );
    }

    const waiterCall = await prisma.waiterCall.create({
      data: {
        tableId: Number(tableId),
        tableNumber: String(tableNumber),
        status: "pending",
      },
    });

    await prisma.auditLog.create({
      data: {
        user: `Tamu ${tableNumber}`,
        action: "WAITER_CALLED",
        details: `${tableNumber} memanggil pelayan / meminta bantuan.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pelayan telah dipanggil dan sedang menuju meja Anda.",
      data: waiterCall,
    });
  } catch (error: any) {
    console.error("Error calling waiter:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memanggil pelayan." },
      { status: 500 }
    );
  }
}

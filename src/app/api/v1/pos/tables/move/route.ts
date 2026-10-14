import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromTableId, toTableId } = body;

    if (!fromTableId || !toTableId || fromTableId === toTableId) {
      return NextResponse.json(
        { success: false, message: "ID Meja asal dan meja tujuan harus valid dan berbeda." },
        { status: 400 }
      );
    }

    const [fromTable, toTable] = await Promise.all([
      prisma.table.findUnique({ where: { id: parseInt(fromTableId) } }),
      prisma.table.findUnique({ where: { id: parseInt(toTableId) } }),
    ]);

    if (!fromTable || !toTable) {
      return NextResponse.json(
        { success: false, message: "Meja asal atau meja tujuan tidak ditemukan." },
        { status: 404 }
      );
    }

    if (toTable.status === "occupied") {
      return NextResponse.json(
        { success: false, message: `Meja ${toTable.tableNumber} sedang terisi (Occupied). Pilih meja lain.` },
        { status: 400 }
      );
    }

    // Find active order on fromTable
    const activeOrder = await prisma.order.findFirst({
      where: {
        tableId: fromTable.id,
        status: { in: ["pending", "confirmed", "preparing", "served"] },
      },
    });

    if (!activeOrder) {
      return NextResponse.json(
        { success: false, message: `Tidak ada pesanan aktif di ${fromTable.tableNumber}.` },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Move order to new table
      await tx.order.update({
        where: { id: activeOrder.id },
        data: { tableId: toTable.id },
      });

      // 2. Set new table to occupied
      await tx.table.update({
        where: { id: toTable.id },
        data: { status: "occupied" },
      });

      // 3. Set old table to available
      await tx.table.update({
        where: { id: fromTable.id },
        data: { status: "available" },
      });

      await tx.auditLog.create({
        data: {
          user: "Kasir",
          action: "TABLE_MOVED",
          details: `Pesanan ${activeOrder.orderNumber} dipindahkan dari ${fromTable.tableNumber} ke ${toTable.tableNumber}.`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil memindahkan tagihan dari ${fromTable.tableNumber} ke ${toTable.tableNumber}.`,
    });
  } catch (error: any) {
    console.error("Error moving table:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memindahkan meja." },
      { status: 500 }
    );
  }
}

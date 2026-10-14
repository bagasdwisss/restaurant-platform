import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, tableNumber, orderNumber, type = "call", notes, customerName } = body;

    let resolvedTableId: number | null = tableId ? Number(tableId) : null;
    let resolvedTableNumber: string | null = tableNumber ? String(tableNumber) : null;

    // 1. If tableNumber is missing but tableId is provided, resolve table from DB
    if (!resolvedTableNumber && resolvedTableId) {
      const table = await prisma.table.findUnique({
        where: { id: resolvedTableId },
        select: { id: true, tableNumber: true },
      });
      if (table) {
        resolvedTableNumber = table.tableNumber;
      }
    }

    // 2. If tableId is missing but tableNumber is provided, resolve table from DB
    if (!resolvedTableId && resolvedTableNumber) {
      const table = await prisma.table.findFirst({
        where: {
          OR: [
            { tableNumber: resolvedTableNumber },
            { tableNumber: { equals: resolvedTableNumber, mode: "insensitive" } },
          ],
        },
        select: { id: true, tableNumber: true },
      });
      if (table) {
        resolvedTableId = table.id;
        resolvedTableNumber = table.tableNumber;
      }
    }

    // 3. Fallback: If both missing or tableId not resolved, resolve from orderNumber
    if ((!resolvedTableId || !resolvedTableNumber) && orderNumber) {
      const order = await prisma.order.findUnique({
        where: { orderNumber: String(orderNumber) },
        include: { table: true },
      });
      if (order?.table) {
        resolvedTableId = order.table.id;
        resolvedTableNumber = order.table.tableNumber;
      }
    }

    // 4. Validate resolved identifiers
    if (!resolvedTableId || !resolvedTableNumber) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_TABLE",
          message: "Informasi meja tidak valid atau meja tidak ditemukan dalam sistem restoran.",
        },
        { status: 400 }
      );
    }

    // Create active waiter call record
    const waiterCall = await prisma.waiterCall.create({
      data: {
        tableId: resolvedTableId,
        tableNumber: resolvedTableNumber,
        status: "pending",
      },
    });

    // Record audit log asynchronously
    const callerDesc = customerName ? `${customerName} (${resolvedTableNumber})` : `Meja ${resolvedTableNumber}`;
    const callDetail = notes
      ? `Panggilan pelayan dari Meja ${resolvedTableNumber}: ${notes}`
      : `Meja ${resolvedTableNumber} memanggil pelayan / meminta bantuan layanan meja.`;

    prisma.auditLog
      .create({
        data: {
          user: callerDesc,
          action: "WAITER_CALLED",
          details: callDetail,
        },
      })
      .catch((err) => console.error("Non-fatal audit log error:", err));

    return NextResponse.json({
      success: true,
      message: `Sinyal panggilan terkirim! Pelayan SAVORIA segera menuju ke Meja ${resolvedTableNumber}.`,
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

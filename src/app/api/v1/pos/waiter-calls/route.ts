import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const calls = await prisma.waiterCall.findMany({
      where: {
        status: { in: ["pending", "in_progress"] },
      },
      include: {
        table: {
          select: {
            id: true,
            tableNumber: true,
            area: true,
            capacity: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: calls,
    });
  } catch (error: any) {
    console.error("Error fetching waiter calls:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat panggilan pelayan." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status = "completed", cashierName = "Kasir" } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID panggilan diperlukan." },
        { status: 400 }
      );
    }

    const updatedStatus = ["in_progress", "completed", "pending"].includes(status)
      ? status
      : "completed";

    const call = await prisma.waiterCall.update({
      where: { id: parseInt(id) },
      data: { status: updatedStatus },
      include: { table: true },
    });

    // Record audit log
    const actionDesc =
      updatedStatus === "in_progress"
        ? `Kasir (${cashierName}) menanggapi panggilan Meja ${call.tableNumber} (Sedang menuju meja).`
        : `Kasir (${cashierName}) menyelesaikan pelayanan Meja ${call.tableNumber}.`;

    prisma.auditLog
      .create({
        data: {
          user: cashierName,
          action: updatedStatus === "in_progress" ? "WAITER_ATTENDING" : "WAITER_COMPLETED",
          details: actionDesc,
        },
      })
      .catch((err) => console.error("Non-fatal audit log error:", err));

    return NextResponse.json({
      success: true,
      message:
        updatedStatus === "in_progress"
          ? `Panggilan Meja ${call.tableNumber} ditanggapi! Pelayan sedang menuju meja.`
          : `Pelayanan Meja ${call.tableNumber} telah ditandai selesai.`,
      data: call,
    });
  } catch (error: any) {
    console.error("Error updating waiter call:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui panggilan pelayan." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return PATCH(request);
}


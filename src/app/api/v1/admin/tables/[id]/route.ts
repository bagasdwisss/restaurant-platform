import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { requireAuth } from "@/lib/rbac";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request, ["admin"]);
    if (!auth.authorized) return auth.response!;

    const { id } = await params;
    const tableId = parseInt(id);
    const body = await request.json();
    const { tableNumber, capacity, area, status, regenerateQr } = body;

    const dataToUpdate: any = {};
    if (tableNumber !== undefined) dataToUpdate.tableNumber = tableNumber;
    if (capacity !== undefined) dataToUpdate.capacity = parseInt(capacity);
    if (area !== undefined) dataToUpdate.area = area;
    if (status !== undefined) dataToUpdate.status = status;
    if (regenerateQr) {
      const randomHash = crypto.randomBytes(8).toString("hex");
      dataToUpdate.qrToken = `resto-tbl-${(tableNumber || "tbl").toLowerCase().replace(/\s+/g, "-")}-${randomHash}`;
    }

    const updated = await prisma.table.update({
      where: { id: tableId },
      data: dataToUpdate,
    });

    await prisma.auditLog.create({
      data: {
        user: auth.user?.name || "Admin",
        action: "TABLE_UPDATED",
        details: `Meja #${tableId} (${updated.tableNumber}) diperbarui.${regenerateQr ? " QR Token baru digenerate." : ""}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data meja berhasil diperbarui.",
      data: updated,
    });
  } catch (error: any) {
    console.error("Error updating table:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui meja." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request, ["admin"]);
    if (!auth.authorized) return auth.response!;

    const { id } = await params;
    const tableId = parseInt(id);

    const deleted = await prisma.table.delete({
      where: { id: tableId },
    });

    await prisma.auditLog.create({
      data: {
        user: "Admin",
        action: "TABLE_DELETED",
        details: `Meja dihapus: ${deleted.tableNumber}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Meja berhasil dihapus.",
    });
  } catch (error: any) {
    console.error("Error deleting table:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus meja." },
      { status: 500 }
    );
  }
}

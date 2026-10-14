import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (user && user.role !== "kasir" && user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          code: "FORBIDDEN",
          message: "Akses Ditolak: Hanya staf kasir atau admin yang dapat melakukan void pesanan.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const orderId = parseInt(id);
    const body = await request.json();
    const { supervisor_pin, supervisorPin, reason, itemId } = body;
    const pin = supervisorPin || supervisor_pin;

    const validPin = process.env.SUPERVISOR_PIN || "123456";
    if (String(pin) !== String(validPin)) {
      return NextResponse.json(
        { success: false, message: "PIN Supervisor salah! Akses Void ditolak." },
        { status: 403 }
      );
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Alasan pembatalan (Void Reason) wajib diisi." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        table: true,
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Pesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (itemId) {
        // Void specific item
        await tx.orderItem.update({
          where: { id: parseInt(itemId) },
          data: {
            isVoided: true,
            voidReason: reason,
          },
        });

        // Recalculate order totals for non-voided items
        const remainingItems = await tx.orderItem.findMany({
          where: { orderId: order.id, isVoided: false },
        });

        const newSubtotal = remainingItems.reduce((acc, it) => acc + it.subtotal, 0);
        const newTax = Math.round(newSubtotal * 0.1);
        const newService = Math.round(newSubtotal * 0.05);
        const newTotal = newSubtotal + newTax + newService;

        const updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: {
            subtotal: newSubtotal,
            taxAmount: newTax,
            serviceCharge: newService,
            totalAmount: newTotal,
            status: remainingItems.length === 0 ? "voided" : order.status,
          },
          include: {
            items: { include: { menu: true } },
            table: true,
          },
        });

        if (remainingItems.length === 0 && order.tableId) {
          await tx.table.update({
            where: { id: order.tableId },
            data: { status: "available" },
          });
        }

        await tx.auditLog.create({
          data: {
            user: "Supervisor (PIN Verified)",
            action: "ITEM_VOIDED",
            details: `Item #${itemId} pada pesanan ${order.orderNumber} dibatalkan. Alasan: ${reason}`,
          },
        });

        return updatedOrder;
      } else {
        // Void entire order
        const voidedOrder = await tx.order.update({
          where: { id: order.id },
          data: {
            status: "voided",
          },
          include: {
            items: { include: { menu: true } },
            table: true,
          },
        });

        if (order.tableId) {
          await tx.table.update({
            where: { id: order.tableId },
            data: { status: "available" },
          });
        }

        await tx.auditLog.create({
          data: {
            user: "Supervisor (PIN Verified)",
            action: "ORDER_VOIDED",
            details: `Pesanan ${order.orderNumber} dibatalkan secara keseluruhan. Alasan: ${reason}`,
          },
        });

        return voidedOrder;
      }
    });

    return NextResponse.json({
      success: true,
      message: itemId ? "Item berhasil di-void." : "Pesanan berhasil di-void.",
      data: updated,
    });
  } catch (error: any) {
    console.error("Error voiding order/item:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memproses void." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { deductInventoryForOrder } from "@/lib/inventory";


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
          message: "Akses Ditolak: Hanya staf kasir atau admin yang dapat memproses pembayaran POS.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const orderId = parseInt(id);
    const body = await request.json();
    const { method = "cash", amountPaid, paymentRef } = body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        table: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Pesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        { success: false, message: "Pesanan ini sudah lunas." },
        { status: 400 }
      );
    }

    const paidNum = parseFloat(amountPaid);
    if (isNaN(paidNum) || paidNum < order.totalAmount) {
      return NextResponse.json(
        {
          success: false,
          message: `Nominal bayar (Rp ${paidNum.toLocaleString("id-ID")}) kurang dari total tagihan (Rp ${order.totalAmount.toLocaleString("id-ID")}).`,
        },
        { status: 400 }
      );
    }

    const changeAmount = method === "cash" ? Math.max(0, paidNum - order.totalAmount) : 0;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create payment record
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          method,
          amountPaid: paidNum,
          changeAmount,
          paymentRef: paymentRef || (method === "qris" ? `QRIS-${Date.now()}` : null),
        },
      });

      // 2. Mark order as paid. If it was served, mark completed as well
      const newStatus = order.status === "served" ? "completed" : order.status;
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "paid",
          paymentMethod: method,
          status: newStatus,
        },
        include: {
          items: {
            include: { menu: true },
          },
          table: true,
          payments: true,
        },
      });

      // 3. If completed and tableId exists, set table to available
      if (newStatus === "completed" && order.tableId) {
        await tx.table.update({
          where: { id: order.tableId },
          data: { status: "available" },
        });
      }

      await tx.auditLog.create({
        data: {
          user: "Kasir",
          action: "PAYMENT_PROCESSED",
          details: `Pembayaran pesanan ${order.orderNumber} via ${method.toUpperCase()} sebesar Rp ${paidNum.toLocaleString("id-ID")} (Kembalian: Rp ${changeAmount.toLocaleString("id-ID")})`,
        },
      });

      return { payment, order: updatedOrder };
    });

    // Auto-deduct inventory using BOM recipes
    deductInventoryForOrder(order.id, user?.name || "Kasir POS").catch((err) =>
      console.error("Non-fatal BOM deduction error in POS:", err)
    );

    return NextResponse.json({
      success: true,
      message: "Pembayaran berhasil diproses!",
      data: result,
    });
  } catch (error: any) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memproses pembayaran." },
      { status: 500 }
    );
  }
}

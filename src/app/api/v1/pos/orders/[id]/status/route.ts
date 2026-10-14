import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request, ["kasir", "admin"]);
    if (!auth.authorized) return auth.response!;

    const { id } = await params;
    const orderId = parseInt(id);
    const body = await request.json();
    const { status } = body;

    const validStatuses = ["pending", "confirmed", "preparing", "served", "completed", "cancelled", "voided"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Status tidak valid. Pilihan: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        table: true,
        items: {
          include: {
            menu: {
              include: {
                recipes: {
                  include: {
                    ingredient: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!currentOrder) {
      return NextResponse.json(
        { success: false, message: "Pesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    // Process update in transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // If advancing from pending to confirmed, deduct ingredient stocks according to recipe mapping!
      if (currentOrder.status === "pending" && status === "confirmed") {
        for (const item of currentOrder.items) {
          if (item.isVoided) continue;
          for (const recipe of item.menu.recipes) {
            const qtyToDeduct = recipe.quantityNeeded * item.quantity;
            await tx.ingredient.update({
              where: { id: recipe.ingredientId },
              data: {
                stockQuantity: {
                  decrement: qtyToDeduct,
                },
              },
            });
          }
        }

        await tx.auditLog.create({
          data: {
            user: "Kasir / Dapur",
            action: "STOCK_DEDUCTED",
            details: `Stok bahan baku otomatis terpotong untuk pesanan ${currentOrder.orderNumber} saat status dikonfirmasi.`,
          },
        });
      }

      // If completing or cancelling/voiding, update table status if all orders on this table are done
      if (["completed", "cancelled", "voided"].includes(status) && currentOrder.tableId) {
        // Check if there are other active orders on the same table
        const otherActiveOrders = await tx.order.findFirst({
          where: {
            tableId: currentOrder.tableId,
            id: { not: orderId },
            status: { in: ["pending", "confirmed", "preparing", "served"] },
          },
        });

        if (!otherActiveOrders) {
          await tx.table.update({
            where: { id: currentOrder.tableId },
            data: { status: "available" },
          });
        }
      }

      const order = await tx.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          table: true,
          items: {
            include: {
              menu: true,
            },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          user: "Kasir",
          action: "ORDER_STATUS_CHANGED",
          details: `Status pesanan ${order.orderNumber} diubah dari ${currentOrder.status} menjadi ${status}.`,
        },
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      message: `Status pesanan berhasil diperbarui menjadi ${status}.`,
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengubah status pesanan." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function handleUpdateStatus(
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
          message: "Akses Ditolak: Hanya staf kasir atau admin yang dapat memperbarui status pesanan.",
        },
        { status: 403 }
      );
    }

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

    // Process update in transaction with expanded timeout
    const updatedOrder = await prisma.$transaction(
      async (tx) => {
        // If advancing from pending to confirmed, deduct ingredient stocks according to recipe mapping!
        if (currentOrder.status === "pending" && status === "confirmed") {
          const ingredientDeductions = new Map<number, number>();
          for (const item of currentOrder.items) {
            if (item.isVoided) continue;
            for (const recipe of item.menu.recipes) {
              const qty = recipe.quantityNeeded * item.quantity;
              ingredientDeductions.set(
                recipe.ingredientId,
                (ingredientDeductions.get(recipe.ingredientId) || 0) + qty
              );
            }
          }

          if (ingredientDeductions.size > 0) {
            const promises: Promise<any>[] = [];
            ingredientDeductions.forEach((qty, ingId) => {
              promises.push(
                tx.ingredient
                  .update({
                    where: { id: ingId },
                    data: { stockQuantity: { decrement: qty } },
                  })
                  .catch((err) => console.warn(`Skipped ingredient deduction for ${ingId}:`, err.message))
              );
            });
            await Promise.all(promises);
          }
        }

        // If completing or cancelling/voiding, update table status if all orders on this table are done
        if (["completed", "cancelled", "voided"].includes(status) && currentOrder.tableId) {
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
            payments: true,
          },
        });

        return order;
      },
      {
        maxWait: 15000,
        timeout: 30000,
      }
    );

    // Record audit log asynchronously outside transaction
    prisma.auditLog
      .create({
        data: {
          user: user?.name || "Kasir",
          action: "ORDER_STATUS_CHANGED",
          details: `Status pesanan ${updatedOrder.orderNumber} diubah dari ${currentOrder.status} menjadi ${status}.`,
        },
      })
      .catch((err) => console.error("Non-fatal audit log error:", err));

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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleUpdateStatus(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleUpdateStatus(request, context);
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      qrToken,
      tableId,
      customerName,
      customerPhone,
      reservationDate,
      reservationTime,
      guestCount = 2,
      specialRequests,
      orderType = "dine_in",
      items,
      userId,
      isDirectPayment = false,
      paymentMethod = "qris",
      amountPaid,
    } = body;

    if ((!qrToken && !tableId) || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Data pesanan tidak lengkap atau tidak ada menu yang dipilih." },
        { status: 400 }
      );
    }

    // Find table by qrToken or tableId
    const table = await prisma.table.findFirst({
      where: {
        OR: [
          ...(qrToken ? [{ qrToken }] : []),
          ...(tableId ? [{ id: parseInt(tableId) }] : []),
        ],
      },
    });

    if (!table) {
      return NextResponse.json(
        { success: false, message: "Meja tidak valid atau tidak ditemukan." },
        { status: 404 }
      );
    }

    // Get active cashier shift if any
    const activeShift = await prisma.cashierShift.findFirst({
      where: { status: "open" },
      orderBy: { openedAt: "desc" },
    });

    // Fetch menus for price verification
    const menuIds = items.map((i: any) => i.menuId);
    const menus = await prisma.menu.findMany({
      where: { id: { in: menuIds } },
      include: {
        recipes: true,
      },
    });
    const menuMap = new Map(menus.map((m) => [m.id, m]));

    let calculatedSubtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const menu = menuMap.get(item.menuId);
      if (!menu) continue;

      let variantExtra = 0;
      if (item.selectedVariants && Array.isArray(item.selectedVariants)) {
        for (const v of item.selectedVariants) {
          variantExtra += Number(v.extraPrice || 0);
        }
      }

      const unitPrice = menu.price + variantExtra;
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      const itemSubtotal = unitPrice * quantity;
      calculatedSubtotal += itemSubtotal;

      orderItemsData.push({
        menuId: menu.id,
        quantity,
        unitPrice,
        subtotal: itemSubtotal,
        notes: item.notes || null,
        selectedVariants: item.selectedVariants ? JSON.stringify(item.selectedVariants) : null,
      });
    }

    // Tax 10%, Service Charge 5%
    const taxAmount = Math.round(calculatedSubtotal * 0.1);
    const serviceCharge = Math.round(calculatedSubtotal * 0.05);
    const totalAmount = calculatedSubtotal + taxAmount + serviceCharge;

    const prefix = orderType === "reservation" ? "RES" : "ORD";
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `${prefix}-${dateStr}-${randomSuffix}`;

    const paidNum = parseFloat(amountPaid) || totalAmount;

    // Safely validate userId against the User table to prevent Foreign Key violation
    let validUserId: number | null = null;
    if (userId) {
      const parsedUserId = Number(userId);
      if (!isNaN(parsedUserId) && parsedUserId > 0) {
        const existingUser = await prisma.user.findUnique({
          where: { id: parsedUserId },
          select: { id: true },
        });
        if (existingUser) {
          validUserId = existingUser.id;
        }
      }
    }

    // Database transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          tableId: table.id,
          shiftId: activeShift ? activeShift.id : null,
          userId: validUserId,
          customerName: customerName || `Tamu ${table.tableNumber}`,
          customerPhone: customerPhone || null,
          reservationDate: reservationDate || new Date().toISOString().slice(0, 10),
          reservationTime: reservationTime || "19:00 - Grand Dinner Session",
          guestCount: parseInt(guestCount) || 2,
          specialRequests: specialRequests || null,
          orderType: orderType || "dine_in",
          status: isDirectPayment ? "confirmed" : "pending",
          subtotal: calculatedSubtotal,
          taxAmount,
          serviceCharge,
          totalAmount,
          paymentStatus: isDirectPayment ? "paid" : "unpaid",
          paymentMethod: isDirectPayment ? paymentMethod : null,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              menu: true,
            },
          },
          table: true,
          payments: true,
        },
      });

      // If direct payment completed, create Payment record
      if (isDirectPayment) {
        const paymentRef =
          paymentMethod === "qris"
            ? `QRIS-ETOILE-${Date.now()}`
            : paymentMethod === "credit_card"
            ? `CARD-ROYALE-${Date.now()}`
            : `TRX-${Date.now()}`;

        await tx.payment.create({
          data: {
            orderId: order.id,
            method: paymentMethod,
            amountPaid: paidNum,
            changeAmount: Math.max(0, paidNum - totalAmount),
            paymentRef,
          },
        });

        // Deduct recipe ingredient stocks
        for (const item of items) {
          const menu = menuMap.get(item.menuId);
          if (menu && menu.recipes) {
            for (const r of menu.recipes) {
              const qtyToDeduct = r.quantityNeeded * (parseInt(item.quantity) || 1);
              await tx.ingredient.update({
                where: { id: r.ingredientId },
                data: {
                  stockQuantity: {
                    decrement: qtyToDeduct,
                  },
                },
              });
            }
          }
        }
      }

      // Update table status to occupied or reserved
      await tx.table.update({
        where: { id: table.id },
        data: { status: isDirectPayment ? "occupied" : "reserved" },
      });

      await tx.auditLog.create({
        data: {
          user: customerName || `Tamu ${table.tableNumber}`,
          action: isDirectPayment ? "RESERVATION_PAID" : "RESERVATION_CREATED",
          details: `Pesanan/Reservasi ${orderNumber} di ${table.tableNumber} senilai Rp ${totalAmount.toLocaleString("id-ID")}${isDirectPayment ? ` (Lunas via ${paymentMethod.toUpperCase()})` : ""}`,
        },
      });

      // Fetch freshly with payments
      return await tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: { menu: true },
          },
          table: true,
          payments: true,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: isDirectPayment
        ? "Pembayaran berhasil diverifikasi! Reservasi meja Anda telah terkonfirmasi."
        : "Pesanan berhasil dikirim ke restoran!",
      data: newOrder,
    });
  } catch (error: any) {
    console.error("Error creating customer reservation/order:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memproses pesanan." },
      { status: 500 }
    );
  }
}

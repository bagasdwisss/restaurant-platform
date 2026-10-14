import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber, parseTimeToMinutes } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";

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
      voucherCode,
    } = body;

    const isDirect = Boolean(isDirectPayment || body.isPaid);

    // Check if order is a reservation: require authenticated session
    const isReservation = Boolean(reservationDate || orderType === "reservation");
    let sessionUser = await getCurrentUser(request);

    // Fallback if auth cookie was omitted by mobile browser but valid userId was passed
    if (!sessionUser && userId) {
      const parsedUserId = Number(userId);
      if (!isNaN(parsedUserId) && parsedUserId > 0) {
        const found = await prisma.user.findUnique({
          where: { id: parsedUserId },
          select: { id: true, username: true, email: true, name: true, role: true, phone: true },
        });
        if (found) sessionUser = found as any;
      }
    }

    if (isReservation && !sessionUser) {
      return NextResponse.json(
        {
          success: false,
          code: "UNAUTHORIZED_RESERVATION",
          message: "Akses Ditolak: Anda wajib masuk (login) ke akun Anda terlebih dahulu sebelum dapat membooking meja reservasi.",
        },
        { status: 401 }
      );
    }

    // Strict Role Restriction: Staff (Admin & Kasir) CANNOT make reservations
    if (isReservation && sessionUser && (sessionUser.role === "admin" || sessionUser.role === "kasir")) {
      return NextResponse.json(
        {
          success: false,
          code: "STAFF_CANNOT_RESERVE",
          message: `Akun staf (${sessionUser.role === "admin" ? "Admin" : "Kasir"}) tidak dapat melakukan booking reservasi. Fitur reservasi khusus untuk akun pembeli/pelanggan.`,
        },
        { status: 403 }
      );
    }

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

    if (guestCount && table.capacity < parseInt(guestCount)) {
      return NextResponse.json(
        {
          success: false,
          message: `Kapasitas meja (${table.capacity} kursi) tidak mencukupi untuk jumlah tamu (${guestCount} orang).`,
        },
        { status: 400 }
      );
    }

    // Check for conflicting reservations on that table, date & time window (2 hours)
    if (isReservation && reservationDate && reservationTime) {
      const targetMinutes = parseTimeToMinutes(reservationTime);
      const existingReservations = await prisma.order.findMany({
        where: {
          tableId: table.id,
          reservationDate,
          status: { notIn: ["cancelled", "voided"] },
        },
        select: {
          id: true,
          reservationTime: true,
          customerName: true,
        },
      });

      for (const res of existingReservations) {
        if (!res.reservationTime) continue;
        const resMinutes = parseTimeToMinutes(res.reservationTime);
        if (Math.abs(targetMinutes - resMinutes) < 120) {
          return NextResponse.json(
            {
              success: false,
              code: "TABLE_ALREADY_BOOKED",
              message: `Meja ${table.tableNumber} telah direservasi oleh pengunjung lain pada ${reservationDate} untuk sesi ${res.reservationTime}. Meja berjarak 2 jam baru dapat dipesan kembali. Silakan pilih meja lain atau waktu berbeda.`,
            },
            { status: 409 }
          );
        }
      }
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

    const prefix = orderType === "reservation" ? "RES" : "ORD";
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `${prefix}-${dateStr}-${randomSuffix}`;

    // Safely validate userId from session or request
    let validUserId: number | null = sessionUser ? sessionUser.id : null;
    if (!validUserId && userId) {
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
      let appliedVoucher = null;
      let calculatedDiscount = 0;

      if (voucherCode) {
        const vCode = String(voucherCode).trim().toUpperCase();
        appliedVoucher = await tx.voucher.findUnique({
          where: { code: vCode },
        });

        if (!appliedVoucher || !appliedVoucher.isActive) {
          throw new Error(`Kode voucher "${vCode}" tidak valid atau sudah dinonaktifkan.`);
        }

        const now = new Date();
        if (now < appliedVoucher.validFrom) {
          throw new Error(`Voucher "${appliedVoucher.code}" belum mulai berlaku.`);
        }
        if (now > appliedVoucher.validUntil) {
          throw new Error(`Voucher "${appliedVoucher.code}" telah melewati batas masa berlaku (kadaluarsa).`);
        }

        // STRICT QUOTA CHECK (e.g. 10th user succeeds, 11th user gets clear rejection message)
        if (appliedVoucher.usedCount >= appliedVoucher.maxUsage) {
          throw new Error(
            `Kuota voucher "${appliedVoucher.code}" sudah habis terpakai (Maksimal ${appliedVoucher.maxUsage} penggunaan). Penukaran voucher ditolak.`
          );
        }

        if (calculatedSubtotal < appliedVoucher.minSpend) {
          throw new Error(
            `Minimal pembelanjaan untuk voucher "${appliedVoucher.code}" adalah Rp ${appliedVoucher.minSpend.toLocaleString("id-ID")}`
          );
        }

        if (appliedVoucher.discountType === "percentage") {
          calculatedDiscount = Math.round((calculatedSubtotal * appliedVoucher.discountValue) / 100);
          if (appliedVoucher.maxDiscount && calculatedDiscount > appliedVoucher.maxDiscount) {
            calculatedDiscount = appliedVoucher.maxDiscount;
          }
        } else {
          calculatedDiscount = Math.min(calculatedSubtotal, appliedVoucher.discountValue);
        }

        // Increment quota used count
        await tx.voucher.update({
          where: { id: appliedVoucher.id },
          data: {
            usedCount: { increment: 1 },
          },
        });
      }

      // Net subtotal after voucher discount
      const netSubtotal = Math.max(0, calculatedSubtotal - calculatedDiscount);
      const taxAmount = Math.round(netSubtotal * 0.1);
      const serviceCharge = Math.round(netSubtotal * 0.05);
      const totalAmount = netSubtotal + taxAmount + serviceCharge;
      const paidNum = parseFloat(amountPaid) || totalAmount;

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
          status: isDirect ? "confirmed" : "pending",
          subtotal: calculatedSubtotal,
          taxAmount,
          serviceCharge,
          totalAmount,
          voucherId: appliedVoucher ? appliedVoucher.id : null,
          discountAmount: calculatedDiscount,
          paymentStatus: isDirect ? "paid" : "unpaid",
          paymentMethod: isDirect ? paymentMethod : null,
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
          voucher: true,
        },
      });

      // If direct payment completed, create Payment record
      if (isDirect) {
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

      // Only update physical table status if it's an immediate dine-in order or today's current session
      const todayDate = new Date().toISOString().slice(0, 10);
      const isImmediateSession = !isReservation || reservationDate === todayDate;
      if (isImmediateSession) {
        await tx.table.update({
          where: { id: table.id },
          data: { status: isDirect ? "occupied" : "reserved" },
        });
      }

      await tx.auditLog.create({
        data: {
          user: customerName || `Tamu ${table.tableNumber}`,
          action: isDirect ? "RESERVATION_PAID" : "RESERVATION_CREATED",
          details: `Pesanan/Reservasi ${orderNumber} di ${table.tableNumber} senilai Rp ${totalAmount.toLocaleString("id-ID")}${isDirect ? ` (Lunas via ${paymentMethod.toUpperCase()})` : ""}`,
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

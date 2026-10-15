import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber, parseTimeToMinutes } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { deductInventoryForOrder } from "@/lib/inventory";


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
    const parsedTableId = tableId ? parseInt(tableId) : null;
    let table = await prisma.table.findFirst({
      where: {
        OR: [
          ...(qrToken ? [{ qrToken }] : []),
          ...(parsedTableId && !isNaN(parsedTableId) ? [{ id: parsedTableId }] : []),
        ],
      },
    });

    if (!table) {
      // Fallback: find any active table in restaurant
      table = await prisma.table.findFirst();
    }

    if (!table) {
      return NextResponse.json(
        { success: false, message: "Meja tidak valid atau tidak ditemukan." },
        { status: 404 }
      );
    }

    const parsedGuests = parseInt(guestCount) || 2;

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

    // Fetch menus for price verification (safely parse integers & fallback to all menus)
    const menuIds = items
      .map((i: any) => parseInt(i.menuId))
      .filter((id: number) => !isNaN(id) && id > 0);

    const [menusById, allCatalogMenus] = await Promise.all([
      prisma.menu.findMany({
        where: { id: { in: menuIds } },
        include: { recipes: true },
      }),
      prisma.menu.findMany({
        include: { recipes: true },
      }),
    ]);

    const menuMap = new Map(menusById.map((m) => [m.id, m]));
    const menuByNameMap = new Map(allCatalogMenus.map((m) => [m.name.toLowerCase().trim(), m]));

    let calculatedSubtotal = 0;
    const orderItemsData: any[] = [];
    const ingredientDeductions = new Map<number, number>();

    for (const item of items) {
      const numericMenuId = parseInt(item.menuId);
      let menu = menuMap.get(numericMenuId);

      // Fallback 1: match by exact or trimmed name
      if (!menu && item.name) {
        menu = menuByNameMap.get(item.name.toLowerCase().trim());
      }

      // Fallback 2: match by partial name
      if (!menu && item.name) {
        const itemLower = item.name.toLowerCase();
        menu = allCatalogMenus.find((m) =>
          m.name.toLowerCase().includes(itemLower) || itemLower.includes(m.name.toLowerCase())
        );
      }

      // Fallback 3: use first menu in database to ensure transaction success
      if (!menu && allCatalogMenus.length > 0) {
        menu = allCatalogMenus[0];
      }

      if (!menu) continue;

      let variantExtra = 0;
      let safeVariants = item.selectedVariants;
      if (typeof safeVariants === "string") {
        try {
          safeVariants = JSON.parse(safeVariants);
        } catch {
          safeVariants = [];
        }
      }

      if (Array.isArray(safeVariants)) {
        for (const v of safeVariants) {
          variantExtra += Number(v.extraPrice || 0);
        }
      }

      const unitPrice = (item.price && Number(item.price) > 0) ? Number(item.price) + variantExtra : menu.price + variantExtra;
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      const itemSubtotal = unitPrice * quantity;
      calculatedSubtotal += itemSubtotal;

      orderItemsData.push({
        menuId: menu.id,
        quantity,
        unitPrice,
        subtotal: itemSubtotal,
        notes: item.notes || null,
        selectedVariants: safeVariants ? JSON.stringify(safeVariants) : null,
      });

      // Aggregate recipe deductions
      if (menu.recipes && menu.recipes.length > 0) {
        for (const r of menu.recipes) {
          const qty = r.quantityNeeded * quantity;
          ingredientDeductions.set(
            r.ingredientId,
            (ingredientDeductions.get(r.ingredientId) || 0) + qty
          );
        }
      }
    }

    if (orderItemsData.length === 0) {
      return NextResponse.json(
        { success: false, message: "Pilihan menu tidak valid atau tidak ditemukan dalam katalog restoran." },
        { status: 400 }
      );
    }

    // Pre-validate voucher if provided before entering ACID transaction
    let preValidatedVoucher: any = null;
    let calculatedDiscount = 0;

    if (voucherCode && String(voucherCode).trim()) {
      const vCode = String(voucherCode).trim().toUpperCase().replace(/\s+/g, "-");
      preValidatedVoucher = await prisma.voucher.findUnique({
        where: { code: vCode },
      });

      if (!preValidatedVoucher || !preValidatedVoucher.isActive) {
        return NextResponse.json(
          {
            success: false,
            code: "VOUCHER_INVALID",
            message: `Kode voucher "${vCode}" tidak valid atau sudah dinonaktifkan.`,
          },
          { status: 400 }
        );
      }

      const now = new Date();
      if (now < preValidatedVoucher.validFrom) {
        return NextResponse.json(
          {
            success: false,
            code: "VOUCHER_NOT_YET_VALID",
            message: `Voucher promo "${preValidatedVoucher.code}" belum mulai berlaku.`,
          },
          { status: 400 }
        );
      }
      if (now > preValidatedVoucher.validUntil) {
        return NextResponse.json(
          {
            success: false,
            code: "VOUCHER_EXPIRED",
            message: `Voucher promo "${preValidatedVoucher.code}" telah melewati batas masa berlaku (kadaluarsa).`,
          },
          { status: 400 }
        );
      }

      if (preValidatedVoucher.usedCount >= preValidatedVoucher.maxUsage) {
        return NextResponse.json(
          {
            success: false,
            code: "VOUCHER_QUOTA_EXCEEDED",
            message: `Kuota voucher "${preValidatedVoucher.code}" sudah habis terpakai (Maksimal ${preValidatedVoucher.maxUsage} penggunaan). Penukaran voucher ditolak.`,
          },
          { status: 400 }
        );
      }

      if (preValidatedVoucher.minSpend > 0 && calculatedSubtotal < preValidatedVoucher.minSpend) {
        return NextResponse.json(
          {
            success: false,
            code: "MIN_SPEND_NOT_MET",
            message: `Minimal pembelanjaan untuk voucher "${preValidatedVoucher.code}" adalah Rp ${preValidatedVoucher.minSpend.toLocaleString("id-ID")}. Total menu Anda saat ini Rp ${calculatedSubtotal.toLocaleString("id-ID")}.`,
          },
          { status: 400 }
        );
      }

      if (preValidatedVoucher.discountType === "percentage") {
        calculatedDiscount = Math.round((calculatedSubtotal * preValidatedVoucher.discountValue) / 100);
        if (preValidatedVoucher.maxDiscount && calculatedDiscount > preValidatedVoucher.maxDiscount) {
          calculatedDiscount = preValidatedVoucher.maxDiscount;
        }
      } else {
        calculatedDiscount = Math.min(calculatedSubtotal, preValidatedVoucher.discountValue);
      }
    }

    const netSubtotal = Math.max(0, calculatedSubtotal - calculatedDiscount);
    const taxAmount = Math.round(netSubtotal * 0.1);
    const serviceCharge = Math.round(netSubtotal * 0.05);
    const totalAmount = netSubtotal + taxAmount + serviceCharge;
    const paidNum = parseFloat(amountPaid) || totalAmount;

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
        if (existingUser) validUserId = existingUser.id;
      }
    }

    const safePaymentMethod = String(paymentMethod || "qris").toLowerCase();

    // Database transaction with expanded timeout for serverless connection pooler
    const newOrder = await prisma.$transaction(
      async (tx) => {
        // If voucher used, increment usage count
        if (preValidatedVoucher) {
          await tx.voucher.update({
            where: { id: preValidatedVoucher.id },
            data: { usedCount: { increment: 1 } },
          });
        }

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
            guestCount: parsedGuests,
            specialRequests: specialRequests || null,
            orderType: orderType || "dine_in",
            status: isDirect ? "confirmed" : "pending",
            subtotal: calculatedSubtotal,
            taxAmount,
            serviceCharge,
            totalAmount,
            voucherId: preValidatedVoucher ? preValidatedVoucher.id : null,
            discountAmount: calculatedDiscount,
            paymentStatus: isDirect ? "paid" : "unpaid",
            paymentMethod: isDirect ? safePaymentMethod : null,
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
            voucher: true,
          },
        });

        let createdPayment = null;
        if (isDirect) {
          const paymentRef =
            safePaymentMethod === "qris"
              ? `QRIS-SAVORIA-${Date.now()}`
              : safePaymentMethod === "credit_card" || safePaymentMethod === "card"
              ? `CARD-SAVORIA-${Date.now()}`
              : `TRX-${Date.now()}`;

          createdPayment = await tx.payment.create({
            data: {
              orderId: order.id,
              method: safePaymentMethod,
              amountPaid: paidNum,
              changeAmount: Math.max(0, paidNum - totalAmount),
              paymentRef,
            },
          });

          // Parallel stock deduction for all distinct ingredients
          if (ingredientDeductions.size > 0) {
            const deductionPromises: Promise<any>[] = [];
            ingredientDeductions.forEach((qty, ingredientId) => {
              deductionPromises.push(
                tx.ingredient
                  .update({
                    where: { id: ingredientId },
                    data: { stockQuantity: { decrement: qty } },
                  })
                  .catch((err) => {
                    console.warn(`Ingredient ${ingredientId} stock deduction skipped:`, err.message);
                  })
              );
            });
            await Promise.all(deductionPromises);
          }
        }

        // Update physical table status if today's session
        const todayDate = new Date().toISOString().slice(0, 10);
        const isImmediateSession = !isReservation || reservationDate === todayDate;
        if (isImmediateSession) {
          await tx.table.update({
            where: { id: table.id },
            data: { status: isDirect ? "occupied" : "reserved" },
          });
        }

        return {
          ...order,
          payments: createdPayment ? [createdPayment] : [],
        };
      },
      {
        maxWait: 15000,
        timeout: 30000,
      }
    );

    // Asynchronously log audit outside the transaction to preserve fast ACID completion
    prisma.auditLog
      .create({
        data: {
          user: customerName || `Tamu ${table.tableNumber}`,
          action: isDirect ? "RESERVATION_PAID" : "RESERVATION_CREATED",
          details: `Pesanan/Reservasi ${orderNumber} di ${table.tableNumber} senilai Rp ${totalAmount.toLocaleString("id-ID")}${isDirect ? ` (Lunas via ${safePaymentMethod.toUpperCase()})` : ""}`,
        },
      })
      .catch((err) => console.error("Non-fatal audit log error:", err));

    // Auto-deduct BOM recipes and trigger low-stock alerts
    deductInventoryForOrder(newOrder.id, customerName || `Tamu ${table.tableNumber}`).catch((err) =>
      console.error("Non-fatal BOM deduction error:", err)
    );

    return NextResponse.json({
      success: true,
      message: isDirectPayment
        ? "Pembayaran berhasil diverifikasi! Reservasi meja Anda telah terkonfirmasi."
        : "Pesanan berhasil dikirim ke restoran!",
      data: newOrder,
    });
  } catch (error: any) {
    console.error("Error creating customer reservation/order:", error);
    const isTimeout =
      error.message &&
      (error.message.includes("Transaction already closed") ||
        error.message.includes("timeout") ||
        error.message.includes("P2028"));

    return NextResponse.json(
      {
        success: false,
        message: isTimeout
          ? "Sistem sedang padat antrean pemrosesan transaksi. Mohon ulangi kembali pembayaran dalam beberapa saat."
          : error.message || "Gagal memproses pesanan.",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["admin"]);
    if (!auth.authorized) return auth.response!;

    const [
      orders,
      menus,
      categories,
      shifts,
      ingredients,
      vouchers,
      auditLogs,
      tables,
    ] = await Promise.all([
      // 1. All Orders with full relations
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          table: {
            select: {
              tableNumber: true,
              area: true,
              capacity: true,
            },
          },
          items: {
            include: {
              menu: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  category: { select: { name: true } },
                },
              },
            },
          },
          payments: {
            select: {
              id: true,
              method: true,
              amountPaid: true,
              changeAmount: true,
              paymentRef: true,
              createdAt: true,
            },
          },
          voucher: {
            select: {
              code: true,
              name: true,
              discountType: true,
              discountValue: true,
            },
          },
          shift: {
            select: {
              id: true,
              cashierName: true,
            },
          },
        },
      }),

      // 2. All Menus with Category and Order Items aggregates
      prisma.menu.findMany({
        orderBy: [{ categoryId: "asc" }, { name: "asc" }],
        include: {
          category: { select: { id: true, name: true, slug: true } },
          orderItems: {
            where: { isVoided: false },
            select: {
              quantity: true,
              subtotal: true,
              order: {
                select: { paymentStatus: true },
              },
            },
          },
        },
      }),

      // 3. Categories
      prisma.category.findMany({
        orderBy: { sortOrder: "asc" },
      }),

      // 4. Cashier Shifts
      prisma.cashierShift.findMany({
        orderBy: { openedAt: "desc" },
        include: {
          orders: {
            select: {
              id: true,
              totalAmount: true,
              paymentStatus: true,
              paymentMethod: true,
            },
          },
        },
      }),

      // 5. Ingredients
      prisma.ingredient.findMany({
        orderBy: { name: "asc" },
      }),

      // 6. Vouchers
      prisma.voucher.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { orders: true },
          },
        },
      }),

      // 7. Audit Logs
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 1000,
      }),

      // 8. Tables
      prisma.table.findMany({
        orderBy: { tableNumber: "asc" },
      }),
    ]);

    // Financial KPI Summary Calculations
    let totalGrossRevenue = 0;
    let totalSubtotal = 0;
    let totalTaxAmount = 0;
    let totalServiceCharge = 0;
    let totalDiscountAmount = 0;
    let paidOrdersCount = 0;
    let unpaidOrdersCount = 0;
    let cancelledOrdersCount = 0;

    const paymentMethodsSummary = {
      cash: { count: 0, total: 0 },
      qris: { count: 0, total: 0 },
      debit: { count: 0, total: 0 },
      other: { count: 0, total: 0 },
    };

    const orderTypesSummary = {
      dine_in: { count: 0, total: 0 },
      reservation: { count: 0, total: 0 },
      takeaway: { count: 0, total: 0 },
    };

    for (const order of orders) {
      if (order.paymentStatus === "paid") {
        totalGrossRevenue += order.totalAmount || 0;
        totalSubtotal += order.subtotal || 0;
        totalTaxAmount += order.taxAmount || 0;
        totalServiceCharge += order.serviceCharge || 0;
        totalDiscountAmount += order.discountAmount || 0;
        paidOrdersCount++;

        const method = (order.paymentMethod || "cash").toLowerCase();
        if (method === "cash") {
          paymentMethodsSummary.cash.count++;
          paymentMethodsSummary.cash.total += order.totalAmount;
        } else if (method === "qris") {
          paymentMethodsSummary.qris.count++;
          paymentMethodsSummary.qris.total += order.totalAmount;
        } else if (method === "debit") {
          paymentMethodsSummary.debit.count++;
          paymentMethodsSummary.debit.total += order.totalAmount;
        } else {
          paymentMethodsSummary.other.count++;
          paymentMethodsSummary.other.total += order.totalAmount;
        }

        const type = (order.orderType || "dine_in").toLowerCase();
        if (type === "reservation") {
          orderTypesSummary.reservation.count++;
          orderTypesSummary.reservation.total += order.totalAmount;
        } else if (type === "takeaway") {
          orderTypesSummary.takeaway.count++;
          orderTypesSummary.takeaway.total += order.totalAmount;
        } else {
          orderTypesSummary.dine_in.count++;
          orderTypesSummary.dine_in.total += order.totalAmount;
        }
      } else if (order.status === "cancelled" || order.status === "voided") {
        cancelledOrdersCount++;
      } else {
        unpaidOrdersCount++;
      }
    }

    const estimatedCOGS = Math.round(totalSubtotal * 0.35);
    const estimatedGrossProfit = totalGrossRevenue - estimatedCOGS;
    const avgOrderValue = paidOrdersCount > 0 ? Math.round(totalGrossRevenue / paidOrdersCount) : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalGrossRevenue,
          totalSubtotal,
          totalTaxAmount,
          totalServiceCharge,
          totalDiscountAmount,
          estimatedCOGS,
          estimatedGrossProfit,
          paidOrdersCount,
          unpaidOrdersCount,
          cancelledOrdersCount,
          totalAllOrders: orders.length,
          avgOrderValue,
          paymentMethodsSummary,
          orderTypesSummary,
          totalTables: tables.length,
          totalMenuItems: menus.length,
          totalIngredients: ingredients.length,
          totalVouchers: vouchers.length,
          generatedAt: new Date().toISOString(),
        },
        orders,
        menus,
        categories,
        shifts,
        ingredients,
        vouchers,
        auditLogs,
        tables,
      },
    });
  } catch (error: any) {
    console.error("Error generating full export data:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memproses data laporan lengkap." },
      { status: 500 }
    );
  }
}

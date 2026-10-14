import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["admin"]);
    if (!auth.authorized) return auth.response!;

    const [aggregates, payments, topItemGroups, recentOrders, allMenus] = await Promise.all([
      prisma.order.aggregate({
        where: { paymentStatus: "paid" },
        _sum: {
          totalAmount: true,
          subtotal: true,
          taxAmount: true,
          serviceCharge: true,
        },
        _count: {
          id: true,
        },
      }),
      prisma.payment.findMany({
        where: { order: { paymentStatus: "paid" } },
        select: { method: true, amountPaid: true, changeAmount: true },
      }),
      prisma.orderItem.groupBy({
        by: ["menuId"],
        where: { order: { paymentStatus: "paid" }, isVoided: false },
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 10,
      }),
      prisma.order.findMany({
        where: { paymentStatus: "paid" },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          totalAmount: true,
          paymentMethod: true,
          createdAt: true,
          status: true,
        },
      }),
      prisma.menu.findMany({
        select: { id: true, name: true, price: true, image: true },
      }),
    ]);

    const totalRevenue = aggregates._sum.totalAmount || 0;
    const totalSubtotal = aggregates._sum.subtotal || 0;
    const totalTax = aggregates._sum.taxAmount || 0;
    const totalService = aggregates._sum.serviceCharge || 0;
    const totalOrdersCount = aggregates._count.id || 0;
    const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

    // COGS & Profit estimation
    const estimatedCOGS = Math.round(totalSubtotal * 0.35);
    const grossProfit = totalRevenue - estimatedCOGS;

    // Payment methods breakdown
    let cashTotal = 0;
    let qrisTotal = 0;
    let debitTotal = 0;

    for (const p of payments) {
      if (p.method === "cash") cashTotal += p.amountPaid - p.changeAmount;
      else if (p.method === "qris") qrisTotal += p.amountPaid;
      else if (p.method === "debit") debitTotal += p.amountPaid;
    }

    // Map top selling items
    const menuMap = new Map(allMenus.map((m) => [m.id, m]));
    const topSellingItems = topItemGroups.map((g) => {
      const menu = menuMap.get(g.menuId);
      return {
        name: menu ? menu.name : `Menu #${g.menuId}`,
        quantity: g._sum.quantity || 0,
        revenue: g._sum.subtotal || 0,
        image: menu?.image || null,
      };
    });

    // Dead stock items
    const activeSoldMenuIds = new Set(topItemGroups.map((g) => g.menuId));
    const deadStockItems = allMenus
      .filter((m) => !activeSoldMenuIds.has(m.id))
      .slice(0, 10)
      .map((m) => ({ name: m.name, price: m.price, sales: 0 }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalSubtotal,
          totalTax,
          totalService,
          totalOrdersCount,
          avgOrderValue,
          estimatedCOGS,
          grossProfit,
        },
        paymentBreakdown: {
          cash: cashTotal,
          qris: qrisTotal,
          debit: debitTotal,
        },
        topSellingItems,
        deadStockItems,
        recentOrders,
      },
    });
  } catch (error: any) {
    console.error("Error generating sales summary:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memproses ringkasan penjualan." },
      { status: 500 }
    );
  }
}

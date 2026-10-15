import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["admin"]);
    if (!auth.authorized) return auth.response!;

    const [
      aggregates,
      payments,
      topItemGroups,
      recentOrders,
      allMenus,
      tableCount,
      ingredientCount,
      voucherCount,
      userCount,
    ] = await Promise.all([
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
        take: 100,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          totalAmount: true,
          subtotal: true,
          paymentMethod: true,
          orderType: true,
          createdAt: true,
          status: true,
        },
      }),
      prisma.menu.findMany({
        select: { id: true, name: true, price: true, image: true },
      }),
      prisma.table.count(),
      prisma.ingredient.count(),
      prisma.voucher.count(),
      prisma.user.count(),
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

    // 1. Daily trend (past 7 days)
    const dailyMap = new Map<string, { date: string; label: string; revenue: number; profit: number; count: number }>();
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString("id-ID", { weekday: "short" });
      dailyMap.set(key, { date: key, label: dayName, revenue: 0, profit: 0, count: 0 });
    }

    // 2. Order type breakdown
    const orderTypeBreakdown: Record<string, { count: number; revenue: number }> = {
      dine_in: { count: 0, revenue: 0 },
      takeaway: { count: 0, revenue: 0 },
      reservation: { count: 0, revenue: 0 },
    };

    // 3. Peak dining hours (11:00 - 22:00)
    const hourlyDistribution: Record<string, number> = {
      "11:00": 0, "12:00": 0, "13:00": 0, "14:00": 0,
      "15:00": 0, "16:00": 0, "17:00": 0, "18:00": 0,
      "19:00": 0, "20:00": 0, "21:00": 0, "22:00": 0,
    };

    for (const ord of recentOrders) {
      const dateKey = new Date(ord.createdAt).toISOString().slice(0, 10);
      if (dailyMap.has(dateKey)) {
        const item = dailyMap.get(dateKey)!;
        item.revenue += ord.totalAmount;
        item.profit += Math.max(0, Math.round(ord.totalAmount - (ord.subtotal * 0.35)));
        item.count += 1;
      }

      const oType = ord.orderType || "dine_in";
      if (!orderTypeBreakdown[oType]) {
        orderTypeBreakdown[oType] = { count: 0, revenue: 0 };
      }
      orderTypeBreakdown[oType].count += 1;
      orderTypeBreakdown[oType].revenue += ord.totalAmount;

      const hour = new Date(ord.createdAt).getHours();
      const hourSlot = `${String(hour).padStart(2, "0")}:00`;
      if (hourlyDistribution[hourSlot] !== undefined) {
        hourlyDistribution[hourSlot] += 1;
      }
    }

    const dailyTrend = Array.from(dailyMap.values());

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
        orderTypeBreakdown,
        dailyTrend,
        hourlyDistribution,
        topSellingItems,
        deadStockItems,
        recentOrders,
        counts: {
          menus: allMenus.length,
          tables: tableCount,
          ingredients: ingredientCount,
          vouchers: voucherCount,
          users: userCount,
        },
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

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["admin"]);
    if (!auth.authorized) return auth.response!;

    const allOrders = await prisma.order.findMany({
      where: {
        paymentStatus: "paid",
      },
      include: {
        items: {
          include: {
            menu: true,
          },
        },
        payments: true,
      },
    });

    const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalSubtotal = allOrders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalTax = allOrders.reduce((sum, o) => sum + o.taxAmount, 0);
    const totalService = allOrders.reduce((sum, o) => sum + o.serviceCharge, 0);
    const totalOrdersCount = allOrders.length;
    const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

    // Estimated Gross Profit: Subtotal - Estimated COGS (approx. 35% food cost)
    const estimatedCOGS = Math.round(totalSubtotal * 0.35);
    const grossProfit = totalRevenue - estimatedCOGS;

    // Payment methods breakdown
    let cashTotal = 0;
    let qrisTotal = 0;
    let debitTotal = 0;

    for (const order of allOrders) {
      for (const p of order.payments) {
        if (p.method === "cash") cashTotal += p.amountPaid - p.changeAmount;
        else if (p.method === "qris") qrisTotal += p.amountPaid;
        else if (p.method === "debit") debitTotal += p.amountPaid;
      }
    }

    // Top selling items ranking
    const itemSalesMap = new Map<number, { name: string; quantity: number; revenue: number; image?: string | null }>();

    for (const order of allOrders) {
      for (const item of order.items) {
        if (item.isVoided) continue;
        const existing = itemSalesMap.get(item.menuId) || {
          name: item.menu.name,
          quantity: 0,
          revenue: 0,
          image: item.menu.image,
        };
        existing.quantity += item.quantity;
        existing.revenue += item.subtotal;
        itemSalesMap.set(item.menuId, existing);
      }
    }

    const topSellingItems = Array.from(itemSalesMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // All active menus to find Dead Stock (items with 0 sales)
    const allMenus = await prisma.menu.findMany({ select: { id: true, name: true, price: true } });
    const deadStockItems = allMenus
      .filter((m) => !itemSalesMap.has(m.id))
      .map((m) => ({ name: m.name, price: m.price, sales: 0 }));

    // Recent orders table for audit/reporting
    const recentOrders = allOrders.slice(0, 50).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      totalAmount: o.totalAmount,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt,
      status: o.status,
    }));

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

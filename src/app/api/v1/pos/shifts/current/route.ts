import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const currentShift = await prisma.cashierShift.findFirst({
      where: { status: "open" },
      orderBy: { openedAt: "desc" },
    });

    if (!currentShift) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    // Calculate total cash payments processed during this shift
    const cashPayments = await prisma.payment.aggregate({
      where: {
        method: "cash",
        order: {
          shiftId: currentShift.id,
        },
      },
      _sum: {
        amountPaid: true,
        changeAmount: true,
      },
    });

    // Net cash sales = amountPaid - changeAmount
    const grossCash = cashPayments._sum.amountPaid || 0;
    const changeGiven = cashPayments._sum.changeAmount || 0;
    const netCashSales = grossCash - changeGiven;

    const expectedCash = currentShift.startCash + netCashSales;

    // Total non-cash sales (QRIS & Debit)
    const digitalPayments = await prisma.payment.aggregate({
      where: {
        method: { in: ["qris", "debit"] },
        order: {
          shiftId: currentShift.id,
        },
      },
      _sum: {
        amountPaid: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...currentShift,
        netCashSales,
        expectedCash,
        digitalSales: digitalPayments._sum.amountPaid || 0,
      },
    });
  } catch (error: any) {
    console.error("Error fetching current shift:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil data shift." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (user && user.role !== "kasir" && user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          code: "FORBIDDEN",
          message: "Akses Ditolak: Hanya staf kasir atau admin yang dapat menutup shift kasir.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { endCashActual, shiftId } = body;

    if (endCashActual === undefined || endCashActual === null) {
      return NextResponse.json(
        { success: false, message: "Nominal uang fisik kas laci akhir wajib diisi." },
        { status: 400 }
      );
    }

    const currentShift = shiftId
      ? await prisma.cashierShift.findUnique({ where: { id: parseInt(shiftId) } })
      : await prisma.cashierShift.findFirst({
          where: { status: "open" },
          orderBy: { openedAt: "desc" },
        });

    if (!currentShift || currentShift.status !== "open") {
      return NextResponse.json(
        { success: false, message: "Tidak ada shift kasir aktif yang dapat ditutup." },
        { status: 404 }
      );
    }

    // Calculate cash payments during this shift
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

    const grossCash = cashPayments._sum.amountPaid || 0;
    const changeGiven = cashPayments._sum.changeAmount || 0;
    const netCashSales = grossCash - changeGiven;

    const expectedCash = currentShift.startCash + netCashSales;
    const actualCash = parseFloat(endCashActual);
    const variance = actualCash - expectedCash;

    const updatedShift = await prisma.cashierShift.update({
      where: { id: currentShift.id },
      data: {
        endCashActual: actualCash,
        endCashExpected: expectedCash,
        variance,
        closedAt: new Date(),
        status: "closed",
      },
    });

    await prisma.auditLog.create({
      data: {
        user: currentShift.cashierName,
        action: "SHIFT_CLOSED",
        details: `Shift #${currentShift.id} ditutup oleh ${currentShift.cashierName}. Modal: Rp ${currentShift.startCash.toLocaleString("id-ID")}, Penjualan Tunai: Rp ${netCashSales.toLocaleString("id-ID")}, Ekspektasi Kas: Rp ${expectedCash.toLocaleString("id-ID")}, Fisik Laci: Rp ${actualCash.toLocaleString("id-ID")}, Selisih: Rp ${variance.toLocaleString("id-ID")}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Shift kasir berhasil ditutup dan direkonsiliasi.",
      data: updatedShift,
    });
  } catch (error: any) {
    console.error("Error closing shift:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menutup shift kasir." },
      { status: 500 }
    );
  }
}

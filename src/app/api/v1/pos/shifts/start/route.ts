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
          message: "Akses Ditolak: Hanya staf kasir atau admin yang dapat mengelola shift kasir.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { startCash = 0, cashierName: customCashierName } = body;
    const cashierName = customCashierName?.trim() || user?.name || "Kasir Utama";
    const userId = user?.id;

    // Check if there is already an open shift
    const existing = await prisma.cashierShift.findFirst({
      where: { status: "open" },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: `Shift kasir (${existing.cashierName}) saat ini masih terbuka. Tutup shift terlebih dahulu sebelum memulai shift baru.`,
        },
        { status: 400 }
      );
    }

    const shift = await prisma.cashierShift.create({
      data: {
        cashierName,
        userId: userId ?? null,
        startCash: parseFloat(startCash) || 0,
        status: "open",
        openedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        user: cashierName,
        action: "SHIFT_OPENED",
        details: `Sesi shift kasir #${shift.id} dibuka oleh ${cashierName} dengan modal awal kas Rp ${parseFloat(startCash).toLocaleString("id-ID")}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Shift kasir untuk ${cashierName} berhasil dibuka.`,
      data: shift,
    });
  } catch (error: any) {
    console.error("Error starting shift:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memulai shift kasir." },
      { status: 500 }
    );
  }
}

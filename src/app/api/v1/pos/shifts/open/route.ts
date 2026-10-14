import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cashierName = "Kasir Utama", startCash = 0, userId } = body;

    // Check if there is already an open shift
    const existing = await prisma.cashierShift.findFirst({
      where: { status: "open" },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Shift saat ini masih terbuka. Tutup shift terlebih dahulu." },
        { status: 400 }
      );
    }

    const shift = await prisma.cashierShift.create({
      data: {
        cashierName,
        userId: userId ? parseInt(userId) : null,
        startCash: parseFloat(startCash) || 0,
        status: "open",
        openedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        user: cashierName,
        action: "SHIFT_OPENED",
        details: `Shift dibuka dengan modal awal Rp ${parseFloat(startCash).toLocaleString("id-ID")}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Shift kasir berhasil dibuka.",
      data: shift,
    });
  } catch (error: any) {
    console.error("Error opening shift:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membuka shift." },
      { status: 500 }
    );
  }
}

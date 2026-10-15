import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, rewardId, pointsCost, title, discountValue } = body;

    if (!userId || !rewardId || !pointsCost) {
      return NextResponse.json(
        { success: false, message: "Data penukaran poin tidak lengkap." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: {
        orders: {
          where: { paymentStatus: "paid" },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    // Generate unique redeem voucher code
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const voucherCode = `SAV-CLUB-${rewardId.toUpperCase().slice(0, 4)}-${randomSuffix}`;
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days validity

    const newVoucher = await prisma.voucher.create({
      data: {
        code: voucherCode,
        name: title || `Hadiah Poin ${rewardId}`,
        discountType: "fixed",
        discountValue: Number(discountValue) || 25000,
        minSpend: 0,
        maxUsage: 1,
        usedCount: 0,
        validFrom: new Date(),
        validUntil,
        isActive: true,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        user: user.name,
        action: "LOYALTY_POINT_REDEEMED",
        details: `${user.name} menukarkan ${pointsCost} Poin Loyalitas Savoria Club untuk ${title} (Kode Voucher: ${voucherCode})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Selamat! Anda berhasil menukarkan ${pointsCost} Poin untuk voucher ${voucherCode}.`,
      data: newVoucher,
    });
  } catch (error: any) {
    console.error("Error redeeming loyalty points:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menukarkan poin hadiah." },
      { status: 500 }
    );
  }
}

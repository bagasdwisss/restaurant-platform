import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const now = new Date();

    const vouchers = await prisma.voucher.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter only those whose maxUsage hasn't been reached
    const available = vouchers.filter((v) => v.usedCount < v.maxUsage);

    return NextResponse.json({
      success: true,
      data: available,
    });
  } catch (error: any) {
    console.error("Error fetching available customer vouchers:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat daftar voucher." },
      { status: 500 }
    );
  }
}

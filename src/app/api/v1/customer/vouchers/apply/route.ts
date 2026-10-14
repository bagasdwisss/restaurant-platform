import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotal = 0 } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { success: false, message: "Silakan masukkan kode voucher promo terlebih dahulu." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, "-");

    const voucher = await prisma.voucher.findUnique({
      where: { code: cleanCode },
    });

    if (!voucher) {
      return NextResponse.json(
        {
          success: false,
          code: "VOUCHER_NOT_FOUND",
          message: `Kode voucher "${cleanCode}" tidak ditemukan atau tidak valid. Periksa kembali ejaan kode Anda.`,
        },
        { status: 404 }
      );
    }

    if (!voucher.isActive) {
      return NextResponse.json(
        {
          success: false,
          code: "VOUCHER_INACTIVE",
          message: `Voucher promo "${voucher.code}" saat ini sedang dinonaktifkan oleh restoran.`,
        },
        { status: 400 }
      );
    }

    const now = new Date();
    if (now < voucher.validFrom) {
      return NextResponse.json(
        {
          success: false,
          code: "VOUCHER_NOT_YET_VALID",
          message: `Voucher promo "${voucher.code}" baru dapat digunakan mulai tanggal ${voucher.validFrom.toLocaleDateString("id-ID")}.`,
        },
        { status: 400 }
      );
    }

    if (now > voucher.validUntil) {
      return NextResponse.json(
        {
          success: false,
          code: "VOUCHER_EXPIRED",
          message: `Masa berlaku voucher "${voucher.code}" telah berakhir pada ${voucher.validUntil.toLocaleDateString("id-ID")}.`,
        },
        { status: 400 }
      );
    }

    // STRICT QUOTA LIMIT CHECK (e.g. 10 users max)
    if (voucher.usedCount >= voucher.maxUsage) {
      return NextResponse.json(
        {
          success: false,
          code: "VOUCHER_QUOTA_EXCEEDED",
          message: `Maaf, kuota penggunaan voucher "${voucher.code}" telah habis! Voucher ini dibatasi hanya untuk ${voucher.maxUsage} pengguna pertama.`,
        },
        { status: 400 }
      );
    }

    const numSubtotal = parseFloat(subtotal) || 0;
    if (voucher.minSpend > 0 && numSubtotal < voucher.minSpend) {
      return NextResponse.json(
        {
          success: false,
          code: "MIN_SPEND_NOT_MET",
          message: `Voucher "${voucher.code}" memerlukan minimal total pesanan sebesar Rp ${voucher.minSpend.toLocaleString("id-ID")}. Pesanan Anda saat ini Rp ${numSubtotal.toLocaleString("id-ID")}.`,
        },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (voucher.discountType === "percentage") {
      discountAmount = (numSubtotal * voucher.discountValue) / 100;
      if (voucher.maxDiscount && voucher.maxDiscount > 0) {
        discountAmount = Math.min(discountAmount, voucher.maxDiscount);
      }
    } else {
      // Fixed nominal
      discountAmount = Math.min(numSubtotal, voucher.discountValue);
    }

    const newSubtotal = Math.max(0, numSubtotal - discountAmount);

    return NextResponse.json({
      success: true,
      message: `Voucher "${voucher.code}" berhasil diterapkan! Anda hemat Rp ${discountAmount.toLocaleString("id-ID")}.`,
      data: {
        id: voucher.id,
        code: voucher.code,
        name: voucher.name,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        discountAmount,
        newSubtotal,
        remainingQuota: voucher.maxUsage - voucher.usedCount,
      },
    });
  } catch (error: any) {
    console.error("Error applying voucher:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menerapkan kode voucher." },
      { status: 500 }
    );
  }
}

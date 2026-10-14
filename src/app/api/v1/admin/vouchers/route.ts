import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["admin"]);
    if (!auth.authorized) return auth.response!;

    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: vouchers,
    });
  } catch (error: any) {
    console.error("Error fetching vouchers:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat daftar voucher." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["admin"]);
    if (!auth.authorized) return auth.response!;

    const body = await request.json();
    const {
      code,
      name,
      discountType = "percentage",
      discountValue,
      minSpend = 0,
      maxDiscount,
      maxUsage = 10,
      validFrom,
      validUntil,
    } = body;

    if (!code || !name || discountValue === undefined || !validUntil) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode voucher, nama, nilai diskon, dan batas periode tanggal wajib diisi.",
        },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, "-");

    // Check code uniqueness
    const existing = await prisma.voucher.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: `Kode voucher "${cleanCode}" sudah digunakan. Harap gunakan kode lain.` },
        { status: 400 }
      );
    }

    const parsedVal = parseFloat(discountValue);
    if (isNaN(parsedVal) || parsedVal <= 0) {
      return NextResponse.json(
        { success: false, message: "Nilai diskon harus berupa angka lebih besar dari 0." },
        { status: 400 }
      );
    }

    if (discountType === "percentage" && parsedVal > 100) {
      return NextResponse.json(
        { success: false, message: "Persentase diskon tidak boleh melebihi 100%." },
        { status: 400 }
      );
    }

    const voucher = await prisma.voucher.create({
      data: {
        code: cleanCode,
        name: name.trim(),
        discountType,
        discountValue: parsedVal,
        minSpend: parseFloat(minSpend) || 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        maxUsage: parseInt(maxUsage) || 10,
        usedCount: 0,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: new Date(validUntil),
        isActive: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        user: auth.user?.name || "Admin",
        action: "VOUCHER_CREATED",
        details: `Voucher baru "${voucher.code}" dibuat (${voucher.discountType === "percentage" ? `${voucher.discountValue}%` : `Rp ${voucher.discountValue.toLocaleString("id-ID")}`}, Kuota: ${voucher.maxUsage} pengguna)`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Voucher promo "${voucher.code}" berhasil diterbitkan!`,
      data: voucher,
    });
  } catch (error: any) {
    console.error("Error creating voucher:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menerbitkan voucher promo." },
      { status: 500 }
    );
  }
}

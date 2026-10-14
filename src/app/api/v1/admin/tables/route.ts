import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      orderBy: [{ area: "asc" }, { tableNumber: "asc" }],
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: tables,
    });
  } catch (error: any) {
    console.error("Error fetching admin tables:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat daftar meja." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableNumber, capacity = 4, area = "Indoor" } = body;

    if (!tableNumber) {
      return NextResponse.json(
        { success: false, message: "Nomor meja wajib diisi." },
        { status: 400 }
      );
    }

    // Generate unique tamper-proof token
    const randomHash = crypto.randomBytes(8).toString("hex");
    const qrToken = `resto-tbl-${tableNumber.toLowerCase().replace(/\s+/g, "-")}-${randomHash}`;

    const table = await prisma.table.create({
      data: {
        tableNumber,
        capacity: parseInt(capacity) || 4,
        area,
        qrToken,
        status: "available",
      },
    });

    await prisma.auditLog.create({
      data: {
        user: "Admin",
        action: "TABLE_CREATED",
        details: `Meja baru ditambahkan: ${tableNumber} (${area}, kapasitas ${capacity})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Meja berhasil ditambahkan.",
      data: table,
    });
  } catch (error: any) {
    console.error("Error creating table:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menambahkan meja." },
      { status: 500 }
    );
  }
}

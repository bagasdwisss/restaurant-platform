import { NextRequest, NextResponse } from "next/server";
import { createQrisSession } from "@/lib/qris-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, orderNumber, orderId, customerName } = body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Nominal pembayaran QRIS tidak valid." },
        { status: 400 }
      );
    }

    const session = createQrisSession({
      amount: numAmount,
      orderNumber,
      orderId: orderId ? parseInt(orderId) : undefined,
      customerName,
    });

    return NextResponse.json({
      success: true,
      message: "Sesi QRIS Dinamis berhasil dibuat dengan kode verifikasi unik.",
      session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal membuat sesi QRIS." },
      { status: 500 }
    );
  }
}

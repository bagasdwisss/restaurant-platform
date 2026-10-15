import { NextRequest, NextResponse } from "next/server";
import { getQrisSession } from "@/lib/qris-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const referenceNo = searchParams.get("referenceNo");

    if (!referenceNo) {
      return NextResponse.json(
        { success: false, message: "Nomor referensi QRIS wajib disertakan." },
        { status: 400 }
      );
    }

    const session = getQrisSession(referenceNo);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Sesi QRIS tidak ditemukan atau telah kedaluwarsa." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      status: session.status,
      session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal memeriksa status QRIS." },
      { status: 500 }
    );
  }
}

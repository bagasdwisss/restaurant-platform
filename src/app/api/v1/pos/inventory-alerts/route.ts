import { NextRequest, NextResponse } from "next/server";
import { getInventoryStockAlerts } from "@/lib/inventory";

export async function GET(request: NextRequest) {
  try {
    const alerts = await getInventoryStockAlerts();
    return NextResponse.json({
      success: true,
      data: alerts,
    });
  } catch (error: any) {
    console.error("Error fetching inventory alerts:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat status peringatan stok." },
      { status: 500 }
    );
  }
}

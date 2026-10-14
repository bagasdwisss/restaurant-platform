import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    // Also allow query param userId for testing/fallback
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");
    const targetUserId = user?.id || (queryUserId ? parseInt(queryUserId) : null);

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, message: "Harap login terlebih dahulu untuk melihat pesanan Anda." },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: targetUserId,
      },
      include: {
        table: true,
        items: {
          include: {
            menu: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat pesanan pengguna." },
      { status: 500 }
    );
  }
}

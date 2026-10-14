import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      orderBy: [{ area: "asc" }, { tableNumber: "asc" }],
      include: {
        orders: {
          where: {
            status: { in: ["pending", "confirmed", "preparing", "served"] },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            items: {
              include: {
                menu: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: tables,
    });
  } catch (error: any) {
    console.error("Error fetching tables:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat denah meja." },
      { status: 500 }
    );
  }
}

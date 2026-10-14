import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        menus: {
          orderBy: { name: "asc" },
          include: {
            modifierGroups: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    console.error("Error fetching menus:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat katalog menu." },
      { status: 500 }
    );
  }
}

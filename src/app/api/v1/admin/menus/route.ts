import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        modifierGroups: {
          include: {
            options: true,
          },
        },
        recipes: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: { menus, categories },
    });
  } catch (error: any) {
    console.error("Error fetching admin menus:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat daftar menu." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId, name, description, price, image, isAvailable = true } = body;

    if (!categoryId || !name || !price) {
      return NextResponse.json(
        { success: false, message: "Kategori, nama menu, dan harga wajib diisi." },
        { status: 400 }
      );
    }

    const menu = await prisma.menu.create({
      data: {
        categoryId: parseInt(categoryId),
        name,
        description,
        price: parseFloat(price),
        image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
        isAvailable: Boolean(isAvailable),
      },
      include: {
        category: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        user: "Admin",
        action: "MENU_CREATED",
        details: `Menu baru dibuat: ${name} (Rp ${parseFloat(price).toLocaleString("id-ID")})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Menu berhasil ditambahkan.",
      data: menu,
    });
  } catch (error: any) {
    console.error("Error creating menu:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membuat menu baru." },
      { status: 500 }
    );
  }
}

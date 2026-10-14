import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: "asc" },
      include: {
        recipes: {
          include: {
            menu: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: ingredients,
    });
  } catch (error: any) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat data bahan baku." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["admin"]);
    if (!auth.authorized) return auth.response!;

    const body = await request.json();
    const { name, unit, stockQuantity = 0, minStock = 10 } = body;

    if (!name || !unit) {
      return NextResponse.json(
        { success: false, message: "Nama bahan baku dan satuan unit wajib diisi." },
        { status: 400 }
      );
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        unit,
        stockQuantity: parseFloat(stockQuantity) || 0,
        minStock: parseFloat(minStock) || 10,
      },
    });

    await prisma.auditLog.create({
      data: {
        user: "Admin",
        action: "INGREDIENT_CREATED",
        details: `Bahan baku ditambahkan: ${name} (${stockQuantity} ${unit})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Bahan baku berhasil ditambahkan.",
      data: ingredient,
    });
  } catch (error: any) {
    console.error("Error creating ingredient:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membuat bahan baku." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["admin"]);
    if (!auth.authorized) return auth.response!;

    const body = await request.json();
    const { id, stockQuantity, minStock, addStock } = body;

    const ingId = parseInt(id);
    const existing = await prisma.ingredient.findUnique({ where: { id: ingId } });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Bahan baku tidak ditemukan." },
        { status: 404 }
      );
    }

    let newStock = existing.stockQuantity;
    if (addStock !== undefined) {
      newStock += parseFloat(addStock);
    } else if (stockQuantity !== undefined) {
      newStock = parseFloat(stockQuantity);
    }

    const updated = await prisma.ingredient.update({
      where: { id: ingId },
      data: {
        stockQuantity: newStock,
        ...(minStock !== undefined && { minStock: parseFloat(minStock) }),
      },
    });

    await prisma.auditLog.create({
      data: {
        user: "Admin",
        action: "INGREDIENT_RESTOCKED",
        details: `Stok ${existing.name} diperbarui: dari ${existing.stockQuantity} ${existing.unit} menjadi ${newStock} ${existing.unit}.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Stok bahan baku berhasil diperbarui.",
      data: updated,
    });
  } catch (error: any) {
    console.error("Error updating ingredient:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui bahan baku." },
      { status: 500 }
    );
  }
}

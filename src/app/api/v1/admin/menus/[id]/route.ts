import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const menuId = parseInt(id);
    const body = await request.json();
    const { categoryId, name, description, price, image, isAvailable } = body;

    const updated = await prisma.menu.update({
      where: { id: menuId },
      data: {
        ...(categoryId !== undefined && { categoryId: parseInt(categoryId) }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(image !== undefined && { image }),
        ...(isAvailable !== undefined && { isAvailable: Boolean(isAvailable) }),
      },
      include: { category: true },
    });

    await prisma.auditLog.create({
      data: {
        user: "Admin",
        action: "MENU_UPDATED",
        details: `Menu diperbarui: ${updated.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Menu berhasil diperbarui.",
      data: updated,
    });
  } catch (error: any) {
    console.error("Error updating menu:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui menu." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const menuId = parseInt(id);

    const deleted = await prisma.menu.delete({
      where: { id: menuId },
    });

    await prisma.auditLog.create({
      data: {
        user: "Admin",
        action: "MENU_DELETED",
        details: `Menu dihapus: ${deleted.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Menu berhasil dihapus.",
    });
  } catch (error: any) {
    console.error("Error deleting menu:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus menu." },
      { status: 500 }
    );
  }
}

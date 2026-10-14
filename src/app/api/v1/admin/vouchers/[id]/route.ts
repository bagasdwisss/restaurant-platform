import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request, ["admin"]);
    if (!auth.authorized) return auth.response!;

    const { id } = await params;
    const voucherId = parseInt(id);
    if (isNaN(voucherId)) {
      return NextResponse.json({ success: false, message: "ID voucher tidak valid." }, { status: 400 });
    }

    const body = await request.json();
    const { isActive, name, maxUsage, validUntil } = body;

    const updateData: any = {};
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (name) updateData.name = name.trim();
    if (maxUsage) updateData.maxUsage = parseInt(maxUsage);
    if (validUntil) updateData.validUntil = new Date(validUntil);

    const updated = await prisma.voucher.update({
      where: { id: voucherId },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        user: auth.user?.name || "Admin",
        action: "VOUCHER_UPDATED",
        details: `Voucher ${updated.code} diperbarui (${Object.keys(updateData).join(", ")})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Voucher berhasil diperbarui.",
      data: updated,
    });
  } catch (error: any) {
    console.error("Error updating voucher:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui voucher." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(request, context);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request, ["admin"]);
    if (!auth.authorized) return auth.response!;

    const { id } = await params;
    const voucherId = parseInt(id);
    if (isNaN(voucherId)) {
      return NextResponse.json({ success: false, message: "ID voucher tidak valid." }, { status: 400 });
    }

    const voucher = await prisma.voucher.findUnique({
      where: { id: voucherId },
    });

    if (!voucher) {
      return NextResponse.json({ success: false, message: "Voucher tidak ditemukan." }, { status: 404 });
    }

    await prisma.voucher.delete({
      where: { id: voucherId },
    });

    await prisma.auditLog.create({
      data: {
        user: auth.user?.name || "Admin",
        action: "VOUCHER_DELETED",
        details: `Voucher promo "${voucher.code}" dihapus permanen dari sistem`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Voucher "${voucher.code}" berhasil dihapus.`,
    });
  } catch (error: any) {
    console.error("Error deleting voucher:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus voucher." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const calls = await prisma.waiterCall.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: calls,
    });
  } catch (error: any) {
    console.error("Error fetching waiter calls:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat panggilan pelayan." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    const call = await prisma.waiterCall.update({
      where: { id: parseInt(id) },
      data: { status: "completed" },
    });

    return NextResponse.json({
      success: true,
      message: "Panggilan pelayan telah diselesaikan.",
      data: call,
    });
  } catch (error: any) {
    console.error("Error updating waiter call:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui panggilan pelayan." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return PATCH(request);
}

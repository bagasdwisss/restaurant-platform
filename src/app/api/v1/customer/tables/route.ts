import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseTimeToMinutes } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const timeSlot = searchParams.get("timeSlot");

    const allTables = await prisma.table.findMany({
      orderBy: [{ area: "asc" }, { tableNumber: "asc" }],
    });

    if (!date) {
      // Return default table list if no date specified
      return NextResponse.json({
        success: true,
        data: allTables.map((t) => ({
          ...t,
          status: "available",
          isAvailableForSlot: true,
        })),
      });
    }

    const todayDate = new Date().toISOString().slice(0, 10);
    const isToday = date === todayDate;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // 1. Fetch all reservations on target date that are not cancelled
    const reservationsOnDate = await prisma.order.findMany({
      where: {
        reservationDate: date,
        status: { notIn: ["cancelled", "voided"] },
        tableId: { not: null },
      },
      select: {
        id: true,
        tableId: true,
        reservationTime: true,
        customerName: true,
        status: true,
      },
    });

    // 2. If date is today, check active dine-in orders within last 2 hours (120 mins)
    const activeDineInTableIds = new Set<number>();
    if (isToday) {
      const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000);
      const dineInOrders = await prisma.order.findMany({
        where: {
          orderType: "dine_in",
          status: { in: ["pending", "confirmed", "preparing", "served"] },
          createdAt: { gte: twoHoursAgo },
          tableId: { not: null },
        },
        select: { tableId: true },
      });
      dineInOrders.forEach((o) => {
        if (o.tableId) activeDineInTableIds.add(o.tableId);
      });
    }

    const targetMinutes = timeSlot ? parseTimeToMinutes(timeSlot) : null;

    // 3. Evaluate dynamic availability per table
    const dynamicTables = allTables.map((table) => {
      let isBooked = false;
      let bookedReason = "";

      // Check collision with reservations on target date within 2 hours (120 min) window
      if (targetMinutes !== null) {
        const conflictingReservation = reservationsOnDate.find((res) => {
          if (res.tableId !== table.id || !res.reservationTime) return false;
          const resMinutes = parseTimeToMinutes(res.reservationTime);
          const diffMinutes = Math.abs(targetMinutes - resMinutes);
          return diffMinutes < 120; // 2 hours collision window
        });

        if (conflictingReservation) {
          isBooked = true;
          bookedReason = `Telah direservasi untuk sesi ${conflictingReservation.reservationTime}`;
        }
      } else {
        // If no time slot is specified yet, check if any reservation exists on this date
        const hasAnyReservation = reservationsOnDate.some((res) => res.tableId === table.id);
        if (hasAnyReservation) {
          isBooked = true;
          bookedReason = "Telah memiliki reservasi pada tanggal ini";
        }
      }

      // If requested date is today and physical dine-in guests are eating right now
      if (isToday && !isBooked && activeDineInTableIds.has(table.id)) {
        if (targetMinutes !== null) {
          const diffFromNow = Math.abs(targetMinutes - currentMinutes);
          if (diffFromNow < 120) {
            isBooked = true;
            bookedReason = "Sedang digunakan tamu saat ini (estimasi selesai 1-2 jam)";
          }
        } else {
          isBooked = true;
          bookedReason = "Sedang digunakan tamu dine-in";
        }
      }

      return {
        ...table,
        status: isBooked ? "occupied" : "available",
        isAvailableForSlot: !isBooked,
        bookedReason: isBooked ? bookedReason : null,
        orders: [], // Cleared so client logic doesn't misinterpret unrelated orders
      };
    });

    return NextResponse.json({
      success: true,
      data: dynamicTables,
      query: {
        date,
        timeSlot: timeSlot || null,
        isToday,
      },
    });
  } catch (error: any) {
    console.error("Error fetching dynamic table availability:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat ketersediaan meja." },
      { status: 500 }
    );
  }
}

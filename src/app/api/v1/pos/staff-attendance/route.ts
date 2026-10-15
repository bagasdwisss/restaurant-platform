import { NextRequest, NextResponse } from "next/server";
import {
  INITIAL_STAFF_ROSTER,
  getTodayAttendances,
  clockInStaff,
  toggleBreakStaff,
  clockOutStaff,
} from "@/lib/attendance-store";

export async function GET() {
  try {
    const records = getTodayAttendances();
    const onDutyCount = records.filter((r) => r.status === "on_duty").length;
    const onBreakCount = records.filter((r) => r.status === "on_break").length;

    return NextResponse.json({
      success: true,
      roster: INITIAL_STAFF_ROSTER.map(({ pin, ...rest }) => rest), // Omit PIN for security
      records,
      stats: {
        totalRoster: INITIAL_STAFF_ROSTER.length,
        onDutyCount,
        onBreakCount,
        totalClockedIn: onDutyCount + onBreakCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal memuat data presensi staf." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, staffId, pin, method = "pin" } = body;

    if (!staffId) {
      return NextResponse.json(
        { success: false, message: "ID Karyawan wajib disertakan." },
        { status: 400 }
      );
    }

    const staff = INITIAL_STAFF_ROSTER.find((s) => s.id === staffId);
    if (!staff) {
      return NextResponse.json(
        { success: false, message: "Karyawan tidak ditemukan." },
        { status: 404 }
      );
    }

    // Verify PIN if method is PIN
    if (method === "pin" && action === "clock_in") {
      if (staff.pin !== pin) {
        return NextResponse.json(
          { success: false, message: "PIN Karyawan salah. Silakan coba lagi." },
          { status: 401 }
        );
      }
    }

    let result;
    if (action === "clock_in") {
      result = clockInStaff({ staffId, verificationMethod: method });
    } else if (action === "toggle_break") {
      result = toggleBreakStaff(staffId);
    } else if (action === "clock_out") {
      result = clockOutStaff(staffId);
    } else {
      return NextResponse.json(
        { success: false, message: "Aksi presensi tidak dikenal." },
        { status: 400 }
      );
    }

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      record: result.record,
      records: getTodayAttendances(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Terjadi kendala saat memproses presensi staf." },
      { status: 500 }
    );
  }
}

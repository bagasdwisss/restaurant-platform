// In-memory persistent store for Staff Attendance & Biometric / PIN Time-Clock

export interface StaffMember {
  id: string;
  name: string;
  role: "Executive Chef" | "Head Barista" | "Kasir Utama" | "Floor Captain" | "Sommelier" | "Sous Chef";
  pin: string;
  avatar: string;
  defaultShift: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  date: string;
  shiftName: string;
  clockInTime: string;
  clockOutTime: string | null;
  breakStartTime: string | null;
  breakEndTime: string | null;
  totalBreakMinutes: number;
  totalWorkingMinutes: number;
  status: "on_duty" | "on_break" | "clocked_out";
  verificationMethod: "pin" | "biometric";
  punctuality: "Tepat Waktu" | "Terlambat (10m)" | "Shift Lebih Awal";
  notes?: string;
}

export const INITIAL_STAFF_ROSTER: StaffMember[] = [
  {
    id: "STF-01",
    name: "Chef Antoine Laurent",
    role: "Executive Chef",
    pin: "1234",
    avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80",
    defaultShift: "Shift Siang (10:00 - 18:00)",
  },
  {
    id: "STF-02",
    name: "Siti Rahmawati",
    role: "Kasir Utama",
    pin: "8888",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    defaultShift: "Shift Pagi (08:00 - 16:00)",
  },
  {
    id: "STF-03",
    name: "Budi Santoso",
    role: "Head Barista",
    pin: "5555",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    defaultShift: "Shift Malam (15:00 - 23:00)",
  },
  {
    id: "STF-04",
    name: "Dewi Lestari",
    role: "Floor Captain",
    pin: "7777",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    defaultShift: "Shift Malam (15:00 - 23:00)",
  },
  {
    id: "STF-05",
    name: "Jean-Pierre Blanc",
    role: "Sommelier",
    pin: "9999",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    defaultShift: "Shift Malam (16:00 - 23:30)",
  },
];

const globalForAttendance = global as unknown as {
  attendanceRecords?: AttendanceRecord[];
};

export const attendanceRecords: AttendanceRecord[] =
  globalForAttendance.attendanceRecords || [
    {
      id: "ATT-INIT-01",
      staffId: "STF-02",
      staffName: "Siti Rahmawati",
      role: "Kasir Utama",
      date: new Date().toISOString().slice(0, 10),
      shiftName: "Shift Pagi (08:00 - 16:00)",
      clockInTime: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
      clockOutTime: null,
      breakStartTime: null,
      breakEndTime: null,
      totalBreakMinutes: 0,
      totalWorkingMinutes: 210,
      status: "on_duty",
      verificationMethod: "biometric",
      punctuality: "Tepat Waktu",
    },
    {
      id: "ATT-INIT-02",
      staffId: "STF-01",
      staffName: "Chef Antoine Laurent",
      role: "Executive Chef",
      date: new Date().toISOString().slice(0, 10),
      shiftName: "Shift Siang (10:00 - 18:00)",
      clockInTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      clockOutTime: null,
      breakStartTime: null,
      breakEndTime: null,
      totalBreakMinutes: 0,
      totalWorkingMinutes: 120,
      status: "on_duty",
      verificationMethod: "pin",
      punctuality: "Tepat Waktu",
    },
  ];

if (process.env.NODE_ENV !== "production") {
  globalForAttendance.attendanceRecords = attendanceRecords;
}

export function getTodayAttendances() {
  const today = new Date().toISOString().slice(0, 10);
  return attendanceRecords.filter((a) => a.date === today);
}

export function clockInStaff({
  staffId,
  verificationMethod = "pin",
}: {
  staffId: string;
  verificationMethod?: "pin" | "biometric";
}): { success: boolean; message: string; record?: AttendanceRecord } {
  const staff = INITIAL_STAFF_ROSTER.find((s) => s.id === staffId);
  if (!staff) {
    return { success: false, message: "Karyawan tidak terdaftar dalam sistem." };
  }

  const today = new Date().toISOString().slice(0, 10);
  const existing = attendanceRecords.find(
    (a) => a.staffId === staffId && a.date === today && a.status !== "clocked_out"
  );

  if (existing) {
    return {
      success: false,
      message: `${staff.name} saat ini sudah aktif (${existing.status === "on_duty" ? "Sedang Bertugas" : "Sedang Istirahat"}).`,
    };
  }

  const newRecord: AttendanceRecord = {
    id: `ATT-${Date.now()}`,
    staffId: staff.id,
    staffName: staff.name,
    role: staff.role,
    date: today,
    shiftName: staff.defaultShift,
    clockInTime: new Date().toISOString(),
    clockOutTime: null,
    breakStartTime: null,
    breakEndTime: null,
    totalBreakMinutes: 0,
    totalWorkingMinutes: 0,
    status: "on_duty",
    verificationMethod,
    punctuality: "Tepat Waktu",
    notes: `Presensi masuk via ${verificationMethod.toUpperCase()}`,
  };

  attendanceRecords.unshift(newRecord);
  return {
    success: true,
    message: `Presensi Masuk Berhasil! Selamat bertugas, ${staff.name} (${staff.role}).`,
    record: newRecord,
  };
}

export function toggleBreakStaff(staffId: string): { success: boolean; message: string; record?: AttendanceRecord } {
  const today = new Date().toISOString().slice(0, 10);
  const record = attendanceRecords.find(
    (a) => a.staffId === staffId && a.date === today && a.status !== "clocked_out"
  );

  if (!record) {
    return { success: false, message: "Karyawan belum melakukan presensi masuk hari ini." };
  }

  if (record.status === "on_duty") {
    record.status = "on_break";
    record.breakStartTime = new Date().toISOString();
    return {
      success: true,
      message: `${record.staffName} memulai istirahat (Break).`,
      record,
    };
  } else {
    record.status = "on_duty";
    record.breakEndTime = new Date().toISOString();
    if (record.breakStartTime) {
      const diffMins = Math.round((Date.now() - new Date(record.breakStartTime).getTime()) / 60000);
      record.totalBreakMinutes += Math.max(1, diffMins);
    }
    return {
      success: true,
      message: `${record.staffName} selesai istirahat dan kembali bertugas di lantai.`,
      record,
    };
  }
}

export function clockOutStaff(staffId: string): { success: boolean; message: string; record?: AttendanceRecord } {
  const today = new Date().toISOString().slice(0, 10);
  const record = attendanceRecords.find(
    (a) => a.staffId === staffId && a.date === today && a.status !== "clocked_out"
  );

  if (!record) {
    return { success: false, message: "Karyawan tidak memiliki sesi aktif untuk di-clock out." };
  }

  record.clockOutTime = new Date().toISOString();
  record.status = "clocked_out";
  const diffMins = Math.round((Date.now() - new Date(record.clockInTime).getTime()) / 60000);
  record.totalWorkingMinutes = Math.max(1, diffMins - record.totalBreakMinutes);

  return {
    success: true,
    message: `Presensi Selesai Shift (Clock Out) untuk ${record.staffName} berhasil dicatat. Total jam kerja: ${Math.floor(record.totalWorkingMinutes / 60)}j ${record.totalWorkingMinutes % 60}m.`,
    record,
  };
}

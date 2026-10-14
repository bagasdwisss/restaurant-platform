import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["admin"]);
    if (!auth.authorized) return auth.response!;

    const shifts = await prisma.cashierShift.findMany({
      orderBy: { openedAt: "desc" },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const cashierOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        table: true,
        payments: true,
        shift: true,
      },
    });

    let systemUpdates = await prisma.systemUpdate.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (systemUpdates.length === 0) {
      const initialUpdates = [
        {
          version: "v2.5.0",
          releaseDate: "2026-10-14",
          title: "Log Kasir & Audit Terpisah, Filter Aktivitas, dan Desain Full Responsif",
          status: "latest",
          badge: "Rilis Terkini",
          features: [
            "Pemisahan Log Kasir (Shift, Pembayaran, Void, Pindah Meja) & Log Audit Sistem (Login, User, Menu, Meja)",
            "Fitur Filter Interaktif Berdasarkan Aksi & Kategori (Login, Perubahan User, Pembayaran, Shift, Meja, Menu)",
            "Hub Riwayat Pembaruan & Fitur Versi Sistem (Changelog Hub)",
            "Desain 100% Fully Responsive di Seluruh Perangkat Mobile, Tablet, dan Desktop",
            "Perbaikan Alur 1-Klik Transaksi Pembayaran dan Sticky Mobile Action Dock",
            "Pemberian Akses Profil Khusus Pembeli dan Pembatasan Booking untuk Staf",
          ],
        },
        {
          version: "v2.4.0",
          releaseDate: "2026-10-14",
          title: "Migrasi Neon.tech Cloud DB Mandiri & Code Splitting Lazy Loading",
          status: "stable",
          badge: "Stabil",
          features: [
            "Koneksi Database Cloud PostgreSQL Permanen (Neon.tech Serverless Pooler)",
            "Penyimpanan Abadi untuk User, Menu, Meja, Shift, dan Audit Log",
            "Code Splitting & Dynamic Lazy Loading pada Tab Ringkasan Sales & Analitik",
            "Integrasi Vercel Web Analytics Real-Time",
          ],
        },
        {
          version: "v2.3.0",
          releaseDate: "2026-10-14",
          title: "1-Click Reservation Table Flow & Dynamic Aspect Ratio",
          status: "legacy",
          badge: "Arsip",
          features: [
            "Pemilihan Meja Denah Lantai Langsung Mengunci Slot & Lanjut ke Pembayaran 1-Klik",
            "Perbaikan Tinggi Kolaps Foto Menu dengan Tailwind Aspect Ratio 4:3",
            "Validasi Ketat Kapasitas Meja & Tamu (Pencocokan Kursi Otomatis)",
            "Tombol Booking Reservasi Universal di Navbar Desktop & Mobile",
          ],
        },
        {
          version: "v2.2.0",
          releaseDate: "2026-10-14",
          title: "Modular Code Architecture & Digital Payment Accordion",
          status: "legacy",
          badge: "Arsip",
          features: [
            "Refaktor Kode Monolitik Menjadi Sub-Komponen Modular Terpisah",
            "Accordion Saluran Pembayaran Terpadu (QRIS, 4 Bank VA, 4 E-Wallet)",
            "Sistem Autentikasi Cepat dengan Unique Key Login",
          ],
        },
        {
          version: "v2.1.0",
          releaseDate: "2026-10-14",
          title: "Visual Single Floor Plan & Digital QR Receipt",
          status: "legacy",
          badge: "Arsip",
          features: [
            "Arsitektur Denah Lantai Restoran Terpadu 1 Lantai (Grand Salle, Jardin, Mezzanine)",
            "Generator QR Pass Meja dengan Verifikasi Digital Struk Transaksi",
            "Sistem Rekonsiliasi Kasir & Pelacakan Selisih Kas Fisik",
          ],
        },
        {
          version: "v2.0.0",
          releaseDate: "2026-10-14",
          title: "Peluncuran Perdana Platform Restoran Savoria Haute Cuisine",
          status: "legacy",
          badge: "Arsip",
          features: [
            "Manajemen Katalog Hidangan & Modul Resep Otomatis Pengurang Stok Bahan",
            "Sistem Reservasi Jamuan Meja Digital",
            "Integrasi Terminal Kasir POS & Panggilan Pelayan (Waiter Call)",
          ],
        },
      ];

      for (const item of initialUpdates) {
        await prisma.systemUpdate.create({
          data: {
            ...item,
            features: JSON.stringify(item.features),
          },
        });
      }

      systemUpdates = await prisma.systemUpdate.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    const formattedUpdates = systemUpdates.map((u) => {
      let features: string[] = [];
      try {
        features = typeof u.features === "string" ? JSON.parse(u.features) : u.features;
      } catch {
        features = [u.features];
      }
      return {
        ...u,
        features: Array.isArray(features) ? features : [features],
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        shifts,
        auditLogs,
        cashierOrders,
        systemUpdates: formattedUpdates,
      },
    });
  } catch (error: any) {
    console.error("Error fetching shift history:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat riwayat shift kasir." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ["admin"]);
    if (!auth.authorized) return auth.response!;

    const body = await request.json();
    const { title, features, badge } = body;

    if (!title || !features) {
      return NextResponse.json(
        { success: false, message: "Judul dan daftar fitur pembaruan wajib diisi." },
        { status: 400 }
      );
    }

    // Clean features list
    let featureList: string[] = [];
    if (Array.isArray(features)) {
      featureList = features.map((f: any) => String(f).trim()).filter(Boolean);
    } else if (typeof features === "string") {
      featureList = features
        .split("\n")
        .map((f) => f.replace(/^[-*•\d.]+\s*/, "").trim())
        .filter(Boolean);
    }

    if (featureList.length === 0) {
      return NextResponse.json(
        { success: false, message: "Minimal cantumkan 1 fitur baru yang diupdate." },
        { status: 400 }
      );
    }

    // Fetch the latest system update to determine version bump
    const latestUpdate = await prisma.systemUpdate.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let major = 2;
    let minor = 5;
    let patch = 0;

    if (latestUpdate?.version) {
      const match = latestUpdate.version.match(/(\d+)\.(\d+)\.(\d+)/);
      if (match) {
        major = parseInt(match[1], 10);
        minor = parseInt(match[2], 10);
        patch = parseInt(match[3], 10);
      }
    }

    const featureCount = featureList.length;

    /**
     * Automatic Semantic Versioning Rules (Per user prompt):
     * 1. If featureCount >= 15:
     *    Major increment, minor and patch reset to 0 (e.g. 2.5.0 -> 3.0.0)
     * 2. If featureCount >= 5 && featureCount < 15:
     *    Minor increment, patch reset to 0 (e.g. 2.5.0 -> 2.6.0)
     * 3. If featureCount < 5:
     *    Patch increment (e.g. 2.5.0 -> 2.5.1)
     */
    if (featureCount >= 15) {
      major += 1;
      minor = 0;
      patch = 0;
    } else if (featureCount >= 5) {
      minor += 1;
      patch = 0;
    } else {
      patch += 1;
    }

    const newVersion = `v${major}.${minor}.${patch}`;

    // Mark previous "latest" updates as "stable"
    await prisma.systemUpdate.updateMany({
      where: { status: "latest" },
      data: { status: "stable", badge: "Stabil" },
    });

    const todayDate = new Date().toISOString().split("T")[0];

    const createdUpdate = await prisma.systemUpdate.create({
      data: {
        version: newVersion,
        releaseDate: todayDate,
        title,
        status: "latest",
        badge: badge?.trim() || "Rilis Terkini",
        features: JSON.stringify(featureList),
      },
    });

    // Record in AuditLog
    await prisma.auditLog.create({
      data: {
        user: auth.user?.name || auth.user?.email || "Admin",
        action: "SYSTEM_UPDATE_CREATED",
        details: `Rilis versi ${newVersion} (${title}) dengan ${featureCount} pembaruan fitur berhasil dicatat ke database.`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...createdUpdate,
        features: featureList,
      },
      message: `Pembaruan sistem versi ${newVersion} berhasil dipublikasikan.`,
    });
  } catch (error: any) {
    console.error("Error creating system update:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mencatat pembaruan sistem." },
      { status: 500 }
    );
  }
}

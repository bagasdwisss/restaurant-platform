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

    const systemUpdates = [
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

    return NextResponse.json({
      success: true,
      data: {
        shifts,
        auditLogs,
        cashierOrders,
        systemUpdates,
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

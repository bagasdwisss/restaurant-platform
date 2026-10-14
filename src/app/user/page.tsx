"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { formatIDR, formatDate } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Users,
  UtensilsCrossed,
  MapPin,
  CreditCard,
  QrCode,
  CheckCircle2,
  Printer,
  Sparkles,
  ChevronRight,
  LogOut,
  RefreshCw,
  ShoppingBag,
  Receipt,
  Search,
  ExternalLink,
  ShieldCheck,
  Star,
  Award,
  Crown,
  X,
} from "lucide-react";

export default function UserPortalPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"reserve" | "active" | "history" | "menu">("reserve");
  const [tables, setTables] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Selected receipt modal state
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [receiptQrDataUrl, setReceiptQrDataUrl] = useState<string>("");

  // 1. Fetch tables
  const fetchTables = async () => {
    try {
      const res = await fetch("/api/v1/pos/tables");
      const data = await res.json();
      if (data.success) setTables(data.data);
    } catch {}
  };

  // 2. Fetch menus
  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/v1/customer/menus");
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch {}
  };

  // 3. Fetch my orders
  const fetchMyOrders = useCallback(async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/v1/customer/my-orders?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setMyOrders(data.data);
      }
    } catch {
    } finally {
      setLoadingOrders(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTables();
    fetchMenus();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyOrders();
      // Auto-poll active orders every 10s
      const interval = setInterval(fetchMyOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [user, fetchMyOrders]);

  // Generate QR Code when a receipt is opened
  useEffect(() => {
    if (selectedReceipt) {
      const payload = JSON.stringify({
        restaurant: "L'Étoile Royale",
        bookingCode: selectedReceipt.orderNumber,
        table: selectedReceipt.table?.tableNumber || "VIP",
        guestCount: selectedReceipt.guestCount || 2,
        date: selectedReceipt.reservationDate || selectedReceipt.createdAt,
        total: selectedReceipt.totalAmount,
        status: selectedReceipt.paymentStatus || "PAID",
      });

      QRCode.toDataURL(payload, {
        width: 260,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      })
        .then((url) => setReceiptQrDataUrl(url))
        .catch(() => {});
    } else {
      setReceiptQrDataUrl("");
    }
  }, [selectedReceipt]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
          <span className="text-sm font-serif">Memuat lounge VIP pelanggan...</span>
        </div>
      </div>
    );
  }

  // Active orders filter
  const activeOrdersList = myOrders.filter((o) =>
    ["pending", "confirmed", "preparing", "served"].includes(o.status)
  );

  // History orders filter
  const historyOrdersList = myOrders.filter((o) =>
    ["completed", "cancelled", "voided"].includes(o.status)
  );

  const allMenus = categories.flatMap((c) => c.menus || []);
  const filteredMenus = allMenus.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(menuSearch.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" ||
      categories.find((c) => String(c.id) === selectedCategory)?.menus?.some((item: any) => item.id === m.id);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Navigation Header */}
      <header className="border-b border-amber-500/10 px-6 py-4 backdrop-blur-md sticky top-0 z-40 bg-[#0a0c10]/85">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <Link
              href="/"
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 text-slate-950 flex items-center justify-center font-serif font-black text-xl shadow-lg shadow-amber-500/20 border border-amber-200/40"
            >
              👑
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg font-bold tracking-wider text-white">
                  VIP Patron Lounge
                </h1>
                <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono uppercase font-semibold">
                  Customer
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-light">
                {user ? `Selamat Datang, ${user.name} (@${user.username})` : "Sesi Tamu Mandiri"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/reservation"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reservasi 5 Langkah</span>
              <span className="sm:hidden">Reservasi</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-slate-400 hidden md:inline-block">
                  {user.email}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-800 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer text-slate-300"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
              >
                Masuk / Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 space-y-6">
        {/* Luxury Banner */}
        <div className="bg-gradient-to-r from-[#181d2a] via-[#11141c] to-[#181d2a] border border-amber-500/25 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-300" />
              <span>Haute Gastronomie • L&apos;Étoile Royale Experience</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Reservasi Meja & Pengalaman Santap Bintang 5
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
              Jalankan alur reservasi lengkap: tentukan tanggal dan jumlah tamu (pax), kurasi hidangan adiboga Miyazaki Wagyu & Caviar, pilih meja di Grand Salon atau VIP Suite, bayar langsung secara aman, dan terima struk digital dengan QR verifikasi resmi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
            <Link
              href="/reservation"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 flex items-center gap-2 hover:scale-[1.02] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Buat Reservasi Baru (5 Langkah)</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            {activeOrdersList.length > 0 && (
              <button
                onClick={() => setActiveTab("active")}
                className="px-4 py-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-2 animate-pulse cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>{activeOrdersList.length} Reservasi Aktif</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-amber-500/10 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab("reserve")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "reserve"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "bg-[#11141c] text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Alur Reservasi & Meja</span>
          </button>

          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
              activeTab === "active"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "bg-[#11141c] text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pesanan & Reservasi Aktif</span>
            {activeOrdersList.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {activeOrdersList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "history"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "bg-[#11141c] text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Riwayat Transaksi & Struk</span>
            {historyOrdersList.length > 0 && (
              <span className="text-[10px] opacity-75 font-mono">({historyOrdersList.length})</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("menu")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "menu"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "bg-[#11141c] text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Katalog Menu Michelin</span>
          </button>
        </div>

        {/* TAB 1: ALUR RESERVASI & MEJA */}
        {activeTab === "reserve" && (
          <div className="space-y-6">
            {/* Quick 5-Step Card banner */}
            <div className="bg-[#11141c] border border-amber-500/20 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                    5-Step Dining Flow
                  </span>
                  <h3 className="font-serif text-xl font-bold text-white mt-0.5">
                    Alur Reservasi Pelanggan Terpadu
                  </h3>
                  <p className="text-xs text-slate-400 font-light mt-1">
                    Ikuti 5 langkah untuk memesan meja, hidangan, pembayaran, dan menerima struk lengkap.
                  </p>
                </div>
                <Link
                  href="/reservation"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 self-start sm:self-auto transition-all"
                >
                  <span>Mulai Reservasi 5 Langkah</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* 5 mini steps */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-800 text-xs">
                <div className="p-3 rounded-2xl bg-[#161a24] border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-1">1. Tanggal & Pax</span>
                  <p className="text-[11px] text-slate-400">Pilih hari & jumlah orang</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#161a24] border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-1">2. Menu Adiboga</span>
                  <p className="text-[11px] text-slate-400">Pilih menu & varian</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#161a24] border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-1">3. Pilih Meja</span>
                  <p className="text-[11px] text-slate-400">Grand Salon / VIP Suite</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#161a24] border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-1">4. Pembayaran</span>
                  <p className="text-[11px] text-slate-400">QRIS / Kartu Kredit</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#161a24] border border-amber-500/30">
                  <span className="text-amber-300 font-bold block mb-1">5. Struk & QR</span>
                  <p className="text-[11px] text-slate-400">Struk lengkap rincian</p>
                </div>
              </div>
            </div>

            {/* Tables Grid */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Denah & Ketersediaan Meja</h3>
                  <p className="text-xs text-slate-400 font-light">
                    Pilih meja yang tersedia untuk reservasi langsung atau pemesanan dine-in di restoran.
                  </p>
                </div>
                <button
                  onClick={fetchTables}
                  className="px-3 py-1.5 rounded-xl bg-[#11141c] border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 self-start cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Meja</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {tables.map((tbl) => {
                  const isAvailable = tbl.status === "available";
                  const isOccupied = tbl.status === "occupied";
                  return (
                    <div
                      key={tbl.id}
                      className={`rounded-2xl p-4 border flex flex-col justify-between transition-all ${
                        isAvailable
                          ? "bg-[#11141c] border-amber-500/20 hover:border-amber-500 shadow-md group"
                          : isOccupied
                          ? "bg-blue-950/20 border-blue-900/40 opacity-80"
                          : "bg-slate-900/40 border-slate-800/40 opacity-60"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
                            {tbl.area}
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isAvailable
                                ? "bg-emerald-400"
                                : isOccupied
                                ? "bg-blue-400 animate-pulse"
                                : "bg-amber-400"
                            }`}
                          />
                        </div>
                        <div>
                          <h4 className="font-serif text-base font-bold text-white">{tbl.tableNumber}</h4>
                          <p className="text-[11px] text-slate-400 font-light">
                            Kapasitas {tbl.capacity} Pax
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800/60 mt-3">
                        <Link
                          href={`/reservation`}
                          className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            isAvailable
                              ? "bg-amber-500/15 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                          }`}
                        >
                          <span>{isAvailable ? "Reservasi Meja" : "Lihat Sesi"}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PESANAN & RESERVASI AKTIF */}
        {activeTab === "active" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Lacak Reservasi Aktif Anda</h3>
                <p className="text-xs text-slate-400 font-light">
                  Pantau verifikasi Maître D&apos;, persiapan chef di dapur, hingga hidangan tersaji di meja Anda.
                </p>
              </div>
              <button
                onClick={fetchMyOrders}
                disabled={loadingOrders}
                className="px-3 py-1.5 rounded-xl bg-[#11141c] border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? "animate-spin" : ""}`} />
                <span>Update Status</span>
              </button>
            </div>

            {activeOrdersList.length === 0 ? (
              <div className="bg-[#11141c] border border-slate-800 rounded-3xl p-12 text-center space-y-4">
                <UtensilsCrossed className="w-12 h-12 text-amber-500/40 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-serif text-base font-bold text-white">
                    Belum Ada Reservasi yang Sedang Aktif
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto font-light">
                    Buat reservasi meja dan pilih menu mewah Anda sekarang lewat alur 5 langkah kami.
                  </p>
                </div>
                <Link
                  href="/reservation"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Mulai Reservasi 5 Langkah</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrdersList.map((order) => {
                  const statusSteps = [
                    { key: "pending", label: "Menunggu Konfirmasi", desc: "Pesanan diterima Maître D'" },
                    { key: "confirmed", label: "Dikonfirmasi", desc: "Meja & stok bahan disiapkan" },
                    { key: "preparing", label: "Sedang Dimasak", desc: "Chef meracik hidangan di dapur" },
                    { key: "served", label: "Hidangan Tersaji", desc: "Makanan tersaji sempurna" },
                  ];

                  const currentIndex = statusSteps.findIndex((s) => s.key === order.status);

                  return (
                    <div
                      key={order.id}
                      className="bg-[#11141c] border border-amber-500/20 rounded-3xl p-6 shadow-xl space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-amber-400 text-sm">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold uppercase">
                              {order.table?.tableNumber || "Meja Reservasi"}
                            </span>
                            {order.table?.area && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({order.table.area})
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-light">
                            {order.reservationDate
                              ? `Jadwal: ${formatDate(order.reservationDate)} • ${order.reservationTime || "Gala Dinner"}`
                              : `Dipesan: ${formatDate(order.createdAt)}`}{" "}
                            • {order.guestCount ? `${order.guestCount} Tamu` : "2 Tamu"} •{" "}
                            {order.items.length} Menu
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-400 block font-light">Total Pembayaran</span>
                          <span className="font-serif text-lg font-black text-amber-400">
                            {formatIDR(order.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Stepper Status */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-300 block">
                          Progress Jamuan:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {statusSteps.map((step, idx) => {
                            const isDone = currentIndex >= idx;
                            const isCurrent = currentIndex === idx;
                            return (
                              <div
                                key={step.key}
                                className={`p-3 rounded-2xl border transition-all ${
                                  isCurrent
                                    ? "bg-amber-500/15 border-amber-500 text-amber-300"
                                    : isDone
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                    : "bg-[#0a0c10] border-slate-800 text-slate-500"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border border-slate-600 text-[10px] flex items-center justify-center font-bold">
                                      {idx + 1}
                                    </div>
                                  )}
                                  <span className="text-xs font-bold">{step.label}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-light leading-tight">
                                  {step.desc}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold text-slate-400 block">
                          Menu Yang Dipesan:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {order.items.map((it: any) => (
                            <div
                              key={it.id}
                              className="p-3 rounded-xl bg-[#0a0c10] border border-slate-800 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-amber-400 font-mono">
                                  {it.quantity}x
                                </span>
                                <div>
                                  <span className="text-slate-200 font-medium">{it.menu?.name}</span>
                                  {it.modifiers && it.modifiers.length > 0 && (
                                    <span className="block text-[10px] text-amber-300/80">
                                      {it.modifiers.map((m: any) => m.name).join(", ")}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="font-mono text-slate-300">
                                {formatIDR(it.subtotal)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-light">Status Pembayaran:</span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase font-mono ${
                              order.paymentStatus === "paid"
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {order.paymentStatus === "paid" ? "Lunas (Paid)" : "Menunggu Pembayaran"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedReceipt(order)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Lihat Struk Lengkap</span>
                          </button>

                          {order.table?.qrToken && (
                            <Link
                              href={`/table/${order.table.qrToken}`}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold flex items-center gap-1.5 transition-all"
                            >
                              <span>Layar Meja</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RIWAYAT PESANAN & STRUK LENGKAP */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Arsip Reservasi & Struk Digital</h3>
                <p className="text-xs text-slate-400 font-light">
                  Seluruh jamuan bersantap Anda yang telah selesai tersimpan rapi beserta struk resmi.
                </p>
              </div>
            </div>

            {historyOrdersList.length === 0 ? (
              <div className="bg-[#11141c] border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <Receipt className="w-12 h-12 text-amber-500/40 mx-auto" />
                <h4 className="font-serif text-base font-bold text-white">Belum Ada Riwayat Transaksi Selesai</h4>
                <p className="text-xs text-slate-400 font-light">
                  Transaksi reservasi Anda yang telah diselesaikan akan tercatat di sini secara permanen.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {historyOrdersList.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-[#11141c] border border-amber-500/15 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-300 text-xs">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase font-mono">
                          {order.status}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {order.table?.tableNumber || "Private Salon"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-light">
                        {order.reservationDate
                          ? `Jadwal: ${formatDate(order.reservationDate)} • ${order.reservationTime || "Gala"}`
                          : `Selesai: ${formatDate(order.createdAt)}`}{" "}
                        • {order.items.length} item • Metode: {(order.paymentMethod || "QRIS").toUpperCase()}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs font-serif font-black text-amber-400">
                          {formatIDR(order.totalAmount)}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedReceipt(order)}
                        className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Buka Struk</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: KATALOG MENU */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Katalog Haute Cuisine Michelin</h3>
                <p className="text-xs text-slate-400 font-light">
                  Jelajahi sajian mahakarya Executive Chef berbahan Wagyu A5, Caviar, & Black Truffle.
                </p>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Cari hidangan..."
                    className="pl-9 pr-3 py-1.5 bg-[#11141c] border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 bg-[#11141c] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredMenus.map((m) => (
                <div
                  key={m.id}
                  className="bg-[#11141c] border border-amber-500/15 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-xl group"
                >
                  <div className="h-44 w-full relative bg-slate-900 overflow-hidden">
                    {m.image ? (
                      <Image
                        src={m.image}
                        alt={m.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-500/30">
                        <UtensilsCrossed className="w-10 h-10" />
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                        {m.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-light leading-relaxed">
                        {m.description || "Hidangan haute cuisine istimewa dengan bahan impor tersertifikasi."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-3">
                      <span className="font-serif font-bold text-amber-400 text-sm">
                        {formatIDR(m.price)}
                      </span>
                      <Link
                        href="/reservation"
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold text-amber-300 transition-all flex items-center gap-1"
                      >
                        <span>Reservasi</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Digital Struk Lengkap (5-Star Luxury Digital Receipt) */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#0f1218] border border-amber-500/30 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 my-8">
              {/* Close Button */}
              <button
                onClick={() => setSelectedReceipt(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Receipt Header */}
              <div className="text-center space-y-1.5 pb-4 border-b border-amber-500/20">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 text-slate-950 flex items-center justify-center font-serif font-black text-2xl mx-auto shadow-lg shadow-amber-500/20 border border-amber-200/40">
                  👑
                </div>
                <h3 className="font-serif font-black text-xl tracking-wider text-white">
                  L&apos;ÉTOILE ROYALE
                </h3>
                <p className="text-[11px] text-amber-300 uppercase tracking-widest font-serif">
                  Distinction Michelin 3-Star • Grand Salon
                </p>
                <p className="text-[10px] text-slate-500">
                  The Grand Pavilion • SCBD Jakarta • Tel: +62 21 8899 0000
                </p>
                <div className="inline-block mt-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-mono">
                  ✓ LUNAS / PAYMENT CONFIRMED
                </div>
              </div>

              {/* Reservation Meta & Booking Details */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-[#161a24] p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">KODE BOOKING:</span>
                  <span className="font-bold text-amber-300">{selectedReceipt.orderNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">MEJA & SALON:</span>
                  <span className="font-bold text-white">
                    {selectedReceipt.table?.tableNumber || "VIP Salon"}{" "}
                    {selectedReceipt.table?.area && `(${selectedReceipt.table.area})`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">TANGGAL RESERVASI:</span>
                  <span className="font-bold text-slate-200">
                    {selectedReceipt.reservationDate
                      ? formatDate(selectedReceipt.reservationDate)
                      : formatDate(selectedReceipt.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">SESI WAKTU & TAMU:</span>
                  <span className="font-bold text-slate-200">
                    {selectedReceipt.reservationTime || "19:30 Gala"} •{" "}
                    {selectedReceipt.guestCount ? `${selectedReceipt.guestCount} Pax` : "2 Pax"}
                  </span>
                </div>
              </div>

              {/* Itemized Order Dishes */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block font-serif">
                  Rincian Hidangan & Minuman:
                </span>
                <div className="divide-y divide-slate-800/80 max-h-48 overflow-y-auto pr-1 text-xs">
                  {selectedReceipt.items?.map((it: any) => (
                    <div key={it.id} className="py-2.5 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-200">
                          <span className="text-amber-400 font-mono font-bold mr-1.5">
                            {it.quantity}x
                          </span>
                          {it.menu?.name}
                        </div>
                        {it.modifiers && it.modifiers.length > 0 && (
                          <div className="text-[10px] text-amber-300/80 font-mono">
                            {it.modifiers.map((m: any) => m.name).join(", ")}
                          </div>
                        )}
                        {it.notes && (
                          <div className="text-[10px] text-slate-400 italic">
                            Catatan: {it.notes}
                          </div>
                        )}
                      </div>
                      <span className="font-mono font-bold text-slate-200 shrink-0">
                        {formatIDR(it.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="bg-[#161a24] p-4 rounded-2xl border border-slate-800 text-xs font-mono space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Pesanan:</span>
                  <span>{formatIDR(selectedReceipt.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Pajak Restoran (PB1 10%):</span>
                  <span>{formatIDR(selectedReceipt.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Biaya Layanan (Service 5%):</span>
                  <span>{formatIDR(selectedReceipt.serviceCharge)}</span>
                </div>
                <div className="pt-2 border-t border-slate-700/80 flex justify-between font-black text-sm text-white">
                  <span className="font-serif">TOTAL DIBAYAR:</span>
                  <span className="text-amber-400">{formatIDR(selectedReceipt.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>Metode Pembayaran:</span>
                  <span className="uppercase text-amber-300 font-bold">
                    {selectedReceipt.paymentMethod || "QRIS Dinamis"}
                  </span>
                </div>
              </div>

              {/* QR Verification Pass */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-slate-950 space-y-2 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-800">
                  Boarding Pass QR Verifikasi Meja
                </span>
                {receiptQrDataUrl ? (
                  <img
                    src={receiptQrDataUrl}
                    alt="Receipt QR"
                    className="w-36 h-36 object-contain"
                  />
                ) : (
                  <div className="w-36 h-36 bg-slate-100 flex items-center justify-center font-mono text-xs">
                    Generating QR...
                  </div>
                )}
                <p className="text-[10px] text-slate-500 font-light">
                  Tunjukkan QR ini kepada Maître D&apos; saat tiba di L&apos;Étoile Royale.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Cetak Struk / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs transition-colors cursor-pointer"
                >
                  Tutup Struk
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-500/10 px-6 py-6 text-center text-xs text-slate-500">
        <p>L&apos;Étoile Royale • Fine Dining VIP Patron Portal & Reservations</p>
      </footer>
    </div>
  );
}

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
  ArrowRight,
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
      const interval = setInterval(fetchMyOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [user, fetchMyOrders]);

  // Generate QR Code when a receipt is opened
  useEffect(() => {
    if (selectedReceipt) {
      const payload = JSON.stringify({
        restaurant: "SAVORIA Gourmet Dining",
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
        color: { dark: "#18181B", light: "#FFFFFF" },
      })
        .then((url) => setReceiptQrDataUrl(url))
        .catch(() => {});
    } else {
      setReceiptQrDataUrl("");
    }
  }, [selectedReceipt]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-[#18181B]">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200/80">
          <RefreshCw className="w-5 h-5 animate-spin text-[#EA580C]" />
          <span className="text-sm font-medium">Memuat lounge tamu SAVORIA...</span>
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
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] flex flex-col justify-between selection:bg-[#EA580C] selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-slate-200/80 px-3 sm:px-6 py-3.5 sm:py-4 backdrop-blur-md sticky top-0 z-40 bg-[#FDFBF7]/90">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <Link
              href="/"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-serif font-black text-lg sm:text-xl shadow-md shadow-[#EA580C]/20 hover:scale-105 transition-transform shrink-0"
            >
              S
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-serif text-base sm:text-lg font-bold tracking-tight text-[#18181B] truncate">
                  SAVORIA Patron Lounge
                </h1>
                <span className="hidden xs:inline-block text-[10px] bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/20 px-2 py-0.5 rounded-full font-mono uppercase font-semibold">
                  VIP Guest
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#64748B] truncate">
                {user ? `Selamat Datang, ${user.name} (@${user.username})` : "Sesi Tamu Terdaftar"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/reservation"
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs shadow-md shadow-[#EA580C]/25 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reservasi 5 Langkah</span>
              <span className="sm:hidden">Reservasi</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-3 py-1.5 bg-white rounded-full border border-slate-200/80 text-[#64748B] hidden md:inline-block shadow-sm">
                  {user.email}
                </span>
                <button
                  onClick={logout}
                  className="px-3 sm:px-3.5 py-2 rounded-full bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200/80 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer text-[#64748B] shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 sm:px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-[#18181B] border border-slate-200/80 text-xs font-bold transition-all shadow-sm"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 w-full flex-1 space-y-6">
        {/* Luxury Banner */}
        <div className="bg-[#14281D] text-white rounded-3xl p-4 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6 shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#EA580C]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-300 text-xs font-semibold backdrop-blur-sm">
              <Star className="w-3.5 h-3.5 fill-amber-300" />
              <span>Modern Gastronomie • SAVORIA Experience</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Reservasi Meja & Pengalaman Santap Modern
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
              Nikmati alur reservasi terpadu: pilih tanggal dan jumlah tamu, kurasi hidangan istimewa kreasi chef, tentukan meja di Main Dining Room atau Private Salon, selesaikan pembayaran aman, dan terima struk digital dengan QR Pass resmi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 relative z-10 w-full sm:w-auto">
            <Link
              href="/reservation"
              className="flex-1 sm:flex-initial px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs sm:text-sm shadow-xl shadow-[#EA580C]/30 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Reservasi Baru (5 Langkah)</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            {activeOrdersList.length > 0 && (
              <button
                onClick={() => setActiveTab("active")}
                className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer backdrop-blur-sm"
              >
                <Clock className="w-4 h-4 text-[#EA580C]" />
                <span>{activeOrdersList.length} Reservasi Aktif</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pb-1 overflow-x-auto scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0 whitespace-nowrap">
          <button
            onClick={() => setActiveTab("reserve")}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "reserve"
                ? "bg-[#EA580C] text-white shadow-md shadow-[#EA580C]/25"
                : "bg-white text-[#64748B] hover:text-[#18181B] border border-slate-200/80 shadow-sm"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Alur Reservasi & Meja</span>
          </button>

          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 relative ${
              activeTab === "active"
                ? "bg-[#EA580C] text-white shadow-md shadow-[#EA580C]/25"
                : "bg-white text-[#64748B] hover:text-[#18181B] border border-slate-200/80 shadow-sm"
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
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "history"
                ? "bg-[#EA580C] text-white shadow-md shadow-[#EA580C]/25"
                : "bg-white text-[#64748B] hover:text-[#18181B] border border-slate-200/80 shadow-sm"
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
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "menu"
                ? "bg-[#EA580C] text-white shadow-md shadow-[#EA580C]/25"
                : "bg-white text-[#64748B] hover:text-[#18181B] border border-slate-200/80 shadow-sm"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Katalog Menu Istimewa</span>
          </button>
        </div>

        {/* TAB 1: ALUR RESERVASI & MEJA */}
        {activeTab === "reserve" && (
          <div className="space-y-6">
            {/* Quick 5-Step Card banner */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C] font-mono">
                    5-Step Seamless Dining Flow
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B] mt-0.5">
                    Alur Reservasi Pelanggan Terpadu
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] font-light mt-1">
                    Cukup ikuti 5 langkah mudah untuk memesan meja, hidangan, pembayaran, dan menerima receipt lengkap.
                  </p>
                </div>
                <Link
                  href="/reservation"
                  className="px-5 py-2.5 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#EA580C]/25 w-full sm:w-auto transition-all"
                >
                  <span>Mulai Reservasi</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* 5 mini steps */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 pt-4 border-t border-slate-100 text-xs">
                <div className="p-3 sm:p-4 rounded-2xl bg-[#FDFBF7] border border-slate-200/80">
                  <span className="text-[#EA580C] font-bold block mb-1">1. Tanggal & Pax</span>
                  <p className="text-[10px] sm:text-[11px] text-[#64748B]">Tentukan jadwal & jumlah tamu</p>
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-[#FDFBF7] border border-slate-200/80">
                  <span className="text-[#EA580C] font-bold block mb-1">2. Menu Pilihan</span>
                  <p className="text-[10px] sm:text-[11px] text-[#64748B]">Pilih hidangan & varian rasa</p>
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-[#FDFBF7] border border-slate-200/80">
                  <span className="text-[#EA580C] font-bold block mb-1">3. Pilih Meja</span>
                  <p className="text-[10px] sm:text-[11px] text-[#64748B]">Main Hall, Terrace, atau VIP</p>
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-[#FDFBF7] border border-slate-200/80">
                  <span className="text-[#EA580C] font-bold block mb-1">4. Pembayaran</span>
                  <p className="text-[10px] sm:text-[11px] text-[#64748B]">QRIS, Kartu Kredit, atau Tunai</p>
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-amber-50/60 border border-amber-200 col-span-2 sm:col-span-1">
                  <span className="text-amber-800 font-bold block mb-1">5. Struk & QR Pass</span>
                  <p className="text-[10px] sm:text-[11px] text-amber-700">Digital receipt dengan verifikasi</p>
                </div>
              </div>
            </div>

            {/* Tables Grid */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#18181B]">
                    Denah & Ketersediaan Meja
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Pilih meja yang tersedia untuk reservasi langsung atau pemesanan dine-in di restoran.
                  </p>
                </div>
                <button
                  onClick={fetchTables}
                  className="px-4 py-2 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-[#64748B] hover:text-[#18181B] flex items-center gap-1.5 self-start cursor-pointer shadow-sm hover:shadow"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Perbarui Status Meja</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {tables.map((tbl) => {
                  const isAvailable = tbl.status === "available";
                  const isOccupied = tbl.status === "occupied";
                  return (
                    <div
                      key={tbl.id}
                      className={`rounded-2xl p-4 border flex flex-col justify-between transition-all bg-white shadow-sm hover:shadow-md ${
                        isAvailable
                          ? "border-emerald-200"
                          : isOccupied
                          ? "border-rose-200 opacity-90"
                          : "border-slate-200 opacity-70"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-[#64748B] font-semibold">
                            {tbl.area}
                          </span>
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isAvailable
                                ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                                : isOccupied
                                ? "bg-rose-500 animate-pulse"
                                : "bg-amber-500"
                            }`}
                          />
                        </div>
                        <div>
                          <h4 className="font-serif text-base font-bold text-[#18181B]">{tbl.tableNumber}</h4>
                          <p className="text-[11px] text-[#64748B]">
                            Kapasitas {tbl.capacity} Pax
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 mt-3">
                        <Link
                          href={`/reservation`}
                          className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            isAvailable
                              ? "bg-[#EA580C]/10 hover:bg-[#EA580C] hover:text-white text-[#EA580C]"
                              : "bg-slate-100 text-[#64748B] hover:bg-slate-200"
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
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#18181B]">
                  Lacak Reservasi Aktif Anda
                </h3>
                <p className="text-xs text-[#64748B]">
                  Pantau verifikasi resepsionis, persiapan chef di dapur, hingga hidangan tersaji di meja Anda.
                </p>
              </div>
              <button
                onClick={fetchMyOrders}
                disabled={loadingOrders}
                className="px-4 py-2 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-[#64748B] hover:text-[#18181B] flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? "animate-spin text-[#EA580C]" : ""}`} />
                <span>Perbarui Status</span>
              </button>
            </div>

            {activeOrdersList.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center mx-auto">
                  <UtensilsCrossed className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-lg font-bold text-[#18181B]">
                    Belum Ada Reservasi yang Sedang Aktif
                  </h4>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                    Buat reservasi meja dan pilih menu mewah Anda sekarang lewat alur 5 langkah kami.
                  </p>
                </div>
                <Link
                  href="/reservation"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs shadow-md shadow-[#EA580C]/25 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Mulai Reservasi Sekarang</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrdersList.map((order) => {
                  const statusSteps = [
                    { key: "pending", label: "Menunggu", desc: "Pesanan diterima sistem" },
                    { key: "confirmed", label: "Dikonfirmasi", desc: "Meja & pesanan disiapkan" },
                    { key: "preparing", label: "Dimasak", desc: "Chef meracik di dapur" },
                    { key: "served", label: "Tersaji", desc: "Hidangan siap di meja" },
                  ];

                  const currentIndex = statusSteps.findIndex((s) => s.key === order.status);

                  return (
                    <div
                      key={order.id}
                      className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#EA580C] text-sm">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/20 font-bold uppercase">
                              {order.table?.tableNumber || "Meja Reservasi"}
                            </span>
                            {order.table?.area && (
                              <span className="text-[10px] text-[#64748B] font-medium">
                                ({order.table.area})
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#64748B]">
                            {order.reservationDate
                              ? `Jadwal: ${formatDate(order.reservationDate)} • ${order.reservationTime || "Dining Session"}`
                              : `Dipesan: ${formatDate(order.createdAt)}`}{" "}
                            • {order.guestCount ? `${order.guestCount} Tamu` : "2 Tamu"} •{" "}
                            {order.items.length} Menu
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-[#64748B] block font-light">Total Biaya</span>
                          <span className="font-serif text-xl font-bold text-[#18181B]">
                            {formatIDR(order.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Stepper Status */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-[#18181B] block">
                          Progress Pesanan:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {statusSteps.map((step, idx) => {
                            const isDone = currentIndex >= idx;
                            const isCurrent = currentIndex === idx;
                            return (
                              <div
                                key={step.key}
                                className={`p-3.5 rounded-2xl border transition-all ${
                                  isCurrent
                                    ? "bg-[#EA580C]/10 border-[#EA580C] text-[#EA580C]"
                                    : isDone
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                                    : "bg-[#FDFBF7] border-slate-200 text-[#64748B]"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border border-slate-400 text-[10px] flex items-center justify-center font-bold">
                                      {idx + 1}
                                    </div>
                                  )}
                                  <span className="text-xs font-bold">{step.label}</span>
                                </div>
                                <p className="text-[10px] opacity-80 leading-tight">
                                  {step.desc}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold text-[#64748B] block">
                          Menu Yang Dipesan:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {order.items.map((it: any) => (
                            <div
                              key={it.id}
                              className="p-3 rounded-2xl bg-[#FDFBF7] border border-slate-200/80 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#EA580C] font-mono">
                                  {it.quantity}x
                                </span>
                                <div>
                                  <span className="text-[#18181B] font-semibold">{it.menu?.name}</span>
                                  {it.modifiers && it.modifiers.length > 0 && (
                                    <span className="block text-[10px] text-[#64748B]">
                                      {it.modifiers.map((m: any) => m.name).join(", ")}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="font-mono font-semibold text-[#18181B]">
                                {formatIDR(it.subtotal)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[#64748B]">Status Pembayaran:</span>
                          <span
                            className={`font-bold px-3 py-1 rounded-full text-[10px] uppercase font-mono ${
                              order.paymentStatus === "paid"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-amber-100 text-amber-800 border border-amber-300"
                            }`}
                          >
                            {order.paymentStatus === "paid" ? "Lunas (Paid)" : "Menunggu Pembayaran"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedReceipt(order)}
                            className="px-4 py-2 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#EA580C]/20 cursor-pointer transition-all"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Lihat Receipt & QR Pass</span>
                          </button>

                          {order.table?.qrToken && (
                            <Link
                              href={`/table/${order.table.qrToken}`}
                              className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-[#18181B] border border-slate-200/80 font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <span>Layar Meja</span>
                              <ExternalLink className="w-3 h-3 text-[#64748B]" />
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
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#18181B]">
                  Arsip Reservasi & Struk Digital
                </h3>
                <p className="text-xs text-[#64748B]">
                  Seluruh jamuan bersantap Anda yang telah selesai tersimpan rapi beserta receipt resmi.
                </p>
              </div>
            </div>

            {historyOrdersList.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-3 shadow-sm">
                <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-serif text-base font-bold text-[#18181B]">
                  Belum Ada Riwayat Transaksi Selesai
                </h4>
                <p className="text-xs text-[#64748B]">
                  Transaksi reservasi Anda yang telah diselesaikan akan tercatat di sini secara permanen.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {historyOrdersList.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-[#EA580C]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#EA580C] text-xs">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase font-mono">
                          {order.status}
                        </span>
                        <span className="text-[10px] text-[#64748B] font-medium">
                          {order.table?.tableNumber || "Private Salon"}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B]">
                        {order.reservationDate
                          ? `Jadwal: ${formatDate(order.reservationDate)} • ${order.reservationTime || "Dining"}`
                          : `Selesai: ${formatDate(order.createdAt)}`}{" "}
                        • {order.items.length} item • Metode: {(order.paymentMethod || "QRIS").toUpperCase()}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs font-serif font-black text-[#18181B]">
                          {formatIDR(order.totalAmount)}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedReceipt(order)}
                        className="px-4 py-2 rounded-full bg-[#EA580C]/10 hover:bg-[#EA580C] hover:text-white text-[#EA580C] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
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
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#18181B]">
                  Katalog Hidangan SAVORIA
                </h3>
                <p className="text-xs text-[#64748B]">
                  Jelajahi sajian lezat mahakarya Executive Chef dari berbagai belahan dunia.
                </p>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Cari hidangan..."
                    className="pl-9 pr-4 py-2 bg-white border border-slate-200/80 rounded-full text-xs text-[#18181B] placeholder:text-slate-400 focus:outline-none focus:border-[#EA580C] shadow-sm"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-white border border-slate-200/80 rounded-full text-xs text-[#18181B] focus:outline-none focus:border-[#EA580C] shadow-sm cursor-pointer"
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
                  className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all group shadow-[0_10px_30px_rgba(0,0,0,0.03)]"
                >
                  <div className="h-48 w-full relative bg-slate-100 overflow-hidden">
                    {m.image ? (
                      <Image
                        src={m.image}
                        alt={m.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <UtensilsCrossed className="w-10 h-10" />
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-[#18181B] text-base group-hover:text-[#EA580C] transition-colors">
                        {m.name}
                      </h4>
                      <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                        {m.description || "Hidangan istimewa dengan bahan-bahan premium pilihan terbaik."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
                      <span className="font-serif font-bold text-[#18181B] text-base">
                        {formatIDR(m.price)}
                      </span>
                      <Link
                        href="/reservation"
                        className="px-4 py-2 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-xs font-bold text-white transition-all flex items-center gap-1 shadow-sm shadow-[#EA580C]/20"
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

        {/* Modal Digital Struk Lengkap (SAVORIA Modern Digital Receipt) */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 text-[#18181B] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 my-8">
              {/* Close Button */}
              <button
                onClick={() => setSelectedReceipt(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-[#64748B] hover:text-[#18181B] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Receipt Header */}
              <div className="text-center space-y-1.5 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-serif font-black text-2xl mx-auto shadow-md shadow-[#EA580C]/20">
                  S
                </div>
                <h3 className="font-serif font-bold text-2xl tracking-tight text-[#18181B]">
                  SAVORIA
                </h3>
                <p className="text-[11px] text-[#EA580C] uppercase tracking-widest font-semibold">
                  Modern Gourmet Dining Experience
                </p>
                <p className="text-[10px] text-[#64748B]">
                  Grand Boulevard No. 88, Jakarta Selatan • Tel: +62 21 8899 0000
                </p>
                <div className="inline-block mt-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono">
                  ✓ LUNAS / PAYMENT CONFIRMED
                </div>
              </div>

              {/* Reservation Meta & Booking Details */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-[#FDFBF7] p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-[#64748B] block font-medium">KODE BOOKING:</span>
                  <span className="font-bold font-mono text-[#EA580C]">{selectedReceipt.orderNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] block font-medium">MEJA & AREA:</span>
                  <span className="font-bold text-[#18181B]">
                    {selectedReceipt.table?.tableNumber || "VIP Salon"}{" "}
                    {selectedReceipt.table?.area && `(${selectedReceipt.table.area})`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] block font-medium">TANGGAL RESERVASI:</span>
                  <span className="font-bold text-[#18181B]">
                    {selectedReceipt.reservationDate
                      ? formatDate(selectedReceipt.reservationDate)
                      : formatDate(selectedReceipt.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] block font-medium">SESI & JUMLAH TAMU:</span>
                  <span className="font-bold text-[#18181B]">
                    {selectedReceipt.reservationTime || "19:00"} •{" "}
                    {selectedReceipt.guestCount ? `${selectedReceipt.guestCount} Pax` : "2 Pax"}
                  </span>
                </div>
              </div>

              {/* Itemized Order Dishes */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#18181B] uppercase tracking-wider block font-serif">
                  Rincian Hidangan & Minuman:
                </span>
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1 text-xs">
                  {selectedReceipt.items?.map((it: any) => (
                    <div key={it.id} className="py-2.5 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-[#18181B]">
                          <span className="text-[#EA580C] font-mono font-bold mr-1.5">
                            {it.quantity}x
                          </span>
                          {it.menu?.name}
                        </div>
                        {it.modifiers && it.modifiers.length > 0 && (
                          <div className="text-[10px] text-[#64748B]">
                            {it.modifiers.map((m: any) => m.name).join(", ")}
                          </div>
                        )}
                        {it.notes && (
                          <div className="text-[10px] text-slate-400 italic">
                            Catatan: {it.notes}
                          </div>
                        )}
                      </div>
                      <span className="font-mono font-bold text-[#18181B] shrink-0">
                        {formatIDR(it.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
                <div className="flex justify-between text-[#64748B]">
                  <span>Subtotal Pesanan:</span>
                  <span className="font-mono">{formatIDR(selectedReceipt.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Pajak Restoran (PB1 10%):</span>
                  <span className="font-mono">{formatIDR(selectedReceipt.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Biaya Layanan (Service 5%):</span>
                  <span className="font-mono">{formatIDR(selectedReceipt.serviceCharge)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-[#18181B]">
                  <span className="font-serif">TOTAL DIBAYAR:</span>
                  <span className="text-[#EA580C] font-mono text-base">{formatIDR(selectedReceipt.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#64748B] pt-1">
                  <span>Metode Pembayaran:</span>
                  <span className="uppercase text-[#18181B] font-bold">
                    {selectedReceipt.paymentMethod || "QRIS Dinamis"}
                  </span>
                </div>
              </div>

              {/* QR Verification Pass */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2 text-center shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-[#64748B]">
                  Boarding Pass QR Verifikasi Meja
                </span>
                {receiptQrDataUrl ? (
                  <img
                    src={receiptQrDataUrl}
                    alt="Receipt QR"
                    className="w-36 h-36 object-contain"
                  />
                ) : (
                  <div className="w-36 h-36 bg-slate-50 flex items-center justify-center font-mono text-xs text-slate-400">
                    Generating QR...
                  </div>
                )}
                <p className="text-[10px] text-[#64748B]">
                  Tunjukkan QR ini kepada staf resepsionis saat tiba di SAVORIA.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-3 rounded-full bg-white hover:bg-slate-50 text-[#18181B] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200 shadow-sm"
                >
                  <Printer className="w-4 h-4 text-[#EA580C]" />
                  <span>Cetak Receipt / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="w-full py-3 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-[#EA580C]/25"
                >
                  Tutup Struk
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 px-6 py-6 text-center text-xs text-[#64748B] bg-white">
        <p>SAVORIA • Modern Gourmet Dining Experience & Patron Portal</p>
      </footer>
    </div>
  );
}

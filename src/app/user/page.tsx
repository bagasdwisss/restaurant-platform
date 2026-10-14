"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
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
  Receipt,
  Search,
  ExternalLink,
  ShieldCheck,
  Star,
  Award,
  Crown,
  X,
  ArrowRight,
  Lock,
  User,
  Phone,
  Mail,
  KeyRound,
  Gift,
  Tag,
  BellRing,
  Check,
  Copy,
} from "lucide-react";

export default function UserPortalPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"active" | "history" | "profile" | "privileges">("active");
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Selected receipt modal state
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [receiptQrDataUrl, setReceiptQrDataUrl] = useState<string>("");

  // Boarding Pass QR modal state
  const [boardingPassOrder, setBoardingPassOrder] = useState<any>(null);
  const [boardingPassQrUrl, setBoardingPassQrUrl] = useState<string>("");

  // Edit profile form state
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Calling waiter state
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);

  // Sync profile form when user loads
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfilePhone(user.phone || "");
    }
  }, [user]);

  // Fetch customer orders
  const fetchMyOrders = useCallback(async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/v1/customer/my-orders?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setMyOrders(data.data || []);
      }
    } catch {
    } finally {
      setLoadingOrders(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMyOrders();
      const interval = setInterval(() => {
        if (typeof document !== "undefined" && document.hidden) return;
        fetchMyOrders();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchMyOrders]);

  // Generate QR Code for receipt
  useEffect(() => {
    if (selectedReceipt) {
      const payload = JSON.stringify({
        restaurant: "SAVORIA Haute Cuisine",
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

  // Generate QR Code for Boarding Pass
  useEffect(() => {
    if (boardingPassOrder) {
      const payload = JSON.stringify({
        bookingCode: boardingPassOrder.orderNumber,
        guest: boardingPassOrder.customerName || user?.name,
        table: boardingPassOrder.table?.tableNumber || "VIP",
        date: boardingPassOrder.reservationDate,
        time: boardingPassOrder.reservationTime,
        pax: boardingPassOrder.guestCount,
        securityHash: `SAV-VERIFIED-${boardingPassOrder.id}`,
      });

      QRCode.toDataURL(payload, {
        width: 280,
        margin: 2,
        color: { dark: "#14281D", light: "#FFFFFF" },
      })
        .then((url) => setBoardingPassQrUrl(url))
        .catch(() => {});
    } else {
      setBoardingPassQrUrl("");
    }
  }, [boardingPassOrder, user]);

  // Handle Edit Profile Submission
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.warning("Nama lengkap wajib diisi.", "Validasi Profil");
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        toast.warning("Password baru minimal 6 karakter.", "Validasi Keamanan");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.warning("Konfirmasi password baru tidak cocok.", "Validasi Keamanan");
        return;
      }
      if (!oldPassword) {
        toast.warning("Masukkan password lama untuk konfirmasi pergantian password.", "Validasi Keamanan");
        return;
      }
    }

    setIsUpdatingProfile(true);
    try {
      const res = await fetch("/api/v1/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          oldPassword: oldPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Profil Anda berhasil diperbarui!", "Profil Disimpan");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Refresh page after a brief moment to sync context
        setTimeout(() => window.location.reload(), 1200);
      } else {
        toast.error(data.message || "Gagal memperbarui profil.", "Gagal Simpan");
      }
    } catch {
      toast.error("Terjadi gangguan jaringan saat memperbarui profil.", "Kendala Koneksi");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Waiter Call for Active Order
  const handleCallWaiter = async (tableId: number, orderNumber: string) => {
    setIsCallingWaiter(true);
    try {
      const res = await fetch("/api/v1/customer/call-waiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          type: "call",
          notes: `Panggilan pelayan untuk meja reservasi #${orderNumber}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Pelayan SAVORIA telah menerima sinyal panggilan dan sedang menuju ke meja Anda.", "Pelayan Dipanggil");
      } else {
        toast.info("Permintaan panggilan pelayan telah diteruskan ke stasiun kasir.", "Notifikasi Kasir");
      }
    } catch {
      toast.error("Gagal mengirim panggilan pelayan. Silakan hubungi staf kasir langsung.", "Gangguan Jaringan");
    } finally {
      setIsCallingWaiter(false);
    }
  };

  // Filter orders
  const activeOrdersList = useMemo(() => {
    return myOrders.filter((o) =>
      ["pending", "confirmed", "preparing", "served"].includes(o.status)
    );
  }, [myOrders]);

  const historyOrdersList = useMemo(() => {
    return myOrders.filter((o) =>
      ["completed", "cancelled", "voided"].includes(o.status)
    );
  }, [myOrders]);

  // Financial Stats & VIP Tier Calculations
  const totalSpent = useMemo(() => {
    return myOrders
      .filter((o) => o.paymentStatus === "paid" || o.status === "completed")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [myOrders]);

  const totalVisits = useMemo(() => {
    return myOrders.filter((o) => o.status === "completed" || o.paymentStatus === "paid").length;
  }, [myOrders]);

  const loyaltyPoints = useMemo(() => {
    return Math.floor(totalSpent / 10000);
  }, [totalSpent]);

  // VIP Membership Tier
  const vipTier = useMemo(() => {
    if (totalSpent >= 3000000 || totalVisits >= 10) {
      return {
        name: "Diamond Ambassador",
        badgeColor: "bg-gradient-to-r from-cyan-900 to-blue-900 text-cyan-200 border-cyan-400/40",
        discount: "15% Privilese Santap",
        icon: Crown,
      };
    }
    if (totalSpent >= 1500000 || totalVisits >= 5) {
      return {
        name: "Platinum Connoisseur",
        badgeColor: "bg-gradient-to-r from-slate-900 to-indigo-900 text-indigo-200 border-indigo-400/40",
        discount: "10% Privilese Santap",
        icon: Award,
      };
    }
    if (totalSpent > 0 || totalVisits >= 1) {
      return {
        name: "Gold Patron",
        badgeColor: "bg-gradient-to-r from-amber-950 to-stone-900 text-amber-200 border-amber-500/40",
        discount: "5% Privilese Santap",
        icon: Star,
      };
    }
    return {
      name: "Silver Member",
      badgeColor: "bg-slate-800 text-slate-200 border-slate-600",
      discount: "Privilese Akses Meja",
      icon: User,
    };
  }, [totalSpent, totalVisits]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-[#18181B]">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200/80">
          <RefreshCw className="w-5 h-5 animate-spin text-[#EA580C]" />
          <span className="text-sm font-medium">Memuat lounge tamu VIP SAVORIA...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#18181B]">Portal Tamu VIP SAVORIA</h2>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              Silakan masuk ke akun pelanggan Anda untuk melihat kartu keanggotaan VIP, riwayat reservasi meja, live status antrean masak dapur, dan struk digital QR.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Link
              href="/login?redirect=/user"
              className="w-full py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-full text-xs flex items-center justify-center gap-2 shadow-cta block transition-all"
            >
              Masuk ke Akun Anda
            </Link>
            <Link
              href="/register"
              className="w-full py-2.5 bg-white hover:bg-slate-50 text-[#18181B] font-bold rounded-full text-xs flex items-center justify-center gap-2 border border-slate-200/80 transition-all block text-center shadow-xs"
            >
              Daftar Akun Baru (VIP Patron)
            </Link>
            <Link
              href="/"
              className="w-full py-2 text-[#64748B] hover:text-[#18181B] text-xs font-semibold block text-center"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const TierIcon = vipTier.icon;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] flex flex-col justify-between selection:bg-[#EA580C] selection:text-white font-sans">
      {/* Top Header Bar */}
      <header className="border-b border-slate-200/80 px-3.5 sm:px-8 py-3 sm:py-4 backdrop-blur-md sticky top-0 z-40 bg-[#FDFBF7]/95">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
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
                  Member VIP
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#64748B] truncate">
                {user.name} (@{user.username})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/reservation"
              className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs shadow-md shadow-[#EA580C]/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reservasi Meja Baru</span>
            </Link>

            <button
              onClick={logout}
              className="px-3 sm:px-3.5 py-2 rounded-full bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200/80 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer text-[#64748B] shadow-sm"
              title="Keluar Akun"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-8 py-6 sm:py-8 w-full flex-1 space-y-6">
        {/* VIP Patron Membership Card & Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Virtual Membership Card */}
          <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between relative overflow-hidden text-white ${vipTier.badgeColor}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#EA580C] text-white font-serif font-black flex items-center justify-center text-sm shadow-sm">
                    S
                  </div>
                  <span className="font-serif font-bold text-sm tracking-widest uppercase">
                    SAVORIA
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20">
                  <TierIcon className="w-3 h-3 text-amber-300" />
                  <span>{vipTier.name}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] text-slate-300 uppercase font-mono tracking-wider block">
                  Nama Anggota Kehormatan
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                  {user.name}
                </h3>
              </div>
            </div>

            <div className="pt-6 border-t border-white/15 flex items-center justify-between relative z-10 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">Nomor ID VIP</span>
                <span className="font-bold text-white tracking-wider">
                  #SAV-VIP-{user.id.toString().padStart(5, "0")}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Privilese Member</span>
                <span className="font-bold text-amber-300">{vipTier.discount}</span>
              </div>
            </div>
          </div>

          {/* 3 Metrics KPI Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
                <span>Total Jamuan Dinikmati</span>
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-900 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#18181B] block">
                  {totalVisits}
                </span>
                <span className="text-[11px] text-[#64748B] mt-0.5 block">
                  Kunjungan Meja Selesai
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
                <span>Akumulasi Pengeluaran</span>
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="font-serif text-xl sm:text-2xl font-bold text-emerald-700 block truncate">
                  {formatIDR(totalSpent)}
                </span>
                <span className="text-[11px] text-[#64748B] mt-0.5 block">
                  Total Nilai Transaksi Lunas
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
                <span>Poin Loyalitas VIP</span>
                <div className="w-8 h-8 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#EA580C] block">
                  {loyaltyPoints}
                </span>
                <span className="text-[11px] text-[#64748B] mt-0.5 block">
                  Poin Dapat Ditukar Voucher
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex items-center gap-2 pb-1 border-b border-slate-200 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "active"
                ? "border-[#EA580C] text-[#EA580C] font-bold"
                : "border-transparent text-[#64748B] hover:text-[#18181B]"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Reservasi & Pesanan Aktif</span>
            {activeOrdersList.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-mono font-bold">
                {activeOrdersList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "history"
                ? "border-[#EA580C] text-[#EA580C] font-bold"
                : "border-transparent text-[#64748B] hover:text-[#18181B]"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Riwayat Jamuan & Struk</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono">
              {historyOrdersList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "profile"
                ? "border-[#EA580C] text-[#EA580C] font-bold"
                : "border-transparent text-[#64748B] hover:text-[#18181B]"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Edit Profil & Keamanan</span>
          </button>

          <button
            onClick={() => setActiveTab("privileges")}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "privileges"
                ? "border-[#EA580C] text-[#EA580C] font-bold"
                : "border-transparent text-[#64748B] hover:text-[#18181B]"
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Voucher & Keuntungan VIP</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: RESERVASI & PESANAN AKTIF (LIVE STATUS TRACKER) */}
        {/* ========================================================================= */}
        {activeTab === "active" && (
          <div className="space-y-4">
            {activeOrdersList.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Calendar className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#18181B]">
                    Tidak Ada Reservasi yang Sedang Aktif
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
                    Saat ini Anda belum memiliki reservasi meja yang sedang berjalan. Rencanakan jamuan istimewa Anda berikutnya sekarang.
                  </p>
                </div>
                <Link
                  href="/reservation"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs shadow-md shadow-[#EA580C]/25 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Mulai Reservasi Meja</span>
                </Link>
              </div>
            ) : (
              activeOrdersList.map((order) => {
                const statusStep =
                  order.status === "pending"
                    ? 1
                    : order.status === "confirmed"
                    ? 2
                    : order.status === "preparing"
                    ? 3
                    : 4;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5"
                  >
                    {/* Top Row Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-base text-[#18181B]">
                            #{order.orderNumber}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-50 text-amber-900 border border-amber-200">
                            {order.table?.tableNumber ? `Meja ${order.table.tableNumber}` : "VIP Lounge"} ({order.table?.area || "Indoor"})
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-[#64748B]">
                            {order.guestCount ? `${order.guestCount} Tamu` : "2 Tamu"}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {order.reservationDate ? formatDate(order.reservationDate) : formatDate(order.createdAt)}
                          </span>
                          <span className="text-slate-300">•</span>
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.reservationTime || "19:00"}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setBoardingPassOrder(order)}
                          className="px-3.5 py-2 rounded-full bg-[#14281D] hover:bg-[#14281D]/90 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <QrCode className="w-3.5 h-3.5 text-amber-300" />
                          <span>Boarding Pass QR</span>
                        </button>

                        {order.tableId && (
                          <button
                            onClick={() => handleCallWaiter(order.tableId, order.orderNumber)}
                            disabled={isCallingWaiter}
                            className="px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-[#18181B] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <BellRing className="w-3.5 h-3.5 text-[#EA580C]" />
                            <span>Panggil Pelayan</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedReceipt(order)}
                          className="px-3.5 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-[#18181B] font-semibold text-xs transition-all cursor-pointer"
                        >
                          Lihat Struk
                        </button>
                      </div>
                    </div>

                    {/* Stepper Status Real-Time */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                        Status Pelayanan Meja Real-Time:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className={`p-3 rounded-2xl border ${statusStep >= 1 ? "bg-amber-50 border-amber-300 text-amber-900 font-bold" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
                          <span className="block text-[10px] uppercase font-mono">Tahap 1</span>
                          <span>Menunggu Konfirmasi</span>
                        </div>

                        <div className={`p-3 rounded-2xl border ${statusStep >= 2 ? "bg-blue-50 border-blue-300 text-blue-900 font-bold" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
                          <span className="block text-[10px] uppercase font-mono">Tahap 2</span>
                          <span>Reservasi Dikonfirmasi</span>
                        </div>

                        <div className={`p-3 rounded-2xl border ${statusStep >= 3 ? "bg-purple-50 border-purple-300 text-purple-900 font-bold" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
                          <span className="block text-[10px] uppercase font-mono">Tahap 3</span>
                          <span>Dimasak Dapur Chef</span>
                        </div>

                        <div className={`p-3 rounded-2xl border ${statusStep >= 4 ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
                          <span className="block text-[10px] uppercase font-mono">Tahap 4</span>
                          <span>Disajikan di Meja</span>
                        </div>
                      </div>
                    </div>

                    {/* Ordered Dishes Summary */}
                    {order.items && order.items.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono mb-2">
                          Hidangan Jamuan yang Dipesan:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {order.items.map((it: any) => (
                            <div
                              key={it.id}
                              className="p-2.5 rounded-xl bg-[#FDFBF7] border border-slate-200/70 flex items-center justify-between"
                            >
                              <div className="truncate mr-2">
                                <span className="font-bold text-[#EA580C] mr-1.5 font-mono">
                                  {it.quantity}x
                                </span>
                                <span className="font-semibold text-[#18181B]">
                                  {it.menu?.name || "Hidangan"}
                                </span>
                              </div>
                              <span className="font-mono text-slate-700 shrink-0">
                                {formatIDR(it.subtotal)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: RIWAYAT TRANSAKSI & STRUK DIGITAL */}
        {/* ========================================================================= */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {historyOrdersList.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center space-y-2 shadow-sm">
                <Receipt className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="font-serif font-bold text-base text-[#18181B]">
                  Belum Ada Riwayat Jamuan Selesai
                </h3>
                <p className="text-xs text-[#64748B]">
                  Seluruh transaksi yang telah lunas dan jamuan yang telah selesai akan tercatat permanen di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {historyOrdersList.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedReceipt(order)}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-900/30 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-[#18181B] text-sm">
                          #{order.orderNumber}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                          {order.table?.tableNumber ? `Meja ${order.table.tableNumber}` : "VIP Lounge"}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-500">
                          {formatDate(order.reservationDate || order.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {order.items?.length || 0} Hidangan dipesan • Selesai dinikmati
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 block font-mono">Total Pembayaran</span>
                        <span className="font-serif font-bold text-sm text-emerald-700">
                          {formatIDR(order.totalAmount)}
                        </span>
                      </div>

                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 hover:bg-[#EA580C] hover:text-white transition-colors flex items-center gap-1">
                        <span>Buka Struk</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: EDIT PROFIL & KEAMANAN AKUN */}
        {/* ========================================================================= */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-8 shadow-sm max-w-2xl">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-serif font-bold text-xl text-[#18181B]">
                Pengaturan Profil & Keamanan Akun
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                Perbarui nama lengkap, nomor kontak, serta kata sandi akun Anda.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              {/* Account Identity */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block">
                  Informasi Utama Pelanggan
                </span>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>Nama Lengkap</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
                    placeholder="Nama Lengkap Anda"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Alamat Email (Akun)</span>
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full text-xs p-3 bg-slate-100 text-slate-500 border border-slate-200 rounded-2xl cursor-not-allowed font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>Nomor Handphone / WA</span>
                    </label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none font-mono"
                      placeholder="0812xxxxxxxx"
                    />
                  </div>
                </div>
              </div>

              {/* Security & Password */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block">
                  Ubah Kata Sandi (Kosongkan jika tidak ingin mengubah)
                </span>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Kata Sandi Lama</span>
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
                    placeholder="Masukkan kata sandi lama Anda"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                      <span>Kata Sandi Baru</span>
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
                      placeholder="Minimal 6 karakter"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ulangi Kata Sandi Baru</span>
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
                      placeholder="Konfirmasi password baru"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center gap-2 shadow-md shadow-[#EA580C]/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isUpdatingProfile ? "Menyimpan Perubahan..." : "Simpan Perubahan Profil"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: KEUNTUNGAN & VOUCHER VIP MEMBER */}
        {/* ========================================================================= */}
        {activeTab === "privileges" && (
          <div className="space-y-5 max-w-4xl">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
              <h3 className="font-serif font-bold text-lg text-[#18181B] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Privilese Khusus Member VIP SAVORIA</span>
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                Sebagai anggota kehormatan SAVORIA, Anda berhak menikmati berbagai keuntungan eksklusif di setiap reservasi jamuan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-100 text-amber-900">
                    DISCOUNT VOUCHER
                  </span>
                  <span className="font-mono text-xs font-bold text-[#EA580C]">10% OFF</span>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[#18181B]">
                    Diskon Jamuan Malam VIP
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Potongan 10% untuk pemesanan set menu signature dinner di sesi mana pun.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Kode: SAVORIA-VIP10</span>
                  <span className="text-emerald-700 font-bold">Aktif & Berlaku</span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-100 text-purple-900">
                    COMPLIMENTARY
                  </span>
                  <span className="font-mono text-xs font-bold text-purple-700">GRATIS</span>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[#18181B]">
                    Signature Petit Fours on Birthday
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Nikmati sajian dessert istimewa kreasi chef koki saat Anda merayakan hari ulang tahun di SAVORIA.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Otomatis Tersemat</span>
                  <span className="text-emerald-700 font-bold">Aktif & Berlaku</span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-100 text-blue-900">
                    SEATING GUARANTEE
                  </span>
                  <span className="font-mono text-xs font-bold text-blue-700">PRIORITY</span>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[#18181B]">
                    Jaminan Meja Utama Grand Salle
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Prioritas alokasi meja dengan pemandangan terbaik saat melakukan booking reservasi.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Status Akun VIP</span>
                  <span className="text-emerald-700 font-bold">Aktif Permanen</span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-100 text-emerald-900">
                    SALON PRIVÉ
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-700">EXCLUSIVE</span>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[#18181B]">
                    Akses Mezzanine VIP Suite
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Hak akses eksklusif untuk memesan meja lantai 2 Mezzanine privat untuk jamuan keluarga atau pertemuan bisnis.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Patron Privilege</span>
                  <span className="text-emerald-700 font-bold">Aktif Permanen</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1: BOARDING PASS QR VERIFIKASI MEJA */}
        {/* ========================================================================= */}
        {boardingPassOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-sm w-full space-y-5 text-center shadow-2xl relative my-auto">
              <button
                onClick={() => setBoardingPassOrder(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#EA580C] bg-[#EA580C]/10 px-2.5 py-0.5 rounded-full inline-block">
                  Boarding Pass Digital
                </span>
                <h3 className="font-serif font-bold text-xl text-[#18181B]">
                  Verifikasi Meja Reservasi
                </h3>
                <p className="text-xs text-[#64748B]">
                  #{boardingPassOrder.orderNumber}
                </p>
              </div>

              {/* QR Image Box */}
              <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-slate-200/80 inline-block">
                {boardingPassQrUrl ? (
                  <img
                    src={boardingPassQrUrl}
                    alt="Boarding Pass QR"
                    className="w-48 h-48 mx-auto object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-mono">
                    Membuat QR...
                  </div>
                )}
              </div>

              <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Meja:</span>
                  <span className="font-bold text-[#18181B]">
                    {boardingPassOrder.table?.tableNumber || "VIP"} ({boardingPassOrder.table?.area || "Indoor"})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jadwal:</span>
                  <span className="font-bold text-[#18181B]">
                    {boardingPassOrder.reservationDate || "Hari Ini"} • {boardingPassOrder.reservationTime || "19:00"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jumlah Tamu:</span>
                  <span className="font-bold text-[#18181B]">
                    {boardingPassOrder.guestCount || 2} Orang
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Tunjukkan QR ini ke staf resepsionis saat Anda tiba di SAVORIA untuk dipandu langsung ke meja Anda.
              </p>

              <button
                onClick={() => setBoardingPassOrder(null)}
                className="w-full py-3 rounded-full bg-[#14281D] hover:bg-[#14281D]/90 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Tutup Boarding Pass
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: DIGITAL RECEIPT STRUK RESMI */}
        {/* ========================================================================= */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 text-[#18181B] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 my-8">
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
                <p className="text-xs text-[#64748B] font-mono uppercase tracking-wider">
                  Haute Cuisine & Grand Dining • Struk Resmi
                </p>
                <p className="text-[11px] font-mono text-[#EA580C] font-semibold">
                  Nomor Booking: #{selectedReceipt.orderNumber}
                </p>
              </div>

              {/* Receipt Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-[#64748B] block font-medium">NAMA TAMU:</span>
                  <span className="font-bold text-[#18181B]">
                    {selectedReceipt.customerName || user?.name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] block font-medium">MEJA TERPILIH:</span>
                  <span className="font-bold text-[#18181B]">
                    {selectedReceipt.table?.tableNumber || "VIP Lounge"}{" "}
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
                    {selectedReceipt.paymentMethod || "QRIS DINAMIS"}
                  </span>
                </div>
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
        <p>SAVORIA • Haute Cuisine Dining Experience & VIP Patron Portal</p>
      </footer>
    </div>
  );
}

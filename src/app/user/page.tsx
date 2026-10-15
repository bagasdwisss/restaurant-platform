"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { formatIDR } from "@/lib/utils";
import {
  Calendar,
  Clock,
  CreditCard,
  Sparkles,
  RefreshCw,
  Receipt,
  Star,
  Award,
  Crown,
  Lock,
  User,
  Gift,
} from "lucide-react";
import { UserActiveOrdersTab } from "@/components/user/UserActiveOrdersTab";
import { UserOrderHistoryTab } from "@/components/user/UserOrderHistoryTab";
import { UserProfileSecurityTab } from "@/components/user/UserProfileSecurityTab";
import { UserVipClubTab } from "@/components/user/UserVipClubTab";
import { UserReceiptModal } from "@/components/user/UserReceiptModal";
import { UserBoardingPassModal } from "@/components/user/UserBoardingPassModal";
import { UserVoucherCelebrationModal } from "@/components/user/UserVoucherCelebrationModal";

export default function UserPortalPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"active" | "history" | "profile" | "privileges">("active");
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Selected receipt modal state
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // Boarding Pass QR modal state
  const [boardingPassOrder, setBoardingPassOrder] = useState<any>(null);

  // Updating profile state
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Calling waiter state
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  const [callingWaiterOrderId, setCallingWaiterOrderId] = useState<number | null>(null);

  // Loyalty reward redemption state
  const [isRedeemingReward, setIsRedeemingReward] = useState(false);
  const [redeemedVoucher, setRedeemedVoucher] = useState<any>(null);

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
      // non-fatal
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
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [user, fetchMyOrders]);

  // Handle Edit Profile Submission
  const handleUpdateProfile = async (formData: {
    name: string;
    phone: string;
    oldPassword?: string;
    newPassword?: string;
  }): Promise<boolean> => {
    setIsUpdatingProfile(true);
    try {
      const res = await fetch("/api/v1/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Profil Anda berhasil diperbarui!", "Profil Disimpan");
        setTimeout(() => window.location.reload(), 1200);
        return true;
      } else {
        toast.error(data.message || "Gagal memperbarui profil.", "Gagal Simpan");
        return false;
      }
    } catch {
      toast.error("Terjadi gangguan jaringan saat memperbarui profil.", "Kendala Koneksi");
      return false;
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Waiter Call for Active Order
  const handleCallWaiter = async (tableId: number, orderNumber: string, orderId: number, tableNumber?: string) => {
    setIsCallingWaiter(true);
    setCallingWaiterOrderId(orderId);
    try {
      const res = await fetch("/api/v1/customer/call-waiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          tableNumber,
          orderNumber,
          customerName: user?.name || "Tamu VIP Savoria",
          type: "call",
          notes: `Panggilan pelayan untuk meja reservasi #${orderNumber}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Pelayan SAVORIA telah menerima sinyal panggilan dan sedang menuju ke meja Anda.", "Pelayan Dipanggil");
      } else {
        toast.info(data.message || "Permintaan panggilan pelayan telah diteruskan ke stasiun kasir.", "Notifikasi Kasir");
      }
    } catch {
      toast.error("Gagal mengirim panggilan pelayan. Silakan hubungi staf kasir langsung.", "Gangguan Jaringan");
    } finally {
      setIsCallingWaiter(false);
      setCallingWaiterOrderId(null);
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
    return Math.floor(totalSpent / 1000) + 150; // 1 pt per Rp 1.000 spent + 150 welcome bonus pts
  }, [totalSpent]);

  // Savoria Club VIP Membership Tier
  const vipTier = useMemo(() => {
    if (loyaltyPoints >= 3500 || totalSpent >= 3500000) {
      return {
        level: "Platinum VIP",
        name: "Platinum Ambassador",
        discount: "15% Privilese Santap",
        icon: Crown,
      };
    }
    if (loyaltyPoints >= 1500 || totalSpent >= 1500000) {
      return {
        level: "Gold Tier",
        name: "Gold Connoisseur",
        discount: "10% Privilese Santap",
        icon: Award,
      };
    }
    if (loyaltyPoints >= 500 || totalSpent >= 500000) {
      return {
        level: "Silver Tier",
        name: "Silver Gourmet",
        discount: "5% Privilese Santap",
        icon: Star,
      };
    }
    return {
      level: "Bronze Tier",
      name: "Bronze Patron",
      discount: "Privilese Akses Meja",
      icon: User,
    };
  }, [loyaltyPoints, totalSpent]);

  const nextTierInfo = useMemo(() => {
    if (loyaltyPoints >= 3500) {
      return {
        currentTierName: "Platinum VIP",
        nextTierName: "Puncak Tingkat Teratas",
        pointsNeeded: 0,
        progressPct: 100,
      };
    }
    if (loyaltyPoints >= 1500) {
      const min = 1500;
      const max = 3500;
      const pct = Math.min(100, Math.round(((loyaltyPoints - min) / (max - min)) * 100));
      return {
        currentTierName: "Gold Tier",
        nextTierName: "Platinum VIP",
        pointsNeeded: 3500 - loyaltyPoints,
        progressPct: Math.max(8, pct),
      };
    }
    if (loyaltyPoints >= 500) {
      const min = 500;
      const max = 1500;
      const pct = Math.min(100, Math.round(((loyaltyPoints - min) / (max - min)) * 100));
      return {
        currentTierName: "Silver Tier",
        nextTierName: "Gold Tier",
        pointsNeeded: 1500 - loyaltyPoints,
        progressPct: Math.max(8, pct),
      };
    }
    const min = 0;
    const max = 500;
    const pct = Math.min(100, Math.round(((loyaltyPoints - min) / (max - min)) * 100));
    return {
      currentTierName: "Bronze Tier",
      nextTierName: "Silver Tier",
      pointsNeeded: 500 - loyaltyPoints,
      progressPct: Math.max(8, pct),
    };
  }, [loyaltyPoints]);

  const CLUB_REWARDS = [
    {
      id: "rew-mocktail-200",
      title: "Royal Welcome Mocktail",
      description: "Sajian minuman artisan penyegar khas menyambut kehadiran Anda di meja SAVORIA.",
      pointsCost: 200,
      discountValue: 20000,
      category: "Minuman Khusus",
      badge: "Paling Populer",
    },
    {
      id: "rew-disc-25k",
      title: "Voucher Santap Rp 25.000",
      description: "Potongan langsung Rp 25.000 tanpa batas minimum pesanan untuk semua sajian menu.",
      pointsCost: 250,
      discountValue: 25000,
      category: "Voucher Diskon",
      badge: "Mudah Ditukar",
    },
    {
      id: "rew-dessert-350",
      title: "Free Truffle Petit Fours",
      description: "Dessert penutup mewah kreasi koki pastry dengan cokelat couverture & sentuhan truffle.",
      pointsCost: 350,
      discountValue: 35000,
      category: "Chef Signature",
      badge: "Eksklusif Rasa",
    },
    {
      id: "rew-disc-50k",
      title: "Voucher Santap Rp 50.000",
      description: "Potongan langsung Rp 50.000 untuk set menu dinner romantis atau jamuan keluarga.",
      pointsCost: 500,
      discountValue: 50000,
      category: "Voucher Diskon",
      badge: "Favorit Tamu",
    },
    {
      id: "rew-disc-100k",
      title: "Grand Royal Feast Rp 100.000",
      description: "Potongan istimewa Rp 100.000 untuk perayaan jamuan akbar atau perhelatan privat VIP.",
      pointsCost: 1000,
      discountValue: 100000,
      category: "Royal Dining",
      badge: "Eksklusif VIP",
    },
  ];

  const handleRedeemReward = async (reward: (typeof CLUB_REWARDS)[0]) => {
    if (!user) {
      toast.warning("Silakan masuk terlebih dahulu untuk menukarkan poin reward.", "Login Diperlukan");
      return;
    }

    if (loyaltyPoints < reward.pointsCost) {
      toast.error(
        `Poin Savoria Anda (${loyaltyPoints} Pts) belum cukup untuk menukar ${reward.title} (${reward.pointsCost} Pts). Kumpulkan poin dari jamuan berikutnya!`,
        "Poin Belum Mencukupi"
      );
      return;
    }

    setIsRedeemingReward(true);
    try {
      const res = await fetch("/api/v1/customer/vouchers/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          rewardId: reward.id,
          pointsCost: reward.pointsCost,
          title: reward.title,
          discountValue: reward.discountValue,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRedeemedVoucher(data.data);
        toast.success(data.message, "Penukaran Poin Berhasil!");
      } else {
        toast.error(data.message || "Gagal menukarkan poin.", "Gagal");
      }
    } catch {
      toast.error("Terjadi gangguan koneksi saat menukarkan poin.", "Koneksi Gagal");
    } finally {
      setIsRedeemingReward(false);
    }
  };

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
            >
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 flex-1 w-full">
        {/* VIP Digital Card & Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-black text-white border border-stone-700 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-6">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#EA580C]/15 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="font-serif font-black tracking-widest text-lg text-amber-200">
                SAVORIA
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-white/10 text-amber-200 border border-white/10 flex items-center gap-1.5">
                <TierIcon className="w-3.5 h-3.5" />
                <span>{vipTier.level}</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest block uppercase">
                Cardholder Name
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5 truncate">
                {user.name}
              </h2>
              <span className="font-mono text-xs text-amber-300/80 tracking-widest mt-1 block">
                SAV-PATRON-{user.id.toString().padStart(5, "0")}
              </span>
            </div>
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">Status Keanggotaan</span>
                <span className="text-emerald-400 font-bold">Terverifikasi Aktif</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Privilese Member</span>
                <span className="font-bold text-amber-300">{vipTier.discount}</span>
              </div>
            </div>
          </div>

          {/* 3 Metrics Cards */}
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
                <span className="text-[11px] text-[#64748B] mt-0.5 block">Kunjungan Meja Selesai</span>
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
                <span className="text-[11px] text-[#64748B] mt-0.5 block">Total Nilai Transaksi Lunas</span>
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
                <span className="text-[11px] text-[#64748B] mt-0.5 block">Poin Dapat Ditukar Voucher</span>
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

        {/* Tab 1: Reservasi & Pesanan Aktif */}
        {activeTab === "active" && (
          <UserActiveOrdersTab
            orders={activeOrdersList}
            user={user}
            onOpenBoardingPass={(ord) => setBoardingPassOrder(ord)}
            onOpenReceipt={(ord) => setSelectedReceipt(ord)}
            onCallWaiter={handleCallWaiter}
            isCallingWaiter={isCallingWaiter}
            callingWaiterOrderId={callingWaiterOrderId}
          />
        )}

        {/* Tab 2: Riwayat Jamuan & Struk */}
        {activeTab === "history" && (
          <UserOrderHistoryTab
            orders={historyOrdersList}
            onOpenReceipt={(ord) => setSelectedReceipt(ord)}
          />
        )}

        {/* Tab 3: Edit Profil & Keamanan */}
        {activeTab === "profile" && (
          <UserProfileSecurityTab
            user={user}
            onUpdateProfile={handleUpdateProfile}
            isUpdatingProfile={isUpdatingProfile}
          />
        )}

        {/* Tab 4: Keuntungan & Voucher VIP (Savoria Club Tier) */}
        {activeTab === "privileges" && (
          <UserVipClubTab
            vipTier={vipTier}
            loyaltyPoints={loyaltyPoints}
            nextTierInfo={nextTierInfo}
            clubRewards={CLUB_REWARDS}
            onRedeemReward={handleRedeemReward}
            isRedeemingReward={isRedeemingReward}
          />
        )}

        {/* Modal 1: Boarding Pass QR */}
        <UserBoardingPassModal
          order={boardingPassOrder}
          user={user}
          onClose={() => setBoardingPassOrder(null)}
        />

        {/* Modal 2: Digital Receipt Struk */}
        <UserReceiptModal
          receipt={selectedReceipt}
          user={user}
          onClose={() => setSelectedReceipt(null)}
        />

        {/* Modal 3: Celebratory Redeemed Voucher */}
        <UserVoucherCelebrationModal
          voucher={redeemedVoucher}
          onClose={() => setRedeemedVoucher(null)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 px-6 py-6 text-center text-xs text-[#64748B] bg-white">
        <p>SAVORIA • Haute Cuisine Dining Experience & VIP Patron Portal</p>
      </footer>
    </div>
  );
}

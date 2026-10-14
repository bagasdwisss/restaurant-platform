"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { formatIDR, formatDate } from "@/lib/utils";
import { VisualFloorPlan } from "@/components/tables/VisualFloorPlan";
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
  ChevronLeft,
  Plus,
  Minus,
  X,
  ShieldCheck,
  Star,
  Receipt,
  ArrowRight,
  Award,
  Smartphone,
  Info,
  Lock,
} from "lucide-react";

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isAvailable: boolean;
  modifierGroups: any[];
}

interface TableItem {
  id: number;
  tableNumber: string;
  capacity: number;
  qrToken: string;
  status: string;
  area: string;
}

interface CartItem {
  menuId: number;
  name: string;
  price: number;
  quantity: number;
  selectedVariants: { group: string; option: string; extraPrice: number }[];
  notes: string;
}

export default function SavoriaReservationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  // Wizard Step: 1 (Date/Time/Pax), 2 (Menu), 3 (Table), 4 (Payment), 5 (Receipt)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1 STATE: Date, Time Session, Guests
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(
    "07:30 PM - Prime Evening Gala"
  );
  const [guestCount, setGuestCount] = useState<number>(2);
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");

  // STEP 2 STATE: Menu Selection
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customizingMenu, setCustomizingMenu] = useState<MenuItem | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<number, number[]>>({});
  const [itemNotes, setItemNotes] = useState<string>("");

  // STEP 3 STATE: Table Selection
  const [tables, setTables] = useState<TableItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);

  // STEP 4 STATE: Payment
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "card" | "cash">("qris");
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [qrisSimulatorStep, setQrisSimulatorStep] = useState<"scan" | "success">("scan");

  // STEP 5 STATE: Final Completed Order & QR Receipt
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [receiptQrDataUrl, setReceiptQrDataUrl] = useState<string>("");

  // Prefill customer name if logged in
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  // Fetch initial data: Menus & Tables
  useEffect(() => {
    // Menus
    fetch("/api/v1/customer/menus")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      })
      .catch(() => {});

    // Tables
    fetch("/api/v1/pos/tables")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTables(data.data);
      })
      .catch(() => {});
  }, []);

  // Time Slots Available
  const timeSlots = [
    { label: "12:00 PM - Luncheon Soirée", desc: "Sesi siang segar & elegan" },
    { label: "01:30 PM - Midday Gourmet", desc: "Santap siang tenang & privat" },
    { label: "05:30 PM - Sunset & Aperitivo", desc: "Golden hour starter & mocktail" },
    { label: "06:30 PM - Romantic Dinner", desc: "Suasana romantis lilin malam" },
    { label: "07:30 PM - Prime Evening Gala", desc: "Sesi makan malam utama terfavorit" },
    { label: "08:30 PM - Late Night Soirée", desc: "Makan malam intim eksklusif" },
  ];

  // Cart Operations
  const addToCart = (menu: MenuItem) => {
    if (menu.modifierGroups && menu.modifierGroups.length > 0) {
      setCustomizingMenu(menu);
      setSelectedModifiers({});
      setItemNotes("");
      return;
    }

    const existingIdx = cart.findIndex((i) => i.menuId === menu.id);
    if (existingIdx > -1) {
      const updated = [...cart];
      updated[existingIdx].quantity += 1;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          menuId: menu.id,
          name: menu.name,
          price: menu.price,
          quantity: 1,
          selectedVariants: [],
          notes: "",
        },
      ]);
    }
  };

  const confirmCustomization = () => {
    if (!customizingMenu) return;

    const variantsList: { group: string; option: string; extraPrice: number }[] = [];
    customizingMenu.modifierGroups.forEach((group) => {
      const selectedIds = selectedModifiers[group.id] || [];
      selectedIds.forEach((optId) => {
        const opt = group.options.find((o: any) => o.id === optId);
        if (opt) {
          variantsList.push({
            group: group.name,
            option: opt.name,
            extraPrice: opt.price,
          });
        }
      });
    });

    const extraTotal = variantsList.reduce((sum, v) => sum + v.extraPrice, 0);

    setCart([
      ...cart,
      {
        menuId: customizingMenu.id,
        name: customizingMenu.name,
        price: customizingMenu.price + extraTotal,
        quantity: 1,
        selectedVariants: variantsList,
        notes: itemNotes.trim(),
      },
    ]);

    setCustomizingMenu(null);
  };

  const updateCartQty = (menuId: number, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.menuId === menuId) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);
    setCart(updated);
  };

  // Financial Computations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = Math.round(subtotal * 0.1); // PB1 10%
  const serviceCharge = Math.round(subtotal * 0.05); // Service 5%
  const totalAmount = subtotal + taxAmount + serviceCharge;

  // Process Complete Reservation & Payment
  const handleExecutePayment = async () => {
    if (!user) {
      toast.error("Sesi login Anda belum aktif. Harap masuk terlebih dahulu untuk menyelesaikan reservasi.", "Otorisasi Diperlukan");
      router.push("/login?redirect=/reservation");
      return;
    }

    if (!selectedTable) {
      toast.warning("Harap tentukan nomor meja jamuan Anda terlebih dahulu.", "Meja Belum Dipilih");
      setCurrentStep(3);
      return;
    }

    if (cart.length === 0) {
      toast.warning("Pilih setidaknya 1 hidangan untuk jamuan Anda.", "Keranjang Menu Kosong");
      setCurrentStep(2);
      return;
    }

    setIsProcessingPayment(true);

    try {
      const payload = {
        qrToken: selectedTable.qrToken,
        customerName: customerName.trim() || (user ? user.name : "Tamu VIP Savoria"),
        customerPhone: customerPhone.trim(),
        orderType: "dine_in",
        reservationDate: selectedDate,
        reservationTime: selectedTimeSlot,
        guestCount: guestCount,
        specialRequests: specialRequests.trim(),
        paymentMethod: paymentMethod,
        isPaid: true,
        userId: user ? user.id : undefined,
        items: cart.map((i) => ({
          menuId: i.menuId,
          quantity: i.quantity,
          notes: i.notes,
          selectedVariants: i.selectedVariants,
        })),
      };

      const res = await fetch("/api/v1/customer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.data) {
        setCompletedOrder(data.data);

        // Generate QR Pass for Digital Receipt Verification
        const origin = window.location.origin;
        const verificationUrl = `${origin}/table/${selectedTable.qrToken}?verifiedOrder=${data.data.orderNumber}`;
        const qrUrl = await QRCode.toDataURL(verificationUrl, {
          width: 300,
          margin: 2,
          color: { dark: "#18181b", light: "#ffffff" },
        });
        setReceiptQrDataUrl(qrUrl);

        toast.success("Reservasi & Pembayaran berhasil dikonfirmasi!", "Pembayaran Diterima");
        setCurrentStep(5); // Go to Receipt step!
      } else {
        toast.error(data.message || "Gagal memproses reservasi & pembayaran.", "Transaksi Gagal");
      }
    } catch {
      toast.error("Terjadi gangguan koneksi saat memproses reservasi. Silakan periksa jaringan Anda.", "Gangguan Koneksi");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Filter Menus
  const allMenus = categories.flatMap((c) => c.menus || []);
  const displayedMenus = allMenus.filter((m) => {
    if (selectedCategory === "all") return true;
    return categories.find((c) => String(c.id) === selectedCategory)?.menus?.some((item: any) => item.id === m.id);
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] selection:bg-[#EA580C] selection:text-white flex flex-col justify-between font-sans antialiased">
      {/* MODERN RESTAURANT HEADER */}
      <header className="border-b border-[#E2E8F0] bg-white/90 backdrop-blur-md sticky top-0 z-50 px-3 sm:px-6 py-3.5 sm:py-4">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-display font-black text-lg sm:text-xl shadow-cta group-hover:scale-105 transition-transform shrink-0">
              S
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-display tracking-tight text-lg sm:text-xl font-bold text-[#18181B]">
                  SAVOR<span className="text-[#EA580C]">IA</span>
                </span>
                <span className="hidden xs:inline-block text-[10px] bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                  Reservation
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#64748B] font-light truncate">
                5-Step Seamless Dining Experience
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-bold text-[#18181B] block">{user.name}</span>
                  <span className="text-[10px] text-[#EA580C] uppercase font-mono tracking-wider font-semibold">
                    {user.role === "admin" ? "General Manager" : user.role === "kasir" ? "Maître D'" : "VIP Patron"}
                  </span>
                </div>
                <Link
                  href="/user"
                  className="px-3 sm:px-4 py-2 rounded-full bg-white border border-[#E2E8F0] text-[#18181B] hover:border-[#EA580C] text-xs font-semibold transition-all shadow-sm"
                >
                  Pesanan Saya
                </Link>
              </div>
            ) : (
              <Link
                href="/login?redirect=/reservation"
                className="px-3 sm:px-4 py-2 rounded-full bg-white border border-[#E2E8F0] text-[#18181B] hover:text-[#EA580C] text-xs font-bold transition-all shadow-sm"
              >
                <span className="hidden xs:inline">Masuk ke </span>Akun
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 5-STEP JOURNEY STEPPER BAR */}
      <div className="border-b border-[#E2E8F0] bg-white px-3 sm:px-6 py-3 sm:py-4 shadow-sm overflow-x-auto scrollbar-none">
        <div className="max-w-4xl mx-auto flex items-center justify-between min-w-[280px]">
          {[
            { step: 1, label: "Jadwal & Tamu", icon: Calendar },
            { step: 2, label: "Pilih Menu", icon: UtensilsCrossed },
            { step: 3, label: "Pilih Meja", icon: MapPin },
            { step: 4, label: "Pembayaran", icon: CreditCard },
            { step: 5, label: "Struk & QR Pass", icon: Receipt },
          ].map((item, idx) => {
            const isDone = currentStep > item.step;
            const isCurrent = currentStep === item.step;

            return (
              <React.Fragment key={item.step}>
                <button
                  type="button"
                  disabled={currentStep < item.step}
                  onClick={() => currentStep > item.step && setCurrentStep(item.step)}
                  className={`flex items-center gap-1.5 sm:gap-2 transition-all ${
                    isCurrent
                      ? "text-[#EA580C] scale-105 font-bold"
                      : isDone
                      ? "text-[#14281D] hover:text-[#EA580C] cursor-pointer"
                      : "text-stone-400 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs transition-all shrink-0 ${
                      isCurrent
                        ? "bg-[#EA580C] text-white font-bold shadow-cta"
                        : isDone
                        ? "bg-[#14281D] text-white"
                        : "bg-[#F3EFE6] text-stone-400"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : item.step}
                  </div>
                  <span className="hidden md:inline text-xs tracking-wide">{item.label}</span>
                </button>
                {idx < 4 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 sm:mx-2 rounded-full transition-all ${
                      currentStep > idx + 1 ? "bg-[#14281D]" : "bg-[#E2E8F0]"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-[1280px] mx-auto px-3.5 sm:px-6 lg:px-12 py-6 sm:py-8 w-full flex-1">
        {/* ============================================================== */}
        {/* STEP 1: PILIH TANGGAL, SESI WAKTU & JUMLAH TAMU */}
        {/* ============================================================== */}
        {currentStep === 1 && (
          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EA580C]/10 border border-[#EA580C]/20 text-[#EA580C] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tahap 1: Konfigurasi Kehadiran & Sesi Jamuan</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-display font-bold tracking-tight text-[#18181B]">
                Rencanakan Kehadiran Istimewa Anda
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto">
                Tentukan tanggal jamuan, pilih sesi waktu yang diinginkan, dan jumlah tamu yang akan hadir menikmati perjamuan adiboga di Savoria.
              </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-card p-4 sm:p-8 space-y-6 shadow-float">
              {/* VIP Authentication Guard Status */}
              {!user ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center shrink-0 shadow-cta">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#18181B] flex items-center gap-1.5">
                        <span>Wajib Masuk (Login) untuk Membooking Meja</span>
                        <span className="text-[10px] bg-[#EA580C] text-white px-2 py-0.5 rounded-full font-mono uppercase font-bold">VIP</span>
                      </h4>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Demi kepastian reservasi dan keamanan data jamuan, pemesan wajib masuk ke akun terlebih dahulu.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/login?redirect=/reservation"
                    className="px-5 py-2.5 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold transition-all shadow-cta whitespace-nowrap self-stretch sm:self-auto text-center cursor-pointer"
                  >
                    Masuk / Buat Akun Dulu →
                  </Link>
                </div>
              ) : (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-emerald-900">Akun Terverifikasi:</span>{" "}
                      <span className="font-semibold">{user.name}</span>{" "}
                      <span className="text-[#64748B]">({user.email})</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold uppercase">
                    VIP Patron
                  </span>
                </div>
              )}

              {/* Data Tamu Pemesan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-[#E2E8F0]">
                <div>
                  <label className="text-xs font-bold text-[#18181B] block mb-1.5">
                    Nama Pemesan / Atas Nama Reservasi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Lord Aditya Pratama"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl text-xs text-[#18181B] placeholder:text-stone-400 focus:outline-none focus:border-[#EA580C]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#18181B] block mb-1.5">
                    Nomor WhatsApp / Kontak Konfirmasi
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="08123456789"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl text-xs text-[#18181B] placeholder:text-stone-400 focus:outline-none focus:border-[#EA580C]"
                  />
                </div>
              </div>

              {/* Tanggal & Jumlah Tamu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-[#18181B] block mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#EA580C]" />
                    <span>Pilih Tanggal Jamuan</span>
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl text-xs text-[#18181B] focus:outline-none focus:border-[#EA580C] font-medium"
                  />
                  <p className="text-[11px] text-[#64748B] mt-1">
                    *Reservasi dibuka hingga 30 hari ke depan.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#18181B] block mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#EA580C]" />
                    <span>Jumlah Tamu (Party Size)</span>
                  </label>
                  <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2.5 xs:gap-3">
                    <div className="flex items-center bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl p-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                        className="w-9 h-9 rounded-lg bg-white text-[#18181B] border border-[#E2E8F0] font-bold flex items-center justify-center hover:bg-stone-50 cursor-pointer shadow-sm"
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-sm font-black text-[#EA580C] font-mono">
                        {guestCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setGuestCount(Math.min(16, guestCount + 1))}
                        className="w-9 h-9 rounded-lg bg-white text-[#18181B] border border-[#E2E8F0] font-bold flex items-center justify-center hover:bg-stone-50 cursor-pointer shadow-sm"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-[#64748B]">
                      {guestCount === 2 ? "Intimate Couple Table" : guestCount <= 4 ? "Family Table" : "Grand Banquet / VIP Chamber"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sesi Waktu */}
              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#EA580C]" />
                  <span>Pilih Sesi Jamuan Makan (Dining Session)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTimeSlot === slot.label;
                    return (
                      <button
                        key={slot.label}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot.label)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#EA580C]/10 border-[#EA580C] text-[#EA580C] shadow-sm"
                            : "bg-[#FDFBF7] border-[#E2E8F0] hover:bg-white text-[#18181B]"
                        }`}
                      >
                        <span className="text-xs font-bold block">{slot.label}</span>
                        <span className="text-[10px] text-[#64748B] block mt-0.5">{slot.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Permintaan Khusus */}
              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1.5">
                  Permintaan Khusus & Preferensi Jamuan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Merayakan Wedding Anniversary, preferensi pemandangan taman, alergi kacang/seafood..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl text-xs text-[#18181B] placeholder:text-stone-400 focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              {/* Navigasi Selanjutnya */}
              <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      toast.warning("Silakan masuk (login) ke akun Anda terlebih dahulu untuk membooking meja.", "Wajib Login");
                      router.push("/login?redirect=/reservation");
                      return;
                    }
                    if (!customerName.trim()) {
                      toast.warning("Harap masukkan nama pemesan terlebih dahulu.", "Nama Pemesan Diperlukan");
                      return;
                    }
                    setCurrentStep(2);
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-full text-xs flex items-center justify-center gap-2 shadow-cta transition-all cursor-pointer"
                >
                  <span>Lanjut ke Pemilihan Menu</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: MEMILIH MENU KULINER */}
        {/* ============================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EA580C]/10 border border-[#EA580C]/20 text-[#EA580C] text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tahap 2: Pemilihan Menu Mahakarya</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#18181B] mt-1">
                  Pilih Menu Perjamuan Bintang Lima
                </h2>
                <p className="text-xs text-[#64748B]">
                  Dipersiapkan langsung oleh Executive Chef dengan bahan baku segar berstandar internasional.
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm shrink-0 ${
                    selectedCategory === "all"
                      ? "bg-[#EA580C] text-white shadow-cta"
                      : "bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#18181B]"
                  }`}
                >
                  Semua ({allMenus.length})
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(String(c.id))}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm shrink-0 ${
                      selectedCategory === String(c.id)
                        ? "bg-[#EA580C] text-white shadow-cta"
                        : "bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#18181B]"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayedMenus.map((m) => {
                const inCart = cart.find((i) => i.menuId === m.id);
                return (
                  <div
                    key={m.id}
                    className="bg-white rounded-card border border-[#E2E8F0] overflow-hidden shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
                  >
                    <div className="h-44 w-full relative bg-stone-100 overflow-hidden">
                      {m.image ? (
                        <Image
                          src={m.image}
                          alt={m.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <UtensilsCrossed className="w-10 h-10" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] text-[#EA580C] font-bold shadow-sm">
                        Chef&apos;s Pick
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-display font-bold text-base text-[#18181B] group-hover:text-[#EA580C] transition-colors">
                          {m.name}
                        </h4>
                        <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                          {m.description || "Hidangan haute cuisine racikan Executive Chef."}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                        <span className="font-display font-bold text-base text-[#18181B]">
                          {formatIDR(m.price)}
                        </span>

                        {inCart ? (
                          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#FDFBF7] border border-[#E2E8F0] rounded-full p-1">
                            <button
                              type="button"
                              onClick={() => updateCartQty(m.id, -1)}
                              className="w-7 h-7 rounded-full bg-white text-[#18181B] border border-[#E2E8F0] flex items-center justify-center text-xs font-bold hover:bg-stone-100 cursor-pointer shadow-sm"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-[#EA580C]">
                              {inCart.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(m.id, 1)}
                              className="w-7 h-7 rounded-full bg-[#EA580C] text-white flex items-center justify-center text-xs font-bold hover:bg-[#C2410C] cursor-pointer shadow-sm"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(m)}
                            className="px-3.5 sm:px-4 py-2 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold flex items-center gap-1.5 shadow-cta transition-all cursor-pointer shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Pilih Menu</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky Floating Bottom Bar for Cart Summary */}
            <div className="sticky bottom-4 sm:bottom-6 z-30 max-w-2xl mx-auto bg-[#14281D] text-white p-3 sm:p-4 rounded-2xl sm:rounded-full shadow-2xl border border-emerald-500/30 flex items-center justify-between gap-2 mx-1 sm:mx-auto">
              <div className="pl-2 sm:pl-3 min-w-0">
                <span className="text-[10px] sm:text-[11px] text-stone-300 block font-mono truncate">
                  {cart.length} Jenis Menu Dipilih
                </span>
                <span className="font-display text-base sm:text-lg font-bold text-[#F59E0B]">
                  {formatIDR(subtotal)}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-3 sm:px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
                >
                  ← Kembali
                </button>
                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={() => setCurrentStep(3)}
                  className="px-4 sm:px-6 py-2.5 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs flex items-center gap-1.5 shadow-cta disabled:opacity-40 cursor-pointer"
                >
                  <span>Pilih Meja</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: MEMILIH MEJA DENGAN DENAH VISUAL KURSI & SUASANA */}
        {/* ============================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EA580C]/10 border border-[#EA580C]/20 text-[#EA580C] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tahap 3: Denah Meja & Suasana Jamuan</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#18181B]">
                Pilih Meja Eksklusif Favorit Anda
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto">
                Pilih meja berdasarkan denah visual kursi dan kapasitas tamu, sesuaikan dengan suasana pilihan Anda di Grand Salle, Jardin Patio, atau Mezzanine VIP.
              </p>
            </div>

            {/* Interactive Visual Floor Plan */}
            <VisualFloorPlan
              tables={tables}
              mode="reservation"
              selectedTable={selectedTable}
              guestCount={guestCount}
              onSelectTable={(tbl) => {
                setSelectedTable(tbl);
                toast.success(
                  `Meja ${tbl.tableNumber} (${tbl.capacity} Kursi - ${tbl.area}) berhasil dipilih!`,
                  "Meja Terpilih"
                );
              }}
              onRefresh={() => {
                fetch("/api/v1/pos/tables")
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.success) {
                      setTables(data.data);
                      toast.info("Denah ketersediaan meja berhasil diperbarui.", "Status Meja Terkini");
                    }
                  })
                  .catch(() => {});
              }}
            />

            {/* Navigation buttons */}
            <div className="pt-6 border-t border-[#E2E8F0] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 rounded-full border border-[#E2E8F0] bg-white text-[#18181B] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#F3EFE6] cursor-pointer shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali ke Menu</span>
              </button>

              <button
                type="button"
                disabled={!selectedTable}
                onClick={() => {
                  if (!selectedTable) {
                    toast.warning("Silakan pilih salah satu meja yang tersedia terlebih dahulu.", "Meja Belum Dipilih");
                    return;
                  }
                  setCurrentStep(4);
                }}
                className="px-8 py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-full text-xs flex items-center justify-center gap-2 shadow-cta disabled:opacity-50 cursor-pointer"
              >
                <span>Lanjut ke Pembayaran</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4: RINGKASAN & PEMBAYARAN */}
        {/* ============================================================== */}
        {currentStep === 4 && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EA580C]/10 border border-[#EA580C]/20 text-[#EA580C] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tahap 4: Pembayaran & Konfirmasi Resmi</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#18181B]">
                Konfirmasi Jamuan & Selesaikan Pembayaran
              </h2>
              <p className="text-xs text-[#64748B]">
                Selesaikan pembayaran secara aman untuk langsung mengamankan meja dan menerbitkan struk digital ber-QR code resmi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-start">
              {/* Order & Booking Summary */}
              <div className="md:col-span-7 bg-white border border-[#E2E8F0] rounded-card p-4 sm:p-7 space-y-4 shadow-float">
                <div className="border-b border-[#E2E8F0] pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#EA580C] font-mono">
                    Ringkasan Pemesanan Meja
                  </span>
                  <h3 className="text-lg font-display font-bold text-[#18181B] mt-0.5">
                    {selectedTable?.tableNumber}
                  </h3>
                  <p className="text-xs text-[#64748B] flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                    <span>{selectedDate}</span> • <span>{selectedTimeSlot}</span> • <span>{guestCount} Tamu</span>
                  </p>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.menuId} className="flex items-center justify-between text-xs py-1.5 border-b border-[#E2E8F0]/60 gap-2">
                      <div className="min-w-0">
                        <span className="font-bold text-[#18181B] truncate block">{item.name}</span>
                        <span className="text-[11px] text-[#64748B]">x{item.quantity}</span>
                      </div>
                      <span className="font-mono font-bold text-[#18181B] shrink-0">
                        {formatIDR(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal, Pajak, Service, Total */}
                <div className="pt-3 border-t border-[#E2E8F0] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#64748B]">
                    <span>Subtotal Menu:</span>
                    <span className="font-mono">{formatIDR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Pajak Restoran PB1 (10%):</span>
                    <span className="font-mono">{formatIDR(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Service Charge (5%):</span>
                    <span className="font-mono">{formatIDR(serviceCharge)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#18181B] pt-2 border-t border-[#E2E8F0]">
                    <span>Total Pembayaran:</span>
                    <span className="text-[#EA580C] font-display text-lg">{formatIDR(totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="md:col-span-5 bg-white border border-[#E2E8F0] rounded-card p-4 sm:p-7 space-y-5 shadow-float">
                <div>
                  <h4 className="font-display font-bold text-base text-[#18181B]">
                    Metode Pembayaran
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Pilih saluran pembayaran resmi instan:
                  </p>
                </div>

                <div className="space-y-2.5">
                  {/* QRIS */}
                  <label
                    onClick={() => setPaymentMethod("qris")}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === "qris"
                        ? "bg-[#EA580C]/10 border-[#EA580C] shadow-sm"
                        : "bg-[#FDFBF7] border-[#E2E8F0] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#EA580C]/15 text-[#EA580C] flex items-center justify-center font-bold">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#18181B] block">QRIS Dinamis</span>
                        <span className="text-[10px] text-[#64748B]">BCA, Mandiri, GoPay, OVO</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="pay"
                      checked={paymentMethod === "qris"}
                      onChange={() => setPaymentMethod("qris")}
                      className="accent-[#EA580C]"
                    />
                  </label>

                  {/* Credit Card */}
                  <label
                    onClick={() => setPaymentMethod("card")}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === "card"
                        ? "bg-[#EA580C]/10 border-[#EA580C] shadow-sm"
                        : "bg-[#FDFBF7] border-[#E2E8F0] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#14281D]/15 text-[#14281D] flex items-center justify-center font-bold">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#18181B] block">Kartu Kredit / Debit</span>
                        <span className="text-[10px] text-[#64748B]">Visa, Mastercard, JCB</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="pay"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="accent-[#EA580C]"
                    />
                  </label>

                  {/* Cash */}
                  <label
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === "cash"
                        ? "bg-[#EA580C]/10 border-[#EA580C] shadow-sm"
                        : "bg-[#FDFBF7] border-[#E2E8F0] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center font-bold">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#18181B] block">Concierge Cash</span>
                        <span className="text-[10px] text-[#64748B]">Bayar saat tiba di kasir</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="pay"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                      className="accent-[#EA580C]"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleExecutePayment}
                  className="w-full py-4 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 shadow-cta transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <span>Memverifikasi Pembayaran...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Konfirmasi & Bayar ({formatIDR(totalAmount)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 5: DIGITAL RECEIPT & QR ENTRY PASS */}
        {/* ============================================================== */}
        {currentStep === 5 && completedOrder && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#18181B]">
                Pembayaran Berhasil & Terkonfirmasi
              </h2>
              <p className="text-xs text-[#64748B]">
                Tanda terima resmi jamuan Anda telah diterbitkan. Tunjukkan kode QR ini saat tiba di restoran.
              </p>
            </div>

            {/* LUXURY OFFICIAL RECEIPT CARD */}
            <div
              id="printable-receipt"
              className="bg-white text-[#18181B] rounded-card p-4 sm:p-8 space-y-6 shadow-float border border-[#E2E8F0] relative overflow-hidden"
            >
              {/* Receipt Brand Banner */}
              <div className="text-center space-y-1.5 border-b-2 border-dashed border-[#E2E8F0] pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C] font-mono">
                  ★ Savoria Haute Restaurant ★
                </span>
                <h3 className="font-display font-black text-xl sm:text-2xl tracking-tight text-[#18181B]">
                  SAVORIA RESTAURANT
                </h3>
                <p className="text-xs text-[#64748B] italic">
                  The Grand Pavilion • SCBD Financial District, Jakarta
                </p>
                <div className="inline-block mt-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase font-mono tracking-wider">
                  STATUS: LUNAS / PAID IN FULL
                </div>
              </div>

              {/* Booking & Schedule Identification */}
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3 text-xs font-mono bg-[#FDFBF7] p-3.5 sm:p-4 rounded-xl border border-[#E2E8F0]">
                <div>
                  <span className="text-[#64748B] block text-[10px]">No. Bukti Reservasi:</span>
                  <span className="font-bold text-[#18181B]">{completedOrder.orderNumber}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">Tanggal & Waktu Jamuan:</span>
                  <span className="font-bold text-[#18181B]">
                    {completedOrder.reservationDate || selectedDate}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">Meja & Area:</span>
                  <span className="font-bold text-[#EA580C]">
                    {completedOrder.table?.tableNumber || selectedTable?.tableNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">Sesi Waktu:</span>
                  <span className="font-bold text-[#18181B]">
                    {completedOrder.reservationTime || selectedTimeSlot}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">Atas Nama Tamu:</span>
                  <span className="font-bold text-[#18181B]">{completedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">Jumlah Tamu:</span>
                  <span className="font-bold text-[#18181B]">
                    {completedOrder.guestCount || guestCount} Orang
                  </span>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#18181B] block uppercase tracking-wider">
                  Rincian Pesanan Hidangan:
                </span>
                <div className="border-t border-b border-dashed border-[#E2E8F0] py-3 space-y-2 text-xs font-mono">
                  {completedOrder.items?.map((it: any) => (
                    <div key={it.id} className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-[#18181B]">
                          {it.quantity}x {it.menu?.name}
                        </span>
                        {it.notes && (
                          <p className="text-[10px] text-[#EA580C] italic">Catatan: {it.notes}</p>
                        )}
                      </div>
                      <span className="font-bold text-[#18181B] whitespace-nowrap pl-4">
                        {formatIDR(it.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-[#64748B]">
                  <span>Subtotal:</span>
                  <span>{formatIDR(completedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>PB1 / Pajak Restoran (10%):</span>
                  <span>{formatIDR(completedOrder.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Service Charge (5%):</span>
                  <span>{formatIDR(completedOrder.serviceCharge)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#18181B] pt-2 border-t-2 border-[#18181B]">
                  <span>TOTAL DIBAYAR:</span>
                  <span className="text-[#EA580C] font-display text-lg">{formatIDR(completedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* QR Code Entry Pass */}
              {receiptQrDataUrl && (
                <div className="text-center pt-2 border-t border-dashed border-[#E2E8F0] space-y-2">
                  <div className="w-40 h-40 mx-auto relative p-2 bg-[#FDFBF7] rounded-xl border border-[#E2E8F0]">
                    <Image
                      src={receiptQrDataUrl}
                      alt="Receipt QR Entry Pass"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <span className="text-[11px] text-[#64748B] block font-mono">
                    Scan QR ini di meja atau tunjukkan ke Maître D&apos; kasir.
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3.5 bg-white border border-[#E2E8F0] text-[#18181B] hover:bg-[#F3EFE6] font-bold rounded-full text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#EA580C]" />
                <span>Cetak Struk Resmi (PDF / Thermal)</span>
              </button>

              <Link
                href="/user"
                className="flex-1 py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-full text-xs flex items-center justify-center gap-2 shadow-cta transition-all"
              >
                <span>Buka Portal Tamu VIP</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] px-6 py-6 text-center text-xs text-[#64748B] bg-white mt-12">
        <p>© 2026 Savoria Modern Restaurant • Reservation & Dining System</p>
      </footer>
    </div>
  );
}

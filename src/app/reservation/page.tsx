"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
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

export default function LuxuryReservationPage() {
  const { user } = useAuth();

  // Wizard Step: 1 (Date/Time/Pax), 2 (Menu), 3 (Table), 4 (Payment), 5 (Receipt)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1 STATE: Date, Time Session, Guests
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(
    "19:30 - Grand Dinner Gala"
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
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "credit_card" | "cash">("qris");
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [cardNumber, setCardNumber] = useState<string>("4532 •••• •••• 8892");
  const [cardHolder, setCardHolder] = useState<string>("");

  // STEP 5 STATE: Final Completed Order & QR Receipt
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [receiptQrDataUrl, setReceiptQrDataUrl] = useState<string>("");

  // Auto-fill user profile if logged in
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
      if (!cardHolder) setCardHolder(user.name);
    }
  }, [user]);

  // Fetch Menus and Tables
  useEffect(() => {
    fetch("/api/v1/customer/menus")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      })
      .catch(() => {});

    fetch("/api/v1/pos/tables")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTables(data.data);
      })
      .catch(() => {});
  }, []);

  // Time Slots Available
  const timeSlots = [
    { label: "12:00 - Luncheon Soirée", desc: "Sesi siang elegan & segar" },
    { label: "13:30 - Midday Gourmet", desc: "Santap siang tenang & privat" },
    { label: "17:30 - Sunset & Aperitivo", desc: "Golden hour cocktail & starter" },
    { label: "19:00 - Prime Evening Gala", desc: "Suasana romantis lilin malam" },
    { label: "19:30 - Grand Dinner Gala", desc: "Sesi makan malam utama terfavorit" },
    { label: "20:30 - Late Night Soirée", desc: "Makan malam intim eksklusif" },
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

  const updateCartQty = (index: number, delta: number) => {
    const updated = [...cart];
    const newQty = updated[index].quantity + delta;
    if (newQty > 0) {
      updated[index].quantity = newQty;
      setCart(updated);
    } else {
      setCart(cart.filter((_, i) => i !== index));
    }
  };

  // Cart Financials
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * 0.1);
  const service = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + tax + service;

  // Finalize Booking & Direct Payment
  const handleFinalPayment = async () => {
    if (!selectedTable) {
      alert("Harap pilih meja terlebih dahulu.");
      setCurrentStep(3);
      return;
    }

    if (cart.length === 0) {
      alert("Harap pilih minimal 1 hidangan menu kuliner.");
      setCurrentStep(2);
      return;
    }

    setIsProcessingPayment(true);

    try {
      const payload = {
        tableId: selectedTable.id,
        qrToken: selectedTable.qrToken,
        customerName: customerName.trim() || user?.name || "Tamu Terhormat",
        customerPhone: customerPhone.trim() || user?.phone || "081200000000",
        reservationDate: selectedDate,
        reservationTime: selectedTimeSlot,
        guestCount,
        specialRequests,
        orderType: "reservation",
        isDirectPayment: true,
        paymentMethod,
        amountPaid: totalAmount,
        userId: user?.id,
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

        // Generate high-res verification QR for reception
        const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
        const verificationUrl = `${origin}/table/${selectedTable.qrToken}?verifiedOrder=${data.data.orderNumber}`;
        const qrUrl = await QRCode.toDataURL(verificationUrl, {
          width: 300,
          margin: 2,
          color: { dark: "#0f172a", light: "#ffffff" },
        });
        setReceiptQrDataUrl(qrUrl);

        setCurrentStep(5); // Go to Receipt step!
      } else {
        alert(data.message || "Gagal memproses reservasi & pembayaran.");
      }
    } catch {
      alert("Terjadi gangguan koneksi saat memproses reservasi.");
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
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-[#0b0f19] to-slate-950 text-white selection:bg-amber-500 selection:text-slate-950 flex flex-col justify-between font-sans">
      {/* 5-STAR LUXURY HEADER */}
      <header className="border-b border-amber-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-amber-300 via-amber-500 to-yellow-600 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              ★
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif tracking-widest text-lg font-black text-transparent bg-clip-text bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500">
                  L&apos;ÉTOILE ROYALE
                </span>
                <span className="text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                  Grand Réservation
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wide font-light">
                Michelin 3-Star Gastronomy & Private Dining Experience
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-bold text-amber-300 block">{user.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                    {user.role === "admin" ? "General Manager" : user.role === "kasir" ? "Maître D'" : "VIP Patron"}
                  </span>
                </div>
                <Link
                  href="/user"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs font-semibold transition-all"
                >
                  Pesanan Saya
                </Link>
              </div>
            ) : (
              <Link
                href="/login?redirect=/reservation"
                className="px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold transition-all shadow-md"
              >
                Masuk / Login Tamu
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 5-STEP LUXURY JOURNEY STEPPER BAR */}
      <div className="border-b border-slate-800/80 bg-slate-900/50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {[
            { step: 1, label: "Jadwal & Tamu", icon: Calendar },
            { step: 2, label: "Menu Pilihan", icon: UtensilsCrossed },
            { step: 3, label: "Pilih Meja", icon: MapPin },
            { step: 4, label: "Pembayaran", icon: CreditCard },
            { step: 5, label: "Struk Lengkap", icon: Receipt },
          ].map((item, idx) => {
            const isDone = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            const Icon = item.icon;

            return (
              <React.Fragment key={item.step}>
                <button
                  type="button"
                  disabled={currentStep < item.step}
                  onClick={() => currentStep > item.step && setCurrentStep(item.step)}
                  className={`flex items-center gap-2 transition-all ${
                    isCurrent
                      ? "text-amber-400 scale-105 font-bold"
                      : isDone
                      ? "text-emerald-400 hover:text-emerald-300 cursor-pointer"
                      : "text-slate-600 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                      isCurrent
                        ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30"
                        : isDone
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : item.step}
                  </div>
                  <span className="hidden md:inline text-xs tracking-wide">{item.label}</span>
                </button>
                {idx < 4 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${
                      currentStep > idx + 1 ? "bg-emerald-500/40" : "bg-slate-800"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {/* ============================================================== */}
        {/* STEP 1: PILIH TANGGAL, SESI WAKTU & JUMLAH TAMU */}
        {/* ============================================================== */}
        {currentStep === 1 && (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tahap 1: Konfigurasi Kehadiran & Sesi Jamuan</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-white">
                Rencanakan Kehadiran Istimewa Anda
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                Tentukan tanggal jamuan, pilih sesi waktu yang diinginkan, dan jumlah tamu yang akan hadir menikmati perjamuan haute cuisine.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-amber-500/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
              {/* Data Tamu Pemesan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-800">
                <div>
                  <label className="text-xs font-bold text-amber-200 block mb-1.5">
                    Nama Pemesan / Atas Nama Reservasi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Lord Aditya Pratama"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-amber-200 block mb-1.5">
                    Nomor WhatsApp / Kontak Konfirmasi
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="08123456789"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Tanggal & Jumlah Tamu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-amber-200 block mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>Pilih Tanggal Jamuan</span>
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    *Reservasi dibuka hingga 30 hari ke depan.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-200 block mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Jumlah Tamu (Party Size)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                        className="w-9 h-9 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-sm font-black text-amber-300 font-mono">
                        {guestCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setGuestCount(Math.min(16, guestCount + 1))}
                        className="w-9 h-9 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-slate-400">
                      {guestCount === 2 ? "Intimate Couple Table" : guestCount <= 4 ? "Family / Four-Top Table" : "Grand Banquet / VIP Suite"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sesi Waktu */}
              <div>
                <label className="text-xs font-bold text-amber-200 block mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Pilih Sesi Jamuan Makan (Dining Session)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTimeSlot === slot.label;
                    return (
                      <button
                        key={slot.label}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot.label)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-400 text-amber-200 shadow-md shadow-amber-500/10"
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300"
                        }`}
                      >
                        <span className="text-xs font-bold block">{slot.label}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{slot.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Permintaan Khusus */}
              <div>
                <label className="text-xs font-bold text-amber-200 block mb-1.5">
                  Permintaan Khusus & Preferensi Jamuan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Merayakan Wedding Anniversary ke-5, preferensi pemandangan taman, alergi kacang/seafood..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Navigasi Selanjutnya */}
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!customerName) {
                      alert("Harap masukkan nama pemesan terlebih dahulu.");
                      return;
                    }
                    setCurrentStep(2);
                  }}
                  className="px-6 py-3 bg-linear-to-r from-amber-400 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <span>Lanjut ke Pemilihan Menu</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: MEMILIH MENU KULINER BINTANG 5 */}
        {/* ============================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tahap 2: Pemilihan Hidangan Kuliner Haute Cuisine</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-white mt-1">
                  Pilih Menu Perjamuan Michelin 3-Star
                </h2>
                <p className="text-xs text-slate-400">
                  Dipersiapkan secara langsung oleh Executive Chef dengan bahan baku import langka kelas dunia.
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === "all"
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Semua Hidangan ({allMenus.length})
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(String(c.id))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === String(c.id)
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedMenus.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl transition-all group"
                >
                  <div className="h-48 relative bg-slate-800 overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <UtensilsCrossed className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                      Michelin Grade
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-serif font-black text-base text-white group-hover:text-amber-300 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">
                          Harga per Porsi
                        </span>
                        <span className="text-base font-black text-amber-400 font-mono">
                          {formatIDR(item.price)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Pilih Menu</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FLOATING LUXURY BILL BOTTOM BAR */}
            <div className="sticky bottom-4 z-40 bg-slate-900/95 border border-amber-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400">
                    {cart.reduce((s, i) => s + i.quantity, 0)} Porsi Hidangan Terpilih
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                      {formatIDR(totalAmount)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      (Termasuk Pajak PB1 10% & Layanan 5%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Ubah Jadwal</span>
                </button>

                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-linear-to-r from-amber-400 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                >
                  <span>Lanjut ke Pemilihan Meja</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Customization Modal */}
            {customizingMenu && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="font-serif font-black text-lg text-white">
                        Kustomisasi Hidangan
                      </h3>
                      <p className="text-xs text-amber-400">{customizingMenu.name}</p>
                    </div>
                    <button
                      onClick={() => setCustomizingMenu(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                    {customizingMenu.modifierGroups.map((group) => (
                      <div key={group.id} className="space-y-2">
                        <label className="text-xs font-bold text-amber-200 block">
                          {group.name}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {group.options.map((opt: any) => {
                            const selected = (selectedModifiers[group.id] || []).includes(opt.id);
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  setSelectedModifiers({
                                    ...selectedModifiers,
                                    [group.id]: [opt.id],
                                  });
                                }}
                                className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                                  selected
                                    ? "bg-amber-500/20 border-amber-400 text-amber-300 font-bold"
                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span>{opt.name}</span>
                                  {opt.price > 0 && (
                                    <span className="text-[10px] text-amber-400 font-mono">
                                      +{formatIDR(opt.price)}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div>
                      <label className="text-xs font-bold text-amber-200 block mb-1">
                        Catatan Khusus untuk Chef
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Saus disajikan terpisah, kurangi garam..."
                        value={itemNotes}
                        onChange={(e) => setItemNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setCustomizingMenu(null)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800"
                    >
                      Batal
                    </button>
                    <button
                      onClick={confirmCustomization}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
                    >
                      Tambahkan ke Keranjang
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: MEMILIH MEJA & SUASANA RESTORAN */}
        {/* ============================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tahap 3: Pemilihan Meja & Suasana Jamuan</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-white">
                Pilih Meja Eksklusif Favorit Anda
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                Pilih suasana santap di Grand Salon berpendingin udara, Veranda romantis di tepi taman, atau Suite VIP privat di lantai 2.
              </p>
            </div>

            {/* Table Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {tables.map((tbl) => {
                const isSelected = selectedTable?.id === tbl.id;
                const isAvailable = tbl.status === "available";
                const isSuitable = tbl.capacity >= guestCount;

                return (
                  <div
                    key={tbl.id}
                    onClick={() => {
                      if (isAvailable) setSelectedTable(tbl);
                    }}
                    className={`rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-400 shadow-xl shadow-amber-500/20 scale-[1.02]"
                        : isAvailable
                        ? "bg-slate-900/80 border-slate-800 hover:border-amber-500/40 cursor-pointer"
                        : "bg-slate-950/40 border-slate-900 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-300 font-mono">
                          {tbl.area}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isAvailable
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {isAvailable ? "Tersedia" : "Sudah Dipesan"}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-serif font-black text-base text-white">
                          {tbl.tableNumber}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>Kapasitas hingga {tbl.capacity} Tamu</span>
                        </p>
                      </div>

                      {!isSuitable && isAvailable && (
                        <p className="text-[10px] text-amber-400/80 italic">
                          *Kapasitas lebih kecil dari jumlah tamu ({guestCount} pax).
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">
                        {isSelected ? "✓ Meja Terpilih" : "Klik untuk Memilih"}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {isSelected ? "★" : "→"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali ke Menu</span>
              </button>

              <button
                type="button"
                disabled={!selectedTable}
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2.5 bg-linear-to-r from-amber-400 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                <span>Lanjut ke Pembayaran</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4: KONFIRMASI RINGKASAN & PEMBAYARAN */}
        {/* ============================================================== */}
        {currentStep === 4 && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tahap 4: Pembayaran & Konfirmasi Resmi</span>
              </div>
              <h2 className="text-3xl font-serif font-black text-white">
                Konfirmasi Jamuan & Selesaikan Pembayaran
              </h2>
              <p className="text-xs text-slate-400">
                Lakukan pembayaran secara aman untuk langsung mengamankan meja dan menerima tanda terima resmi ber-barcode.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Order & Booking Summary */}
              <div className="md:col-span-7 bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Ringkasan Pemesanan Bintang 5
                  </span>
                  <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                    {selectedTable?.tableNumber}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedDate} • {selectedTimeSlot} • {guestCount} Tamu (Pax)
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Atas Nama:</span>
                    <span className="font-bold text-white">{customerName}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Kontak WhatsApp:</span>
                    <span className="font-mono text-white">{customerPhone}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Area Suasana:</span>
                    <span className="text-amber-300">{selectedTable?.area}</span>
                  </div>
                  {specialRequests && (
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-amber-300/90 italic">
                      Catatan: &ldquo;{specialRequests}&rdquo;
                    </div>
                  )}
                </div>

                {/* Items Breakdown */}
                <div className="border-t border-slate-800 pt-3 space-y-2">
                  <span className="text-xs font-bold text-amber-300 block">Daftar Hidangan:</span>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {cart.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">
                            {item.quantity}x {item.name}
                          </p>
                          {item.selectedVariants.length > 0 && (
                            <p className="text-[10px] text-amber-400">
                              {item.selectedVariants.map((v) => `${v.group}: ${v.option}`).join(", ")}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-[10px] text-slate-400 italic">Catatan: {item.notes}</p>
                          )}
                        </div>
                        <span className="font-mono font-bold text-white">
                          {formatIDR(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal Makanan & Minuman:</span>
                    <span>{formatIDR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Pajak Restoran PB1 (10%):</span>
                    <span>{formatIDR(tax)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Layanan Bintang 5 (5%):</span>
                    <span>{formatIDR(service)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-amber-300 pt-2 border-t border-slate-800">
                    <span>TOTAL PEMBAYARAN:</span>
                    <span>{formatIDR(totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="md:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Metode Pembayaran Resmi
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">Pilih Cara Bayar</h3>
                </div>

                <div className="space-y-2.5">
                  {/* QRIS */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("qris")}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      paymentMethod === "qris"
                        ? "bg-amber-500/15 border-amber-400 text-white shadow-md shadow-amber-500/10"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">QRIS Instan Otomatis</div>
                        <p className="text-[10px] text-slate-400">BCA, GoPay, OVO, Dana, ShopeePay</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-400">Instant</span>
                  </button>

                  {/* Credit Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("credit_card")}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      paymentMethod === "credit_card"
                        ? "bg-amber-500/15 border-amber-400 text-white shadow-md shadow-amber-500/10"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Kartu Debit / Kredit Royale</div>
                        <p className="text-[10px] text-slate-400">Visa, Mastercard, JCB, BCA Card</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-purple-400">Secure</span>
                  </button>

                  {/* Cash / Concierge */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      paymentMethod === "cash"
                        ? "bg-amber-500/15 border-amber-400 text-white shadow-md shadow-amber-500/10"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Bayar di Tempat (Concierge)</div>
                        <p className="text-[10px] text-slate-400">Pelunasan langsung saat tiba di restoran</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* QRIS / Card Simulator Details */}
                {paymentMethod === "qris" && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/20 text-center space-y-2">
                    <p className="text-xs font-bold text-amber-300">Simulasi Pembayaran QRIS Dinamis</p>
                    <div className="w-32 h-32 mx-auto bg-white rounded-xl p-2 flex items-center justify-center shadow-lg">
                      <QrCode className="w-28 h-28 text-slate-950" />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Klik tombol di bawah untuk verifikasi pembayaran otomatis seketika.
                    </p>
                  </div>
                )}

                {paymentMethod === "credit_card" && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/20 space-y-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        Nomor Kartu Kredit / Debit
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl font-mono text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        Nama Pemegang Kartu
                      </label>
                      <input
                        type="text"
                        value={cardHolder || customerName}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleFinalPayment}
                  className="w-full py-3.5 bg-linear-to-r from-amber-400 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                      <span>Memverifikasi Pembayaran...</span>
                    </span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Konfirmasi & Bayar Sekarang ({formatIDR(totalAmount)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 5: STRUK DIGITAL BINTANG 5 LENGKAP (FULL LUXURY RECEIPT) */}
        {/* ============================================================== */}
        {currentStep === 5 && completedOrder && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-serif font-black text-amber-300">
                Pembayaran Berhasil & Terkonfirmasi
              </h2>
              <p className="text-xs text-slate-400">
                Tanda terima resmi perjamuan Anda telah diterbitkan. Tunjukkan barcode ini saat tiba di restoran.
              </p>
            </div>

            {/* LUXURY OFFICIAL RECEIPT CARD */}
            <div
              id="printable-luxury-receipt"
              className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border-4 border-amber-500/40 relative overflow-hidden"
            >
              {/* Gold Ornament Top Banner */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-amber-400 via-yellow-500 to-amber-600" />

              {/* Receipt Header */}
              <div className="text-center space-y-1.5 border-b-2 border-dashed border-slate-200 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-widest">
                  ★ Michelin 3-Star Haute Cuisine ★
                </div>
                <h3 className="font-serif font-black text-2xl tracking-tight text-slate-950">
                  L&apos;ÉTOILE ROYALE
                </h3>
                <p className="text-xs text-slate-500 font-serif italic">
                  Grand Restaurant & Private Dining Salon
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Jl. Boulevard Royale No. 88, Menteng • Telp: (021) 8899-7700
                </p>
                <div className="inline-block mt-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase font-mono tracking-wider">
                  STATUS: LUNAS / PAID IN FULL
                </div>
              </div>

              {/* Booking & Schedule Identification */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">No. Bukti Reservasi:</span>
                  <span className="font-bold text-slate-900">{completedOrder.orderNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Tanggal & Waktu Jamuan:</span>
                  <span className="font-bold text-slate-900">
                    {completedOrder.reservationDate || selectedDate}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Meja & Area:</span>
                  <span className="font-bold text-amber-800">
                    {completedOrder.table?.tableNumber || selectedTable?.tableNumber} ({completedOrder.table?.area || selectedTable?.area})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Sesi Waktu:</span>
                  <span className="font-bold text-slate-900">
                    {completedOrder.reservationTime || selectedTimeSlot}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Atas Nama Tamu:</span>
                  <span className="font-bold text-slate-900">{completedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Jumlah Tamu (Party Size):</span>
                  <span className="font-bold text-slate-900">
                    {completedOrder.guestCount || guestCount} Orang
                  </span>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Rincian Pesanan Hidangan:
                </span>
                <div className="border-t border-b border-dashed border-slate-300 py-3 space-y-2 text-xs font-mono">
                  {completedOrder.items?.map((it: any) => (
                    <div key={it.id} className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-900">
                          {it.quantity}x {it.menu?.name}
                        </span>
                        {it.selectedVariants && (
                          <p className="text-[10px] text-slate-500">
                            {JSON.parse(it.selectedVariants).map((v: any) => `${v.group}: ${v.option}`).join(", ")}
                          </p>
                        )}
                        {it.notes && (
                          <p className="text-[10px] text-amber-800 italic">Catatan: {it.notes}</p>
                        )}
                      </div>
                      <span className="font-bold text-slate-900 whitespace-nowrap pl-4">
                        {formatIDR(it.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>{formatIDR(completedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>PB1 / Pajak Restoran (10%):</span>
                  <span>{formatIDR(completedOrder.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Service Charge Layanan Bintang 5 (5%):</span>
                  <span>{formatIDR(completedOrder.serviceCharge)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t-2 border-slate-900">
                  <span>TOTAL DIBAYAR:</span>
                  <span className="text-amber-700">{formatIDR(completedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Metode Pembayaran:</span>
                  <span className="font-bold uppercase text-slate-700">
                    {(completedOrder.paymentMethod || paymentMethod).toUpperCase()} (TERVERIFIKASI)
                  </span>
                </div>
              </div>

              {/* QR Code Verification for Reception Maître D' */}
              <div className="border-t-2 border-dashed border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left space-y-1">
                  <span className="text-xs font-bold text-slate-800 block">
                    Kode Masuk Verifikasi Meja
                  </span>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    Tunjukkan QR Code ini kepada Maître D&apos; atau pelayan saat tiba untuk diantar langsung ke meja Anda.
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Waktu Terbit: {formatDate(completedOrder.createdAt)}
                  </p>
                </div>

                {receiptQrDataUrl && (
                  <div className="p-2 rounded-2xl bg-slate-50 border border-slate-200 shrink-0 text-center">
                    <Image
                      src={receiptQrDataUrl}
                      alt="Verification QR"
                      width={100}
                      height={100}
                      className="mx-auto"
                    />
                    <span className="text-[9px] font-mono text-slate-500 mt-1 block font-bold">
                      SCAN FOR ENTRY
                    </span>
                  </div>
                )}
              </div>

              {/* Hospitality Disclaimer */}
              <div className="text-center pt-2 text-[10px] text-slate-400 font-serif italic border-t border-slate-100">
                &ldquo;Merupakan kehormatan tertinggi bagi kami untuk menyambut Anda di L&apos;Étoile Royale.&rdquo;
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Cetak / Simpan Struk (Print)</span>
              </button>

              <Link
                href="/user"
                className="w-full sm:flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Receipt className="w-4 h-4" />
                <span>Buka di Portal Pesanan Saya</span>
              </Link>

              <Link
                href="/"
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs flex items-center justify-center border border-slate-800"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 px-6 py-6 text-center text-xs text-slate-500">
        <p className="font-serif">
          L&apos;Étoile Royale Haute Gastronomie • An Exclusive Luxury Experience by RestoSync OS
        </p>
      </footer>
    </div>
  );
}

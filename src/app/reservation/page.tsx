"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { isTableCapacityEligible } from "@/components/tables/FloorTableFurniture";
import { PaymentMethodId } from "@/components/ui/PaymentLogos";

import dynamic from "next/dynamic";

// Sub-components
import { MenuItem, TableItem, CartItem, TimeSlotOption } from "@/components/reservation/types";
import { ReservationStepsNav } from "@/components/reservation/ReservationStepsNav";
import { ReservationScheduleStep } from "@/components/reservation/ReservationScheduleStep";
import { ReservationMenuStep } from "@/components/reservation/ReservationMenuStep";

// Dynamic Code-Splitting Lazy Loading for Heavy Steps & Modals
const ReservationFloorPlanStep = dynamic(
  () =>
    import("@/components/reservation/ReservationFloorPlanStep").then(
      (m) => m.ReservationFloorPlanStep
    ),
  {
    loading: () => (
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-6 w-56 bg-slate-200 rounded-lg" />
          <div className="h-3.5 w-80 bg-slate-100 rounded-full" />
        </div>
        <div className="h-[460px] w-full bg-slate-100 rounded-2xl flex items-center justify-center">
          <div className="text-slate-400 text-xs font-serif font-bold">
            Memuat Arsitektur Denah Meja SAVORIA...
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

const ReservationPaymentStep = dynamic(
  () =>
    import("@/components/reservation/ReservationPaymentStep").then(
      (m) => m.ReservationPaymentStep
    ),
  {
    loading: () => (
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 rounded-lg" />
          <div className="h-3.5 w-72 bg-slate-100 rounded-full" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 w-full bg-slate-100 rounded-2xl" />
          ))}
        </div>
      </div>
    ),
    ssr: false,
  }
);

const ReservationReceiptStep = dynamic(
  () =>
    import("@/components/reservation/ReservationReceiptStep").then(
      (m) => m.ReservationReceiptStep
    ),
  {
    loading: () => (
      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 animate-pulse">
        <div className="w-16 h-16 rounded-full bg-slate-200 mx-auto" />
        <div className="h-6 w-48 bg-slate-200 rounded-lg mx-auto" />
        <div className="h-3 w-64 bg-slate-100 rounded-full mx-auto" />
        <div className="h-48 w-full bg-slate-100 rounded-2xl mt-4" />
      </div>
    ),
    ssr: false,
  }
);

const MenuCustomizationModal = dynamic(
  () =>
    import("@/components/reservation/MenuCustomizationModal").then(
      (m) => m.MenuCustomizationModal
    ),
  { ssr: false }
);

const TIME_SLOTS: TimeSlotOption[] = [
  { label: "11:30 AM - Early Lunch Soirée", desc: "Sesi makan siang awal & segar" },
  { label: "12:30 PM - Luncheon Soirée", desc: "Makan siang utama & bisnis" },
  { label: "01:30 PM - Midday Gourmet", desc: "Santap siang tenang & privat" },
  { label: "05:00 PM - Early Sunset Dining", desc: "Makan malam awal & sunset golden hour" },
  { label: "06:00 PM - Romantic Dusk", desc: "Suasana romantis lilin temaram" },
  { label: "07:00 PM - Prime Evening Gala", desc: "Sesi jamuan malam utama terfavorit" },
  { label: "08:30 PM - Late Night Soirée", desc: "Makan malam intim eksklusif & lounge" },
  { label: "09:30 PM - Midnight Degustation", desc: "Sesi penutup malam degustasi chef" },
];

export default function SavoriaReservationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  // Wizard Step: 1 (Date/Time/Pax), 2 (Menu), 3 (Table), 4 (Payment), 5 (Receipt)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1 STATE: Date, Time Session, Guests, Contact
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("07:00 PM - Prime Evening Gala");
  const [guestCount, setGuestCount] = useState<number>(2);
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");

  // STEP 2 STATE: Menu Selection & Cart
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("qris");
  const [paymentCategory, setPaymentCategory] = useState<string>("all");
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // STEP 5 STATE: Final Completed Order & QR Receipt
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [receiptQrDataUrl, setReceiptQrDataUrl] = useState<string>("");

  // Prefill customer name if logged in & URL search params if navigated from landing
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
    }

    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const qDate = sp.get("date");
      const qTime = sp.get("time");
      const qGuests = sp.get("guests");
      const minDate = new Date().toISOString().slice(0, 10);

      if (qDate && qDate >= minDate) setSelectedDate(qDate);
      if (qTime) {
        const match = TIME_SLOTS.find((s) => s.label.toLowerCase().includes(qTime.toLowerCase()));
        if (match) setSelectedTimeSlot(match.label);
      }
      if (qGuests) {
        const parsed = parseInt(qGuests, 10);
        if (!isNaN(parsed) && parsed > 0) setGuestCount(parsed);
      }
    }
  }, [user]);

  // Fetch Menus
  useEffect(() => {
    fetch("/api/v1/customer/menus")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      })
      .catch(() => {});
  }, []);

  // Dynamic Table Availability Fetching based on selected Date & Time Slot
  useEffect(() => {
    if (!selectedDate) return;
    const params = new URLSearchParams({
      date: selectedDate,
      timeSlot: selectedTimeSlot || "",
    });

    fetch(`/api/v1/customer/tables?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTables(data.data);
          // If the currently selected table became occupied on this date & time, reset selection
          if (selectedTable) {
            const found = data.data.find((t: any) => t.id === selectedTable.id);
            if (found && found.status !== "available") {
              setSelectedTable(null);
              toast.warning(
                `Meja ${selectedTable.tableNumber} tidak tersedia pada jadwal yang dipilih (${selectedDate} - ${selectedTimeSlot}). Silakan pilih meja lain.`,
                "Jadwal Meja Direservasi"
              );
            }
          }
        }
      })
      .catch(() => {});
  }, [selectedDate, selectedTimeSlot]);

  // Auto-check table capacity eligibility when guest count changes
  useEffect(() => {
    if (selectedTable) {
      const eligibility = isTableCapacityEligible(selectedTable.capacity, guestCount);
      if (!eligibility.eligible) {
        setSelectedTable(null);
        toast.info(
          `Pilihan meja di-reset karena jumlah tamu diubah menjadi ${guestCount} orang. Silakan pilih meja berkapasitas yang sesuai pada denah lantai.`,
          "Kapasitas Tamu Disesuaikan"
        );
      }
    }
  }, [guestCount]);

  // Cart Operations
  const handleAddToCart = (menu: MenuItem) => {
    if (menu.modifierGroups && menu.modifierGroups.length > 0) {
      const initialMods: Record<number, number[]> = {};
      menu.modifierGroups.forEach((g) => {
        if (g.options && g.options.length > 0) {
          if (g.maxSelection === 1 || g.minSelection > 0) {
            initialMods[g.id] = [g.options[0].id];
          }
        }
      });
      setSelectedModifiers(initialMods);
      setItemNotes("");
      setCustomizingMenu(menu);
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
    toast.success(`"${menu.name}" berhasil ditambahkan ke keranjang.`, "Menu Ditambahkan");
  };

  const handleToggleModifier = (groupId: number, optionId: number, maxSelection: number) => {
    const current = selectedModifiers[groupId] || [];
    if (maxSelection === 1) {
      setSelectedModifiers({
        ...selectedModifiers,
        [groupId]: [optionId],
      });
    } else {
      if (current.includes(optionId)) {
        setSelectedModifiers({
          ...selectedModifiers,
          [groupId]: current.filter((id) => id !== optionId),
        });
      } else {
        if (maxSelection && current.length >= maxSelection) {
          toast.warning(`Maksimal ${maxSelection} pilihan untuk kategori ini.`, "Batas Pilihan");
          return;
        }
        setSelectedModifiers({
          ...selectedModifiers,
          [groupId]: [...current, optionId],
        });
      }
    }
  };

  const handleConfirmCustomization = () => {
    if (!customizingMenu) return;

    if (customizingMenu.modifierGroups) {
      for (const group of customizingMenu.modifierGroups) {
        const selected = selectedModifiers[group.id] || [];
        if (group.minSelection > 0 && selected.length < group.minSelection) {
          toast.warning(`Silakan pilih opsi untuk "${group.name}".`, "Pilihan Wajib");
          return;
        }
      }
    }

    const variantsList: { group: string; option: string; extraPrice: number }[] = [];
    customizingMenu.modifierGroups?.forEach((group) => {
      const selectedIds = selectedModifiers[group.id] || [];
      selectedIds.forEach((optId) => {
        const opt = group.options?.find((o: any) => o.id === optId);
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

    const existingIdx = cart.findIndex(
      (i) =>
        i.menuId === customizingMenu.id &&
        JSON.stringify(i.selectedVariants) === JSON.stringify(variantsList) &&
        i.notes === itemNotes.trim()
    );

    if (existingIdx > -1) {
      const updated = [...cart];
      updated[existingIdx].quantity += 1;
      setCart(updated);
    } else {
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
    }

    toast.success(`"${customizingMenu.name}" dengan kustomisasi ditambahkan ke keranjang!`, "Menu Ditambahkan");
    setCustomizingMenu(null);
  };

  const handleUpdateCartQty = (menuId: number, delta: number) => {
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

  // Table confirmation & advance directly to Payment
  const handleConfirmTableAndAdvance = (table: TableItem) => {
    setSelectedTable(table);
    toast.success(`Meja ${table.tableNumber} dikonfirmasi! Lanjut ke pembayaran.`, "Meja Dipilih");
    setCurrentStep(4);
  };

  // Process Complete Reservation & Payment
  const handleExecutePayment = async (voucherCode?: string) => {
    if (!user) {
      toast.error("Sesi login Anda belum aktif. Harap masuk terlebih dahulu untuk menyelesaikan reservasi.", "Otorisasi Diperlukan");
      router.push("/login?redirect=/reservation");
      return;
    }

    if (user.role === "admin" || user.role === "kasir") {
      toast.error(
        "Akun Admin & Kasir tidak dapat melakukan booking reservasi. Fitur reservasi khusus untuk akun pembeli/pelanggan.",
        "Akses Terbatas"
      );
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
        orderType: "reservation",
        reservationDate: selectedDate,
        reservationTime: selectedTimeSlot,
        guestCount: guestCount,
        specialRequests: specialRequests.trim(),
        paymentMethod: paymentMethod,
        isDirectPayment: true,
        isPaid: true,
        userId: user ? user.id : undefined,
        voucherCode: voucherCode ? voucherCode.trim() : undefined,
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
        credentials: "include",
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
        setCurrentStep(5);
      } else {
        toast.error(data.message || "Gagal memproses reservasi & pembayaran.", "Transaksi Gagal");
      }
    } catch {
      toast.error("Terjadi gangguan koneksi saat memproses reservasi. Silakan periksa jaringan Anda.", "Gangguan Koneksi");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleResetReservation = () => {
    setCart([]);
    setSelectedTable(null);
    setCompletedOrder(null);
    setReceiptQrDataUrl("");
    setCurrentStep(1);
  };

  // Nav validation
  const canNavigateTo = (step: number): boolean => {
    if (step === 1) return true;
    if (step === 2) return true; // Menu catalog is always browsable
    if (step === 3) return Boolean(cart.length > 0);
    if (step === 4) return Boolean(selectedTable);
    if (step === 5) return Boolean(completedOrder);
    return false;
  };

  const allMenus: MenuItem[] = categories.flatMap((c) => c.menus || []);
  const displayedMenus = allMenus.filter((m) => {
    if (selectedCategory === "all") return true;
    return categories.find((c) => String(c.id) === selectedCategory)?.menus?.some((item: any) => item.id === m.id);
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] selection:bg-[#EA580C] selection:text-white flex flex-col justify-between font-sans antialiased">
      {/* RESTAURANT HEADER */}
      <header className="border-b border-[#E2E8F0] bg-white/90 backdrop-blur-md sticky top-0 z-50 px-3 sm:px-6 py-3.5 sm:py-4">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-serif font-black text-lg sm:text-xl shadow-md shadow-[#EA580C]/25 group-hover:scale-105 transition-transform shrink-0">
              S
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-serif tracking-tight text-lg sm:text-xl font-bold text-[#18181B]">
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
                  className="px-3 sm:px-4 py-2 rounded-full bg-white border border-[#E2E8F0] text-[#18181B] hover:border-[#EA580C] text-xs font-semibold transition-all shadow-xs"
                >
                  Pesanan Saya
                </Link>
              </div>
            ) : (
              <Link
                href="/login?redirect=/reservation"
                className="px-3 sm:px-4 py-2 rounded-full bg-white border border-[#E2E8F0] text-[#18181B] hover:text-[#EA580C] text-xs font-bold transition-all shadow-xs"
              >
                <span className="hidden xs:inline">Masuk ke </span>Akun
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 5-STEP JOURNEY STEPPER BAR */}
      <ReservationStepsNav
        currentStep={currentStep}
        onSelectStep={setCurrentStep}
        canNavigateTo={canNavigateTo}
      />

      {/* MAIN STEP CONTENT */}
      <main className="max-w-[1280px] w-full mx-auto p-4 sm:p-6 md:p-8 flex-1">
        {/* Staff Warning Banner */}
        {user && (user.role === "admin" || user.role === "kasir") && (
          <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-amber-50 border border-amber-300/80 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-200/90 text-amber-900 flex items-center justify-center shrink-0 font-bold text-lg">
                ⚠️
              </div>
              <div>
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-amber-900">
                  Akses Dibatasi: Akun Staf ({user.role === "admin" ? "Administrator" : "Kasir"})
                </h4>
                <p className="text-[11px] sm:text-xs text-amber-800 mt-0.5">
                  Fitur booking reservasi meja jamuan hanya diperuntukkan bagi akun <strong>Pelanggan/Pembeli</strong>. Silakan beralih akun atau kembali ke dashboard staf.
                </p>
              </div>
            </div>
            <Link
              href={user.role === "admin" ? "/admin" : "/pos"}
              className="px-4 py-2 rounded-full bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-xs shrink-0 self-end sm:self-auto"
            >
              Ke Dashboard Staf
            </Link>
          </div>
        )}

        {currentStep === 1 && (
          <ReservationScheduleStep
            selectedDate={selectedDate}
            onChangeDate={setSelectedDate}
            selectedTimeSlot={selectedTimeSlot}
            onChangeTimeSlot={setSelectedTimeSlot}
            timeSlots={TIME_SLOTS}
            guestCount={guestCount}
            onChangeGuestCount={setGuestCount}
            specialRequests={specialRequests}
            onChangeSpecialRequests={setSpecialRequests}
            customerName={customerName}
            onChangeCustomerName={setCustomerName}
            customerPhone={customerPhone}
            onChangeCustomerPhone={setCustomerPhone}
            onNext={() => {
              setCurrentStep(2);
            }}
          />
        )}

        {currentStep === 2 && (
          <ReservationMenuStep
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            displayedMenus={displayedMenus}
            cart={cart}
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            onPrev={() => setCurrentStep(1)}
            onNext={() => {
              if (cart.length === 0) {
                toast.warning("Silakan pilih minimal 1 hidangan untuk jamuan Anda.", "Menu Belum Dipilih");
                return;
              }
              setCurrentStep(3);
            }}
          />
        )}

        {currentStep === 3 && (
          <ReservationFloorPlanStep
            tables={tables}
            selectedTable={selectedTable}
            guestCount={guestCount}
            onSelectTable={setSelectedTable}
            onConfirmTableAndAdvance={handleConfirmTableAndAdvance}
            onPrev={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <ReservationPaymentStep
            cart={cart}
            selectedTable={selectedTable}
            selectedDate={selectedDate}
            selectedTimeSlot={selectedTimeSlot}
            guestCount={guestCount}
            customerName={customerName}
            onChangeCustomerName={setCustomerName}
            customerPhone={customerPhone}
            onChangeCustomerPhone={setCustomerPhone}
            paymentMethod={paymentMethod}
            onChangePaymentMethod={setPaymentMethod}
            paymentCategory={paymentCategory}
            onChangePaymentCategory={setPaymentCategory}
            isProcessingPayment={isProcessingPayment}
            onExecutePayment={handleExecutePayment}
            onPrev={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 5 && (
          <ReservationReceiptStep
            completedOrder={completedOrder}
            receiptQrDataUrl={receiptQrDataUrl}
            onResetReservation={handleResetReservation}
          />
        )}
      </main>

      {/* MODAL: CUSTOMIZATION */}
      {customizingMenu && (
        <MenuCustomizationModal
          customizingMenu={customizingMenu}
          selectedModifiers={selectedModifiers}
          itemNotes={itemNotes}
          onToggleModifier={handleToggleModifier}
          onChangeNotes={setItemNotes}
          onConfirm={handleConfirmCustomization}
          onClose={() => setCustomizingMenu(null)}
        />
      )}
    </div>
  );
}

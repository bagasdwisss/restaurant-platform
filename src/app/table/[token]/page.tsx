"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import {
  UtensilsCrossed,
  Search,
  Plus,
  Minus,
  ShoppingBag,
  BellRing,
  CheckCircle2,
  Clock,
  ChefHat,
  Sparkles,
  X,
  AlertCircle,
  Receipt,
  User,
  Coffee,
  ArrowRight,
  RefreshCw,
  Footprints,
} from "lucide-react";
import { formatIDR } from "@/lib/utils";
import { useCartStore, SelectedVariant } from "@/lib/cart-store";

interface Option {
  id: number;
  name: string;
  price: number;
}

interface ModifierGroup {
  id: number;
  name: string;
  minSelection: number;
  maxSelection: number;
  options: Option[];
}

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isAvailable: boolean;
  modifierGroups: ModifierGroup[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  menus: MenuItem[];
}

export default function CustomerTablePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const { toast } = useToast();

  // Table state
  const [table, setTable] = useState<any>(null);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Menu state
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal customization state
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [customModifiers, setCustomModifiers] = useState<Record<number, number[]>>({});
  const [itemNotes, setItemNotes] = useState("");
  const [itemQty, setItemQty] = useState(1);

  // Cart drawer state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // Waiter call state
  const [callingWaiter, setCallingWaiter] = useState(false);
  const [waiterCallStatus, setWaiterCallStatus] = useState<"idle" | "pending" | "in_progress" | "completed">("idle");

  // Store & Auth
  const cart = useCartStore();
  const { user } = useAuth();

  // Auto-fill user name if logged in
  useEffect(() => {
    if (user && !cart.customerName) {
      cart.setCustomerName(user.name);
    }
  }, [user, cart]);

  // Fetch latest waiter call status
  const fetchWaiterCallStatus = useCallback(async (tableId: number) => {
    try {
      const res = await fetch(`/api/v1/customer/call-waiter?tableId=${tableId}`);
      const data = await res.json();
      if (data.success && data.data) {
        const call = data.data;
        if (call.status === "pending") {
          setWaiterCallStatus("pending");
        } else if (call.status === "in_progress") {
          setWaiterCallStatus("in_progress");
        } else if (call.status === "completed") {
          const completedDiff = Date.now() - new Date(call.createdAt).getTime();
          // If marked completed within last 60s, show completed badge
          if (completedDiff < 60000) {
            setWaiterCallStatus("completed");
          } else {
            setWaiterCallStatus("idle");
          }
        } else {
          setWaiterCallStatus("idle");
        }
      } else {
        setWaiterCallStatus("idle");
      }
    } catch {
      // non-fatal
    }
  }, []);

  // 1. Initial Load Table & Active Order
  const fetchTableData = async () => {
    try {
      const res = await fetch(`/api/v1/customer/table/${token}`);
      const data = await res.json();
      if (data.success) {
        setTable(data.data.table);
        setActiveOrder(data.data.activeOrder);
        cart.setTableInfo(token, data.data.table.tableNumber);
        if (data.data.table?.id) {
          fetchWaiterCallStatus(data.data.table.id);
        }
      } else {
        setError(data.message || "Meja tidak valid.");
      }
    } catch (err: any) {
      setError("Gagal menghubungkan ke server restoran.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Load Menus
  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/v1/customer/menus");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTableData();
    fetchMenus();
  }, [token]);

  // Polling for live status updates (active order & waiter call status)
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (token) {
        fetch(`/api/v1/customer/table/${token}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setActiveOrder(data.data.activeOrder);
              if (data.data.table?.id) {
                fetchWaiterCallStatus(data.data.table.id);
              }
            }
          })
          .catch(() => {});
      }
    }, 7000); // 7s fast polling for waiter response & kitchen updates

    return () => clearInterval(interval);
  }, [token, fetchWaiterCallStatus]);

  // Handle Call Waiter
  const handleCallWaiter = async () => {
    if (!table || callingWaiter) return;
    setCallingWaiter(true);
    try {
      const res = await fetch("/api/v1/customer/call-waiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: table.id,
          tableNumber: table.tableNumber,
          customerName: user?.name || `Tamu Meja ${table.tableNumber}`,
          notes: `Panggilan pelayan langsung dari meja ${table.tableNumber}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWaiterCallStatus("pending");
        toast.success("Pelayan telah menerima notifikasi dan segera menuju meja Anda.", "Pelayan Dipanggil");
      }
    } catch (err) {
      toast.error("Gagal memanggil pelayan melalui sistem. Silakan panggil staf terdekat secara langsung.", "Panggilan Gagal");
    } finally {
      setCallingWaiter(false);
    }
  };

  // Open Customization Modal
  const openCustomizer = (menu: MenuItem) => {
    if (!menu.isAvailable) return;
    setSelectedMenu(menu);
    setItemQty(1);
    setItemNotes("");

    // Initialize default modifier selections
    const initialModifiers: Record<number, number[]> = {};
    menu.modifierGroups.forEach((group) => {
      if (group.minSelection > 0 && group.options.length > 0) {
        initialModifiers[group.id] = [group.options[0].id];
      } else {
        initialModifiers[group.id] = [];
      }
    });
    setCustomModifiers(initialModifiers);
  };

  // Toggle modifier option
  const toggleModifierOption = (group: ModifierGroup, optionId: number) => {
    const current = customModifiers[group.id] || [];
    if (group.maxSelection === 1) {
      setCustomModifiers({ ...customModifiers, [group.id]: [optionId] });
    } else {
      if (current.includes(optionId)) {
        setCustomModifiers({
          ...customModifiers,
          [group.id]: current.filter((id) => id !== optionId),
        });
      } else {
        if (current.length < group.maxSelection) {
          setCustomModifiers({
            ...customModifiers,
            [group.id]: [...current, optionId],
          });
        }
      }
    }
  };

  // Add customized item to cart
  const handleAddToCart = () => {
    if (!selectedMenu) return;

    const selectedVariantsList: SelectedVariant[] = [];
    selectedMenu.modifierGroups.forEach((group) => {
      const selectedOptionIds = customModifiers[group.id] || [];
      selectedOptionIds.forEach((optId) => {
        const opt = group.options.find((o) => o.id === optId);
        if (opt) {
          selectedVariantsList.push({
            group: group.name,
            option: opt.name,
            extraPrice: opt.price,
          });
        }
      });
    });

    cart.addItem({
      menuId: selectedMenu.id,
      name: selectedMenu.name,
      price: selectedMenu.price,
      image: selectedMenu.image,
      quantity: itemQty,
      notes: itemNotes.trim(),
      selectedVariants: selectedVariantsList,
    });

    setSelectedMenu(null);
  };

  // Calculate customized modal unit price
  const calculateModalUnitPrice = () => {
    if (!selectedMenu) return 0;
    let extra = 0;
    selectedMenu.modifierGroups.forEach((group) => {
      const selectedOptionIds = customModifiers[group.id] || [];
      selectedOptionIds.forEach((optId) => {
        const opt = group.options.find((o) => o.id === optId);
        if (opt) extra += opt.price;
      });
    });
    return selectedMenu.price + extra;
  };

  // Submit Order to Backend
  const handleCheckout = async () => {
    if (cart.items.length === 0) return;
    setIsSubmitting(true);

    try {
      const payload = {
        qrToken: token,
        customerName: cart.customerName.trim() || (user ? user.name : `Tamu ${table.tableNumber}`),
        orderType: cart.orderType,
        userId: user ? user.id : undefined,
        items: cart.items.map((i) => ({
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
      if (data.success) {
        setOrderSuccess(data.data);
        setActiveOrder(data.data);
        cart.clearCart();
        setIsCartOpen(false);
        toast.success(`Pesanan #${data.data.orderNumber} berhasil dikirim ke dapur!`, "Pesanan Diterima");
      } else {
        toast.error(data.message || "Gagal mengirim pesanan.", "Pesanan Gagal");
      }
    } catch (err: any) {
      toast.error("Terjadi kesalahan koneksi saat mengirim pesanan. Silakan periksa jaringan Anda.", "Gangguan Koneksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered menus
  const allMenus = categories.flatMap((cat) => cat.menus);
  const displayedMenus = (
    activeCategory === "all"
      ? allMenus
      : categories.find((c) => c.slug === activeCategory)?.menus || []
  ).filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FDFBF7] text-[#18181B]">
        <div className="w-12 h-12 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif text-sm font-semibold">Menghubungkan ke Meja SAVORIA...</p>
      </div>
    );
  }

  if (error || !table) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#FDFBF7] text-[#18181B]">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold mb-2">QR Code Tidak Dikenali</h1>
        <p className="text-xs text-[#64748B] max-w-sm mb-6 leading-relaxed">
          {error || "Token QR meja tidak valid. Silakan pindai ulang barcode QR fisik di meja restoran Anda."}
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-full shadow-md text-xs transition-all"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] pb-28 selection:bg-[#EA580C] selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-3 sm:py-3.5 shadow-2xs">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center shadow-md shadow-[#EA580C]/20 font-serif font-black text-base sm:text-lg shrink-0"
            >
              S
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-serif font-bold text-[#18181B] text-sm sm:text-base leading-tight">SAVORIA</h1>
                <span className="px-2 py-0.5 bg-[#EA580C]/10 text-[#EA580C] text-[10px] font-bold rounded-full font-mono uppercase truncate max-w-[90px] sm:max-w-none">
                  {table.tableNumber}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#64748B] truncate">
                Area: {table.area} • {table.capacity} Tamu
              </p>
            </div>
          </div>

          {/* Call Waiter Dynamic Button */}
          {waiterCallStatus === "in_progress" ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-teal-600 text-white shadow-md animate-pulse ring-2 ring-teal-300 shrink-0">
              <Footprints className="w-3.5 h-3.5 animate-bounce" />
              <span>
                <span className="hidden xs:inline">Pelayan Sedang Menuju Meja!</span>
                <span className="xs:hidden">Pelayan Menuju Meja!</span>
              </span>
            </div>
          ) : waiterCallStatus === "pending" ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-amber-500 text-white shadow-sm shrink-0">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>
                <span className="hidden xs:inline">Menunggu Pelayan...</span>
                <span className="xs:hidden">Menunggu...</span>
              </span>
            </div>
          ) : waiterCallStatus === "completed" ? (
            <button
              type="button"
              onClick={() => setWaiterCallStatus("idle")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer shrink-0"
              title="Klik untuk menutup notifikasi"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                <span className="hidden xs:inline">Pelayan Telah Hadir ✓</span>
                <span className="xs:hidden">Hadir ✓</span>
              </span>
            </button>
          ) : (
            <button
              onClick={handleCallWaiter}
              disabled={callingWaiter}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold transition-all shadow-sm cursor-pointer shrink-0 bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 active:scale-95 disabled:opacity-60"
            >
              {callingWaiter ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#EA580C]" />
              ) : (
                <BellRing className="w-3.5 h-3.5 text-[#EA580C]" />
              )}
              <span>
                {callingWaiter ? (
                  <span>Memanggil...</span>
                ) : (
                  <>
                    <span className="hidden xs:inline">Panggil Pelayan</span>
                    <span className="xs:hidden">Pelayan</span>
                  </>
                )}
              </span>
            </button>
          )}
        </div>
      </header>

      {/* User Session Bar */}
      <div className="bg-[#14281D] text-white text-xs px-4 py-2.5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                Tamu: <strong className="text-amber-300">{user.name}</strong>
              </span>
            </div>
          ) : (
            <div className="text-slate-300">Sesi Pemesanan Meja Mandiri</div>
          )}
          <Link
            href={user ? "/user" : "/login"}
            className="text-amber-300 hover:text-white font-bold flex items-center gap-1 transition-colors"
          >
            <span>{user ? "Lihat Riwayat Sesi →" : "Masuk / Login →"}</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Active Order Stepper Tracker Banner */}
        {activeOrder && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#18181B] font-mono">
                  Pesanan Aktif ({activeOrder.orderNumber})
                </h2>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EA580C]/10 text-[#EA580C] uppercase font-mono">
                {activeOrder.status}
              </span>
            </div>

            {/* Stepper */}
            <div className="grid grid-cols-4 gap-1 text-center pt-2 pb-1">
              {[
                { key: "pending", label: "Menunggu", icon: Clock },
                { key: "confirmed", label: "Diterima", icon: CheckCircle2 },
                { key: "preparing", label: "Dimasak", icon: ChefHat },
                { key: "served", label: "Disajikan", icon: UtensilsCrossed },
              ].map((step, idx) => {
                const orderSteps = ["pending", "confirmed", "preparing", "served", "completed"];
                const currentIdx = orderSteps.indexOf(activeOrder.status);
                const stepIdx = orderSteps.indexOf(step.key);
                const isPassed = currentIdx >= stepIdx;
                const isCurrent = activeOrder.status === step.key;

                const StepIcon = step.icon;

                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-[#EA580C] text-white ring-4 ring-[#EA580C]/20 scale-105"
                          : isPassed
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] mt-1.5 font-medium ${
                        isCurrent
                          ? "text-[#EA580C] font-bold"
                          : isPassed
                          ? "text-[#18181B] font-semibold"
                          : "text-[#64748B]"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-[#64748B] bg-[#FDFBF7] p-3 rounded-2xl border border-slate-200/80 flex justify-between items-center">
              <span>{activeOrder.items?.length || 0} Menu • <strong className="text-[#18181B] font-mono">{formatIDR(activeOrder.totalAmount)}</strong></span>
              <span className="text-[#EA580C] font-semibold">Pesan hidangan tambahan 👇</span>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari menu adiboga, mocktail, dessert..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/80 rounded-full text-xs text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#EA580C] shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === "all"
                ? "bg-[#EA580C] text-white shadow-sm shadow-[#EA580C]/25"
                : "bg-white text-[#64748B] border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            Semua Menu
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.slug
                  ? "bg-[#EA580C] text-white shadow-sm shadow-[#EA580C]/25"
                  : "bg-white text-[#64748B] border border-slate-200/80 hover:bg-slate-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items List */}
        <div className="space-y-3 pt-1">
          {displayedMenus.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-serif text-base font-bold text-[#18181B]">Menu tidak ditemukan.</p>
              <p className="text-xs text-[#64748B] mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
            </div>
          ) : (
            displayedMenus.map((menu) => (
              <div
                key={menu.id}
                onClick={() => openCustomizer(menu)}
                className={`bg-white rounded-3xl border border-slate-200/80 p-4 flex gap-4 shadow-sm transition-all ${
                  menu.isAvailable
                    ? "cursor-pointer hover:border-[#EA580C] hover:shadow-md active:scale-[0.99]"
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                {/* Menu Image */}
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                  {menu.image ? (
                    <Image
                      src={menu.image}
                      alt={menu.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Coffee className="w-8 h-8" />
                    </div>
                  )}
                  {!menu.isAvailable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[11px] font-bold">
                      Habis
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-[#18181B] text-sm leading-tight line-clamp-1">
                      {menu.name}
                    </h3>
                    <p className="text-xs text-[#64748B] line-clamp-2 mt-1 leading-relaxed">
                      {menu.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="font-serif font-bold text-[#EA580C] text-sm">
                      {formatIDR(menu.price)}
                    </span>
                    {menu.isAvailable && (
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-[#EA580C]/10 hover:bg-[#EA580C] hover:text-white text-[#EA580C] rounded-full text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Pilih</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {cart.items.length > 0 && (
        <div className="fixed bottom-5 left-0 right-0 z-40 px-4">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-[#14281D] text-white rounded-full p-3.5 px-6 flex items-center justify-between shadow-xl shadow-[#14281D]/30 active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag className="w-6 h-6 text-[#EA580C]" />
                  <span className="absolute -top-1.5 -right-2 bg-[#EA580C] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center font-mono">
                    {cart.items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-300 uppercase tracking-wider">Total Keranjang</p>
                  <p className="font-serif font-bold text-base leading-tight text-white">
                    {formatIDR(cart.getTotal())}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                <span>Rincian Pesanan</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Modal Customizer */}
      {selectedMenu && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="relative p-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h3 className="font-serif font-bold text-[#18181B] text-base">{selectedMenu.name}</h3>
                <p className="font-serif font-bold text-[#EA580C] text-base mt-0.5">
                  {formatIDR(selectedMenu.price)}
                </p>
              </div>
              <button
                onClick={() => setSelectedMenu(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-[#64748B] hover:text-[#18181B] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modifiers Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {selectedMenu.description && (
                <p className="text-xs text-[#64748B] leading-relaxed bg-[#FDFBF7] p-3 rounded-2xl border border-slate-200/80">
                  {selectedMenu.description}
                </p>
              )}

              {selectedMenu.modifierGroups.map((group) => (
                <div key={group.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#18181B] font-serif">
                      {group.name}
                    </h4>
                    <span className="text-[11px] text-[#64748B] font-medium">
                      {group.maxSelection === 1 ? "Pilih 1 Opsi" : `Maksimal ${group.maxSelection}`}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {group.options.map((opt) => {
                      const isSelected = (customModifiers[group.id] || []).includes(opt.id);
                      return (
                        <div
                          key={opt.id}
                          onClick={() => toggleModifierOption(group, opt.id)}
                          className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? "border-[#EA580C] bg-[#EA580C]/5 text-[#18181B]"
                              : "border-slate-200 hover:border-slate-300 text-[#64748B]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                                isSelected
                                  ? "border-[#EA580C] bg-[#EA580C] text-white"
                                  : "border-slate-300"
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                            <span className="text-xs font-semibold text-[#18181B]">{opt.name}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#18181B]">
                            {opt.price > 0 ? `+${formatIDR(opt.price)}` : "Gratis"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Special Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#18181B] font-serif">
                  Catatan Khusus (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Saus dipisah, kurangi gula..."
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
                />
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-[#18181B] uppercase font-serif">Jumlah Porsi</span>
                <div className="flex items-center gap-3 bg-[#FDFBF7] border border-slate-200/80 rounded-full p-1">
                  <button
                    onClick={() => setItemQty(Math.max(1, itemQty - 1))}
                    className="w-8 h-8 rounded-full bg-white text-[#18181B] hover:bg-slate-100 flex items-center justify-center font-bold shadow-2xs cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-bold text-sm text-[#18181B] font-mono">
                    {itemQty}
                  </span>
                  <button
                    onClick={() => setItemQty(itemQty + 1)}
                    className="w-8 h-8 rounded-full bg-white text-[#18181B] hover:bg-slate-100 flex items-center justify-center font-bold shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Add button */}
            <div className="p-5 border-t border-slate-100 bg-white">
              <button
                onClick={handleAddToCart}
                className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold py-3.5 rounded-full flex items-center justify-between px-6 shadow-md shadow-[#EA580C]/25 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <span>Tambahkan ke Keranjang</span>
                <span className="font-mono">{formatIDR(calculateModalUnitPrice() * itemQty)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-[#18181B] text-base">Rincian Pesanan Meja</h3>
                <p className="text-xs text-[#64748B]">
                  {table.tableNumber} • {table.area}
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-[#64748B] hover:text-[#18181B] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
              {/* Customer Name & Order Type */}
              <div className="grid grid-cols-2 gap-3 pb-2">
                <div>
                  <label className="text-[11px] font-bold text-[#18181B] mb-1 block">
                    Nama Pemesan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Budi"
                    value={cart.customerName}
                    onChange={(e) => cart.setCustomerName(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#18181B] mb-1 block">
                    Tipe Santap
                  </label>
                  <select
                    value={cart.orderType}
                    onChange={(e) => cart.setOrderType(e.target.value as any)}
                    className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none bg-white font-medium cursor-pointer"
                  >
                    <option value="dine_in">Makan di Tempat (Dine-In)</option>
                    <option value="takeaway">Bungkus (Takeaway)</option>
                  </select>
                </div>
              </div>

              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#FDFBF7] p-3.5 rounded-2xl border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-xs text-[#18181B]">{item.name}</h4>
                      {item.selectedVariants.length > 0 && (
                        <p className="text-[11px] text-[#64748B]">
                          {item.selectedVariants.map((v) => `${v.group}: ${v.option}`).join(", ")}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-[11px] text-amber-700 italic">
                          Catatan: &ldquo;{item.notes}&rdquo;
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-[#18181B]">
                      {formatIDR(
                        (item.price +
                          item.selectedVariants.reduce((s, v) => s + v.extraPrice, 0)) *
                          item.quantity
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => cart.removeItem(item.id)}
                      className="text-[11px] text-rose-500 font-semibold hover:underline cursor-pointer"
                    >
                      Hapus
                    </button>

                    <div className="flex items-center gap-2 bg-white rounded-full p-1 border border-slate-200/80 shadow-2xs">
                      <button
                        onClick={() => cart.updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[#64748B] hover:bg-slate-100 font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold text-[#18181B] w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => cart.updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[#64748B] hover:bg-slate-100 font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#64748B]">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatIDR(cart.getSubtotal())}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Pajak Restoran PB1 (10%)</span>
                  <span className="font-mono">{formatIDR(cart.getTax())}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Biaya Layanan (5%)</span>
                  <span className="font-mono">{formatIDR(cart.getService())}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#18181B] pt-2 border-t border-slate-200">
                  <span className="font-serif">Total Tagihan</span>
                  <span className="text-[#EA580C] font-mono text-base">{formatIDR(cart.getTotal())}</span>
                </div>
              </div>
            </div>

            {/* Footer Checkout Button */}
            <div className="p-5 border-t border-slate-100 bg-white space-y-2">
              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-slate-300 text-white font-bold py-3.5 rounded-full shadow-md shadow-[#EA580C]/25 active:scale-[0.98] transition-transform text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Mengirim Pesanan ke Kasir...</span>
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4" />
                    <span>Kirim Pesanan Sekarang ({formatIDR(cart.getTotal())})</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-[#64748B]">
                Pesanan akan langsung diterima kasir & dapur SAVORIA.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
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
  Bike,
  Sparkles,
  X,
  AlertCircle,
  Receipt,
  User,
  Coffee,
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
  const [waiterCalledSuccess, setWaiterCalledSuccess] = useState(false);

  // Store & Auth
  const cart = useCartStore();
  const { user } = useAuth();

  // Auto-fill user name if logged in
  useEffect(() => {
    if (user && !cart.customerName) {
      cart.setCustomerName(user.name);
    }
  }, [user, cart]);

  // 1. Initial Load Table & Active Order
  const fetchTableData = async () => {
    try {
      const res = await fetch(`/api/v1/customer/table/${token}`);
      const data = await res.json();
      if (data.success) {
        setTable(data.data.table);
        setActiveOrder(data.data.activeOrder);
        cart.setTableInfo(token, data.data.table.tableNumber);
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

  // Polling for live status updates if there is an active order
  useEffect(() => {
    const interval = setInterval(() => {
      if (token) {
        fetch(`/api/v1/customer/table/${token}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setActiveOrder(data.data.activeOrder);
            }
          })
          .catch(() => {});
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [token]);

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
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWaiterCalledSuccess(true);
        setTimeout(() => setWaiterCalledSuccess(false), 5000);
      }
    } catch (err) {
      alert("Gagal memanggil pelayan. Silakan panggil langsung.");
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
      // Single choice
      setCustomModifiers({ ...customModifiers, [group.id]: [optionId] });
    } else {
      // Multi choice
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
      } else {
        alert(data.message || "Gagal mengirim pesanan.");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan koneksi saat mengirim pesanan.");
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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Menghubungkan ke meja restoran...</p>
      </div>
    );
  }

  if (error || !table) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">QR Code Tidak Valid</h1>
        <p className="text-slate-600 max-w-sm mb-6">
          {error || "Token QR meja tidak dikenali. Silakan pindai ulang QR fisik di meja restoran Anda."}
        </p>
        <a
          href="/"
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl shadow-sm text-sm"
        >
          Kembali ke Portal
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 font-black text-lg">
              RS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 leading-tight">RestoSync</h1>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-bold rounded-full">
                  {table.tableNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Area: {table.area} • Kapasitas {table.capacity} Orang
              </p>
            </div>
          </div>

          {/* Call Waiter Button */}
          <button
            onClick={handleCallWaiter}
            disabled={callingWaiter || waiterCalledSuccess}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
              waiterCalledSuccess
                ? "bg-emerald-500 text-white"
                : "bg-amber-100 hover:bg-amber-200 text-amber-900 active:scale-95"
            }`}
          >
            <BellRing className={`w-3.5 h-3.5 ${callingWaiter ? "animate-bounce" : ""}`} />
            <span>{waiterCalledSuccess ? "Pelayan Dipanggil!" : "Panggil Pelayan"}</span>
          </button>
        </div>
      </header>

      {/* User Session Bar */}
      <div className="bg-slate-900 text-white text-xs px-4 py-2 border-b border-slate-800">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                Masuk sebagai: <strong>{user.name}</strong>
              </span>
            </div>
          ) : (
            <div className="text-slate-400">Sesi Tamu Mandiri (Scan QR)</div>
          )}
          <Link
            href={user ? "/user" : "/login"}
            className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1"
          >
            <span>{user ? "Portal Pesanan Saya →" : "Masuk / Login →"}</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Active Order Stepper Tracker Banner */}
        {activeOrder && (
          <div className="bg-white border-2 border-orange-400/40 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Pesanan Aktif ({activeOrder.orderNumber})
                </h2>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                {activeOrder.status.toUpperCase()}
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
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-orange-500 text-white ring-4 ring-orange-200 scale-105"
                          : isPassed
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] mt-1.5 font-medium ${
                        isCurrent
                          ? "text-orange-600 font-bold"
                          : isPassed
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg flex justify-between items-center">
              <span>{activeOrder.items?.length || 0} Menu • {formatIDR(activeOrder.totalAmount)}</span>
              <span className="text-orange-600 font-medium">Bisa pesan menu tambahan di bawah 👇</span>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari makanan, kopi, atau snack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === "all"
                ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            Semua Menu
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.slug
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items List */}
        <div className="space-y-3 pt-1">
          {displayedMenus.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
              <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-medium">Menu tidak ditemukan.</p>
              <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
            </div>
          ) : (
            displayedMenus.map((menu) => (
              <div
                key={menu.id}
                onClick={() => openCustomizer(menu)}
                className={`bg-white rounded-2xl border border-slate-200/80 p-3.5 flex gap-3.5 shadow-2xs transition-all ${
                  menu.isAvailable
                    ? "cursor-pointer hover:border-orange-300 hover:shadow-sm active:scale-[0.99]"
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                {/* Menu Image */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
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
                    <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">
                      {menu.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {menu.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="font-extrabold text-orange-600 text-sm">
                      {formatIDR(menu.price)}
                    </span>
                    {menu.isAvailable && (
                      <button
                        type="button"
                        className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-xs font-bold flex items-center gap-1 border border-orange-200/60"
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
        <div className="fixed bottom-4 left-0 right-0 z-40 px-4">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-slate-900 text-white rounded-2xl p-3.5 px-5 flex items-center justify-between shadow-xl shadow-slate-900/30 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag className="w-6 h-6 text-orange-400" />
                  <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-300">Total Keranjang</p>
                  <p className="font-extrabold text-base leading-tight text-white">
                    {formatIDR(cart.getTotal())}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-orange-400 text-sm font-bold">
                <span>Lihat Pesanan</span>
                <span className="text-lg">→</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Modal Customizer (FR-CUS-002) */}
      {selectedMenu && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="relative p-4 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedMenu.name}</h3>
                <p className="text-orange-600 font-extrabold text-sm mt-0.5">
                  {formatIDR(selectedMenu.price)}
                </p>
              </div>
              <button
                onClick={() => setSelectedMenu(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modifiers Body */}
            <div className="p-4 overflow-y-auto space-y-5 flex-1">
              {selectedMenu.description && (
                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {selectedMenu.description}
                </p>
              )}

              {selectedMenu.modifierGroups.map((group) => (
                <div key={group.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {group.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {group.maxSelection === 1 ? "Pilih 1" : `Maksimal ${group.maxSelection}`}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {group.options.map((opt) => {
                      const isSelected = (customModifiers[group.id] || []).includes(opt.id);
                      return (
                        <div
                          key={opt.id}
                          onClick={() => toggleModifierOption(group, opt.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? "border-orange-500 bg-orange-50/60 text-slate-900"
                              : "border-slate-200 hover:border-slate-300 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                                isSelected
                                  ? "border-orange-500 bg-orange-500 text-white"
                                  : "border-slate-300"
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                            <span className="text-xs font-semibold">{opt.name}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-600">
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
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Catatan Khusus (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Sambal dipisah, jangan pakai daun bawang..."
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-slate-700 uppercase">Jumlah Porsi</span>
                <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => setItemQty(Math.max(1, itemQty - 1))}
                    className="w-8 h-8 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold shadow-2xs"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-bold text-sm text-slate-900">
                    {itemQty}
                  </span>
                  <button
                    onClick={() => setItemQty(itemQty + 1)}
                    className="w-8 h-8 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Add button */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <button
                onClick={handleAddToCart}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-between px-5 shadow-md shadow-orange-600/25 active:scale-[0.98] transition-transform"
              >
                <span>Tambahkan ke Keranjang</span>
                <span>{formatIDR(calculateModalUnitPrice() * itemQty)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer (FR-CUS-003) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Rincian Pesanan Meja</h3>
                <p className="text-xs text-slate-500">
                  {table.tableNumber} • {table.area}
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {/* Customer Name & Order Type */}
              <div className="grid grid-cols-2 gap-2 pb-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                    Nama Pemesan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Budi"
                    value={cart.customerName}
                    onChange={(e) => cart.setCustomerName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                    Tipe Makan
                  </label>
                  <select
                    value={cart.orderType}
                    onChange={(e) => cart.setOrderType(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="dine_in">Makan di Tempat (Dine-In)</option>
                    <option value="takeaway">Bungkus (Takeaway)</option>
                  </select>
                </div>
              </div>

              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                      {item.selectedVariants.length > 0 && (
                        <p className="text-[11px] text-slate-500">
                          {item.selectedVariants.map((v) => `${v.group}: ${v.option}`).join(", ")}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-[11px] text-amber-700 italic">
                          Catatan: &ldquo;{item.notes}&rdquo;
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-extrabold text-slate-800">
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
                      className="text-[11px] text-red-500 font-semibold hover:underline"
                    >
                      Hapus
                    </button>

                    <div className="flex items-center gap-2 bg-white rounded-lg p-0.5 border border-slate-200">
                      <button
                        onClick={() => cart.updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-slate-900 w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => cart.updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatIDR(cart.getSubtotal())}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>PB1 / Pajak Restoran (10%)</span>
                  <span>{formatIDR(cart.getTax())}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Service Charge (5%)</span>
                  <span>{formatIDR(cart.getService())}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Tagihan</span>
                  <span className="text-orange-600 text-base">{formatIDR(cart.getTotal())}</span>
                </div>
              </div>
            </div>

            {/* Footer Checkout Button */}
            <div className="p-4 border-t border-slate-100 bg-white space-y-2">
              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl shadow-md shadow-orange-600/25 active:scale-[0.98] transition-transform text-sm flex items-center justify-center gap-2"
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
              <p className="text-[11px] text-center text-slate-400">
                Pesanan akan langsung diterima kasir & dapur restoran.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

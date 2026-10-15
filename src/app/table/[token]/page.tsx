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
  ShoppingBag,
  Sparkles,
  X,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { formatIDR } from "@/lib/utils";
import { useCartStore, SelectedVariant } from "@/lib/cart-store";
import { TableHeroHeader } from "@/components/table/TableHeroHeader";
import { TableActiveOrderCard } from "@/components/table/TableActiveOrderCard";
import { TableMenuCustomizerModal } from "@/components/table/TableMenuCustomizerModal";
import { TableCartDrawer } from "@/components/table/TableCartDrawer";

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

  // Waiter call state ('idle' | 'pending' | 'in_progress')
  const [callingWaiter, setCallingWaiter] = useState(false);
  const [waiterCallStatus, setWaiterCallStatus] = useState<"idle" | "pending" | "in_progress">("idle");

  // Store & Auth
  const cart = useCartStore();
  const { user } = useAuth();

  // Fetch latest waiter call status (real-time sync with cashier response)
  const fetchWaiterCallStatus = useCallback(async (tableId: number) => {
    try {
      const res = await fetch(`/api/v1/customer/call-waiter?tableId=${tableId}`);
      const data = await res.json();
      if (data.success && data.data) {
        const call = data.data;
        if (call.status === "in_progress") {
          setWaiterCallStatus("in_progress");
        } else if (call.status === "pending") {
          setWaiterCallStatus("pending");
        } else {
          setWaiterCallStatus("idle");
        }
      } else {
        // If completed or no call, immediately revert to idle (Panggil Pelayan)
        setWaiterCallStatus("idle");
      }
    } catch {
      // non-fatal
    }
  }, []);

  // Initial Load Table & Active Order
  const loadTableData = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/customer/table/${token}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memuat data meja.");
      }

      setTable(data.table);
      setActiveOrder(data.activeOrder);

      if (data.table) {
        cart.setTableInfo(token, data.table.tableNumber);
        fetchWaiterCallStatus(data.table.id);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem saat memindai meja.");
    } finally {
      setLoading(false);
    }
  }, [token, cart, fetchWaiterCallStatus]);

  // Load Menu Catalog
  const loadMenus = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/customer/menus");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch {
      // non-fatal
    }
  }, []);

  // Polling for live status updates
  useEffect(() => {
    loadTableData();
    loadMenus();

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (token) {
        fetch(`/api/v1/customer/table/${token}`)
          .then((r) => r.json())
          .then((d) => {
            if (d.table) {
              setActiveOrder(d.activeOrder);
              fetchWaiterCallStatus(d.table.id);
            }
          })
          .catch(() => {});
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [token, loadTableData, loadMenus, fetchWaiterCallStatus]);

  // Call waiter handler
  const handleCallWaiter = async () => {
    if (!table) return;
    setCallingWaiter(true);
    try {
      const res = await fetch("/api/v1/customer/call-waiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: table.id,
          tableNumber: table.tableNumber,
          customerName: user?.name || cart.customerName || "Pengunjung Meja",
          type: "call",
          notes: activeOrder ? `Bantuan untuk pesanan #${activeOrder.orderNumber}` : "Bantuan meja makan",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWaiterCallStatus("pending");
        toast.success(data.message, "Pelayan Dipanggil");
      } else {
        toast.error(data.message || "Gagal memanggil pelayan.", "Gagal");
      }
    } catch {
      toast.error("Terjadi gangguan koneksi jaringan.", "Gagal");
    } finally {
      setCallingWaiter(false);
    }
  };

  // Open customization modal
  const openCustomizer = (menu: MenuItem) => {
    setSelectedMenu(menu);
    setItemNotes("");
    setItemQty(1);

    const initialMods: Record<number, number[]> = {};
    menu.modifierGroups.forEach((group) => {
      if (group.minSelection > 0 && group.options.length > 0) {
        initialMods[group.id] = [group.options[0].id];
      } else {
        initialMods[group.id] = [];
      }
    });
    setCustomModifiers(initialMods);
  };

  const toggleModifierOption = (group: ModifierGroup, optionId: number) => {
    setCustomModifiers((prev) => {
      const current = prev[group.id] || [];
      if (group.maxSelection === 1) {
        return { ...prev, [group.id]: [optionId] };
      }
      if (current.includes(optionId)) {
        return { ...prev, [group.id]: current.filter((id) => id !== optionId) };
      }
      if (current.length < group.maxSelection) {
        return { ...prev, [group.id]: [...current, optionId] };
      }
      return prev;
    });
  };

  const calculateModalUnitPrice = (): number => {
    if (!selectedMenu) return 0;
    let total = selectedMenu.price;

    selectedMenu.modifierGroups.forEach((group) => {
      const selectedOptionIds = customModifiers[group.id] || [];
      selectedOptionIds.forEach((optId) => {
        const option = group.options.find((o) => o.id === optId);
        if (option) total += option.price;
      });
    });

    return total;
  };

  const handleAddToCart = () => {
    if (!selectedMenu) return;

    // Validate minimum selections
    for (const group of selectedMenu.modifierGroups) {
      const selectedCount = (customModifiers[group.id] || []).length;
      if (selectedCount < group.minSelection) {
        toast.warning(
          `Harap pilih minimal ${group.minSelection} opsi untuk ${group.name}`,
          "Pilihan Wajib"
        );
        return;
      }
    }

    const selectedVariants: SelectedVariant[] = [];
    selectedMenu.modifierGroups.forEach((group) => {
      const selectedOptionIds = customModifiers[group.id] || [];
      selectedOptionIds.forEach((optId) => {
        const opt = group.options.find((o) => o.id === optId);
        if (opt) {
          selectedVariants.push({
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
      notes: itemNotes,
      selectedVariants,
    });

    setSelectedMenu(null);
  };

  // Submit order to cashier
  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      toast.warning("Pilih hidangan terlebih dahulu sebelum mengirim pesanan.", "Pesanan Kosong");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        tableId: table.id,
        customerName: cart.customerName.trim() || user?.name || "Tamu Meja",
        orderType: cart.orderType || "dine_in",
        items: cart.items.map((i) => ({
          menuId: i.menuId,
          quantity: i.quantity,
          notes: i.notes,
          variants: i.selectedVariants.map((v) => ({
            name: `${v.group}: ${v.option}`,
            price: v.extraPrice,
          })),
        })),
      };

      const res = await fetch("/api/v1/customer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal memproses pesanan.");
      }

      setOrderSuccess(data.order);
      cart.clearCart();
      setIsCartOpen(false);
      loadTableData();
      toast.success("Pesanan Anda telah diteruskan ke dapur chef & kasir!", "Pesanan Berhasil");
    } catch (err: any) {
      toast.error(err.message || "Terjadi kendala saat mengirim pesanan.", "Gagal Kirim");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-[#18181B]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#EA580C] mx-auto" />
          <p className="text-xs font-semibold text-[#64748B]">Menghubungkan ke meja restoran...</p>
        </div>
      </div>
    );
  }

  if (error || !table) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-[#18181B]">Meja Tidak Ditemukan</h2>
            <p className="text-xs text-[#64748B] mt-1">{error || "Kode QR meja tidak valid atau meja tidak aktif."}</p>
          </div>
          <Link
            href="/"
            className="block w-full py-3 bg-[#EA580C] text-white font-bold rounded-full text-xs hover:bg-[#C2410C] transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // Filter menus
  const allMenus = categories.flatMap((cat) => cat.menus);
  const filteredMenus = allMenus.filter((menu) => {
    const matchesCategory =
      activeCategory === "all" ||
      categories.find((c) => c.slug === activeCategory)?.menus.some((m) => m.id === menu.id);
    const matchesSearch =
      searchQuery === "" ||
      menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (menu.description && menu.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] pb-28 selection:bg-[#EA580C] selection:text-white font-sans antialiased">
      {/* 1. Header with Reactive Waiter Call */}
      <TableHeroHeader
        table={table}
        waiterCallStatus={waiterCallStatus}
        callingWaiter={callingWaiter}
        onCallWaiter={handleCallWaiter}
      />

      {/* User Session Bar */}
      <div className="bg-[#14281D] text-white text-xs px-4 py-2.5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <span>Tamu Meja: <strong>{user?.name || cart.customerName || "VIP Guest"}</strong></span>
          <span className="text-amber-300 font-mono text-[11px]">{table.tableNumber}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Active Order Card & Dynamic Kitchen Countdown */}
        {activeOrder && <TableActiveOrderCard order={activeOrder} />}

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

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === "all"
                ? "bg-[#EA580C] text-white shadow-xs font-bold"
                : "bg-white text-[#64748B] hover:text-[#18181B] border border-slate-200/80"
            }`}
          >
            Semua ({allMenus.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.slug
                  ? "bg-[#EA580C] text-white shadow-xs font-bold"
                  : "bg-white text-[#64748B] hover:text-[#18181B] border border-slate-200/80"
              }`}
            >
              {cat.name} ({cat.menus.length})
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredMenus.map((menu) => (
            <div
              key={menu.id}
              onClick={() => openCustomizer(menu)}
              className="bg-white border border-slate-200/80 rounded-3xl p-3.5 flex flex-col justify-between hover:shadow-md hover:border-amber-900/20 transition-all cursor-pointer group"
            >
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden mb-3 bg-slate-100">
                <Image
                  src={menu.image || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"}
                  alt={menu.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#18181B] group-hover:text-[#EA580C] transition-colors leading-snug">
                    {menu.name}
                  </h3>
                  {menu.description && (
                    <p className="text-[11px] text-[#64748B] line-clamp-2 mt-1 leading-relaxed">
                      {menu.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                  <span className="font-serif font-bold text-sm text-[#EA580C] font-mono">
                    {formatIDR(menu.price)}
                  </span>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#EA580C] text-[#18181B] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Cart Button */}
      {cart.items.length > 0 && !isCartOpen && (
        <div className="fixed bottom-4 inset-x-4 z-40 max-w-lg mx-auto">
          <button
            type="button"
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
      )}

      {/* Modal Customizer */}
      {selectedMenu && (
        <TableMenuCustomizerModal
          selectedMenu={selectedMenu}
          customModifiers={customModifiers}
          itemNotes={itemNotes}
          itemQty={itemQty}
          onClose={() => setSelectedMenu(null)}
          onToggleModifierOption={toggleModifierOption}
          onChangeNotes={setItemNotes}
          onChangeQty={setItemQty}
          onAddToCart={handleAddToCart}
          unitPrice={calculateModalUnitPrice()}
        />
      )}

      {/* Cart Drawer */}
      {isCartOpen && table && (
        <TableCartDrawer
          isOpen={isCartOpen}
          table={table}
          cart={cart}
          isSubmitting={isSubmitting}
          onClose={() => setIsCartOpen(false)}
          onCheckout={handleCheckout}
        />
      )}
    </div>
  );
}

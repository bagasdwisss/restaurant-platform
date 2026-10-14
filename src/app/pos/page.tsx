"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Store,
  LayoutGrid,
  MapPin,
  Clock,
  CheckCircle2,
  ChefHat,
  UtensilsCrossed,
  Printer,
  Ban,
  Search,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  QrCode,
  CreditCard,
  BellRing,
  AlertTriangle,
  ArrowRightLeft,
  X,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Coffee,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { formatIDR, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

export default function PosCashierPage() {
  const { user, logout, quickLogin, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Current active shift state
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [shiftLoading, setShiftLoading] = useState(true);

  // Modals for shift
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [startCashInput, setStartCashInput] = useState("500000");
  const [cashierNameInput, setCashierNameInput] = useState("Kasir Utama");

  useEffect(() => {
    if (user?.name) {
      setCashierNameInput(user.name);
    }
  }, [user]);

  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [endCashActualInput, setEndCashActualInput] = useState("");
  const [closeShiftVariance, setCloseShiftVariance] = useState<number | null>(null);

  // Tabs: 'pos' (Catalog + Bill), 'orders' (Incoming/Active orders), 'tables' (Table Map)
  const [activeTab, setActiveTab] = useState<"pos" | "orders" | "tables">("pos");
  const [mobilePosView, setMobilePosView] = useState<"catalog" | "bill">("catalog");

  // Master Data
  const [categories, setCategories] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [waiterCalls, setWaiterCalls] = useState<any[]>([]);

  // POS Order Entry state
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [orderType, setOrderType] = useState<"dine_in" | "takeaway">("dine_in");
  const [posCart, setPosCart] = useState<any[]>([]);
  const [posSearch, setPosSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderToPay, setOrderToPay] = useState<any>(null);
  const [payMethod, setPayMethod] = useState<"cash" | "qris" | "debit">("cash");
  const [cashPaidInput, setCashPaidInput] = useState<number>(0);

  // Void Modal state
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidTarget, setVoidTarget] = useState<{ orderId: number; itemId?: number } | null>(null);
  const [supervisorPin, setSupervisorPin] = useState("");
  const [voidReason, setVoidReason] = useState("");

  // Move Table Modal state
  const [showMoveTableModal, setShowMoveTableModal] = useState(false);
  const [moveFromTable, setMoveFromTable] = useState<any>(null);
  const [moveToTableId, setMoveToTableId] = useState<string>("");

  // Print Receipt / Kitchen Ticket state
  const [printData, setPrintData] = useState<{ type: "customer" | "kitchen"; order: any } | null>(null);

  // 1. Fetch current shift
  const fetchShift = async () => {
    try {
      const res = await fetch("/api/v1/pos/shifts/current");
      const data = await res.json();
      if (data.success && data.data) {
        setCurrentShift(data.data);
      } else {
        setCurrentShift(null);
        setShowOpenShiftModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setShiftLoading(false);
    }
  };

  // 2. Fetch catalogs & orders
  const fetchAllData = async () => {
    try {
      const [menuRes, tableRes, orderRes, callRes] = await Promise.all([
        fetch("/api/v1/customer/menus").then((r) => r.json()),
        fetch("/api/v1/pos/tables").then((r) => r.json()),
        fetch("/api/v1/pos/orders/active").then((r) => r.json()),
        fetch("/api/v1/pos/waiter-calls").then((r) => r.json()),
      ]);

      if (menuRes.success) {
        setCategories(menuRes.data);
        const flattened = menuRes.data.flatMap((c: any) => c.menus);
        setMenus(flattened);
      }
      if (tableRes.success) setTables(tableRes.data);
      if (orderRes.success) setActiveOrders(orderRes.data);
      if (callRes.success) setWaiterCalls(callRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchShift();
    fetchAllData();

    // Polling active orders and waiter calls every 4 seconds
    const interval = setInterval(() => {
      fetch("/api/v1/pos/orders/active")
        .then((r) => r.json())
        .then((d) => d.success && setActiveOrders(d.data))
        .catch(() => {});

      fetch("/api/v1/pos/waiter-calls")
        .then((r) => r.json())
        .then((d) => d.success && setWaiterCalls(d.data))
        .catch(() => {});

      fetch("/api/v1/pos/tables")
        .then((r) => r.json())
        .then((d) => d.success && setTables(d.data))
        .catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts (F2: focus search, F4: checkout, Esc: close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        document.getElementById("pos-search-input")?.focus();
      } else if (e.key === "F4") {
        e.preventDefault();
        if (posCart.length > 0) handlePosCheckout();
      } else if (e.key === "Escape") {
        setShowPaymentModal(false);
        setShowVoidModal(false);
        setShowMoveTableModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [posCart, selectedTableId]);

  // Open Shift
  const handleOpenShift = async () => {
    try {
      const res = await fetch("/api/v1/pos/shifts/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cashierName: cashierNameInput,
          userId: user?.id,
          startCash: parseFloat(startCashInput) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowOpenShiftModal(false);
        fetchShift();
        toast.success(`Shift kasir berhasil dibuka oleh ${cashierNameInput}.`, "Shift Dibuka");
      } else {
        toast.error(data.message || "Gagal membuka shift.", "Gagal Buka Shift");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi saat membuka shift.", "Gangguan Koneksi");
    }
  };

  // Close Shift
  const handleCloseShift = async () => {
    if (!endCashActualInput) {
      toast.warning("Masukkan nominal uang kas fisik di laci kasir.", "Input Kas Diperlukan");
      return;
    }
    try {
      const res = await fetch("/api/v1/pos/shifts/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endCashActual: parseFloat(endCashActualInput),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Shift berhasil ditutup! Selisih kas: ${formatIDR(data.data.variance)}`, "Shift Ditutup");
        setShowCloseShiftModal(false);
        fetchShift();
      } else {
        toast.error(data.message || "Gagal menutup shift.", "Gagal Tutup Shift");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi saat menutup shift.", "Gangguan Koneksi");
    }
  };

  // Resolve Waiter Call
  const handleResolveWaiterCall = async (id: number) => {
    try {
      await fetch("/api/v1/pos/waiter-calls", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setWaiterCalls(waiterCalls.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Add Item to POS Cart
  const addToPosCart = (menu: any) => {
    if (!menu.isAvailable) return;
    const existing = posCart.find((i) => i.menuId === menu.id);
    if (existing) {
      setPosCart(
        posCart.map((i) => (i.menuId === menu.id ? { ...i, quantity: i.quantity + 1 } : i))
      );
    } else {
      setPosCart([
        ...posCart,
        {
          menuId: menu.id,
          name: menu.name,
          price: menu.price,
          quantity: 1,
          notes: "",
          selectedVariants: [],
        },
      ]);
    }
  };

  // Update POS Cart Qty
  const updatePosCartQty = (menuId: number, delta: number) => {
    setPosCart(
      posCart
        .map((i) => {
          if (i.menuId === menuId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  // POS Calculations
  const posSubtotal = posCart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const posTax = Math.round(posSubtotal * 0.1);
  const posService = Math.round(posSubtotal * 0.05);
  const posTotal = posSubtotal + posTax + posService;

  // POS Direct Checkout
  const handlePosCheckout = async () => {
    if (posCart.length === 0) return;
    const targetTable = tables.find((t) => t.id === selectedTableId);

    try {
      const payload = {
        qrToken: targetTable?.qrToken || tables[0]?.qrToken,
        customerName: targetTable ? `Kasir Meja ${targetTable.tableNumber}` : "Pelanggan POS Walk-in",
        orderType,
        items: posCart.map((i) => ({
          menuId: i.menuId,
          quantity: i.quantity,
          notes: i.notes,
          selectedVariants: [],
        })),
      };

      const res = await fetch("/api/v1/customer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setPosCart([]);
        setSelectedTableId(null);
        fetchAllData();
        // Immediately open payment modal for walk-in cashier checkout
        setOrderToPay(data.data);
        setCashPaidInput(data.data.totalAmount);
        setShowPaymentModal(true);
        toast.success(`Order POS #${data.data.orderNumber} berhasil dibuat!`, "Order Berhasil");
      } else {
        toast.error(data.message || "Gagal membuat order POS.", "Order POS Gagal");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi saat memproses pesanan.", "Gangguan Koneksi");
    }
  };

  // Update Order Status (Confirmed -> Preparing -> Served -> Completed)
  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`/api/v1/pos/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
        toast.success(`Status pesanan berhasil diperbarui ke "${status}".`, "Status Diperbarui");
      } else {
        toast.error(data.message || "Gagal mengubah status pesanan.", "Gagal Update Status");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi saat memperbarui status.", "Gangguan Koneksi");
    }
  };

  // Open Payment for existing order
  const openPaymentForOrder = (order: any) => {
    setOrderToPay(order);
    setPayMethod("cash");
    setCashPaidInput(order.totalAmount);
    setShowPaymentModal(true);
  };

  // Process Payment
  const handleProcessPayment = async () => {
    if (!orderToPay) return;
    try {
      const res = await fetch(`/api/v1/pos/orders/${orderToPay.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: payMethod,
          amountPaid: cashPaidInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Print customer receipt
        setPrintData({ type: "customer", order: data.data.order });
        setShowPaymentModal(false);
        fetchShift();
        fetchAllData();
        toast.success(`Pembayaran untuk order #${orderToPay.orderNumber} berhasil diproses!`, "Pembayaran Lunas");
      } else {
        toast.error(data.message || "Pembayaran gagal diproses.", "Pembayaran Gagal");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat memproses pembayaran.", "Gangguan Koneksi");
    }
  };

  // Void Action with Supervisor PIN
  const handleExecuteVoid = async () => {
    if (!voidTarget || !supervisorPin || !voidReason) {
      toast.warning("PIN Supervisor dan alasan void wajib diisi.", "Validasi Void");
      return;
    }

    try {
      const res = await fetch(`/api/v1/pos/orders/${voidTarget.orderId}/void`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supervisor_pin: supervisorPin,
          reason: voidReason,
          itemId: voidTarget.itemId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Item berhasil di-void.", "Void Disetujui");
        setShowVoidModal(false);
        setSupervisorPin("");
        setVoidReason("");
        setVoidTarget(null);
        fetchAllData();
      } else {
        toast.error(data.message || "Void gagal.", "Void Ditolak");
      }
    } catch (err) {
      toast.error("Gagal memproses void.", "Gangguan Koneksi");
    }
  };

  // Move Table Action
  const handleExecuteMoveTable = async () => {
    if (!moveFromTable || !moveToTableId) return;

    try {
      const res = await fetch("/api/v1/pos/tables/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromTableId: moveFromTable.id,
          toTableId: moveToTableId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Meja tamu berhasil dipindahkan.", "Pindah Meja Berhasil");
        setShowMoveTableModal(false);
        setMoveFromTable(null);
        setMoveToTableId("");
        fetchAllData();
      } else {
        toast.error(data.message || "Gagal memindahkan meja.", "Pindah Meja Gagal");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan memindahkan meja.", "Gangguan Koneksi");
    }
  };

  // Trigger Print (Browser or ESC/POS formatted)
  const triggerPrint = (type: "customer" | "kitchen", order: any) => {
    setPrintData({ type, order });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200/80">
          <RefreshCw className="w-5 h-5 animate-spin text-[#EA580C]" />
          <span className="text-sm font-medium">Memverifikasi otentikasi kasir...</span>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "kasir" && user.role !== "admin")) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#EA580C] bg-[#EA580C]/10 px-3 py-1 rounded-full">
              Hak Akses Terbatas (Kasir / Admin)
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#18181B] mt-3">SAVORIA POS Terminal</h2>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              {user
                ? `Akun Anda (${user.name}) memiliki role [${user.role.toUpperCase()}]. Anda memerlukan hak akses Kasir atau Admin untuk mengoperasikan terminal POS ini.`
                : "Anda belum login ke sistem POS. Silakan masuk menggunakan akun kasir atau admin."}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/login?redirect=/pos"
              className="w-full py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-full text-xs flex items-center justify-center gap-2 shadow-cta transition-all block text-center"
            >
              <Store className="w-4 h-4" />
              <span>Masuk dengan Akun Kasir / Admin</span>
            </Link>

            <Link
              href="/"
              className="w-full py-2.5 text-[#64748B] hover:text-[#18181B] font-semibold text-xs flex items-center justify-center gap-1 transition-all block text-center"
            >
              ← Kembali ke Beranda Restoran
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col text-[#18181B]">
      {/* 1. TOP CASHIER BAR */}
      <header className="bg-white border-b border-slate-200/80 px-3 sm:px-6 py-2.5 sm:py-3 shadow-xs sticky top-0 z-30 space-y-2">
        {/* Row 1: Brand & Status & Quick Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <Link
              href="/"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-sm shrink-0"
            >
              S
            </Link>
            <div className="min-w-0">
              <h1 className="font-serif font-bold text-sm sm:text-base text-[#18181B] flex items-center gap-1.5 leading-none truncate">
                SAVORIA <span className="text-[10px] bg-[#EA580C]/10 text-[#EA580C] px-2 py-0.5 rounded-full font-bold uppercase font-mono hidden xs:inline-block">POS Terminal</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Shift Indicator or alert */}
            {currentShift ? (
              <div className="flex items-center gap-1.5 text-[11px] bg-[#FDFBF7] px-2.5 py-1 rounded-full border border-slate-200/80">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline text-[#64748B]">Kasir:</span>
                <strong className="text-[#18181B] truncate max-w-[100px] sm:max-w-none">{currentShift.cashierName}</strong>
              </div>
            ) : (
              <div className="text-[10px] bg-rose-50 text-rose-700 px-2 py-1 rounded-full border border-rose-200 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3 h-3 text-rose-500" />
                <span>Shift Tutup</span>
              </div>
            )}

            {/* Shift Close / Open button */}
            {currentShift ? (
              <button
                onClick={() => {
                  setEndCashActualInput("");
                  setShowCloseShiftModal(true);
                }}
                className="px-2.5 sm:px-3.5 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200/80 text-[11px] font-bold rounded-full transition-all flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Tutup Shift</span>
              </button>
            ) : (
              <button
                onClick={() => setShowOpenShiftModal(true)}
                className="px-2.5 sm:px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-full transition-all shadow-sm cursor-pointer"
              >
                Buka Shift
              </button>
            )}

            <Link
              href="/admin"
              className="px-2 sm:px-3.5 py-1 bg-white hover:bg-slate-50 text-[#18181B] border border-slate-200/80 text-[11px] font-semibold rounded-full shadow-sm"
            >
              Admin ↗
            </Link>

            {user && (
              <button
                onClick={logout}
                title="Keluar / Logout"
                className="p-1.5 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-[#64748B] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Tabs and Alerts */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {/* Tab Selector */}
          <div className="bg-[#FDFBF7] border border-slate-200/80 p-0.5 sm:p-1 rounded-full flex items-center text-xs font-semibold shrink-0">
            <button
              onClick={() => setActiveTab("pos")}
              className={`px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "pos" ? "bg-[#EA580C] text-white shadow-xs" : "text-[#64748B] hover:text-[#18181B]"
              }`}
            >
              Order Grid (F2)
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "orders" ? "bg-[#EA580C] text-white shadow-xs" : "text-[#64748B] hover:text-[#18181B]"
              }`}
            >
              <span>Pesanan Aktif</span>
              {activeOrders.length > 0 && (
                <span className="bg-white text-[#EA580C] px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {activeOrders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("tables")}
              className={`px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "tables" ? "bg-[#EA580C] text-white shadow-xs" : "text-[#64748B] hover:text-[#18181B]"
              }`}
            >
              Denah Meja
            </button>
          </div>

          {/* Waiter Calls Badge Alert */}
          {waiterCalls.length > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500 text-white px-2.5 sm:px-3 py-1 rounded-full text-[11px] font-bold animate-pulse shadow-sm whitespace-nowrap shrink-0">
              <BellRing className="w-3 h-3" />
              <span>{waiterCalls.length} Panggilan!</span>
            </div>
          )}
        </div>
      </header>

      {/* Waiter Calls Floating Notification Bar */}
      {waiterCalls.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-amber-600 animate-bounce shrink-0" />
            <span className="font-bold">Perhatian:</span>
            <span>
              {waiterCalls.map((c) => c.tableNumber).join(", ")} memanggil bantuan pelayan!
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {waiterCalls.map((c) => (
              <button
                key={c.id}
                onClick={() => handleResolveWaiterCall(c.id)}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-full text-[10px] transition-colors cursor-pointer shadow-sm"
              >
                Selesai ({c.tableNumber})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. BODY CONTENT BASED ON ACTIVE TAB */}
      <div className="flex-1 flex overflow-hidden">
        {/* TAB 1: POS CATALOG & BILLING */}
        {activeTab === "pos" && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
            {/* Left Column: Menu Catalog Grid */}
            <div className={`flex-1 flex flex-col bg-[#FDFBF7] border-r border-slate-200/80 overflow-hidden ${
              mobilePosView === "bill" ? "hidden md:flex" : "flex"
            }`}>
              {/* Category & Search Topbar */}
              <div className="p-3 sm:p-4 bg-white border-b border-slate-200/80 space-y-2.5 sm:space-y-3 shadow-2xs">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="pos-search-input"
                    type="text"
                    placeholder="Cari Menu Cepat (Shortcut F2)..."
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-[#FDFBF7] border border-slate-200/80 rounded-full text-xs text-[#18181B] focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
                  />
                </div>

                {/* Categories */}
                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === "all"
                        ? "bg-[#EA580C] text-white shadow-xs"
                        : "bg-[#FDFBF7] text-[#64748B] hover:text-[#18181B] border border-slate-200/80"
                    }`}
                  >
                    Semua ({menus.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === cat.slug
                          ? "bg-[#EA580C] text-white shadow-xs"
                          : "bg-[#FDFBF7] text-[#64748B] hover:text-[#18181B] border border-slate-200/80"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Items Grid */}
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 pb-24 md:pb-4">
                {menus
                  .filter(
                    (m) =>
                      (selectedCategory === "all" ||
                        categories.find((c) => c.slug === selectedCategory)?.menus.some((cm: any) => cm.id === m.id)) &&
                      m.name.toLowerCase().includes(posSearch.toLowerCase())
                  )
                  .map((menu) => (
                    <div
                      key={menu.id}
                      onClick={() => addToPosCart(menu)}
                      className={`bg-white rounded-2xl border border-slate-200/80 p-2.5 sm:p-3 flex flex-col justify-between hover:border-[#EA580C] hover:shadow-md transition-all cursor-pointer active:scale-95 shadow-sm group ${
                        !menu.isAvailable ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <div className="relative w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-slate-100 mb-2">
                        {menu.image ? (
                          <Image
                            src={menu.image}
                            alt={menu.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            sizes="(max-width: 640px) 150px, 180px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Coffee className="w-6 h-6" />
                          </div>
                        )}
                        {!menu.isAvailable && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold">
                            HABIS
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-xs text-[#18181B] line-clamp-1 leading-tight group-hover:text-[#EA580C] transition-colors">
                          {menu.name}
                        </h3>
                        <p className="text-[#EA580C] font-serif font-bold text-xs mt-1">
                          {formatIDR(menu.price)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Floating Mobile Cart Summary Pill */}
              {posCart.length > 0 && (
                <div className="md:hidden sticky bottom-3 px-3 z-20">
                  <button
                    onClick={() => setMobilePosView("bill")}
                    className="w-full bg-[#14281D] text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between cursor-pointer border border-emerald-500/30 active:scale-95 transition-transform"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#EA580C] text-white text-xs font-bold flex items-center justify-center font-mono">
                        {posCart.reduce((s, i) => s + i.quantity, 0)}
                      </span>
                      <div className="text-left leading-tight">
                        <span className="text-[10px] text-stone-300 block">Total Tagihan Kasir</span>
                        <span className="text-sm font-bold font-mono text-[#F59E0B]">{formatIDR(posTotal)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-white bg-[#EA580C] px-3.5 py-1.5 rounded-full shadow-sm">
                      <span>Buka Tagihan</span>
                      <span>→</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Active Bill / Cart */}
            <div className={`w-full md:w-96 bg-white flex flex-col border-l border-slate-200/80 shadow-sm ${
              mobilePosView === "catalog" ? "hidden md:flex" : "flex"
            }`}>
              {/* Mobile Back Button to Catalog */}
              <div className="md:hidden p-3 bg-white border-b border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setMobilePosView("catalog")}
                  className="px-3 py-1.5 rounded-full bg-slate-100 text-xs font-bold text-[#18181B] flex items-center gap-1.5 cursor-pointer hover:bg-slate-200"
                >
                  <span>← Kembali ke Menu</span>
                </button>
                <span className="text-xs font-bold text-[#EA580C] font-mono">
                  {posCart.length} Jenis Menu
                </span>
              </div>
              {/* Table & Order Type Selector */}
              <div className="p-4 border-b border-slate-200/80 bg-[#FDFBF7] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Tujuan Pesanan</span>
                  <div className="flex gap-1.5 text-xs font-bold">
                    <button
                      onClick={() => setOrderType("dine_in")}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        orderType === "dine_in"
                          ? "bg-[#EA580C] text-white shadow-xs"
                          : "bg-white text-[#64748B] border border-slate-200/80"
                      }`}
                    >
                      Dine-In
                    </button>
                    <button
                      onClick={() => setOrderType("takeaway")}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        orderType === "takeaway"
                          ? "bg-[#EA580C] text-white shadow-xs"
                          : "bg-white text-[#64748B] border border-slate-200/80"
                      }`}
                    >
                      Takeaway
                    </button>
                  </div>
                </div>

                {orderType === "dine_in" && (
                  <select
                    value={selectedTableId || ""}
                    onChange={(e) => setSelectedTableId(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full text-xs p-2.5 border border-slate-200/80 rounded-xl bg-white font-medium focus:ring-2 focus:ring-[#EA580C] focus:outline-none cursor-pointer"
                  >
                    <option value="">Pilih Meja Tamu...</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tableNumber} ({t.area} - {t.status === "available" ? "Kosong" : "Terisi"})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Cart Items List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
                {posCart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                    <Store className="w-10 h-10 mb-2 opacity-30 text-[#EA580C]" />
                    <p className="text-xs font-semibold text-[#18181B]">Keranjang Kasir Kosong</p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Klik item hidangan di katalog untuk menambahkan pesanan.
                    </p>
                  </div>
                ) : (
                  posCart.map((item) => (
                    <div
                      key={item.menuId}
                      className="p-3 bg-[#FDFBF7] border border-slate-200/80 rounded-2xl space-y-1.5"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-xs text-[#18181B] leading-tight">
                          {item.name}
                        </span>
                        <span className="font-mono font-bold text-xs text-[#18181B]">
                          {formatIDR(item.price * item.quantity)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#64748B] font-mono">
                          @ {formatIDR(item.price)}
                        </span>

                        <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-full p-0.5 shadow-2xs">
                          <button
                            onClick={() => updatePosCartQty(item.menuId, -1)}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[#64748B] hover:bg-slate-100 font-bold cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-5 text-center font-mono">{item.quantity}</span>
                          <button
                            onClick={() => updatePosCartQty(item.menuId, 1)}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[#64748B] hover:bg-slate-100 font-bold cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Price Summary & Checkout Action */}
              <div className="p-4 border-t border-slate-200/80 bg-[#FDFBF7] space-y-2.5">
                <div className="space-y-1 text-xs text-[#64748B]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatIDR(posSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PB1 (10%)</span>
                    <span className="font-mono">{formatIDR(posTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Layanan (5%)</span>
                    <span className="font-mono">{formatIDR(posService)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#18181B] text-sm pt-1.5 border-t border-slate-200">
                    <span className="font-serif">Total Tagihan</span>
                    <span className="text-[#EA580C] font-mono text-base">{formatIDR(posTotal)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setPosCart([])}
                    disabled={posCart.length === 0}
                    className="p-3 bg-white border border-slate-200/80 text-[#64748B] hover:text-rose-600 rounded-full disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handlePosCheckout}
                    disabled={posCart.length === 0}
                    className="flex-1 bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-full text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#EA580C]/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Bayar Sekarang (F4)</span>
                    <span className="font-extrabold">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE & INCOMING ORDERS */}
        {activeTab === "orders" && (
          <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#18181B]">
                  Daftar Pesanan Berjalan ({activeOrders.length})
                </h2>
                <p className="text-xs text-[#64748B]">
                  Pesanan masuk dari reservasi tamu & kasir tersinkronisasi secara real-time.
                </p>
              </div>
              <button
                onClick={fetchAllData}
                className="px-4 py-2 bg-white border border-slate-200/80 rounded-full text-xs font-semibold text-[#64748B] hover:text-[#18181B] flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Data</span>
              </button>
            </div>

            {activeOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-[#64748B] shadow-sm">
                <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 opacity-30 text-[#EA580C]" />
                <p className="font-serif font-bold text-base text-[#18181B]">Tidak ada pesanan aktif saat ini.</p>
                <p className="text-xs text-[#64748B] mt-1">
                  Pesanan baru dari reservasi atau scan QR meja akan otomatis muncul di sini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Order Header */}
                      <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-mono font-bold text-sm text-[#18181B]">
                              {order.orderNumber}
                            </h3>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                                order.status === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : order.status === "confirmed"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "preparing"
                                  ? "bg-purple-100 text-purple-800"
                                  : order.status === "served"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                            {order.table?.tableNumber || "Takeaway"} • {order.customerName}
                          </p>
                        </div>

                        {/* Print buttons */}
                        <div className="flex gap-1">
                          <button
                            title="Cetak Tiket Dapur"
                            onClick={() => triggerPrint("kitchen", order)}
                            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-[#64748B] cursor-pointer"
                          >
                            <ChefHat className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Cetak Struk Pelanggan"
                            onClick={() => triggerPrint("customer", order)}
                            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-[#64748B] cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Item List */}
                      <div className="py-3 space-y-2 max-h-48 overflow-y-auto">
                        {order.items?.map((item: any) => (
                          <div
                            key={item.id}
                            className={`text-xs flex items-start justify-between ${
                              item.isVoided ? "line-through opacity-40 text-rose-500" : "text-[#18181B]"
                            }`}
                          >
                            <div>
                              <span className="font-mono font-bold text-[#EA580C]">{item.quantity}x </span>
                              <span className="font-medium">{item.menu.name}</span>
                              {item.notes && (
                                <p className="text-[10px] text-amber-700 italic">
                                  &ldquo;{item.notes}&rdquo;
                                </p>
                              )}
                              {item.voidReason && (
                                <p className="text-[10px] text-rose-600">
                                  Void: {item.voidReason}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold">{formatIDR(item.subtotal)}</span>
                              {!item.isVoided && order.paymentStatus !== "paid" && (
                                <button
                                  onClick={() => {
                                    setVoidTarget({ orderId: order.id, itemId: item.id });
                                    setShowVoidModal(true);
                                  }}
                                  title="Void Item"
                                  className="text-rose-400 hover:text-rose-600 text-[10px] font-bold cursor-pointer"
                                >
                                  Void
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[#64748B]">Total Tagihan:</span>
                        <span className="font-serif font-bold text-sm text-[#18181B]">
                          {formatIDR(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Order Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {order.status === "pending" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, "confirmed")}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs transition-colors cursor-pointer"
                        >
                          Konfirmasi Pesanan
                        </button>
                      )}

                      {order.status === "confirmed" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, "preparing")}
                          className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full text-xs transition-colors cursor-pointer"
                        >
                          Mulai Masak (Dapur)
                        </button>
                      )}

                      {order.status === "preparing" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, "served")}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full text-xs transition-colors cursor-pointer"
                        >
                          Sajikan ke Meja
                        </button>
                      )}

                      {order.paymentStatus === "unpaid" ? (
                        <button
                          onClick={() => openPaymentForOrder(order)}
                          className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-full text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Bayar</span>
                        </button>
                      ) : (
                        <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Lunas</span>
                        </span>
                      )}

                      {/* Void Entire Order button */}
                      {order.paymentStatus !== "paid" && (
                        <button
                          onClick={() => {
                            setVoidTarget({ orderId: order.id });
                            setShowVoidModal(true);
                          }}
                          className="p-2 bg-slate-100 hover:bg-rose-50 text-[#64748B] hover:text-rose-600 rounded-full text-xs cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TABLE MAP DASHBOARD */}
        {activeTab === "tables" && (
          <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#18181B]">Denah Visual Meja Restoran</h2>
                <p className="text-xs text-[#64748B]">
                  Pantau status keterisian meja secara langsung & pindah meja dengan 1 klik.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[#64748B]">Kosong</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-[#64748B]">Menunggu Bayar</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-[#64748B]">Aktif</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-[#64748B]">Reserved</span>
                </span>
              </div>
            </div>

            {/* Tables Grid grouped by Area */}
            {["Indoor", "Outdoor", "Lantai 2"].map((areaName) => {
              const areaTables = tables.filter((t) => t.area === areaName);
              if (areaTables.length === 0) return null;

              return (
                <div key={areaName} className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] font-mono">
                    Area: {areaName}
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
                    {areaTables.map((tbl) => {
                      const hasActiveOrder = tbl.orders && tbl.orders.length > 0;
                      const order = hasActiveOrder ? tbl.orders[0] : null;

                      let statusBorder = "border-emerald-300";
                      let badge = "Kosong";

                      if (tbl.status === "reserved") {
                        statusBorder = "border-purple-300";
                        badge = "Reserved";
                      } else if (order) {
                        if (order.status === "pending") {
                          statusBorder = "border-amber-300";
                          badge = "Menunggu";
                        } else {
                          statusBorder = "border-rose-300";
                          badge = order.status.toUpperCase();
                        }
                      }

                      return (
                        <div
                          key={tbl.id}
                          className={`p-4 rounded-3xl border-2 bg-white shadow-sm flex flex-col justify-between transition-all ${statusBorder}`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <h4 className="font-serif font-bold text-base text-[#18181B]">{tbl.tableNumber}</h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 font-mono text-[#64748B]">
                                {badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#64748B]">
                              Kapasitas {tbl.capacity} Orang
                            </p>
                          </div>

                          {order ? (
                            <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                              <p className="text-xs font-bold text-[#18181B] line-clamp-1">{order.customerName}</p>
                              <p className="text-xs font-serif font-bold text-[#EA580C]">
                                {formatIDR(order.totalAmount)}
                              </p>
                              <div className="flex gap-1.5 pt-1">
                                <button
                                  onClick={() => openPaymentForOrder(order)}
                                  className="flex-1 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-[10px] font-bold cursor-pointer"
                                >
                                  Bayar
                                </button>
                                <button
                                  onClick={() => {
                                    setMoveFromTable(tbl);
                                    setShowMoveTableModal(true);
                                  }}
                                  title="Pindah Meja"
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-[#64748B] rounded-full text-[10px] font-bold cursor-pointer"
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 pt-2.5 border-t border-slate-100">
                              <button
                                onClick={() => {
                                  setSelectedTableId(tbl.id);
                                  setActiveTab("pos");
                                }}
                                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[11px] font-bold cursor-pointer shadow-xs"
                              >
                                + Buka Bill
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. MODALS */}

      {/* OPEN SHIFT MODAL */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-[#18181B] text-lg">Buka Shift Kasir Baru</h3>
                <p className="text-xs text-[#64748B]">
                  Input nama kasir dan modal uang receh awal di laci kasir.
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">
                  Nama Kasir Petugas
                </label>
                <input
                  type="text"
                  value={cashierNameInput}
                  onChange={(e) => setCashierNameInput(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">
                  Modal Uang Receh Awal (Starting Cash)
                </label>
                <input
                  type="number"
                  value={startCashInput}
                  onChange={(e) => setStartCashInput(e.target.value)}
                  placeholder="500000"
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
                />
                <p className="text-[11px] text-[#64748B] mt-1 font-mono">
                  Nominal: {formatIDR(parseFloat(startCashInput) || 0)}
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenShift}
              className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold py-3 rounded-full text-xs transition-all shadow-md shadow-[#EA580C]/25 cursor-pointer"
            >
              Konfirmasi & Mulai Shift Kasir
            </button>
          </div>
        </div>
      )}

      {/* CLOSE SHIFT MODAL & RECONCILIATION */}
      {showCloseShiftModal && currentShift && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-rose-600" />
                <h3 className="font-serif font-bold text-[#18181B] text-base">Tutup Shift & Rekonsiliasi Kas</h3>
              </div>
              <button
                onClick={() => setShowCloseShiftModal(false)}
                className="text-[#64748B] hover:text-[#18181B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reconciliation math summary */}
            <div className="bg-[#FDFBF7] p-3.5 rounded-2xl border border-slate-200/80 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-[#64748B]">
                <span>Modal Awal Kasir:</span>
                <span>{formatIDR(currentShift.startCash)}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Total Penjualan Tunai Bersih:</span>
                <span>{formatIDR(currentShift.netCashSales || 0)}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Total Digital (QRIS/Debit):</span>
                <span>{formatIDR(currentShift.digitalSales || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-[#18181B] pt-2 border-t border-slate-200">
                <span>Ekspektasi Uang Tunai di Laci:</span>
                <span className="text-[#EA580C] text-sm">
                  {formatIDR(currentShift.expectedCash || currentShift.startCash)}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1">
                Hitung Uang Fisik Aktual di Laci Kasir:
              </label>
              <input
                type="number"
                placeholder="Masukkan jumlah uang tunai fisik..."
                value={endCashActualInput}
                onChange={(e) => {
                  setEndCashActualInput(e.target.value);
                  const actual = parseFloat(e.target.value) || 0;
                  const exp = currentShift.expectedCash || currentShift.startCash;
                  setCloseShiftVariance(actual - exp);
                }}
                className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
              />

              {closeShiftVariance !== null && (
                <div
                  className={`mt-2.5 p-2.5 rounded-xl text-xs font-bold flex items-center justify-between font-mono ${
                    closeShiftVariance === 0
                      ? "bg-emerald-100 text-emerald-800"
                      : closeShiftVariance > 0
                      ? "bg-blue-100 text-blue-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  <span>
                    {closeShiftVariance === 0
                      ? "Kas Pas (Seimbang)"
                      : closeShiftVariance > 0
                      ? "Surplus Kas (Kelebihan)"
                      : "Defisit Kas (Kurang)"}
                  </span>
                  <span>{formatIDR(closeShiftVariance)}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleCloseShift}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-full text-xs transition-all shadow-md shadow-rose-600/20 cursor-pointer"
            >
              Simpan & Tutup Shift Sekarang
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL (TUNAI / QRIS / DEBIT) */}
      {showPaymentModal && orderToPay && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-[#18181B] text-base">
                  Pembayaran: {orderToPay.orderNumber}
                </h3>
                <p className="text-xs text-[#64748B]">
                  {orderToPay.table?.tableNumber || "Takeaway"} • {orderToPay.customerName}
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-[#64748B] hover:text-[#18181B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total tagihan */}
            <div className="bg-[#FDFBF7] p-3.5 rounded-2xl border border-slate-200/80 text-center">
              <span className="text-xs text-[#64748B] font-medium">Total Tagihan Bersih</span>
              <p className="font-serif text-2xl font-bold text-[#EA580C] mt-0.5">
                {formatIDR(orderToPay.totalAmount)}
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "cash", label: "Tunai", icon: DollarSign },
                { id: "qris", label: "QRIS", icon: QrCode },
                { id: "debit", label: "Kartu Debit", icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setPayMethod(m.id as any);
                      if (m.id !== "cash") setCashPaidInput(orderToPay.totalAmount);
                    }}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      payMethod === m.id
                        ? "bg-[#EA580C] text-white border-[#EA580C] shadow-xs"
                        : "bg-white border-slate-200/80 text-[#64748B] hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Cash specific details */}
            {payMethod === "cash" && (
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-[#18181B] block">
                  Uang Tunai Diterima:
                </label>
                <input
                  type="number"
                  value={cashPaidInput}
                  onChange={(e) => setCashPaidInput(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm font-mono font-bold p-3 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
                />

                {/* Quick Cash Buttons */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    orderToPay.totalAmount,
                    50000,
                    100000,
                    200000,
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCashPaidInput(preset)}
                      className="px-2 py-1.5 bg-[#FDFBF7] hover:bg-slate-100 border border-slate-200/80 rounded-full text-[10px] font-mono font-bold text-[#18181B] cursor-pointer"
                    >
                      {preset === orderToPay.totalAmount ? "Pas" : formatIDR(preset)}
                    </button>
                  ))}
                </div>

                {/* Change amount */}
                <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs font-bold">
                  <span className="text-[#64748B]">Kembalian:</span>
                  <span className="text-emerald-700 font-mono text-sm">
                    {formatIDR(Math.max(0, cashPaidInput - orderToPay.totalAmount))}
                  </span>
                </div>
              </div>
            )}

            {/* QRIS specific simulation */}
            {payMethod === "qris" && (
              <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-slate-200/80 text-center space-y-2">
                <div className="w-32 h-32 bg-white border border-slate-200 mx-auto rounded-xl flex items-center justify-center p-2 shadow-2xs">
                  <QrCode className="w-24 h-24 text-[#18181B]" />
                </div>
                <p className="text-xs font-bold text-[#18181B]">QRIS Dinamis SAVORIA</p>
                <p className="text-[11px] text-[#64748B]">
                  Pelanggan scan kode QR di atas via BCA Mobile, GoPay, OVO, atau ShopeePay.
                </p>
              </div>
            )}

            <button
              onClick={handleProcessPayment}
              disabled={cashPaidInput < orderToPay.totalAmount}
              className="w-full bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-slate-300 text-white font-bold py-3.5 rounded-full text-xs transition-all shadow-md shadow-[#EA580C]/25 cursor-pointer"
            >
              Selesaikan Transaksi & Cetak Struk
            </button>
          </div>
        </div>
      )}

      {/* SUPERVISOR PIN VOID PROTECTION MODAL */}
      {showVoidModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600">
              <ShieldCheck className="w-6 h-6" />
              <div>
                <h3 className="font-serif font-bold text-[#18181B] text-base">Otorisasi Void Pesanan</h3>
                <p className="text-[11px] text-[#64748B]">Wajib PIN Supervisor & Alasan Void</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">
                  Supervisor PIN (Default: 123456)
                </label>
                <input
                  type="password"
                  placeholder="******"
                  value={supervisorPin}
                  onChange={(e) => setSupervisorPin(e.target.value)}
                  className="w-full text-center tracking-widest text-base font-bold p-3 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">
                  Alasan Pembatalan (Void Reason)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Tamu membatalkan pesanan, salah input..."
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowVoidModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#18181B] rounded-full text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteVoid}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold cursor-pointer shadow-sm"
              >
                Eksekusi Void
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOVE TABLE MODAL */}
      {showMoveTableModal && moveFromTable && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-[#EA580C]" />
              <h3 className="font-serif font-bold text-[#18181B] text-base">Pindah Meja (Move Table)</h3>
            </div>

            <p className="text-xs text-[#64748B]">
              Pindahkan seluruh tagihan dari <strong>{moveFromTable.tableNumber}</strong> ke meja kosong yang baru:
            </p>

            <select
              value={moveToTableId}
              onChange={(e) => setMoveToTableId(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl bg-white font-medium focus:ring-2 focus:ring-[#EA580C] cursor-pointer"
            >
              <option value="">Pilih Meja Tujuan...</option>
              {tables
                .filter((t) => t.id !== moveFromTable.id && t.status === "available")
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tableNumber} ({t.area} - Kapasitas {t.capacity})
                  </option>
                ))}
            </select>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowMoveTableModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#18181B] rounded-full text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteMoveTable}
                disabled={!moveToTableId}
                className="flex-1 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-slate-300 text-white rounded-full text-xs font-bold cursor-pointer shadow-sm"
              >
                Pindahkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT THERMAL PRINTING COMPONENT (ESC/POS 58mm/80mm) */}
      {printData && (
        <div id="printable-receipt" className="hidden print:block">
          {printData.type === "customer" ? (
            /* Struk Pelanggan */
            <div className="text-center font-mono text-xs">
              <h2 className="font-bold text-base uppercase">SAVORIA RESTAURANT</h2>
              <p className="text-[10px]">Grand Boulevard No. 88, Jakarta Selatan</p>
              <p className="text-[10px]">Telp: (021) 8899-0000</p>
              <div className="border-t border-dashed border-black my-2" />

              <div className="text-left text-[10px] space-y-0.5">
                <p>No: {printData.order.orderNumber}</p>
                <p>Waktu: {formatDate(new Date())}</p>
                <p>Meja: {printData.order.table?.tableNumber || "Takeaway"}</p>
                <p>Kasir: {currentShift?.cashierName || "Kasir Utama"}</p>
                <p>Pelanggan: {printData.order.customerName}</p>
              </div>

              <div className="border-t border-dashed border-black my-2" />

              {/* Items */}
              <div className="text-left text-[10px] space-y-1">
                {printData.order.items?.map((it: any) => (
                  <div key={it.id} className="flex justify-between">
                    <div>
                      <span>{it.quantity}x {it.menu.name}</span>
                      {it.notes && <p className="text-[9px] italic">({it.notes})</p>}
                    </div>
                    <span>{formatIDR(it.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-black my-2" />

              <div className="text-left text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatIDR(printData.order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PB1 (10%)</span>
                  <span>{formatIDR(printData.order.taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service (5%)</span>
                  <span>{formatIDR(printData.order.serviceCharge)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
                  <span>TOTAL</span>
                  <span>{formatIDR(printData.order.totalAmount)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Metode Bayar</span>
                  <span className="uppercase">{printData.order.paymentMethod || "Tunai"}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-black my-2" />
              <p className="text-[10px] font-bold">TERIMA KASIH ATAS KUNJUNGAN ANDA</p>
              <p className="text-[9px]">Simpan struk ini sebagai bukti pembayaran sah.</p>
            </div>
          ) : (
            /* Tiket Dapur */
            <div className="text-left font-mono">
              <h2 className="font-bold text-sm uppercase text-center border-b border-black pb-1">
                *** SAVORIA TIKET DAPUR / BAR ***
              </h2>
              <div className="text-[11px] my-1 font-bold">
                <p>MEJA: {printData.order.table?.tableNumber || "TAKEAWAY"}</p>
                <p>ORDER: {printData.order.orderNumber}</p>
                <p>WAKTU: {formatDate(new Date())}</p>
              </div>

              <div className="border-t-2 border-black my-2" />

              <div className="space-y-2 text-xs font-bold">
                {printData.order.items?.map((it: any) => (
                  <div key={it.id}>
                    <p className="text-sm">
                      [{it.quantity}X] {it.menu.name}
                    </p>
                    {it.notes && (
                      <p className="text-[11px] italic underline">
                        NOTE: {it.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-black my-2" />
              <p className="text-[10px] text-center font-bold">-- SEGERA PROSES MAKANAN --</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

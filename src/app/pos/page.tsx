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
} from "lucide-react";
import Link from "next/link";
import { formatIDR, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export default function PosCashierPage() {
  const { user, logout, quickLogin, loading: authLoading } = useAuth();

  // Current active shift state
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [shiftLoading, setShiftLoading] = useState(true);

  // Modals for shift
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [startCashInput, setStartCashInput] = useState("500000");
  const [cashierNameInput, setCashierNameInput] = useState("Budi Santoso");

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

  // Void Modal state (FR-CAS-005)
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidTarget, setVoidTarget] = useState<{ orderId: number; itemId?: number } | null>(null);
  const [supervisorPin, setSupervisorPin] = useState("");
  const [voidReason, setVoidReason] = useState("");

  // Move Table Modal state (FR-CAS-003)
  const [showMoveTableModal, setShowMoveTableModal] = useState(false);
  const [moveFromTable, setMoveFromTable] = useState<any>(null);
  const [moveToTableId, setMoveToTableId] = useState<string>("");

  // Print Receipt / Kitchen Ticket state (FR-CAS-004)
  const [printData, setPrintData] = useState<{ type: "customer" | "kitchen"; order: any } | null>(null);

  // Split Bill Modal state
  const [showSplitBillModal, setShowSplitBillModal] = useState(false);
  const [splitCount, setSplitCount] = useState(2);

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
        setShowSplitBillModal(false);
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
      } else {
        alert(data.message || "Gagal membuka shift.");
      }
    } catch (err) {
      alert("Terjadi kesalahan membuka shift.");
    }
  };

  // Close Shift
  const handleCloseShift = async () => {
    if (!endCashActualInput) {
      alert("Masukkan nominal uang kas fisik di laci.");
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
        alert(`Shift berhasil ditutup! Selisih kas: ${formatIDR(data.data.variance)}`);
        setShowCloseShiftModal(false);
        fetchShift();
      } else {
        alert(data.message || "Gagal menutup shift.");
      }
    } catch (err) {
      alert("Terjadi kesalahan menutup shift.");
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
      } else {
        alert(data.message || "Gagal membuat order POS.");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat memproses pesanan.");
    }
  };

  // Update Order Status (Confirmed -> Preparing -> Served -> Completed)
  // Confirmed automatically triggers inventory deduction!
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
      } else {
        alert(data.message || "Gagal mengubah status pesanan.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
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
      } else {
        alert(data.message || "Pembayaran gagal diproses.");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat memproses pembayaran.");
    }
  };

  // Void Action (Order or Item) with Supervisor PIN
  const handleExecuteVoid = async () => {
    if (!voidTarget || !supervisorPin || !voidReason) {
      alert("PIN Supervisor dan alasan void wajib diisi.");
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
        alert(data.message);
        setShowVoidModal(false);
        setSupervisorPin("");
        setVoidReason("");
        setVoidTarget(null);
        fetchAllData();
      } else {
        alert(data.message || "Void gagal.");
      }
    } catch (err) {
      alert("Gagal memproses void.");
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
        alert(data.message);
        setShowMoveTableModal(false);
        setMoveFromTable(null);
        setMoveToTableId("");
        fetchAllData();
      } else {
        alert(data.message || "Gagal memindahkan meja.");
      }
    } catch (err) {
      alert("Terjadi kesalahan memindahkan meja.");
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
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
          <span>Memverifikasi otentikasi kasir...</span>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "kasir" && user.role !== "admin")) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Hak Akses Terbatas (Role Kasir / Admin)
            </span>
            <h2 className="text-xl font-black text-white mt-1">POS Kasir Terminal</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {user
                ? `Akun Anda saat ini (${user.name}) memiliki role [${user.role.toUpperCase()}]. Anda memerlukan hak akses Kasir atau Admin untuk mengoperasikan terminal POS ini.`
                : "Anda belum login ke sistem POS. Silakan masuk menggunakan akun kasir atau admin."}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => quickLogin("kasir")}
              className="w-full py-3 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>Login Instan sebagai Kasir (Demo)</span>
            </button>

            <Link
              href="/login?redirect=/pos"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all block text-center"
            >
              Halaman Login Kredensial
            </Link>

            <Link
              href="/user"
              className="w-full py-2.5 text-slate-400 hover:text-white font-semibold text-xs flex items-center justify-center gap-1 transition-all block text-center"
            >
              ← Kembali ke Portal Pelanggan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* 1. TOP CASHIER BAR */}
      <header className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black text-sm">
              RS
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wide text-white flex items-center gap-1.5">
                RestoSync <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-md font-bold uppercase">POS Terminal</span>
              </h1>
            </div>
          </div>

          {/* Shift Indicator */}
          {currentShift ? (
            <div className="hidden sm:flex items-center gap-3 text-xs bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">
                Kasir: <strong className="text-white">{currentShift.cashierName}</strong>
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">
                Modal Awal: <strong className="text-emerald-400">{formatIDR(currentShift.startCash)}</strong>
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">
                Ekspektasi Kas: <strong className="text-yellow-400">{formatIDR(currentShift.expectedCash || currentShift.startCash)}</strong>
              </span>
            </div>
          ) : (
            <div className="text-xs bg-red-900/60 text-red-200 px-3 py-1 rounded-lg border border-red-700 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Shift Kasir Belum Dibuka</span>
            </div>
          )}
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-2">
          {/* Waiter Calls Badge Alert */}
          {waiterCalls.length > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500 text-slate-900 px-3 py-1 rounded-lg text-xs font-bold animate-pulse">
              <BellRing className="w-3.5 h-3.5" />
              <span>{waiterCalls.length} Panggilan Pelayan!</span>
            </div>
          )}

          {/* Tab Selector */}
          <div className="bg-slate-800 p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setActiveTab("pos")}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === "pos" ? "bg-orange-500 text-white shadow-xs" : "text-slate-300 hover:text-white"
              }`}
            >
              Order Grid (F2)
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                activeTab === "orders" ? "bg-orange-500 text-white shadow-xs" : "text-slate-300 hover:text-white"
              }`}
            >
              <span>Pesanan Aktif</span>
              {activeOrders.length > 0 && (
                <span className="bg-white text-orange-600 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {activeOrders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("tables")}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === "tables" ? "bg-orange-500 text-white shadow-xs" : "text-slate-300 hover:text-white"
              }`}
            >
              Denah Meja
            </button>
          </div>

          {/* Shift Button */}
          {currentShift ? (
            <button
              onClick={() => {
                setEndCashActualInput("");
                setShowCloseShiftModal(true);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-red-950 text-red-300 hover:text-red-200 border border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tutup Shift</span>
            </button>
          ) : (
            <button
              onClick={() => setShowOpenShiftModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all"
            >
              Buka Shift
            </button>
          )}

          <Link
            href="/admin"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold rounded-xl"
          >
            Admin ↗
          </Link>

          {/* User Profile & Logout */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[11px] font-bold text-white leading-tight">{user.name}</span>
                <span className="text-[9px] text-orange-400 font-mono uppercase">{user.role}</span>
              </div>
              <button
                onClick={logout}
                title="Keluar / Logout"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Waiter Calls Floating Notification Bar */}
      {waiterCalls.length > 0 && (
        <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-amber-600 animate-bounce" />
            <span className="font-bold">Perhatian Kasir & Pelayan:</span>
            <span>
              {waiterCalls.map((c) => c.tableNumber).join(", ")} membutuhkan bantuan pelayan!
            </span>
          </div>
          <div className="flex items-center gap-2">
            {waiterCalls.map((c) => (
              <button
                key={c.id}
                onClick={() => handleResolveWaiterCall(c.id)}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px]"
              >
                Selesai Tangani ({c.tableNumber})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. BODY CONTENT BASED ON ACTIVE TAB */}
      <div className="flex-1 flex overflow-hidden">
        {/* TAB 1: POS CATALOG & BILLING */}
        {activeTab === "pos" && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Column: Menu Catalog Grid */}
            <div className="flex-1 flex flex-col bg-slate-50 border-r border-slate-200 overflow-hidden">
              {/* Category & Search Topbar */}
              <div className="p-3 bg-white border-b border-slate-200 space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="pos-search-input"
                    type="text"
                    placeholder="Cari Menu (Shortcut F2)..."
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                {/* Categories */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === "all"
                        ? "bg-orange-500 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Semua ({menus.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        selectedCategory === cat.slug
                          ? "bg-orange-500 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Items Grid */}
              <div className="flex-1 p-3 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
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
                      className={`bg-white rounded-xl border border-slate-200 p-2.5 flex flex-col justify-between hover:border-orange-400 hover:shadow-xs transition-all cursor-pointer active:scale-95 ${
                        !menu.isAvailable ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <div className="relative w-full h-24 rounded-lg overflow-hidden bg-slate-100 mb-2">
                        {menu.image ? (
                          <Image
                            src={menu.image}
                            alt={menu.name}
                            fill
                            className="object-cover"
                            sizes="180px"
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
                        <h3 className="font-bold text-xs text-slate-800 line-clamp-1 leading-tight">
                          {menu.name}
                        </h3>
                        <p className="text-orange-600 font-extrabold text-xs mt-1">
                          {formatIDR(menu.price)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Right Column: Active Bill / Cart */}
            <div className="w-full md:w-96 bg-white flex flex-col border-l border-slate-200 shadow-xs">
              {/* Table & Order Type Selector */}
              <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-700">Tujuan Pesanan</span>
                  <div className="flex gap-1 text-[11px] font-bold">
                    <button
                      onClick={() => setOrderType("dine_in")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        orderType === "dine_in"
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      Dine-In
                    </button>
                    <button
                      onClick={() => setOrderType("takeaway")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        orderType === "takeaway"
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-600 border border-slate-200"
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
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Pilih Nomor Meja...</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tableNumber} ({t.area} - {t.status === "available" ? "Kosong" : "Terisi"})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Cart Items List */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2">
                {posCart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                    <Store className="w-10 h-10 mb-2 opacity-40" />
                    <p className="text-xs font-semibold">Keranjang Kasir Masih Kosong</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Klik menu pada katalog untuk menambahkan item.
                    </p>
                  </div>
                ) : (
                  posCart.map((item) => (
                    <div
                      key={item.menuId}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-xs text-slate-800 leading-tight">
                          {item.name}
                        </span>
                        <span className="font-extrabold text-xs text-slate-900">
                          {formatIDR(item.price * item.quantity)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          @ {formatIDR(item.price)}
                        </span>

                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md p-0.5">
                          <button
                            onClick={() => updatePosCartQty(item.menuId, -1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updatePosCartQty(item.menuId, 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold"
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
              <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatIDR(posSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PB1 / Pajak (10%)</span>
                    <span>{formatIDR(posTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service (5%)</span>
                    <span>{formatIDR(posService)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-slate-900 text-sm pt-1 border-t border-slate-200">
                    <span>Total Tagihan</span>
                    <span className="text-orange-600 text-base">{formatIDR(posTotal)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setPosCart([])}
                    disabled={posCart.length === 0}
                    className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-red-600 rounded-xl disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handlePosCheckout}
                    disabled={posCart.length === 0}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-orange-600/20 active:scale-95 transition-all"
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
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Daftar Pesanan Berjalan ({activeOrders.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Pesanan masuk dari QR Meja pembeli & kasir tersinkronisasi live.
                </p>
              </div>
              <button
                onClick={fetchAllData}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-1 hover:bg-slate-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {activeOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="font-bold text-slate-700">Tidak ada pesanan aktif saat ini.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Pesanan baru dari scan QR meja akan otomatis muncul di sini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Order Header */}
                      <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-sm text-slate-900">
                              {order.orderNumber}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
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
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">
                            {order.table?.tableNumber || "Takeaway"} • {order.customerName}
                          </p>
                        </div>

                        {/* Print buttons */}
                        <div className="flex gap-1">
                          <button
                            title="Cetak Tiket Dapur"
                            onClick={() => triggerPrint("kitchen", order)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                          >
                            <ChefHat className="w-4 h-4" />
                          </button>
                          <button
                            title="Cetak Struk Pelanggan"
                            onClick={() => triggerPrint("customer", order)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Item List */}
                      <div className="py-2.5 space-y-2 max-h-48 overflow-y-auto">
                        {order.items?.map((item: any) => (
                          <div
                            key={item.id}
                            className={`text-xs flex items-start justify-between ${
                              item.isVoided ? "line-through opacity-40 text-red-500" : "text-slate-700"
                            }`}
                          >
                            <div>
                              <span className="font-bold text-slate-900">{item.quantity}x </span>
                              <span>{item.menu.name}</span>
                              {item.notes && (
                                <p className="text-[10px] text-amber-700 italic">
                                  &ldquo;{item.notes}&rdquo;
                                </p>
                              )}
                              {item.voidReason && (
                                <p className="text-[10px] text-red-600">
                                  Void: {item.voidReason}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{formatIDR(item.subtotal)}</span>
                              {!item.isVoided && order.paymentStatus !== "paid" && (
                                <button
                                  onClick={() => {
                                    setVoidTarget({ orderId: order.id, itemId: item.id });
                                    setShowVoidModal(true);
                                  }}
                                  title="Void Item"
                                  className="text-red-400 hover:text-red-600 text-[10px]"
                                >
                                  Void
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Total Pembayaran</span>
                        <span className="font-black text-sm text-slate-900">
                          {formatIDR(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Order Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {order.status === "pending" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, "confirmed")}
                          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
                        >
                          Konfirmasi Pesanan
                        </button>
                      )}

                      {order.status === "confirmed" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, "preparing")}
                          className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs"
                        >
                          Mulai Masak (Dapur)
                        </button>
                      )}

                      {order.status === "preparing" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, "served")}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                        >
                          Sajikan ke Meja
                        </button>
                      )}

                      {order.paymentStatus === "unpaid" ? (
                        <button
                          onClick={() => openPaymentForOrder(order)}
                          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Bayar</span>
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs flex items-center gap-1">
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
                          className="px-2 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-semibold rounded-lg text-xs"
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

        {/* TAB 3: TABLE MAP DASHBOARD (FR-CAS-003) */}
        {activeTab === "tables" && (
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Denah Visual Meja Restoran</h2>
                <p className="text-xs text-slate-500">
                  Pantau status keterisian meja secara langsung & pindah meja dengan 1 klik.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Kosong</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Menunggu Bayar</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Aktif / Masak</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>Reserved</span>
                </span>
              </div>
            </div>

            {/* Tables Grid grouped by Area */}
            {["Indoor", "Outdoor", "Lantai 2"].map((areaName) => {
              const areaTables = tables.filter((t) => t.area === areaName);
              if (areaTables.length === 0) return null;

              return (
                <div key={areaName} className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Area: {areaName}
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                    {areaTables.map((tbl) => {
                      const hasActiveOrder = tbl.orders && tbl.orders.length > 0;
                      const order = hasActiveOrder ? tbl.orders[0] : null;

                      let statusBg = "bg-white border-emerald-500 text-emerald-800";
                      let badge = "Kosong";

                      if (tbl.status === "reserved") {
                        statusBg = "bg-purple-50 border-purple-500 text-purple-900";
                        badge = "Reserved";
                      } else if (order) {
                        if (order.status === "pending") {
                          statusBg = "bg-amber-50 border-amber-500 text-amber-900";
                          badge = "Menunggu";
                        } else {
                          statusBg = "bg-red-50 border-red-500 text-red-900";
                          badge = order.status.toUpperCase();
                        }
                      }

                      return (
                        <div
                          key={tbl.id}
                          className={`p-3.5 rounded-2xl border-2 shadow-2xs flex flex-col justify-between transition-all ${statusBg}`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-black text-sm text-slate-900">{tbl.tableNumber}</h4>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/80 border border-current">
                                {badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Kapasitas {tbl.capacity} Orang
                            </p>
                          </div>

                          {order ? (
                            <div className="mt-3 pt-2 border-t border-slate-200/60 space-y-1">
                              <p className="text-xs font-bold line-clamp-1">{order.customerName}</p>
                              <p className="text-xs font-extrabold text-orange-600">
                                {formatIDR(order.totalAmount)}
                              </p>
                              <div className="flex gap-1 pt-1">
                                <button
                                  onClick={() => openPaymentForOrder(order)}
                                  className="flex-1 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold"
                                >
                                  Bayar
                                </button>
                                <button
                                  onClick={() => {
                                    setMoveFromTable(tbl);
                                    setShowMoveTableModal(true);
                                  }}
                                  title="Pindah Meja"
                                  className="p-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold"
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 pt-2 border-t border-slate-200/60">
                              <button
                                onClick={() => {
                                  setSelectedTableId(tbl.id);
                                  setActiveTab("pos");
                                }}
                                className="w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold"
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

      {/* OPEN SHIFT MODAL (FR-CAS-001) */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Buka Shift Kasir Baru</h3>
                <p className="text-xs text-slate-500">
                  Input nama kasir dan modal uang receh awal di laci kasir.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Kasir Petugas
                </label>
                <input
                  type="text"
                  value={cashierNameInput}
                  onChange={(e) => setCashierNameInput(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Modal Uang Receh Awal (Starting Cash)
                </label>
                <input
                  type="number"
                  value={startCashInput}
                  onChange={(e) => setStartCashInput(e.target.value)}
                  placeholder="500000"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Nominal: {formatIDR(parseFloat(startCashInput) || 0)}
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenShift}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20"
            >
              Konfirmasi & Mulai Shift Kasir
            </button>
          </div>
        </div>
      )}

      {/* CLOSE SHIFT MODAL & RECONCILIATION (FR-CAS-001) */}
      {showCloseShiftModal && currentShift && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-slate-900 text-base">Tutup Shift & Rekonsiliasi Kas</h3>
              </div>
              <button
                onClick={() => setShowCloseShiftModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reconciliation math summary */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Modal Awal Kasir</span>
                <span>{formatIDR(currentShift.startCash)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Penjualan Tunai Bersih</span>
                <span>{formatIDR(currentShift.netCashSales || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Penjualan Digital (QRIS/Debit)</span>
                <span>{formatIDR(currentShift.digitalSales || 0)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Ekspektasi Uang Tunai di Laci</span>
                <span className="text-emerald-700 text-sm">
                  {formatIDR(currentShift.expectedCash || currentShift.startCash)}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
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
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />

              {closeShiftVariance !== null && (
                <div
                  className={`mt-2 p-2 rounded-lg text-xs font-bold flex items-center justify-between ${
                    closeShiftVariance === 0
                      ? "bg-emerald-100 text-emerald-800"
                      : closeShiftVariance > 0
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
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
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-red-600/20"
            >
              Simpan & Tutup Shift Sekarang
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL (TUNAI / QRIS / DEBIT) */}
      {showPaymentModal && orderToPay && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Pembayaran: {orderToPay.orderNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  {orderToPay.table?.tableNumber || "Takeaway"} • {orderToPay.customerName}
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total tagihan */}
            <div className="bg-orange-50 p-3 rounded-xl border border-orange-200 text-center">
              <span className="text-xs text-orange-800 font-bold">Total yang Harus Dibayar</span>
              <p className="text-2xl font-black text-orange-600 mt-0.5">
                {formatIDR(orderToPay.totalAmount)}
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "cash", label: "Tunai (Cash)", icon: DollarSign },
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
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      payMethod === m.id
                        ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
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
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Uang Tunai Diterima:
                </label>
                <input
                  type="number"
                  value={cashPaidInput}
                  onChange={(e) => setCashPaidInput(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm font-bold p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                      className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold text-slate-700"
                    >
                      {preset === orderToPay.totalAmount ? "Pas" : formatIDR(preset)}
                    </button>
                  ))}
                </div>

                {/* Change amount */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold">
                  <span>Kembalian:</span>
                  <span className="text-emerald-700 text-sm">
                    {formatIDR(Math.max(0, cashPaidInput - orderToPay.totalAmount))}
                  </span>
                </div>
              </div>
            )}

            {/* QRIS specific simulation */}
            {payMethod === "qris" && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                <div className="w-32 h-32 bg-white border border-slate-300 mx-auto rounded-lg flex items-center justify-center p-2 shadow-2xs">
                  <QrCode className="w-24 h-24 text-slate-800" />
                </div>
                <p className="text-xs font-bold text-slate-700">QRIS Dinamis RestoSync</p>
                <p className="text-[11px] text-slate-400">
                  Pelanggan scan kode QR di atas via GoPay / OVO / Dana / BCA Mobile.
                </p>
              </div>
            )}

            <button
              onClick={handleProcessPayment}
              disabled={cashPaidInput < orderToPay.totalAmount}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md shadow-orange-600/20"
            >
              Selesaikan Transaksi & Cetak Struk
            </button>
          </div>
        </div>
      )}

      {/* SUPERVISOR PIN VOID PROTECTION MODAL (FR-CAS-005) */}
      {showVoidModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-red-600">
              <ShieldCheck className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Otorisasi Void Pesanan</h3>
                <p className="text-[11px] text-slate-500">Wajib PIN Supervisor & Alasan Void</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Supervisor PIN (Default: 123456)
                </label>
                <input
                  type="password"
                  placeholder="******"
                  value={supervisorPin}
                  onChange={(e) => setSupervisorPin(e.target.value)}
                  className="w-full text-center tracking-widest text-base font-bold p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Alasan Pembatalan (Void Reason)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Tamu membatalkan pesanan, salah input..."
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowVoidModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteVoid}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                Eksekusi Void
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOVE TABLE MODAL (FR-CAS-003) */}
      {showMoveTableModal && moveFromTable && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-slate-900 text-base">Pindah Meja (Move Table)</h3>
            </div>

            <p className="text-xs text-slate-600">
              Pindahkan seluruh tagihan dari <strong>{moveFromTable.tableNumber}</strong> ke meja kosong yang baru:
            </p>

            <select
              value={moveToTableId}
              onChange={(e) => setMoveToTableId(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-orange-500"
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
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteMoveTable}
                disabled={!moveToTableId}
                className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold"
              >
                Pindahkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT THERMAL PRINTING COMPONENT (ESC/POS 58mm/80mm) (FR-CAS-004) */}
      {printData && (
        <div id="printable-receipt" className="hidden print:block">
          {printData.type === "customer" ? (
            /* Struk Pelanggan */
            <div className="text-center">
              <h2 className="font-bold text-base uppercase">RESTOSYNC RESTAURANT</h2>
              <p className="text-[10px]">Jl. Gastronomi No. 88, Jakarta Selatan</p>
              <p className="text-[10px]">Telp: (021) 555-8899</p>
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
            /* Tiket Dapur (Tanpa Harga, Hanya Menu & Catatan) */
            <div className="text-left">
              <h2 className="font-bold text-sm uppercase text-center border-b border-black pb-1">
                *** TIKET DAPUR / BAR ***
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

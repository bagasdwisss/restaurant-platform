"use client";

import React, { useState, useMemo } from "react";
import {
  Receipt,
  ShieldCheck,
  Sparkles,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Layers,
  ArrowRight,
  TrendingUp,
  CreditCard,
  History,
  Tag,
  Check,
  XCircle,
  ChevronRight,
  Info,
  Plus,
  X,
  Send,
} from "lucide-react";
import { formatIDR, formatDate } from "@/lib/utils";

interface ShiftsTabProps {
  shiftHistory: any[];
  auditLogs: any[];
  cashierOrders?: any[];
  systemUpdates?: any[];
  onRefresh?: () => void;
}

type SubTab = "cashier" | "system" | "updates";

export function ShiftsTab({
  shiftHistory = [],
  auditLogs = [],
  cashierOrders = [],
  systemUpdates = [],
  onRefresh,
}: ShiftsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("cashier");

  // Cashier Log Filters
  const [cashierSearch, setCashierSearch] = useState("");
  const [cashierActionFilter, setCashierActionFilter] = useState<string>("ALL");
  const [cashierDateFilter, setCashierDateFilter] = useState<string>("ALL");

  // System Audit Log Filters
  const [systemSearch, setSystemSearch] = useState("");
  const [systemCategoryFilter, setSystemCategoryFilter] = useState<string>("ALL");
  const [systemDateFilter, setSystemDateFilter] = useState<string>("ALL");

  // System Updates Filter
  const [versionFilter, setVersionFilter] = useState<string>("ALL");

  // New Update Form state
  const [showAddUpdateModal, setShowAddUpdateModal] = useState(false);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateFeaturesText, setUpdateFeaturesText] = useState("");
  const [updateBadge, setUpdateBadge] = useState("Rilis Terkini");
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const parsedFeatures = useMemo(() => {
    return updateFeaturesText
      .split("\n")
      .map((line) => line.replace(/^[-*•\d.]+\s*/, "").trim())
      .filter(Boolean);
  }, [updateFeaturesText]);

  const featureCount = parsedFeatures.length;

  const calculatedNextVersion = useMemo(() => {
    const latest = systemUpdates[0]?.version || "v2.5.0";
    const match = latest.match(/(\d+)\.(\d+)\.(\d+)/);
    let major = 2;
    let minor = 5;
    let patch = 0;
    if (match) {
      major = parseInt(match[1], 10);
      minor = parseInt(match[2], 10);
      patch = parseInt(match[3], 10);
    }
    if (featureCount >= 15) {
      major += 1;
      minor = 0;
      patch = 0;
    } else if (featureCount >= 5) {
      minor += 1;
      patch = 0;
    } else {
      patch += 1;
    }
    return `v${major}.${minor}.${patch}`;
  }, [systemUpdates, featureCount]);

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTitle.trim() || parsedFeatures.length === 0) {
      setUpdateMsg({ type: "error", text: "Mohon isi judul dan minimal 1 fitur pembaruan." });
      return;
    }

    setIsSubmittingUpdate(true);
    setUpdateMsg(null);
    try {
      const res = await fetch("/api/v1/admin/reports/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updateTitle.trim(),
          features: parsedFeatures,
          badge: updateBadge.trim() || "Rilis Terkini",
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Gagal mencatat rilis.");
      }

      setUpdateMsg({ type: "success", text: `Versi ${data.data.version} berhasil dirilis!` });
      setUpdateTitle("");
      setUpdateFeaturesText("");
      setTimeout(() => {
        setShowAddUpdateModal(false);
        setUpdateMsg(null);
        if (onRefresh) onRefresh();
      }, 1000);
    } catch (err: any) {
      setUpdateMsg({ type: "error", text: err.message || "Terjadi kesalahan." });
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  // Helper: Date filter comparator
  const matchesDateFilter = (dateVal: string | Date | undefined, filter: string) => {
    if (filter === "ALL" || !dateVal) return true;
    const target = new Date(dateVal).getTime();
    if (isNaN(target)) return true;
    const now = Date.now();
    const diffHours = (now - target) / (1000 * 60 * 60);

    if (filter === "TODAY") return diffHours <= 24;
    if (filter === "7DAYS") return diffHours <= 24 * 7;
    if (filter === "30DAYS") return diffHours <= 24 * 30;
    return true;
  };

  // 1. CASHIER LOGS DATA & FILTERING
  const filteredShifts = useMemo(() => {
    return shiftHistory.filter((s) => {
      const matchSearch =
        !cashierSearch ||
        s.cashierName?.toLowerCase().includes(cashierSearch.toLowerCase()) ||
        s.status?.toLowerCase().includes(cashierSearch.toLowerCase());
      const matchDate = matchesDateFilter(s.openedAt, cashierDateFilter);
      return matchSearch && matchDate;
    });
  }, [shiftHistory, cashierSearch, cashierDateFilter]);

  const filteredCashierOrders = useMemo(() => {
    return cashierOrders.filter((order) => {
      const matchSearch =
        !cashierSearch ||
        order.orderNumber?.toLowerCase().includes(cashierSearch.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(cashierSearch.toLowerCase()) ||
        order.table?.tableNumber?.toLowerCase().includes(cashierSearch.toLowerCase());

      const matchDate = matchesDateFilter(order.createdAt, cashierDateFilter);

      let matchAction = true;
      if (cashierActionFilter === "PAYMENT") {
        matchAction = order.paymentStatus === "paid" || order.status === "completed";
      } else if (cashierActionFilter === "VOID") {
        matchAction = order.status === "cancelled" || order.status === "void";
      } else if (cashierActionFilter === "SHIFT") {
        matchAction = Boolean(order.shiftId);
      }

      return matchSearch && matchDate && matchAction;
    });
  }, [cashierOrders, cashierSearch, cashierActionFilter, cashierDateFilter]);

  // Cashier Operational Audit Logs (shift, payment, void, table move)
  const cashierAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const actionUpper = (log.action || "").toUpperCase();
      const isCashierAction =
        actionUpper.includes("SHIFT") ||
        actionUpper.includes("ORDER") ||
        actionUpper.includes("PAYMENT") ||
        actionUpper.includes("VOID") ||
        actionUpper.includes("TABLE_MOVE") ||
        actionUpper.includes("REFUND") ||
        actionUpper.includes("CASHIER");

      if (!isCashierAction) return false;

      const matchSearch =
        !cashierSearch ||
        log.action?.toLowerCase().includes(cashierSearch.toLowerCase()) ||
        log.user?.toLowerCase().includes(cashierSearch.toLowerCase()) ||
        log.details?.toLowerCase().includes(cashierSearch.toLowerCase());

      const matchDate = matchesDateFilter(log.createdAt, cashierDateFilter);

      let matchAction = true;
      if (cashierActionFilter === "PAYMENT") {
        matchAction = actionUpper.includes("PAYMENT") || actionUpper.includes("ORDER_PAID");
      } else if (cashierActionFilter === "VOID") {
        matchAction = actionUpper.includes("VOID") || actionUpper.includes("CANCEL");
      } else if (cashierActionFilter === "SHIFT") {
        matchAction = actionUpper.includes("SHIFT");
      } else if (cashierActionFilter === "TABLE") {
        matchAction = actionUpper.includes("TABLE");
      }

      return matchSearch && matchDate && matchAction;
    });
  }, [auditLogs, cashierSearch, cashierActionFilter, cashierDateFilter]);

  // 2. SYSTEM AUDIT LOG DATA & FILTERING
  const filteredSystemAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const actionUpper = (log.action || "").toUpperCase();

      // Category matching
      let matchCat = true;
      if (systemCategoryFilter === "LOGIN") {
        matchCat =
          actionUpper.includes("LOGIN") ||
          actionUpper.includes("LOGOUT") ||
          actionUpper.includes("AUTH");
      } else if (systemCategoryFilter === "USER") {
        matchCat =
          actionUpper.includes("USER") ||
          actionUpper.includes("STAFF") ||
          actionUpper.includes("ROLE") ||
          actionUpper.includes("PASSWORD") ||
          actionUpper.includes("REGISTER");
      } else if (systemCategoryFilter === "MENU") {
        matchCat =
          actionUpper.includes("MENU") ||
          actionUpper.includes("RECIPE") ||
          actionUpper.includes("CATEGORY");
      } else if (systemCategoryFilter === "TABLE") {
        matchCat = actionUpper.includes("TABLE") || actionUpper.includes("QR");
      } else if (systemCategoryFilter === "INVENTORY") {
        matchCat =
          actionUpper.includes("INGREDIENT") ||
          actionUpper.includes("STOCK") ||
          actionUpper.includes("RESTOCK");
      } else if (systemCategoryFilter === "CASHIER") {
        matchCat = actionUpper.includes("SHIFT") || actionUpper.includes("ORDER");
      }

      const matchSearch =
        !systemSearch ||
        log.action?.toLowerCase().includes(systemSearch.toLowerCase()) ||
        log.user?.toLowerCase().includes(systemSearch.toLowerCase()) ||
        log.details?.toLowerCase().includes(systemSearch.toLowerCase()) ||
        log.ipAddress?.toLowerCase().includes(systemSearch.toLowerCase());

      const matchDate = matchesDateFilter(log.createdAt, systemDateFilter);

      return matchCat && matchSearch && matchDate;
    });
  }, [auditLogs, systemSearch, systemCategoryFilter, systemDateFilter]);

  // 3. SYSTEM UPDATES CHANGELOG DATA & FILTERING
  const filteredSystemUpdates = useMemo(() => {
    if (versionFilter === "ALL") return systemUpdates;
    return systemUpdates.filter((u) => u.version === versionFilter);
  }, [systemUpdates, versionFilter]);

  // Quick stats
  const totalCashierTransactions = cashierOrders.length;
  const totalCashierRevenue = cashierOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const activeShift = shiftHistory.find((s) => s.status === "open");

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#18181B] tracking-tight">
            Pusat Log Kasir, Audit Sistem & Riwayat Update
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Pelacakan independen aktivitas transaksi kasir, rekam jejak audit keamanan sistem, dan
            riwayat pembaruan perangkat lunak.
          </p>
        </div>

        {/* Quick Shift Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
              activeShift
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                activeShift ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            {activeShift ? `Shift Aktif: ${activeShift.cashierName}` : "Tidak Ada Shift Aktif"}
          </div>
        </div>
      </div>

      {/* TOP NAVIGATION SUB-TABS */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveSubTab("cashier")}
          className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
            activeSubTab === "cashier"
              ? "border-amber-900 text-amber-900 font-bold"
              : "border-transparent text-[#64748B] hover:text-[#18181B]"
          }`}
        >
          <Receipt className="w-4 h-4 text-amber-900" />
          <span>Log Kasir & Shift</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 font-mono">
            {shiftHistory.length + cashierOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("system")}
          className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
            activeSubTab === "system"
              ? "border-amber-900 text-amber-900 font-bold"
              : "border-transparent text-[#64748B] hover:text-[#18181B]"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-700" />
          <span>Log Audit Sistem</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-900 font-mono">
            {auditLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("updates")}
          className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
            activeSubTab === "updates"
              ? "border-amber-900 text-amber-900 font-bold"
              : "border-transparent text-[#64748B] hover:text-[#18181B]"
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-700" />
          <span>Riwayat Update Sistem</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-mono">
            v2.5.0
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. SUB-TAB: LOG KASIR & SHIFT */}
      {/* ========================================================================= */}
      {activeSubTab === "cashier" && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Total Sesi Shift
              </span>
              <span className="text-xl sm:text-2xl font-bold font-serif text-[#18181B] mt-1 block">
                {shiftHistory.length}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {activeShift ? "1 shift berjalan saat ini" : "Semua shift tertutup"}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Total Transaksi Kasir
              </span>
              <span className="text-xl sm:text-2xl font-bold font-serif text-[#18181B] mt-1 block">
                {totalCashierTransactions}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Order tercatat di POS
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Omset Kasir
              </span>
              <span className="text-lg sm:text-2xl font-bold font-serif text-emerald-700 mt-1 block">
                {formatIDR(totalCashierRevenue)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Total transaksi kasir lunas
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Status Laci Kas
              </span>
              <span className="text-lg sm:text-2xl font-bold font-serif text-[#18181B] mt-1 block">
                {activeShift ? formatIDR(activeShift.startCash) : "-"}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {activeShift ? "Modal awal shift aktif" : "Belum ada shift terbuka"}
              </span>
            </div>
          </div>

          {/* Cashier Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Search box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cashierSearch}
                  onChange={(e) => setCashierSearch(e.target.value)}
                  placeholder="Cari nama kasir, no order, meja, atau catatan..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-900/20"
                />
              </div>

              {/* Action Filter */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {[
                  { key: "ALL", label: "Semua Aktivitas" },
                  { key: "PAYMENT", label: "Pembayaran Lunas" },
                  { key: "SHIFT", label: "Sesi Shift" },
                  { key: "VOID", label: "Void / Batal" },
                  { key: "TABLE", label: "Pindah Meja" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setCashierActionFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      cashierActionFilter === f.key
                        ? "bg-amber-900 text-white"
                        : "bg-slate-100 text-[#64748B] hover:bg-slate-200/80"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={cashierDateFilter}
                  onChange={(e) => setCashierDateFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-[#18181B] focus:outline-none focus:ring-2 focus:ring-amber-900/20"
                >
                  <option value="ALL">Semua Waktu</option>
                  <option value="TODAY">Hari Ini (24 Jam)</option>
                  <option value="7DAYS">7 Hari Terakhir</option>
                  <option value="30DAYS">30 Hari Terakhir</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 1: Riwayat Sesi Shift & Rekonsiliasi Laci */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-[#18181B]">
                  Riwayat Sesi Shift Kasir & Rekonsiliasi Kas Laci
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Pencatatan kas fisik saat buka/tutup kasir dan perhitungan selisih laci.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {filteredShifts.length} Sesi
              </span>
            </div>

            {/* Mobile View: Responsive Cards */}
            <div className="block md:hidden space-y-3">
              {filteredShifts.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  Tidak ada data shift yang sesuai filter.
                </div>
              ) : (
                filteredShifts.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-[#FDFBF7] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-amber-900" />
                        <span className="font-bold text-[#18181B]">{s.cashierName}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                          s.status === "open"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {s.status === "open" ? "Aktif" : "Tertutup"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Waktu Buka</span>
                        <span className="font-medium text-slate-700">{formatDate(s.openedAt)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Waktu Tutup</span>
                        <span className="font-medium text-slate-700">
                          {s.closedAt ? formatDate(s.closedAt) : "Sedang Berjalan"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 font-mono text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Modal Awal</span>
                        <span className="font-semibold text-slate-800">
                          {formatIDR(s.startCash)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Ekspektasi</span>
                        <span className="font-semibold text-slate-800">
                          {s.endCashExpected !== null ? formatIDR(s.endCashExpected) : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Fisik Laci</span>
                        <span className="font-semibold text-slate-800">
                          {s.endCashActual !== null ? formatIDR(s.endCashActual) : "-"}
                        </span>
                      </div>
                    </div>

                    {s.variance !== null && (
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-600">Selisih Kas Laci:</span>
                        <span
                          className={`font-mono font-bold ${
                            s.variance === 0
                              ? "text-emerald-700"
                              : s.variance > 0
                              ? "text-blue-700"
                              : "text-rose-700"
                          }`}
                        >
                          {formatIDR(s.variance)}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Desktop View: Full Responsive Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-[#FDFBF7] border-b border-slate-200/80 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Kasir</th>
                    <th className="p-3">Waktu Buka / Tutup</th>
                    <th className="p-3">Modal Awal</th>
                    <th className="p-3">Ekspektasi Kas</th>
                    <th className="p-3">Fisik di Laci</th>
                    <th className="p-3">Selisih Kas</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredShifts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#64748B]">
                        Belum ada sesi shift kasir yang tercatat.
                      </td>
                    </tr>
                  ) : (
                    filteredShifts.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 font-bold text-[#18181B]">{s.cashierName}</td>
                        <td className="p-3 text-[#64748B]">
                          <div>Buka: {formatDate(s.openedAt)}</div>
                          {s.closedAt && <div>Tutup: {formatDate(s.closedAt)}</div>}
                        </td>
                        <td className="p-3 font-mono font-semibold">{formatIDR(s.startCash)}</td>
                        <td className="p-3 font-mono font-semibold">
                          {s.endCashExpected !== null ? formatIDR(s.endCashExpected) : "-"}
                        </td>
                        <td className="p-3 font-mono font-semibold">
                          {s.endCashActual !== null ? formatIDR(s.endCashActual) : "-"}
                        </td>
                        <td className="p-3 font-mono font-bold">
                          {s.variance !== null ? (
                            <span
                              className={
                                s.variance === 0
                                  ? "text-emerald-700"
                                  : s.variance > 0
                                  ? "text-blue-700"
                                  : "text-rose-700"
                              }
                            >
                              {formatIDR(s.variance)}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                              s.status === "open"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {s.status === "open" ? "Aktif" : "Tertutup"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Transaksi Pembayaran Kasir Terperinci */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-[#18181B]">
                  Rincian Transaksi Pembayaran & Penjualan Kasir
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Daftar seluruh transaksi yang diselesaikan kasir melalui berbagai metode pembayaran.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {filteredCashierOrders.length} Transaksi
              </span>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {filteredCashierOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada transaksi kasir yang cocok dengan filter pencarian.
                </div>
              ) : (
                filteredCashierOrders.map((order) => {
                  const paymentMethod =
                    order.payments && order.payments.length > 0
                      ? order.payments[0].method
                      : "TUNAI / DIGITAL";
                  return (
                    <div
                      key={order.id}
                      className="p-3 sm:p-4 rounded-xl border border-slate-200/80 bg-[#FDFBF7] hover:bg-white transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[#18181B] font-mono">
                            #{order.orderNumber}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-semibold text-slate-700">
                            {order.customerName || "Pelanggan Tanpa Nama"}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                            {order.table?.tableNumber
                              ? `Meja ${order.table.tableNumber}`
                              : order.orderType === "takeaway"
                              ? "Takeaway"
                              : "Reservasi Meja"}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700 font-mono">
                            {paymentMethod}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatDate(order.createdAt)}</span>
                          {order.shift && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span>Shift: {order.shift.cashierName}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                        <span className="font-bold font-mono text-sm text-emerald-700">
                          {formatIDR(order.totalAmount)}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            order.paymentStatus === "paid" || order.status === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {order.paymentStatus === "paid" ? "Lunas" : order.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 3: Log Aktivitas Operasional Kasir */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-base text-[#18181B]">
              Log Khusus Operasional Kasir
            </h3>
            <p className="text-xs text-[#64748B]">
              Rekam jejak setiap aksi kasir seperti buka/tutup shift, verifikasi pembayaran, void pesanan, atau perubahan meja.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {cashierAuditLogs.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  Belum ada log operasional kasir tercatat.
                </div>
              ) : (
                cashierAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#18181B]">{log.action}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-amber-900 font-semibold font-mono">
                          {log.user}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5 text-[11px]">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUB-TAB: LOG AUDIT SISTEM */}
      {/* ========================================================================= */}
      {activeSubTab === "system" && (
        <div className="space-y-6">
          {/* System Audit Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Search box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={systemSearch}
                  onChange={(e) => setSystemSearch(e.target.value)}
                  placeholder="Cari aktivitas audit, email user, aksi, atau IP address..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-900/20"
                />
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={systemDateFilter}
                  onChange={(e) => setSystemDateFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-[#18181B] focus:outline-none focus:ring-2 focus:ring-indigo-900/20"
                >
                  <option value="ALL">Semua Waktu</option>
                  <option value="TODAY">Hari Ini (24 Jam)</option>
                  <option value="7DAYS">7 Hari Terakhir</option>
                  <option value="30DAYS">30 Hari Terakhir</option>
                </select>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                Kategori:
              </span>
              {[
                { key: "ALL", label: "Semua Kategori" },
                { key: "LOGIN", label: "Login & Keamanan" },
                { key: "USER", label: "Akun User & Staff" },
                { key: "MENU", label: "Menu & Resep" },
                { key: "TABLE", label: "Meja & Tata Letak" },
                { key: "INVENTORY", label: "Bahan Baku & Stok" },
                { key: "CASHIER", label: "Operasional Kasir" },
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSystemCategoryFilter(c.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    systemCategoryFilter === c.key
                      ? "bg-indigo-900 text-white"
                      : "bg-slate-100 text-[#64748B] hover:bg-slate-200/80"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Log Stream */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-[#18181B]">
                  Jejak Audit Trail Sistem & Keamanan
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Mencatat seluruh aksi kritikal seperti pembuatan akun, pergantian role, update menu, restock bahan, dan login.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {filteredSystemAuditLogs.length} Entri Log
              </span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredSystemAuditLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Tidak ada audit log sistem yang sesuai filter.
                </div>
              ) : (
                filteredSystemAuditLogs.map((log) => {
                  const actionUpper = (log.action || "").toUpperCase();
                  let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";

                  if (actionUpper.includes("LOGIN") || actionUpper.includes("AUTH")) {
                    badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
                  } else if (actionUpper.includes("USER") || actionUpper.includes("ROLE")) {
                    badgeColor = "bg-amber-50 text-amber-800 border-amber-200";
                  } else if (actionUpper.includes("MENU") || actionUpper.includes("RECIPE")) {
                    badgeColor = "bg-blue-50 text-blue-800 border-blue-200";
                  } else if (actionUpper.includes("TABLE") || actionUpper.includes("QR")) {
                    badgeColor = "bg-purple-50 text-purple-800 border-purple-200";
                  } else if (actionUpper.includes("INGREDIENT") || actionUpper.includes("STOCK")) {
                    badgeColor = "bg-teal-50 text-teal-800 border-teal-200";
                  } else if (actionUpper.includes("DELETE") || actionUpper.includes("VOID")) {
                    badgeColor = "bg-rose-50 text-rose-800 border-rose-200";
                  }

                  return (
                    <div
                      key={log.id}
                      className="p-3 sm:p-4 rounded-xl bg-[#FDFBF7] border border-slate-200/80 hover:bg-white transition-all text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono border ${badgeColor}`}
                          >
                            {log.action}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {log.user || "System Anonymous"}
                          </span>
                          {log.ipAddress && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                IP: {log.ipAddress}
                              </span>
                            </>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono shrink-0">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>

                      <p className="text-slate-600 text-xs pl-0.5 leading-relaxed">
                        {log.details || "Aktivitas tercatat di sistem tanpa keterangan tambahan."}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-TAB: RIWAYAT UPDATE SISTEM (CHANGELOG) */}
      {/* ========================================================================= */}
      {activeSubTab === "updates" && (
        <div className="space-y-6">
          {/* Header & Filter & Action */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-base text-[#18181B] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Catatan Rilis & Pembaruan Fitur Sistem
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Riwayat versi software Savoria Haute Cuisine dan daftar pembaruan setiap rilis.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <button
                onClick={() => setShowAddUpdateModal(!showAddUpdateModal)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Catat Rilis Versi Baru
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Filter:</span>
                <select
                  value={versionFilter}
                  onChange={(e) => setVersionFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-[#18181B] focus:outline-none focus:ring-2 focus:ring-emerald-900/20"
                >
                  <option value="ALL">Semua Versi</option>
                  {systemUpdates.map((u) => (
                    <option key={u.version} value={u.version}>
                      {u.version} ({u.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Form Modal / Accordion: Catat Rilis Baru */}
          {showAddUpdateModal && (
            <div className="bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 border-2 border-emerald-300 rounded-2xl p-5 shadow-md space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                <div>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-emerald-950 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Form Catat Pembaruan Sistem (Auto-Versioning)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Versi sistem akan dikalkulasi secara otomatis dari jumlah fitur baru yang ditambahkan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddUpdateModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {updateMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                    updateMsg.type === "success"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-rose-100 text-rose-800 border border-rose-200"
                  }`}
                >
                  <Info className="w-4 h-4 shrink-0" />
                  {updateMsg.text}
                </div>
              )}

              <form onSubmit={handleCreateUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Judul / Ringkasan Rilis <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Modul Voucher Diskon Promo & Fix Shift Kasir"
                      value={updateTitle}
                      onChange={(e) => setUpdateTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Badge Status</label>
                    <input
                      type="text"
                      placeholder="Contoh: Rilis Terkini / Major Update"
                      value={updateBadge}
                      onChange={(e) => setUpdateBadge(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>
                      Daftar Fitur / Perubahan <span className="text-rose-500">*</span> (1 per baris)
                    </span>
                    <span className="text-emerald-700 font-mono font-bold">
                      {featureCount} Fitur Terdeteksi
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Ketik setiap fitur baru di baris baru, misalnya:&#10;Fitur Voucher Kuota 10 Pengguna di Admin&#10;Input Reedem Voucher di Pembayaran Tamu&#10;Fix Endpoint Shift Kasir Start 404"
                    value={updateFeaturesText}
                    onChange={(e) => setUpdateFeaturesText(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono leading-relaxed"
                  />
                </div>

                {/* Auto Semantic Versioning Preview Box */}
                <div className="p-3.5 bg-emerald-50/90 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">
                      Kalkulasi Versi Otomatis:
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-black bg-emerald-600 text-white shadow-sm">
                      {calculatedNextVersion}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1 border-t border-emerald-200/60">
                    <div className={featureCount < 5 ? "font-bold text-emerald-800" : "opacity-60"}>
                      • &lt; 5 Fitur: Patch bump (cth: 2.5.0 &rarr; 2.5.1)
                    </div>
                    <div
                      className={
                        featureCount >= 5 && featureCount < 15
                          ? "font-bold text-emerald-800"
                          : "opacity-60"
                      }
                    >
                      • 5 - 14 Fitur: Minor bump (cth: 2.5.0 &rarr; 2.6.0)
                    </div>
                    <div className={featureCount >= 15 ? "font-bold text-emerald-800" : "opacity-60"}>
                      • &ge; 15 Fitur: Major bump (cth: 2.5.0 &rarr; 3.0.0)
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddUpdateModal(false)}
                    className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingUpdate}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmittingUpdate ? "Menyimpan ke Cloud..." : `Rilis ${calculatedNextVersion}`}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Version Cards Timeline */}
          <div className="space-y-4">
            {filteredSystemUpdates.map((release) => {
              const isLatest = release.status === "latest";
              return (
                <div
                  key={release.version}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition-all space-y-3 ${
                    isLatest
                      ? "border-emerald-300 ring-2 ring-emerald-100"
                      : "border-slate-200/80"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-base font-bold text-[#18181B]">
                        {release.version}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          isLatest
                            ? "bg-emerald-100 text-emerald-800"
                            : release.status === "stable"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {release.badge || release.status}
                      </span>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <span className="text-xs text-slate-500 font-medium">
                        Tanggal Rilis: {release.releaseDate}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900">
                    {release.title}
                  </h4>

                  {/* Feature Checklist */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Pembaruan & Fitur Baru:
                    </span>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {release.features?.map((feat: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

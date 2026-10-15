"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  History,
} from "lucide-react";
import { formatIDR, formatDate } from "@/lib/utils";

interface CashierLogsSubTabProps {
  shiftHistory: any[];
  cashierOrders?: any[];
  auditLogs?: any[];
}

export function CashierLogsSubTab({
  shiftHistory = [],
  cashierOrders = [],
  auditLogs = [],
}: CashierLogsSubTabProps) {
  const [cashierSearch, setCashierSearch] = useState("");
  const [cashierActionFilter, setCashierActionFilter] = useState<string>("ALL");
  const [cashierDateFilter, setCashierDateFilter] = useState<string>("ALL");

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

  const totalCashierTransactions = cashierOrders.length;
  const totalCashierRevenue = cashierOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const activeShift = shiftHistory.find((s) => s.status === "open");

  return (
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
              { key: "VOID", label: "Batal / Void" },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setCashierActionFilter(f.key)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                  cashierActionFilter === f.key
                    ? "bg-amber-900 text-white font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={cashierDateFilter}
              onChange={(e) => setCashierDateFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-[#18181B] focus:outline-none focus:ring-2 focus:ring-amber-900/20"
            >
              <option value="ALL">Semua Waktu</option>
              <option value="TODAY">24 Jam Terakhir</option>
              <option value="7DAYS">7 Hari Terakhir</option>
              <option value="30DAYS">30 Hari Terakhir</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 1: Daftar Riwayat Sesi Shift Kasir */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-[#18181B]">
              Histori Sesi Shift Kasir (Log Buka / Tutup Kas)
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Rekam jejak kas awal, kas akhir aktual, selisih rekonsiliasi, dan catatan setiap kasir yang bertugas.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {filteredShifts.length} Sesi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Kasir</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Waktu Buka</th>
                <th className="py-2.5 px-3">Waktu Tutup</th>
                <th className="py-2.5 px-3 text-right">Modal Awal</th>
                <th className="py-2.5 px-3 text-right">Kas Akhir Aktual</th>
                <th className="py-2.5 px-3 text-right">Selisih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredShifts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada riwayat shift yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredShifts.map((shift) => {
                  const isOpen = shift.status === "open";
                  const diff = shift.difference || 0;
                  return (
                    <tr key={shift.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#18181B]">{shift.cashierName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: {shift.id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                            isOpen
                              ? "bg-emerald-100 text-emerald-800 animate-pulse"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOpen ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {isOpen ? "Aktif" : "Tertutup"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                        {formatDate(shift.openedAt)}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                        {shift.closedAt ? formatDate(shift.closedAt) : "-"}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-700">
                        {formatIDR(shift.startCash)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-700">
                        {shift.actualEndCash !== null && shift.actualEndCash !== undefined
                          ? formatIDR(shift.actualEndCash)
                          : "-"}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        {isOpen ? (
                          <span className="text-slate-400">-</span>
                        ) : diff === 0 ? (
                          <span className="text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Pas
                          </span>
                        ) : diff > 0 ? (
                          <span className="text-blue-600">+{formatIDR(diff)}</span>
                        ) : (
                          <span className="text-rose-600 flex items-center justify-end gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {formatIDR(diff)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
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
                          <span>Shift: {order.shift?.cashierName || "Kasir"}</span>
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
  );
}

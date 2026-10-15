"use client";

import React, { useState } from "react";
import { Receipt, ShieldCheck, Sparkles } from "lucide-react";
import { CashierLogsSubTab } from "./shifts/CashierLogsSubTab";
import { SystemAuditLogsSubTab } from "./shifts/SystemAuditLogsSubTab";
import { SystemUpdatesSubTab } from "./shifts/SystemUpdatesSubTab";

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
            {systemUpdates[0]?.version || "v2.5.0"}
          </span>
        </button>
      </div>

      {/* SUB-TAB CONTENTS */}
      {activeSubTab === "cashier" && (
        <CashierLogsSubTab
          shiftHistory={shiftHistory}
          cashierOrders={cashierOrders}
          auditLogs={auditLogs}
        />
      )}

      {activeSubTab === "system" && (
        <SystemAuditLogsSubTab auditLogs={auditLogs} />
      )}

      {activeSubTab === "updates" && (
        <SystemUpdatesSubTab
          systemUpdates={systemUpdates}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}

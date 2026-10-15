"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Trees,
  Crown,
  Users,
  CheckCircle2,
  RefreshCw,
  Layers,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { TableItemData } from "./VisualTableCard";
import { FloorTableFurniture, isTableCapacityEligible } from "./FloorTableFurniture";

interface VisualFloorPlanProps {
  tables: TableItemData[];
  mode: "reservation" | "pos" | "admin";
  selectedTable?: TableItemData | null;
  guestCount?: number;
  onSelectTable?: (table: TableItemData) => void;
  onConfirmTable?: (table: TableItemData) => void;
  onOpenBill?: (table: TableItemData) => void;
  onPayOrder?: (order: any) => void;
  onMoveTable?: (table: TableItemData) => void;
  onRefresh?: () => void;
}

type FloorFilter = "all" | "indoor" | "outdoor" | "mezzanine";

export function VisualFloorPlan({
  tables,
  mode,
  selectedTable,
  guestCount = 2,
  onSelectTable,
  onConfirmTable,
  onOpenBill,
  onPayOrder,
  onMoveTable,
  onRefresh,
}: VisualFloorPlanProps) {
  const [activeFilter, setActiveFilter] = useState<FloorFilter>("all");

  // Zone classifications
  const isOutdoorTable = (t: TableItemData) => {
    const area = (t.area || "").toLowerCase();
    return (
      area.includes("garden") ||
      area.includes("outdoor") ||
      area.includes("patio") ||
      area.includes("veranda") ||
      area.includes("teras")
    );
  };

  const isMezzanineTable = (t: TableItemData) => {
    const area = (t.area || "").toLowerCase();
    return (
      area.includes("lantai 2") ||
      area.includes("mezzanine") ||
      area.includes("vip") ||
      area.includes("salon") ||
      area.includes("president")
    );
  };

  const isIndoorTable = (t: TableItemData) => {
    return !isOutdoorTable(t) && !isMezzanineTable(t);
  };

  // Filtered tables on the single floor
  const displayedTables = useMemo(() => {
    if (activeFilter === "all") return tables;
    if (activeFilter === "indoor") return tables.filter(isIndoorTable);
    if (activeFilter === "outdoor") return tables.filter(isOutdoorTable);
    return tables.filter(isMezzanineTable);
  }, [tables, activeFilter]);

  // Status metrics
  const availableCount = tables.filter((t) => t.status === "available").length;
  const occupiedCount = tables.filter(
    (t) => t.status === "occupied" || (t.orders && t.orders.length > 0)
  ).length;
  const reservedCount = tables.filter((t) => t.status === "reserved").length;

  return (
    <div className="space-y-4">
      {/* Top Controls: Filter Pills & Live Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-3xl border border-[#E2E8F0] shadow-sm">
        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all" as FloorFilter, label: "Semua Meja (1 Lantai)", icon: Layers, count: tables.length },
            { id: "indoor" as FloorFilter, label: "Grand Salle Indoor", icon: Sparkles, count: tables.filter(isIndoorTable).length },
            { id: "outdoor" as FloorFilter, label: "Jardin Patio Outdoor", icon: Trees, count: tables.filter(isOutdoorTable).length },
            { id: "mezzanine" as FloorFilter, label: "Mezzanine VIP", icon: Crown, count: tables.filter(isMezzanineTable).length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-[#14281D] text-white shadow-md shadow-[#14281D]/20 scale-[1.02]"
                    : "bg-[#FDFBF7] border border-[#E2E8F0] text-[#64748B] hover:text-[#18181B] hover:border-[#EA580C]/40"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#EA580C]" : "text-stone-400"}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? "bg-white/20 text-white font-bold" : "bg-stone-200 text-stone-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            <span className="text-[#64748B]">Tersedia ({availableCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200" />
            <span className="text-[#64748B]">Terisi ({occupiedCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-200" />
            <span className="text-[#64748B]">Dipesan ({reservedCount})</span>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Perbarui Denah Lantai"
              className="p-1.5 rounded-full bg-[#FDFBF7] border border-[#E2E8F0] hover:text-[#EA580C] text-[#64748B] transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ONE SINGLE CONTINUOUS RESTAURANT FLOOR CANVAS (SEMUA MEJA DI SATU LANTAI TANPA CARD) */}
      <div className="relative rounded-3xl border-2 border-[#D8D0BE] bg-[#F9F6F0] p-5 sm:p-10 shadow-2xl overflow-hidden select-none">
        {/* Subtle Architectural Blueprint Grid Lines Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#D6CDBC_1.5px,transparent_1.5px)] [background-size:24px_24px]"
        />

        {/* Ambient Top Boundary: Entrance Foyer & Wine Bar */}
        <div className="relative z-10 flex items-center justify-between border-b-2 border-stone-300/80 pb-3 mb-6 text-xs text-stone-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
            <span className="font-bold uppercase tracking-wider text-[#18181B]">
              🚪 PINTU MASUK & FOYER UTAMA
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-stone-400">
            <span>🍷 WINE BAR & LOUNGE ATELIER</span>
          </div>
        </div>

        {/* ALL TABLES POSITIONED ON THIS SINGLE UNIFIED FLOOR */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 sm:gap-x-10 sm:gap-y-12 items-center justify-items-center py-4 sm:py-6">
          {displayedTables.map((tbl) => (
            <FloorTableFurniture
              key={tbl.id}
              table={tbl}
              mode={mode}
              isSelected={selectedTable?.id === tbl.id}
              guestCount={guestCount}
              onSelect={onSelectTable}
              onConfirm={onConfirmTable}
              onOpenBill={onOpenBill}
              onPayOrder={onPayOrder}
              onMoveTable={onMoveTable}
            />
          ))}
        </div>

        {/* Ambient Bottom Boundary: Glass Windows & Garden View */}
        <div className="relative z-10 flex items-center justify-center border-t-2 border-stone-300/80 pt-3 mt-6 text-xs text-stone-500 font-mono">
          <div className="flex items-center gap-2 text-[11px] text-stone-400">
            <span>🪟 DINDING KACA MENUSUK TAMAN (JARDIN PATIO VIEW) • AREA AL FRESCO 🌿</span>
          </div>
        </div>
      </div>

      {/* DOCK / INSPECTOR PANEL DI BAWAH DENAH */}
      {selectedTable && selectedTable.tableNumber ? (() => {
        const dockEligibility =
          mode === "reservation"
            ? isTableCapacityEligible(selectedTable.capacity || 2, guestCount)
            : { eligible: true, reason: "", badge: "" };

        return (
          <div className="bg-[#14281D] text-white p-4 sm:p-5 rounded-3xl shadow-2xl border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3.5 w-full md:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-[#EA580C] text-white flex items-center justify-center font-serif font-black text-lg shadow-cta shrink-0">
                {selectedTable.tableNumber}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-serif font-bold text-base text-white">
                    Meja {selectedTable.tableNumber}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
                    {selectedTable.capacity || 2} Kursi
                  </span>
                  {mode === "reservation" && !dockEligibility.eligible ? (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      <span>{dockEligibility.badge}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/10 text-stone-300">
                      {selectedTable.status === "available" ? "Tersedia" : selectedTable.status || "Tersedia"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-300 mt-0.5 font-light">
                  Area: <strong className="text-white font-medium">{selectedTable.area || "Indoor"}</strong> • Terhubung Real-Time ke Sistem Restoran
                </p>
              </div>
            </div>

            {/* Action buttons depending on mode */}
            {mode === "reservation" && (
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <span className="text-xs text-stone-300 hidden lg:inline">
                  {dockEligibility.eligible
                    ? "Meja siap dikunci untuk reservasi jamuan Anda"
                    : dockEligibility.reason}
                </span>
                <button
                  type="button"
                  disabled={!dockEligibility.eligible}
                  onClick={() => {
                    if (!dockEligibility.eligible) return;
                    if (onConfirmTable) {
                      onConfirmTable(selectedTable);
                    } else if (onSelectTable) {
                      onSelectTable(selectedTable);
                    }
                  }}
                  className={`w-full md:w-auto px-6 py-3 font-bold rounded-full text-xs flex items-center justify-center gap-2 shadow-cta transition-all ${
                    dockEligibility.eligible
                      ? "bg-[#EA580C] hover:bg-[#C2410C] text-white cursor-pointer"
                      : "bg-stone-700 text-stone-400 cursor-not-allowed opacity-60"
                  }`}
                >
                  {dockEligibility.eligible ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Pilih Meja {selectedTable.tableNumber} & Lanjut ke Pembayaran</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Kapasitas Meja Tidak Cocok</span>
                    </>
                  )}
                </button>
              </div>
            )}

          {mode === "pos" && (
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              {selectedTable.status === "available" ? (
                <button
                  type="button"
                  onClick={() => onOpenBill && onOpenBill(selectedTable)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-cta cursor-pointer"
                >
                  + Buka Bill Baru Meja {selectedTable?.tableNumber || ""}
                </button>
              ) : selectedTable.orders && selectedTable.orders.length > 0 ? (
                <button
                  type="button"
                  onClick={() => onPayOrder && onPayOrder(selectedTable.orders![0])}
                  className="px-6 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold shadow-cta cursor-pointer"
                >
                  Bayar Tagihan ({selectedTable?.orders?.[0]?.customerName || "Tamu"})
                </button>
              ) : (
                <span className="text-xs text-stone-300 font-mono">Meja Telah Direservasi</span>
              )}
            </div>
          )}
        </div>
        );
      })() : (
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
          <Eye className="w-4 h-4 text-[#EA580C]" />
          <span>
            Klik meja langsung pada denah lantai di atas untuk memilih meja jamuan Anda.
          </span>
        </div>
      )}
    </div>
  );
}

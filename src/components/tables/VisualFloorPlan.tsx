"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Trees,
  Crown,
  Users,
  CheckCircle2,
  RefreshCw,
  MapPin,
  UtensilsCrossed,
  Layers,
  ArrowRight,
  Eye,
  Check,
} from "lucide-react";
import { TableItemData } from "./VisualTableCard";
import { FloorTableFurniture } from "./FloorTableFurniture";

interface VisualFloorPlanProps {
  tables: TableItemData[];
  mode: "reservation" | "pos" | "admin";
  selectedTable?: TableItemData | null;
  guestCount?: number;
  onSelectTable?: (table: TableItemData) => void;
  onOpenBill?: (table: TableItemData) => void;
  onPayOrder?: (order: any) => void;
  onMoveTable?: (table: TableItemData) => void;
  onRefresh?: () => void;
}

type FloorZone = "all" | "indoor" | "outdoor" | "mezzanine";

export function VisualFloorPlan({
  tables,
  mode,
  selectedTable,
  guestCount = 2,
  onSelectTable,
  onOpenBill,
  onPayOrder,
  onMoveTable,
  onRefresh,
}: VisualFloorPlanProps) {
  const [activeZone, setActiveZone] = useState<FloorZone>("all");

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

  // Grouped tables by sector
  const indoorTables = useMemo(() => tables.filter(isIndoorTable), [tables]);
  const outdoorTables = useMemo(() => tables.filter(isOutdoorTable), [tables]);
  const mezzanineTables = useMemo(() => tables.filter(isMezzanineTable), [tables]);

  // Status metrics
  const availableCount = tables.filter((t) => t.status === "available").length;
  const occupiedCount = tables.filter(
    (t) => t.status === "occupied" || (t.orders && t.orders.length > 0)
  ).length;
  const reservedCount = tables.filter((t) => t.status === "reserved").length;

  return (
    <div className="space-y-4">
      {/* Floor Plan Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-3xl border border-[#E2E8F0] shadow-sm">
        {/* Floor View Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all" as FloorZone, label: "Semua Denah Lantai", icon: Layers, count: tables.length },
            { id: "indoor" as FloorZone, label: "Indoor Grand Salle", icon: Sparkles, count: indoorTables.length },
            { id: "outdoor" as FloorZone, label: "Outdoor Jardin Patio", icon: Trees, count: outdoorTables.length },
            { id: "mezzanine" as FloorZone, label: "Lantai 2 Mezzanine VIP", icon: Crown, count: mezzanineTables.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeZone === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveZone(tab.id)}
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

      {/* CONTINUOUS RESTAURANT FLOOR CANVAS (SATU LANTAI UTUH TANPA CARD) */}
      <div className="relative rounded-3xl border-2 border-[#DCD5C5] bg-[#F7F4EE] shadow-2xl p-4 sm:p-8 overflow-hidden">
        {/* Subtle Architectural Blueprint Grid Lines Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 bg-[linear-gradient(to_right,#E5DEC8_1px,transparent_1px),linear-gradient(to_bottom,#E5DEC8_1px,transparent_1px)] bg-[size:32px_32px]"
        />

        {/* Ambient Top Border Wall */}
        <div className="relative z-10 flex items-center justify-between border-b-2 border-stone-300/80 pb-3 mb-6 text-xs text-stone-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
            <span className="font-bold uppercase tracking-wider text-[#18181B]">
              DENAH TATA RUANG RESTORAN SAVORIA
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px]">
            <span>🏢 Tata Letak Meja Skala Nyata</span>
            <span>📍 Klik Langsung Meja di Lantai</span>
          </div>
        </div>

        {/* FLOOR SECTORS CONTAINER */}
        <div className="relative z-10 space-y-10">
          {/* SECTOR 1: INDOOR GRAND SALLE */}
          {(activeZone === "all" || activeZone === "indoor") && indoorTables.length > 0 && (
            <div className="relative rounded-3xl p-5 sm:p-7 border border-[#E0D8C8] bg-gradient-to-b from-[#FAF7F0] to-[#F5EFE4] shadow-sm">
              {/* Sector Architectural Title & Landmarks */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/90 pb-3 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs">
                      🏛️
                    </span>
                    <h3 className="font-serif font-black text-base sm:text-lg text-[#18181B] tracking-tight">
                      Lantai 1 • Grand Salle (Indoor Utama)
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Lantai marmer Prancis dengan chandelier kristal bersinar hangat, AC sejuk & alunan musik jazz.
                  </p>
                </div>

                {/* Architectural Landmarks in this room */}
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-stone-500">
                  <span className="px-2.5 py-1 rounded-full bg-white border border-stone-200 shadow-xs flex items-center gap-1">
                    🚪 Pintu Masuk / Welcome Foyer
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white border border-stone-200 shadow-xs flex items-center gap-1">
                    🍷 Sommelier Wine Bar
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white border border-stone-200 shadow-xs flex items-center gap-1">
                    🪟 Dinding Kaca Taman
                  </span>
                </div>
              </div>

              {/* Furniture Arranged Directly on the Floor (Tanpa Card) */}
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-4">
                {indoorTables.map((tbl) => (
                  <FloorTableFurniture
                    key={tbl.id}
                    table={tbl}
                    mode={mode}
                    isSelected={selectedTable?.id === tbl.id}
                    guestCount={guestCount}
                    onSelect={onSelectTable}
                    onOpenBill={onOpenBill}
                    onPayOrder={onPayOrder}
                    onMoveTable={onMoveTable}
                  />
                ))}
              </div>
            </div>
          )}

          {/* SECTOR 2: OUTDOOR JARDIN PATIO */}
          {(activeZone === "all" || activeZone === "outdoor") && outdoorTables.length > 0 && (
            <div className="relative rounded-3xl p-5 sm:p-7 border border-emerald-200/80 bg-gradient-to-b from-[#F2F8F4] to-[#E9F3EC] shadow-sm">
              {/* Sector Architectural Title & Landmarks */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-3 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
                      🌿
                    </span>
                    <h3 className="font-serif font-black text-base sm:text-lg text-[#18181B] tracking-tight">
                      Area Terbuka • Jardin Patio (Outdoor Al Fresco)
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Teras taman terbuka di kelilingi tanaman hijau eksotis, gemericik air mancur & semilir angin malam.
                  </p>
                </div>

                {/* Architectural Landmarks in this room */}
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-stone-500">
                  <span className="px-2.5 py-1 rounded-full bg-white border border-emerald-200 shadow-xs flex items-center gap-1 text-emerald-800">
                    ⛲ Air Mancur Marmer Sentral
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white border border-emerald-200 shadow-xs flex items-center gap-1 text-emerald-800">
                    🪴 Palem & Tanaman Tropis
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white border border-emerald-200 shadow-xs flex items-center gap-1 text-emerald-800">
                    🏮 Lampion Romantis
                  </span>
                </div>
              </div>

              {/* Furniture Arranged Directly on the Floor (Tanpa Card) */}
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-4">
                {outdoorTables.map((tbl) => (
                  <FloorTableFurniture
                    key={tbl.id}
                    table={tbl}
                    mode={mode}
                    isSelected={selectedTable?.id === tbl.id}
                    guestCount={guestCount}
                    onSelect={onSelectTable}
                    onOpenBill={onOpenBill}
                    onPayOrder={onPayOrder}
                    onMoveTable={onMoveTable}
                  />
                ))}
              </div>
            </div>
          )}

          {/* SECTOR 3: LANTAI 2 MEZZANINE VIP */}
          {(activeZone === "all" || activeZone === "mezzanine") && mezzanineTables.length > 0 && (
            <div className="relative rounded-3xl p-5 sm:p-7 border border-purple-200/80 bg-gradient-to-b from-[#F7F2FA] to-[#EFE7F5] shadow-sm">
              {/* Sector Architectural Title & Landmarks */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200 pb-3 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center text-xs">
                      👑
                    </span>
                    <h3 className="font-serif font-black text-base sm:text-lg text-[#18181B] tracking-tight">
                      Lantai 2 • Mezzanine & VIP Presidential Salon
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Suite perjamuan privat eksklusif dengan pemandangan terbuka balkon ke ruang utama & personal butler.
                  </p>
                </div>

                {/* Architectural Landmarks in this room */}
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-stone-500">
                  <span className="px-2.5 py-1 rounded-full bg-white border border-purple-200 shadow-xs flex items-center gap-1 text-purple-800">
                    🏰 Railing Balkon ke Grand Salle
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white border border-purple-200 shadow-xs flex items-center gap-1 text-purple-800">
                    🍾 Private Vintage Wine Vault
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white border border-purple-200 shadow-xs flex items-center gap-1 text-purple-800">
                    🛋️ Sofa Velvet Lounge
                  </span>
                </div>
              </div>

              {/* Furniture Arranged Directly on the Floor (Tanpa Card) */}
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-4">
                {mezzanineTables.map((tbl) => (
                  <FloorTableFurniture
                    key={tbl.id}
                    table={tbl}
                    mode={mode}
                    isSelected={selectedTable?.id === tbl.id}
                    guestCount={guestCount}
                    onSelect={onSelectTable}
                    onOpenBill={onOpenBill}
                    onPayOrder={onPayOrder}
                    onMoveTable={onMoveTable}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DOCK / INSPECTOR PANEL DI BAWAH DENAH */}
      {selectedTable ? (
        <div className="bg-[#14281D] text-white p-4 sm:p-5 rounded-3xl shadow-2xl border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#EA580C] text-white flex items-center justify-center font-serif font-black text-lg shadow-cta shrink-0">
              {selectedTable.tableNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif font-bold text-base text-white">
                  Meja {selectedTable.tableNumber}
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
                  {selectedTable.capacity} Kursi
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/10 text-stone-300">
                  {selectedTable.status === "available" ? "Tersedia" : selectedTable.status}
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5 font-light">
                Area: <strong className="text-white font-medium">{selectedTable.area}</strong> • Terkoneksi Real-Time ke Sistem Restoran
              </p>
            </div>
          </div>

          {/* Action buttons depending on mode */}
          {mode === "reservation" && (
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <span className="text-xs text-stone-300 hidden lg:inline">
                Meja siap dikunci untuk reservasi jamuan Anda
              </span>
              <button
                type="button"
                onClick={() => onSelectTable && onSelectTable(selectedTable)}
                className="w-full md:w-auto px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-full text-xs flex items-center justify-center gap-2 shadow-cta cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Pilih Meja {selectedTable.tableNumber}</span>
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
                  + Buka Bill Baru Meja {selectedTable.tableNumber}
                </button>
              ) : selectedTable.orders && selectedTable.orders.length > 0 ? (
                <button
                  type="button"
                  onClick={() => onPayOrder && onPayOrder(selectedTable.orders![0])}
                  className="px-6 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold shadow-cta cursor-pointer"
                >
                  Bayar Tagihan ({selectedTable.orders[0].customerName})
                </button>
              ) : (
                <span className="text-xs text-stone-300 font-mono">Meja Telah Direservasi</span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
          <Eye className="w-4 h-4 text-[#EA580C]" />
          <span>
            Klik langsung pada meja di atas denah lantai untuk memilih dan melihat detail kapasitas serta suasana meja.
          </span>
        </div>
      )}
    </div>
  );
}

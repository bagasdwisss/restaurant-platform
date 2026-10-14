"use client";

import React from "react";
import {
  Users,
  UtensilsCrossed,
  CheckCircle2,
  Sparkles,
  Wine,
  Trees,
  Crown,
  ArrowRightLeft,
  DollarSign,
  AlertTriangle,
  Flame,
  Check,
} from "lucide-react";
import { formatIDR } from "@/lib/utils";

export interface TableItemData {
  id: number;
  tableNumber: string;
  capacity: number;
  qrToken: string;
  status: string; // available, occupied, reserved
  area: string;
  orders?: any[];
}

interface VisualTableCardProps {
  table: TableItemData;
  mode: "reservation" | "pos" | "admin";
  isSelected?: boolean;
  guestCount?: number;
  onSelect?: (table: TableItemData) => void;
  onOpenBill?: (table: TableItemData) => void;
  onPayOrder?: (order: any) => void;
  onMoveTable?: (table: TableItemData) => void;
}

export function VisualTableCard({
  table,
  mode,
  isSelected = false,
  guestCount = 2,
  onSelect,
  onOpenBill,
  onPayOrder,
  onMoveTable,
}: VisualTableCardProps) {
  const isAvailable = table.status === "available";
  const isReserved = table.status === "reserved";
  const hasActiveOrder = table.orders && table.orders.length > 0;
  const isOccupied = table.status === "occupied" || hasActiveOrder;
  const activeOrder = hasActiveOrder ? table.orders![0] : null;

  // Capacity suitability for reservation
  const isSuitable = table.capacity >= guestCount;

  // Identify ambiance zone
  const areaLower = (table.area || "").toLowerCase();
  const isOutdoor =
    areaLower.includes("garden") ||
    areaLower.includes("outdoor") ||
    areaLower.includes("patio") ||
    areaLower.includes("veranda") ||
    areaLower.includes("teras");
  const isMezzanine =
    areaLower.includes("lantai 2") ||
    areaLower.includes("mezzanine") ||
    areaLower.includes("vip") ||
    areaLower.includes("salon") ||
    areaLower.includes("president");

  const zoneBadge = isOutdoor
    ? { name: "Outdoor Jardin", icon: Trees, color: "text-emerald-700 bg-emerald-50 border-emerald-200" }
    : isMezzanine
    ? { name: "Mezzanine VIP", icon: Crown, color: "text-purple-700 bg-purple-50 border-purple-200" }
    : { name: "Grand Salle", icon: Sparkles, color: "text-amber-800 bg-amber-50 border-amber-200" };

  const ZoneIcon = zoneBadge.icon;

  // Determine chair counts for layout
  // Supported capacities: 2, 4, 6, 8, 10+
  const cap = table.capacity;
  let topChairs = 1;
  let bottomChairs = 1;
  let leftChairs = 0;
  let rightChairs = 0;

  if (cap <= 2) {
    topChairs = 1;
    bottomChairs = 1;
  } else if (cap <= 4) {
    topChairs = 2;
    bottomChairs = 2;
  } else if (cap <= 6) {
    topChairs = 3;
    bottomChairs = 3;
  } else if (cap <= 8) {
    topChairs = 3;
    bottomChairs = 3;
    leftChairs = 1;
    rightChairs = 1;
  } else {
    // 10 or more
    topChairs = 4;
    bottomChairs = 4;
    leftChairs = 1;
    rightChairs = 1;
  }

  // Chair styling helper
  const getChairStyle = (orientation: "top" | "bottom" | "left" | "right") => {
    let base = "transition-all duration-300 ";
    if (isSelected) {
      base += "bg-[#EA580C] border-[#EA580C] text-white shadow-sm shadow-[#EA580C]/40";
    } else if (isOccupied) {
      base += "bg-rose-100 border-rose-300 text-rose-700";
    } else if (isReserved) {
      base += "bg-purple-100 border-purple-300 text-purple-700";
    } else {
      base += "bg-emerald-100/90 border-emerald-400 text-emerald-800 group-hover:border-[#EA580C]";
    }

    if (orientation === "top") {
      return (
        <div key={`top-${Math.random()}`} className="flex flex-col items-center">
          <div className={`w-5 h-1.5 rounded-t-full border ${base}`} />
          <div className={`w-6 h-3 rounded-sm border -mt-px ${base}`} />
        </div>
      );
    }
    if (orientation === "bottom") {
      return (
        <div key={`bottom-${Math.random()}`} className="flex flex-col items-center">
          <div className={`w-6 h-3 rounded-sm border -mb-px ${base}`} />
          <div className={`w-5 h-1.5 rounded-b-full border ${base}`} />
        </div>
      );
    }
    if (orientation === "left") {
      return (
        <div key={`left-${Math.random()}`} className="flex items-center">
          <div className={`h-5 w-1.5 rounded-l-full border ${base}`} />
          <div className={`h-6 w-3 rounded-sm border -ml-px ${base}`} />
        </div>
      );
    }
    // right
    return (
      <div key={`right-${Math.random()}`} className="flex items-center">
        <div className={`h-6 w-3 rounded-sm border -mr-px ${base}`} />
        <div className={`h-5 w-1.5 rounded-r-full border ${base}`} />
      </div>
    );
  };

  // Card click behavior
  const handleCardClick = () => {
    if (mode === "reservation") {
      if (isAvailable && onSelect) {
        onSelect(table);
      }
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative rounded-3xl p-4 sm:p-5 border transition-all duration-300 flex flex-col justify-between group ${
        isSelected
          ? "bg-[#FFF9F5] border-[#EA580C] shadow-xl ring-2 ring-[#EA580C] scale-[1.02]"
          : isAvailable
          ? "bg-white border-[#E2E8F0] hover:border-[#EA580C]/50 hover:shadow-lg cursor-pointer"
          : isOccupied
          ? "bg-[#FFF8F8] border-rose-200/80 shadow-xs"
          : "bg-[#F8F5FF] border-purple-200/80 shadow-xs"
      }`}
    >
      {/* Top Header: Table Number & Badges */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-serif font-black text-sm shadow-xs ${
              isSelected
                ? "bg-[#EA580C] text-white"
                : isOccupied
                ? "bg-rose-600 text-white"
                : isReserved
                ? "bg-purple-600 text-white"
                : "bg-[#14281D] text-white"
            }`}
          >
            {table.tableNumber}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-sm text-[#18181B]">
                Meja {table.tableNumber}
              </span>
              {isSelected && (
                <span className="w-4 h-4 rounded-full bg-[#EA580C] text-white flex items-center justify-center text-[10px]">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
              <Users className="w-3 h-3 text-[#EA580C]" />
              <span>{table.capacity} Kursi</span>
            </div>
          </div>
        </div>

        {/* Status & Zone Badges */}
        <div className="flex flex-col items-end gap-1">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono uppercase tracking-wider ${
              isOccupied
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : isReserved
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {isOccupied ? "Terisi" : isReserved ? "Reserved" : "Tersedia"}
          </span>

          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${zoneBadge.color}`}>
            <ZoneIcon className="w-2.5 h-2.5" />
            <span>{zoneBadge.name}</span>
          </span>
        </div>
      </div>

      {/* Centerpiece: Architectural Floor Plan View with Table & Chairs */}
      <div className="my-2 py-3 px-2 rounded-2xl bg-gradient-to-b from-[#FBF9F5] to-[#F5EFE6] border border-[#EBE3D5] flex flex-col items-center justify-center min-h-[140px] shadow-inner relative overflow-hidden select-none">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none" />

        {/* Top Chairs Row */}
        <div className="flex items-center justify-center gap-2 mb-1 z-10">
          {Array.from({ length: topChairs }).map((_, idx) => (
            <React.Fragment key={`tc-${idx}`}>{getChairStyle("top")}</React.Fragment>
          ))}
        </div>

        {/* Middle Section: Left Chairs + Table Surface + Right Chairs */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 z-10">
          {leftChairs > 0 && (
            <div className="flex flex-col items-center justify-center gap-1">
              {Array.from({ length: leftChairs }).map((_, idx) => (
                <React.Fragment key={`lc-${idx}`}>{getChairStyle("left")}</React.Fragment>
              ))}
            </div>
          )}

          {/* Table Surface */}
          <div
            className={`transition-all duration-300 rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center shadow-md relative ${
              cap <= 2
                ? "w-28 h-20 rounded-full"
                : cap <= 4
                ? "w-32 h-20 sm:w-36 sm:h-22"
                : cap <= 6
                ? "w-40 h-20 sm:w-44 sm:h-22"
                : "w-48 h-22 sm:w-52 sm:h-24"
            } ${
              isSelected
                ? "bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] border-2 border-[#EA580C] shadow-lg shadow-[#EA580C]/20"
                : isOccupied
                ? "bg-gradient-to-br from-white to-rose-50 border-2 border-rose-300"
                : isReserved
                ? "bg-gradient-to-br from-white to-purple-50 border-2 border-purple-300"
                : "bg-gradient-to-br from-white to-[#FDFBF7] border-2 border-stone-300 group-hover:border-[#EA580C]"
            }`}
          >
            {/* Center Dish / Cutlery Motif */}
            <div className="flex items-center gap-1.5 opacity-60 mb-0.5">
              <UtensilsCrossed className="w-3 h-3 text-[#14281D]" />
              <Flame className="w-2.5 h-2.5 text-[#EA580C]" />
            </div>

            <span className="font-serif font-black text-xs sm:text-sm text-[#18181B] tracking-tight">
              {table.tableNumber}
            </span>

            <span className="text-[10px] font-mono text-[#64748B] font-semibold">
              {table.capacity} Kursi
            </span>

            {/* Glowing status dot in center */}
            <div
              className={`w-2 h-2 rounded-full absolute bottom-1.5 ${
                isOccupied
                  ? "bg-rose-500 animate-pulse"
                  : isReserved
                  ? "bg-purple-500"
                  : "bg-emerald-500"
              }`}
            />
          </div>

          {rightChairs > 0 && (
            <div className="flex flex-col items-center justify-center gap-1">
              {Array.from({ length: rightChairs }).map((_, idx) => (
                <React.Fragment key={`rc-${idx}`}>{getChairStyle("right")}</React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Chairs Row */}
        <div className="flex items-center justify-center gap-2 mt-1 z-10">
          {Array.from({ length: bottomChairs }).map((_, idx) => (
            <React.Fragment key={`bc-${idx}`}>{getChairStyle("bottom")}</React.Fragment>
          ))}
        </div>
      </div>

      {/* Area & Features Footnote */}
      <div className="mt-2 text-[11px] text-[#64748B] flex items-center justify-between border-t border-slate-100 pt-2">
        <span className="truncate pr-1 font-medium">{table.area}</span>
        <span className="font-mono text-[10px] shrink-0 text-stone-400">
          QR: {table.qrToken.replace("qr-table-", "T")}
        </span>
      </div>

      {/* Mode-Specific Interaction Area */}

      {/* 1. RESERVATION MODE */}
      {mode === "reservation" && (
        <div className="mt-3 pt-2">
          {!isSuitable && isAvailable && (
            <div className="mb-2 p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
              <span>Kapasitas meja ({table.capacity}) &lt; Tamu Anda ({guestCount} pax).</span>
            </div>
          )}

          {isAvailable ? (
            <button
              type="button"
              onClick={() => onSelect && onSelect(table)}
              className={`w-full py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#EA580C] text-white shadow-cta"
                  : "bg-white border border-[#EA580C] text-[#EA580C] hover:bg-[#EA580C] hover:text-white"
              }`}
            >
              {isSelected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Meja Ini Terpilih</span>
                </>
              ) : (
                <>
                  <span>Pilih Meja Ini</span>
                  <span className="font-bold">→</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full py-2 bg-stone-100 text-stone-500 rounded-full text-center text-xs font-semibold cursor-not-allowed border border-stone-200">
              {isOccupied ? "Meja Sedang Terisi" : "Sudah Direservasi"}
            </div>
          )}
        </div>
      )}

      {/* 2. POS / CASHIER MODE */}
      {mode === "pos" && (
        <div className="mt-3 pt-2">
          {activeOrder ? (
            <div className="space-y-2 bg-[#FDFBF7] p-2.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#18181B] truncate">{activeOrder.customerName}</span>
                <span className="font-serif font-black text-[#EA580C]">
                  {formatIDR(activeOrder.totalAmount)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#64748B]">
                <span>Status Pesanan:</span>
                <span className="font-bold uppercase font-mono text-[#18181B]">
                  {activeOrder.status}
                </span>
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => onPayOrder && onPayOrder(activeOrder)}
                  className="flex-1 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-full flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                >
                  <DollarSign className="w-3 h-3" />
                  <span>Bayar</span>
                </button>
                <button
                  type="button"
                  onClick={() => onMoveTable && onMoveTable(table)}
                  title="Pindah Meja"
                  className="p-1.5 bg-white hover:bg-slate-100 text-[#64748B] border border-slate-200/80 rounded-full cursor-pointer shadow-xs"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : isAvailable ? (
            <button
              type="button"
              onClick={() => onOpenBill && onOpenBill(table)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>+ Buka Bill Baru</span>
            </button>
          ) : (
            <div className="w-full py-1.5 bg-purple-50 text-purple-800 border border-purple-200 rounded-full text-center text-xs font-semibold">
              Meja Telah Direservasi
            </div>
          )}
        </div>
      )}
    </div>
  );
}

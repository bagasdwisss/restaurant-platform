"use client";

import React from "react";
import {
  Users,
  UtensilsCrossed,
  Flame,
  Wine,
  Sparkles,
  Check,
  CheckCircle2,
  DollarSign,
  ArrowRightLeft,
  AlertTriangle,
} from "lucide-react";
import { formatIDR } from "@/lib/utils";
import { TableItemData } from "./VisualTableCard";

interface FloorTableFurnitureProps {
  table: TableItemData;
  mode: "reservation" | "pos" | "admin";
  isSelected?: boolean;
  guestCount?: number;
  onSelect?: (table: TableItemData) => void;
  onOpenBill?: (table: TableItemData) => void;
  onPayOrder?: (order: any) => void;
  onMoveTable?: (table: TableItemData) => void;
}

export function FloorTableFurniture({
  table,
  mode,
  isSelected = false,
  guestCount = 2,
  onSelect,
  onOpenBill,
  onPayOrder,
  onMoveTable,
}: FloorTableFurnitureProps) {
  const isAvailable = table.status === "available";
  const isReserved = table.status === "reserved";
  const hasActiveOrder = table.orders && table.orders.length > 0;
  const isOccupied = table.status === "occupied" || hasActiveOrder;
  const activeOrder = hasActiveOrder ? table.orders![0] : null;

  const isSuitable = table.capacity >= guestCount;

  // Determine chair layout by capacity
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
    // 10+
    topChairs = 4;
    bottomChairs = 4;
    leftChairs = 1;
    rightChairs = 1;
  }

  // Chair styling directly on the floor
  const getChair = (orientation: "top" | "bottom" | "left" | "right", key: string) => {
    let colorClasses = "transition-all duration-300 ";
    if (isSelected) {
      colorClasses += "bg-[#EA580C] border-[#C2410C] text-white shadow-md shadow-[#EA580C]/40 ring-1 ring-white";
    } else if (isOccupied) {
      colorClasses += "bg-rose-700 border-rose-800 text-white shadow-xs";
    } else if (isReserved) {
      colorClasses += "bg-purple-700 border-purple-800 text-white shadow-xs";
    } else {
      colorClasses += "bg-[#14281D] border-[#1E3A2B] text-emerald-300 group-hover:bg-[#EA580C] group-hover:border-[#C2410C] shadow-xs";
    }

    if (orientation === "top") {
      return (
        <div key={key} className="flex flex-col items-center">
          <div className={`w-5 h-1.5 rounded-t-full border ${colorClasses}`} />
          <div className={`w-6 h-3 rounded-sm border -mt-px ${colorClasses}`} />
        </div>
      );
    }
    if (orientation === "bottom") {
      return (
        <div key={key} className="flex flex-col items-center">
          <div className={`w-6 h-3 rounded-sm border -mb-px ${colorClasses}`} />
          <div className={`w-5 h-1.5 rounded-b-full border ${colorClasses}`} />
        </div>
      );
    }
    if (orientation === "left") {
      return (
        <div key={key} className="flex items-center">
          <div className={`h-5 w-1.5 rounded-l-full border ${colorClasses}`} />
          <div className={`h-6 w-3 rounded-sm border -ml-px ${colorClasses}`} />
        </div>
      );
    }
    // right
    return (
      <div key={key} className="flex items-center">
        <div className={`h-6 w-3 rounded-sm border -mr-px ${colorClasses}`} />
        <div className={`h-5 w-1.5 rounded-r-full border ${colorClasses}`} />
      </div>
    );
  };

  const handleTableClick = () => {
    if (mode === "reservation") {
      if (isAvailable && onSelect) {
        onSelect(table);
      }
    } else if (mode === "pos") {
      if (isAvailable && onOpenBill) {
        onOpenBill(table);
      } else if (activeOrder && onPayOrder) {
        onPayOrder(activeOrder);
      }
    }
  };

  return (
    <div
      onClick={handleTableClick}
      className={`relative inline-flex flex-col items-center justify-center p-2.5 sm:p-4 select-none cursor-pointer group transition-all duration-300 ${
        isSelected
          ? "scale-105 z-20"
          : isAvailable
          ? "hover:scale-105 z-10"
          : "opacity-85 z-0 cursor-pointer"
      }`}
    >
      {/* Table Capacity & Floor Label */}
      <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-extrabold uppercase transition-colors shadow-xs ${
            isSelected
              ? "bg-[#EA580C] text-white ring-2 ring-white"
              : isOccupied
              ? "bg-rose-100 text-rose-800 border border-rose-300"
              : isReserved
              ? "bg-purple-100 text-purple-800 border border-purple-300"
              : "bg-emerald-100 text-emerald-800 border border-emerald-300 group-hover:bg-[#EA580C] group-hover:text-white"
          }`}
        >
          {isSelected ? "✓ Terpilih" : isOccupied ? "Terisi" : isReserved ? "Reserved" : "Tersedia"}
        </span>
      </div>

      {/* Top Chairs Row */}
      <div className="flex items-center justify-center gap-2 mb-1 z-10">
        {Array.from({ length: topChairs }).map((_, i) => getChair("top", `top-${i}`))}
      </div>

      {/* Center Section: Left Chairs + Table Surface + Right Chairs */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 z-10">
        {leftChairs > 0 && (
          <div className="flex flex-col items-center justify-center gap-1">
            {Array.from({ length: leftChairs }).map((_, i) => getChair("left", `left-${i}`))}
          </div>
        )}

        {/* The Architectural Table Surface (Directly on Floor) */}
        <div
          className={`transition-all duration-300 flex flex-col items-center justify-center relative p-3 text-center shadow-[0_12px_28px_rgba(0,0,0,0.15)] ${
            cap <= 2
              ? "w-24 h-24 sm:w-28 sm:h-28 rounded-full"
              : cap <= 4
              ? "w-28 h-24 sm:w-32 sm:h-28 rounded-2xl"
              : cap <= 6
              ? "w-36 h-24 sm:w-44 sm:h-28 rounded-2xl"
              : "w-44 h-26 sm:w-52 sm:h-30 rounded-2xl"
          } ${
            isSelected
              ? "bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#FED7AA] border-3 border-[#EA580C] ring-4 ring-[#EA580C]/50 shadow-[0_0_35px_rgba(234,88,12,0.45)]"
              : isOccupied
              ? "bg-gradient-to-br from-[#FFF5F5] to-[#FEE2E2] border-2 border-rose-400 shadow-rose-900/10"
              : isReserved
              ? "bg-gradient-to-br from-[#FAF5FF] to-[#F3E8FF] border-2 border-purple-400 shadow-purple-900/10"
              : "bg-gradient-to-br from-white via-[#FCFAF7] to-[#F3EFEA] border-2 border-[#D8D0C0] group-hover:border-[#EA580C] group-hover:shadow-lg"
          }`}
        >
          {/* Center Tabletop Icon Decor */}
          <div className="flex items-center gap-1 opacity-70 mb-0.5">
            <UtensilsCrossed className="w-3 h-3 text-[#14281D]" />
            <Flame className="w-2.5 h-2.5 text-[#EA580C]" />
          </div>

          {/* Table Number */}
          <span className="font-serif font-black text-sm sm:text-base text-[#18181B] tracking-tight">
            {table.tableNumber}
          </span>

          {/* Capacity */}
          <div className="flex items-center gap-1 text-[10px] font-mono text-[#64748B] font-bold">
            <Users className="w-2.5 h-2.5 text-[#EA580C]" />
            <span>{table.capacity} Pax</span>
          </div>

          {/* Center Live Dot */}
          <div
            className={`w-2 h-2 rounded-full absolute bottom-1.5 ${
              isOccupied
                ? "bg-rose-500 animate-pulse"
                : isReserved
                ? "bg-purple-500"
                : "bg-emerald-500"
            }`}
          />

          {/* POS Mode: Floating Bill Chip if occupied */}
          {mode === "pos" && activeOrder && (
            <div className="absolute -top-3 right-0 bg-[#EA580C] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full shadow-md">
              {formatIDR(activeOrder.totalAmount)}
            </div>
          )}

          {/* Reservation Mode: Selected Indicator */}
          {mode === "reservation" && isSelected && (
            <div className="absolute -top-3 -right-2 bg-[#EA580C] text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-bounce">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
        </div>

        {rightChairs > 0 && (
          <div className="flex flex-col items-center justify-center gap-1">
            {Array.from({ length: rightChairs }).map((_, i) => getChair("right", `right-${i}`))}
          </div>
        )}
      </div>

      {/* Bottom Chairs Row */}
      <div className="flex items-center justify-center gap-2 mt-1 z-10">
        {Array.from({ length: bottomChairs }).map((_, i) => getChair("bottom", `bottom-${i}`))}
      </div>

      {/* Floating Floor Label: Area & Capacity Warning */}
      <div className="mt-1.5 text-center">
        <span className="text-[11px] font-medium text-stone-600 block truncate max-w-[140px]">
          {table.area}
        </span>

        {mode === "reservation" && !isSuitable && isAvailable && (
          <span className="text-[9px] text-[#EA580C] font-semibold bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 inline-block mt-0.5">
            &lt; {guestCount} tamu
          </span>
        )}
      </div>

      {/* Quick Action Button for POS Mode */}
      {mode === "pos" && (
        <div className="mt-1.5 flex items-center gap-1">
          {activeOrder ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPayOrder && onPayOrder(activeOrder);
                }}
                className="px-2.5 py-1 bg-[#EA580C] hover:bg-[#C2410C] text-white text-[10px] font-bold rounded-full shadow-xs cursor-pointer flex items-center gap-0.5"
              >
                <DollarSign className="w-2.5 h-2.5" />
                <span>Bayar</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveTable && onMoveTable(table);
                }}
                title="Pindah Meja"
                className="p-1 bg-white hover:bg-slate-100 text-[#64748B] border border-stone-200 rounded-full cursor-pointer shadow-xs"
              >
                <ArrowRightLeft className="w-2.5 h-2.5" />
              </button>
            </>
          ) : isAvailable ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenBill && onOpenBill(table);
              }}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-full shadow-xs cursor-pointer"
            >
              + Buka Bill
            </button>
          ) : (
            <span className="text-[10px] text-purple-700 font-semibold px-2 py-0.5 bg-purple-50 rounded-full border border-purple-200">
              Reserved
            </span>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { BellRing, RefreshCw, Footprints } from "lucide-react";

interface TableHeroHeaderProps {
  table: {
    tableNumber: string;
    area: string;
    capacity: number;
  };
  waiterCallStatus: "idle" | "pending" | "in_progress";
  callingWaiter: boolean;
  onCallWaiter: () => void;
}

export function TableHeroHeader({
  table,
  waiterCallStatus,
  callingWaiter,
  onCallWaiter,
}: TableHeroHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 px-3 sm:px-6 py-2.5 sm:py-3.5 backdrop-blur-md bg-white/95 shadow-2xs">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-serif font-black text-sm sm:text-base shadow-sm shrink-0 hover:scale-105 transition-transform"
          >
            S
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-serif font-bold text-[#18181B] text-sm sm:text-base leading-tight">
                SAVORIA
              </h1>
              <span className="px-2 py-0.5 bg-[#EA580C]/10 text-[#EA580C] text-[10px] font-bold rounded-full font-mono uppercase truncate max-w-[90px] sm:max-w-none">
                {table.tableNumber}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#64748B] truncate">
              Area: {table.area} • {table.capacity} Tamu
            </p>
          </div>
        </div>

        {/* Waiter Call Button: Changes dynamically to "Sedang Dihampiri", reverts to "Panggil Pelayan" when resolved */}
        {waiterCallStatus === "in_progress" ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-teal-600 text-white shadow-md animate-pulse ring-2 ring-teal-300 shrink-0">
            <Footprints className="w-3.5 h-3.5 animate-bounce" />
            <span>Sedang Dihampiri</span>
          </div>
        ) : waiterCallStatus === "pending" || callingWaiter ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-amber-500 text-white shadow-xs shrink-0">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Menunggu Respon...</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onCallWaiter}
            disabled={callingWaiter}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold transition-all shadow-sm cursor-pointer shrink-0 bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 active:scale-95 disabled:opacity-60"
          >
            <BellRing className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Panggil Pelayan</span>
          </button>
        )}
      </div>
    </header>
  );
}

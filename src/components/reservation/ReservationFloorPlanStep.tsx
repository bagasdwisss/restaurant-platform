"use client";

import React from "react";
import { MapPin, Users, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { TableItem } from "./types";
import { VisualFloorPlan } from "@/components/tables/VisualFloorPlan";
import { isTableCapacityEligible } from "@/components/tables/FloorTableFurniture";

interface ReservationFloorPlanStepProps {
  tables: TableItem[];
  selectedTable: TableItem | null;
  guestCount: number;
  onSelectTable: (table: TableItem) => void;
  onConfirmTableAndAdvance: (table: TableItem) => void;
  onPrev: () => void;
}

export function ReservationFloorPlanStep({
  tables,
  selectedTable,
  guestCount,
  onSelectTable,
  onConfirmTableAndAdvance,
  onPrev,
}: ReservationFloorPlanStepProps) {
  const isSelectedEligible = selectedTable
    ? isTableCapacityEligible(selectedTable.capacity, guestCount).eligible
    : false;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-28">
      {/* Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#EA580C] bg-[#EA580C]/10 px-2.5 py-0.5 rounded-full inline-block">
                Langkah 3 dari 5
              </span>
              <span className="text-[10px] font-mono font-bold text-[#14281D] bg-[#14281D]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{guestCount} Tamu Dipilih</span>
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
              Denah Lantai Restoran Terpadu
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Seluruh meja jamuan berada dalam satu lantai restoran mewah. Meja yang tidak sesuai kapasitas ({guestCount} orang) otomatis dinonaktifkan.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={onPrev}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-[#64748B] hover:text-[#18181B] rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>
            {selectedTable && isSelectedEligible && (
              <button
                type="button"
                onClick={() => onConfirmTableAndAdvance(selectedTable)}
                className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#EA580C]/25 cursor-pointer"
              >
                <span>Lanjut Pembayaran</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Visual Floor Plan */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-4 sm:p-6 shadow-xs overflow-hidden">
        <VisualFloorPlan
          tables={tables as any}
          mode="reservation"
          selectedTable={selectedTable as any}
          onSelectTable={(tbl) => onSelectTable(tbl as TableItem)}
          onConfirmTable={(tbl) => onConfirmTableAndAdvance(tbl as TableItem)}
          guestCount={guestCount}
        />
      </div>

      {/* Floating Bottom Table Confirmation Dock */}
      {selectedTable && isSelectedEligible && (
        <div className="fixed bottom-4 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none">
          <div className="max-w-2xl mx-auto bg-[#18181B]/95 backdrop-blur-md text-white rounded-3xl p-4 shadow-2xl flex items-center justify-between pointer-events-auto border border-white/10 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#EA580C] text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-300 font-sans truncate">
                  Meja Terpilih: <strong className="text-white font-serif">{selectedTable.tableNumber}</strong> ({selectedTable.area})
                </p>
                <p className="text-[11px] text-emerald-400 font-medium">
                  Kapasitas {selectedTable.capacity} Kursi • Cocok untuk {guestCount} Tamu
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onConfirmTableAndAdvance(selectedTable)}
              className="px-5 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#EA580C]/30 shrink-0 cursor-pointer active:scale-95 transition-all"
            >
              <span>Lanjut Pembayaran</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

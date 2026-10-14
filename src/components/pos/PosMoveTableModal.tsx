"use client";

import React from "react";
import { ArrowRightLeft, X } from "lucide-react";

interface PosMoveTableModalProps {
  show: boolean;
  moveFromTable: any;
  moveToTableId: string;
  onChangeMoveToTableId: (id: string) => void;
  availableTables: any[];
  isMovingTable?: boolean;
  onExecuteMoveTable: () => void;
  onClose: () => void;
}

export function PosMoveTableModal({
  show,
  moveFromTable,
  moveToTableId,
  onChangeMoveToTableId,
  availableTables,
  isMovingTable = false,
  onExecuteMoveTable,
  onClose,
}: PosMoveTableModalProps) {
  if (!show || !moveFromTable) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-[#EA580C]" />
            <h3 className="font-serif font-bold text-[#18181B] text-base">Pindah Meja (Move Table)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 text-[#64748B] hover:text-[#18181B] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#64748B]">
          Pindahkan seluruh tagihan dari <strong>{moveFromTable.tableNumber}</strong> ke meja kosong yang baru:
        </p>

        <select
          value={moveToTableId}
          onChange={(e) => onChangeMoveToTableId(e.target.value)}
          className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl bg-white font-medium focus:ring-2 focus:ring-[#EA580C] cursor-pointer"
        >
          <option value="">Pilih Meja Tujuan...</option>
          {availableTables.map((t) => (
            <option key={t.id} value={t.id}>
              {t.tableNumber} ({t.area} - Kapasitas {t.capacity})
            </option>
          ))}
        </select>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#18181B] rounded-full text-xs font-bold cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onExecuteMoveTable}
            disabled={!moveToTableId || isMovingTable}
            className="flex-1 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-slate-300 text-white rounded-full text-xs font-bold cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-all"
          >
            {isMovingTable ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memindahkan Meja...</span>
              </>
            ) : (
              <span>Pindahkan</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

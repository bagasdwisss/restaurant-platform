"use client";

import React from "react";
import { Coffee, DollarSign, X, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { formatIDR } from "@/lib/utils";

interface OpenShiftModalProps {
  show: boolean;
  cashierNameInput: string;
  onChangeCashierName: (val: string) => void;
  startCashInput: string;
  onChangeStartCash: (val: string) => void;
  isOpeningShift?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function OpenShiftModal({
  show,
  cashierNameInput,
  onChangeCashierName,
  startCashInput,
  onChangeStartCash,
  isOpeningShift = false,
  onSubmit,
  onClose,
}: OpenShiftModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-[#EA580C]" />
            <h3 className="font-serif font-bold text-[#18181B] text-base">Buka Shift Kasir Baru</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isOpeningShift}
            className="p-1 rounded-full hover:bg-slate-100 text-[#64748B] hover:text-[#18181B] cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#18181B] block mb-1">
              Nama Petugas Kasir
            </label>
            <input
              type="text"
              required
              disabled={isOpeningShift}
              value={cashierNameInput}
              onChange={(e) => onChangeCashierName(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl bg-white focus:ring-2 focus:ring-[#EA580C] disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#18181B] block mb-1">
              Modal Kas Awal di Laci (Starting Cash)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B]">
                Rp
              </span>
              <input
                type="number"
                required
                min="0"
                step="1000"
                disabled={isOpeningShift}
                value={startCashInput}
                onChange={(e) => onChangeStartCash(e.target.value)}
                className="w-full text-xs pl-10 pr-3 py-3 border border-slate-200/80 rounded-2xl bg-white font-mono font-bold focus:ring-2 focus:ring-[#EA580C] disabled:bg-slate-100"
              />
            </div>
            <p className="text-[10px] text-[#64748B] mt-1">
              Uang tunai fisik pecahan kecil di laci kasir untuk uang kembalian pelanggan.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isOpeningShift}
              className="w-full py-3 bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-slate-300 text-white rounded-full text-xs font-bold shadow-md shadow-[#EA580C]/25 cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              {isOpeningShift ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Membuka Sesi Shift...</span>
                </>
              ) : (
                <span>Mulai Sesi Shift Kasir</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CloseShiftModalProps {
  show: boolean;
  currentShift: any;
  endCashActualInput: string;
  onChangeEndCashActual: (val: string) => void;
  closeShiftVariance: number | null;
  isClosingShift?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function CloseShiftModal({
  show,
  currentShift,
  endCashActualInput,
  onChangeEndCashActual,
  closeShiftVariance,
  isClosingShift = false,
  onSubmit,
  onClose,
}: CloseShiftModalProps) {
  if (!show || !currentShift) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-rose-600" />
            <h3 className="font-serif font-bold text-[#18181B] text-base">Tutup Shift & Rekonsiliasi</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isClosingShift}
            className="p-1 rounded-full hover:bg-slate-100 text-[#64748B] hover:text-[#18181B] cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5">
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Kasir:</span>
              <span className="font-bold text-[#18181B]">{currentShift.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Kas Awal (Modal):</span>
              <span className="font-mono text-[#18181B]">{formatIDR(currentShift.startCash)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Penjualan Tunai Bersih:</span>
              <span className="font-mono text-[#18181B]">
                {formatIDR(currentShift.netCashSales ?? currentShift.totalCashReceived ?? 0)}
              </span>
            </div>
            <div className="flex justify-between font-bold pt-1 border-t border-slate-200">
              <span className="text-[#18181B]">Ekspektasi Kas Laci:</span>
              <span className="font-mono text-[#EA580C]">
                {formatIDR(
                  currentShift.expectedCash ??
                    currentShift.startCash + (currentShift.netCashSales ?? 0)
                )}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#18181B] block mb-1">
              Kas Aktual Fisik di Laci (End Cash Actual)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B]">
                Rp
              </span>
              <input
                type="number"
                required
                min="0"
                step="1000"
                disabled={isClosingShift}
                value={endCashActualInput}
                onChange={(e) => onChangeEndCashActual(e.target.value)}
                placeholder="0"
                className="w-full text-xs pl-10 pr-3 py-3 border border-slate-200/80 rounded-2xl bg-white font-mono font-bold focus:ring-2 focus:ring-[#EA580C] disabled:bg-slate-100"
              />
            </div>
          </div>

          {closeShiftVariance !== null && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-center justify-between ${
                closeShiftVariance === 0
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : closeShiftVariance > 0
                  ? "bg-blue-50 text-blue-800 border border-blue-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              <span>Selisih (Variance):</span>
              <span className="font-mono font-bold">
                {closeShiftVariance === 0
                  ? "Seimbang (Rp 0)"
                  : closeShiftVariance > 0
                  ? `+${formatIDR(closeShiftVariance)} (Surplus)`
                  : `${formatIDR(closeShiftVariance)} (Defisit)`}
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isClosingShift}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-[#18181B] rounded-full text-xs font-bold cursor-pointer transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isClosingShift}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white rounded-full text-xs font-bold shadow-md shadow-rose-600/25 cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              {isClosingShift ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menutup Shift...</span>
                </>
              ) : (
                <span>Tutup Shift Sekarang</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Ban, X, ShieldAlert } from "lucide-react";

interface PosVoidModalProps {
  show: boolean;
  supervisorPin: string;
  onChangePin: (pin: string) => void;
  voidReason: string;
  onChangeReason: (reason: string) => void;
  isProcessingVoid?: boolean;
  onExecuteVoid: () => void;
  onClose: () => void;
}

export function PosVoidModal({
  show,
  supervisorPin,
  onChangePin,
  voidReason,
  onChangeReason,
  isProcessingVoid = false,
  onExecuteVoid,
  onClose,
}: PosVoidModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Ban className="w-5 h-5 text-rose-600" />
            <h3 className="font-serif font-bold text-[#18181B] text-base">Otorisasi Pembatalan (Void)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 text-[#64748B] hover:text-[#18181B] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p>
            Void memerlukan otorisasi Supervisor PIN untuk mencegah kecurangan dan memverifikasi audit log.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-[#18181B] block mb-1">
              Supervisor PIN (Default: 123456)
            </label>
            <input
              type="password"
              placeholder="******"
              value={supervisorPin}
              onChange={(e) => onChangePin(e.target.value)}
              className="w-full text-center tracking-widest text-base font-bold p-3 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#18181B] block mb-1">
              Alasan Pembatalan (Void Reason)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Tamu membatalkan pesanan, salah input meja..."
              value={voidReason}
              onChange={(e) => onChangeReason(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>
        </div>

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
            onClick={onExecuteVoid}
            disabled={!supervisorPin || !voidReason || isProcessingVoid}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white rounded-full text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-all"
          >
            {isProcessingVoid ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses Void...</span>
              </>
            ) : (
              <span>Eksekusi Void</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

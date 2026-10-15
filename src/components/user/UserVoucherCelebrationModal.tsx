"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Gift, Check, Copy, CheckCircle2, ArrowRight } from "lucide-react";
import { formatIDR } from "@/lib/utils";
import { useToast } from "@/lib/toast-context";
import { Modal } from "@/components/ui/Modal";

interface UserVoucherCelebrationModalProps {
  voucher: any;
  onClose: () => void;
}

export function UserVoucherCelebrationModal({
  voucher,
  onClose,
}: UserVoucherCelebrationModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [copiedRewardCode, setCopiedRewardCode] = useState(false);

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedRewardCode(true);
    toast.success(`Kode voucher ${code} berhasil disalin!`, "Disalin ke Clipboard");
    setTimeout(() => setCopiedRewardCode(false), 3000);
  };

  return (
    <Modal isOpen={Boolean(voucher)} onClose={onClose}>
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full space-y-5 text-center shadow-2xl relative animate-in fade-in zoom-in-95 my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-full bg-amber-50 text-[#EA580C] border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
          <Gift className="w-8 h-8 animate-bounce" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block border border-emerald-200">
            Penukaran Poin Berhasil
          </span>
          <h3 className="font-serif font-bold text-2xl text-[#18181B]">
            Selamat! Voucher Anda Aktif
          </h3>
          <p className="text-xs text-[#64748B]">
            {voucher.title || "Voucher Hadiah Savoria Club"}
          </p>
        </div>

        {/* Voucher Code Box */}
        <div className="p-4 bg-[#FDFBF7] rounded-2xl border-2 border-dashed border-[#EA580C]/40 space-y-2">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">
            Kode Voucher Eksklusif Anda:
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-xl sm:text-2xl font-black text-[#EA580C] tracking-wider select-all">
              {voucher.code}
            </span>
            <button
              type="button"
              onClick={() => handleCopyCode(voucher.code)}
              className="p-2 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 text-[#18181B] transition-all cursor-pointer shadow-xs"
              title="Salin Kode Voucher"
            >
              {copiedRewardCode ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Nilai Potongan: <strong className="text-emerald-700">{formatIDR(voucher.discountValue)}</strong>
          </div>
        </div>

        <div className="text-xs text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5 text-slate-600">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Siap digunakan langsung saat memesan meja atau bayar di kasir</span>
          </div>
          <div className="text-[11px] text-slate-500">
            • Masa berlaku voucher: 30 hari kalender sejak penukaran
          </div>
          <div className="text-[11px] text-slate-500">
            • Masukkan kode voucher di halaman checkout atau tunjukkan ke kasir
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => handleCopyCode(voucher.code)}
            className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-[#18181B] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedRewardCode ? "Tersalin!" : "Salin Kode"}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/reservation");
            }}
            className="w-full py-3 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs cursor-pointer shadow-md shadow-[#EA580C]/25 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Pakai Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Modal>
  );
}

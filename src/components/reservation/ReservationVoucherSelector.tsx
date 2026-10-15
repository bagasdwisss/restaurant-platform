"use client";

import React, { useState, useEffect } from "react";
import { Ticket, XCircle } from "lucide-react";
import { formatIDR } from "@/lib/utils";

interface ReservationVoucherSelectorProps {
  subtotal: number;
  appliedVoucher: any;
  voucherDiscount: number;
  onApplyVoucher: (voucher: any, discountAmount: number) => void;
  onRemoveVoucher: () => void;
}

export function ReservationVoucherSelector({
  subtotal,
  appliedVoucher,
  voucherDiscount,
  onApplyVoucher,
  onRemoveVoucher,
}: ReservationVoucherSelectorProps) {
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState("");
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/v1/customer/vouchers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setAvailableVouchers(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleApplyVoucherCode = async (codeToApply: string) => {
    if (!codeToApply.trim()) return;
    setIsCheckingVoucher(true);
    setVoucherError("");

    try {
      const res = await fetch("/api/v1/customer/vouchers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeToApply.trim(),
          subtotal,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setVoucherError(data.message || "Gagal menerapkan voucher.");
        onRemoveVoucher();
      } else {
        const v = data.data.voucher || data.data;
        const discount = data.data.discountAmount || 0;
        onApplyVoucher(v, discount);
        setVoucherCodeInput(codeToApply.toUpperCase());
        setVoucherError("");
      }
    } catch (err: any) {
      setVoucherError(err.message || "Gagal memverifikasi voucher.");
    } finally {
      setIsCheckingVoucher(false);
    }
  };

  return (
    <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-2xl space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Ticket className="w-3.5 h-3.5 text-[#EA580C]" /> Punya Kode Voucher?
        </span>
        {appliedVoucher && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            Terpasang
          </span>
        )}
      </div>

      {!appliedVoucher ? (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Masukkan Kode Voucher (cth: PROMO10)"
            value={voucherCodeInput}
            onChange={(e) => {
              setVoucherCodeInput(e.target.value.toUpperCase());
              setVoucherError("");
            }}
            className="flex-1 text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl uppercase font-mono font-bold focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleApplyVoucherCode(voucherCodeInput)}
            disabled={isCheckingVoucher || !voucherCodeInput.trim()}
            className="px-3.5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl disabled:opacity-50 transition-all shrink-0 cursor-pointer"
          >
            {isCheckingVoucher ? "Cek..." : "Terapkan"}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
          <div>
            <span className="font-mono font-bold text-emerald-900 block">
              {appliedVoucher.code} ({appliedVoucher.name})
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">
              Hemat {formatIDR(voucherDiscount)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onRemoveVoucher();
              setVoucherCodeInput("");
            }}
            className="text-[11px] text-rose-600 hover:text-rose-800 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
          >
            Hapus
          </button>
        </div>
      )}

      {/* Available Vouchers List for Easy 1-Click Selection */}
      {availableVouchers.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-amber-200/60 mt-2">
          <p className="text-[11px] font-bold text-amber-900 flex items-center justify-between">
            <span>Voucher Tersedia ({availableVouchers.length}):</span>
            <span className="text-[10px] font-normal text-amber-700">Klik untuk gunakan langsung</span>
          </p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
            {availableVouchers.map((v) => {
              const isThisApplied = appliedVoucher?.code === v.code;
              const quotaLeft = Math.max(0, v.maxUsage - v.usedCount);
              const discountText =
                v.discountType === "percentage"
                  ? `Diskon ${v.discountValue}%${v.maxDiscount ? ` (Maks ${formatIDR(v.maxDiscount)})` : ""}`
                  : `Potongan ${formatIDR(v.discountValue)}`;

              return (
                <div
                  key={v.id || v.code}
                  className={`p-2 rounded-xl border transition-all text-xs flex items-center justify-between gap-2 ${
                    isThisApplied
                      ? "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400"
                      : "bg-white border-amber-100/90 hover:border-amber-300 shadow-2xs"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-extrabold text-[11px] text-slate-800 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200">
                        {v.code}
                      </span>
                      <span className="font-bold text-[11px] text-slate-900 truncate">
                        {v.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5 flex flex-wrap items-center gap-x-2">
                      <span className="font-semibold text-emerald-700">{discountText}</span>
                      {v.minSpend > 0 && <span>Min. {formatIDR(v.minSpend)}</span>}
                      <span className="text-amber-800 font-medium">Sisa {quotaLeft} kuota</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isThisApplied) {
                        onRemoveVoucher();
                        setVoucherCodeInput("");
                      } else {
                        handleApplyVoucherCode(v.code);
                      }
                    }}
                    disabled={isCheckingVoucher}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shrink-0 cursor-pointer transition-colors ${
                      isThisApplied
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-amber-600 text-white hover:bg-amber-700 shadow-xs"
                    }`}
                  >
                    {isThisApplied ? "Dipakai ✓" : "Gunakan"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {voucherError && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-1.5 text-[11px] text-rose-700 font-medium leading-tight">
          <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
          <span>{voucherError}</span>
        </div>
      )}
    </div>
  );
}

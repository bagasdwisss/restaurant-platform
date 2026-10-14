"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  QrCode,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { formatIDR } from "@/lib/utils";

interface PosPaymentModalProps {
  orderToPay: any;
  payMethod: "cash" | "qris" | "debit";
  onChangePayMethod: (method: "cash" | "qris" | "debit") => void;
  cashPaidInput: number;
  onChangeCashPaid: (amount: number) => void;
  onExecutePayment: () => void;
  onClose: () => void;
}

export function PosPaymentModal({
  orderToPay,
  payMethod,
  onChangePayMethod,
  cashPaidInput,
  onChangeCashPaid,
  onExecutePayment,
  onClose,
}: PosPaymentModalProps) {
  if (!orderToPay) return null;

  const total = orderToPay.totalAmount || 0;
  const change = Math.max(0, cashPaidInput - total);
  const isCashInsufficient = payMethod === "cash" && cashPaidInput < total;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-fadeIn">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#EA580C] bg-[#EA580C]/10 px-2 py-0.5 rounded-full">
              Penyelesaian Tagihan POS
            </span>
            <h3 className="font-serif font-bold text-lg text-[#18181B] mt-1">
              Order {orderToPay.orderNumber}
            </h3>
            <p className="text-xs text-[#64748B]">
              {orderToPay.table?.tableNumber || "Takeaway"} • {orderToPay.customerName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-[#64748B] hover:text-[#18181B] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Display */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-1">
          <span className="text-xs text-[#64748B] font-medium">Total Yang Harus Dibayar</span>
          <p className="font-mono font-bold text-2xl sm:text-3xl text-[#EA580C]">
            {formatIDR(total)}
          </p>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#18181B] block">Metode Pembayaran</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "cash", label: "Tunai (Cash)", icon: DollarSign },
              { id: "qris", label: "QRIS Dinamis", icon: QrCode },
              { id: "debit", label: "Kartu Debit/Kredit", icon: CreditCard },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = payMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChangePayMethod(m.id as any)}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#EA580C]/10 border-[#EA580C] text-[#EA580C] font-bold shadow-xs"
                      : "bg-white border-slate-200/80 text-[#64748B] hover:border-slate-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] leading-tight">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cash Calculations */}
        {payMethod === "cash" && (
          <div className="space-y-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[#18181B]">
                <span>Uang Diterima</span>
                <span className="font-mono text-[#EA580C]">{formatIDR(cashPaidInput)}</span>
              </div>
              <input
                type="number"
                value={cashPaidInput || ""}
                onChange={(e) => onChangeCashPaid(Number(e.target.value))}
                placeholder="0"
                className="w-full text-base font-mono font-bold p-2.5 bg-white border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
              />
            </div>

            {/* Quick cash denomination buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => onChangeCashPaid(total)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold hover:bg-slate-100 cursor-pointer"
              >
                Uang Pas
              </button>
              {[10000, 20000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => onChangeCashPaid((cashPaidInput || 0) + amt)}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium hover:bg-slate-100 cursor-pointer"
                >
                  +{formatIDR(amt)}
                </button>
              ))}
            </div>

            {/* Change display */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
              <span className="font-bold text-[#18181B]">Kembalian:</span>
              <span
                className={`font-mono text-base font-bold ${
                  isCashInsufficient ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                {isCashInsufficient ? "Uang Kurang" : formatIDR(change)}
              </span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-[#18181B] rounded-full text-xs font-bold cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onExecutePayment}
            disabled={isCashInsufficient}
            className="flex-1 py-3 bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-slate-300 text-white rounded-full text-xs font-bold shadow-md shadow-[#EA580C]/25 cursor-pointer disabled:cursor-not-allowed"
          >
            Selesaikan Transaksi
          </button>
        </div>
      </div>
    </div>
  );
}

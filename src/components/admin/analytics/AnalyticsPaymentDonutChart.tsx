"use client";

import React from "react";
import { PieChart as PieIcon } from "lucide-react";
import { formatIDR } from "@/lib/utils";

interface AnalyticsPaymentDonutChartProps {
  cash: number;
  qris: number;
  debit: number;
}

export function AnalyticsPaymentDonutChart({
  cash,
  qris,
  debit,
}: AnalyticsPaymentDonutChartProps) {
  const totalPayment = (cash + qris + debit) || 1;
  const cashPct = Math.round((cash / totalPayment) * 100);
  const qrisPct = Math.round((qris / totalPayment) * 100);
  const debitPct = 100 - cashPct - qrisPct;

  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const cashStroke = (cashPct / 100) * circumference;
  const qrisStroke = (qrisPct / 100) * circumference;
  const debitStroke = (debitPct / 100) * circumference;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-serif font-bold text-base text-[#18181B] flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              <span>Distribusi Pembayaran</span>
            </h3>
            <p className="text-xs text-[#64748B]">Metode transaksi kasir</p>
          </div>
        </div>

        {/* Circular Donut Diagram */}
        <div className="relative py-4 flex items-center justify-center">
          <svg width="170" height="170" viewBox="0 0 170 170" className="-rotate-90">
            <circle
              cx="85"
              cy="85"
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth="20"
            />
            {/* Cash Segment (Emerald) */}
            <circle
              cx="85"
              cy="85"
              r={radius}
              fill="transparent"
              stroke="#10B981"
              strokeWidth="20"
              strokeDasharray={`${cashStroke} ${circumference}`}
              strokeDashoffset="0"
              className="transition-all duration-500"
            />
            {/* QRIS Segment (Orange) */}
            <circle
              cx="85"
              cy="85"
              r={radius}
              fill="transparent"
              stroke="#EA580C"
              strokeWidth="20"
              strokeDasharray={`${qrisStroke} ${circumference}`}
              strokeDashoffset={`-${cashStroke}`}
              className="transition-all duration-500"
            />
            {/* Debit Segment (Blue) */}
            <circle
              cx="85"
              cy="85"
              r={radius}
              fill="transparent"
              stroke="#3B82F6"
              strokeWidth="20"
              strokeDasharray={`${debitStroke} ${circumference}`}
              strokeDashoffset={`-${cashStroke + qrisStroke}`}
              className="transition-all duration-500"
            />
          </svg>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[10px] uppercase font-mono font-bold text-[#64748B]">
              Total Masuk
            </span>
            <span className="font-serif font-bold text-sm text-[#18181B] max-w-[100px] truncate">
              {formatIDR(totalPayment)}
            </span>
          </div>
        </div>

        {/* Payment Breakdown Cards */}
        <div className="space-y-2 pt-2">
          <div className="p-2.5 rounded-2xl bg-[#FDFBF7] border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                Rp
              </div>
              <div>
                <span className="font-bold text-[#18181B] block leading-tight">Tunai (Cash)</span>
                <span className="text-[10px] text-[#64748B]">{cashPct}% Total</span>
              </div>
            </div>
            <span className="font-mono font-bold text-[#18181B]">{formatIDR(cash)}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#FDFBF7] border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold text-[10px]">
                QR
              </div>
              <div>
                <span className="font-bold text-[#18181B] block leading-tight">QRIS Dinamis</span>
                <span className="text-[10px] text-[#64748B]">{qrisPct}% Total</span>
              </div>
            </div>
            <span className="font-mono font-bold text-[#18181B]">{formatIDR(qris)}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#FDFBF7] border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                EDC
              </div>
              <div>
                <span className="font-bold text-[#18181B] block leading-tight">Kartu Debit/Kredit</span>
                <span className="text-[10px] text-[#64748B]">{debitPct}% Total</span>
              </div>
            </div>
            <span className="font-mono font-bold text-[#18181B]">{formatIDR(debit)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

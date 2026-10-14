"use client";

import React from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import { formatIDR } from "@/lib/utils";

interface AnalyticsTabProps {
  salesData: any;
  onRefresh: () => void;
  onExportExcel: () => void;
}

export function AnalyticsTab({ salesData, onRefresh, onExportExcel }: AnalyticsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#18181B]">
            Dashboard Analitik Finansial
          </h2>
          <p className="text-xs text-[#64748B]">
            Performa pendapatan, estimasi laba kotor, dan rekapitulasi transaksi SAVORIA.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-white border border-slate-200/80 hover:bg-slate-50 rounded-full text-xs font-semibold text-[#64748B] hover:text-[#18181B] flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
          <button
            onClick={onExportExcel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Metric KPI Cards */}
      {salesData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
              <span>Total Pendapatan (Gross)</span>
              <div className="w-8 h-8 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-2xl font-bold text-[#18181B]">
              {formatIDR(salesData.summary.totalRevenue)}
            </p>
            <p className="text-[11px] text-emerald-700 font-semibold">
              Termasuk PB1 & Service Charge
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
              <span>Estimasi Gross Profit</span>
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-2xl font-bold text-emerald-700">
              {formatIDR(salesData.summary.grossProfit)}
            </p>
            <p className="text-[11px] text-[#64748B]">
              Food Cost ~35%: {formatIDR(salesData.summary.estimatedCOGS)}
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
              <span>Transaksi Berhasil</span>
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-2xl font-bold text-[#18181B]">
              {salesData.summary.totalOrdersCount} Pesanan
            </p>
            <p className="text-[11px] text-[#64748B]">Pesanan berstatus lunas</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
              <span>Rata-rata Nilai Pesanan</span>
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-2xl font-bold text-[#18181B]">
              {formatIDR(salesData.summary.avgOrderValue)}
            </p>
            <p className="text-[11px] text-[#64748B]">Average Basket Size</p>
          </div>
        </div>
      )}

      {/* Payment Method Breakdown & Top Selling Items */}
      {salesData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-[#18181B]">
              Rekapitulasi Pembayaran
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    Rp
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#18181B]">Tunai (Cash)</p>
                    <p className="text-[10px] text-[#64748B]">Uang fisik di kasir</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs text-[#18181B]">
                  {formatIDR(salesData.paymentBreakdown.cash)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold text-xs">
                    QR
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#18181B]">QRIS Dinamis</p>
                    <p className="text-[10px] text-[#64748B]">E-wallet & Mobile Banking</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs text-[#18181B]">
                  {formatIDR(salesData.paymentBreakdown.qris)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    EDC
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#18181B]">Kartu Debit/Kredit</p>
                    <p className="text-[10px] text-[#64748B]">Mesin EDC kasir</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs text-[#18181B]">
                  {formatIDR(salesData.paymentBreakdown.debit)}
                </span>
              </div>
            </div>
          </div>

          {/* Top Selling Items (Ranking) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#18181B]">
                Menu Terlaris (Top Selling Items)
              </h3>
              <span className="text-xs text-[#64748B]">Berdasarkan porsi terjual</span>
            </div>

            <div className="space-y-2.5">
              {!salesData.topSellingItems || salesData.topSellingItems.length === 0 ? (
                <p className="text-xs text-[#64748B] py-8 text-center">Belum ada transaksi selesai.</p>
              ) : (
                salesData.topSellingItems.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-[#FDFBF7] rounded-2xl border border-slate-200/80 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 font-mono font-bold text-[#EA580C] text-xs">#{idx + 1}</span>
                      <span className="font-bold text-[#18181B]">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EA580C]/10 text-[#EA580C] font-bold text-[11px] font-mono">
                        {item.quantity} Porsi
                      </span>
                      <span className="font-mono font-bold text-[#18181B]">
                        {formatIDR(item.revenue)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

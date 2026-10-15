"use client";

import React from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  RefreshCw,
  FileSpreadsheet,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { formatIDR } from "@/lib/utils";
import { AnalyticsFinancialTrendChart } from "./analytics/AnalyticsFinancialTrendChart";
import { AnalyticsPaymentDonutChart } from "./analytics/AnalyticsPaymentDonutChart";

interface AnalyticsTabProps {
  salesData: any;
  isLoading?: boolean;
  onRefresh: () => void;
  onExportExcel: () => void;
  isExportingExcel?: boolean;
}

export function AnalyticsTab({
  salesData,
  isLoading = false,
  onRefresh,
  onExportExcel,
  isExportingExcel = false,
}: AnalyticsTabProps) {
  const showSkeleton = isLoading || !salesData;

  // Derived Trend Data (Fallback to default 7 days if empty)
  const trendData =
    salesData?.dailyTrend && salesData.dailyTrend.length > 0
      ? salesData.dailyTrend
      : [
          { date: "2026-10-09", label: "Jum", revenue: 4200000, profit: 2730000, count: 6 },
          { date: "2026-10-10", label: "Sab", revenue: 6800000, profit: 4420000, count: 9 },
          { date: "2026-10-11", label: "Min", revenue: 8400000, profit: 5460000, count: 12 },
          { date: "2026-10-12", label: "Sen", revenue: 3100000, profit: 2015000, count: 4 },
          { date: "2026-10-13", label: "Sel", revenue: 5200000, profit: 3380000, count: 7 },
          { date: "2026-10-14", label: "Rab", revenue: 7600000, profit: 4940000, count: 10 },
          {
            date: "2026-10-15",
            label: "Kam",
            revenue: salesData?.summary?.totalRevenue || 5900000,
            profit: salesData?.summary?.grossProfit || 3835000,
            count: salesData?.summary?.totalOrdersCount || 8,
          },
        ];

  const maxRevenue = Math.max(
    ...trendData.map((d: any) => Math.max(d.revenue, d.profit)),
    1000000
  );

  // Hourly Distribution
  const hourlyData = salesData?.hourlyDistribution || {
    "11:00": 2,
    "12:00": 6,
    "13:00": 8,
    "14:00": 3,
    "15:00": 1,
    "16:00": 2,
    "17:00": 4,
    "18:00": 7,
    "19:00": 11,
    "20:00": 9,
    "21:00": 5,
    "22:00": 2,
  };
  const maxHourlyOrders = Math.max(...(Object.values(hourlyData) as number[]), 1);

  // Order Type Breakdown
  const orderTypes = salesData?.orderTypeBreakdown || {
    dine_in: { count: 18, revenue: 5400000 },
    reservation: { count: 8, revenue: 3200000 },
    takeaway: { count: 4, revenue: 1100000 },
  };
  const totalTypeOrders =
    (orderTypes.dine_in?.count || 0) +
      (orderTypes.reservation?.count || 0) +
      (orderTypes.takeaway?.count || 0) || 1;

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#18181B]">
            Ringkasan Bisnis & Analitik Penjualan
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Laporan finansial, laba kotor, jam sibuk operasional, dan performa menu terlaris Savoria Haute Cuisine.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#18181B] flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            onClick={onExportExcel}
            disabled={isExportingExcel}
            className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-emerald-600/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isExportingExcel ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Membuat Excel...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>Unduh Laporan Excel (Lengkap)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {showSkeleton ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-3xl" />
          ))}
        </div>
      ) : (
        <>
          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden group hover:border-[#EA580C]/40 transition-all">
              <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
                <span>Total Omzet (Gross)</span>
                <div className="w-8 h-8 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="font-serif text-2xl font-bold text-[#18181B]">
                {formatIDR(salesData.summary.totalRevenue)}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Termasuk Pajak PB1 & Service</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
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

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden group hover:border-blue-500/40 transition-all">
              <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
                <span>Transaksi Lunas</span>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <p className="font-serif text-2xl font-bold text-[#18181B]">
                {salesData.summary.totalOrdersCount} Pesanan
              </p>
              <p className="text-[11px] text-[#64748B]">Pesanan tercatat di sistem kasir</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden group hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
                <span>Rata-rata Keranjang (AOV)</span>
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="font-serif text-2xl font-bold text-[#18181B]">
                {formatIDR(salesData.summary.avgOrderValue)}
              </p>
              <p className="text-[11px] text-[#64748B]">Average spend per transaction</p>
            </div>
          </div>

          {/* MAIN CHARTS SECTION: Interactive Trend Area Chart & Payment Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AnalyticsFinancialTrendChart
              trendData={trendData}
              maxRevenue={maxRevenue}
            />

            <AnalyticsPaymentDonutChart
              cash={salesData?.paymentBreakdown?.cash || 0}
              qris={salesData?.paymentBreakdown?.qris || 0}
              debit={salesData?.paymentBreakdown?.debit || 0}
            />
          </div>

          {/* SECOND ROW: Hourly Peak Dining Bar Chart & Dining Type Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Peak Dining Hours Bar Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#18181B] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#EA580C]" />
                    <span>Intensitas Jam Sibuk Restoran (Peak Dining Hours)</span>
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Frekuensi pesanan masuk per jam operasional (11:00 - 22:00)
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#EA580C] bg-[#EA580C]/10 px-2.5 py-1 rounded-full">
                  Peak: 19:00 - 20:00
                </span>
              </div>

              {/* Dynamic Bar Chart */}
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-3 items-end h-40">
                {Object.entries(hourlyData).map(([hour, count]: [string, any]) => {
                  const heightPercent = Math.max(Math.round((count / maxHourlyOrders) * 100), 12);
                  const isPeak = count === maxHourlyOrders;

                  return (
                    <div key={hour} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[9px] font-mono font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {count}x
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-xl transition-all duration-300 group-hover:scale-105 ${
                          isPeak
                            ? "bg-gradient-to-t from-[#EA580C] to-[#F97316] shadow-sm shadow-[#EA580C]/30"
                            : "bg-slate-200 group-hover:bg-[#EA580C]/60"
                        }`}
                      />
                      <span className="text-[9px] font-mono text-[#64748B] whitespace-nowrap">
                        {hour.slice(0, 2)}h
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-2 border-t border-slate-100">
                <span>Makan Siang (11:00 - 14:00)</span>
                <span>Tea Time (15:00 - 17:00)</span>
                <span>Dinner Gala (18:00 - 22:00)</span>
              </div>
            </div>

            {/* Dining Type Distribution */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-serif font-bold text-base text-[#18181B]">
                  Tipe Pemesanan (Order Channels)
                </h3>
                <p className="text-xs text-[#64748B]">Perbandingan Dine-in, Reservasi, & Takeaway</p>
              </div>

              <div className="space-y-4 pt-1">
                {/* Dine In */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#18181B]">Dine-in (Makan di Tempat)</span>
                    <span className="font-mono font-bold text-[#EA580C]">
                      {orderTypes.dine_in?.count || 0} (
                      {Math.round(((orderTypes.dine_in?.count || 0) / totalTypeOrders) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${Math.round(((orderTypes.dine_in?.count || 0) / totalTypeOrders) * 100)}%`,
                      }}
                      className="bg-[#EA580C] h-full rounded-full transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-[#64748B] font-mono block mt-0.5">
                    Omzet: {formatIDR(orderTypes.dine_in?.revenue || 0)}
                  </span>
                </div>

                {/* Reservation */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#18181B]">Booking Reservasi Meja</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {orderTypes.reservation?.count || 0} (
                      {Math.round(((orderTypes.reservation?.count || 0) / totalTypeOrders) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${Math.round(((orderTypes.reservation?.count || 0) / totalTypeOrders) * 100)}%`,
                      }}
                      className="bg-emerald-500 h-full rounded-full transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-[#64748B] font-mono block mt-0.5">
                    Omzet: {formatIDR(orderTypes.reservation?.revenue || 0)}
                  </span>
                </div>

                {/* Takeaway */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#18181B]">Bawa Pulang (Takeaway)</span>
                    <span className="font-mono font-bold text-blue-600">
                      {orderTypes.takeaway?.count || 0} (
                      {Math.round(((orderTypes.takeaway?.count || 0) / totalTypeOrders) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${Math.round(((orderTypes.takeaway?.count || 0) / totalTypeOrders) * 100)}%`,
                      }}
                      className="bg-blue-500 h-full rounded-full transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-[#64748B] font-mono block mt-0.5">
                    Omzet: {formatIDR(orderTypes.takeaway?.revenue || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* THIRD ROW: Top Selling Items Ranking */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-base text-[#18181B]">
                  Peringkat Menu Terlaris (Top Selling Items)
                </h3>
                <p className="text-xs text-[#64748B]">Berdasarkan total kuantitas porsi dan kontribusi omzet</p>
              </div>
              <span className="text-xs text-[#64748B]">Urut Berdasarkan Volume Penjualan</span>
            </div>

            <div className="space-y-3">
              {!salesData.topSellingItems || salesData.topSellingItems.length === 0 ? (
                <p className="text-xs text-[#64748B] py-8 text-center">Belum ada transaksi selesai.</p>
              ) : (
                salesData.topSellingItems.slice(0, 5).map((item: any, idx: number) => {
                  const maxQty = salesData.topSellingItems[0]?.quantity || 1;
                  const percent = Math.round((item.quantity / maxQty) * 100);

                  return (
                    <div
                      key={idx}
                      className="p-3.5 bg-[#FDFBF7] rounded-2xl border border-slate-200/80 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                              idx === 0
                                ? "bg-amber-400 text-amber-950 shadow-xs"
                                : idx === 1
                                ? "bg-slate-300 text-slate-800"
                                : idx === 2
                                ? "bg-amber-700 text-white"
                                : "bg-slate-100 text-[#64748B]"
                            }`}
                          >
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-[#18181B] text-sm">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#EA580C]/10 text-[#EA580C] font-bold text-[11px] font-mono">
                            {item.quantity} Porsi
                          </span>
                          <span className="font-mono font-bold text-[#18181B]">
                            {formatIDR(item.revenue)}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="bg-[#EA580C] h-full rounded-full transition-all"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

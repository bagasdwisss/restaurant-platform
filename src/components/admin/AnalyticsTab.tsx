"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  RefreshCw,
  FileSpreadsheet,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Clock,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { formatIDR } from "@/lib/utils";

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

  // Chart interactivity states
  const [activeTrendMetric, setActiveTrendMetric] = useState<"both" | "revenue" | "profit">("both");
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(null);

  // Derived Trend Data (Fallback to default 7 days if empty)
  const trendData = salesData?.dailyTrend && salesData.dailyTrend.length > 0
    ? salesData.dailyTrend
    : [
        { date: "2026-10-09", label: "Jum", revenue: 4200000, profit: 2730000, count: 6 },
        { date: "2026-10-10", label: "Sab", revenue: 6800000, profit: 4420000, count: 9 },
        { date: "2026-10-11", label: "Min", revenue: 8400000, profit: 5460000, count: 12 },
        { date: "2026-10-12", label: "Sen", revenue: 3100000, profit: 2015000, count: 4 },
        { date: "2026-10-13", label: "Sel", revenue: 5200000, profit: 3380000, count: 7 },
        { date: "2026-10-14", label: "Rab", revenue: 7600000, profit: 4940000, count: 10 },
        { date: "2026-10-15", label: "Kam", revenue: salesData?.summary?.totalRevenue || 5900000, profit: salesData?.summary?.grossProfit || 3835000, count: salesData?.summary?.totalOrdersCount || 8 },
      ];

  // Calculate SVG Area Chart Dimensions
  const maxRevenue = Math.max(...trendData.map((d: any) => Math.max(d.revenue, d.profit)), 1000000);
  const chartHeight = 220;
  const chartWidth = 600;
  const padLeft = 20;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;
  const usableWidth = chartWidth - padLeft - padRight;
  const usableHeight = chartHeight - padTop - padBottom;

  const pointsRevenue = trendData.map((d: any, i: number) => {
    const x = padLeft + (i / Math.max(trendData.length - 1, 1)) * usableWidth;
    const y = padTop + usableHeight - (d.revenue / maxRevenue) * usableHeight;
    return { x, y, ...d };
  });

  const pointsProfit = trendData.map((d: any, i: number) => {
    const x = padLeft + (i / Math.max(trendData.length - 1, 1)) * usableWidth;
    const y = padTop + usableHeight - (d.profit / maxRevenue) * usableHeight;
    return { x, y, ...d };
  });

  const generateSvgPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    return points.reduce(
      (path, pt, i, arr) => {
        if (i === 0) return `M ${pt.x},${pt.y}`;
        const prev = arr[i - 1];
        const cx = (prev.x + pt.x) / 2;
        return `${path} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
      },
      ""
    );
  };

  const revenuePath = generateSvgPath(pointsRevenue);
  const profitPath = generateSvgPath(pointsProfit);

  const revenueArea = `${revenuePath} L ${pointsRevenue[pointsRevenue.length - 1]?.x || 0},${padTop + usableHeight} L ${pointsRevenue[0]?.x || 0},${padTop + usableHeight} Z`;
  const profitArea = `${profitPath} L ${pointsProfit[pointsProfit.length - 1]?.x || 0},${padTop + usableHeight} L ${pointsProfit[0]?.x || 0},${padTop + usableHeight} Z`;

  // Payment Breakdown Calculations for Donut Chart
  const cash = salesData?.paymentBreakdown?.cash || 0;
  const qris = salesData?.paymentBreakdown?.qris || 0;
  const debit = salesData?.paymentBreakdown?.debit || 0;
  const totalPayment = (cash + qris + debit) || 1;
  const cashPct = Math.round((cash / totalPayment) * 100);
  const qrisPct = Math.round((qris / totalPayment) * 100);
  const debitPct = 100 - cashPct - qrisPct;

  // Donut circumference (radius = 65 => C = 2 * PI * 65 ≈ 408.4)
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const cashStroke = (cashPct / 100) * circumference;
  const qrisStroke = (qrisPct / 100) * circumference;
  const debitStroke = (debitPct / 100) * circumference;

  // Hourly Distribution
  const hourlyData = salesData?.hourlyDistribution || {
    "11:00": 2, "12:00": 6, "13:00": 8, "14:00": 3,
    "15:00": 1, "16:00": 2, "17:00": 4, "18:00": 7,
    "19:00": 11, "20:00": 9, "21:00": 5, "22:00": 2,
  };
  const maxHourlyOrders = Math.max(...Object.values(hourlyData) as number[], 1);

  // Order Type Breakdown
  const orderTypes = salesData?.orderTypeBreakdown || {
    dine_in: { count: 18, revenue: 14200000 },
    reservation: { count: 12, revenue: 9800000 },
    takeaway: { count: 5, revenue: 3500000 },
  };
  const totalTypeOrders = (orderTypes.dine_in?.count || 0) + (orderTypes.reservation?.count || 0) + (orderTypes.takeaway?.count || 0) || 1;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-[#18181B]">
              Dashboard Analitik Finansial & Sales
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EA580C]/10 text-[#EA580C] text-[10px] font-mono font-bold">
              <Sparkles className="w-3 h-3" /> Live Analytics
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            Grafik dinamis omzet, estimasi profit margin, preferensi pembayaran, dan intensitas jam sibuk SAVORIA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-white border border-slate-200/80 hover:bg-slate-50 disabled:opacity-60 rounded-full text-xs font-semibold text-[#64748B] hover:text-[#18181B] flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#EA580C]" : ""}`} />
            <span>{isLoading ? "Memuat..." : "Refresh"}</span>
          </button>
          <button
            onClick={onExportExcel}
            disabled={showSkeleton || isExportingExcel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
          >
            {isExportingExcel ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyiapkan Excel...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>Ekspor Excel Lengkap (.xlsx)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Shimmer Skeleton during Loading */}
      {showSkeleton ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="h-3 w-32 bg-slate-200 rounded-full" />
                  <div className="w-8 h-8 rounded-full bg-slate-100" />
                </div>
                <div className="h-8 w-40 bg-slate-200 rounded-xl" />
                <div className="h-2.5 w-28 bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs h-80" />
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs h-80" />
          </div>
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
            {/* 1. Dynamic SVG Revenue & Profit Area Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#18181B] flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#EA580C]" />
                      <span>Tren Finansial Dinamis (Revenue vs Profit)</span>
                    </h3>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Visualisasi pergerakan omzet kotor dan laba bersih 7 hari terakhir.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setActiveTrendMetric("both")}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        activeTrendMetric === "both"
                          ? "bg-white text-[#18181B] shadow-xs"
                          : "text-[#64748B] hover:text-[#18181B]"
                      }`}
                    >
                      Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTrendMetric("revenue")}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        activeTrendMetric === "revenue"
                          ? "bg-[#EA580C] text-white shadow-xs"
                          : "text-[#64748B] hover:text-[#18181B]"
                      }`}
                    >
                      Omzet Saja
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTrendMetric("profit")}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        activeTrendMetric === "profit"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-[#64748B] hover:text-[#18181B]"
                      }`}
                    >
                      Profit Saja
                    </button>
                  </div>
                </div>

                {/* SVG Area Chart Viewbox */}
                <div className="relative pt-4 overflow-hidden">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-56 overflow-visible"
                  >
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EA580C" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#EA580C" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Gridlines */}
                    {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
                      const yPos = padTop + usableHeight * (1 - ratio);
                      return (
                        <g key={i}>
                          <line
                            x1={padLeft}
                            y1={yPos}
                            x2={chartWidth - padRight}
                            y2={yPos}
                            stroke="#E2E8F0"
                            strokeDasharray="4 4"
                            strokeWidth="1"
                          />
                          <text
                            x={chartWidth - padRight + 4}
                            y={yPos + 3}
                            fill="#94A3B8"
                            fontSize="8"
                            fontFamily="monospace"
                          >
                            {formatIDR(maxRevenue * ratio).replace(",00", "")}
                          </text>
                        </g>
                      );
                    })}

                    {/* Revenue Area & Line */}
                    {(activeTrendMetric === "both" || activeTrendMetric === "revenue") && (
                      <>
                        <path d={revenueArea} fill="url(#revenueGrad)" />
                        <path
                          d={revenuePath}
                          fill="none"
                          stroke="#EA580C"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        {pointsRevenue.map((pt: any, i: number) => (
                          <circle
                            key={`rev-${i}`}
                            cx={pt.x}
                            cy={pt.y}
                            r={hoveredTrendIdx === i ? 6 : 4}
                            fill="#EA580C"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            className="cursor-pointer transition-all duration-150"
                            onMouseEnter={() => setHoveredTrendIdx(i)}
                            onMouseLeave={() => setHoveredTrendIdx(null)}
                          />
                        ))}
                      </>
                    )}

                    {/* Profit Area & Line */}
                    {(activeTrendMetric === "both" || activeTrendMetric === "profit") && (
                      <>
                        <path d={profitArea} fill="url(#profitGrad)" />
                        <path
                          d={profitPath}
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        {pointsProfit.map((pt: any, i: number) => (
                          <circle
                            key={`prof-${i}`}
                            cx={pt.x}
                            cy={pt.y}
                            r={hoveredTrendIdx === i ? 6 : 3.5}
                            fill="#10B981"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            className="cursor-pointer transition-all duration-150"
                            onMouseEnter={() => setHoveredTrendIdx(i)}
                            onMouseLeave={() => setHoveredTrendIdx(null)}
                          />
                        ))}
                      </>
                    )}

                    {/* X-Axis Labels */}
                    {pointsRevenue.map((pt: any, i: number) => (
                      <text
                        key={`x-${i}`}
                        x={pt.x}
                        y={chartHeight - 8}
                        textAnchor="middle"
                        fill="#64748B"
                        fontSize="9"
                        fontWeight="600"
                        fontFamily="sans-serif"
                      >
                        {pt.label}
                      </text>
                    ))}
                  </svg>

                  {/* Hover Floating Tooltip */}
                  {hoveredTrendIdx !== null && trendData[hoveredTrendIdx] && (
                    <div
                      className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#18181B] text-white p-3 rounded-2xl shadow-xl text-xs space-y-1 pointer-events-none z-10 border border-white/10"
                    >
                      <div className="flex items-center gap-2 border-b border-white/10 pb-1 font-mono text-[11px] text-slate-300">
                        <Calendar className="w-3 h-3 text-[#EA580C]" />
                        <span>{trendData[hoveredTrendIdx].date} ({trendData[hoveredTrendIdx].label})</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-400">Total Omzet:</span>
                        <span className="font-bold text-[#EA580C] font-mono">
                          {formatIDR(trendData[hoveredTrendIdx].revenue)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-400">Gross Profit:</span>
                        <span className="font-bold text-emerald-400 font-mono">
                          {formatIDR(trendData[hoveredTrendIdx].profit)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 pt-0.5">
                        <span>Volume:</span>
                        <span className="font-bold text-white font-mono">{trendData[hoveredTrendIdx].count} Pesanan</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chart Legend */}
              <div className="pt-4 mt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#EA580C]" />
                    <span className="font-semibold text-[#18181B]">Omzet Kotor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-[#18181B]">Laba Bersih (Estimasi)</span>
                  </div>
                </div>
                <span className="text-[11px] text-[#64748B] font-mono">
                  Tertinggi: {formatIDR(maxRevenue)}
                </span>
              </div>
            </div>

            {/* 2. Dynamic Payment Method Circular Donut Chart */}
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
                      {orderTypes.dine_in?.count || 0} ({Math.round(((orderTypes.dine_in?.count || 0) / totalTypeOrders) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.round(((orderTypes.dine_in?.count || 0) / totalTypeOrders) * 100)}%` }}
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
                      {orderTypes.reservation?.count || 0} ({Math.round(((orderTypes.reservation?.count || 0) / totalTypeOrders) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.round(((orderTypes.reservation?.count || 0) / totalTypeOrders) * 100)}%` }}
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
                      {orderTypes.takeaway?.count || 0} ({Math.round(((orderTypes.takeaway?.count || 0) / totalTypeOrders) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.round(((orderTypes.takeaway?.count || 0) / totalTypeOrders) * 100)}%` }}
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
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                            idx === 0
                              ? "bg-amber-400 text-amber-950 shadow-xs"
                              : idx === 1
                              ? "bg-slate-300 text-slate-800"
                              : idx === 2
                              ? "bg-amber-700 text-white"
                              : "bg-slate-100 text-[#64748B]"
                          }`}>
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

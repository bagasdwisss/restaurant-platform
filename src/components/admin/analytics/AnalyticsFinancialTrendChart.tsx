"use client";

import React, { useState } from "react";
import { BarChart3 } from "lucide-react";
import { formatIDR } from "@/lib/utils";

interface AnalyticsFinancialTrendChartProps {
  trendData: any[];
  maxRevenue: number;
}

export function AnalyticsFinancialTrendChart({
  trendData,
  maxRevenue,
}: AnalyticsFinancialTrendChartProps) {
  const [activeTrendMetric, setActiveTrendMetric] = useState<"both" | "revenue" | "profit">("both");
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(null);

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

  return (
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

            {/* X-Axis Day Labels */}
            {pointsRevenue.map((pt: any, i: number) => (
              <text
                key={`label-${i}`}
                x={pt.x}
                y={chartHeight - 8}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill={hoveredTrendIdx === i ? "#18181B" : "#94A3B8"}
                className="transition-colors"
              >
                {pt.label}
              </text>
            ))}
          </svg>

          {/* Interactive Hover Tooltip */}
          {hoveredTrendIdx !== null && pointsRevenue[hoveredTrendIdx] && (
            <div
              className="absolute pointer-events-none bg-[#18181B] text-white p-2.5 rounded-xl text-xs shadow-xl space-y-1 transform -translate-x-1/2 -translate-y-full border border-white/10 z-10 transition-all duration-75"
              style={{
                left: `${(pointsRevenue[hoveredTrendIdx].x / chartWidth) * 100}%`,
                top: `${pointsRevenue[hoveredTrendIdx].y - 8}px`,
              }}
            >
              <div className="font-bold text-[11px] text-slate-300 font-mono">
                {pointsRevenue[hoveredTrendIdx].date} ({pointsRevenue[hoveredTrendIdx].label})
              </div>
              <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
                Omzet: {formatIDR(pointsRevenue[hoveredTrendIdx].revenue)}
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Profit: {formatIDR(pointsRevenue[hoveredTrendIdx].profit)}
              </div>
              <div className="text-[10px] text-slate-400">
                {pointsRevenue[hoveredTrendIdx].count} Pesanan Masuk
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend & Summary Info */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748B]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
            <span>Omzet Kotor (Gross Sales)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Gross Profit (~65% margin)</span>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Arahkan kursor pada titik grafik untuk detail harian
        </span>
      </div>
    </div>
  );
}

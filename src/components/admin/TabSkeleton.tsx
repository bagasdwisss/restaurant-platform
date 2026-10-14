"use client";

import React from "react";
import { Sparkles, RefreshCw } from "lucide-react";

interface TabSkeletonProps {
  title?: string;
  count?: number;
}

export function TabSkeleton({
  title = "Memuat Modul...",
  count = 4,
}: TabSkeletonProps) {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#EA580C]/20 flex items-center justify-center">
              <RefreshCw className="w-3 h-3 text-[#EA580C] animate-spin" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#18181B]">
              {title}
            </h3>
          </div>
          <div className="h-3 w-64 bg-slate-200 rounded-full" />
        </div>
        <div className="h-9 w-32 bg-slate-200 rounded-full" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 space-y-3 shadow-xs"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-200 rounded-full" />
              <div className="w-8 h-8 bg-slate-100 rounded-xl" />
            </div>
            <div className="h-6 w-36 bg-slate-200 rounded-lg" />
            <div className="h-2.5 w-full bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>

      {/* Content Table Skeleton */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-4 shadow-xs">
        <div className="h-4 w-48 bg-slate-200 rounded-full" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-2xl" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-32 bg-slate-200 rounded-full" />
                  <div className="h-2.5 w-20 bg-slate-100 rounded-full" />
                </div>
              </div>
              <div className="h-4 w-16 bg-slate-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

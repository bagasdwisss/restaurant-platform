"use client";

import React from "react";
import Link from "next/link";
import { UserSession } from "@/lib/auth";
import { ShieldCheck, RefreshCw, LogOut, Menu as MenuIcon, FileSpreadsheet } from "lucide-react";

interface AdminHeaderProps {
  user: UserSession | null;
  activeTabTitle: string;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onToggleMobileSidebar?: () => void;
  onExportExcel?: () => void;
  isExportingExcel?: boolean;
}

export function AdminHeader({
  user,
  activeTabTitle,
  onRefresh,
  isRefreshing,
  onToggleMobileSidebar,
  onExportExcel,
  isExportingExcel = false,
}: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-[#E2E8F0] px-3.5 sm:px-8 py-3 sm:py-4 sticky top-0 z-30 backdrop-blur-md bg-white/95">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {onToggleMobileSidebar && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#18181B] transition-colors cursor-pointer shrink-0"
              title="Menu Navigasi Admin"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase bg-[#14281D]/10 text-[#14281D] px-2 py-0.5 rounded-full font-bold">
                Admin
              </span>
              <span className="text-[11px] text-[#64748B] hidden xs:inline truncate">• {activeTabTitle}</span>
            </div>
            <h1 className="font-display text-sm sm:text-xl font-bold text-[#18181B] tracking-tight truncate mt-0.5">
              {activeTabTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onExportExcel && (
            <button
              onClick={onExportExcel}
              disabled={isExportingExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
              title="Unduh Laporan Excel Lengkap (Semua Data Operasional & Finansial)"
            >
              {isExportingExcel ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Menyiapkan Excel...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ekspor Excel</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full border border-slate-200 text-xs font-semibold text-[#64748B] hover:text-[#18181B] hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
            title="Segarkan data terbaru"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#EA580C]" : ""}`} />
            <span className="hidden sm:inline">Segarkan</span>
          </button>

          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-[#14281D] text-white flex items-center justify-center font-bold text-xs font-mono">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-[#18181B] leading-tight">
                {user?.name || "Administrator"}
              </div>
              <div className="text-[10px] text-[#64748B] font-mono uppercase">
                Role: <span className="text-[#EA580C] font-semibold">{user?.role || "ADMIN"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

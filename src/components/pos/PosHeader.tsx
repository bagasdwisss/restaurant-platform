"use client";

import React from "react";
import Link from "next/link";
import {
  Store,
  LayoutGrid,
  MapPin,
  UtensilsCrossed,
  LogOut,
  Sparkles,
  BellRing,
  Coffee,
  Fingerprint,
} from "lucide-react";

interface PosHeaderProps {
  user: any;
  currentShift: any;
  activeTab: "pos" | "orders" | "tables";
  onChangeTab: (tab: "pos" | "orders" | "tables") => void;
  activeOrdersCount: number;
  waiterCallsCount: number;
  onOpenShiftModal: () => void;
  onCloseShiftModal: () => void;
  onOpenWaiterCalls?: () => void;
  onOpenAttendance?: () => void;
  onLogout: () => void;
}

export function PosHeader({
  user,
  currentShift,
  activeTab,
  onChangeTab,
  activeOrdersCount,
  waiterCallsCount,
  onOpenShiftModal,
  onCloseShiftModal,
  onOpenWaiterCalls,
  onOpenAttendance,
  onLogout,
}: PosHeaderProps) {

  return (
    <header className="border-b border-[#E2E8F0] bg-white sticky top-0 z-40 px-3 sm:px-6 py-2.5 sm:py-3 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Brand & Cashier Shift Badge */}
        <div className="flex items-center justify-between md:justify-start gap-3 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-serif font-black text-base shadow-xs group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif tracking-tight text-base sm:text-lg font-bold text-[#18181B]">
                  SAVOR<span className="text-[#EA580C]">IA</span>
                </span>
                <span className="text-[10px] bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/20 px-2 py-0.2 rounded-full font-bold uppercase tracking-wider font-mono">
                  POS Cashier
                </span>
              </div>
            </div>
          </Link>

          {/* Shift status pill */}
          {currentShift ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-emerald-800">
                Shift: {currentShift?.cashierName || "Kasir"}
              </span>
              <button
                type="button"
                onClick={onCloseShiftModal}
                className="text-[10px] text-rose-600 hover:text-rose-800 font-bold underline ml-1 cursor-pointer"
              >
                Tutup Shift
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenShiftModal}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer animate-bounce"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Buka Shift Kasir</span>
            </button>
          )}
        </div>

        {/* Center: Module Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-full overflow-x-auto scrollbar-none self-start md:self-auto">
          <button
            type="button"
            onClick={() => onChangeTab("pos")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "pos"
                ? "bg-[#EA580C] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#18181B]"
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Katalog & Kasir</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeTab("orders")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap relative ${
              activeTab === "orders"
                ? "bg-[#EA580C] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#18181B]"
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Pesanan Masuk</span>
            {activeOrdersCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeTab === "orders"
                    ? "bg-white text-[#EA580C]"
                    : "bg-[#EA580C] text-white"
                }`}
              >
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onChangeTab("tables")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "tables"
                ? "bg-[#EA580C] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#18181B]"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Denah Meja</span>
          </button>
        </div>

        {/* Right: Waiter Call Alert & Staff Logout */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {waiterCallsCount > 0 ? (
            <button
              type="button"
              onClick={onOpenWaiterCalls}
              className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white border border-rose-600 px-3 py-1.5 rounded-full text-xs font-bold animate-pulse shadow-xs hover:shadow transition-all cursor-pointer"
              title="Klik untuk membuka daftar panggilan tamu"
            >
              <BellRing className="w-3.5 h-3.5 text-white animate-bounce" />
              <span>{waiterCallsCount} Panggilan Tamu</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenWaiterCalls}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
              title="Panggilan Tamu Meja (0 Aktif)"
            >
              <BellRing className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Panggilan Tamu</span>
            </button>
          )}

          {onOpenAttendance && (
            <button
              type="button"
              onClick={onOpenAttendance}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              title="Terminal Presensi Staf (PIN / Biometrik)"
            >
              <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Presensi Staf</span>
            </button>
          )}

          {user && (
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-full hover:bg-slate-100 text-[#64748B] hover:text-rose-600 transition-colors cursor-pointer"
              title="Keluar / Ganti Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

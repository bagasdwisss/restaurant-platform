"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  UtensilsCrossed,
  QrCode,
  Package,
  History,
  Users,
  LogOut,
  Sparkles,
  X,
  Ticket,
} from "lucide-react";

export type AdminTab = "analytics" | "menus" | "tables" | "inventory" | "shifts" | "vouchers" | "users";

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  menuCount: number;
  tableCount: number;
  ingredientCount: number;
  userCount: number;
  voucherCount?: number;
  onLogout: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
  menuCount,
  tableCount,
  ingredientCount,
  userCount,
  voucherCount = 0,
  onLogout,
  mobileOpen = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const tabs = [
    { id: "analytics" as AdminTab, label: "Ringkasan & Sales", icon: TrendingUp },
    { id: "menus" as AdminTab, label: "Daftar Menu & Kategori", icon: UtensilsCrossed, count: menuCount },
    { id: "tables" as AdminTab, label: "Manajemen Meja & QR", icon: QrCode, count: tableCount },
    { id: "inventory" as AdminTab, label: "Bahan Baku & Stok", icon: Package, count: ingredientCount },
    { id: "shifts" as AdminTab, label: "Kasir & Audit Log", icon: History },
    { id: "vouchers" as AdminTab, label: "Voucher & Promo", icon: Ticket, count: voucherCount },
    { id: "users" as AdminTab, label: "Staff & Hak Akses", icon: Users, count: userCount },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-display font-black text-xl shadow-cta">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-lg font-bold tracking-tight text-[#18181B]">
                  SAVOR<span className="text-[#EA580C]">IA</span>
                </span>
                <span className="text-[10px] bg-[#14281D] text-white px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                  Admin
                </span>
              </div>
              <p className="text-[10px] text-[#64748B] uppercase font-mono tracking-wider">
                Executive Back-Office
              </p>
            </div>
          </Link>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-2 rounded-full hover:bg-slate-100 text-[#64748B]"
              title="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#14281D] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#18181B] hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#EA580C]" : "text-stone-400"}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-100 text-[#64748B]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Quick links */}
      <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
        <Link
          href="/pos"
          className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-[#64748B] hover:text-[#EA580C] hover:bg-orange-50/50 transition-all"
        >
          <Sparkles className="w-4 h-4 text-[#EA580C]" />
          <span>Buka POS Terminal ↗</span>
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Sesi (Logout)</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full p-4 shadow-2xl z-10 flex flex-col justify-between">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-[#E2E8F0] p-4 flex-col justify-between shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>
    </>
  );
}

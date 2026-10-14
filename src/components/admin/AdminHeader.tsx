"use client";

import React from "react";
import Link from "next/link";
import { UserSession } from "@/lib/auth";
import { ShieldCheck, RefreshCw, LogOut } from "lucide-react";

interface AdminHeaderProps {
  user: UserSession | null;
  activeTabTitle: string;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function AdminHeader({ user, activeTabTitle, onRefresh, isRefreshing }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-[#E2E8F0] px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sticky top-0 z-40 backdrop-blur-md bg-white/95">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase bg-[#14281D]/10 text-[#14281D] px-2 py-0.5 rounded-full font-bold">
            Portal Administrator
          </span>
          <span className="text-xs text-[#64748B]">• {activeTabTitle}</span>
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-[#18181B] tracking-tight mt-0.5">
          {activeTabTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-200 text-xs font-semibold text-[#64748B] hover:text-[#18181B] hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
          title="Segarkan data terbaru"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#EA580C]" : ""}`} />
          <span className="hidden xs:inline">Segarkan</span>
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
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
    </header>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { Search, Calendar, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SystemAuditLogsSubTabProps {
  auditLogs: any[];
}

export function SystemAuditLogsSubTab({ auditLogs = [] }: SystemAuditLogsSubTabProps) {
  const [systemSearch, setSystemSearch] = useState("");
  const [systemCategoryFilter, setSystemCategoryFilter] = useState<string>("ALL");
  const [systemDateFilter, setSystemDateFilter] = useState<string>("ALL");

  const matchesDateFilter = (dateVal: string | Date | undefined, filter: string) => {
    if (filter === "ALL" || !dateVal) return true;
    const target = new Date(dateVal).getTime();
    if (isNaN(target)) return true;
    const now = Date.now();
    const diffHours = (now - target) / (1000 * 60 * 60);

    if (filter === "TODAY") return diffHours <= 24;
    if (filter === "7DAYS") return diffHours <= 24 * 7;
    if (filter === "30DAYS") return diffHours <= 24 * 30;
    return true;
  };

  const filteredSystemAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const actionUpper = (log.action || "").toUpperCase();

      let matchCat = true;
      if (systemCategoryFilter === "LOGIN") {
        matchCat =
          actionUpper.includes("LOGIN") ||
          actionUpper.includes("LOGOUT") ||
          actionUpper.includes("AUTH");
      } else if (systemCategoryFilter === "USER") {
        matchCat =
          actionUpper.includes("USER") ||
          actionUpper.includes("STAFF") ||
          actionUpper.includes("ROLE") ||
          actionUpper.includes("PASSWORD") ||
          actionUpper.includes("REGISTER");
      } else if (systemCategoryFilter === "MENU") {
        matchCat =
          actionUpper.includes("MENU") ||
          actionUpper.includes("RECIPE") ||
          actionUpper.includes("CATEGORY");
      } else if (systemCategoryFilter === "TABLE") {
        matchCat = actionUpper.includes("TABLE") || actionUpper.includes("QR");
      } else if (systemCategoryFilter === "INVENTORY") {
        matchCat =
          actionUpper.includes("INGREDIENT") ||
          actionUpper.includes("STOCK") ||
          actionUpper.includes("RESTOCK");
      } else if (systemCategoryFilter === "CASHIER") {
        matchCat = actionUpper.includes("SHIFT") || actionUpper.includes("ORDER");
      }

      const matchSearch =
        !systemSearch ||
        log.action?.toLowerCase().includes(systemSearch.toLowerCase()) ||
        log.user?.toLowerCase().includes(systemSearch.toLowerCase()) ||
        log.details?.toLowerCase().includes(systemSearch.toLowerCase()) ||
        log.ipAddress?.toLowerCase().includes(systemSearch.toLowerCase());

      const matchDate = matchesDateFilter(log.createdAt, systemDateFilter);

      return matchCat && matchSearch && matchDate;
    });
  }, [auditLogs, systemSearch, systemCategoryFilter, systemDateFilter]);

  return (
    <div className="space-y-6">
      {/* System Audit Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={systemSearch}
              onChange={(e) => setSystemSearch(e.target.value)}
              placeholder="Cari aktivitas audit, email user, aksi, atau IP address..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-900/20"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={systemDateFilter}
              onChange={(e) => setSystemDateFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-[#18181B] focus:outline-none focus:ring-2 focus:ring-indigo-900/20"
            >
              <option value="ALL">Semua Waktu</option>
              <option value="TODAY">Hari Ini (24 Jam)</option>
              <option value="7DAYS">7 Hari Terakhir</option>
              <option value="30DAYS">30 Hari Terakhir</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Kategori:
          </span>
          {[
            { key: "ALL", label: "Semua Kategori" },
            { key: "LOGIN", label: "Login & Keamanan" },
            { key: "USER", label: "Akun User & Staff" },
            { key: "MENU", label: "Menu & Resep" },
            { key: "TABLE", label: "Meja & Tata Letak" },
            { key: "INVENTORY", label: "Bahan Baku & Stok" },
            { key: "CASHIER", label: "Operasional Kasir" },
          ].map((c) => (
            <button
              key={c.key}
              onClick={() => setSystemCategoryFilter(c.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                systemCategoryFilter === c.key
                  ? "bg-indigo-900 text-white"
                  : "bg-slate-100 text-[#64748B] hover:bg-slate-200/80"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-[#18181B]">
              Jejak Audit Trail Sistem & Keamanan
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Mencatat seluruh aksi kritikal seperti pembuatan akun, pergantian role, update menu, restock bahan, dan login.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {filteredSystemAuditLogs.length} Entri Log
          </span>
        </div>

        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredSystemAuditLogs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Tidak ada audit log sistem yang sesuai filter.
            </div>
          ) : (
            filteredSystemAuditLogs.map((log) => {
              const actionUpper = (log.action || "").toUpperCase();
              let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";

              if (actionUpper.includes("LOGIN") || actionUpper.includes("AUTH")) {
                badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
              } else if (actionUpper.includes("USER") || actionUpper.includes("ROLE")) {
                badgeColor = "bg-amber-50 text-amber-800 border-amber-200";
              } else if (actionUpper.includes("MENU") || actionUpper.includes("RECIPE")) {
                badgeColor = "bg-blue-50 text-blue-800 border-blue-200";
              } else if (actionUpper.includes("TABLE") || actionUpper.includes("QR")) {
                badgeColor = "bg-purple-50 text-purple-800 border-purple-200";
              } else if (actionUpper.includes("INGREDIENT") || actionUpper.includes("STOCK")) {
                badgeColor = "bg-teal-50 text-teal-800 border-teal-200";
              } else if (actionUpper.includes("DELETE") || actionUpper.includes("VOID")) {
                badgeColor = "bg-rose-50 text-rose-800 border-rose-200";
              }

              return (
                <div
                  key={log.id}
                  className="p-3 sm:p-4 rounded-xl bg-[#FDFBF7] border border-slate-200/80 hover:bg-white transition-all text-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono border ${badgeColor}`}
                      >
                        {log.action}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {log.user || "System Anonymous"}
                      </span>
                      {log.ipAddress && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            IP: {log.ipAddress}
                          </span>
                        </>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono shrink-0">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs pl-0.5 leading-relaxed">
                    {log.details || "Aktivitas tercatat di sistem tanpa keterangan tambahan."}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

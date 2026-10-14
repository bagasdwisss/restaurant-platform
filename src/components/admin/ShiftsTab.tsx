"use client";

import React from "react";
import { formatIDR, formatDate } from "@/lib/utils";

interface ShiftsTabProps {
  shiftHistory: any[];
  auditLogs: any[];
}

export function ShiftsTab({ shiftHistory, auditLogs }: ShiftsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#18181B]">
          Audit Rekonsiliasi Kasir & Shift
        </h2>
        <p className="text-xs text-[#64748B]">
          Riwayat buka/tutup kasir, pelacakan selisih kas fisik vs sistem, dan audit trail kasir.
        </p>
      </div>

      {/* Shift History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm space-y-3 p-5">
        <h3 className="font-serif font-bold text-base text-[#18181B]">
          Riwayat Sesi Shift Kasir
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-[#FDFBF7] border-b border-slate-200/80 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Kasir</th>
                <th className="p-3.5">Waktu Buka / Tutup</th>
                <th className="p-3.5">Modal Awal</th>
                <th className="p-3.5">Ekspektasi Kas</th>
                <th className="p-3.5">Fisik di Laci</th>
                <th className="p-3.5">Selisih Kas</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shiftHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#64748B]">
                    Belum ada sesi shift kasir yang tercatat.
                  </td>
                </tr>
              ) : (
                shiftHistory.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-[#18181B]">{s.cashierName}</td>
                    <td className="p-3.5 text-[#64748B]">
                      <div>Buka: {formatDate(s.openedAt)}</div>
                      {s.closedAt && <div>Tutup: {formatDate(s.closedAt)}</div>}
                    </td>
                    <td className="p-3.5 font-mono font-semibold">{formatIDR(s.startCash)}</td>
                    <td className="p-3.5 font-mono font-semibold">
                      {s.endCashExpected !== null ? formatIDR(s.endCashExpected) : "-"}
                    </td>
                    <td className="p-3.5 font-mono font-semibold">
                      {s.endCashActual !== null ? formatIDR(s.endCashActual) : "-"}
                    </td>
                    <td className="p-3.5 font-mono font-bold">
                      {s.variance !== null ? (
                        <span
                          className={
                            s.variance === 0
                              ? "text-emerald-700"
                              : s.variance > 0
                              ? "text-blue-700"
                              : "text-rose-700"
                          }
                        >
                          {formatIDR(s.variance)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          s.status === "open"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Trail Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
        <h3 className="font-serif font-bold text-base text-[#18181B]">
          Audit Trail Sistem (50 Aktivitas Terakhir)
        </h3>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-[#64748B] py-4 text-center">Belum ada aktivitas audit log.</p>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-[#FDFBF7] border border-slate-200/80 text-xs flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#18181B]">{log.action}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-[#64748B] font-semibold">{log.user}</span>
                  </div>
                  <p className="text-[#64748B] mt-0.5">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap pl-2 font-mono">
                  {formatDate(log.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

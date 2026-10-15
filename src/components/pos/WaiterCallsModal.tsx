"use client";

import React from "react";
import {
  BellRing,
  X,
  CheckCircle2,
  Footprints,
  RefreshCw,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface WaiterCallItem {
  id: number;
  tableId: number;
  tableNumber: string;
  status: string; // 'pending' | 'in_progress' | 'completed'
  createdAt: string;
  table?: {
    id: number;
    tableNumber: string;
    area: string;
    capacity: number;
  };
}

interface WaiterCallsModalProps {
  isOpen: boolean;
  onClose: () => void;
  calls: WaiterCallItem[];
  onUpdateStatus: (callId: number, status: "in_progress" | "completed") => Promise<void>;
  updatingCallId: number | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Baru saja";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    const diffHour = Math.floor(diffMin / 60);
    return `${diffHour} jam yang lalu`;
  } catch {
    return "Baru saja";
  }
}

export function WaiterCallsModal({
  isOpen,
  onClose,
  calls,
  onUpdateStatus,
  updatingCallId,
  onRefresh,
  isRefreshing = false,
}: WaiterCallsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-bold text-slate-900">
                  Panggilan Tamu Meja
                </h3>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {calls.length} Aktif
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Respon cepat sinyal bantuan dari meja makan pengunjung.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Segarkan Panggilan"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#EA580C]" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Call List Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {calls.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Semua Meja Telah Terlayani
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tidak ada panggilan tamu yang menunggu saat ini. Sistem akan otomatis berbunyi dan menampilkan kartu bila ada tamu yang memanggil.
              </p>
            </div>
          ) : (
            calls.map((call) => {
              const isUpdating = updatingCallId === call.id;
              const isInProgress = call.status === "in_progress";

              return (
                <div
                  key={call.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isInProgress
                      ? "bg-teal-50/40 border-teal-200 shadow-2xs"
                      : "bg-rose-50/40 border-rose-200 shadow-xs"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Table details */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black font-mono text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                          {call.tableNumber}
                        </span>
                        {isInProgress ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-ping" />
                            Sedang Dihampiri
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                            Menunggu Respon
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-600">
                        {call.table?.area && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {call.table.area}
                          </span>
                        )}
                        {call.table?.capacity && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-400" />
                            Kapasitas {call.table.capacity}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-slate-500 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatTimeAgo(call.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!isInProgress ? (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(call.id, "in_progress")}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          <Footprints className="w-4 h-4" />
                          <span>{isUpdating ? "Memproses..." : "Tanggapi / Menuju Meja"}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-teal-800 font-medium px-2 py-1 bg-teal-100/70 rounded-lg">
                          Staff sedang ke lokasi
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => onUpdateStatus(call.id, "completed")}
                        disabled={isUpdating}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Selesai (Sudah Dilayani)</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Otomatis sinkron dengan aplikasi pelanggan.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
}

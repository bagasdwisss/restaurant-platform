"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  QrCode,
  BellRing,
  RefreshCw,
  Sparkles,
  Footprints,
} from "lucide-react";
import { formatIDR, formatDate } from "@/lib/utils";
import { CookingCountdownTracker } from "@/components/customer/CookingCountdownTracker";

interface UserActiveOrdersTabProps {
  orders: any[];
  user: any;
  onOpenBoardingPass: (order: any) => void;
  onOpenReceipt: (order: any) => void;
  onCallWaiter: (tableId: number, orderNumber: string, orderId: number, tableNumber?: string) => Promise<void>;
  isCallingWaiter: boolean;
  callingWaiterOrderId: number | null;
}

export function UserActiveOrdersTab({
  orders,
  user,
  onOpenBoardingPass,
  onOpenReceipt,
  onCallWaiter,
  isCallingWaiter,
  callingWaiterOrderId,
}: UserActiveOrdersTabProps) {
  // Map of orderId -> waiter call status ('idle' | 'pending' | 'in_progress')
  const [waiterStatuses, setWaiterStatuses] = useState<Record<number, "idle" | "pending" | "in_progress">>({});

  // Poll waiter call status for active tables
  const pollActiveCalls = useCallback(async () => {
    if (!orders || orders.length === 0) return;

    for (const ord of orders) {
      const tableId = ord.tableId || ord.table?.id;
      if (!tableId) continue;

      try {
        const res = await fetch(`/api/v1/customer/call-waiter?tableId=${tableId}`);
        const data = await res.json();
        if (data.success && data.data) {
          const status = data.data.status;
          setWaiterStatuses((prev) => ({
            ...prev,
            [ord.id]: status === "in_progress" ? "in_progress" : status === "pending" ? "pending" : "idle",
          }));
        } else {
          // If no active call (completed or none), reset to idle
          setWaiterStatuses((prev) => ({ ...prev, [ord.id]: "idle" }));
        }
      } catch {
        // non-fatal
      }
    }
  }, [orders]);

  useEffect(() => {
    pollActiveCalls();
    const interval = setInterval(pollActiveCalls, 5000);
    return () => clearInterval(interval);
  }, [pollActiveCalls]);

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Calendar className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-lg text-[#18181B]">
            Tidak Ada Reservasi yang Sedang Aktif
          </h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
            Saat ini Anda belum memiliki reservasi meja yang sedang berjalan. Rencanakan jamuan istimewa Anda berikutnya sekarang.
          </p>
        </div>
        <Link
          href="/reservation"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs shadow-md shadow-[#EA580C]/25 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Mulai Reservasi Meja</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const currentWaiterStatus = waiterStatuses[order.id] || "idle";
        const tableId = order.tableId || order.table?.id;

        return (
          <div
            key={order.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5"
          >
            {/* Top Row Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-base text-[#18181B]">
                    #{order.orderNumber}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-50 text-amber-900 border border-amber-200">
                    {order.table?.tableNumber ? `Meja ${order.table.tableNumber}` : "VIP Lounge"} ({order.table?.area || "Indoor"})
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-[#64748B]">
                    {order.guestCount ? `${order.guestCount} Tamu` : "2 Tamu"}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {order.reservationDate ? formatDate(order.reservationDate) : formatDate(order.createdAt)}
                  </span>
                  <span className="text-slate-300">•</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{order.reservationTime || "19:00"}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onOpenBoardingPass(order)}
                  className="px-3.5 py-2 rounded-full bg-[#14281D] hover:bg-[#14281D]/90 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-300" />
                  <span>Boarding Pass QR</span>
                </button>

                {/* Call Waiter Dynamic Button with Real-Time Response Sync */}
                {tableId && (
                  <>
                    {currentWaiterStatus === "in_progress" ? (
                      <div className="px-3.5 py-2 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm animate-pulse ring-2 ring-teal-200">
                        <Footprints className="w-3.5 h-3.5 animate-bounce" />
                        <span>Sedang Dihampiri</span>
                      </div>
                    ) : currentWaiterStatus === "pending" || callingWaiterOrderId === order.id ? (
                      <div className="px-3.5 py-2 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menunggu Respon...</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          onCallWaiter(
                            tableId,
                            order.orderNumber,
                            order.id,
                            order.table?.tableNumber
                          )
                        }
                        disabled={isCallingWaiter}
                        className="px-3.5 py-2 rounded-full bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-60"
                      >
                        <BellRing className="w-3.5 h-3.5 text-[#EA580C]" />
                        <span>Panggil Pelayan</span>
                      </button>
                    )}
                  </>
                )}

                <button
                  type="button"
                  onClick={() => onOpenReceipt(order)}
                  className="px-3.5 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-[#18181B] font-semibold text-xs transition-all cursor-pointer"
                >
                  Lihat Struk
                </button>
              </div>
            </div>

            {/* Countdown Estimasi Waktu Masak Dinamis */}
            <CookingCountdownTracker order={order} />

            {/* Ordered Dishes Summary */}
            {order.items && order.items.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono mb-2">
                  Hidangan Jamuan yang Dipesan:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {order.items.map((it: any) => (
                    <div
                      key={it.id}
                      className="p-2.5 rounded-xl bg-[#FDFBF7] border border-slate-200/70 flex items-center justify-between"
                    >
                      <div className="truncate mr-2">
                        <span className="font-bold text-[#EA580C] mr-1.5 font-mono">
                          {it.quantity}x
                        </span>
                        <span className="font-semibold text-[#18181B]">
                          {it.menu?.name || "Hidangan"}
                        </span>
                      </div>
                      <span className="font-mono text-slate-700 shrink-0">
                        {formatIDR(it.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

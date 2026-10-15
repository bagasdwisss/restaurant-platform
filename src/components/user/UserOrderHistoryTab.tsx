"use client";

import React from "react";
import { Receipt, ChevronRight } from "lucide-react";
import { formatIDR, formatDate } from "@/lib/utils";

interface UserOrderHistoryTabProps {
  orders: any[];
  onOpenReceipt: (order: any) => void;
}

export function UserOrderHistoryTab({
  orders,
  onOpenReceipt,
}: UserOrderHistoryTabProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center space-y-2 shadow-sm">
        <Receipt className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="font-serif font-bold text-base text-[#18181B]">
          Belum Ada Riwayat Jamuan Selesai
        </h3>
        <p className="text-xs text-[#64748B]">
          Seluruh transaksi yang telah lunas dan jamuan yang telah selesai akan tercatat permanen di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          onClick={() => onOpenReceipt(order)}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-900/30 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-[#18181B] text-sm">
                #{order.orderNumber}
              </span>
              <span className="text-slate-300">•</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                {order.table?.tableNumber ? `Meja ${order.table.tableNumber}` : "VIP Lounge"}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-500">
                {formatDate(order.reservationDate || order.createdAt)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {order.items?.length || 0} Hidangan dipesan • Selesai dinikmati
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 block font-mono">Total Pembayaran</span>
              <span className="font-serif font-bold text-sm text-emerald-700">
                {formatIDR(order.totalAmount)}
              </span>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 hover:bg-[#EA580C] hover:text-white transition-colors flex items-center gap-1">
              <span>Buka Struk</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import React from "react";
import { formatIDR } from "@/lib/utils";
import { CookingCountdownTracker } from "@/components/customer/CookingCountdownTracker";

interface TableActiveOrderCardProps {
  order: any;
}

export function TableActiveOrderCard({ order }: TableActiveOrderCardProps) {
  if (!order) return null;

  return (
    <div className="space-y-4">
      {/* Dynamic Cooking Countdown & Kitchen Progress */}
      <CookingCountdownTracker order={order} />

      {/* Active Order Details Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#18181B] font-mono">
              Pesanan Aktif ({order.orderNumber})
            </h2>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EA580C]/10 text-[#EA580C] uppercase font-mono">
            {order.status}
          </span>
        </div>

        <div className="text-[11px] text-[#64748B] bg-[#FDFBF7] p-3 rounded-2xl border border-slate-200/80 flex justify-between items-center">
          <span>
            {order.items?.length || 0} Menu • <strong className="text-[#18181B] font-mono">{formatIDR(order.totalAmount)}</strong>
          </span>
          <span className="text-[#EA580C] font-semibold">Pesan hidangan tambahan 👇</span>
        </div>
      </div>
    </div>
  );
}

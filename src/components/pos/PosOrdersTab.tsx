"use client";

import React from "react";
import {
  UtensilsCrossed,
  Printer,
  Ban,
  Clock,
  CheckCircle2,
  RefreshCw,
  ChefHat,
  CreditCard,
} from "lucide-react";
import { formatIDR, formatDate } from "@/lib/utils";

interface PosOrdersTabProps {
  activeOrders: any[];
  onRefresh: () => void;
  onUpdateOrderStatus: (orderId: number, status: string) => void;
  onTriggerPrint: (type: "customer" | "kitchen", order: any) => void;
  onOpenVoidModal: (orderId: number, itemId?: number) => void;
  onOpenPayModalForOrder: (order: any) => void;
}

export function PosOrdersTab({
  activeOrders,
  onRefresh,
  onUpdateOrderStatus,
  onTriggerPrint,
  onOpenVoidModal,
  onOpenPayModalForOrder,
}: PosOrdersTabProps) {
  return (
    <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#18181B]">
            Daftar Pesanan Berjalan ({activeOrders.length})
          </h2>
          <p className="text-xs text-[#64748B]">
            Pesanan masuk dari reservasi tamu & kasir tersinkronisasi secara real-time.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="px-4 py-2 bg-white border border-slate-200/80 rounded-full text-xs font-semibold text-[#64748B] hover:text-[#18181B] flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {activeOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-[#64748B] shadow-xs">
          <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 opacity-30 text-[#EA580C]" />
          <p className="font-serif font-bold text-base text-[#18181B]">
            Tidak ada pesanan aktif saat ini.
          </p>
          <p className="text-xs text-[#64748B] mt-1">
            Pesanan baru dari reservasi atau scan QR meja akan otomatis muncul di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Order Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-mono font-bold text-sm text-[#18181B]">
                        {order.orderNumber}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          order.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : order.status === "confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "preparing"
                            ? "bg-purple-100 text-purple-800"
                            : order.status === "served"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                      {order.table?.tableNumber || "Takeaway"} • {order.customerName}
                    </p>
                  </div>

                  {/* Print buttons */}
                  <div className="flex gap-1">
                    <button
                      type="button"
                      title="Cetak Tiket Dapur"
                      onClick={() => onTriggerPrint("kitchen", order)}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-[#64748B] hover:text-[#18181B] cursor-pointer"
                    >
                      <ChefHat className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Cetak Struk Tagihan"
                      onClick={() => onTriggerPrint("customer", order)}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-[#64748B] hover:text-[#18181B] cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Batalkan Pesanan (Void)"
                      onClick={() => onOpenVoidModal(order.id)}
                      className="p-1.5 rounded-full hover:bg-rose-50 text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="py-3 space-y-2 border-b border-slate-100 max-h-44 overflow-y-auto pr-1">
                  {order.items?.map((it: any) => (
                    <div key={it.id} className="flex justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-[#18181B] truncate">
                          {it.quantity}x {it.menu?.name || it.name}
                        </p>
                        {it.notes && (
                          <p className="text-[10px] text-amber-700 italic">
                            Catatan: {it.notes}
                          </p>
                        )}
                      </div>
                      <span className="font-mono text-[#64748B] shrink-0">
                        {formatIDR(it.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer & Price */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#64748B]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-[#EA580C]">
                    {formatIDR(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex gap-1.5 pt-2 border-t border-slate-100">
                {order.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus(order.id, "confirmed")}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all cursor-pointer"
                  >
                    Konfirmasi Order
                  </button>
                )}
                {order.status === "confirmed" && (
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus(order.id, "preparing")}
                    className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-bold transition-all cursor-pointer"
                  >
                    Kirim ke Dapur (Masak)
                  </button>
                )}
                {order.status === "preparing" && (
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus(order.id, "served")}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition-all cursor-pointer"
                  >
                    Tandai Telah Disajikan
                  </button>
                )}
                {order.status === "served" && (
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus(order.id, "completed")}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Selesai & Bebaskan Meja</span>
                  </button>
                )}
                {order.paymentStatus !== "paid" && (
                  <button
                    type="button"
                    onClick={() => onOpenPayModalForOrder(order)}
                    className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Bayar</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

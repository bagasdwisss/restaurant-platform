"use client";

import React from "react";
import { X, Receipt } from "lucide-react";
import { formatIDR } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

interface TableCartDrawerProps {
  isOpen: boolean;
  table: {
    tableNumber: string;
    area: string;
  };
  cart: {
    items: any[];
    customerName: string;
    orderType: string;
    setCustomerName: (name: string) => void;
    setOrderType: (type: any) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    getSubtotal: () => number;
    getTax: () => number;
    getService: () => number;
    getTotal: () => number;
  };
  isSubmitting: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function TableCartDrawer({
  isOpen,
  table,
  cart,
  isSubmitting,
  onClose,
  onCheckout,
}: TableCartDrawerProps) {
  if (!isOpen || !table) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="items-end sm:items-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-[#18181B] text-base">Rincian Pesanan Meja</h3>
            <p className="text-xs text-[#64748B]">
              {table?.tableNumber || "Meja"} • {table?.area || "Indoor"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-[#64748B] hover:text-[#18181B] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items List */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {/* Customer Name & Order Type */}
          <div className="grid grid-cols-2 gap-3 pb-2">
            <div>
              <label className="text-[11px] font-bold text-[#18181B] mb-1 block">
                Nama Pemesan
              </label>
              <input
                type="text"
                placeholder="Contoh: Budi"
                value={cart.customerName}
                onChange={(e) => cart.setCustomerName(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#18181B] mb-1 block">
                Tipe Santap
              </label>
              <select
                value={cart.orderType}
                onChange={(e) => cart.setOrderType(e.target.value as any)}
                className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none bg-white font-medium cursor-pointer"
              >
                <option value="dine_in">Makan di Tempat (Dine-In)</option>
                <option value="takeaway">Bungkus (Takeaway)</option>
              </select>
            </div>
          </div>

          {cart.items.map((item) => (
            <div
              key={item.id}
              className="bg-[#FDFBF7] p-3.5 rounded-2xl border border-slate-200/80 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-[#18181B]">{item.name}</h4>
                  {item.selectedVariants && item.selectedVariants.length > 0 && (
                    <p className="text-[11px] text-[#64748B]">
                      {item.selectedVariants.map((v: any) => `${v.group}: ${v.option}`).join(", ")}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-[11px] text-amber-700 italic">
                      Catatan: &ldquo;{item.notes}&rdquo;
                    </p>
                  )}
                </div>
                <span className="text-xs font-mono font-bold text-[#18181B]">
                  {formatIDR(
                    (item.price +
                      (item.selectedVariants?.reduce((s: number, v: any) => s + v.extraPrice, 0) || 0)) *
                      item.quantity
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => cart.removeItem(item.id)}
                  className="text-[11px] text-rose-500 font-semibold hover:underline cursor-pointer"
                >
                  Hapus
                </button>

                <div className="flex items-center gap-2 bg-white rounded-full p-1 border border-slate-200/80 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => cart.updateQuantity(item.id, -1)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[#64748B] hover:bg-slate-100 font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono font-bold text-[#18181B] w-4 text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => cart.updateQuantity(item.id, 1)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[#64748B] hover:bg-slate-100 font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Price Breakdown */}
          <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-[#64748B]">
              <span>Subtotal</span>
              <span className="font-mono">{formatIDR(cart.getSubtotal())}</span>
            </div>
            <div className="flex justify-between text-[#64748B]">
              <span>Pajak Restoran PB1 (10%)</span>
              <span className="font-mono">{formatIDR(cart.getTax())}</span>
            </div>
            <div className="flex justify-between text-[#64748B]">
              <span>Biaya Layanan (5%)</span>
              <span className="font-mono">{formatIDR(cart.getService())}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-[#18181B] pt-2 border-t border-slate-200">
              <span className="font-serif">Total Tagihan</span>
              <span className="text-[#EA580C] font-mono text-base">{formatIDR(cart.getTotal())}</span>
            </div>
          </div>
        </div>

        {/* Footer Checkout Button */}
        <div className="p-5 border-t border-slate-100 bg-white space-y-2">
          <button
            type="button"
            onClick={onCheckout}
            disabled={isSubmitting}
            className="w-full bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-slate-300 text-white font-bold py-3.5 rounded-full shadow-md shadow-[#EA580C]/25 active:scale-[0.98] transition-transform text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Mengirim Pesanan ke Kasir...</span>
              </>
            ) : (
              <>
                <Receipt className="w-4 h-4" />
                <span>Kirim Pesanan Sekarang ({formatIDR(cart.getTotal())})</span>
              </>
            )}
          </button>
          <p className="text-[11px] text-center text-[#64748B]">
            Pesanan akan langsung diterima kasir & dapur SAVORIA.
          </p>
        </div>
      </div>
    </Modal>
  );
}

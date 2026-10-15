"use client";

import React from "react";
import { X, Printer } from "lucide-react";
import { formatIDR, formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

interface UserReceiptModalProps {
  receipt: any;
  user: any;
  onClose: () => void;
}

export function UserReceiptModal({
  receipt,
  user,
  onClose,
}: UserReceiptModalProps) {
  return (
    <Modal isOpen={Boolean(receipt)} onClose={onClose}>
      <div className="bg-white border border-slate-200 text-[#18181B] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-[#64748B] hover:text-[#18181B] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Receipt Header */}
        <div className="text-center space-y-1.5 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-serif font-black text-2xl mx-auto shadow-md shadow-[#EA580C]/20">
            S
          </div>
          <h3 className="font-serif font-bold text-2xl tracking-tight text-[#18181B]">
            SAVORIA
          </h3>
          <p className="text-xs text-[#64748B] font-mono uppercase tracking-wider">
            Haute Cuisine & Grand Dining • Struk Resmi
          </p>
          <p className="text-[11px] font-mono text-[#EA580C] font-semibold">
            Nomor Booking: #{receipt.orderNumber}
          </p>
        </div>

        {/* Receipt Metadata */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div>
            <span className="text-[10px] text-[#64748B] block font-medium">NAMA TAMU:</span>
            <span className="font-bold text-[#18181B]">
              {receipt.customerName || user?.name}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#64748B] block font-medium">MEJA TERPILIH:</span>
            <span className="font-bold text-[#18181B]">
              {receipt.table?.tableNumber || "VIP Lounge"}{" "}
              {receipt.table?.area && `(${receipt.table.area})`}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#64748B] block font-medium">TANGGAL RESERVASI:</span>
            <span className="font-bold text-[#18181B]">
              {receipt.reservationDate
                ? formatDate(receipt.reservationDate)
                : formatDate(receipt.createdAt)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#64748B] block font-medium">SESI & JUMLAH TAMU:</span>
            <span className="font-bold text-[#18181B]">
              {receipt.reservationTime || "19:00"} •{" "}
              {receipt.guestCount ? `${receipt.guestCount} Pax` : "2 Pax"}
            </span>
          </div>
        </div>

        {/* Itemized Order Dishes */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#18181B] uppercase tracking-wider block font-serif">
            Rincian Hidangan & Minuman:
          </span>
          <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1 text-xs">
            {receipt.items?.map((it: any) => (
              <div key={it.id} className="py-2.5 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-[#18181B]">
                    <span className="text-[#EA580C] font-mono font-bold mr-1.5">
                      {it.quantity}x
                    </span>
                    {it.menu?.name}
                  </div>
                  {it.notes && (
                    <div className="text-[10px] text-slate-400 italic">
                      Catatan: {it.notes}
                    </div>
                  )}
                </div>
                <span className="font-mono font-bold text-[#18181B] shrink-0">
                  {formatIDR(it.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Calculation Breakdown */}
        <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
          <div className="flex justify-between text-[#64748B]">
            <span>Subtotal Pesanan:</span>
            <span className="font-mono">{formatIDR(receipt.subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#64748B]">
            <span>Pajak Restoran (PB1 10%):</span>
            <span className="font-mono">{formatIDR(receipt.taxAmount)}</span>
          </div>
          <div className="flex justify-between text-[#64748B]">
            <span>Biaya Layanan (Service 5%):</span>
            <span className="font-mono">{formatIDR(receipt.serviceCharge)}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-[#18181B]">
            <span className="font-serif">TOTAL DIBAYAR:</span>
            <span className="text-[#EA580C] font-mono text-base">{formatIDR(receipt.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-[#64748B] pt-1">
            <span>Metode Pembayaran:</span>
            <span className="uppercase text-[#18181B] font-bold">
              {receipt.paymentMethod || "QRIS DINAMIS"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full py-3 rounded-full bg-white hover:bg-slate-50 text-[#18181B] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200 shadow-sm"
          >
            <Printer className="w-4 h-4 text-[#EA580C]" />
            <span>Cetak Receipt / PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-[#EA580C]/25"
          >
            Tutup Struk
          </button>
        </div>
      </div>
    </Modal>
  );
}

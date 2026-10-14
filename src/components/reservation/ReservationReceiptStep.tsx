"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Printer, QrCode, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { formatIDR, formatDate } from "@/lib/utils";

interface ReservationReceiptStepProps {
  completedOrder: any;
  receiptQrDataUrl: string;
  onResetReservation: () => void;
}

export function ReservationReceiptStep({
  completedOrder,
  receiptQrDataUrl,
  onResetReservation,
}: ReservationReceiptStepProps) {
  if (!completedOrder) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn pb-16">
      {/* Success Badge Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 text-center shadow-xs space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full inline-block">
          Pembayaran Berhasil Dikonfirmasi
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#18181B]">
          Reservasi Terjadwal Resmi
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
          Terima kasih telah memilih SAVORIA Gourmet Dining. Meja jamuan Anda telah dikunci dan disiapkan oleh tim maître d’ kami.
        </p>
      </div>

      {/* Luxury Digital Ticket / Receipt Card */}
      <div id="receipt-card" className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
        {/* Ticket Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-serif font-black text-xl">
              S
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#18181B]">
                SAVORIA RESTAURANT
              </h3>
              <p className="text-[11px] text-[#64748B]">Digital Dining Pass & Receipt</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#64748B] block font-mono">Kode Booking:</span>
            <span className="font-mono font-bold text-sm sm:text-base text-[#EA580C]">
              {completedOrder.orderNumber}
            </span>
          </div>
        </div>

        {/* QR Code and Check-in pass */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-5">
          {receiptQrDataUrl && (
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs shrink-0">
              <Image
                src={receiptQrDataUrl}
                alt="QR Code Check-in"
                width={140}
                height={140}
                className="w-32 h-32 object-contain"
                unoptimized
              />
            </div>
          )}
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-[10px] font-mono uppercase bg-[#14281D]/10 text-[#14281D] px-2.5 py-0.5 rounded-full font-bold">
              QR Pass Check-in Meja
            </span>
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#18181B]">
              Tunjukkan QR Ini Saat Tiba
            </h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Tamu dapat langsung menuju meja atau memperlihatkan tiket QR ini ke kasir/waiter untuk pembukaan sesi santap.
            </p>
          </div>
        </div>

        {/* Booking Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b border-slate-100 pb-5">
          <div className="p-3 bg-slate-50/70 rounded-2xl">
            <span className="text-[10px] text-[#64748B] block font-medium">Tanggal</span>
            <span className="font-bold text-[#18181B] truncate block">
              {completedOrder.reservationDate || formatDate(completedOrder.createdAt)}
            </span>
          </div>
          <div className="p-3 bg-slate-50/70 rounded-2xl">
            <span className="text-[10px] text-[#64748B] block font-medium">Waktu Sesi</span>
            <span className="font-bold text-[#18181B] truncate block">
              {completedOrder.reservationTime || "Prime Gala"}
            </span>
          </div>
          <div className="p-3 bg-slate-50/70 rounded-2xl">
            <span className="text-[10px] text-[#64748B] block font-medium">Nomor Meja</span>
            <span className="font-bold text-[#EA580C] truncate block">
              {completedOrder.table?.tableNumber || "VIP"}
            </span>
          </div>
          <div className="p-3 bg-slate-50/70 rounded-2xl">
            <span className="text-[10px] text-[#64748B] block font-medium">Jumlah Tamu</span>
            <span className="font-bold text-[#18181B] truncate block">
              {completedOrder.guestCount || 2} Orang
            </span>
          </div>
        </div>

        {/* Dishes items summary */}
        <div className="space-y-2 border-b border-slate-100 pb-5">
          <h4 className="text-xs font-bold text-[#18181B] uppercase tracking-wider font-mono">
            Menu Jamuan Terpilih
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {completedOrder.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <p className="font-medium text-[#18181B] truncate">
                    {item.quantity}x {item.menu?.name || item.name}
                  </p>
                  {item.notes && (
                    <p className="text-[10px] text-[#64748B] italic">Catatan: {item.notes}</p>
                  )}
                </div>
                <span className="font-mono text-[#18181B] shrink-0">
                  {formatIDR(item.subtotal || item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial total */}
        <div className="space-y-1.5 text-xs text-[#64748B]">
          <div className="flex justify-between">
            <span>Subtotal Menu</span>
            <span className="font-mono text-[#18181B]">{formatIDR(completedOrder.subtotal)}</span>
          </div>
          {completedOrder.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Potongan Voucher Promo</span>
              <span className="font-mono">-{formatIDR(completedOrder.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Pajak Restoran PB1 (10%)</span>
            <span className="font-mono text-[#18181B]">{formatIDR(completedOrder.taxAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Biaya Layanan (5%)</span>
            <span className="font-mono text-[#18181B]">{formatIDR(completedOrder.serviceCharge)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-[#18181B]">
            <span className="font-serif">Total Terbayar</span>
            <span className="font-mono text-emerald-600 text-base">
              {formatIDR(completedOrder.totalAmount)}
            </span>
          </div>
          <div className="flex justify-between pt-1 text-[11px]">
            <span>Metode Pembayaran</span>
            <span className="font-mono font-bold uppercase text-[#18181B]">
              {completedOrder.paymentMethod || "QRIS"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-[#18181B] rounded-full text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk / Simpan PDF</span>
          </button>
          <Link
            href="/user"
            className="flex-1 py-3 px-4 bg-[#18181B] hover:bg-black text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm text-center"
          >
            <span>Buka Pesanan Saya</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onResetReservation}
          className="text-xs text-[#EA580C] hover:underline font-bold cursor-pointer"
        >
          Buat Reservasi Baru Lainnya →
        </button>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MapPin,
  Ticket,
} from "lucide-react";
import { TableItem, CartItem } from "./types";
import { PaymentMethodId } from "@/components/ui/PaymentLogos";
import { formatIDR } from "@/lib/utils";
import { ReservationPaymentChannels } from "./ReservationPaymentChannels";
import { ReservationVoucherSelector } from "./ReservationVoucherSelector";

interface ReservationPaymentStepProps {
  cart: CartItem[];
  selectedTable: TableItem | null;
  selectedDate: string;
  selectedTimeSlot: string;
  guestCount: number;
  customerName: string;
  onChangeCustomerName?: (name: string) => void;
  customerPhone: string;
  onChangeCustomerPhone?: (phone: string) => void;
  paymentMethod: PaymentMethodId;
  onChangePaymentMethod: (method: PaymentMethodId) => void;
  paymentCategory: string;
  onChangePaymentCategory: (cat: string) => void;
  isProcessingPayment: boolean;
  onExecutePayment: (voucherCode?: string) => void;
  onPrev: () => void;
}

export function ReservationPaymentStep({
  cart,
  selectedTable,
  selectedDate,
  selectedTimeSlot,
  guestCount,
  customerName,
  onChangeCustomerName,
  customerPhone,
  onChangeCustomerPhone,
  paymentMethod,
  onChangePaymentMethod,
  isProcessingPayment,
  onExecutePayment,
  onPrev,
}: ReservationPaymentStepProps) {
  // Voucher state
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const netSubtotal = Math.max(0, subtotal - voucherDiscount);
  const taxAmount = Math.round(netSubtotal * 0.1); // PB1 10%
  const serviceCharge = Math.round(netSubtotal * 0.05); // Service 5%
  const totalAmount = netSubtotal + taxAmount + serviceCharge;

  const handleApplyVoucher = (voucher: any, discountAmount: number) => {
    setAppliedVoucher(voucher);
    setVoucherDiscount(discountAmount);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherDiscount(0);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16">
      {/* Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#EA580C] bg-[#EA580C]/10 px-2.5 py-0.5 rounded-full inline-block mb-2">
              Langkah 4 dari 5
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
              Konfirmasi & Pembayaran Reservasi
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Pilih opsi saluran pembayaran digital terverifikasi untuk menjamin kepastian slot meja jamuan Anda.
            </p>
          </div>

          <button
            type="button"
            onClick={onPrev}
            className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-[#64748B] hover:text-[#18181B] rounded-full text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Meja</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Streamlined Payment Methods */}
        <div className="lg:col-span-2 space-y-4">
          <ReservationPaymentChannels
            paymentMethod={paymentMethod}
            onChangePaymentMethod={onChangePaymentMethod}
          />
        </div>

        {/* Right Col: Bill Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#18181B] uppercase tracking-wider font-mono">
              Ringkasan Reservasi
            </h3>

            {/* Schedule details */}
            <div className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-2xl space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-[#64748B]">
                <Calendar className="w-3.5 h-3.5 text-[#EA580C]" />
                <span className="text-[#18181B] font-medium">{selectedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-[#64748B]">
                <Clock className="w-3.5 h-3.5 text-[#EA580C]" />
                <span className="text-[#18181B] font-medium truncate">{selectedTimeSlot}</span>
              </div>
              <div className="flex items-center gap-2 text-[#64748B]">
                <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
                <span className="text-[#18181B] font-medium">
                  {selectedTable ? `${selectedTable.tableNumber} (${selectedTable.area})` : "-"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#64748B]">
                <Users className="w-3.5 h-3.5 text-[#EA580C]" />
                <span className="text-[#18181B] font-medium">{guestCount} Tamu Jamuan</span>
              </div>
            </div>

            {/* Cart breakdown */}
            <div className="space-y-2 border-b border-slate-100 pb-3 max-h-48 overflow-y-auto pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-[#18181B] truncate">
                      {item.quantity}x {item.name}
                    </p>
                    {item.selectedVariants?.length > 0 && (
                      <p className="text-[10px] text-[#64748B]">
                        {item.selectedVariants.map((v) => v.option).join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-[#18181B] shrink-0 font-medium">
                    {formatIDR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Voucher Promo Input */}
            <ReservationVoucherSelector
              subtotal={subtotal}
              appliedVoucher={appliedVoucher}
              voucherDiscount={voucherDiscount}
              onApplyVoucher={handleApplyVoucher}
              onRemoveVoucher={handleRemoveVoucher}
            />

            {/* Financial breakdown */}
            <div className="space-y-1.5 text-xs text-[#64748B]">
              <div className="flex justify-between">
                <span>Subtotal Menu</span>
                <span className="font-mono text-[#18181B]">{formatIDR(subtotal)}</span>
              </div>
              {voucherDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <Ticket className="w-3 h-3" /> Diskon Voucher ({appliedVoucher?.code})
                  </span>
                  <span className="font-mono">-{formatIDR(voucherDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Pajak Restoran PB1 (10%)</span>
                <span className="font-mono text-[#18181B]">{formatIDR(taxAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Layanan (5%)</span>
                <span className="font-mono text-[#18181B]">{formatIDR(serviceCharge)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-[#18181B]">
                <span className="font-serif">Total Pembayaran</span>
                <span className="font-mono text-[#EA580C] text-base">{formatIDR(totalAmount)}</span>
              </div>
            </div>

            {/* Customer review & input confirmation */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] space-y-2">
              <div>
                <label className="text-[10px] font-bold text-[#64748B] block mb-1">
                  Nama Tamu Pemesan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nama Lengkap Pemesan"
                  value={customerName}
                  onChange={(e) => onChangeCustomerName?.(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none font-medium text-[#18181B]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#64748B] block mb-1">
                  Nomor Telepon / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="0812xxxxxxxx"
                  value={customerPhone}
                  onChange={(e) => onChangeCustomerPhone?.(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none font-medium text-[#18181B]"
                />
              </div>
            </div>

            {/* Execute Payment Button */}
            <button
              type="button"
              onClick={() => onExecutePayment(appliedVoucher?.code)}
              onMouseDown={(e) => {
                // Prevent input blur from canceling button click
                e.preventDefault();
              }}
              disabled={isProcessingPayment}
              className="w-full py-4 px-4 bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-slate-300 text-white rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#EA580C]/25 transition-all cursor-pointer active:scale-[0.98]"
            >
              {isProcessingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses Transaksi...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Bayar Sekarang ({formatIDR(totalAmount)})</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-[#14281D]/5 border border-[#14281D]/15 rounded-3xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#14281D] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#14281D] leading-relaxed">
              Transaksi otomatis mencatat bukti pembayaran sah dan mencetak struk digital dengan QR Check-in langsung ke perangkat Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Floating Payment Dock */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 pointer-events-none">
        <div className="bg-[#18181B]/95 backdrop-blur-md text-white rounded-2xl p-3 shadow-2xl flex items-center justify-between border border-white/10 gap-3 pointer-events-auto">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block font-mono">Total Pembayaran:</span>
            <span className="text-sm font-bold text-[#EA580C] font-mono leading-none">
              {formatIDR(totalAmount)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onExecutePayment(appliedVoucher?.code)}
            onMouseDown={(e) => e.preventDefault()}
            disabled={isProcessingPayment}
            className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-slate-500 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#EA580C]/30 shrink-0 cursor-pointer active:scale-95 transition-all"
          >
            {isProcessingPayment ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-3.5 h-3.5" />
                <span>Bayar Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

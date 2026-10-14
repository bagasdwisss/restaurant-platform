"use client";

import React from "react";
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MapPin,
  Lock,
} from "lucide-react";
import { TableItem, CartItem } from "./types";
import { PAYMENT_CHANNELS, PaymentMethodId } from "@/components/ui/PaymentLogos";
import { formatIDR } from "@/lib/utils";

interface ReservationPaymentStepProps {
  cart: CartItem[];
  selectedTable: TableItem | null;
  selectedDate: string;
  selectedTimeSlot: string;
  guestCount: number;
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethodId;
  onChangePaymentMethod: (method: PaymentMethodId) => void;
  paymentCategory: string;
  onChangePaymentCategory: (cat: string) => void;
  isProcessingPayment: boolean;
  onExecutePayment: () => void;
  onPrev: () => void;
}

export function ReservationPaymentStep({
  cart,
  selectedTable,
  selectedDate,
  selectedTimeSlot,
  guestCount,
  customerName,
  customerPhone,
  paymentMethod,
  onChangePaymentMethod,
  paymentCategory,
  onChangePaymentCategory,
  isProcessingPayment,
  onExecutePayment,
  onPrev,
}: ReservationPaymentStepProps) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = Math.round(subtotal * 0.1); // PB1 10%
  const serviceCharge = Math.round(subtotal * 0.05); // Service 5%
  const totalAmount = subtotal + taxAmount + serviceCharge;

  const categories = [
    { id: "all", label: "Semua Metode" },
    { id: "qris", label: "QRIS Instant" },
    { id: "va", label: "Virtual Account" },
    { id: "ewallet", label: "E-Wallet" },
    { id: "card", label: "Kartu Kredit/Debit" },
    { id: "cashier", label: "Bayar di Kasir" },
  ];

  const filteredChannels = PAYMENT_CHANNELS.filter((ch) => {
    if (paymentCategory === "all") return true;
    return ch.category === paymentCategory;
  });

  const selectedChannel = PAYMENT_CHANNELS.find((ch) => ch.id === paymentMethod);

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
        {/* Left 2 Cols: Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-[#18181B] uppercase tracking-wider font-mono">
                  Pilih Saluran Pembayaran Resmi
                </h3>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Mendukung QRIS, Virtual Account seluruh Bank Utama, E-Wallet, dan Kartu
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-mono font-bold">
                <Lock className="w-3 h-3" />
                <span>256-Bit Encrypted</span>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onChangePaymentCategory(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    paymentCategory === c.id
                      ? "bg-[#EA580C] text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-[#64748B]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Payment Channel Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {filteredChannels.map((channel) => {
                const isSelected = paymentMethod === channel.id;

                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => onChangePaymentMethod(channel.id)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#EA580C]/5 border-[#EA580C] shadow-xs ring-1.5 ring-[#EA580C]"
                        : "bg-white border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-12 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center p-1.5 shrink-0">
                        {channel.logo}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#18181B] truncate">{channel.name}</p>
                        <p className="text-[10px] text-[#64748B] truncate">{channel.description}</p>
                      </div>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-[#EA580C] border-[#EA580C] text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <span className="text-[9px] font-bold">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* QRIS Live Preview Info */}
            {paymentMethod === "qris" && (
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center gap-4 mt-3">
                <div className="w-20 h-20 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center shrink-0">
                  <QrCode className="w-16 h-16 text-[#18181B]" />
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <p className="text-xs font-bold text-[#18181B]">
                    QRIS Standar Bank Indonesia
                  </p>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    Dapat di-scan secara universal menggunakan aplikasi BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, mau pun ShopeePay.
                  </p>
                </div>
              </div>
            )}
          </div>
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

            {/* Financial breakdown */}
            <div className="space-y-1.5 text-xs text-[#64748B]">
              <div className="flex justify-between">
                <span>Subtotal Menu</span>
                <span className="font-mono text-[#18181B]">{formatIDR(subtotal)}</span>
              </div>
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

            {/* Customer review */}
            <div className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-2xl text-[11px] space-y-0.5">
              <p className="text-[#64748B]">Pemesan: <strong className="text-[#18181B]">{customerName}</strong></p>
              <p className="text-[#64748B]">Telepon: <strong className="text-[#18181B]">{customerPhone}</strong></p>
            </div>

            {/* Execute Payment Button */}
            <button
              type="button"
              onClick={onExecutePayment}
              disabled={isProcessingPayment}
              className="w-full py-4 px-4 bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-slate-300 text-white rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#EA580C]/25 transition-all cursor-pointer"
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
    </div>
  );
}

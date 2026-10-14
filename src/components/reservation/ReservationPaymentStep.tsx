"use client";

import React, { useState } from "react";
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
  ChevronDown,
  ChevronUp,
  Building2,
  Wallet,
  Sparkles,
} from "lucide-react";
import { TableItem, CartItem } from "./types";
import {
  PAYMENT_CHANNELS,
  PaymentMethodId,
  QrisLogo,
  BcaLogo,
  MandiriLogo,
  BniLogo,
  BriLogo,
  GopayLogo,
  OvoLogo,
  DanaLogo,
  ShopeePayLogo,
  CardLogo,
  CashLogo,
} from "@/components/ui/PaymentLogos";
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
  isProcessingPayment,
  onExecutePayment,
  onPrev,
}: ReservationPaymentStepProps) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = Math.round(subtotal * 0.1); // PB1 10%
  const serviceCharge = Math.round(subtotal * 0.05); // Service 5%
  const totalAmount = subtotal + taxAmount + serviceCharge;

  // Track accordion expand state: 'va', 'ewallet', or null
  const isVaSelected = ["bca_va", "mandiri_va", "bni_va", "bri_va"].includes(paymentMethod);
  const isEwalletSelected = ["gopay", "ovo", "dana", "shopeepay"].includes(paymentMethod);

  const [expandedSection, setExpandedSection] = useState<"va" | "ewallet" | null>(
    isVaSelected ? "va" : isEwalletSelected ? "ewallet" : null
  );

  const toggleSection = (section: "va" | "ewallet") => {
    setExpandedSection((curr) => (curr === section ? null : section));
  };

  const vaChannels = PAYMENT_CHANNELS.filter((ch) => ch.category === "va");
  const ewalletChannels = PAYMENT_CHANNELS.filter((ch) => ch.category === "ewallet");

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
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-[#18181B] uppercase tracking-wider font-mono">
                  Pilih Saluran Pembayaran
                </h3>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Klik kategori pembayaran untuk memilih opsi yang Anda inginkan.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-mono font-bold">
                <Lock className="w-3 h-3" />
                <span>256-Bit Secure</span>
              </div>
            </div>

            {/* STREAMLINED ACCORDION PAYMENT CHANNELS */}
            <div className="space-y-3">
              {/* OPTION 1: QRIS INSTANT */}
              <div
                onClick={() => {
                  onChangePaymentMethod("qris");
                  setExpandedSection(null);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  paymentMethod === "qris"
                    ? "bg-[#EA580C]/5 border-[#EA580C] shadow-xs ring-1.5 ring-[#EA580C]"
                    : "bg-white border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-16 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      <QrisLogo />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#18181B]">
                          QRIS Dinamis (Semua Bank & E-Wallet)
                        </p>
                        <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                          Rekomendasi
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                        Scan instan via BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, ShopeePay.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      paymentMethod === "qris"
                        ? "bg-[#EA580C] border-[#EA580C] text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {paymentMethod === "qris" && <span className="text-[10px] font-bold">✓</span>}
                  </div>
                </div>

                {/* QRIS preview helper */}
                {paymentMethod === "qris" && (
                  <div className="mt-3.5 pt-3 border-t border-slate-200/60 flex items-center gap-3 bg-white/70 p-3 rounded-xl border border-slate-200/50">
                    <QrCode className="w-10 h-10 text-[#18181B] shrink-0" />
                    <p className="text-[11px] text-[#64748B] leading-relaxed">
                      Kode QRIS otomatis aktif setelah Anda menekan tombol bayar. Berlaku bebas biaya admin.
                    </p>
                  </div>
                )}
              </div>

              {/* OPTION 2: VIRTUAL ACCOUNT / BANK (ACCORDION) */}
              <div
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isVaSelected
                    ? "border-[#EA580C] bg-[#EA580C]/2 ring-1.5 ring-[#EA580C]"
                    : "border-slate-200/80 bg-white hover:border-slate-300"
                }`}
              >
                {/* Header Toggle */}
                <div
                  onClick={() => {
                    toggleSection("va");
                    if (!isVaSelected) onChangePaymentMethod("bca_va");
                  }}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-16 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center gap-1 p-1 shrink-0 overflow-hidden">
                      <Building2 className="w-5 h-5 text-[#0060AF]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#18181B]">
                          Transfer Bank / Virtual Account (VA)
                        </p>
                        {isVaSelected && (
                          <span className="text-[9px] font-mono uppercase bg-[#EA580C]/10 text-[#EA580C] px-1.5 py-0.2 rounded-full font-bold">
                            Terpilih
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <BcaLogo className="scale-75 origin-left" />
                        <MandiriLogo className="scale-75 origin-left" />
                        <BniLogo className="scale-75 origin-left" />
                        <BriLogo className="scale-75 origin-left" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isVaSelected
                          ? "bg-[#EA580C] border-[#EA580C] text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isVaSelected && <span className="text-[10px] font-bold">✓</span>}
                    </div>
                    {expandedSection === "va" ? (
                      <ChevronUp className="w-4 h-4 text-[#64748B]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#64748B]" />
                    )}
                  </div>
                </div>

                {/* Expanded Sub-options */}
                {expandedSection === "va" && (
                  <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fadeIn">
                    {vaChannels.map((channel) => {
                      const isSelected = paymentMethod === channel.id;
                      return (
                        <button
                          key={channel.id}
                          type="button"
                          onClick={() => onChangePaymentMethod(channel.id)}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? "bg-white border-[#EA580C] shadow-xs ring-1 ring-[#EA580C]"
                              : "bg-white border-slate-200/80 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-1">
                            <div className="w-14 h-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                              {channel.logo}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#18181B] truncate">
                                {channel.name.replace(" Virtual Account", " VA")}
                              </p>
                              <p className="text-[10px] text-[#64748B] truncate">
                                Verifikasi 24 Jam
                              </p>
                            </div>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-[#EA580C] border-[#EA580C] text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <span className="text-[8px] font-bold">✓</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* OPTION 3: E-WALLET (ACCORDION) */}
              <div
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isEwalletSelected
                    ? "border-[#EA580C] bg-[#EA580C]/2 ring-1.5 ring-[#EA580C]"
                    : "border-slate-200/80 bg-white hover:border-slate-300"
                }`}
              >
                {/* Header Toggle */}
                <div
                  onClick={() => {
                    toggleSection("ewallet");
                    if (!isEwalletSelected) onChangePaymentMethod("gopay");
                  }}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-16 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      <Wallet className="w-5 h-5 text-[#00AED6]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#18181B]">
                          Dompet Digital (E-Wallet)
                        </p>
                        {isEwalletSelected && (
                          <span className="text-[9px] font-mono uppercase bg-[#EA580C]/10 text-[#EA580C] px-1.5 py-0.2 rounded-full font-bold">
                            Terpilih
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <GopayLogo className="scale-75 origin-left" />
                        <OvoLogo className="scale-75 origin-left" />
                        <DanaLogo className="scale-75 origin-left" />
                        <ShopeePayLogo className="scale-75 origin-left" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isEwalletSelected
                          ? "bg-[#EA580C] border-[#EA580C] text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isEwalletSelected && <span className="text-[10px] font-bold">✓</span>}
                    </div>
                    {expandedSection === "ewallet" ? (
                      <ChevronUp className="w-4 h-4 text-[#64748B]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#64748B]" />
                    )}
                  </div>
                </div>

                {/* Expanded Sub-options */}
                {expandedSection === "ewallet" && (
                  <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fadeIn">
                    {ewalletChannels.map((channel) => {
                      const isSelected = paymentMethod === channel.id;
                      return (
                        <button
                          key={channel.id}
                          type="button"
                          onClick={() => onChangePaymentMethod(channel.id)}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? "bg-white border-[#EA580C] shadow-xs ring-1 ring-[#EA580C]"
                              : "bg-white border-slate-200/80 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-1">
                            <div className="w-14 h-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                              {channel.logo}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#18181B] truncate">
                                {channel.name}
                              </p>
                              <p className="text-[10px] text-[#64748B] truncate">
                                {channel.fee || "Bebas Biaya"}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-[#EA580C] border-[#EA580C] text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <span className="text-[8px] font-bold">✓</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* OPTION 4: KARTU KREDIT / DEBIT */}
              <div
                onClick={() => {
                  onChangePaymentMethod("card");
                  setExpandedSection(null);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  paymentMethod === "card"
                    ? "bg-[#EA580C]/5 border-[#EA580C] shadow-xs ring-1.5 ring-[#EA580C]"
                    : "bg-white border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-16 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      <CardLogo />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#18181B]">
                        Kartu Kredit & Debit Internasional
                      </p>
                      <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                        Mendukung Visa, Mastercard, dan JCB dengan 3D Secure OTP.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      paymentMethod === "card"
                        ? "bg-[#EA580C] border-[#EA580C] text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {paymentMethod === "card" && <span className="text-[10px] font-bold">✓</span>}
                  </div>
                </div>
              </div>

              {/* OPTION 5: BAYAR DI KASIR */}
              <div
                onClick={() => {
                  onChangePaymentMethod("cash");
                  setExpandedSection(null);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  paymentMethod === "cash"
                    ? "bg-[#EA580C]/5 border-[#EA580C] shadow-xs ring-1.5 ring-[#EA580C]"
                    : "bg-white border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-16 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      <CashLogo />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#18181B]">
                        Bayar di Kasir Restoran (Concierge Cash)
                      </p>
                      <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                        Selesaikan pembayaran saat tiba di meja resepsionis Savoria.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      paymentMethod === "cash"
                        ? "bg-[#EA580C] border-[#EA580C] text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {paymentMethod === "cash" && <span className="text-[10px] font-bold">✓</span>}
                  </div>
                </div>
              </div>
            </div>
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
              <p className="text-[#64748B]">
                Pemesan: <strong className="text-[#18181B]">{customerName}</strong>
              </p>
              <p className="text-[#64748B]">
                Telepon: <strong className="text-[#18181B]">{customerPhone}</strong>
              </p>
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

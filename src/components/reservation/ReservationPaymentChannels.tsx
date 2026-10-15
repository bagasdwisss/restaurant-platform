"use client";

import React, { useState } from "react";
import {
  QrCode,
  Lock,
  ChevronDown,
  ChevronUp,
  Building2,
  Wallet,
} from "lucide-react";
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

interface ReservationPaymentChannelsProps {
  paymentMethod: PaymentMethodId;
  onChangePaymentMethod: (method: PaymentMethodId) => void;
}

export function ReservationPaymentChannels({
  paymentMethod,
  onChangePaymentMethod,
}: ReservationPaymentChannelsProps) {
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
  );
}

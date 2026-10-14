"use client";

import React from "react";

export type PaymentMethodId =
  | "qris"
  | "bca_va"
  | "mandiri_va"
  | "bni_va"
  | "bri_va"
  | "gopay"
  | "ovo"
  | "dana"
  | "shopeepay"
  | "card"
  | "cash";

export interface PaymentOption {
  id: PaymentMethodId;
  name: string;
  category: "qris" | "va" | "ewallet" | "card" | "cash";
  description: string;
  badge?: string;
  fee?: string;
  logo: React.ReactNode;
}

// Crisp, compact, 100% overflow-safe badges
export function QrisLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center bg-[#E1251B] text-white px-2 py-1 rounded-md font-sans font-black text-[11px] tracking-wider leading-none shadow-xs ${className}`}>
      QRIS
    </div>
  );
}

export function BcaLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center bg-[#0060AF] text-white px-2 py-1 rounded-md font-sans font-black text-[11px] tracking-tight leading-none shadow-xs ${className}`}>
      BCA
    </div>
  );
}

export function MandiriLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center bg-[#003D79] text-[#F5A623] px-2 py-1 rounded-md font-sans font-black text-[10px] tracking-tight leading-none shadow-xs whitespace-nowrap ${className}`}>
      <span className="text-white mr-0.5 font-normal">bank</span>mandiri
    </div>
  );
}

export function BniLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center bg-[#005E6A] text-[#F15A24] px-2 py-1 rounded-md font-sans font-black text-[11px] tracking-tight leading-none shadow-xs whitespace-nowrap ${className}`}>
      <span className="text-white">B</span>NI
    </div>
  );
}

export function BriLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center bg-[#00529C] text-white px-2 py-1 rounded-md font-sans font-black text-[10px] tracking-tight leading-none shadow-xs whitespace-nowrap ${className}`}>
      BRI<span className="text-[#F37024] ml-0.5">va</span>
    </div>
  );
}

export function GopayLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center bg-[#00AED6] text-white px-2 py-1 rounded-md font-sans font-black text-[10px] tracking-tight leading-none shadow-xs whitespace-nowrap ${className}`}>
      gopay
    </div>
  );
}

export function OvoLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center bg-[#4C3494] text-white px-2 py-1 rounded-md font-sans font-black text-[11px] tracking-wider leading-none shadow-xs ${className}`}>
      OVO
    </div>
  );
}

export function DanaLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center bg-[#118EEA] text-white px-2 py-1 rounded-md font-sans font-black text-[11px] tracking-wider leading-none shadow-xs ${className}`}>
      DANA
    </div>
  );
}

export function ShopeePayLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center bg-[#EE4D2D] text-white px-2 py-1 rounded-md font-sans font-black text-[10px] tracking-tight leading-none shadow-xs whitespace-nowrap ${className}`}>
      Shopee<span className="text-amber-200">Pay</span>
    </div>
  );
}

export function CardLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1 bg-[#18181B] text-white px-2 py-1 rounded-md text-[10px] font-bold shadow-xs ${className}`}>
      <span className="text-amber-400 font-black italic">VISA</span>
      <span className="text-rose-400 font-black">MC</span>
    </div>
  );
}

export function CashLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center bg-[#14281D] text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-md font-mono text-[10px] font-bold leading-none ${className}`}>
      KASIR
    </div>
  );
}

export const PAYMENT_CHANNELS: PaymentOption[] = [
  // QRIS
  {
    id: "qris",
    name: "QRIS Dinamis (Semua Bank & E-Wallet)",
    category: "qris",
    description: "Scan instan via BCA Mobile, Livin, GoPay, OVO, Dana, dll.",
    badge: "Paling Populer • Instan",
    fee: "Bebas Biaya",
    logo: <QrisLogo />,
  },

  // Virtual Account
  {
    id: "bca_va",
    name: "BCA Virtual Account",
    category: "va",
    description: "Verifikasi otomatis 24 jam tanpa upload bukti transfer.",
    fee: "Bebas Biaya",
    logo: <BcaLogo />,
  },
  {
    id: "mandiri_va",
    name: "Mandiri Virtual Account",
    category: "va",
    description: "Bayar mudah melalui Livin' by Mandiri atau ATM Mandiri.",
    fee: "Bebas Biaya",
    logo: <MandiriLogo />,
  },
  {
    id: "bni_va",
    name: "BNI Virtual Account",
    category: "va",
    description: "Pembayaran otomatis via BNI Mobile Banking & ATM BNI.",
    fee: "Bebas Biaya",
    logo: <BniLogo />,
  },
  {
    id: "bri_va",
    name: "BRI Virtual Account (BRIVA)",
    category: "va",
    description: "Pembayaran instan langsung dari aplikasi BRImo & ATM BRI.",
    fee: "Bebas Biaya",
    logo: <BriLogo />,
  },

  // E-Wallet
  {
    id: "gopay",
    name: "GoPay / GoPay Later",
    category: "ewallet",
    description: "Konfirmasi sekali klik via aplikasi GoPay atau Gojek.",
    fee: "Bebas Biaya",
    logo: <GopayLogo />,
  },
  {
    id: "ovo",
    name: "OVO Cash",
    category: "ewallet",
    description: "Notifikasi tagihan langsung ke nomor handphone akun OVO Anda.",
    fee: "Bebas Biaya",
    logo: <OvoLogo />,
  },
  {
    id: "dana",
    name: "DANA Dompet Digital",
    category: "ewallet",
    description: "Pembayaran cepat & aman dengan saldo DANA Anda.",
    fee: "Bebas Biaya",
    logo: <DanaLogo />,
  },
  {
    id: "shopeepay",
    name: "ShopeePay",
    category: "ewallet",
    description: "Gunakan saldo ShopeePay dengan cashback koin instan.",
    fee: "Bebas Biaya",
    logo: <ShopeePayLogo />,
  },

  // Kartu Kredit/Debit
  {
    id: "card",
    name: "Kartu Kredit & Debit",
    category: "card",
    description: "Visa, Mastercard, JCB dengan perlindungan enkripsi 256-bit.",
    fee: "Bebas Biaya",
    logo: <CardLogo />,
  },

  // Cash Kasir
  {
    id: "cash",
    name: "Bayar Tunai di Kasir (Concierge Cash)",
    category: "cash",
    description: "Selesaikan pembayaran saat tiba di meja resepsionis Savoria.",
    fee: "Bebas Biaya",
    logo: <CashLogo />,
  },
];

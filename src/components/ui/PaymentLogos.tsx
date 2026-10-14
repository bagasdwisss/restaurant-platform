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

interface PaymentOption {
  id: PaymentMethodId;
  name: string;
  category: "qris" | "va" | "ewallet" | "card" | "cash";
  description: string;
  badge?: string;
  fee?: string;
  logo: React.ReactNode;
}

// Crisp, lightweight, official SVG vector logos for 100% reliable rendering without hotlinking errors
export function QrisLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 font-sans font-black tracking-tight ${className}`}>
      <span className="bg-[#E1251B] text-white px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-wider">
        QRIS
      </span>
      <span className="text-[10px] font-bold text-stone-700 hidden sm:inline">Nasional</span>
    </div>
  );
}

export function BcaLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center font-sans font-black text-[#0060AF] ${className}`}>
      <div className="bg-[#0060AF] text-white px-2 py-0.5 rounded-md text-[11px] font-black tracking-tighter">
        BCA
      </div>
    </div>
  );
}

export function MandiriLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center font-sans ${className}`}>
      <div className="bg-[#003D79] text-[#F5A623] px-2 py-0.5 rounded-md text-[10px] font-black tracking-tight flex items-center gap-1">
        <span className="text-white">bank</span>mandiri
      </div>
    </div>
  );
}

export function BniLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center font-sans ${className}`}>
      <div className="bg-[#005E6A] text-[#F15A24] px-2 py-0.5 rounded-md text-[11px] font-black tracking-tighter flex items-center">
        <span className="text-white">B</span>NI
      </div>
    </div>
  );
}

export function BriLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center font-sans ${className}`}>
      <div className="bg-[#00529C] text-white px-2 py-0.5 rounded-md text-[11px] font-black tracking-tighter">
        BRI<span className="text-[#F37024] ml-0.5">va</span>
      </div>
    </div>
  );
}

export function GopayLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center font-sans ${className}`}>
      <div className="bg-[#00AED6] text-white px-2 py-0.5 rounded-md text-[10px] font-black tracking-tight flex items-center gap-1">
        <span className="w-2.5 h-2.5 rounded-full bg-white inline-block ring-2 ring-[#00AED6]/30" />
        gopay
      </div>
    </div>
  );
}

export function OvoLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center font-sans ${className}`}>
      <div className="bg-[#4C3494] text-white px-2 py-0.5 rounded-md text-[11px] font-black tracking-wider flex items-center">
        OVO
      </div>
    </div>
  );
}

export function DanaLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center font-sans ${className}`}>
      <div className="bg-[#118EEA] text-white px-2 py-0.5 rounded-md text-[11px] font-black tracking-wider">
        DANA
      </div>
    </div>
  );
}

export function ShopeePayLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center font-sans ${className}`}>
      <div className="bg-[#EE4D2D] text-white px-2 py-0.5 rounded-md text-[10px] font-black tracking-tight">
        Shopee<span className="text-amber-200">Pay</span>
      </div>
    </div>
  );
}

export function CardLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="bg-[#1A1F71] text-white px-1.5 py-0.5 rounded text-[10px] font-black italic">
        VISA
      </span>
      <div className="flex -space-x-1.5 items-center">
        <span className="w-3.5 h-3.5 rounded-full bg-[#EB001B] inline-block opacity-90" />
        <span className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] inline-block opacity-90" />
      </div>
    </div>
  );
}

export function CashLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center font-sans ${className}`}>
      <div className="bg-[#14281D] text-emerald-400 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight border border-emerald-500/30">
        💵 Kasir Restoran
      </div>
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
    description: "Verifikasi otomatis 24 jam tanpa perlu upload bukti transfer.",
    badge: "Otomatis",
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
    description: "Gunakan saldo ShopeePay dengan cashback koin (jika tersedia).",
    fee: "Bebas Biaya",
    logo: <ShopeePayLogo />,
  },

  // Kartu Kredit/Debit
  {
    id: "card",
    name: "Kartu Kredit & Debit",
    category: "card",
    description: "Visa, Mastercard, JCB dengan pengamanan enkripsi 3D Secure.",
    badge: "3D Secure",
    fee: "Bebas Biaya",
    logo: <CardLogo />,
  },

  // Tunai / Kasir
  {
    id: "cash",
    name: "Concierge Cash (Bayar Tunai di Kasir)",
    category: "cash",
    description: "Selesaikan pembayaran saat Anda tiba di restoran Savoria.",
    badge: "Bayar di Lokasi",
    logo: <CashLogo />,
  },
];

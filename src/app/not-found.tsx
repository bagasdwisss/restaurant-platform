import React from "react";
import Link from "next/link";
import { UtensilsCrossed, Home, CalendarCheck } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-[#EA580C]/20 selection:text-[#EA580C]">
      {/* Ambient background decoration */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#EA580C]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-white/95 backdrop-blur-md border border-amber-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-amber-900/5 relative z-10 text-center">
        {/* Luxury Number Badge */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-[#EA580C] flex items-center justify-center mx-auto shadow-inner font-serif font-black text-2xl tracking-wider">
          404
        </div>

        {/* Brand Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-[#EA580C] text-[10px] uppercase font-bold tracking-widest font-mono">
            <span>SAVORIA</span>
            <span>•</span>
            <span>Page Not Found</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#18181B] tracking-tight">
            Halaman Tidak Ditemukan
          </h1>

          <p className="text-xs sm:text-sm text-[#64748B] font-light leading-relaxed max-w-sm mx-auto">
            Halaman atau meja yang Anda tuju tidak tersedia atau telah dipindahkan. Silakan kembali ke beranda atau lakukan reservasi meja makan Anda.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Link
            href="/"
            className="w-full py-3 px-4 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#EA580C]/25 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda Utama</span>
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/#menu"
              className="py-2.5 px-3 rounded-full bg-amber-50 hover:bg-amber-100 text-[#EA580C] border border-amber-200/80 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Daftar Menu</span>
            </Link>

            <Link
              href="/reserve"
              className="py-2.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-[#18181B] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Reservasi</span>
            </Link>
          </div>
        </div>

        {/* Footer Subtle Note */}
        <p className="text-[11px] text-[#A1A1AA] font-light">
          Savoria Grand Dining & Haute Cuisine • Fine Culinary Journey
        </p>
      </div>
    </div>
  );
}

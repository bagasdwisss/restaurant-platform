"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, RotateCcw, Copy, Check, ChevronDown } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.error("[Savoria Error Boundary Caught]:", error);
  }, [error]);

  const handleCopyDetails = () => {
    const errorText = `Error: ${error?.message || "Unknown error"}\nDigest: ${error?.digest || "N/A"}\nTimestamp: ${new Date().toISOString()}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(errorText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleFullReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-[#EA580C]/20 selection:text-[#EA580C]">
      {/* Ambient background decoration */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#EA580C]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full bg-white/95 backdrop-blur-md border border-amber-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-amber-900/5 relative z-10 text-center">
        {/* Luxury Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-[#EA580C] flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Brand Header & Error Description */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-[#EA580C] text-[10px] uppercase font-bold tracking-widest font-mono">
            <span>SAVORIA</span>
            <span>•</span>
            <span>Pemberitahuan Sistem</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#18181B] tracking-tight pt-1">
            Terjadi Kendala Memuat Layar
          </h1>

          <p className="text-xs sm:text-sm text-[#64748B] font-light leading-relaxed max-w-md mx-auto">
            Sistem mendeteksi sesi browser atau pembaruan modul yang memerlukan penyegaran. Silakan coba muat ulang komponen atau segarkan halaman.
          </p>
        </div>

        {/* Technical Error Details (Accordion / Collapsible) */}
        {error?.message && (
          <details className="group border border-slate-200 rounded-2xl bg-slate-50/70 p-3.5 text-left transition-all">
            <summary className="flex items-center justify-between cursor-pointer list-none text-xs font-semibold text-slate-700 select-none">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Detail Teknis Sistem</span>
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            
            <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2.5">
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-[11px] text-slate-700 break-words leading-relaxed">
                {error.message}
              </div>

              {error.digest && (
                <div className="text-[10px] font-mono text-slate-400">
                  Digest ID: <span className="text-slate-600">{error.digest}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleCopyDetails}
                className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Detail Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Salin Informasi Error</span>
                  </>
                )}
              </button>
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => reset()}
              className="py-3 px-4 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-[#EA580C]/25 hover:scale-[1.01] active:scale-[0.99]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Coba Lagi</span>
            </button>

            <button
              type="button"
              onClick={handleFullReload}
              className="py-3 px-4 rounded-full bg-amber-50 hover:bg-amber-100 text-[#EA580C] border border-amber-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Segarkan Halaman</span>
            </button>
          </div>

          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-[#18181B] font-semibold text-xs flex items-center justify-center gap-2 transition-all block text-center"
          >
            <Home className="w-4 h-4 text-slate-500 inline" />
            <span>Kembali ke Beranda Savoria</span>
          </Link>
        </div>

        {/* Footer Subtle Note */}
        <p className="text-[11px] text-[#A1A1AA] font-light">
          Savoria Grand Dining & Haute Cuisine • Layanan Bantuan Kasir & Reservasi
        </p>
      </div>
    </div>
  );
}

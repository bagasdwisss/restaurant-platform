"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col items-center justify-center p-6 text-center selection:bg-amber-500 selection:text-black">
      <div className="max-w-md w-full bg-[#11141c] border border-amber-500/20 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-amber-400 font-mono font-bold block">
            L&apos;Étoile Royale • System Notice
          </span>
          <h2 className="font-serif text-2xl font-bold text-white">
            Terjadi Kendala Memuat Layar
          </h2>
          <p className="text-xs text-slate-400 font-light leading-relaxed">
            Sistem mendeteksi pembaruan versi atau sesi browser yang perlu disegarkan. Silakan klik tombol coba lagi di bawah.
          </p>
          {error?.message && (
            <p className="text-[10px] font-mono text-amber-300/80 bg-[#161a24] border border-slate-800 p-2.5 rounded-xl break-words text-left">
              Detail: {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-amber-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Coba Lagi (Reset)</span>
          </button>
          
          <Link
            href="/"
            className="w-full py-3 rounded-xl bg-[#161a24] hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

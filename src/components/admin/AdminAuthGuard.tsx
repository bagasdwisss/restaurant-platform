"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, RefreshCw } from "lucide-react";

export function AdminLoadingScreen() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
      <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200">
        <RefreshCw className="w-5 h-5 animate-spin text-[#EA580C]" />
        <span className="text-sm font-medium text-[#18181B]">Memverifikasi izin eksekutif admin...</span>
      </div>
    </div>
  );
}

export function AdminAccessDenied() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-rose-200 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#18181B]">Akses Terbatas</h2>
        <p className="text-xs text-[#64748B] leading-relaxed">
          Halaman ini khusus General Manager & Eksekutif Savoria. Silakan masuk menggunakan akun kredensial Admin.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/login"
            className="py-3 px-4 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold transition-all shadow-md shadow-[#EA580C]/25"
          >
            Masuk Sebagai Admin
          </Link>
          <Link
            href="/"
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-[#18181B] rounded-full text-xs font-semibold transition-all"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

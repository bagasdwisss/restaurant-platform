"use client";

import React from "react";
import Link from "next/link";
import { Phone, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#14281D] text-white px-3.5 sm:px-6 lg:px-12 py-12 sm:py-16 text-xs border-t border-[#1a3527]">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Col 1: Logo & Mission */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-display font-black text-lg">
              S
            </div>
            <span className="font-display text-2xl font-bold text-white tracking-tight">
              SAVOR<span className="text-[#EA580C]">IA</span>
            </span>
          </div>
          <p className="text-xs text-stone-300 font-light leading-relaxed">
            Modern culinary sanctuary blending artisanal heritage recipes with contemporary gastronomic artistry.
          </p>
          <p className="text-[11px] text-stone-400 font-mono">
            The Grand Pavilion • SCBD Jakarta • Open Daily: 10:00 - 22:00
          </p>
        </div>

        {/* Col 2: Quick Links */}
        <div className="space-y-3">
          <h4 className="font-bold uppercase tracking-wider text-[#F59E0B] text-xs font-mono">
            Quick Navigation
          </h4>
          <div className="flex flex-col space-y-2 text-stone-300">
            <a href="#" className="hover:text-white transition-colors">Home</a>
            <a href="#popular" className="hover:text-white transition-colors">Chef&apos;s Specials</a>
            <a href="#menu" className="hover:text-white transition-colors">Full Menu Catalog</a>
            <a href="#about" className="hover:text-white transition-colors">About Our Story</a>
            <Link href="/reservation" className="hover:text-white transition-colors">Reserve a Table</Link>
          </div>
        </div>

        {/* Col 3: Hours & Contact */}
        <div className="space-y-3">
          <h4 className="font-bold uppercase tracking-wider text-[#F59E0B] text-xs font-mono">
            Opening Hours & Contact
          </h4>
          <div className="space-y-1.5 text-stone-300">
            <p>Senin - Jumat: 10:00 - 22:00</p>
            <p>Sabtu - Minggu: 09:30 - 23:00</p>
            <p className="pt-2 text-white font-semibold flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>+62 21 515 8899</span>
            </p>
            <p className="text-stone-400">reservations@savoria-resto.com</p>
          </div>
        </div>

        {/* Col 4: Unique Key Security Portal */}
        <div className="space-y-3">
          <h4 className="font-bold uppercase tracking-wider text-[#F59E0B] text-xs font-mono">
            Portal Akses (Unique Key)
          </h4>
          <p className="text-[11px] text-stone-300">
            Otorisasi otomatis sesuai wewenang Unique Security Key Anda:
          </p>
          <div className="flex flex-col space-y-2 text-stone-300">
            <Link href="/login" className="hover:text-[#EA580C] transition-colors flex items-center gap-1.5 font-semibold text-white">
              <ShieldCheck className="w-4 h-4 text-[#EA580C]" />
              <span>Login Unique Key</span>
            </Link>
            <Link href="/user" className="hover:text-white transition-colors">
              Portal Pelanggan VIP
            </Link>
            <Link href="/pos" className="hover:text-white transition-colors">
              Terminal POS Kasir
            </Link>
            <Link href="/admin" className="hover:text-white transition-colors">
              Dashboard Admin GM
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-3 text-center sm:text-left">
        <span>© 2026 Savoria Modern Restaurant Ltd • All Rights Reserved</span>
        <div className="flex flex-wrap justify-center sm:justify-end gap-3 sm:gap-4">
          <span className="hover:text-white">Privacy Policy</span>
          <span className="hover:text-white">Terms of Dining</span>
          <span className="hover:text-white">Halal & Dietary Transparency</span>
        </div>
      </div>
    </footer>
  );
}

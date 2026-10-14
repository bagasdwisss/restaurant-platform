"use client";

import React from "react";

export function WhyChooseUsSection() {
  return (
    <section className="py-12 sm:py-20 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-[1280px] mx-auto px-3.5 sm:px-6 lg:px-12 space-y-8 sm:space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C] font-mono">
            WHY CHOOSE US
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#18181B]">
            The Gold Standard of Dining Experience
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Tiga pilar keunggulan yang membuat setiap jamuan Anda di Savoria tak terlupakan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-5 sm:p-8 rounded-2xl bg-[#FDFBF7] border border-[#E2E8F0] hover:border-[#EA580C]/40 hover:shadow-card transition-all space-y-3.5 sm:space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform">
              🥗
            </div>
            <h3 className="font-display text-xl font-bold text-[#18181B]">
              100% Fresh Ingredients
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Bahan organik bersertifikasi dipetik setiap fajar langsung dari petani lokal dan nelayan terpercaya tanpa bahan pengawet.
            </p>
          </div>

          <div className="p-5 sm:p-8 rounded-2xl bg-[#FDFBF7] border border-[#E2E8F0] hover:border-[#EA580C]/40 hover:shadow-card transition-all space-y-3.5 sm:space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform">
              👨‍🍳
            </div>
            <h3 className="font-display text-xl font-bold text-[#18181B]">
              Master Chefs Artistry
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Dipimpin langsung oleh Executive Chef pemenang penghargaan kuliner internasional dengan teknik presisi haute cuisine.
            </p>
          </div>

          <div className="p-5 sm:p-8 rounded-2xl bg-[#FDFBF7] border border-[#E2E8F0] hover:border-[#EA580C]/40 hover:shadow-card transition-all space-y-3.5 sm:space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 className="font-display text-xl font-bold text-[#18181B]">
              Seamless & Fast Service
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Penyajian hidangan hangat tepat waktu dengan keramahan pelayan pribadi yang sigap melayani setiap preferensi diet Anda.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

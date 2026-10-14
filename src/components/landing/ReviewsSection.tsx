"use client";

import React from "react";
import Image from "next/image";

export function ReviewsSection() {
  return (
    <section id="reviews" className="py-14 sm:py-24 lg:py-28 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-[1280px] mx-auto px-3.5 sm:px-6 lg:px-12 space-y-8 sm:space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C] font-mono">
            TESTIMONIALS
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#18181B]">
            Loved by Foodies Around the Globe
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Pengalaman nyata dari ribuan tamu kehormatan yang menikmati jamuan istimewa di Savoria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 sm:p-8 rounded-card bg-[#FDFBF7] border border-[#E2E8F0] space-y-4 shadow-sm">
            <div className="flex text-[#F59E0B] text-sm">★★★★★</div>
            <p className="text-xs sm:text-sm text-[#18181B] italic leading-relaxed">
              &quot;Miyazaki Wagyu Tenderloin A5 nya benar-benar lumer di lidah. Pelayanan sangat cepat, ramah, dan suasana restorannya begitu hangat nan elegan.&quot;
            </p>
            <div className="pt-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden relative border border-[#E2E8F0]">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Customer"
                  fill
                  className="object-cover"
                  sizes="40px"
                  loading="lazy"
                />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#18181B]">Jessica Wijaya</h4>
                <span className="text-[11px] text-[#64748B]">Food Critic & Blogger</span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8 rounded-card bg-[#FDFBF7] border border-[#E2E8F0] space-y-4 shadow-sm">
            <div className="flex text-[#F59E0B] text-sm">★★★★★</div>
            <p className="text-xs sm:text-sm text-[#18181B] italic leading-relaxed">
              &quot;Pemesanan meja lewat website sangat mulus dalam 1 klik. Struk digital dengan QR pass nya memudahkan proses check-in saat kami tiba.&quot;
            </p>
            <div className="pt-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden relative border border-[#E2E8F0]">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                  alt="Customer"
                  fill
                  className="object-cover"
                  sizes="40px"
                  loading="lazy"
                />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#18181B]">Dr. Michael Tan</h4>
                <span className="text-[11px] text-[#64748B]">VIP Patron</span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8 rounded-card bg-[#FDFBF7] border border-[#E2E8F0] space-y-4 shadow-sm">
            <div className="flex text-[#F59E0B] text-sm">★★★★★</div>
            <p className="text-xs sm:text-sm text-[#18181B] italic leading-relaxed">
              &quot;Truffle Pesto Linguine dan Tasmanian Salmon adalah mahakarya terbaik! Bahan organiknya terasa begitu segar. Sangat direkomendasikan.&quot;
            </p>
            <div className="pt-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden relative border border-[#E2E8F0]">
                <Image
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
                  alt="Customer"
                  fill
                  className="object-cover"
                  sizes="40px"
                  loading="lazy"
                />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#18181B]">Amanda Roberts</h4>
                <span className="text-[11px] text-[#64748B]">Culinary Enthusiast</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

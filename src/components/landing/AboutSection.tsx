"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="py-14 sm:py-24 lg:py-28 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-[1280px] mx-auto px-3.5 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Photo Composition & Floating Experience Badge */}
        <div className="lg:col-span-6 relative">
          <div className="relative h-[380px] sm:h-[460px] rounded-3xl overflow-hidden shadow-2xl border border-[#E2E8F0]">
            <Image
              src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1200&q=80"
              alt="Executive Chef preparing gourmet dish"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Overlapping Experience Badge */}
          <div className="absolute -bottom-6 right-2 sm:-bottom-8 sm:right-6 bg-[#14281D] text-white p-3.5 sm:p-5 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-center gap-3 sm:gap-4 max-w-[260px] sm:max-w-xs">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#EA580C] text-white flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0">
              10+
            </div>
            <div className="leading-tight">
              <span className="font-display text-sm sm:text-base font-bold text-white block">
                Years of Culinary Mastery
              </span>
              <span className="text-[10px] sm:text-[11px] text-stone-300 font-light">
                Menyajikan kelezatan berkelas sejak 2015.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Story Copy & Metrics */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C] font-mono">
              ABOUT OUR STORY
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#18181B] leading-tight">
              Crafting Memorable Flavors <br />
              <span className="text-[#EA580C] italic font-normal">Since 2015.</span>
            </h2>
          </div>

          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
            Savoria lahir dari kecintaan mendalam terhadap seni gastronomi otentik. Kami memadukan warisan resep klasik dengan inovasi teknik kuliner modern untuk menghadirkan pengalaman bersantap yang menggugah emosi dan memori indah.
          </p>

          <p className="text-sm text-[#64748B] leading-relaxed">
            Setiap menu diuji coba secara teliti oleh Master Chef kami demi menjamin keharmonisan rasa, aroma, serta estetika tata piring berstandar internasional.
          </p>

          {/* Highlighted Pills */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E2E8F0]">
              <span className="font-display text-2xl font-bold text-[#EA580C] block">35+</span>
              <span className="text-xs font-semibold text-[#18181B]">Signature Recipes</span>
            </div>
            <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E2E8F0]">
              <span className="font-display text-2xl font-bold text-[#EA580C] block">100%</span>
              <span className="text-xs font-semibold text-[#18181B]">Halal & Organic</span>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/reservation"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#18181B] hover:bg-[#EA580C] text-white text-xs font-bold transition-all shadow-md group"
            >
              <span>Learn More About Us</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

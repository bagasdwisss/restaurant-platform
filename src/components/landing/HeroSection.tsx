"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, ArrowRight, Play, Star, Flame } from "lucide-react";

interface HeroSectionProps {
  onOpenStory: () => void;
}

export function HeroSection({ onOpenStory }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-20 lg:pt-16 lg:pb-24 border-b border-[#E2E8F0]">
      <div className="max-w-[1280px] mx-auto px-3.5 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column (55% width): Editorial & Appetizing Copy */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Pill Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EA580C]/10 border border-[#EA580C]/25 text-[#EA580C] text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>#1 Best Culinary Experience in Town</span>
          </div>

          {/* H1 Display Title */}
          <h1 className="font-display text-3xl xs:text-4xl sm:text-6xl lg:text-[64px] font-bold tracking-tight text-[#18181B] leading-[1.12] sm:leading-[1.08]">
            Savor the Art of <br />
            <span className="text-[#EA580C] italic font-normal">Authentic & Fresh</span> <br />
            Gastronomy.
          </h1>

          {/* Sub-headline */}
          <p className="text-sm sm:text-lg text-[#64748B] font-normal leading-relaxed max-w-[52ch]">
            Nikmati keajaiban cita rasa bintang lima yang diracik dari bahan organik segar langsung dari perkebunan terpilih, disajikan hangat dengan sentuhan seni kuliner modern.
          </p>

          {/* Dual CTA Group */}
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-4 pt-2 w-full xs:w-auto">
            <a
              href="#popular"
              className="w-full xs:w-auto justify-center px-8 py-4 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm shadow-cta hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={onOpenStory}
              className="w-full xs:w-auto justify-center px-6 py-4 rounded-full bg-white hover:bg-[#F3EFE6] text-[#18181B] font-bold text-sm border border-[#E2E8F0] shadow-sm transition-all flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-[#EA580C] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
              </div>
              <span>Watch Our Story</span>
            </button>
          </div>

          {/* Trust Metric Bar (Stacked Avatars + Rating) */}
          <div className="pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex -space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full border-2 border-white bg-amber-400 overflow-hidden relative">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                  alt="Diner"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-400 overflow-hidden relative">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                  alt="Diner"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-purple-400 overflow-hidden relative">
                <Image
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"
                  alt="Diner"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-[#14281D] text-white flex items-center justify-center text-xs font-bold">
                +12k
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1 text-[#F59E0B]">
                <Star className="w-4 h-4 fill-[#F59E0B]" />
                <span className="font-bold text-xs text-[#18181B]">4.9</span>
                <span className="text-xs text-[#64748B]">(1,420+ Reviews)</span>
              </div>
              <p className="text-xs text-[#64748B] font-medium">
                Dipercaya oleh lebih dari 15,000+ pelanggan pencinta kuliner.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (45% width): Floating Dish Plate with Floating Cards */}
        <div className="lg:col-span-5 relative flex items-center justify-center my-6 lg:my-0">
          {/* Soft Ambient Glow */}
          <div className="absolute w-[260px] h-[260px] sm:w-[420px] sm:h-[420px] bg-gradient-to-tr from-[#EA580C]/20 via-[#F59E0B]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Main Floating Plate Container */}
          <div className="relative w-[260px] h-[260px] xs:w-[300px] xs:h-[300px] sm:w-[420px] sm:h-[420px] rounded-full p-2.5 sm:p-4 bg-white/60 backdrop-blur-sm border border-[#E2E8F0] shadow-float">
            <div className="w-full h-full rounded-full overflow-hidden relative shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
                alt="Signature Dish Plate"
                fill
                priority
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Floating Card 1 (Top-Left): 20 Mins Delivery */}
            <div className="absolute -top-3 left-0 sm:-top-6 sm:-left-6 bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-2xl p-2.5 sm:p-3.5 shadow-float flex items-center gap-2 sm:gap-3 animate-float max-w-[170px] sm:max-w-none">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#EA580C]/15 text-[#EA580C] flex items-center justify-center font-bold shrink-0">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#EA580C] font-mono block">
                  Freshly Cooked
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#18181B] leading-tight block">
                  20 Mins Speed
                </span>
              </div>
            </div>

            {/* Floating Card 2 (Bottom-Right): Mini Review Card */}
            <div className="absolute -bottom-3 right-0 sm:-bottom-6 sm:-right-6 bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-2xl p-2.5 sm:p-3.5 shadow-float flex items-center gap-2 sm:gap-3 animate-float-delayed max-w-[180px] sm:max-w-[210px]">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden relative shrink-0 border border-white">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  alt="Reviewer"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="leading-tight">
                <div className="flex text-[#F59E0B] text-[9px] sm:text-[10px]">
                  ★★★★★
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-[#18181B] block mt-0.5 truncate">
                  Sarah Jenkins
                </span>
                <p className="text-[9px] sm:text-[10px] text-[#64748B] line-clamp-1 italic">
                  &quot;Best Wagyu steak!&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

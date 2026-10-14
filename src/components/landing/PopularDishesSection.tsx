"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Star, Heart, Plus } from "lucide-react";
import { formatIDR } from "@/lib/utils";
import { PopularDish } from "@/data/landing-menu";
import { DishImage } from "@/components/ui/DishImage";

interface PopularDishesSectionProps {
  dishes: PopularDish[];
  wishlist: number[];
  onToggleWishlist: (id: number) => void;
  onAddToCart: (dishName: string) => void;
}

export function PopularDishesSection({
  dishes,
  wishlist,
  onToggleWishlist,
  onAddToCart,
}: PopularDishesSectionProps) {
  return (
    <section id="popular" className="py-14 sm:py-24 lg:py-28 bg-[#FDFBF7] border-b border-[#E2E8F0]">
      <div className="max-w-[1280px] mx-auto px-3.5 sm:px-6 lg:px-12 space-y-8 sm:space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C] font-mono">
              POPULAR PICKS
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#18181B]">
              Our Signature Popular Dishes
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-xl">
              Kreasi terfavorit pilihan para tamu minggu ini. Dibuat fresh per porsi dengan bahan pilihan dan presentasi artistik.
            </p>
          </div>

          <a
            href="#menu"
            className="self-start md:self-auto px-6 py-3 rounded-full bg-white hover:bg-[#F3EFE6] text-[#18181B] font-bold text-xs border border-[#E2E8F0] shadow-sm transition-all flex items-center gap-2"
          >
            <span>Explore Full Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 4 Interactive Dish Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          {dishes.map((dish) => {
            const isFav = wishlist.includes(dish.id);
            return (
              <div
                key={dish.id}
                className="bg-white rounded-card border border-[#E2E8F0] p-4 sm:p-5 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group relative"
              >
                {/* Top Edge: Circular Plate Overlapping Image */}
                <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-stone-100 mb-4">
                  <DishImage
                    src={dish.image}
                    alt={dish.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />

                  {/* Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[10px] font-bold text-[#EA580C] uppercase tracking-wider shadow-sm">
                    {dish.badge}
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => onToggleWishlist(dish.id)}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors shadow-sm ${
                      isFav
                        ? "bg-[#EA580C] text-white"
                        : "bg-white/90 text-[#64748B] hover:text-[#EA580C]"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? "fill-white" : ""}`} />
                  </button>

                  {/* Prep & Calorie tag */}
                  <div className="absolute bottom-2 left-3 text-[10px] font-semibold text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {dish.calories} • {dish.prepTime}
                  </div>
                </div>

                {/* Dish Details */}
                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Rating Line */}
                    <div className="flex items-center gap-1.5 text-xs text-[#F59E0B]">
                      <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                      <span className="font-bold text-[#18181B]">{dish.rating}</span>
                      <span className="text-[#64748B] text-[11px]">({dish.reviewsCount} reviews)</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-lg font-bold text-[#18181B] group-hover:text-[#EA580C] transition-colors line-clamp-1 mt-1">
                      {dish.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-[#64748B] line-clamp-2 mt-1 leading-relaxed min-h-[36px]">
                      {dish.description}
                    </p>
                  </div>

                  {/* Card Footer: Price & Add Button Aligned */}
                  <div className="pt-4 border-t border-[#E2E8F0] mt-auto flex items-center justify-between gap-2">
                    <div className="leading-tight">
                      <span className="text-[10px] text-[#64748B] font-mono block">Harga Porsi</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-display text-lg font-bold text-[#18181B]">
                          {dish.priceUSD}
                        </span>
                        <span className="text-[10px] text-[#64748B] font-mono">
                          ({formatIDR(dish.priceIDR)})
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onAddToCart(dish.name)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#18181B] group-hover:bg-[#EA580C] hover:bg-[#EA580C] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                      title="Pesan Menu"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
                      <span className="leading-none">Order</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { formatIDR } from "@/lib/utils";
import { CatalogDish, MenuFilterTab } from "@/data/landing-menu";

interface MenuCatalogSectionProps {
  tabs: MenuFilterTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  dishes: CatalogDish[];
  onAddToCart: (dishName: string) => void;
}

const INITIAL_DISPLAY_LIMIT = 6;

export function MenuCatalogSection({
  tabs,
  activeTab,
  onTabChange,
  dishes,
  onAddToCart,
}: MenuCatalogSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Reset expansion state when changing category tab
  useEffect(() => {
    setIsExpanded(false);
  }, [activeTab]);

  const hasMore = dishes.length > INITIAL_DISPLAY_LIMIT;
  const visibleDishes = isExpanded ? dishes : dishes.slice(0, INITIAL_DISPLAY_LIMIT);
  const remainingCount = dishes.length - INITIAL_DISPLAY_LIMIT;

  const handleCollapse = () => {
    setIsExpanded(false);
    const menuEl = document.getElementById("menu");
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="menu" className="py-14 sm:py-24 lg:py-28 bg-[#FDFBF7] border-b border-[#E2E8F0]">
      <div className="max-w-[1280px] mx-auto px-3.5 sm:px-6 lg:px-12 space-y-8 sm:space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C] font-mono">
            OUR MENUS
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#18181B]">
            Explore Our Full Culinary Menu
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Pilih dari beragam kategori hidangan lezat yang disiapkan fresh setiap hari oleh tim dapur kami.
          </p>
        </div>

        {/* Category Filter Pills (Horizontal Scroll - Section 3.4) */}
        <div className="flex items-center sm:justify-center justify-start gap-2 overflow-x-auto pb-3 scrollbar-none px-2 sm:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-sm ${
                activeTab === tab.id
                  ? "bg-[#EA580C] text-white shadow-cta"
                  : "bg-white text-[#64748B] hover:text-[#18181B] border border-[#E2E8F0] hover:bg-[#F3EFE6]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Menu Catalog Grid with Perfectly Aligned Cards and Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {visibleDishes.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-3.5 sm:p-4 flex flex-col xs:flex-row gap-3.5 sm:gap-4 items-stretch hover:shadow-card hover:border-[#EA580C]/30 transition-all group h-full"
            >
              {/* Image Container with high-res object cover */}
              <div className="w-full xs:w-24 sm:w-28 h-36 xs:h-24 sm:h-28 rounded-xl overflow-hidden relative shrink-0 bg-stone-100 self-center border border-[#E2E8F0]/60">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, 112px"
                />
              </div>

              {/* Content Container: flex flex-col justify-between with mt-auto on action row */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#F59E0B]">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-[#F59E0B]" />
                      <span className="font-bold text-[#18181B]">{item.rating}</span>
                    </div>
                    {item.country && (
                      <span className="text-[10px] text-[#64748B] font-medium bg-[#FDFBF7] px-2 py-0.5 rounded-full border border-[#E2E8F0] truncate max-w-[90px]">
                        {item.country}
                      </span>
                    )}
                  </div>

                  <h3
                    className="font-display text-base font-bold text-[#18181B] group-hover:text-[#EA580C] transition-colors line-clamp-1 mt-1"
                    title={item.name}
                  >
                    {item.name}
                  </h3>

                  <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed mt-0.5 min-h-[32px]">
                    {item.description}
                  </p>
                </div>

                {/* Aligned Bottom Action Bar (Sejajar Sempurna) */}
                <div className="pt-2 border-t border-[#F3EFE6] mt-auto flex items-center justify-between gap-2">
                  <div className="leading-tight">
                    <span className="font-display text-sm font-bold text-[#EA580C] block">
                      {item.priceUSD}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-mono">
                      ({formatIDR(item.priceIDR)})
                    </span>
                  </div>

                  <button
                    onClick={() => onAddToCart(item.name)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#18181B] group-hover:bg-[#EA580C] hover:bg-[#EA580C] text-white text-[11px] font-bold transition-all shadow-sm shrink-0 active:scale-95 cursor-pointer"
                    title={`Pesan ${item.name}`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                    <span className="leading-none">Order</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More / Expand & Collapse Button Row */}
        {hasMore && (
          <div className="flex flex-col items-center justify-center pt-4 sm:pt-6 space-y-2">
            {!isExpanded ? (
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-[#F3EFE6] text-[#18181B] hover:text-[#EA580C] border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-xs font-bold cursor-pointer group"
              >
                <span>Tampilkan Seluruh Menu (+{remainingCount} Hidangan Lainnya)</span>
                <ChevronDown className="w-4 h-4 text-[#EA580C] group-hover:translate-y-0.5 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleCollapse}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-stone-100 text-[#64748B] hover:text-[#18181B] border border-[#E2E8F0] shadow-sm transition-all flex items-center justify-center gap-2 text-xs font-bold cursor-pointer group"
              >
                <span>Tampilkan Lebih Ringkas</span>
                <ChevronUp className="w-4 h-4 text-[#64748B] group-hover:-translate-y-0.5 transition-transform" />
              </button>
            )}
            <p className="text-[11px] text-[#64748B] font-mono">
              Menampilkan {visibleDishes.length} dari {dishes.length} hidangan
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

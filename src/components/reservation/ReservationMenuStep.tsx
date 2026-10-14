"use client";

import React from "react";
import { UtensilsCrossed, Plus, Minus, ArrowRight, ArrowLeft, ShoppingBag, Sparkles } from "lucide-react";
import { MenuItem, CartItem } from "./types";
import { DishImage } from "@/components/ui/DishImage";
import { formatIDR } from "@/lib/utils";

interface ReservationMenuStepProps {
  categories: any[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  displayedMenus: MenuItem[];
  cart: CartItem[];
  onAddToCart: (menu: MenuItem) => void;
  onUpdateCartQty: (menuId: number, delta: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function ReservationMenuStep({
  categories,
  selectedCategory,
  onSelectCategory,
  displayedMenus,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onPrev,
  onNext,
}: ReservationMenuStepProps) {
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-24">
      {/* Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#EA580C] bg-[#EA580C]/10 px-2.5 py-0.5 rounded-full inline-block mb-2">
              Langkah 2 dari 5
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
              Kurasi Menu Jamuan Kuliner Anda
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Pilih hidangan pembuka, hidangan utama berkelas dunia, dan pencuci mulut untuk disajikan saat Anda tiba.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={onPrev}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-[#64748B] hover:text-[#18181B] rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={cart.length === 0}
              className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#EA580C]/25 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Lanjut Pilih Meja</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-5">
          <button
            type="button"
            onClick={() => onSelectCategory("all")}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-[#18181B] text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-[#64748B]"
            }`}
          >
            Semua Menu
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(String(cat.id))}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === String(cat.id)
                  ? "bg-[#EA580C] text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-[#64748B]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {displayedMenus.map((menu) => {
          const cartItem = cart.find((i) => i.menuId === menu.id);
          const hasModifiers = menu.modifierGroups && menu.modifierGroups.length > 0;

          return (
            <div
              key={menu.id}
              className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group h-full"
            >
              <div>
                <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden shrink-0">
                  <DishImage
                    src={menu.image}
                    alt={menu.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {hasModifiers && (
                    <span className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                      <span>Customizable</span>
                    </span>
                  )}
                  {!menu.isAvailable && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="text-white text-xs font-bold font-mono uppercase bg-rose-600 px-3 py-1 rounded-full">
                        Habis
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-1.5">
                  <h3 className="font-serif font-bold text-sm text-[#18181B] line-clamp-1 min-h-[20px] group-hover:text-[#EA580C] transition-colors">
                    {menu.name}
                  </h3>
                  <p className="text-[11px] text-[#64748B] line-clamp-2 min-h-[32px] leading-relaxed">
                    {menu.description || "Hidangan istimewa racikan koki eksekutif Savoria."}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                <span className="font-mono font-bold text-sm text-[#18181B]">
                  {formatIDR(menu.price)}
                </span>

                {cartItem && !hasModifiers ? (
                  <div className="flex items-center gap-1.5 bg-slate-100 rounded-full p-1">
                    <button
                      type="button"
                      onClick={() => onUpdateCartQty(menu.id, -1)}
                      className="w-6 h-6 rounded-full bg-white text-[#18181B] hover:bg-slate-200 flex items-center justify-center text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-bold px-1.5 min-w-[18px] text-center">
                      {cartItem.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateCartQty(menu.id, 1)}
                      className="w-6 h-6 rounded-full bg-[#EA580C] text-white hover:bg-[#C2410C] flex items-center justify-center text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onAddToCart(menu)}
                    disabled={!menu.isAvailable}
                    className="px-3.5 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-slate-200 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{hasModifiers ? "Kustom" : "Pilih"}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Cart Dock */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none">
          <div className="max-w-3xl mx-auto bg-[#18181B]/95 backdrop-blur-md text-white rounded-3xl p-3.5 sm:p-4 shadow-2xl flex items-center justify-between pointer-events-auto border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EA580C] text-white flex items-center justify-center relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-white text-[#EA580C] text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-300">Total Sementara ({totalCartCount} Hidangan)</p>
                <p className="font-mono font-bold text-sm sm:text-base text-white">
                  {formatIDR(totalCartAmount)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onNext}
              className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#EA580C]/30 transition-all cursor-pointer"
            >
              <span>Pilih Meja</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

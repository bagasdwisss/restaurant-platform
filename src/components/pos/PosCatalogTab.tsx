"use client";

import React from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  UtensilsCrossed,
  MapPin,
  ShoppingBag,
} from "lucide-react";
import { DishImage } from "@/components/ui/DishImage";
import { formatIDR } from "@/lib/utils";

interface PosCatalogTabProps {
  menus: any[];
  categories: any[];
  tables: any[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  posSearch: string;
  onChangeSearch: (val: string) => void;
  posCart: any[];
  onAddToCart: (menu: any) => void;
  onUpdateCartQty: (menuId: number, delta: number) => void;
  onClearCart: () => void;
  selectedTableId: number | null;
  onSelectTableId: (id: number | null) => void;
  orderType: "dine_in" | "takeaway";
  onChangeOrderType: (type: "dine_in" | "takeaway") => void;
  onCheckout: () => void;
  mobileView: "catalog" | "bill";
  onChangeMobileView: (view: "catalog" | "bill") => void;
}

export function PosCatalogTab({
  menus,
  categories,
  tables,
  selectedCategory,
  onSelectCategory,
  posSearch,
  onChangeSearch,
  posCart,
  onAddToCart,
  onUpdateCartQty,
  onClearCart,
  selectedTableId,
  onSelectTableId,
  orderType,
  onChangeOrderType,
  onCheckout,
  mobileView,
  onChangeMobileView,
}: PosCatalogTabProps) {
  const filteredMenus = menus.filter((m) => {
    const matchesCat =
      selectedCategory === "all" || String(m.categoryId) === selectedCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(posSearch.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(posSearch.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const posSubtotal = posCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const posTax = Math.round(posSubtotal * 0.1);
  const posService = Math.round(posSubtotal * 0.05);
  const posTotal = posSubtotal + posTax + posService;
  const totalCartCount = posCart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
      {/* Mobile Switcher */}
      <div className="lg:hidden bg-white border-b border-slate-200 p-2 flex gap-2">
        <button
          type="button"
          onClick={() => onChangeMobileView("catalog")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            mobileView === "catalog"
              ? "bg-[#EA580C] text-white"
              : "bg-slate-100 text-[#64748B]"
          }`}
        >
          Katalog Menu
        </button>
        <button
          type="button"
          onClick={() => onChangeMobileView("bill")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all relative ${
            mobileView === "bill"
              ? "bg-[#EA580C] text-white"
              : "bg-slate-100 text-[#64748B]"
          }`}
        >
          Tagihan Meja ({totalCartCount})
          {totalCartCount > 0 && (
            <span className="ml-1 text-[10px] bg-white text-[#EA580C] px-1.5 py-0.2 rounded-full font-bold">
              {formatIDR(posTotal)}
            </span>
          )}
        </button>
      </div>

      {/* LEFT: MENU CATALOG */}
      <div
        className={`flex-1 flex flex-col p-3.5 sm:p-5 overflow-y-auto space-y-4 ${
          mobileView === "bill" ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* Search & Category Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Cari menu hidangan, minuman, steak..."
              value={posSearch}
              onChange={(e) => onChangeSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            <button
              type="button"
              onClick={() => onSelectCategory("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[#18181B] text-white shadow-xs"
                  : "bg-white border border-slate-200/80 text-[#64748B] hover:text-[#18181B]"
              }`}
            >
              Semua ({menus.length})
            </button>
            {categories.map((cat: any) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(String(cat.id))}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === String(cat.id)
                    ? "bg-[#EA580C] text-white shadow-xs"
                    : "bg-white border border-slate-200/80 text-[#64748B] hover:text-[#18181B]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredMenus.map((menu: any) => {
            const inCart = posCart.find((i) => i.menuId === menu.id);

            return (
              <button
                key={menu.id}
                type="button"
                onClick={() => onAddToCart(menu)}
                disabled={!menu.isAvailable}
                className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer relative"
              >
                <div>
                  <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                    <DishImage
                      src={menu.image}
                      alt={menu.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {!menu.isAvailable && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="text-white text-[10px] font-mono font-bold uppercase bg-rose-600 px-2 py-0.5 rounded-full">
                          Habis
                        </span>
                      </div>
                    )}
                    {inCart && (
                      <div className="absolute top-2 right-2 bg-[#EA580C] text-white font-mono text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                        {inCart.quantity}
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 sm:p-3 space-y-1">
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-[#18181B] line-clamp-1 group-hover:text-[#EA580C] transition-colors">
                      {menu.name}
                    </h4>
                    <p className="font-mono text-xs font-bold text-[#EA580C]">
                      {formatIDR(menu.price)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: CURRENT BILL SIDEBAR */}
      <div
        className={`w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col justify-between p-4 sm:p-5 shadow-xs ${
          mobileView === "catalog" ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
          {/* Order Header / Destination */}
          <div className="space-y-2 border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#18181B] uppercase tracking-wider font-mono">
                Order Destination
              </span>
              <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => onChangeOrderType("dine_in")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    orderType === "dine_in"
                      ? "bg-white text-[#18181B] shadow-xs font-bold"
                      : "text-[#64748B]"
                  }`}
                >
                  Dine In
                </button>
                <button
                  type="button"
                  onClick={() => onChangeOrderType("takeaway")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    orderType === "takeaway"
                      ? "bg-white text-[#18181B] shadow-xs font-bold"
                      : "text-[#64748B]"
                  }`}
                >
                  Takeaway
                </button>
              </div>
            </div>

            {orderType === "dine_in" && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#EA580C] shrink-0" />
                <select
                  value={selectedTableId || ""}
                  onChange={(e) => onSelectTableId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-medium focus:ring-2 focus:ring-[#EA580C]"
                >
                  <option value="">Pilih Nomor Meja Tamu...</option>
                  {tables.map((tbl: any) => (
                    <option key={tbl.id} value={tbl.id}>
                      {tbl.tableNumber} ({tbl.area} - {tbl.capacity} Pax) - {tbl.status}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {posCart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#64748B]">
                <ShoppingBag className="w-10 h-10 mb-2 opacity-30 text-[#EA580C]" />
                <p className="text-xs font-bold text-[#18181B]">Keranjang Belum Ada Item</p>
                <p className="text-[11px] mt-0.5">Klik menu di katalog untuk menambahkan pesanan.</p>
              </div>
            ) : (
              posCart.map((item: any) => (
                <div
                  key={item.menuId}
                  className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-2xl flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 pr-1 flex-1">
                    <p className="text-xs font-bold text-[#18181B] truncate">{item.name}</p>
                    <p className="text-[11px] font-mono text-[#64748B]">
                      {formatIDR(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUpdateCartQty(item.menuId, -1)}
                      className="w-6 h-6 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-xs cursor-pointer shadow-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-bold w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateCartQty(item.menuId, 1)}
                      className="w-6 h-6 rounded-full bg-[#EA580C] text-white hover:bg-[#C2410C] flex items-center justify-center text-xs cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Financial Footer & Checkout Button */}
        <div className="border-t border-slate-100 pt-3 space-y-3">
          <div className="space-y-1 text-xs text-[#64748B]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono text-[#18181B]">{formatIDR(posSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pajak PB1 (10%)</span>
              <span className="font-mono text-[#18181B]">{formatIDR(posTax)}</span>
            </div>
            <div className="flex justify-between">
              <span>Biaya Layanan (5%)</span>
              <span className="font-mono text-[#18181B]">{formatIDR(posService)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-[#18181B] pt-1.5 border-t border-slate-200">
              <span className="font-serif">Total Tagihan</span>
              <span className="font-mono text-[#EA580C] text-base">{formatIDR(posTotal)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClearCart}
              disabled={posCart.length === 0}
              className="p-3 bg-white border border-slate-200/80 text-[#64748B] hover:text-rose-600 rounded-full disabled:opacity-50 cursor-pointer shadow-xs"
              title="Kosongkan Keranjang"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onCheckout}
              disabled={posCart.length === 0}
              className="flex-1 bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-full text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#EA580C]/25 cursor-pointer"
            >
              <span>Bayar Sekarang (F4)</span>
              <span className="font-extrabold">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
